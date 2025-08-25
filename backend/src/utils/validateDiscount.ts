import { Product } from "../models/shop.model";

type DiscountRequest = { productId: string; code: string; percentage?: number; amount?: number };

const validateDiscount = async (
  discounts: DiscountRequest[],
  productsData: Product[]
): Promise<boolean> => {
  if (
    discounts.length === 0 ||
    discounts.some(
      (d) => !d.productId || !d.code || (d.percentage === undefined && d.amount === undefined)
    )
  ) {
    throw new Error("Discount productId, code, percentage, and amount are required");
  }

  // Map: productId -> code -> discount details
  const reqMap = new Map<string, Map<string, { percentage?: number; amount?: number }>>();
  discounts.forEach((d) => {
    if (!reqMap.has(d.productId)) reqMap.set(d.productId, new Map());
    const discountObj: { percentage?: number; amount?: number } = {};
    if (d.percentage !== undefined) discountObj.percentage = d.percentage;
    if (d.amount !== undefined) discountObj.amount = d.amount;
    reqMap.get(d.productId)!.set(d.code, discountObj);
  });

  return productsData.every((p) => {
    if (!p.discount || !Array.isArray(p.discount)) return false;
    const productDiscounts = reqMap.get(p.id as string);
    if (!productDiscounts) return false;

    // For each requested discount, check if it exists and is valid
    for (const [code, reqDiscount] of productDiscounts.entries()) {
      const prodDiscount = p.discount.find((disc) => disc.code === code);
      if (!prodDiscount) return false;

      const amountOk =
        reqDiscount.amount === undefined ||
        (prodDiscount.amount !== undefined && reqDiscount.amount <= prodDiscount.amount);

      const percentageOk =
        reqDiscount.percentage === undefined ||
        (prodDiscount.percentage !== undefined && reqDiscount.percentage <= prodDiscount.percentage);

      if (!amountOk || !percentageOk) return false;
    }
    return true;
  });
};

export default validateDiscount;