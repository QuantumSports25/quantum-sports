import { MembershipPlan, MembershipRole } from "../../models/membership.model";
export declare class MembershipPlanService {
    static getAllMembershipPlans(orderBy?: "asc" | "desc"): Promise<MembershipPlan[]>;
    static getActiveMembershipPlans(): Promise<MembershipPlan[]>;
    static getMembershipPlanByName(namePattern: string): Promise<MembershipPlan>;
    static getMembershipPlanById(id: string): Promise<MembershipPlan>;
    static createMembershipPlan({ name, description, amount, durationDays, forRole, credits, isActive, }: {
        name: string;
        description: string;
        amount: number;
        durationDays: number;
        forRole: MembershipRole;
        credits: number;
        isActive: boolean;
    }): Promise<MembershipPlan>;
    static updateMembershipPlan(id: string, data: {
        name?: string;
        description?: string;
        amount?: number;
        durationDays?: number;
        forRole?: MembershipRole;
        credits?: number;
        isActive?: boolean;
    }): Promise<MembershipPlan | null>;
    static deleteMembershipPlan(id: string): Promise<string>;
}
//# sourceMappingURL=membershipPlan.service.d.ts.map