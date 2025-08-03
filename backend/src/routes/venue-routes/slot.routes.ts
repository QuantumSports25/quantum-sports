import { Router } from "express";
import { SlotController } from "../../controllers/venue-controller/slot-controller/slot.contoller";

const router = Router();

//slot routes
router.post('/create-slot', SlotController.createSlot);
router.get('/get-slots-by-facility/:facilityId', SlotController.getSlotsByFacilityId);
router.get('/get-slots-by-date-range-and-facility/:facilityId', SlotController.getSlotsByDateRangeAndFacilityId);
router.put('/update-slot/:id', SlotController.updateSlot);
router.delete('/delete-slot/:id', SlotController.deleteSlot);
router.put('/update-slots/:facilityId', SlotController.updateSlots);
router.post('/create-multiple-slots/:facilityId', SlotController.createSlots);
router.put('/update-slots-with-different-data/:facilityId', SlotController.updateSlotsWithDifferentData);
router.post('/unlock-slots', SlotController.unlockSlots);


// Slot Availability Routes
router.get('/check-slot-availability/:id', SlotController.checkSlotAvailability);
router.post('/check-multiple-slots-availability', SlotController.checkMultipleSlotsAvailability);
router.get('/get-available-slots-by-facility-and-date/:facilityId', SlotController.getAvailableSlotsByFacilityAndDate);

export default router; 