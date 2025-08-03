import { SlotAvailability } from "../models/venue.model";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DevScript {
  static unlockAllSlots = async (req: Request, res: Response) => {
    try {
      const { from, to } = req.query as {
        from?: string;
        to?: string;
      };

      let fromDate: Date | undefined;
      let toDate: Date | undefined;

      if (from) fromDate = new Date(from);
      if (to) toDate = new Date(to);

      if (
        (fromDate && isNaN(fromDate.getTime())) ||
        (toDate && isNaN(toDate.getTime()))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format for 'from' or 'to'",
        });
      }

      
      const updatedAtFilter: any = {};
      if (fromDate) updatedAtFilter.gte = fromDate;
      if (toDate) updatedAtFilter.lte = toDate;

      const whereClause: any = {
        availability: SlotAvailability.Locked,
        ...(Object.keys(updatedAtFilter).length && {
          updatedAt: updatedAtFilter,
        }),
      };

      const result = await prisma.slot.updateMany({
        where: whereClause,
        data: {
          availability: SlotAvailability.Available,
          bookingId: null,
        },
      });

      if (result.count > 0) {
        return res
          .status(200)
          .json({ success: true, message: "All slots unlocked successfully" });
      } else {
        return res.status(400).json({
          success: false,
          message: "No locked slots found in the given range",
        });
      }
    } catch (error) {
      console.error("Error unlocking all slots:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
}
