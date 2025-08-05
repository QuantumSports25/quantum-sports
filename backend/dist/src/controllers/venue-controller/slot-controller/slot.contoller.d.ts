import { Request, Response } from "express";
export declare class SlotController {
    static createSlot(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createSlots(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getSlotsByFacilityId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getSlotsByDateRangeAndFacilityId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateSlot(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteSlot(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateSlots(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static checkSlotAvailability(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static checkMultipleSlotsAvailability(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAvailableSlotsByFacilityAndDate(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateSlotsWithDifferentData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static unlockSlots(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=slot.contoller.d.ts.map