export interface Payment {
  orderId: string;
  userId: string;
  bookingId?: string;
  membershipId?: string;
  shopOrderId?: string;
  name?: string;
  paymentAmount: number;
  paymentCurrency: Currency;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  isRefunded: boolean;
  refundDate?: Date;
  captured?: boolean;
  capturedAt?: Date;
  razorpayPaymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export enum Currency {
  INR = "INR",
  USD = "USD",
}

export interface Order {
  id: string;
  entity?: string;
  amount?: number;
  amount_paid?: number;
  amount_due?: number;
  currency?: Currency;
  receipt?: string;
  status?: OrderStatus;
  attempts?: 0;
  notes?: {
    venueId: string;
    customerId: string;
    partnerId: string;
  };
  created_at?: string;
}


export enum OrderStatus {
  Created = "created",
  Attempted = "attempted",
  Paid = "paid"
}

export enum PaymentMethod {
  Razorpay = "Razorpay",
  Wallet = "Wallet",
}

export interface IUiTransaction {
  id: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  bookingId?: string;
  membershipId?: string;
  name: string;
  captured?: boolean;
  capturedAt?: Date;
}