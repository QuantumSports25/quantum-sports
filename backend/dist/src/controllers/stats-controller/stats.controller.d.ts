import { Request, Response } from "express";
export declare class StatsController {
    static getAdminDashboardStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getVenueStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getUserGrowthGraph(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getBookingPaymentStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getBookingRevenueGrowthData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getMembershipStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=stats.controller.d.ts.map