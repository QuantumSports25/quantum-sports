import { Prisma } from "@prisma/client";
import { Booking, BookingStatus, BookingType, PaymentStatus } from "../../models/booking.model";
import { PaymentMethod } from "../../models/payment.model";
export declare class BookingService {
    static createBooking: (booking: Booking) => {
        userId: string;
        type: BookingType;
        bookingData: Prisma.InputJsonValue;
        amount: number;
        bookedDate: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
        bookingStatus: BookingStatus;
        paymentStatus: PaymentStatus;
        customerDetails: Prisma.InputJsonValue;
        paymentDetails: Prisma.InputJsonValue;
    };
    static createVenueBookingBeforePayment(booking: Booking): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentDetails: Prisma.JsonValue | null;
        amount: Prisma.Decimal;
        type: string | null;
        bookingData: Prisma.JsonValue | null;
        bookedDate: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
        bookingStatus: import(".prisma/client").$Enums.BookingStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        customerDetails: Prisma.JsonValue;
    }>;
    static getBookingById(id: string): Promise<Booking>;
    static getBookingsByUserId(userId: string): Promise<({
        slots: {
            id: string;
            amount: Prisma.Decimal;
            date: Date;
            startTime: string;
            endTime: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentDetails: Prisma.JsonValue | null;
        amount: Prisma.Decimal;
        type: string | null;
        bookingData: Prisma.JsonValue | null;
        bookedDate: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
        bookingStatus: import(".prisma/client").$Enums.BookingStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        customerDetails: Prisma.JsonValue;
    })[]>;
    static cancelBooking(id: string, _cancellationReason?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentDetails: Prisma.JsonValue | null;
        amount: Prisma.Decimal;
        type: string | null;
        bookingData: Prisma.JsonValue | null;
        bookedDate: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
        bookingStatus: import(".prisma/client").$Enums.BookingStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        customerDetails: Prisma.JsonValue;
    }>;
    static handleBooking({ success, bookingId, amount, orderId, paymentId, paymentMethod, type, }: {
        success: boolean;
        bookingId: string;
        amount: number;
        orderId: string;
        paymentId: string;
        paymentMethod: PaymentMethod;
        type: BookingType;
    }): Promise<void>;
    static handleSlotAfterBooking(bookingId: string, success: boolean): Promise<void>;
    static handleTransactionAfterBooking(bookingId: string, orderId: string, paymentId: string, success: boolean, paymentMethod: PaymentMethod): Promise<void>;
    static handleBookingUpdate(bookingId: string, success: boolean, amount: number, orderId: string, paymentId: string, paymentMethod: PaymentMethod): Promise<void>;
    static getBookingsByPartnerId(partnerId: string): Promise<({
        slots: {
            id: string;
            amount: Prisma.Decimal;
            date: Date;
            startTime: string;
            endTime: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentDetails: Prisma.JsonValue | null;
        amount: Prisma.Decimal;
        type: string | null;
        bookingData: Prisma.JsonValue | null;
        bookedDate: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
        bookingStatus: import(".prisma/client").$Enums.BookingStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        customerDetails: Prisma.JsonValue;
    })[]>;
}
//# sourceMappingURL=booking.service.d.ts.map