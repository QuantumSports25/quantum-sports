import { BookingStatus } from "./booking.model";

export enum StatsMode {
  Monthly = "monthly",
  Yearly = "yearly",
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
  method: "total" | "Wallet" | "Razorpay"; // payment method
  total_count: number; // total payments of this method
  total_amount: number; // total amount of this method
  count_in_range: number; // count in the selected date range
  amount_in_range: number; // amount in the selected date range
  count_growth: number; // % growth of count compared to previous period
  amount_growth: number; // % growth of amount compared to previous period
  status?: BookingStatus; // optional: booking status
  partnerId?: string | null; // optional: partner filter
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
