import { Request, Response } from "express";
export declare class MembershipPlanController {
    static getAllMembershipPlans(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getActiveMembershipPlans(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getMembershipPlanById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createMembershipPlan(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateMembershipPlan(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteMembershipPlan(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=membershipPlan.controller.d.ts.map