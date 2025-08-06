import { Request, Response } from 'express';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static sendLoginOTP(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static verifyOTP(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static registerPartner(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static partnerLogin(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=auth.controller.d.ts.map