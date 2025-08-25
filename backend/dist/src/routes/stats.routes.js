"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("../controllers/stats-controller/stats.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get("/admin/dashboard", stats_controller_1.StatsController.getAdminDashboardStats);
router.get("/venues", stats_controller_1.StatsController.getVenueStats);
router.get("/bookings/payments", stats_controller_1.StatsController.getBookingPaymentStats);
router.get("/memberships", stats_controller_1.StatsController.getMembershipStats);
router.get("/user/growth", stats_controller_1.StatsController.getUserGrowthGraph);
router.get("/bookings/growth", stats_controller_1.StatsController.getBookingRevenueGrowthData);
exports.default = router;
//# sourceMappingURL=stats.routes.js.map