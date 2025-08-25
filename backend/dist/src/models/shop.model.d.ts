import { BookingStatus, CustomerDetails, PaymentDetails, PaymentStatus } from "./booking.model";
export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    inventory: number;
    lock?: ShopInventoryLock[];
    category: string[];
    createdAt?: Date;
    updatedAt?: Date;
    sellerId: string;
}
export interface ShopInventoryLock {
    quantity: number;
    userId: string;
    lockedAt: Date;
}
export interface ShopOrder {
    id?: string;
    products: ShopProduct[];
    shippingAddress: ShoppingAddress;
    totalAmount: number;
    totalItems: number;
    confirmedAt?: Date;
    cancelledAt?: Date;
    completedAt?: Date;
    orderStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    paymentDetails: PaymentDetails;
    customerDetails: CustomerDetails;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    sellerId: string;
}
export interface ShopProduct {
    productId: string;
    quantity: number;
    name: string;
}
export interface ShoppingAddress {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
}
//# sourceMappingURL=shop.model.d.ts.map