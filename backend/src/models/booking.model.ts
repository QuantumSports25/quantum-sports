import { PaymentMethod } from "./payment.model";

export interface Booking {
  id?: string;
  userId: string;
  type: BookingType;
  bookingData: EventBooking | VenueBooking;
  amount: number;
  bookedDate: Date;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  customerDetails: CustomerDetails;
  paymentDetails?: PaymentDetails;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum BookingType {
  Event = "event",
  Venue = "venue",
}

export interface EventBooking {
  type: BookingType.Event;
  eventId: string;
  seats: number;
}

export interface VenueBooking {
  type: BookingType.Venue;
  venueId: string;
  partnerId: string;
  facilityId: string;
  slotIds: string[];
  activityId: string;
  duration: number;
  startTime: string;
  endTime: string;
  numberOfSlots: number;
}

export enum BookingStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  Refunded = "refunded",
  Failed = "failed",
}

export enum PaymentStatus {
  Initiated = "initiated",
  Paid = "paid",
  Failed = "failed",
  Refunded = "refunded",
}

export interface CustomerDetails {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface PaymentDetails {
  paymentAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  isRefunded?: boolean;
  refundDate?: Date;
  refundTime?: string;
  paymentTransactionTime?: string;
  paymentTransactionId?: string;
}
