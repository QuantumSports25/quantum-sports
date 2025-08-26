import { Request, Response } from "express";
import { ShopService } from "../../services/shop-services/shop.service";
import { Product, ShopOrder } from "../../models/shop.model";
import { checkInventory } from "../../utils/checkInventory";
import {
  BookingStatus,
  CustomerDetails,
  PaymentStatus,
} from "../../models/booking.model";
import { Currency, Order, PaymentMethod } from "../../models/payment.model";
import { AuthService } from "../../services/auth-services/auth.service";
import { WalletService } from "../../services/payment-wallet-services/wallet.services";
import { PaymentService } from "../../services/payment-wallet-services/payment.service";
import { AppError } from "../../types";
import { merge } from "lodash";

export class ShopController {
  static async createProducts(req: Request, res: Response) {
    try {
      const productData = req.body as Product;

      if (
        !productData.name ||
        !productData.price ||
        !productData.sellerId ||
        !productData.inventory
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const product: Product = {
        name: productData.name,
        price: productData.price,
        description: productData.description,
        inventory: productData.inventory,
        category: productData.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        sellerId: productData.sellerId,
        images: productData.images,
      };

      const newProduct = await ShopService.createProduct(product);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productData = req.body as Product;

      if (!id) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingProduct = await ShopService.getProductByIds([id]);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const product =  merge({}, existingProduct, productData);

      const updatedProduct = await ShopService.updateProduct(id, product);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({ error: "Failed to update product" });
    }
  }


  static async getProductsById(req: Request, res: Response) {
    try {
      const { productIds } = req.body as { productIds: string[] };

      if (!productIds || productIds.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      const products = await ShopService.getProductByIds(productIds);

      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ error: "Failed to fetch product" });
    }
  }

