import { Request, Response } from "express";
import { AppError } from "../../types";
import { PartnerVenueMapService } from "../../services/venue-services/partnerVenueMap.service";
import { Prisma } from "@prisma/client";
import prisma from "../../config/db";
import { VenueService } from "../../services/venue-services/venue.service";

// Use shared Prisma client

export class DeleteVenueController {
  static async deleteVenue(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Venue ID is required" });
      }

      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const deletedVenue = await VenueService.deleteVenue(id,tx);
        const deletedMapping = await PartnerVenueMapService.deleteMapping(id,tx);
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
    } catch (error) {
      console.error("Error deleting venue:", error);
      const appError = error as AppError;
      return res.status(500).json({
        message: "Failed to delete venue",
        error: appError.message || "Unknown error",
      });
    }
  }
}
