import { Request, Response } from "express";
export declare class ShopController {
    static createProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getProductsById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAllProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAllShopOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getShopOrderById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static unlockInventoryByOrderId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createOrderBeforePayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createBookingPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static verifyPaymentAndShopOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=shop.controller.d.ts.map