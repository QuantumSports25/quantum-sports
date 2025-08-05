import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const optionalAuthMiddleware: (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map