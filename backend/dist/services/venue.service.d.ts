import { Venue } from "../models/venue.model";
export declare class VenueService {
    static createVenue(venue: Venue): Promise<{
        name: string;
        id: string;
        phone: string;
        location: string;
        description: string | null;
        highlight: string;
        main: string;
        rating: import("@prisma/client/runtime/library").Decimal | null;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        createdOn: Date;
        updatedOn: Date;
        partnerId: string;
        detailDescription: string | null;
        features: string[];
        city: string;
        state: string;
        country: string;
        zip: string;
        mapLocationLink: string;
        cancellationPolicy: string[];
    }>;
}
//# sourceMappingURL=venue.service.d.ts.map