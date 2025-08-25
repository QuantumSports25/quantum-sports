import { Prisma } from "@prisma/client";
import prisma from "../../config/db";
import {
  Booking,
  BookingStatus,
  BookingType,
  CustomerDetails,
  EventBooking,
  PaymentDetails,
  PaymentStatus,
  VenueBooking,
} from "../../models/booking.model";
import { SlotAvailability } from "../../models/venue.model";
import { PaymentMethod } from "../../models/payment.model";
import { withRetries } from "../../utils/retryFunction";
import { EventService } from "../event-services/event.services";

// Use shared Prisma client

export class BookingService {
  static createBooking = (booking: Booking) => {
    return {
      userId: booking.userId,
      type: booking.type,
      bookingData: booking.bookingData as unknown as Prisma.InputJsonValue,
      amount: booking.amount,
      bookedDate: booking.bookedDate,
      confirmedAt: booking.confirmedAt || null,
      cancelledAt: booking.cancelledAt || null,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      customerDetails:
        booking.customerDetails as unknown as Prisma.InputJsonValue,
      paymentDetails:
        booking.paymentDetails as unknown as Prisma.InputJsonValue,
    };
  };

  static async createVenueBookingBeforePayment(booking: Booking) {
    try {
      // Create booking using transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        const newBooking = await tx.booking.create({
          data: this.createBooking(booking),
        });

        await tx.slot.updateMany({
          where: {
            id: {
              in: (booking.bookingData as VenueBooking).slotIds,
            },
          },
          data: {
            bookingId: newBooking.id,
            availability: SlotAvailability.Locked,
          },
        });

