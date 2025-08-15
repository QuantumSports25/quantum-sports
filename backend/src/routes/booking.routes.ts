import { Router } from 'express';
import { BookingController } from '../controllers/booking-controller/booking.contoller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Booking Routes
router.post('/create-booking-before-payment/:paymentMethod', authMiddleware, BookingController.createVenueBookingBeforePayment);
router.post('/booking-payment/:bookingId', authMiddleware, BookingController.createBookingPayment);
router.post('/verify-payment-and-booking/:id', authMiddleware, BookingController.verifyPaymentAndBooking);
router.get('/get-booking/:id', authMiddleware, BookingController.getBookingById);
router.get('/get-bookings-by-user/:userId', authMiddleware, BookingController.getBookingsByUser);
router.put('/cancel-booking/:id', authMiddleware, BookingController.cancelBooking);
router.get('/get-bookings-by-partner/:partnerId', authMiddleware, BookingController.getBookingsByPartner);

export default router; 