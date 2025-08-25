import { ShoppingAddress } from "./shop.model";
export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    partnerDetails?: partnerDetails;
    membership?: MembershipSummary;
    shippingAddress: ShoppingAddress[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    PARTNER = "partner"
}
export interface partnerDetails {
    id: string;
    companyName: string;
    subscriptionType: subscriptionType;
    gstNumber?: string | null;
    websiteUrl?: string | null;
}
export declare enum subscriptionType {
    REVNUE = "revnue_share",
    MEMBERSHIP = "membership"
}
export interface MembershipSummary {
    id: string;
    planId: string;
    planName: string;
    amount: number;
    credits: number;
    startedAt: Date;
    expiresAt?: Date | null;
    isActive: boolean;
}
//# sourceMappingURL=user.model.d.ts.map