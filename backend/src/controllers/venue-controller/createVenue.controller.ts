import { Request, Response } from "express";
import { Venue } from "../../models/venue.model";
import { AppError } from "../../types";
import { PartnerVenueMapService } from "../../services/venue-services/partnerVenueMap.service";
import { Prisma } from "@prisma/client";
import prisma from "../../config/db";
import { VenueService } from "../../services/venue-services/venue.service";

// Use shared Prisma client

export class CreateVenueController {
  static async createVenue(req: Request, res: Response) {
    try {
      const {
        name,
        highlight,
        start_price_per_hour,
        partnerId,
        city,
        state,
        images,
        country,
        zip,
        phone,
        mapLocationLink,
        lat,
        lang,
        membershipId,
      } = req.body as {
        name: string;
        highlight: string;
        start_price_per_hour: number;
        partnerId: string;
        city: string;
        images: string[];
        state: string;
        country: string;
        zip: string;
        phone: string;
        mapLocationLink: string;
        lat: number;
        lang: number;
        membershipId?: string;
      };

      if (
        !name ||
        !highlight ||
        !start_price_per_hour ||
        !partnerId ||
        !city ||
        !state ||
        !country ||
        !zip ||
        !phone ||
        !mapLocationLink ||
        !lat ||
        !lang
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Compose the address field from city, state, country, and zip
      const address = `${city}, ${state}, ${country}, ${zip}`;
      const lowercaseCity = city.toLowerCase();
      const venueData: Venue = {
        name,
        location: {
          address,
          city: lowercaseCity,
          state,
          country,
          pincode: zip,
          coordinates: {
            lat,
            lang,
          },
        },
        highlight,
        start_price_per_hour,
        partnerId,
        phone,
        mapLocationLink,
        details: {},
        cancellationPolicy: {},
        images: images,
        features: [],
        approved: false,
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // 1. Create the venue
          const createdVenue = await VenueService.createVenue(venueData, tx);

          // 2. Create the mapping using userId directly
          const mapping = await PartnerVenueMapService.createMapping(
            partnerId,
            createdVenue.id,
            tx
          );

          // 3. If membershipId is provided, link this venue to that membership (store in paymentDetails JSON)
          if (membershipId) {
            const membership = await tx.membership.findUnique({ where: { id: membershipId } });
            if (!membership) {
              throw new Error("Membership not found for provided membershipId");
            }
            // Optional guard: ensure membership belongs to this partner (user)
            if (membership.userId !== partnerId) {
              throw new Error("Membership does not belong to this partner");
            }

            const existingDetails: any = (membership as any).paymentDetails || {};
            const updatedDetails = {
              ...existingDetails,
              usedVenueId: createdVenue.id,
              usedAt: new Date().toISOString(),
            };

            await tx.membership.update({
              where: { id: membershipId },
              data: {
                paymentDetails: updatedDetails as unknown as Prisma.InputJsonValue,
              },
            });
          }

          return { createdVenue, mapping };
        }
      );

      if (!result) {
        return res
          .status(400)
          .json({ error: "Failed to create venue and mapping" });
      }

      return res.status(201).json({
        id: result.createdVenue.id,
        message: "Venue and mapping created successfully",
        mappingCreated: !!result.mapping,
      });
    } catch (error) {
      console.error("Error creating venue and mapping:", error);
      const appError = error as AppError;
      return res.status(500).json({
        message: "Failed to create venue and mapping",
        error: appError.message || "Unknown error",
      });
    }
  }
}