  static async getAllProducts(req: Request, res: Response) {
    try {

      const page = parseInt(req.query["page"] as string) || 1;
      const pageSize = parseInt(req.query["pageSize"] as string) || 10;

      const products = await ShopService.getAllProducts(page, pageSize);
      return res.status(200).json(products ?? []);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  static async getAllShopOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query["page"] as string) || 1;
      const pageSize = parseInt(req.query["pageSize"] as string) || 10;

      const orders = await ShopService.getAllShopOrders(page, pageSize);
      return res.status(200).json(orders ?? []);
    } catch (error) {
      console.error("Error fetching shop orders:", error);
      return res.status(500).json({ error: "Failed to fetch shop orders" });
    }
  }

  static async getShopOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Missing order ID" });
      }

      const order = await ShopService.getShopOrderById(id);
      return res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching shop order:", error);
      return res.status(500).json({ error: "Failed to fetch shop order" });
    }
  }

  static async unlockInventoryByOrderId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Missing order ID" });
      }

      const order = await ShopService.getShopOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      await ShopService.unlockProductInventory(order.products, order.userId, false);
      
      return res.status(200).json({ message: "Inventory unlocked successfully" });
    } catch (error) {
      console.error("Error unlocking inventory:", error);
      return res.status(500).json({ error: "Failed to unlock inventory" });
    }
  }

  static async createOrderBeforePayment(req: Request, res: Response) {
    try {
      const orderData = req.body as ShopOrder;
      const paymentMethod = req.params["paymentMethod"] as PaymentMethod;

      if (
        !orderData.userId ||
        !orderData.products ||
        !orderData.shippingAddress ||
        !orderData.totalAmount ||
        !orderData.totalItems ||
        orderData.totalItems <= 0 ||
        !orderData.sellerId
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!Object.values(PaymentMethod).includes(paymentMethod)) {
        return res.status(400).json({ message: "Invalid payment method" });
      }

      const productData = await ShopService.getProductByIds(
        orderData.products.map((p) => p.productId)
      );

      if (!productData) {
        return res.status(404).json({ error: "No Products Data found" });
      }

      if (
        orderData.totalItems !==
        orderData.products.reduce((acc, p) => acc + p.quantity, 0)
      ) {
        return res.status(400).json({ error: "Total items do not match" });
      }

      //check inventory
      if (!checkInventory(orderData.products, productData)) {
        return res.status(400).json({ error: "Insufficient inventory" });
      }

      //verify shipping address
      if (
        !orderData.shippingAddress.addressLine1 ||
        !orderData.shippingAddress.city ||
        !orderData.shippingAddress.postalCode ||
        !orderData.shippingAddress.country
      ) {
        return res.status(400).json({ error: "Invalid shipping address" });
      }

      // Validate total amount
      if (
        orderData.totalAmount !==
        orderData.products.reduce((acc, p) => {
          const product = productData.find((prod) => prod.id === p.productId);
          return acc + (product ? product.price * p.quantity : 0);
        }, 0)
      ) {
        return res.status(400).json({ error: "Total amount does not match" });
      }

      const user = await AuthService.getUserById(orderData.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await ShopService.lockProductInventory(orderData.products, user.id);

      const customerDetails: CustomerDetails = {
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email ?? "",
        customerPhone: user.phone ?? "",
      };

      const order: ShopOrder = {
        products: orderData.products,
        shippingAddress: orderData.shippingAddress,
        totalAmount: orderData.totalAmount,
        totalItems: orderData.totalItems,
        confirmedAt: new Date(),
        orderStatus: BookingStatus.Pending,
        paymentStatus: PaymentStatus.Initiated,
        customerDetails: customerDetails,
        paymentDetails: {
          paymentAmount: orderData.totalAmount,
          paymentMethod: paymentMethod,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: orderData.userId,
        sellerId: orderData.sellerId,
      };

      // Create order
      const newOrder = await ShopService.createOrder(order);
      return res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({ error: "Failed to create order" });
    }
  }

  static async createBookingPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Booking ID is required" });
      }

      const shopOrder = await ShopService.getShopOrderById(id);

      if (
        !shopOrder ||
        shopOrder?.paymentStatus !== PaymentStatus.Initiated ||
        shopOrder.orderStatus !== BookingStatus.Pending
      ) {
        return res.status(400).json({
          message: "Payment has already been initiated for this booking",
        });
      }

      if (!shopOrder.paymentDetails || !shopOrder.paymentDetails) {
        return res.status(400).json({ message: "Payment method is required" });
      }

      let orderData: Order | null = null;
      //wallet flow
      switch (shopOrder.paymentDetails.paymentMethod) {
        case PaymentMethod.Wallet:
          await WalletService.deductCredits(
            shopOrder.userId,
            shopOrder.totalAmount
          );
          orderData = {
            id: `order-${Math.random()
              .toString(36)
              .slice(2)
              .padEnd(12, "0")
              .slice(0, 12)}`,
            receipt: shopOrder.id as string,
          };
          break;

        case PaymentMethod.Razorpay:
          const order = await PaymentService.createPaymentRazorpay({
            amount: shopOrder.totalAmount,
            bookingId: shopOrder.id as string,
            customerId: shopOrder.customerDetails.customerId,
            currency: Currency.INR,
          });

          orderData = {
            id: order.id,
            receipt: order.receipt as string,
          };
          break;
      }

      if (!orderData) {
        throw new Error("Failed to create Razorpay order");
      }

      const transaction = await PaymentService.createTransaction({
        orderId: orderData.id,
        bookingId: shopOrder.id as string,
        amount: shopOrder.totalAmount,
        currency: Currency.INR,
        paymentMethod: shopOrder.paymentDetails.paymentMethod as PaymentMethod,
        userId: shopOrder.userId,
      });

      if (!transaction) {
        //transaction is not created
        // inform on whatsapp
      }

      return res.status(200).json({ data: orderData });
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      return res.status(500).json({
        message: "Failed to create Razorpay order ",
        error: error.message,
      });
    }
  }

  static async verifyPaymentAndShopOrder(req: Request, res: Response) {
      try {
        const { id } = req.params;
        let { paymentId } = req.body as {
          paymentId?: string;
        };
  
        const { signature, orderId } = req.body as {
          signature: string;
          orderId: string;
        };
  
        if (!id || !orderId) {
          return res
            .status(400)
            .json({ message: "shopOrder ID and Order ID are required" });
        }

        const shopOrder = await ShopService.getShopOrderById(id);

        if (!shopOrder) {
          return res.status(404).json({ message: "Shop order not found" });
        }
  
        const paymentMethod =
          shopOrder.paymentDetails?.paymentMethod === PaymentMethod.Razorpay
            ? PaymentMethod.Razorpay
            : PaymentMethod.Wallet;
  
        let verified = false;
        if (paymentMethod == PaymentMethod.Wallet) {
          const transaction = await PaymentService.getTransactionByOrderId(
            orderId
          );
  
          if (!transaction) {
            throw new Error("Payment verification failed");
          }
          paymentId = "pay" + transaction.orderId;
          verified = true;
        } else {
          if (!paymentId || !signature || !orderId) {
            return res
              .status(400)
              .json({ message: "Payment details are missing" });
          }
  
          if (
            !shopOrder ||
            shopOrder.paymentStatus !== PaymentStatus.Initiated ||
            shopOrder.orderStatus !== BookingStatus.Pending
          ) {
            return res.status(400).json({ message: "Invalid booking state" });
          }
  
          verified = await PaymentService.verifyPaymentSignature({
            paymentId,
            signature,
            orderId,
          });
        }
  
        if (!verified) {
          ShopService.handleShopOrder({
            success: false,
            shopOrderId: id,
            amount: shopOrder.totalAmount,
            orderId,
            paymentId,
            paymentMethod,
          });
          throw new Error("Payment verification failed");
        }

        ShopService.handleShopOrder({
          success: true,
          shopOrderId: id,
          amount: shopOrder.totalAmount,
          orderId,
          paymentId,
          paymentMethod,
        });
  
        return res.status(200).json({ message: "Payment verified successfully" });
      } catch (error) {
        console.error("Error confirming booking:", error);
        const appError = error as AppError;
        return res.status(500).json({
          message: "Failed to confirm booking",
          error: appError.message || "Unknown error",
        });
      }
    }
}
