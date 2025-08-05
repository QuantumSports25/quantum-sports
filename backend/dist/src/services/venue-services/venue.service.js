"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class VenueService {
    static async createVenue(venue, tx) {
        try {
            const newVenue = await tx.venue.create({
                data: {
                    name: venue.name,
                    location: venue.location,
                    highlight: venue.highlight || null,
                    start_price_per_hour: venue.start_price_per_hour,
                    partnerId: venue.partnerId,
                    phone: venue.phone,
                    mapLocationLink: venue.mapLocationLink,
                    cancellationPolicy: venue.cancellationPolicy || {},
                    images: venue.images || [],
                    features: venue.features || [],
                    approved: venue.approved || false,
                    rating: venue.rating || null,
                    totalReviews: venue.totalReviews || 0,
                },
            });
            return newVenue;
        }
        catch (error) {
            console.error("Error creating venue:", error);
            throw error;
        }
    }
    static async getVenue(id) {
        try {
            const venue = await prisma.venue.findUnique({
                where: { id },
            });
            return venue;
        }
        catch (error) {
            console.error("Error getting venue:", error);
            throw error;
        }
    }
    static async updateVenue(id, venue) {
        try {
            const updatedVenue = await prisma.venue.update({
                where: { id },
                data: {
                    name: venue.name,
                    location: venue.location,
                    highlight: venue.highlight || null,
                    start_price_per_hour: venue.start_price_per_hour,
                    partnerId: venue.partnerId,
                    phone: venue.phone,
                    mapLocationLink: venue.mapLocationLink,
                    cancellationPolicy: venue.cancellationPolicy || {},
                    images: venue.images || [],
                    features: venue.features || [],
                    approved: venue.approved || false,
                    rating: venue.rating || null,
                    totalReviews: venue.totalReviews || 0,
                    createdAt: venue.createdAt,
                    updatedAt: new Date(),
                },
            });
            return updatedVenue;
        }
        catch (error) {
            console.error("Error updating venue:", error);
            throw error;
        }
    }
    static async deleteVenue(id, tx) {
        try {
            const deletedVenue = await tx.venue.delete({
                where: { id },
            });
            return deletedVenue;
        }
        catch (error) {
            console.error("Error deleting venue:", error);
            throw error;
        }
    }
    static async getAllVenues(params) {
        const { page = 1, limit = 20, search, city } = params;
        const where = {};
        if (search) {
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                ];
            }
        }
        const lowercaseCity = city?.toLowerCase();
        if (city) {
            where.AND = where.AND || [];
            where.AND.push({
                location: {
                    path: ["city"],
                    equals: lowercaseCity,
                },
            });
        }
        const skip = (page - 1) * limit;
        const [venues, totalCount] = await Promise.all([
            prisma.venue.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: "asc" },
            }),
            prisma.venue.count({ where }),
        ]);
        return {
            venues,
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit),
        };
    }
}
exports.VenueService = VenueService;
//# sourceMappingURL=venue.service.js.map