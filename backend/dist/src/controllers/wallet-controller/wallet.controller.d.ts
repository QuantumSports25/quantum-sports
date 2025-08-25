import { Request, Response } from "express";
export declare class WalletController {
    static getWalletBalance(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getUserWallet(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static addCredits(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deductCredits(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getWalletHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=wallet.controller.d.ts.map