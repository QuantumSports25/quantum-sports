import { Request, Response } from "express";
import { StatsService } from "../../services/stats-services/stats.services";
import { BookingStatus } from "../../models/booking.model";
import { StatsMode } from "../../models/stats.model";

export class StatsController {
  static async getAdminDashboardStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "startDate and endDate query parameters are required",
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
        });
      }

      const stats = await StatsService.getAdminDashboardStats(start, end);
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching admin dashboard stats:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async getVenueStats(req: Request, res: Response) {
    try {
      const { startDate, endDate, partnerId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "startDate and endDate query parameters are required",
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
        });
      }

      const stats = await StatsService.getVenueStats(
        start,
        end,
        partnerId as string
      );
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching venue stats:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async getUserGrowthGraph(req: Request, res: Response) {
    try {
      const { startDate, endDate, mode } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "startDate and endDate query parameters are required",
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
        });
      }

      const stats = await StatsService.getGrowthData(start, end, mode as StatsMode);
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching user growth graph:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async getBookingPaymentStats(req: Request, res: Response) {
    try {
      const { startDate, endDate, status, partnerId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "startDate and endDate query parameters are required",
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
        });
      }

      // Validate status if provided
      const bookingStatus = status
        ? (status as BookingStatus)
        : BookingStatus.Confirmed;

      if (status && !Object.values(BookingStatus).includes(bookingStatus)) {
        return res.status(400).json({
          error:
            "Invalid booking status. Valid values: " +
            Object.values(BookingStatus).join(", "),
        });
      }

      const stats = await StatsService.getBookingPaymentStats(
        start,
        end,
        bookingStatus,
        partnerId as string
      );
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching booking payment stats:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async getBookingRevenueGrowthData(req: Request, res: Response) {
    try {
      const { startDate, endDate, status, mode, partnerId } = req.query;

      if (!startDate || !endDate || !status) {
        return res.status(400).json({
          error: "startDate, endDate, and status query parameters are required",
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
        });
      }

      // Validate status
      const bookingStatus = status as BookingStatus;
      if (!Object.values(BookingStatus).includes(bookingStatus)) {
        return res.status(400).json({
          error:
            "Invalid booking status. Valid values: " +
            Object.values(BookingStatus).join(", "),
        });
      }

      // Validate mode if provided
      const statsMode = mode ? (mode as StatsMode) : StatsMode.Monthly;
      if (mode && !Object.values(StatsMode).includes(statsMode)) {
        return res.status(400).json({
          error:
            "Invalid stats mode. Valid values: " +
            Object.values(StatsMode).join(", "),
        });
      }

      const stats = await StatsService.getBookingRevenueGrowthData(
        start,
        end,
        bookingStatus,
        statsMode,
        partnerId as string
      );
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching booking revenue growth data:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async getMembershipStats(req: Request, res: Response) {
    try {
      const { startDate, endDate, planId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "startDate and endDate query parameters are required",
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)",
        });
      }

      const stats = await StatsService.getMembershipStats(
        start,
        end,
        planId as string
      );
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching membership stats:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }
}
