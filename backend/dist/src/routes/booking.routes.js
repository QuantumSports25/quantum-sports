"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_contoller_1 = require("../controllers/booking-controller/booking.contoller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/create-booking-before-payment/:paymentMethod', auth_middleware_1.authMiddleware, booking_contoller_1.BookingController.createVenueBookingBeforePayment);
router.post('/booking-payment/:bookingId', auth_middleware_1.authMiddleware, booking_contoller_1.BookingController.createBookingPayment);
router.post('/verify-payment-and-booking/:id', auth_middleware_1.authMiddleware, booking_contoller_1.BookingController.verifyPaymentAndBooking);
router.get('/get-booking/:id', auth_middleware_1.authMiddleware, booking_contoller_1.BookingController.getBookingById);
router.get('/get-bookings-by-user/:userId', auth_middleware_1.authMiddleware, booking_contoller_1.BookingController.getBookingsByUser);
router.put('/cancel-booking/:id', auth_middleware_1.authMiddleware, booking_contoller_1.BookingController.cancelBooking);
router.get('/get-bookings-by-partner/:partnerId', auth_middleware_1.authMiddleware, booking_contoller_1.BookingController.getBookingsByPartner);
exports.default = router;
//# sourceMappingURL=booking.routes.js.map