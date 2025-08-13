import { Prisma, PrismaClient } from "@prisma/client";
import {
  Booking,
  BookingStatus,
  customerDetails,
  paymentDetails,
  PaymentStatus,
} from "../../models/booking.model";
import { SlotAvailability } from "../../models/venue.model";
import { PaymentMethod } from "../../models/payment.model";
import { withRetries } from "../../utils/retryFunction";

const prisma = new PrismaClient();

export class BookingService {
  static async createBookingBeforePayment(booking: Booking) {
    try {
      // Create booking using transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Create the booking
        const newBooking = await tx.booking.create({
          data: {
            userId: booking.userId,
            partnerId: booking.partnerId,
            venueId: booking.venueId,
            activityId: booking.activityId,
            facilityId: booking.facilityId,
            amount: booking.amount,
            duration: booking.duration, // Note: matches schema typo "duaration"
            startTime: booking.startTime,
            endTime: booking.endTime,
            numberOfSlots: booking.numberOfSlots,
            bookedDate: booking.bookedDate,
            confirmedAt: booking.confirmedAt || null,
            cancelledAt: booking.cancelledAt || null,
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentStatus,
            customerDetails:
              booking.customerDetails as unknown as Prisma.InputJsonValue,
            paymentDetails:
              booking.paymentDetails as unknown as Prisma.InputJsonValue,
          },
        });

        // Update all slots with the booking ID
        await tx.slot.updateMany({
          where: {
            id: {
              in: booking.slotIds,
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

      const bookingData: Booking = {
        id: booking.id,
        userId: booking.userId,
        partnerId: booking.partnerId,
        venueId: booking.venueId,
        facilityId: booking.facilityId,
        slotIds: booking.slots.map((slot) => slot.id),
        activityId: booking.activityId,
        amount: Number(booking.amount),
        duration: booking.duration,
        startTime: booking.startTime,
        endTime: booking.endTime,
        numberOfSlots: booking.numberOfSlots,
        bookedDate: booking.bookedDate,
        confirmedAt: booking.confirmedAt,
        cancelledAt: booking.cancelledAt,
        bookingStatus: booking.bookingStatus as BookingStatus,
        paymentStatus: booking.paymentStatus as PaymentStatus,
        customerDetails: booking?.customerDetails as unknown as customerDetails,
        paymentDetails: booking?.paymentDetails as unknown as paymentDetails,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
      return bookingData;
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
  }: {
    success: boolean;
    bookingId: string;
    amount: number;
    orderId: string;
    paymentId: string;
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

            if (success) {
              await tx.booking.update({
                where: { id: bookingId },
                data: {
                  confirmedAt: new Date(),
                  bookingStatus: BookingStatus.Confirmed,
                  paymentStatus: PaymentStatus.Paid,
                  paymentDetails: {
                    paymentAmount: amount,
                    paymentMethod: PaymentMethod.Razorpay,
                    paymentDate: new Date(),
                    isRefunded: false,
                    razorpayOrderId: orderId,
                    razorpayPaymentId: paymentId,
                  },
                },
              });

              await tx.slot.updateMany({
                where: { bookingId },
                data: {
                  availability: SlotAvailability.Booked,
                },
              });

              await tx.transactionHistory.update({
                where: { orderId },
                data: {
                  captured: true,
                  capturedAt: new Date(),
                  razorpayPaymentId: paymentId,
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
                    paymentMethod: PaymentMethod.Razorpay,
                    paymentDate: new Date(),
                    isRefunded: false,
                    razorpayOrderId: orderId,
                  },
                },
              });

              await tx.slot.updateMany({
                where: { bookingId },
                data: {
                  availability: SlotAvailability.Available,
                },
              });

              await tx.transactionHistory.update({
                where: { orderId },
                data: {
                  isRefunded: false,
                  captured: false,
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
                paymentId
              )
            );
          }

          if (!fallbackStatus.slotStatus) {
            fallbackTasks.push(this.handleSlotAfterBooking(bookingId, success));
          }

          if (!fallbackStatus.transactionStatus) {
            fallbackTasks.push(
              this.handleTransactionAfterBooking(orderId, paymentId, success)
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
    orderId: string,
    paymentId: string,
    success: boolean
  ) {
    try {
      if (success) {
        await prisma.transactionHistory.update({
          where: { orderId },
          data: {
            captured: true,
            capturedAt: new Date(),
            razorpayPaymentId: paymentId,
            isRefunded: false,
          },
        });
      } else {
        await prisma.transactionHistory.update({
          where: { orderId },
          data: {
            captured: false,
            isRefunded: false,
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
    paymentId: string
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
              paymentMethod: PaymentMethod.Razorpay,
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
              paymentMethod: PaymentMethod.Razorpay,
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
        where: { partnerId },
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
