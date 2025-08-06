"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVenueController = void 0;
const partnerVenueMap_service_1 = require("../../services/venue-services/partnerVenueMap.service");
const venue_service_1 = require("../../services/venue-services/venue.service");
class GetVenueController {
    static async getVenue(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Venue ID is required" });
            }
            const venue = await venue_service_1.VenueService.getVenue(id);
            if (!venue) {
                return res.status(404).json({ message: "Venue not found" });
            }
            const venueObj = {
                id: venue.id,
                name: venue.name,
                location: venue.location,
                description: venue.description,
                highlight: venue.highlight,
                rating: venue.rating,
                start_price_per_hour: venue.start_price_per_hour,
                createdAt: venue.createdAt,
                updatedAt: venue.updatedAt,
                features: venue.features,
                phone: venue.phone,
                mapLocationLink: venue.mapLocationLink,
                cancellationPolicy: venue.cancellationPolicy,
                partnerId: venue.partnerId,
            };
            return res.status(200).json({
                data: venueObj,
                message: "Venue fetched successfully",
            });
        }
        catch (error) {
            const appError = error;
            return res.status(500).json({
                message: "Internal server error",
                error: appError.message || "Unknown error",
            });
        }
    }
    static async getAllVenuesByPartner(req, res) {
        try {
            const partnerId = req.query["partnerId"];
            const { page = 1, limit = 10 } = req.body;
            if (!partnerId) {
                return res.status(400).json({ message: "Partner ID is required" });
            }
            const venues = await partnerVenueMap_service_1.PartnerVenueMapService.getVenuesByPartner(partnerId, page, limit);
            console.log(venues);
            if (!venues || venues.length === 0) {
                return res.status(404).json({ message: "No venues found" });
            }
            const venuesObj = venues.map((venue) => ({
                id: venue.id,
                name: venue.name,
                location: venue.location,
                description: venue.description,
                highlight: venue.highlight,
                rating: venue.rating,
                images: venue.images,
                start_price_per_hour: venue.start_price_per_hour,
                createdAt: venue.createdAt,
                updatedAt: venue.updatedAt,
                features: venue.features,
                phone: venue.phone,
                mapLocationLink: venue.mapLocationLink,
                cancellationPolicy: venue.cancellationPolicy,
                partnerId: venue.partnerId,
            }));
            return res.status(200).json({
                data: venuesObj,
                message: "Venues fetched successfully",
                total: venues.length,
            });
        }
        catch (error) {
            const appError = error;
            return res.status(500).json({
                message: "Internal server error",
                error: appError.message || "Unknown error",
            });
        }
    }
    static async getAllVenues(req, res) {
        try {
            const { page, limit, search, event, city } = req.query;
            const data = await venue_service_1.VenueService.getAllVenues({
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 10,
                search: search,
                event: event,
                city: city,
            });
            const venuesObj = data.venues.map((venue) => ({
                id: venue.id,
                name: venue.name,
                location: venue.location,
                description: venue.description,
                highlight: venue.highlight,
                rating: venue.rating,
                images: venue.images,
                start_price_per_hour: venue.start_price_per_hour,
                createdAt: venue.createdAt,
                updatedAt: venue.updatedAt,
                features: venue.features,
                phone: venue.phone,
                mapLocationLink: venue.mapLocationLink,
                cancellationPolicy: venue.cancellationPolicy,
                partnerId: venue.partnerId,
            }));
            return res.status(200).json({
                message: "Venues fetched successfully",
                data: venuesObj,
            });
        }
        catch (error) {
            const appError = error;
            return res.status(500).json({
                message: "Internal server error",
                error: appError.message || "Unknown error",
            });
        }
    }
}
exports.GetVenueController = GetVenueController;
//# sourceMappingURL=getVenue.controller.js.map