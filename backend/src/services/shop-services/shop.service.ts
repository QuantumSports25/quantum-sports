import { Prisma, PrismaClient } from "@prisma/client";
import {
  Product,
  ShopInventoryLock,
  ShopOrder,
  ShoppingAddress,
  ShopProduct,
} from "../../models/shop.model";
import {
  BookingStatus,
  CustomerDetails,
  PaymentDetails,
  PaymentStatus,
} from "../../models/booking.model";
import { PaymentMethod } from "../../models/payment.model";
import { withRetries } from "../../utils/retryFunction";

const prisma = new PrismaClient();

export class ShopService {

  static async updateProduct(id: string, product: Product) {
    try {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name: product.name,
          price: product.price,
          description: product.description,
          inventory: product.inventory,
          category: product.category,
          updatedAt: new Date(),
          sellerId: product.sellerId,
          images: product.images,
        },
      });
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  static async getAllProducts(page: number, pageSize: number) {
    try {
      const products = await prisma.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      const productData: Product[] = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        inventory: product.inventory,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        sellerId: product.sellerId,
      }));
      return productData;
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw error;
    }
  }

  static async getAllShopOrders(page: number, pageSize: number) {
    try {
      const orders = await prisma.shopOrder.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      const orderData: ShopOrder[] = orders.map((order) => ({
        id: order.id,
        userId: order.userId,
        totalAmount: order.totalAmount,
        sellerId: order.sellerId,
        totalItems: order.totalItems,
        customerDetails: order.customerDetails as unknown as CustomerDetails,
        products: order.products as unknown as ShopProduct[],
        shippingAddress: order.shippingAddress as unknown as ShoppingAddress,
        orderStatus: order.orderStatus as unknown as BookingStatus,
        paymentStatus: order.paymentStatus as unknown as PaymentStatus,
        paymentDetails: order.paymentDetails as unknown as PaymentDetails,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));
      return orderData;
    } catch (error) {
      console.error("Error fetching all shop orders:", error);
      throw error;
    }
  }

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
          images: product.images,
        },
      });
      return newProduct.id;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  static async getProductByIds(productIds: string[]) {
    try {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const productData: Product[] = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        inventory: product.inventory,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        sellerId: product.sellerId,
      }));
      return productData;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  static async createOrder(orderData: ShopOrder) {
    try {
      const order = await prisma.shopOrder.create({
        data: {
          userId: orderData.userId,
          totalAmount: orderData.totalAmount,
          sellerId: orderData.sellerId,
          totalItems: orderData.totalItems,
          customerDetails:
            orderData.customerDetails as unknown as Prisma.ShopOrderCreateInput["customerDetails"],
          products:
            orderData.products as unknown as Prisma.ShopOrderCreateInput["products"],
          shippingAddress:
            orderData.shippingAddress as unknown as Prisma.ShopOrderCreateInput["shippingAddress"],
          orderStatus:
            orderData.orderStatus as unknown as Prisma.ShopOrderCreateInput["orderStatus"],
          paymentStatus:
            orderData.paymentStatus as unknown as Prisma.ShopOrderCreateInput["paymentStatus"],
          paymentDetails:
            orderData.paymentDetails as unknown as Prisma.ShopOrderCreateInput["paymentDetails"],
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

  static async getShopOrderById(id: string) {
    try {
      const order = await prisma.shopOrder.findUnique({
        where: { id },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      const newOrder: ShopOrder = {
        id: order.id,
        userId: order.userId,
        totalAmount: order.totalAmount,
        sellerId: order.sellerId,
        totalItems: order.totalItems,
        products: order.products as unknown as ShopProduct[],
        shippingAddress: order.shippingAddress as unknown as ShoppingAddress,
        orderStatus: order.orderStatus as unknown as BookingStatus,
        paymentStatus: order.paymentStatus as unknown as PaymentStatus,
        paymentDetails: order.paymentDetails as unknown as PaymentDetails,
        customerDetails: order.customerDetails as unknown as CustomerDetails,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };

      return newOrder;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  static async handleShopOrder({
    success,
    shopOrderId,
    amount,
    orderId,
    paymentId,
    paymentMethod,
  }: {
    success: boolean;
    shopOrderId: string;
    amount: number;
    orderId: string;
    paymentId: string;
    paymentMethod: PaymentMethod;
  }) {
    try {
      // Step 1: Try transactional logic (retry 3 times)
      await withRetries(
        async () => {
          await prisma.$transaction(async (tx) => {
            const shopOrder = (await tx.shopOrder.findUnique({
              where: { id: shopOrderId },
            })) as unknown as ShopOrder;
            if (
              !shopOrder ||
              shopOrder.paymentStatus === PaymentStatus.Paid ||
              shopOrder.orderStatus === BookingStatus.Confirmed
            ) {
              return;
            }

            if (success) {
              await tx.shopOrder.update({
                where: { id: shopOrderId },
                data: {
                  confirmedAt: new Date(),
                  orderStatus: BookingStatus.Confirmed,
                  paymentStatus: PaymentStatus.Paid,
                  paymentDetails: {
                    paymentAmount: amount,
                    paymentMethod: paymentMethod,
                    paymentDate: new Date(),
                    isRefunded: false,
                    razorpayOrderId: orderId,
                    razorpayPaymentId: paymentId,
                  },
                },
              });

              await this.unlockProductInventory(
                shopOrder.products,
                shopOrder.userId,
                success
              );

              await tx.transactionHistory.update({
                where: { orderId },
                data: {
                  captured: true,
                  capturedAt: new Date(),
                  razorpayPaymentId: paymentId,
                  name:
                    (shopOrder?.products?.[0]?.name ?? "") +
                    (shopOrder?.products?.[0]?.quantity ?? ""),
                },
              });
            } else {
              await tx.shopOrder.update({
                where: { id: shopOrderId },
                data: {
                  paymentStatus: PaymentStatus.Failed,
                  orderStatus: BookingStatus.Failed,
                  paymentDetails: {
                    paymentAmount: amount,
                    paymentMethod: paymentMethod,
                    paymentDate: new Date(),
                    isRefunded: false,
                    razorpayOrderId: orderId,
                  },
                },
              });

              await this.unlockProductInventory(
                shopOrder.products,
                shopOrder.userId,
                false
              );

              await tx.transactionHistory.update({
                where: { orderId },
                data: {
                  isRefunded: false,
                  captured: false,
                  name:
                    (shopOrder?.products?.[0]?.name ?? "") +
                    (shopOrder?.products?.[0]?.quantity ?? ""),
                },
              });
            }
          });
        },
        3,
        1000
      ); // Retry transactional part 3 times
    } catch (error) {
      console.error("Transaction failed after retries:", error);
      const fallbackStatus = {
        shopOrderStatus: false,
        inventoryStatus: false,
        transactionStatus: false,
      };

      await withRetries(
        async () => {
          const fallbackTasks: Promise<any>[] = [];

          if (!fallbackStatus.shopOrderStatus) {
            fallbackTasks.push(
              this.handleShopOrderUpdate(
                shopOrderId,
                success,
                amount,
                orderId,
                paymentId,
                paymentMethod
              )
            );
          }

          if (!fallbackStatus.inventoryStatus) {
            const shopOrder = (await prisma.shopOrder.findUnique({
              where: { id: shopOrderId },
            })) as unknown as ShopOrder;
            fallbackTasks.push(
              this.unlockProductInventory(
                shopOrder.products,
                shopOrder.userId,
                false
              )
            );
          }

          if (!fallbackStatus.transactionStatus) {
            fallbackTasks.push(
              this.handleTransactionAfterOrder(
                shopOrderId,
                orderId,
                paymentId,
                success,
                paymentMethod
              )
            );
          }

          const results = await Promise.allSettled(fallbackTasks);
          console.log("Fallback cleanup results:", results);

          // Update fallbackStatus based on result of each promise
          results.forEach((result, index) => {
            if (result.status === "fulfilled") {
              if (index === 0) fallbackStatus.shopOrderStatus = true;
              if (index === 1) fallbackStatus.transactionStatus = true;
            } else {
              console.warn(`Fallback step ${index} failed:`, result.reason);
            }
          });
        },
        3,
        1000
      ).catch((fallbackError) => {
        console.error("Fallback retry failed:", fallbackError);
        // Optional: Alert/log to external service (Sentry, Slack, etc.)
      });
    }
  }

  static async handleShopOrderUpdate(
    shopOrderId: string,
    success: boolean,
    amount: number,
    orderId: string,
    paymentId: string,
    paymentMethod: PaymentMethod
  ) {
    try {
      if (success) {
        await prisma.shopOrder.update({
          where: { id: shopOrderId },
          data: {
            confirmedAt: new Date(),
            orderStatus: BookingStatus.Confirmed,
            paymentStatus: PaymentStatus.Paid,
            paymentDetails: {
              paymentAmount: amount,
              paymentMethod: paymentMethod,
              paymentDate: new Date(),
              isRefunded: false,
              razorpayOrderId: orderId,
              razorpayPaymentId: paymentId,
            },
          },
        });
      } else {
        await prisma.shopOrder.update({
          where: { id: shopOrderId },
          data: {
            paymentStatus: PaymentStatus.Failed,
            orderStatus: BookingStatus.Failed,
            paymentDetails: {
              paymentAmount: amount,
              paymentMethod: paymentMethod,
              paymentDate: new Date(),
              isRefunded: false,
              razorpayOrderId: orderId,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error handling booking update:", error);
      throw error;
    }
  }

  static async handleTransactionAfterOrder(
    shopOrderId: string,
    orderId: string,
    paymentId: string,
    success: boolean,
    paymentMethod: PaymentMethod
  ) {
    try {
      const shopOrder = await prisma.shopOrder.findUnique({
        where: { id: shopOrderId },
      });

      if (success) {
        await prisma.transactionHistory.update({
          where: { orderId },
          data: {
            captured: true,
            capturedAt: new Date(),
            razorpayPaymentId: paymentId,
            paymentMethod: paymentMethod,
            isRefunded: false,
            name:
              ((shopOrder as unknown as ShopOrder)?.products?.[0]?.name ?? "") +
              ((shopOrder as unknown as ShopOrder)?.products?.[0]?.quantity ??
                ""),
          },
        });
      } else {
        await prisma.transactionHistory.update({
          where: { orderId },
          data: {
            captured: false,
            isRefunded: false,
            paymentMethod: paymentMethod,
            name:
              ((shopOrder as unknown as ShopOrder)?.products?.[0]?.name ?? "") +
              ((shopOrder as unknown as ShopOrder)?.products?.[0]?.quantity ??
                ""),
          },
        });
      }
    } catch (error) {
      console.error("Error handling transaction after booking:", error);
      throw error;
    }
  }

  static async lockProductInventory(products: ShopProduct[], userId: string) {
    try {
      await prisma.$transaction(async (tx) => {
        for (const product of products) {
          // Fetch current product
          const dbProduct = await tx.product.findUnique({
            where: { id: product.productId },
          });
          if (!dbProduct) throw new Error("Product not found");

          if (dbProduct.inventory < product.quantity) {
            throw new Error(
              `Insufficient inventory for product ${dbProduct.name}`
            );
          }

          // Prepare new lock array
          let lockArr = dbProduct.lock as unknown as ShopInventoryLock[];
          let found = false;
          lockArr = (lockArr as []).map((lock: ShopInventoryLock) => {
            if (lock?.userId === userId) {
              found = true;
              return {
                userId: userId,
                quantity: product.quantity,
                lockedAt: new Date(),
              };
            }
            return lock;
          });

          if (!found) {
            lockArr.push({
              userId,
              quantity: product.quantity,
              lockedAt: new Date(),
            });
          }

          await tx.product.update({
            where: { id: product.productId },
            data: {
              inventory: { decrement: product.quantity },
              lock: lockArr as unknown as Prisma.InputJsonValue,
            },
          });
        }
      });
      return true;
    } catch (error) {
      console.error("Error locking inventory:", error);
      throw error;
    }
  }

  static async unlockProductInventory(
    productsData: ShopProduct[],
    userId: string,
    success: boolean
  ) {
    try {
      await prisma.$transaction(async (tx) => {
        // Get all products by id
        const ids = productsData.map((p) => p.productId);
        const products = await tx.product.findMany({
          where: { id: { in: ids } },
        });

        await Promise.all(
          products.map(async (product) => {
            // Get current lock array
            const lockArr = product.lock as unknown as ShopInventoryLock[];
            // Find the lock for this user
            const userLock = (lockArr || []).find(
              (lock) => lock.userId === userId
            );

            // Remove the lock entry for this user
            const newLockArr = (lockArr || []).filter(
              (lock) => lock.userId !== userId
            );

            // If success, increment inventory by locked quantity
            const updateData: any = {
              lock: newLockArr as unknown as Prisma.InputJsonValue,
            };
            if (success && userLock) {
              updateData.inventory = { increment: userLock.quantity };
            }

            await tx.product.update({
              where: { id: product.id },
              data: updateData,
            });
          })
        );
      });

      return true;
    } catch (error) {
      console.error("Error unlocking inventory:", error);
      return false;
    }
  }
}
