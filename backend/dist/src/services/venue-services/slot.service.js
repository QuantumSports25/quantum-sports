"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotService = void 0;
const client_1 = require("@prisma/client");
const venue_model_1 = require("../../models/venue.model");
const prisma = new client_1.PrismaClient();
class SlotService {
    static async createSlot(slot) {
        try {
            console.log("SlotService.createSlot - Input data:", slot);
            const createData = {
                date: slot.date instanceof Date
                    ? slot.date
                    : new Date(slot.date + "T00:00:00.000Z"),
                amount: typeof slot.amount === "string"
                    ? parseFloat(slot.amount)
                    : slot.amount,
                availability: slot.availability,
                startTime: slot.startTime,
                endTime: slot.endTime,
                facilityId: slot.facilityId,
            };
            console.log("SlotService.createSlot - Formatted data for database:", createData);
            const newSlot = await prisma.slot.create({
                data: createData,
            });
            console.log("SlotService.createSlot - Creation successful:", newSlot);
            return newSlot;
        }
        catch (error) {
            console.error("Error creating slot:", error);
            throw error;
        }
    }
    static async createMultipleSlots(startDate, endDate, startTime, endTime, facilityId, amount, availability = venue_model_1.SlotAvailability.Available) {
        try {
            const result = await prisma.$executeRaw `
        INSERT INTO slots (id, date, "startTime", "endTime", "facilityId", amount, availability, "createdAt", "updatedAt")
        SELECT 
          gen_random_uuid() as id,
          date_series::date as date,
          time_series::time as "startTime",
          (time_series + interval '30 minutes')::time as "endTime",
          ${facilityId}::text as "facilityId",
          ${amount}::decimal as amount,
          ${availability}::"SlotAvailability" as availability,
          NOW() as "createdAt",
          NOW() as "updatedAt"
        FROM 
          generate_series(${startDate}::date, ${endDate}::date, interval '1 day') as date_series,
          generate_series(
            ('2024-01-01 ' || ${startTime} || ':00')::timestamp,
            ('2024-01-01 ' || ${endTime} || ':00')::timestamp - interval '30 minutes',
            interval '30 minutes'
          ) as time_series
      `;
            return { count: Number(result) };
        }
        catch (error) {
            console.error("Error creating multiple slots:", error);
            throw error;
        }
    }
    static async getSlotsByFacilityId(facilityId) {
        try {
            const slots = await prisma.slot.findMany({
                where: { facilityId },
            });
            return slots;
        }
        catch (error) {
            console.error("Error getting slots by facilityId:", error);
            throw error;
        }
    }
    static async getSlotsByDateRangeAndFacilityId(startDate, endDate, facilityId, sortType) {
        try {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            console.log("Querying slots with:", {
                facilityId,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                sortType,
            });
            const slots = await prisma.slot.findMany({
                where: {
                    facilityId,
                    date: {
                        gte: startDateTime,
                        lte: endDateTime,
                    },
                },
                orderBy: {
                    date: sortType,
                },
            });
            console.log(`Found ${slots.length} slots for facility ${facilityId}`);
            return slots;
        }
        catch (error) {
            console.error("Error getting slots by date range and facilityId:", error);
            throw error;
        }
    }
    static async getAvailableSlotsByFacilityAndDate(facilityId, startDate, endDate, sortType) {
        try {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            console.log("Querying available slots with:", {
                facilityId,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                sortType,
            });
            const slots = await prisma.slot.findMany({
                where: {
                    facilityId,
                    date: {
                        gte: startDateTime,
                        lte: endDateTime,
                    },
                    availability: "available",
                    bookingId: null,
                },
                orderBy: {
                    date: sortType,
                },
            });
            console.log(`Found ${slots.length} available slots for facility ${facilityId}`);
            return slots;
        }
        catch (error) {
            console.error("Error getting available slots by facility and date:", error);
            throw error;
        }
    }
    static async updateSlot(id, slot) {
        try {
            console.log("SlotService.updateSlot - Input data:", { id, slot });
            const updateData = {
                date: slot.date instanceof Date
                    ? slot.date
                    : new Date(slot.date + "T00:00:00.000Z"),
                amount: typeof slot.amount === "string"
                    ? parseFloat(slot.amount)
                    : slot.amount,
                availability: slot.availability,
                startTime: slot.startTime,
                endTime: slot.endTime,
                facilityId: slot.facilityId,
            };
            console.log("SlotService.updateSlot - Formatted data for database:", updateData);
            const updatedSlot = await prisma.slot.update({
                where: { id },
                data: updateData,
            });
            console.log("SlotService.updateSlot - Update successful:", updatedSlot);
            return updatedSlot;
        }
        catch (error) {
            console.error("Error updating slot in service:", error);
            console.error("Error details:", {
                code: error?.code,
                message: error?.message,
                meta: error?.meta,
            });
            throw error;
        }
    }
    static async deleteSlot(id) {
        try {
            const deletedSlot = await prisma.slot.delete({
                where: { id },
            });
            return deletedSlot;
        }
        catch (error) {
            console.error("Error deleting slot:", error);
            throw error;
        }
    }
    static async getSlotById(id) {
        try {
            const slot = await prisma.slot.findUnique({
                where: { id },
            });
            return slot;
        }
        catch (error) {
            console.error("Error getting slot by id:", error);
            throw error;
        }
    }
    static async areAllSlotsAvailable(slotIds) {
        try {
            const availableSlots = await prisma.slot.count({
                where: {
                    id: {
                        in: slotIds,
                    },
                    availability: "available",
                    bookingId: null,
                },
            });
            return availableSlots === slotIds.length;
        }
        catch (error) {
            console.error("Error checking slot availability:", error);
            throw error;
        }
    }
    static async updateSlots(slots) {
        try {
            const updatedSlots = await prisma.slot.updateMany({
                data: slots,
            });
            return updatedSlots;
        }
        catch (error) {
            console.error("Error updating slots:", error);
            throw error;
        }
    }
    static async unlockSlots(ids) {
        try {
            const unlockedSlots = await prisma.slot.updateMany({
                where: {
                    id: { in: ids },
                    availability: venue_model_1.SlotAvailability.Locked,
                },
                data: {
                    availability: venue_model_1.SlotAvailability.Available,
                    bookingId: null,
                },
            });
            return unlockedSlots;
        }
        catch (error) {
            console.error("Error unlocking slots:", error);
            throw error;
        }
    }
}
exports.SlotService = SlotService;
//# sourceMappingURL=slot.service.js.map