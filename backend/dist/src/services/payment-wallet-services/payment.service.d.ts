import { Currency, Payment, PaymentMethod } from "../../models/payment.model";
export declare class PaymentService {
    static createPaymentRazorpay({ amount, bookingId, membershipId, customerId, currency, }: {
        amount: number;
        bookingId?: string;
        membershipId?: string;
        customerId: string;
        currency: Currency;
    }): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    static createTransaction({ orderId, bookingId, membershipId, shopOrderId, amount, currency, paymentMethod, userId }: {
        orderId: string;
        bookingId?: string;
        membershipId?: string;
        shopOrderId?: string;
        amount: number;
        currency: Currency;
        paymentMethod: PaymentMethod;
        userId: string;
    }): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        membershipId: string | null;
        bookingId: string | null;
        orderId: string;
        paymentMethod: string;
        shopOrderId: string | null;
        paymentAmount: import("@prisma/client/runtime/library").Decimal;
        paymentCurrency: string;
        paymentDate: Date;
        isRefunded: boolean;
        refundDate: Date | null;
        captured: boolean | null;
        capturedAt: Date | null;
        razorpayPaymentId: string | null;
    }>;
    static verifyPaymentSignature({ orderId, paymentId, signature, }: {
        orderId: string;
        paymentId: string;
        signature: string;
    }): Promise<boolean>;
    static getTransactionByOrderId(orderId: string): Promise<Payment>;
}
//# sourceMappingURL=payment.service.d.ts.map