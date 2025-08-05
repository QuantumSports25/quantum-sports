import { Activity } from "../../models/venue.model";
declare class ActivityService {
    static createActivity(activity: Activity): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venueId: string;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        tags: string[];
    }>;
    static getActivitiesByVenue(venueId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venueId: string;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        tags: string[];
    }[]>;
    static getActivityById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venueId: string;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        tags: string[];
    } | null>;
    static updateActivity(id: string, activity: Activity): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venueId: string;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        tags: string[];
    }>;
    static deleteActivity(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venueId: string;
        start_price_per_hour: import("@prisma/client/runtime/library").Decimal;
        tags: string[];
    }>;
}
export default ActivityService;
//# sourceMappingURL=activity.service.d.ts.map