import { Slot, SlotAvailability } from "../../models/venue.model";
export declare class SlotService {
    static createSlot(slot: Slot): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        availability: import(".prisma/client").$Enums.SlotAvailability;
        startTime: string;
        endTime: string;
        facilityId: string;
        bookingId: string | null;
    }>;
    static createMultipleSlots(startDate: Date, endDate: Date, startTime: string, endTime: string, facilityId: string, amount: number, availability?: SlotAvailability): Promise<{
        count: number;
    }>;
    static getSlotsByFacilityId(facilityId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        availability: import(".prisma/client").$Enums.SlotAvailability;
        startTime: string;
        endTime: string;
        facilityId: string;
        bookingId: string | null;
    }[]>;
    static getSlotsByDateRangeAndFacilityId(startDate: string, endDate: string, facilityId: string, sortType: "asc" | "desc"): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        availability: import(".prisma/client").$Enums.SlotAvailability;
        startTime: string;
        endTime: string;
        facilityId: string;
        bookingId: string | null;
    }[]>;
    static getAvailableSlotsByFacilityAndDate(facilityId: string, startDate: string, endDate: string, sortType: "asc" | "desc"): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        availability: import(".prisma/client").$Enums.SlotAvailability;
        startTime: string;
        endTime: string;
        facilityId: string;
        bookingId: string | null;
    }[]>;
    static updateSlot(id: string, slot: Slot): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        availability: import(".prisma/client").$Enums.SlotAvailability;
        startTime: string;
        endTime: string;
        facilityId: string;
        bookingId: string | null;
    }>;
    static deleteSlot(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        availability: import(".prisma/client").$Enums.SlotAvailability;
        startTime: string;
        endTime: string;
        facilityId: string;
        bookingId: string | null;
    }>;
    static getSlotById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        availability: import(".prisma/client").$Enums.SlotAvailability;
        startTime: string;
        endTime: string;
        facilityId: string;
        bookingId: string | null;
    } | null>;
    static areAllSlotsAvailable(slotIds: string[]): Promise<boolean>;
    static updateSlots(slots: Slot[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    static unlockSlots(ids: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
//# sourceMappingURL=slot.service.d.ts.map