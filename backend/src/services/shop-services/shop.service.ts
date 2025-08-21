import { Prisma, PrismaClient } from "@prisma/client";
import { Product, ShopOrder } from "../../models/shop.model";

const prisma = new PrismaClient();

export class ShopService {
  static async createProduct(product: Product) {
    try {
      const newProduct = await prisma.product.create({
        data: {
          name: product.name,
          price: product.price,
          description: product.description,
          inventory: product.inventory,
          category: product.category,
          createdAt: new Date(),
          updatedAt: new Date(),
          sellerId: product.sellerId,
          discount:
            product.discount as unknown as Prisma.ProductCreateInput["discount"],
          images: product.images,
        },
      });
      return newProduct.id;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  static async createOrder(orderData: ShopOrder) {
    try {
      const order = await prisma.shopOrder.create({
        data: {
          userId: orderData.userId,
          totalAmount: orderData.totalAmount,
          sellerId: orderData.sellerIds,
          totalDiscount: orderData.totalDiscount,
          totalItems: orderData.totalItems,
          products:
            orderData.products as unknown as Prisma.ShopOrderCreateInput["products"],
          discount:
            orderData.discount as unknown as Prisma.ShopOrderCreateInput["discount"],
          shippingAddress:
            orderData.shippingAddress as unknown as Prisma.ShopOrderCreateInput["shippingAddress"],
          orderStatus: orderData.orderStatus as unknown as Prisma.ShopOrderCreateInput["orderStatus"],
          paymentStatus: orderData.paymentStatus as unknown as Prisma.ShopOrderCreateInput["paymentStatus"],
          paymentDetails: orderData.paymentDetails as unknown as Prisma.ShopOrderCreateInput["paymentDetails"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return order.id;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }
}
