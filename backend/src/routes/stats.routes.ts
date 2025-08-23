import { Router } from "express";
import { StatsController } from "../controllers/stats-controller/stats.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/admin/dashboard", StatsController.getAdminDashboardStats);
router.get("/venues", StatsController.getVenueStats);
router.get("/bookings/payments", StatsController.getBookingPaymentStats);
router.get("/memberships", StatsController.getMembershipStats);

//graph
router.get("/user/growth", StatsController.getUserGrowthGraph);
router.get("/bookings/growth", StatsController.getBookingRevenueGrowthData);

export default router;