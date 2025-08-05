import { Request, Response } from "express";
export declare class MembershipController {
    static createMembershipBeforePayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createMembershipOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static verifyMembershipPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getUserMemberships(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static seedMembershipPlans(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=membership.controller.d.ts.map