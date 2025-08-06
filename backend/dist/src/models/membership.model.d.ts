export interface MembershipPlan {
    id: string;
    name: string;
    description?: string;
    amount: number;
    credits: number;
    forRole: MembershipRole;
    durationDays?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum MembershipRole {
    User = "user",
    Partner = "partner"
}
export interface Membership {
    id: string;
    userId: string;
    planId: string;
    creditsGiven: number;
    transactionOrderId?: string;
    startedAt: Date;
    expiresAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=membership.model.d.ts.map