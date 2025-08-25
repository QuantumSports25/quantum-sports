"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const booking_service_1 = require("../../services/booking-services/booking.service");
const booking_model_1 = require("../../models/booking.model");
const payment_model_1 = require("../../models/payment.model");
const payment_service_1 = require("../../services/payment-wallet-services/payment.service");
const slot_service_1 = require("../../services/venue-services/slot.service");
const auth_service_1 = require("../../services/auth-services/auth.service");
const convertSlotTime_1 = require("../../utils/convertSlotTime");
const wallet_services_1 = require("../../services/payment-wallet-services/wallet.services");
const venue_service_1 = require("../../services/venue-services/venue.service");
const event_services_1 = require("../../services/event-services/event.services");
class BookingController {
    static async createVenueBookingBeforePayment(req, res) {
        try {
            const bookingData = req.body;
            const data = req.body;
            const paymentMethod = req.params["paymentMethod"];
            if (!bookingData.userId ||
                !data.partnerId ||
                !data.venueId ||
                !data.facilityId ||
                !data.slotIds ||
                !data.activityId ||
                !bookingData.amount ||
                !data.startTime ||
                !data.endTime ||
                !bookingData.bookedDate) {
                return res.status(400).json({ message: "Required fields are missing" });
            }
            if (!Object.values(payment_model_1.PaymentMethod).includes(paymentMethod)) {
                return res.status(400).json({ message: "Invalid payment method" });
            }
            const startTime = data.startTime;
            const endTime = data.endTime;
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
            if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
                return res.status(400).json({
                    message: "Invalid time format. Expected HH:MM or HH:MM:SS format",
                });
            }
            const startMinutes = (0, convertSlotTime_1.timeStringToMinutes)(startTime);
            const endMinutes = (0, convertSlotTime_1.timeStringToMinutes)(endTime);
            const duration = endMinutes - startMinutes;
            if (isNaN(startMinutes) || isNaN(endMinutes) || duration <= 0) {
                return res.status(400).json({
                    message: "Invalid time values or end time must be after start time",
                });
            }
            if (duration % 30 !== 0) {
                return res
                    .status(400)
                    .json({ message: "Duration must be a multiple of 30" });
            }
            const numberOfSlots = duration / 30;
            if (!Array.isArray(data.slotIds) || data.slotIds.length === 0) {
                return res
                    .status(400)
                    .json({ message: "slotIds must be a non-empty array" });
            }
            const [allSlotsAvailable, partner, user] = await Promise.all([
                slot_service_1.SlotService.areAllSlotsAvailable(data.slotIds),
                auth_service_1.AuthService.getUserById(data.partnerId),
                auth_service_1.AuthService.getUserById(data.userId),
            ]);
            if (!allSlotsAvailable) {
                return res.status(400).json({
                    message: "Some slots are not available or do not exist",
                });
            }
            if (!partner || partner.role !== "partner") {
                return res.status(404).json({ message: "Partner not found" });
            }
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const customerDetails = {
                customerId: user.id,
                customerName: user.name,
                customerEmail: user.email ?? "",
                customerPhone: user.phone ?? "",
            };
            const booking = {
                userId: bookingData.userId,
                type: booking_model_1.BookingType.Venue,
                bookingData: {
                    type: booking_model_1.BookingType.Venue,
                    facilityId: data.facilityId,
                    slotIds: data.slotIds,
                    activityId: data.activityId,
                    partnerId: data.partnerId,
                    venueId: data.venueId,
                    duration: duration,
                    numberOfSlots: numberOfSlots,
                    startTime: startTime,
                    endTime: endTime,
                },
                amount: bookingData.amount,
                bookedDate: new Date(bookingData.bookedDate),
                bookingStatus: booking_model_1.BookingStatus.Pending,
                paymentStatus: booking_model_1.PaymentStatus.Initiated,
                customerDetails: customerDetails,
                paymentDetails: {
                    paymentAmount: bookingData.amount,
                    paymentMethod: paymentMethod,
                    paymentDate: new Date(),
                    isRefunded: false,
                },
            };
            const createdBooking = await booking_service_1.BookingService.createVenueBookingBeforePayment(booking);
            return res.status(201).json({
                message: "Booking created successfully",
                data: createdBooking.id,
            });
        }
        catch (error) {
            console.error("Error creating booking:", error);
            return res.status(500).json({
                message: "Failed to create booking",
                error: error.message,
            });
        }
    }
    static async createBookingPayment(req, res) {
        try {
            const { bookingId } = req.params;
            if (!bookingId) {
                return res.status(400).json({ message: "Booking ID is required" });
            }
            const booking = await booking_service_1.BookingService.getBookingById(bookingId);
            if (booking.paymentStatus !== booking_model_1.PaymentStatus.Initiated ||
                booking.bookingStatus !== booking_model_1.BookingStatus.Pending) {
                return res.status(400).json({
                    message: "Payment has already been initiated for this booking",
                });
            }
            if (!booking.paymentDetails || !booking.paymentDetails.paymentMethod) {
                return res.status(400).json({ message: "Payment method is required" });
            }
            let orderData = null;
            switch (booking.paymentDetails.paymentMethod) {
                case payment_model_1.PaymentMethod.Wallet:
                    await wallet_services_1.WalletService.deductCredits(booking.userId, booking.amount);
                    orderData = {
                        id: `order-${Math.random()
                            .toString(36)
                            .slice(2)
                            .padEnd(12, "0")
                            .slice(0, 12)}`,
                        receipt: bookingId,
                    };
                    break;
                case payment_model_1.PaymentMethod.Razorpay:
                    const order = await payment_service_1.PaymentService.createPaymentRazorpay({
                        amount: booking.amount,
                        bookingId: bookingId,
                        customerId: booking.customerDetails.customerId,
                        currency: payment_model_1.Currency.INR,
                    });
                    orderData = {
                        id: order.id,
                        receipt: order.receipt,
                    };
                    break;
            }
            if (!orderData) {
                throw new Error("Failed to create Razorpay order");
            }
            const transaction = await payment_service_1.PaymentService.createTransaction({
                orderId: orderData.id,
                bookingId: bookingId,
                amount: booking.amount,
                currency: payment_model_1.Currency.INR,
                paymentMethod: booking.paymentDetails.paymentMethod,
                userId: booking.userId,
            });
            if (!transaction) {
            }
            return res.status(200).json({ data: orderData });
        }
        catch (error) {
            console.error("Error creating Razorpay order:", error);
            return res.status(500).json({
                message: "Failed to create Razorpay order ",
                error: error.message,
            });
        }
    }
    static async verifyPaymentAndBooking(req, res) {
        try {
            const { id } = req.params;
            let { paymentId } = req.body;
            const { signature, orderId } = req.body;
            if (!id || !orderId) {
                return res
                    .status(400)
                    .json({ message: "Booking ID and Order ID are required" });
            }
            const booking = await booking_service_1.BookingService.getBookingById(id);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }
            const paymentMethod = booking.paymentDetails?.paymentMethod === payment_model_1.PaymentMethod.Razorpay
                ? payment_model_1.PaymentMethod.Razorpay
                : payment_model_1.PaymentMethod.Wallet;
            let verified = false;
            if (paymentMethod == payment_model_1.PaymentMethod.Wallet) {
                const transaction = await payment_service_1.PaymentService.getTransactionByOrderId(orderId);
                if (!transaction) {
                    throw new Error("Payment verification failed");
                }
                paymentId = "pay" + transaction.orderId;
                verified = true;
            }
            else {
                if (!paymentId || !signature || !orderId) {
                    return res
                        .status(400)
                        .json({ message: "Payment details are missing" });
                }
                if (!booking ||
                    booking.paymentStatus !== booking_model_1.PaymentStatus.Initiated ||
                    booking.bookingStatus !== booking_model_1.BookingStatus.Pending) {
                    return res.status(400).json({ message: "Invalid booking state" });
                }
                verified = await payment_service_1.PaymentService.verifyPaymentSignature({
                    paymentId,
                    signature,
                    orderId,
                });
            }
            if (!verified) {
                booking_service_1.BookingService.handleBooking({
                    success: false,
                    bookingId: id,
                    amount: booking.amount,
                    orderId,
                    paymentId,
                    paymentMethod,
                    type: booking.type,
                });
                throw new Error("Payment verification failed");
            }
            booking_service_1.BookingService.handleBooking({
                success: true,
                bookingId: id,
                amount: booking.amount,
                orderId,
                paymentId,
                paymentMethod,
                type: booking.type,
            });
            return res.status(200).json({ message: "Payment verified successfully" });
        }
        catch (error) {
            console.error("Error confirming booking:", error);
            const appError = error;
            return res.status(500).json({
                message: "Failed to confirm booking",
                error: appError.message || "Unknown error",
            });
        }
    }
    static async getBookingById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Booking ID is required" });
            }
            const booking = await booking_service_1.BookingService.getBookingById(id);
            return res.status(200).json({ data: booking });
        }
        catch (error) {
            console.error("Error getting booking:", error);
            return res.status(500).json({
                message: "Failed to get booking",
                error: error.message,
            });
        }
    }
    static async getBookingsByUser(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }
            const bookings = await booking_service_1.BookingService.getBookingsByUserId(userId);
            await Promise.all(bookings.map(async (booking) => {
                let venue = null;
                let event = null;
                if (booking.type === booking_model_1.BookingType.Venue) {
                    venue = await venue_service_1.VenueService.getVenue(booking.bookingData.venueId);
                    booking.venue = venue;
                }
                else if (booking.type === booking_model_1.BookingType.Event) {
                    const eventId = booking.bookingData.eventId;
                    event = await event_services_1.EventService.getEventById(eventId);
                    booking.event = event;
                }
            }));
            return res.status(200).json({
                data: bookings,
                total: bookings.length,
            });
        }
        catch (error) {
            console.error("Error getting user bookings:", error);
            return res.status(500).json({
                message: "Failed to get user bookings",
                error: error.message,
            });
        }
    }
    static async getBookingsByPartner(req, res) {
        try {
            const { partnerId } = req.params;
            if (!partnerId) {
                return res.status(400).json({ message: "Partner ID is required" });
            }
            const bookings = await booking_service_1.BookingService.getBookingsByPartnerId(partnerId);
            return res.status(200).json({
                data: bookings,
                total: bookings.length,
            });
        }
        catch (error) {
            console.error("Error getting partner bookings:", error);
            return res.status(500).json({
                message: "Failed to get partner bookings",
                error: error.message,
            });
        }
    }
    static async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const { cancellationReason } = req.body;
            if (!id) {
                return res.status(400).json({ message: "Booking ID is required" });
            }
            const cancelledBooking = await booking_service_1.BookingService.cancelBooking(id, cancellationReason);
            return res.status(200).json({
                message: "Booking cancelled successfully",
                data: cancelledBooking,
            });
        }
        catch (error) {
            console.error("Error cancelling booking:", error);
            return res.status(500).json({
                message: "Failed to cancel booking",
                error: error.message,
            });
        }
    }
}
exports.BookingController = BookingController;
//# sourceMappingURL=booking.contoller.js.map