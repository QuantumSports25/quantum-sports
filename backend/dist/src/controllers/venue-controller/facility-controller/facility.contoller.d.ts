import { Request, Response } from "express";
export declare class FacilityController {
    static createFacility(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFacilitiesByActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFacilityById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateFacility(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteFacility(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=facility.contoller.d.ts.map