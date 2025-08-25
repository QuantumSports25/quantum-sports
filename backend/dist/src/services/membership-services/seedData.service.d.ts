export declare class SeedDataService {
    static seedMembershipPlans(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
        amount: number;
        credits: number;
        forRole: import(".prisma/client").$Enums.UserRole;
        durationDays: number;
    }[]>;
    static seedAllData(): Promise<void>;
}
//# sourceMappingURL=seedData.service.d.ts.map