export interface Booking {
  id?: string;
  userId: string;
  partnerId: string;
  venueId: string;
  facilityId: string;
  slotIds: string[];
  activityId: string;
  amount: number;
  duration: number;
  startTime: string;
  endTime: string;
  numberOfSlots: number;
  bookedDate: Date;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  customerDetails: customerDetails;
  paymentDetails?: paymentDetails;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface customerDetails {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface paymentDetails {
  paymentAmount: number;
  paymentMethod: string;
  paymentDate: Date;
  isRefunded: boolean;
  refundDate?: Date;
  refundTime?: string;
  paymentTransactionTime?: string;
  paymentTransactionId?: string;
}
