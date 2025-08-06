export interface Venue {
    id: string;
    name: string;
    location: string;
    description?: string;
    highlight?: string;
    main: string;
    rating?: number | null;
    start_price_per_hour: number;
    createdOn: Date;
    updatedOn: Date;
    detailDescription?: string;
    features?: string[];
    city: string;
    state: string;
    country: string;
    address: string;
    zip: string;
    phone: string;
    mapLocationLink: string;
    cancellationPolicy?: string[];
    partnerId: string;
}
export interface Activity {
    id: number;
    name: string;
    tags: string[];
    createdOn: Date;
    updatedOn: Date;
    start_price_per_hour: number;
}
export interface Facility {
    id: number;
    name: string;
    createdOn: Date;
    updatedOn: Date;
    start_price_per_hour: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    isFillingFast: boolean;
}
//# sourceMappingURL=venue.model.d.ts.map