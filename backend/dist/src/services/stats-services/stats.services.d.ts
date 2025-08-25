import { BookingGrowthData, BookingPaymentStats, GrowthData, StatsMode, VenueStats } from "../../models/stats.model";
import { BookingStatus } from "../../models/booking.model";
export declare class StatsService {
    static getAdminDashboardStats(startDate: Date, endDate: Date): Promise<{
        total_users: number;
        total_partners: number;
        total_only_users: number;
        partners_in_range: number;
        users_in_range: number;
        user_growth: number;
        partner_growth: number;
    }>;
    static getGrowthData(startDate: string | Date, endDate: string | Date, mode?: StatsMode): Promise<GrowthData[]>;
    static getVenueStats(startDate: Date, endDate: Date, partnerId?: string): Promise<VenueStats>;
    static getBookingPaymentStats(startDate: Date, endDate: Date, status?: BookingStatus, partnerId?: string): Promise<BookingPaymentStats[]>;
    static getBookingRevenueGrowthData(startDate: Date, endDate: Date, status: BookingStatus, mode?: StatsMode, partnerId?: string): Promise<Record<string, BookingGrowthData[]>>;
    static getMembershipStats(startDate: Date, endDate: Date, planId?: string): Promise<{
        total_memberships: number;
        active_memberships: number;
        memberships_in_range: number;
        membership_growth: number;
        credits_in_range: number;
        credits_growth: number;
    }>;
}
//# sourceMappingURL=stats.services.d.ts.map