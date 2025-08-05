"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const client_1 = require("@prisma/client");
const booking_model_1 = require("../../models/booking.model");
const venue_model_1 = require("../../models/venue.model");
const payment_model_1 = require("../../models/payment.model");
const retryFunction_1 = require("../../utils/retryFunction");
const prisma = new client_1.PrismaClient();
class BookingService {
    static async createBookingBeforePayment(booking) {
        try {
            const result = await prisma.$transaction(async (tx) => {
                const newBooking = await tx.booking.create({
                    data: {
                        userId: booking.userId,
                        partnerId: booking.partnerId,
                        venueId: booking.venueId,
                        activityId: booking.activityId,
                        facilityId: booking.facilityId,
                        amount: booking.amount,
                        duration: booking.duration,
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                        numberOfSlots: booking.numberOfSlots,
                        bookedDate: booking.bookedDate,
                        confirmedAt: booking.confirmedAt || null,
                        cancelledAt: booking.cancelledAt || null,
                        bookingStatus: booking.bookingStatus,
                        paymentStatus: booking.paymentStatus,
                        customerDetails: booking.customerDetails,
                        paymentDetails: booking.paymentDetails,
                    },
                });
                await tx.slot.updateMany({
                    where: {
                        id: {
                            in: booking.slotIds,
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
            const bookingData = {
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
                bookingStatus: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
                customerDetails: booking?.customerDetails,
                paymentDetails: booking?.paymentDetails,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt,
            };
            return bookingData;
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
    static async handleBooking({ success, bookingId, amount, orderId, paymentId, }) {
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
                    if (success) {
                        await tx.booking.update({
                            where: { id: bookingId },
                            data: {
                                confirmedAt: new Date(),
                                bookingStatus: booking_model_1.BookingStatus.Confirmed,
                                paymentStatus: booking_model_1.PaymentStatus.Paid,
                                paymentDetails: {
                                    paymentAmount: amount,
                                    paymentMethod: payment_model_1.PaymentMethod.Razorpay,
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
                                availability: venue_model_1.SlotAvailability.Booked,
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
                    }
                    else {
                        await tx.booking.update({
                            where: { id: bookingId },
                            data: {
                                paymentStatus: booking_model_1.PaymentStatus.Failed,
                                bookingStatus: booking_model_1.BookingStatus.Failed,
                                paymentDetails: {
                                    paymentAmount: amount,
                                    paymentMethod: payment_model_1.PaymentMethod.Razorpay,
                                    paymentDate: new Date(),
                                    isRefunded: false,
                                    razorpayOrderId: orderId,
                                },
                            },
                        });
                        await tx.slot.updateMany({
                            where: { bookingId },
                            data: {
                                availability: venue_model_1.SlotAvailability.Available,
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
            }, 3, 1000);
        }
        catch (error) {
            console.error("Transaction failed after retries:", error);
            const fallbackStatus = {
                bookingStatus: false,
                slotStatus: false,
                transactionStatus: false,
            };
            await (0, retryFunction_1.withRetries)(async () => {
                const fallbackTasks = [];
                if (!fallbackStatus.bookingStatus) {
                    fallbackTasks.push(this.handleBookingUpdate(bookingId, success, amount, orderId, paymentId));
                }
                if (!fallbackStatus.slotStatus) {
                    fallbackTasks.push(this.handleSlotAfterBooking(bookingId, success));
                }
                if (!fallbackStatus.transactionStatus) {
                    fallbackTasks.push(this.handleTransactionAfterBooking(orderId, paymentId, success));
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
    static async handleTransactionAfterBooking(orderId, paymentId, success) {
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
            }
            else {
                await prisma.transactionHistory.update({
                    where: { orderId },
                    data: {
                        captured: false,
                        isRefunded: false,
                    },
                });
            }
        }
        catch (error) {
            console.error("Error handling transaction after booking:", error);
            throw error;
        }
    }
    static async handleBookingUpdate(bookingId, success, amount, orderId, paymentId) {
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
                            paymentMethod: payment_model_1.PaymentMethod.Razorpay,
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
                            paymentMethod: payment_model_1.PaymentMethod.Razorpay,
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
}
exports.BookingService = BookingService;
//# sourceMappingURL=booking.service.js.map