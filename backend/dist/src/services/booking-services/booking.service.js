"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const client_1 = require("@prisma/client");
const booking_model_1 = require("../../models/booking.model");
const venue_model_1 = require("../../models/venue.model");
const retryFunction_1 = require("../../utils/retryFunction");
const event_services_1 = require("../event-services/event.services");
const prisma = new client_1.PrismaClient();
class BookingService {
    static async createVenueBookingBeforePayment(booking) {
        try {
            const result = await prisma.$transaction(async (tx) => {
                const newBooking = await tx.booking.create({
                    data: this.createBooking(booking),
                });
                await tx.slot.updateMany({
                    where: {
                        id: {
                            in: booking.bookingData.slotIds,
                        },
                    },
                    data: {
                        bookingId: newBooking.id,
                        availability: venue_model_1.SlotAvailability.Locked,
                    },
                });
                return newBooking;
            });
            return result;
        }
        catch (error) {
            console.error("Error creating booking:", error);
            throw error;
        }
    }
    static async getBookingById(id) {
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
            let bookingData;
            if (booking.type === booking_model_1.BookingType.Event) {
                const eventBookingData = booking.bookingData;
                bookingData = {
                    type: booking_model_1.BookingType.Event,
                    eventId: eventBookingData?.eventId ?? "",
                    seats: eventBookingData?.seats ?? 1,
                };
            }
            else {
                const venueBookingData = booking.bookingData;
                bookingData = {
                    type: booking_model_1.BookingType.Venue,
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
            const newBooking = {
                id: booking.id,
                userId: booking.userId,
                type: booking.type,
                bookingData: bookingData,
                amount: Number(booking.amount),
                bookedDate: booking.bookedDate,
                confirmedAt: booking.confirmedAt,
                cancelledAt: booking.cancelledAt,
                bookingStatus: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
                customerDetails: booking?.customerDetails,
                paymentDetails: booking?.paymentDetails,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt,
            };
            return newBooking;
        }
        catch (error) {
            console.error("Error getting booking by id:", error);
            throw error;
        }
    }
    static async getBookingsByUserId(userId) {
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
        }
        catch (error) {
            console.error("Error getting bookings by user id:", error);
            throw error;
        }
    }
    static async cancelBooking(id, _cancellationReason) {
        try {
            const result = await prisma.$transaction(async (tx) => {
                const cancelledBooking = await tx.booking.update({
                    where: { id },
                    data: {
                        bookingStatus: "cancelled",
                        cancelledAt: new Date(),
                    },
                });
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
        }
        catch (error) {
            console.error("Error cancelling booking:", error);
            throw error;
        }
    }
    static async handleBooking({ success, bookingId, amount, orderId, paymentId, paymentMethod, type, }) {
        try {
            await (0, retryFunction_1.withRetries)(async () => {
                await prisma.$transaction(async (tx) => {
                    const booking = await tx.booking.findUnique({
                        where: { id: bookingId },
                    });
                    if (!booking ||
                        booking.paymentStatus === booking_model_1.PaymentStatus.Paid ||
                        booking.bookingStatus === booking_model_1.BookingStatus.Confirmed)
                        return;
                    let event = null;
                    let venue = null;
                    if (type === booking_model_1.BookingType.Event) {
                        event = await tx.event.findUnique({
                            where: {
                                id: booking.bookingData.eventId,
                            },
                            select: {
                                title: true,
                            },
                        });
                    }
                    else {
                        venue = await tx.venue.findUnique({
                            where: {
                                id: booking.bookingData.venueId,
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
                                bookingStatus: booking_model_1.BookingStatus.Confirmed,
                                paymentStatus: booking_model_1.PaymentStatus.Paid,
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
                        if (type === booking_model_1.BookingType.Venue) {
                            await tx.slot.updateMany({
                                where: { bookingId },
                                data: {
                                    availability: venue_model_1.SlotAvailability.Booked,
                                },
                            });
                        }
                        else {
                            const { eventId, seats } = booking.bookingData;
                            await tx.$executeRaw `
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
                                name: (booking.type === booking_model_1.BookingType.Event
                                    ? event?.title
                                    : venue?.name) ?? "unknown",
                            },
                        });
                    }
                    else {
                        await tx.booking.update({
                            where: { id: bookingId },
                            data: {
                                paymentStatus: booking_model_1.PaymentStatus.Failed,
                                bookingStatus: booking_model_1.BookingStatus.Failed,
                                paymentDetails: {
                                    paymentAmount: amount,
                                    paymentMethod: paymentMethod,
                                    paymentDate: new Date(),
                                    isRefunded: false,
                                    razorpayOrderId: orderId,
                                },
                            },
                        });
                        if (type === booking_model_1.BookingType.Venue) {
                            await tx.slot.updateMany({
                                where: { bookingId },
                                data: {
                                    availability: venue_model_1.SlotAvailability.Available,
                                },
                            });
                        }
                        else {
                            const { eventId, seats } = booking.bookingData;
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
                                name: (booking.type === booking_model_1.BookingType.Event
                                    ? event?.title
                                    : venue?.name) ?? "unknown",
                            },
                        });
                    }
                });
            }, 3, 1000);
        }
        catch (error) {
            console.error("Transaction failed after retries:", error);
            const fallbackStatus = {
                bookingStatus: false,
                slotStatus: false,
                eventStatus: false,
                transactionStatus: false,
            };
            await (0, retryFunction_1.withRetries)(async () => {
                const fallbackTasks = [];
                if (!fallbackStatus.bookingStatus) {
                    fallbackTasks.push(this.handleBookingUpdate(bookingId, success, amount, orderId, paymentId, paymentMethod));
                }
                if (!fallbackStatus.slotStatus && type === booking_model_1.BookingType.Venue) {
                    fallbackTasks.push(this.handleSlotAfterBooking(bookingId, success));
                }
                else {
                    fallbackTasks.push(event_services_1.EventService.handleEventSeats(bookingId));
                }
                if (!fallbackStatus.transactionStatus) {
                    fallbackTasks.push(this.handleTransactionAfterBooking(bookingId, orderId, paymentId, success, paymentMethod));
                }
                const results = await Promise.allSettled(fallbackTasks);
                console.log("Fallback cleanup results:", results);
                results.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        if (index === 0)
                            fallbackStatus.bookingStatus = true;
                        if (index === 1)
                            fallbackStatus.slotStatus = true;
                        if (index === 2)
                            fallbackStatus.transactionStatus = true;
                        if (index === 3)
                            fallbackStatus.eventStatus = true;
                    }
                    else {
                        console.warn(`Fallback step ${index} failed:`, result.reason);
                    }
                });
            }, 3, 1000).catch((fallbackError) => {
                console.error("Fallback retry failed:", fallbackError);
            });
        }
    }
    static async handleSlotAfterBooking(bookingId, success) {
        try {
            if (success) {
                await prisma.slot.updateMany({
                    where: { bookingId },
                    data: {
                        availability: venue_model_1.SlotAvailability.Booked,
                    },
                });
            }
            else {
                prisma.slot.updateMany({
                    where: { bookingId },
                    data: {
                        availability: venue_model_1.SlotAvailability.Available,
                    },
                });
            }
        }
        catch (error) {
            console.error("Error handling slot after booking:", error);
            throw error;
        }
    }
    static async handleTransactionAfterBooking(bookingId, orderId, paymentId, success, paymentMethod) {
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
            if (booking && booking.type === booking_model_1.BookingType.Event) {
                event = await prisma.event.findUnique({
                    where: {
                        id: booking.bookingData.eventId,
                    },
                    select: {
                        title: true,
                    },
                });
            }
            else if (booking && booking.type === booking_model_1.BookingType.Venue) {
                venue = await prisma.venue.findUnique({
                    where: {
                        id: booking.bookingData.venueId,
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
                        name: (booking && booking.type === booking_model_1.BookingType.Event ? event?.title : venue?.name) ?? "unknown",
                    },
                });
            }
            else {
                await prisma.transactionHistory.update({
                    where: { orderId },
                    data: {
                        captured: false,
                        isRefunded: false,
                        paymentMethod: paymentMethod,
                        name: (booking && booking.type === booking_model_1.BookingType.Event ? event?.title : venue?.name) ?? "unknown",
                    },
                });
            }
        }
        catch (error) {
            console.error("Error handling transaction after booking:", error);
            throw error;
        }
    }
    static async handleBookingUpdate(bookingId, success, amount, orderId, paymentId, paymentMethod) {
        try {
            if (success) {
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        confirmedAt: new Date(),
                        bookingStatus: booking_model_1.BookingStatus.Confirmed,
                        paymentStatus: booking_model_1.PaymentStatus.Paid,
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
            }
            else {
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        paymentStatus: booking_model_1.PaymentStatus.Failed,
                        bookingStatus: booking_model_1.BookingStatus.Failed,
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
        }
        catch (error) {
            console.error("Error handling booking update:", error);
            throw error;
        }
    }
    static async getBookingsByPartnerId(partnerId) {
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
            return bookings ?? [];
        }
        catch (error) {
            console.error("Error getting bookings by partner id:", error);
            throw error;
        }
    }
}
exports.BookingService = BookingService;
BookingService.createBooking = (booking) => {
    return {
        userId: booking.userId,
        type: booking.type,
        bookingData: booking.bookingData,
        amount: booking.amount,
        bookedDate: booking.bookedDate,
        confirmedAt: booking.confirmedAt || null,
        cancelledAt: booking.cancelledAt || null,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        customerDetails: booking.customerDetails,
        paymentDetails: booking.paymentDetails,
    };
};
//# sourceMappingURL=booking.service.js.map