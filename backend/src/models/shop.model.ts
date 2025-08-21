import { BookingStatus, PaymentDetails, PaymentStatus } from "./booking.model";


export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  discount: {
    code: string;
    percentage?: number;
    amount?: number;
  }[];
  inventory: number;
  category: string[];
  createdAt?: Date;
  updatedAt?: Date;
  sellerId: string;
}

export interface ShopOrder {
  id?: string;
  products: {
    productId: string;
    quantity: number;
  }[];
  discount: {
    code: string;
    percentage?: number;
    amount?: number;
  }[];
  shippingAddress: ShoppingAddress;
  totalAmount: number;
  totalDiscount: number;
  totalItems: number;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  orderStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentDetails: PaymentDetails;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  sellerIds: string;
}

export interface ShoppingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}