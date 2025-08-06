"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class VenueService {
    static async createVenue(venue) {
        try {
            const newVenue = await prisma.venue.create({
                data: {
                    name: venue.name,
                    location: venue.location,
                    description: venue.description ?? '',
                    highlight: venue.highlight ?? '',
                    rating: venue.rating || 0,
                    main: venue.main,
                    start_price_per_hour: venue.start_price_per_hour,
                    partnerId: venue.partnerId,
                    detailDescription: venue.detailDescription ?? '',
                    features: venue.features ?? [],
                    city: venue.city,
                    state: venue.state,
                    country: venue.country,
                    zip: venue.zip,
                    phone: venue.phone,
                    mapLocationLink: venue.mapLocationLink,
                    createdOn: new Date(),
                    updatedOn: new Date(),
                }
            });
            return newVenue;
        }
        catch (error) {
            console.error("Error creating venue:", error);
            throw error;
        }
    }
}
exports.VenueService = VenueService;
//# sourceMappingURL=venue.service.js.map