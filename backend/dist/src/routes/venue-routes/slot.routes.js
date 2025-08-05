"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slot_contoller_1 = require("../../controllers/venue-controller/slot-controller/slot.contoller");
const router = (0, express_1.Router)();
router.post('/create-slot', slot_contoller_1.SlotController.createSlot);
router.get('/get-slots-by-facility/:facilityId', slot_contoller_1.SlotController.getSlotsByFacilityId);
router.get('/get-slots-by-date-range-and-facility/:facilityId', slot_contoller_1.SlotController.getSlotsByDateRangeAndFacilityId);
router.put('/update-slot/:id', slot_contoller_1.SlotController.updateSlot);
router.delete('/delete-slot/:id', slot_contoller_1.SlotController.deleteSlot);
router.put('/update-slots/:facilityId', slot_contoller_1.SlotController.updateSlots);
router.post('/create-multiple-slots/:facilityId', slot_contoller_1.SlotController.createSlots);
router.put('/update-slots-with-different-data/:facilityId', slot_contoller_1.SlotController.updateSlotsWithDifferentData);
router.post('/unlock-slots', slot_contoller_1.SlotController.unlockSlots);
router.get('/check-slot-availability/:id', slot_contoller_1.SlotController.checkSlotAvailability);
router.post('/check-multiple-slots-availability', slot_contoller_1.SlotController.checkMultipleSlotsAvailability);
router.get('/get-available-slots-by-facility-and-date/:facilityId', slot_contoller_1.SlotController.getAvailableSlotsByFacilityAndDate);
exports.default = router;
//# sourceMappingURL=slot.routes.js.map