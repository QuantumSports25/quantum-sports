import { Prisma } from "@prisma/client";
export declare class PartnerVenueMapService {
    static createMapping(partnerDetailId: string, venueId: string, tx: Prisma.TransactionClient): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerDetailId: string;
        venueId: string;
    }>;
    static getVenuesByPartner(partnerDetailId: string, page: number, limit: number): Promise<{
        name: string;
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        details: Prisma.JsonValue | null;
        description: string | null;
        highlight: string | null;
        location: Prisma.JsonValue;
        start_price_per_hour: Prisma.Decimal;
        cancellationPolicy: Prisma.JsonValue | null;
        images: string[];
        features: string[];
        approved: boolean;
        mapLocationLink: string | null;
        rating: Prisma.Decimal | null;
        totalReviews: number | null;
        partnerId: string;
    }[]>;
    static getPartnersByVenue(venueId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        companyName: string;
        subscriptionType: string;
        gstNumber: string | null;
        websiteUrl: string | null;
    }[]>;
    static deleteMapping(venueId: string, tx: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
}
//# sourceMappingURL=partnerVenueMap.service.d.ts.map