import { BookingStatus } from "./booking.model";
export declare enum StatsMode {
    Monthly = "monthly",
    Yearly = "yearly"
}
export interface GrowthData {
    period: string;
    userCount: number;
    partnerCount: number;
    totalCount: number;
}
export interface VenueStats {
    totalVenues: number;
    venuesInRange: number;
    venueGrowth: number;
}
export interface BookingPaymentStats {
    method: "total" | "Wallet" | "Razorpay";
    total_count: number;
    total_amount: number;
    count_in_range: number;
    amount_in_range: number;
    count_growth: number;
    amount_growth: number;
    status?: BookingStatus;
    partnerId?: string | null;
}
export interface BookingGrowthData {
    method: "total" | "Wallet" | "Razorpay";
    period: string;
    booking_count: number;
    revenue_growth: number;
}
export interface TransactionStats {
    method: "total" | "Wallet" | "Razorpay";
    total_count: number;
    total_amount: number;
    count_in_range: number;
    amount_in_range: number;
    count_growth: number;
    amount_growth: number;
}
//# sourceMappingURL=stats.model.d.ts.map