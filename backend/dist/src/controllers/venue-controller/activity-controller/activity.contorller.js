"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const activity_service_1 = __importDefault(require("../../../services/venue-services/activity.service"));
class ActivityController {
    static async createActivity(req, res) {
        try {
            const { name, tags, start_price_per_hour, venueId } = req.body;
            if (!name || !tags || !start_price_per_hour || !venueId) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const activity = {
                name,
                start_price_per_hour,
                venueId,
                tags,
            };
            const newActivity = await activity_service_1.default.createActivity(activity);
            return res.status(201).json({ id: newActivity.id });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to create activity" });
        }
    }
    static async getActivitiesByVenue(req, res) {
        try {
            const { venueId } = req.params;
            if (!venueId) {
                return res
                    .status(400)
                    .json({ message: "Venue ID is required in params" });
            }
            const activity = await activity_service_1.default.getActivitiesByVenue(venueId);
            return res.status(200).json({ data: activity });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to get activity" });
        }
    }
    static async getActivityById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res
                    .status(400)
                    .json({ message: "Activity ID and Venue ID are required" });
            }
            const activity = await activity_service_1.default.getActivityById(id);
            return res.status(200).json({ data: activity });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to get activity" });
        }
    }
    static async updateActivity(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res
                    .status(400)
                    .json({ message: "Activity ID and Venue ID are required" });
            }
            const activity = await activity_service_1.default.getActivityById(id);
            if (!activity) {
                return res.status(404).json({ message: "Activity not found" });
            }
            const newActivity = {
                name: req.body.name || activity.name,
                tags: req.body.tags || activity.tags,
                start_price_per_hour: req.body.start_price_per_hour || activity.start_price_per_hour,
            };
            const updatedActivity = await activity_service_1.default.updateActivity(id, newActivity);
            return res.status(200).json({ data: updatedActivity.id });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to update activity" });
        }
    }
    static async deleteActivity(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Activity ID is required" });
            }
            const activity = await activity_service_1.default.getActivityById(id);
            if (!activity) {
                return res.status(404).json({ message: "Activity not found" });
            }
            const deletedActivity = await activity_service_1.default.deleteActivity(id);
            return res.status(200).json({ data: deletedActivity.id });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to delete activity" });
        }
    }
}
exports.ActivityController = ActivityController;
//# sourceMappingURL=activity.contorller.js.map