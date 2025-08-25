"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVenueController = void 0;
const partnerVenueMap_service_1 = require("../../services/venue-services/partnerVenueMap.service");
const client_1 = require("@prisma/client");
const venue_service_1 = require("../../services/venue-services/venue.service");
const prisma = new client_1.PrismaClient();
class CreateVenueController {
    static async createVenue(req, res) {
        try {
            const { name, highlight, start_price_per_hour, partnerId, city, state, images, country, zip, phone, mapLocationLink, lat, lang, membershipId, } = req.body;
            if (!name ||
                !highlight ||
                !start_price_per_hour ||
                !partnerId ||
                !city ||
                !state ||
                !country ||
                !zip ||
                !phone ||
                !mapLocationLink ||
                !lat ||
                !lang) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            const address = `${city}, ${state}, ${country}, ${zip}`;
            const lowercaseCity = city.toLowerCase();
            const venueData = {
                name,
                location: {
                    address,
                    city: lowercaseCity,
                    state,
                    country,
                    pincode: zip,
                    coordinates: {
                        lat,
                        lang,
                    },
                },
                highlight,
                start_price_per_hour,
                partnerId,
                phone,
                mapLocationLink,
                details: {},
                cancellationPolicy: {},
                images: images,
                features: [],
                approved: false,
                rating: 0,
                totalReviews: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const result = await prisma.$transaction(async (tx) => {
                const createdVenue = await venue_service_1.VenueService.createVenue(venueData, tx);
                const mapping = await partnerVenueMap_service_1.PartnerVenueMapService.createMapping(partnerId, createdVenue.id, tx);
                if (membershipId) {
                    const membership = await tx.membership.findUnique({ where: { id: membershipId } });
                    if (!membership) {
                        throw new Error("Membership not found for provided membershipId");
                    }
                    if (membership.userId !== partnerId) {
                        throw new Error("Membership does not belong to this partner");
                    }
                    const existingDetails = membership.paymentDetails || {};
                    const updatedDetails = {
                        ...existingDetails,
                        usedVenueId: createdVenue.id,
                        usedAt: new Date().toISOString(),
                    };
                    await tx.membership.update({
                        where: { id: membershipId },
                        data: {
                            paymentDetails: updatedDetails,
                        },
                    });
                }
                return { createdVenue, mapping };
            });
            if (!result) {
                return res
                    .status(400)
                    .json({ error: "Failed to create venue and mapping" });
            }
            return res.status(201).json({
                id: result.createdVenue.id,
                message: "Venue and mapping created successfully",
                mappingCreated: !!result.mapping,
            });
        }
        catch (error) {
            console.error("Error creating venue and mapping:", error);
            const appError = error;
            return res.status(500).json({
                message: "Failed to create venue and mapping",
                error: appError.message || "Unknown error",
            });
        }
    }
}
exports.CreateVenueController = CreateVenueController;
//# sourceMappingURL=createVenue.controller.js.map