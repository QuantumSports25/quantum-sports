import { Request, Response } from "express";
import { AppError } from "../../types";
import { Venue } from "../../models/venue.model";
import { VenueService } from "../../services/venue-services/venue.service";
import { merge } from "lodash";

export class UpdateVenueController {
  static async updateVenue(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (!id) {
        return res.status(400).json({ message: "Venue ID is required" });
      }
      const venueData = (await VenueService.getVenue(id)) as unknown as Venue;
      if (!venueData) {
        return res.status(404).json({ message: "Venue not found" });
      }
      const mergedVenueData = merge({}, venueData, req.body as Venue);

      mergedVenueData.rating = (Number(req.body.rating) || 0) + (Number(venueData.rating) || 0);
      mergedVenueData.totalReviews = (venueData.totalReviews ?? 0) + 1;

      const updatedVenue = await VenueService.updateVenue(id, mergedVenueData);

      return res.status(200).json({
        data: updatedVenue.id,
        message: "Venue updated successfully",
      });
    } catch (error) {
      console.error("Error updating venue:", error);
      const appError = error as AppError;
      return res.status(500).json({
        message: "Failed to update venue",
        error: appError.message || "Unknown error",
      });
    }
  }
}
