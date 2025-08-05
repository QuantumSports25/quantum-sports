"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteVenueController = void 0;
const partnerVenueMap_service_1 = require("../../services/venue-services/partnerVenueMap.service");
const client_1 = require("@prisma/client");
const venue_service_1 = require("../../services/venue-services/venue.service");
const prisma = new client_1.PrismaClient();
class DeleteVenueController {
    static async deleteVenue(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Venue ID is required" });
            }
            const result = await prisma.$transaction(async (tx) => {
                const deletedVenue = await venue_service_1.VenueService.deleteVenue(id, tx);
                const deletedMapping = await partnerVenueMap_service_1.PartnerVenueMapService.deleteMapping(id, tx);
                return { deletedVenue, deletedMapping };
            });
            if (!result) {
                return res
                    .status(400)
                    .json({ error: "Failed to delete venue and mapping" });
            }
            return res.status(200).json({
                data: result.deletedVenue.id,
                message: "Venue deleted successfully",
                mappingDeleted: !!result.deletedMapping,
            });
        }
        catch (error) {
            console.error("Error deleting venue:", error);
            const appError = error;
            return res.status(500).json({
                message: "Failed to delete venue",
                error: appError.message || "Unknown error",
            });
        }
    }
}
exports.DeleteVenueController = DeleteVenueController;
//# sourceMappingURL=deleteVenue.controller.js.map