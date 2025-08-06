import { Prisma } from "@prisma/client";
import { Booking } from "../../models/booking.model";
export declare class BookingService {
    static createBookingBeforePayment(booking: Booking): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        venueId: string;
        partnerId: string;
        activityId: string;
        facilityId: string;
        amount: Prisma.Decimal;
        duration: number;
        startTime: string;
        endTime: string;
        numberOfSlots: number;
        bookedDate: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
        paymentDetails: Prisma.JsonValue | null;
        bookingStatus: import(".prisma/client").$Enums.BookingStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        customerDetails: Prisma.JsonValue;
    }>;
    static getBookingById(id: string): Promise<Booking>;
    static getBookingsByUserId(userId: string): Promise<({
        slots: {
            id: string;
            amount: Prisma.Decimal;
            startTime: string;
            endTime: string;
            date: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        venueId: string;
        partnerId: string;
        activityId: string;
        facilityId: string;
        amount: Prisma.Decimal;
        duration: number;
        startTime: string;
        endTime: string;
        numberOfSlots: number;
        bookedDate: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
        paymentDetails: Prisma.JsonValue | null;
        bookingStatus: import(".prisma/client").$Enums.BookingStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        customerDetails: Prisma.JsonValue;
    })[]>;
    static cancelBooking(id: string, _cancellationReason?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        venueId: string;
        partnerId: string;
        activityId: string;
        facilityId: string;
        amount: Prisma.Decimal;
        duration: number;
        startTime: string;
        endTime: string;
        numberOfSlots: number;
        bookedDate: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
        paymentDetails: Prisma.JsonValue | null;
        bookingStatus: import(".prisma/client").$Enums.BookingStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        customerDetails: Prisma.JsonValue;
    }>;
    static handleBooking({ success, bookingId, amount, orderId, paymentId, }: {
        success: boolean;
        bookingId: string;
        amount: number;
        orderId: string;
        paymentId: string;
    }): Promise<void>;
    static handleSlotAfterBooking(bookingId: string, success: boolean): Promise<void>;
    static handleTransactionAfterBooking(orderId: string, paymentId: string, success: boolean): Promise<void>;
    static handleBookingUpdate(bookingId: string, success: boolean, amount: number, orderId: string, paymentId: string): Promise<void>;
}
//# sourceMappingURL=booking.service.d.ts.map