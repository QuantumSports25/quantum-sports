"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const event_controller_1 = require("../controllers/event-controller/event.controller");
const router = (0, express_1.Router)();
router.post('/create-event', event_controller_1.EventController.createEvent);
router.get('/get-event/:id', event_controller_1.EventController.getEventById);
router.put('/update-event/:id', auth_middleware_1.authMiddleware, auth_middleware_1.isAdmin, event_controller_1.EventController.updateEvent);
router.get('/get-events', event_controller_1.EventController.getAllEvents);
router.post('/archive-event/:id', auth_middleware_1.authMiddleware, auth_middleware_1.isAdmin, event_controller_1.EventController.archiveEvent);
router.get('/get-events-by-category/:category', event_controller_1.EventController.getEventsByCategory);
router.post('/create-event-booking-before-payment/:paymentMethod', event_controller_1.EventController.createEventBookingBeforePayment);
router.post('/free-seats/:bookingId', event_controller_1.EventController.freeSeats);
exports.default = router;
//# sourceMappingURL=event.routes.js.map