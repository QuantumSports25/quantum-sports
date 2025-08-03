import axiosInstance from "../api";

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
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  isRefunded: boolean;
  refundDate?: Date;
  refundTime?: string;
  paymentTransactionTime: string;
  paymentTransactionId: string;
}

export enum PaymentMethod {
  Razorpay = "Razorpay",
  Wallet = "Wallet",
}

export const validateAndCreateBooking = async ({
  userId,
  partnerId,
  venueId,
  facilityId,
  slotIds,
  activityId,
  amount,
  startTime,
  endTime,
  bookedDate,
  paymentMethod = PaymentMethod.Razorpay
}: {
  userId: string;
  partnerId: string;
  venueId: string;
  facilityId: string;
  slotIds: string[];
  activityId: string;
  amount: number;
  startTime: string;
  endTime: string;
  bookedDate: Date;
  paymentMethod: PaymentMethod;
}) => {
  try {
    const booking = {
      userId,
      partnerId,
      venueId,
      facilityId,
      slotIds,
      activityId,
      amount,
      startTime,
      endTime,
      bookedDate,
    };

    const res = await axiosInstance.post(
      `/booking/create-booking-before-payment/${paymentMethod}`,
      booking
    );
    return res.data.data;
  } catch (error) {
    console.error("Error validating booking:", error);
    return false;
  }
};

export const createBookingOrder = async (bookingId: string) => {
  try {
    const res = await axiosInstance.post(`/booking/booking-payment/${bookingId}`);
    return res.data.data;
  } catch (error) {
    console.error("Error creating booking order:", error);
    return false;
  }
};

export const verifyBookingPayment = async (
  {
    bookingId,
    paymentId,
    signature,
    orderId
  }: {
    bookingId: string;
    paymentId?: string;
    signature?: string;
    orderId: string;
  }
) => {
  try {
    const res = await axiosInstance.post(
      `/booking/verify-payment-and-booking/${bookingId}`,
      {
        paymentId,
        signature,
        orderId,
      }
    );
    
    return res.data;
  } catch (error) {
    console.error("Error verifying booking payment:", error);
    throw error; // Re-throw to trigger onError in mutation
  }
};
