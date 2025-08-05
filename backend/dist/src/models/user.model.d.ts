export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    partnerDetails?: partnerDetails;
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
//# sourceMappingURL=user.model.d.ts.map