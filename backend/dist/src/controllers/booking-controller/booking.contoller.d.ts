import { Request, Response } from "express";
export declare class BookingController {
    static createBookingBeforePayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createBookingPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static verifyPaymentAndBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getBookingById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getBookingsByUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getBookingsByPartner(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static cancelBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=booking.contoller.d.ts.map