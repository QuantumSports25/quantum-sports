import { Product, ShopOrder, ShopProduct } from "../../models/shop.model";
import { PaymentMethod } from "../../models/payment.model";
export declare class ShopService {
    static getAllProducts(page: number, pageSize: number): Promise<Product[]>;
    static getAllShopOrders(page: number, pageSize: number): Promise<ShopOrder[]>;
    static createProduct(product: Product): Promise<string>;
    static getProductByIds(productIds: string[]): Promise<Product[]>;
    static createOrder(orderData: ShopOrder): Promise<string>;
    static getShopOrderById(id: string): Promise<ShopOrder>;
    static handleShopOrder({ success, shopOrderId, amount, orderId, paymentId, paymentMethod, }: {
        success: boolean;
        shopOrderId: string;
        amount: number;
        orderId: string;
        paymentId: string;
        paymentMethod: PaymentMethod;
    }): Promise<void>;
    static handleShopOrderUpdate(shopOrderId: string, success: boolean, amount: number, orderId: string, paymentId: string, paymentMethod: PaymentMethod): Promise<void>;
    static handleTransactionAfterOrder(shopOrderId: string, orderId: string, paymentId: string, success: boolean, paymentMethod: PaymentMethod): Promise<void>;
    static lockProductInventory(products: ShopProduct[], userId: string): Promise<boolean>;
    static unlockProductInventory(productsData: ShopProduct[], userId: string, success: boolean): Promise<boolean>;
}
//# sourceMappingURL=shop.service.d.ts.map