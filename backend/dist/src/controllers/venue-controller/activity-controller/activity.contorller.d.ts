import { Request, Response } from "express";
export declare class ActivityController {
    static createActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getActivitiesByVenue(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getActivityById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=activity.contorller.d.ts.map