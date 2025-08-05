"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityController = void 0;
const facility_service_1 = require("../../../services/venue-services/facility.service");
class FacilityController {
    static async createFacility(req, res) {
        try {
            const { name, start_price_per_hour, activityId, startTime, endTime, isAvailable, isFillingFast, images } = req.body;
            if (!name || !start_price_per_hour || !activityId || !startTime || !endTime || !isAvailable || !isFillingFast || !images) {
                return res.status(400).json({ message: "All fields are required" });
            }
            if (!Array.isArray(images) || images.length === 0) {
                return res.status(400).json({ message: "Images must be an array and cannot be empty" });
            }
            const facility = {
                name,
                start_price_per_hour,
                activityId,
                startTime,
                endTime,
                isAvailable
            };
            const newFacility = await facility_service_1.FacilityService.createFacility(facility);
            return res.status(201).json({ message: "Facility created successfully", data: newFacility.id });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to create facility" });
        }
    }
    static async getFacilitiesByActivity(req, res) {
        try {
            const { activityId } = req.params;
            if (!activityId) {
                return res.status(400).json({ message: "Activity ID is required" });
            }
            const facilities = await facility_service_1.FacilityService.getFacilitiesByActivity(activityId);
            if (!facilities) {
                return res.status(404).json({ message: "No facilities found" });
            }
            const formattedFacilities = facilities.map(facility => ({
                id: facility.id,
                name: facility.name,
                images: facility.images ?? [],
                start_price_per_hour: Number(facility.start_price_per_hour),
                activityId: facility.activityId,
                startTime: facility.startTime,
                endTime: facility.endTime,
                isAvailable: facility.isAvailable,
                isFillingFast: facility.isFillingFast,
            }));
            return res.status(200).json({ data: formattedFacilities });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to get facilities by activity" });
        }
    }
    static async getFacilityById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Facility ID is required" });
            }
            const facility = await facility_service_1.FacilityService.getFacilityById(id);
            if (!facility) {
                return res.status(404).json({ message: "Facility not found" });
            }
            const newFacility = {
                name: facility.name,
                images: facility.images ?? [],
                start_price_per_hour: Number(facility.start_price_per_hour),
                activityId: facility.activityId,
                startTime: facility.startTime,
                endTime: facility.endTime,
                isAvailable: facility.isAvailable,
                isFillingFast: facility.isFillingFast,
            };
            return res.status(200).json({ data: newFacility });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to get facility by id" });
        }
    }
    static async updateFacility(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Facility ID is required" });
            }
            const facility = await facility_service_1.FacilityService.getFacilityById(id);
            if (!facility) {
                return res.status(404).json({ message: "Facility not found" });
            }
            const newFacility = {
                name: req.body.name || facility.name,
                images: req.body.images || facility.images,
                start_price_per_hour: req.body.start_price_per_hour || facility.start_price_per_hour,
                activityId: req.body.activityId || facility.activityId,
                startTime: req.body.startTime || facility.startTime,
                endTime: req.body.endTime || facility.endTime,
                isAvailable: req.body.isAvailable || facility.isAvailable,
                isFillingFast: req.body.isFillingFast || facility.isFillingFast,
            };
            const updatedFacility = await facility_service_1.FacilityService.updateFacility(id, newFacility);
            return res.status(200).json({ data: updatedFacility.id });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to update facility" });
        }
    }
    static async deleteFacility(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Facility ID is required" });
            }
            const facility = await facility_service_1.FacilityService.getFacilityById(id);
            if (!facility) {
                return res.status(404).json({ message: "Facility not found" });
            }
            const deletedFacility = await facility_service_1.FacilityService.deleteFacility(id);
            return res.status(200).json({ data: deletedFacility.id });
        }
        catch (error) {
            return res.status(500).json({ message: "Failed to delete facility" });
        }
    }
}
exports.FacilityController = FacilityController;
//# sourceMappingURL=facility.contoller.js.map