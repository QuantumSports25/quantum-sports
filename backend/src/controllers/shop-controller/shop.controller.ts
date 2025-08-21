import { Request, Response } from "express";
import { ShopService } from "../../services/shop-services/shop.service";
import { Product, ShopOrder } from "../../models/shop.model";
import products from "razorpay/dist/types/products";

export class ShopController {
  static async createProducts(req: Request, res: Response) {
    try {
      const productData = req.body as Product;

      if (
        !productData.name ||
        !productData.price ||
        !productData.sellerId ||
        !productData.inventory ||
        !productData.discount
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const discount: Product["discount"] =
        productData.discount.length > 0
          ? productData.discount.map((d) => ({
              code: d.code || "",
              percentage: d.percentage || 0,
              amount: d.amount || 0,
            }))
          : [];

      const product: Product = {
        name: productData.name,
        price: productData.price,
        description: productData.description,
        inventory: productData.inventory,
        category: productData.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        sellerId: productData.sellerId,
        discount,
        images: productData.images,
      };

      const newProduct = await ShopService.createProduct(product);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }

  static async createOrderBeforePayment(req: Request, res: Response) {
    try {
      const orderData = req.body as ShopOrder;

      if (
        !orderData.userId ||
        !orderData.products ||
        !orderData.shippingAddress ||
        !orderData.totalAmount ||
        !orderData.totalItems ||
        orderData.totalItems <= 0 ||
        !orderData.totalDiscount ||
        orderData.totalDiscount < 0
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (
        orderData.products.length === 0 ||
        orderData.products.some((p) => !p.productId || p.quantity <= 0)
      ) {
        return res
          .status(400)
          .json({ error: "Product ID and quantity are required" });
      }

      //check inventory
      //check discount status
      //verify shipping address
      //validate discount cal
      // validate total items
      // validate total amount

      // Create order
      const newOrder = await ShopService.createOrder(orderData);
      return res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({ error: "Failed to create order" });
    }
  }
}
