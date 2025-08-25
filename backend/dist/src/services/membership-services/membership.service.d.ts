import { Membership } from "../../models/membership.model";
export declare class MembershipService {
    static createMembership(data: {
        userId: string;
        planId: string;
        creditsGiven: number;
        startedAt: Date;
        transactionOrderId: string | null;
        expiresAt: Date | null;
    }): Promise<string>;
    static getUserMemberships(userId: string): Promise<Membership[]>;
    static getAllActiveMemberships(): Promise<Membership[]>;
    static getMembershipById(id: string): Promise<Membership>;
    static handleMembershipPayment({ success, membershipId, planId, orderId, paymentId }: {
        success: boolean;
        membershipId: string;
        planId: string;
        orderId: string;
        paymentId: string;
        expiresAt: Date | null;
    }): Promise<void>;
    static activateFreeMembership({ membershipId, planId, }: {
        membershipId: string;
        planId: string;
    }): Promise<void>;
}
//# sourceMappingURL=membership.service.d.ts.map