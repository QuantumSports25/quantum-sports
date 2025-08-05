export interface Venue {
    id?: string;
    partnerId: string;
    name: string;
    description?: string;
    highlight?: string;
    location: Location;
    start_price_per_hour: number;
    details: {};
    cancellationPolicy: {};
    images?: string[];
    features?: string[];
    approved?: boolean;
    mapLocationLink: string;
    phone: string;
    rating?: number;
    reviews?: {
        userId: string;
        text: string;
        createdAt: string;
    };
    totalReviews?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Location {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    coordinates: {
        lat: number;
        lang: number;
    };
}
export interface Activity {
    id?: string;
    name: string;
    tags: string[];
    createdAt?: Date;
    updatedAt?: Date;
    venueId?: string;
    start_price_per_hour: number;
}
export interface Facility {
    id?: string;
    name: string;
    images?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    activityId: string;
    start_price_per_hour: number;
    startTime: string;
    endTime: string;
    isAvailable?: boolean;
    isFillingFast?: boolean;
}
export declare enum SlotAvailability {
    Locked = "locked",
    Available = "available",
    NotAvailable = "not_available",
    Booked = "booked",
    FillingFast = "filling_fast"
}
export interface Slot {
    id?: string;
    date: Date | string;
    amount: number;
    availability: SlotAvailability;
    startTime: string;
    endTime: string;
    bookingId?: string;
    facilityId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface GetVenuesParams {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sport?: string | undefined;
    event?: string | undefined;
    city?: string | undefined;
}
//# sourceMappingURL=venue.model.d.ts.map