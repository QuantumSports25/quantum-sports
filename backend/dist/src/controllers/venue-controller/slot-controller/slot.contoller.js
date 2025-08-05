"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotController = void 0;
const timeValidation_1 = require("../../../utils/timeValidation");
const slot_service_1 = require("../../../services/venue-services/slot.service");
class SlotController {
    static async createSlot(req, res) {
        try {
            const { date, amount, availability, startTime, endTime, facilityId } = req.body;
            if (!date ||
                !amount ||
                !availability ||
                !startTime ||
                !endTime ||
                !facilityId) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const timeValidation = (0, timeValidation_1.validateTimeSlot)(startTime, endTime);
            if (!timeValidation.isValid) {
                return res.status(400).json({ message: timeValidation.error });
            }
            const dateValue = new Date(date + 'T00:00:00.000Z');
            const amountValue = typeof amount === 'string' ? parseFloat(amount) : amount;
            const newSlot = {
                date: dateValue,
                amount: amountValue,
                availability,
                startTime,
                endTime,
                facilityId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const slot = await slot_service_1.SlotService.createSlot(newSlot);
            return res.status(201).json({ data: slot.id });
        }
        catch (error) {
            console.error("Error creating slot:", error);
            const appError = error;
            return res.status(500).json({
                message: "Failed to create slot",
                error: appError.message || "Unknown error",
            });
        }
    }
    static async createSlots(req, res) {
        try {
            const { facilityId } = req.params;
            const { startDate, endDate, startTime, endTime, amount, availability } = req.body;
            if (!facilityId ||
                !startDate ||
                !endDate ||
                !startTime ||
                !endTime ||
                !amount ||
                !availability) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const createdSlots = await slot_service_1.SlotService.createMultipleSlots(new Date(startDate), new Date(endDate), startTime, endTime, facilityId, amount, availability);
            return res.status(201).json({ data: createdSlots.count });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to create slots" });
        }
    }
    static async getSlotsByFacilityId(req, res) {
        try {
            const { facilityId } = req.params;
            if (!facilityId) {
                return res.status(400).json({ message: "Facility ID is required" });
            }
            const slots = await slot_service_1.SlotService.getSlotsByFacilityId(facilityId);
            return res.status(200).json({ data: slots });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to get slots" });
        }
    }
    static async getSlotsByDateRangeAndFacilityId(req, res) {
        try {
            const { facilityId } = req.params;
            if (!facilityId) {
                return res.status(400).json({ message: "Facility ID is required" });
            }
            const { startDate, endDate, sortType = "asc" } = req.query;
            if (!startDate || !endDate || !facilityId) {
                return res.status(400).json({
                    message: "Start date, end date and facility ID are required",
                });
            }
            const slots = await slot_service_1.SlotService.getSlotsByDateRangeAndFacilityId(startDate, endDate, facilityId, sortType);
            return res.status(200).json({ data: slots });
        }
        catch (error) {
            console.error("Controller error getting slots:", error);
            return res.status(500).json({
                message: "Failed to get slots",
                error: error.message || "Unknown error",
                stack: process.env['NODE_ENV'] === 'development' ? error.stack : undefined
            });
        }
    }
    static async updateSlot(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Slot ID is required" });
            }
            console.log('UpdateSlot - Slot ID:', id);
            console.log('UpdateSlot - Request body:', req.body);
            const existingSlot = await slot_service_1.SlotService.getSlotById(id);
            if (!existingSlot) {
                return res.status(404).json({ message: "Slot not found" });
            }
            console.log('UpdateSlot - Existing slot:', existingSlot);
            const startTime = req.body.startTime || existingSlot.startTime;
            const endTime = req.body.endTime || existingSlot.endTime;
            if (req.body.startTime || req.body.endTime) {
                const timeValidation = (0, timeValidation_1.validateTimeSlot)(startTime, endTime);
                if (!timeValidation.isValid) {
                    return res.status(400).json({ message: timeValidation.error });
                }
            }
            const dateValue = req.body.date ? new Date(req.body.date + 'T00:00:00.000Z') : existingSlot.date;
            const amountValue = req.body.amount ?
                (typeof req.body.amount === 'string' ? parseFloat(req.body.amount) : req.body.amount)
                : existingSlot.amount;
            const newSlot = {
                date: dateValue,
                amount: amountValue,
                availability: req.body.availability || existingSlot.availability,
                startTime,
                endTime,
                facilityId: req.body.facilityId || existingSlot.facilityId,
            };
            console.log('UpdateSlot - Formatted slot data:', newSlot);
            const updatedSlot = await slot_service_1.SlotService.updateSlot(id, newSlot);
            return res.status(200).json({ data: updatedSlot.id });
        }
        catch (error) {
            console.error("Error updating slot:", error);
            return res.status(500).json({
                message: "Failed to update slot",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async deleteSlot(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Slot ID is required" });
            }
            const deletedSlot = await slot_service_1.SlotService.deleteSlot(id);
            return res.status(200).json({ data: deletedSlot.id });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to delete slot" });
        }
    }
    static async updateSlots(req, res) {
        try {
            const { facilityId } = req.params;
            if (!facilityId) {
                return res.status(400).json({ message: "Facility ID is required" });
            }
            const { ids, date, amount, availability, startTime, endTime } = req.body;
            if (!date || !amount || !availability || !startTime || !endTime) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const slots = await slot_service_1.SlotService.getSlotsByFacilityId(facilityId);
            const newSlots = slots.map((slot, index) => {
                return {
                    id: ids[index],
                    date: date || slot.date,
                    amount: amount || slot.amount,
                    availability: availability || slot.availability,
                    startTime: startTime || slot.startTime,
                    endTime: endTime || slot.endTime,
                    facilityId: slot.facilityId,
                };
            });
            await slot_service_1.SlotService.updateSlots(newSlots);
            return res.status(200).json({ success: true });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to update slots" });
        }
    }
    static async checkSlotAvailability(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Slot ID is required" });
            }
            const slot = await slot_service_1.SlotService.getSlotById(id);
            if (!slot) {
                return res.status(404).json({ message: "Slot not found" });
            }
            const isAvailable = slot.availability === "available" && !slot.bookingId;
            return res.status(200).json({
                status: isAvailable,
            });
        }
        catch (error) {
            return res
                .status(500)
                .json({ message: "Failed to check slot availability" });
        }
    }
    static async checkMultipleSlotsAvailability(req, res) {
        try {
            const { slotIds } = req.body;
            if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
                return res.status(400).json({ message: "slotIds array is required" });
            }
            const isAvailable = await slot_service_1.SlotService.areAllSlotsAvailable(slotIds);
            return res.status(200).json({ data: isAvailable });
        }
        catch (error) {
            return res
                .status(500)
                .json({ message: "Failed to check slots availability" });
        }
    }
    static async getAvailableSlotsByFacilityAndDate(req, res) {
        try {
            const { facilityId } = req.params;
            const { startDate, endDate, sortType = "asc" } = req.query;
            if (!facilityId) {
                return res.status(400).json({ message: "Facility ID is required" });
            }
            if (!startDate || !endDate) {
                return res
                    .status(400)
                    .json({ message: "Start date and end date are required" });
            }
            const slots = await slot_service_1.SlotService.getAvailableSlotsByFacilityAndDate(facilityId, startDate, endDate, sortType);
            return res.status(200).json({
                data: slots,
                total: slots.length,
            });
        }
        catch (error) {
            return res.status(500).json({
                message: "Failed to get available slots",
                error: error.message,
            });
        }
    }
    static async updateSlotsWithDifferentData(req, res) {
        try {
            const { facilityId } = req.params;
            const { slots } = req.body;
            if (!facilityId) {
                return res.status(400).json({ message: "Facility ID is required" });
            }
            if (!Array.isArray(slots) || slots.length === 0) {
                return res
                    .status(400)
                    .json({ message: "Slots array is required and should not be empty" });
            }
            for (const slot of slots) {
                if (!slot.id) {
                    return res.status(400).json({ message: "Each slot must have an id" });
                }
            }
            const slotsObj = slots.map((s) => ({
                id: s.id,
                date: s.date,
                amount: s.amount,
                availability: s.availability,
                startTime: s.startTime,
                endTime: s.endTime,
                facilityId: s.facilityId
            }));
            await slot_service_1.SlotService.updateSlots(slotsObj);
            return res.status(200).json({
                message: "Slots updated successfully",
            });
        }
        catch (error) {
            return res.status(500).json({
                message: "Failed to update slots",
                error: error.message,
            });
        }
    }
    static async unlockSlots(req, res) {
        try {
            const { ids } = req.body;
            if (!ids) {
                return res.status(400).json({ message: "Slot IDs are required" });
            }
            await slot_service_1.SlotService.unlockSlots(ids);
            return res.status(200).json({ message: "Slots unlocked successfully" });
        }
        catch (error) {
            console.error("Error unlocking slot:", error);
            return res.status(500).json({
                message: "Failed to unlock slot",
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.SlotController = SlotController;
//# sourceMappingURL=slot.contoller.js.map