"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const stats_services_1 = require("../../services/stats-services/stats.services");
const booking_model_1 = require("../../models/booking.model");
const stats_model_1 = require("../../models/stats.model");
class StatsController {
    static async getAdminDashboardStats(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: "startDate and endDate query parameters are required",
                });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
                });
            }
            const stats = await stats_services_1.StatsService.getAdminDashboardStats(start, end);
            return res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching admin dashboard stats:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async getVenueStats(req, res) {
        try {
            const { startDate, endDate, partnerId } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: "startDate and endDate query parameters are required",
                });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
                });
            }
            const stats = await stats_services_1.StatsService.getVenueStats(start, end, partnerId);
            return res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching venue stats:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async getUserGrowthGraph(req, res) {
        try {
            const { startDate, endDate, mode } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: "startDate and endDate query parameters are required",
                });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
                });
            }
            const stats = await stats_services_1.StatsService.getGrowthData(start, end, mode);
            return res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching user growth graph:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async getBookingPaymentStats(req, res) {
        try {
            const { startDate, endDate, status, partnerId } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: "startDate and endDate query parameters are required",
                });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
                });
            }
            const bookingStatus = status
                ? status
                : booking_model_1.BookingStatus.Confirmed;
            if (status && !Object.values(booking_model_1.BookingStatus).includes(bookingStatus)) {
                return res.status(400).json({
                    error: "Invalid booking status. Valid values: " +
                        Object.values(booking_model_1.BookingStatus).join(", "),
                });
            }
            const stats = await stats_services_1.StatsService.getBookingPaymentStats(start, end, bookingStatus, partnerId);
            return res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching booking payment stats:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async getBookingRevenueGrowthData(req, res) {
        try {
            const { startDate, endDate, status, mode, partnerId } = req.query;
            if (!startDate || !endDate || !status) {
                return res.status(400).json({
                    error: "startDate, endDate, and status query parameters are required",
                });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
                });
            }
            const bookingStatus = status;
            if (!Object.values(booking_model_1.BookingStatus).includes(bookingStatus)) {
                return res.status(400).json({
                    error: "Invalid booking status. Valid values: " +
                        Object.values(booking_model_1.BookingStatus).join(", "),
                });
            }
            const statsMode = mode ? mode : stats_model_1.StatsMode.Monthly;
            if (mode && !Object.values(stats_model_1.StatsMode).includes(statsMode)) {
                return res.status(400).json({
                    error: "Invalid stats mode. Valid values: " +
                        Object.values(stats_model_1.StatsMode).join(", "),
                });
            }
            const stats = await stats_services_1.StatsService.getBookingRevenueGrowthData(start, end, bookingStatus, statsMode, partnerId);
            return res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching booking revenue growth data:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async getMembershipStats(req, res) {
        try {
            const { startDate, endDate, planId } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: "startDate and endDate query parameters are required",
                });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
                });
            }
            const stats = await stats_services_1.StatsService.getMembershipStats(start, end, planId);
            return res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching membership stats:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
}
exports.StatsController = StatsController;
//# sourceMappingURL=stats.controller.js.map