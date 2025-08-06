import { Facility } from "../../models/venue.model";
export declare class FacilityService {
    static createFacility(facility: Facility): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        images: string[];
        activityId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        isFillingFast: boolean;
    }>;
    static getFacilitiesByActivity(activityId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        images: string[];
        activityId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        isFillingFast: boolean;
    }[]>;
    static getFacilityById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        images: string[];
        activityId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        isFillingFast: boolean;
    } | null>;
    static updateFacility(id: string, facility: Facility): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        images: string[];
        activityId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        isFillingFast: boolean;
    }>;
    static deleteFacility(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        images: string[];
        activityId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        isFillingFast: boolean;
    }>;
}
//# sourceMappingURL=facility.service.d.ts.map