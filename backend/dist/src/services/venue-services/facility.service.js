"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class FacilityService {
    static async createFacility(facility) {
        try {
            const newFacility = await prisma.facility.create({
                data: facility,
            });
            return newFacility;
        }
        catch (error) {
            console.error("Error creating facility:", error);
            throw error;
        }
    }
    static async getFacilitiesByActivity(activityId) {
        try {
            const facilities = await prisma.facility.findMany({
                where: { activityId },
            });
            return facilities;
        }
        catch (error) {
            console.error("Error getting facilities by activity:", error);
            throw error;
        }
    }
    static async getFacilityById(id) {
        try {
            const facility = await prisma.facility.findUnique({
                where: { id },
            });
            return facility;
        }
        catch (error) {
            console.error("Error getting facility by id:", error);
            throw error;
        }
    }
    static async updateFacility(id, facility) {
        try {
            const updatedFacility = await prisma.facility.update({
                where: { id },
                data: facility,
            });
            return updatedFacility;
        }
        catch (error) {
            console.error("Error updating facility:", error);
            throw error;
        }
    }
    static async deleteFacility(id) {
        try {
            const deletedFacility = await prisma.facility.delete({
                where: { id },
            });
            return deletedFacility;
        }
        catch (error) {
            console.error("Error deleting facility:", error);
            throw error;
        }
    }
}
exports.FacilityService = FacilityService;
//# sourceMappingURL=facility.service.js.map