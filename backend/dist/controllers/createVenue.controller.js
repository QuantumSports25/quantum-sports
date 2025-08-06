"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVenueController = void 0;
class CreateVenueController {
    static async createVenue(req, res) {
        try {
            const { name, location, highlight, main, start_price_per_hour, partnerId, city, state, country, zip, phone, mapLocationLink, } = req.body;
            if (!name ||
                !location ||
                !highlight ||
                !main ||
                !start_price_per_hour ||
                !partnerId ||
                !city ||
                !state ||
                !country ||
                !zip ||
                !phone ||
                !mapLocationLink) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            return res.status(201).json({ message: "Venue created successfully" });
        }
        catch (error) {
            console.error("Error creating venue:", error);
            return res.status(500).json({ error: "Failed to create venue" });
        }
    }
}
exports.CreateVenueController = CreateVenueController;
//# sourceMappingURL=createVenue.controller.js.map