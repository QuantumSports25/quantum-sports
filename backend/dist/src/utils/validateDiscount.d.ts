import { Product } from "../models/shop.model";
declare const validateDiscount: (discounts: {
    code: string;
    percentage?: number;
    amount?: number;
}[], productsData: Product[]) => Promise<boolean>;
export default validateDiscount;
//# sourceMappingURL=validateDiscount.d.ts.map