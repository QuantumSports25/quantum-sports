import { Router } from 'express';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware';
import { EventController } from '../controllers/event-controller/event.controller';

const router = Router();

router.post('/create-event', EventController.createEvent);
router.get('/get-event/:id', EventController.getEventById);
router.put('/update-event/:id', authMiddleware, isAdmin, EventController.updateEvent);
router.get('/get-events', EventController.getAllEvents);
router.post('/archive-event/:id', authMiddleware, isAdmin, EventController.archiveEvent);
router.get('/get-events-by-category/:category', EventController.getEventsByCategory);

// book event
router.post('/create-event-booking-before-payment/:paymentMethod', EventController.createEventBookingBeforePayment);
router.post('/free-seats/:bookingId', EventController.freeSeats);

export default router; 