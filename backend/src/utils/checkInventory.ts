import { Product, ShopProduct } from "../models/shop.model";

export const checkInventory = async (
  products: ShopProduct[],
  productsData: Product[]
): Promise<boolean> => {
  if (
    products.length === 0 ||
    products.some((p) => !p.productId || p.quantity <= 0)
  ) {
    throw new Error("Product ID and quantity are required");
  }

  const reqMap = new Map<string, number>();
  products.forEach((p) => reqMap.set(p.productId, p.quantity));

  return productsData.every((p) => {
    const reqQty = reqMap.get(p.id as string);
    return reqQty !== undefined && reqQty <= p.inventory;
  });
};
