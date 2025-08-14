import { Request, Response } from "express";
export declare class EventController {
    static createEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getEventById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAllEvents(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getEventsByCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static archiveEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=event.controller.d.ts.map