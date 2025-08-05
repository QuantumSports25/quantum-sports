"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerVenueMapService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PartnerVenueMapService {
    static async createMapping(partnerDetailId, venueId, tx) {
        try {
            const mapping = await tx.partnerVenueMap.create({
                data: {
                    partnerDetailId,
                    venueId,
                },
            });
            return mapping;
        }
        catch (error) {
            console.error("Error creating partner-venue mapping:", error);
            throw error;
        }
    }
    static async getVenuesByPartner(partnerDetailId, page, limit) {
        try {
            const mappings = await prisma.partnerVenueMap.findMany({
                where: { partnerDetailId },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    venue: true,
                },
            });
            return mappings.map((mapping) => mapping.venue);
        }
        catch (error) {
            console.error("Error getting venues by partner:", error);
            throw error;
        }
    }
    static async getPartnersByVenue(venueId) {
        try {
            const mappings = await prisma.partnerVenueMap.findMany({
                where: { venueId },
                include: {
                    partnerDetails: true,
                },
            });
            return mappings.map((mapping) => mapping.partnerDetails);
        }
        catch (error) {
            console.error("Error getting partners by venue:", error);
            throw error;
        }
    }
    static async deleteMapping(venueId, tx) {
        try {
            const mapping = await tx.partnerVenueMap.deleteMany({
                where: { venueId },
            });
            return mapping;
        }
        catch (error) {
            console.error("Error deleting partner-venue mapping:", error);
            throw error;
        }
    }
}
exports.PartnerVenueMapService = PartnerVenueMapService;
//# sourceMappingURL=partnerVenueMap.service.js.map