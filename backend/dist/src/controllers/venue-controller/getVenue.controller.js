"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVenueController = void 0;
const partnerVenueMap_service_1 = require("../../services/venue-services/partnerVenueMap.service");
const venue_service_1 = require("../../services/venue-services/venue.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
            const membership = await prisma.membership.findFirst({
                where: {
                    paymentDetails: {
                        path: ["usedVenueId"],
                        equals: venue.id,
                    },
                },
                include: { plan: true },
            });
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
                membership: membership
                    ? {
                        id: membership.id,
                        planId: membership.planId,
                        planName: membership.plan?.name || "",
                        amount: membership.plan?.amount ?? 0,
                        credits: membership.plan?.credits ?? 0,
                        startedAt: membership.startedAt,
                        expiresAt: membership.expiresAt,
                        isActive: membership.isActive,
                    }
                    : null,
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
            const venueIds = venues.map((v) => v.id);
            let memberships = [];
            if (venueIds.length > 0) {
                memberships = await prisma.membership.findMany({
                    where: {
                        OR: venueIds.map((id) => ({
                            paymentDetails: { path: ["usedVenueId"], equals: id },
                        })),
                    },
                    include: { plan: true },
                });
            }
            const usedVenueIdToMembership = new Map();
            for (const m of memberships) {
                const usedVenueId = m?.paymentDetails?.usedVenueId;
                if (usedVenueId && !usedVenueIdToMembership.has(usedVenueId)) {
                    usedVenueIdToMembership.set(usedVenueId, m);
                }
            }
            const venuesObj = venues.map((venue) => {
                const m = usedVenueIdToMembership.get(venue.id);
                return {
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
                    membership: m
                        ? {
                            id: m.id,
                            planId: m.planId,
                            planName: m.plan?.name || "",
                            amount: m.plan?.amount ?? 0,
                            credits: m.plan?.credits ?? 0,
                            startedAt: m.startedAt,
                            expiresAt: m.expiresAt,
                            isActive: m.isActive,
                        }
                        : null,
                };
            });
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
            const allVenueIds = data.venues.map((v) => v.id);
            let allMemberships = [];
            if (allVenueIds.length > 0) {
                allMemberships = await prisma.membership.findMany({
                    where: {
                        OR: allVenueIds.map((id) => ({
                            paymentDetails: { path: ["usedVenueId"], equals: id },
                        })),
                    },
                    include: { plan: true },
                });
            }
            const mapUsedVenueToMembership = new Map();
            for (const m of allMemberships) {
                const usedVenueId = m?.paymentDetails?.usedVenueId;
                if (usedVenueId && !mapUsedVenueToMembership.has(usedVenueId)) {
                    mapUsedVenueToMembership.set(usedVenueId, m);
                }
            }
            const venuesObj = data.venues.map((venue) => {
                const m = mapUsedVenueToMembership.get(venue.id);
                return {
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
                    membership: m
                        ? {
                            id: m.id,
                            planId: m.planId,
                            planName: m.plan?.name || "",
                            amount: m.plan?.amount ?? 0,
                            credits: m.plan?.credits ?? 0,
                            startedAt: m.startedAt,
                            expiresAt: m.expiresAt,
                            isActive: m.isActive,
                        }
                        : null,
                };
            });
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