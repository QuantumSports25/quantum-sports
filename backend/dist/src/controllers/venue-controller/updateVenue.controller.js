"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVenueController = void 0;
const venue_service_1 = require("../../services/venue-services/venue.service");
const lodash_1 = require("lodash");
class UpdateVenueController {
    static async updateVenue(req, res) {
        const { id } = req.params;
        try {
            if (!id) {
                return res.status(400).json({ message: "Venue ID is required" });
            }
            const venueData = await venue_service_1.VenueService.getVenue(id);
            if (!venueData) {
                return res.status(404).json({ message: "Venue not found" });
            }
            const mergedVenueData = (0, lodash_1.merge)({}, venueData, req.body);
            const updatedVenue = await venue_service_1.VenueService.updateVenue(id, mergedVenueData);
            return res.status(200).json({
                data: updatedVenue.id,
                message: "Venue updated successfully",
            });
        }
        catch (error) {
            console.error("Error updating venue:", error);
            const appError = error;
            return res.status(500).json({
                message: "Failed to update venue",
                error: appError.message || "Unknown error",
            });
        }
    }
}
exports.UpdateVenueController = UpdateVenueController;
//# sourceMappingURL=updateVenue.controller.js.map