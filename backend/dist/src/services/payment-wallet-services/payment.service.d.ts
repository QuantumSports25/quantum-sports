import { Currency, Payment, PaymentMethod } from "../../models/payment.model";
export declare class PaymentService {
    static createPaymentRazorpay({ amount, bookingId, membershipId, customerId, currency, }: {
        amount: number;
        bookingId?: string;
        membershipId?: string;
        venueId?: string;
        customerId: string;
        partnerId?: string;
        currency: Currency;
    }): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    static createTransaction({ orderId, bookingId, membershipId, amount, currency, paymentMethod, }: {
        orderId: string;
        bookingId?: string;
        membershipId?: string;
        amount: number;
        currency: Currency;
        paymentMethod: PaymentMethod;
    }): Promise<{
        createdAt: Date;
        updatedAt: Date;
        bookingId: string | null;
        orderId: string;
        membershipId: string | null;
        paymentAmount: import("@prisma/client/runtime/library").Decimal;
        paymentCurrency: string;
        paymentMethod: string;
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