        return newBooking;
      });

      return result;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  static async getBookingById(id: string): Promise<Booking> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          slots: {
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
              amount: true,
              availability: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error("booking not found");
      }

      let bookingData: EventBooking | VenueBooking;

      if (booking.type === BookingType.Event) {
        const eventBookingData = booking.bookingData as unknown as EventBooking;
        bookingData = {
          type: BookingType.Event,
          eventId: eventBookingData?.eventId ?? "",
          seats: eventBookingData?.seats ?? 1,
        };
      } else {
        const venueBookingData = booking.bookingData as unknown as VenueBooking;
        bookingData = {
          type: BookingType.Venue,
          venueId: venueBookingData?.venueId ?? "",
          partnerId: venueBookingData?.partnerId ?? "",
          facilityId: venueBookingData?.facilityId ?? "",
          slotIds: venueBookingData?.slotIds,
          activityId: venueBookingData?.activityId ?? "",
          duration: venueBookingData?.duration ?? 0,
          startTime: venueBookingData?.startTime ?? "",
          endTime: venueBookingData?.endTime ?? "",
          numberOfSlots: venueBookingData.numberOfSlots ?? 0,
        };
      }

      const newBooking: Booking = {
        id: booking.id,
        userId: booking.userId,
        type: booking.type as BookingType,
        bookingData: bookingData,
        amount: Number(booking.amount),
        bookedDate: booking.bookedDate,
        confirmedAt: booking.confirmedAt,
        cancelledAt: booking.cancelledAt,
        bookingStatus: booking.bookingStatus as BookingStatus,
        paymentStatus: booking.paymentStatus as PaymentStatus,
        customerDetails: booking?.customerDetails as unknown as CustomerDetails,
        paymentDetails: booking?.paymentDetails as unknown as PaymentDetails,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };

      return newBooking;
    } catch (error) {
      console.error("Error getting booking by id:", error);
      throw error;
    }
  }

  static async getBookingsByUserId(userId: string) {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: {
          slots: {
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
              amount: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return bookings;
    } catch (error) {
      console.error("Error getting bookings by user id:", error);
      throw error;
    }
  }

  static async cancelBooking(id: string, _cancellationReason?: string) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Update booking status
        const cancelledBooking = await tx.booking.update({
          where: { id },
          data: {
            bookingStatus: "cancelled",
            cancelledAt: new Date(),
          },
        });

        // Release the slots
        await tx.slot.updateMany({
          where: {
            bookingId: id,
          },
          data: {
            bookingId: null,
            availability: "available",
          },
        });

        return cancelledBooking;
      });

      return result;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw error;
    }
  }

  static async handleBooking({
    success,
    bookingId,
    amount,
    orderId,
    paymentId,
    paymentMethod,
    type,
  }: {
    success: boolean;
    bookingId: string;
    amount: number;
    orderId: string;
    paymentId: string;
    paymentMethod: PaymentMethod;
    type: BookingType;
  }) {
    try {
      // Step 1: Try transactional logic (retry 3 times)
      await withRetries(
        async () => {
          await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
              where: { id: bookingId },
            });
            if (
              !booking ||
              booking.paymentStatus === PaymentStatus.Paid ||
              booking.bookingStatus === BookingStatus.Confirmed
            )
              return;

            let event = null;
            let venue = null;
            if (type === BookingType.Event) {
              event = await tx.event.findUnique({
                where: {
                  id: (booking.bookingData as unknown as EventBooking).eventId,
                },
                select: {
                  title: true,
                },
              });
            } else {
              venue = await tx.venue.findUnique({
                where: {
                  id: (booking.bookingData as unknown as VenueBooking).venueId,
                },
                select: {
                  name: true,
                },
              });
            }

            if (success) {
              await tx.booking.update({
                where: { id: bookingId },
                data: {
                  confirmedAt: new Date(),
                  bookingStatus: BookingStatus.Confirmed,
                  paymentStatus: PaymentStatus.Paid,
                  paymentDetails: {
                    paymentAmount: amount,
                    paymentMethod: paymentMethod,
                    paymentDate: new Date(),
                    isRefunded: false,
                    razorpayOrderId: orderId,
                    razorpayPaymentId: paymentId,
                  },
                },
              });

              if (type === BookingType.Venue) {
                await tx.slot.updateMany({
                  where: { bookingId },
                  data: {
                    availability: SlotAvailability.Booked,
                  },
                });
              } else {
                const { eventId, seats } =
                  booking.bookingData as unknown as EventBooking;
                await tx.$executeRaw`
                  UPDATE "Event"
                  SET "bookedSeats" = "bookedSeats" + ${seats},
                  "registeredUsers" = array_append("registeredUsers", ${booking.userId})
                  WHERE "id" = ${eventId}
                  AND NOT (${booking.userId} = ANY("registeredUsers"));
                  `;
              }

              await tx.transactionHistory.update({
                where: { orderId },
                data: {
                  captured: true,
                  capturedAt: new Date(),
                  razorpayPaymentId: paymentId,
                  name:
                    (booking.type === BookingType.Event
                      ? event?.title
                      : venue?.name) ?? "unknown",
                },
              });
            } else {
              await tx.booking.update({
                where: { id: bookingId },
                data: {
                  paymentStatus: PaymentStatus.Failed,
                  bookingStatus: BookingStatus.Failed,
                  paymentDetails: {
                    paymentAmount: amount,
                    paymentMethod: paymentMethod,
                    paymentDate: new Date(),
                    isRefunded: false,
                    razorpayOrderId: orderId,
                  },
                },
              });

              if (type === BookingType.Venue) {
                await tx.slot.updateMany({
                  where: { bookingId },
                  data: {
                    availability: SlotAvailability.Available,
                  },
                });
              } else {
                const { eventId, seats } =
                  booking.bookingData as unknown as EventBooking;
                await tx.event.updateMany({
                  where: { id: eventId },
                  data: {
                    bookedSeats: {
                      decrement: seats,
                    },
                  },
                });
              }

              await tx.transactionHistory.update({
                where: { orderId },
                data: {
                  isRefunded: false,
                  captured: false,
                  name:
                    (booking.type === BookingType.Event
                      ? event?.title
                      : venue?.name) ?? "unknown",
                },
              });
            }
          });
        },
        3,
        1000
      ); // Retry transactional part 3 times
    } catch (error) {
      console.error("Transaction failed after retries:", error);
      const fallbackStatus = {
        bookingStatus: false,
        slotStatus: false,
        eventStatus: false,
        transactionStatus: false,
      };

      await withRetries(
        async () => {
          const fallbackTasks: Promise<any>[] = [];

          if (!fallbackStatus.bookingStatus) {
            fallbackTasks.push(
              this.handleBookingUpdate(
                bookingId,
                success,
                amount,
                orderId,
                paymentId,
                paymentMethod
              )
            );
          }

          if (!fallbackStatus.slotStatus && type === BookingType.Venue) {
            fallbackTasks.push(this.handleSlotAfterBooking(bookingId, success));
          } else {
            fallbackTasks.push(EventService.handleEventSeats(bookingId));
          }

          if (!fallbackStatus.transactionStatus) {
            fallbackTasks.push(
              this.handleTransactionAfterBooking(
                bookingId,
                orderId,
                paymentId,
                success,
                paymentMethod
              )
            );
          }

          const results = await Promise.allSettled(fallbackTasks);
          console.log("Fallback cleanup results:", results);

          // Update fallbackStatus based on result of each promise
          results.forEach((result, index) => {
            if (result.status === "fulfilled") {
              if (index === 0) fallbackStatus.bookingStatus = true;
              if (index === 1) fallbackStatus.slotStatus = true;
              if (index === 2) fallbackStatus.transactionStatus = true;
              if (index === 3) fallbackStatus.eventStatus = true;
            } else {
              console.warn(`Fallback step ${index} failed:`, result.reason);
            }
          });
        },
        3,
        1000
      ).catch((fallbackError) => {
        console.error("Fallback retry failed:", fallbackError);
        // Optional: Alert/log to external service (Sentry, Slack, etc.)
      });
    }
  }

  static async handleSlotAfterBooking(bookingId: string, success: boolean) {
    try {
      if (success) {
        await prisma.slot.updateMany({
          where: { bookingId },
          data: {
            availability: SlotAvailability.Booked,
          },
        });
      } else {
        prisma.slot.updateMany({
          where: { bookingId },
          data: {
            availability: SlotAvailability.Available,
          },
        });
      }
    } catch (error) {
      console.error("Error handling slot after booking:", error);
      throw error;
    }
  }

  static async handleTransactionAfterBooking(
    bookingId: string,
    orderId: string,
    paymentId: string,
    success: boolean,
    paymentMethod: PaymentMethod
  ) {
    try {
      let event = null;
      let venue = null;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          type: true,
          bookingData: true,
        },
      });

      if (booking && booking.type === BookingType.Event) {
        event = await prisma.event.findUnique({
          where: {
            id: (booking.bookingData as unknown as EventBooking).eventId,
          },
          select: {
            title: true,
          },
        });
      } else if (booking && booking.type === BookingType.Venue) {
        venue = await prisma.venue.findUnique({
          where: {
            id: (booking.bookingData as unknown as VenueBooking).venueId,
          },
          select: {
            name: true,
          },
        });
      }

      if (success) {
        await prisma.transactionHistory.update({
          where: { orderId },
          data: {
            captured: true,
            capturedAt: new Date(),
            razorpayPaymentId: paymentId,
            paymentMethod: paymentMethod,
            isRefunded: false,
            name: (booking && booking.type === BookingType.Event ? event?.title : venue?.name) ?? "unknown",
          },
        });
      } else {
        await prisma.transactionHistory.update({
          where: { orderId },
          data: {
            captured: false,
            isRefunded: false,
            paymentMethod: paymentMethod,
            name: (booking && booking.type === BookingType.Event ? event?.title : venue?.name) ?? "unknown",
          },
        });
      }
    } catch (error) {
      console.error("Error handling transaction after booking:", error);
      throw error;
    }
  }

  static async handleBookingUpdate(
    bookingId: string,
    success: boolean,
    amount: number,
    orderId: string,
    paymentId: string,
    paymentMethod: PaymentMethod
  ) {
    try {
      if (success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            confirmedAt: new Date(),
            bookingStatus: BookingStatus.Confirmed,
            paymentStatus: PaymentStatus.Paid,
            paymentDetails: {
              paymentAmount: amount,
              paymentMethod: paymentMethod,
              paymentDate: new Date(),
              isRefunded: false,
              razorpayOrderId: orderId,
              razorpayPaymentId: paymentId,
            },
          },
        });
      } else {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: PaymentStatus.Failed,
            bookingStatus: BookingStatus.Failed,
            paymentDetails: {
              paymentAmount: amount,
              paymentMethod: paymentMethod,
              paymentDate: new Date(),
              isRefunded: false,
              razorpayOrderId: orderId,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error handling booking update:", error);
      throw error;
    }
  }

  static async getBookingsByPartnerId(partnerId: string) {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          bookingData: {
            path: ["partnerId"],
            equals: partnerId,
          },
        },
        include: {
          slots: {
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
              amount: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Return empty list if no bookings; let controller respond with 200 and total 0
      return bookings ?? [];
    } catch (error) {
      console.error("Error getting bookings by partner id:", error);
      throw error;
    }
  }
}
