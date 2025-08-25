"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopService = void 0;
const client_1 = require("@prisma/client");
const booking_model_1 = require("../../models/booking.model");
const retryFunction_1 = require("../../utils/retryFunction");
const lodash_1 = require("lodash");
const prisma = new client_1.PrismaClient();
class ShopService {
    static async getAllProducts(page, pageSize) {
        try {
            const products = await prisma.product.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize,
            });
            const productData = products.map((product) => ({
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
        }
        catch (error) {
            console.error("Error fetching all products:", error);
            throw error;
        }
    }
    static async getAllShopOrders(page, pageSize) {
        try {
            const orders = await prisma.shopOrder.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize,
            });
            const orderData = orders.map((order) => ({
                id: order.id,
                userId: order.userId,
                totalAmount: order.totalAmount,
                sellerId: order.sellerId,
                totalItems: order.totalItems,
                customerDetails: order.customerDetails,
                products: order.products,
                shippingAddress: order.shippingAddress,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentDetails: order.paymentDetails,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            }));
            return orderData;
        }
        catch (error) {
            console.error("Error fetching all shop orders:", error);
            throw error;
        }
    }
    static async createProduct(product) {
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
        }
        catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    }
    static async getProductByIds(productIds) {
        try {
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } },
            });
            const productData = products.map((product) => ({
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
        }
        catch (error) {
            console.error("Error fetching product:", error);
            throw error;
        }
    }
    static async createOrder(orderData) {
        try {
            const order = await prisma.shopOrder.create({
                data: {
                    userId: orderData.userId,
                    totalAmount: orderData.totalAmount,
                    sellerId: orderData.sellerId,
                    totalItems: orderData.totalItems,
                    customerDetails: orderData.customerDetails,
                    products: orderData.products,
                    shippingAddress: orderData.shippingAddress,
                    orderStatus: orderData.orderStatus,
                    paymentStatus: orderData.paymentStatus,
                    paymentDetails: orderData.paymentDetails,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            return order.id;
        }
        catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    }
    static async getShopOrderById(id) {
        try {
            const order = await prisma.shopOrder.findUnique({
                where: { id },
            });
            if (!order) {
                throw new Error("Order not found");
            }
            const newOrder = {
                id: order.id,
                userId: order.userId,
                totalAmount: order.totalAmount,
                sellerId: order.sellerId,
                totalItems: order.totalItems,
                products: order.products,
                shippingAddress: order.shippingAddress,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentDetails: order.paymentDetails,
                customerDetails: order.customerDetails,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            };
            return newOrder;
        }
        catch (error) {
            console.error("Error fetching order:", error);
            throw error;
        }
    }
    static async handleShopOrder({ success, shopOrderId, amount, orderId, paymentId, paymentMethod, }) {
        try {
            await (0, retryFunction_1.withRetries)(async () => {
                await prisma.$transaction(async (tx) => {
                    const shopOrder = (await tx.shopOrder.findUnique({
                        where: { id: shopOrderId },
                    }));
                    if (!shopOrder ||
                        shopOrder.paymentStatus === booking_model_1.PaymentStatus.Paid ||
                        shopOrder.orderStatus === booking_model_1.BookingStatus.Confirmed) {
                        return;
                    }
                    if (success) {
                        await tx.shopOrder.update({
                            where: { id: shopOrderId },
                            data: {
                                confirmedAt: new Date(),
                                orderStatus: booking_model_1.BookingStatus.Confirmed,
                                paymentStatus: booking_model_1.PaymentStatus.Paid,
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
                        await this.unlockProductInventory(shopOrder.products, shopOrder.userId, success);
                        await tx.transactionHistory.update({
                            where: { orderId },
                            data: {
                                captured: true,
                                capturedAt: new Date(),
                                razorpayPaymentId: paymentId,
                                name: (shopOrder?.products?.[0]?.name ?? "") +
                                    (shopOrder?.products?.[0]?.quantity ?? ""),
                            },
                        });
                    }
                    else {
                        await tx.shopOrder.update({
                            where: { id: shopOrderId },
                            data: {
                                paymentStatus: booking_model_1.PaymentStatus.Failed,
                                orderStatus: booking_model_1.BookingStatus.Failed,
                                paymentDetails: {
                                    paymentAmount: amount,
                                    paymentMethod: paymentMethod,
                                    paymentDate: new Date(),
                                    isRefunded: false,
                                    razorpayOrderId: orderId,
                                },
                            },
                        });
                        await this.unlockProductInventory(shopOrder.products, shopOrder.userId, false);
                        await tx.transactionHistory.update({
                            where: { orderId },
                            data: {
                                isRefunded: false,
                                captured: false,
                                name: (shopOrder?.products?.[0]?.name ?? "") +
                                    (shopOrder?.products?.[0]?.quantity ?? ""),
                            },
                        });
                    }
                });
            }, 3, 1000);
        }
        catch (error) {
            console.error("Transaction failed after retries:", error);
            const fallbackStatus = {
                shopOrderStatus: false,
                inventoryStatus: false,
                transactionStatus: false,
            };
            await (0, retryFunction_1.withRetries)(async () => {
                const fallbackTasks = [];
                if (!fallbackStatus.shopOrderStatus) {
                    fallbackTasks.push(this.handleShopOrderUpdate(shopOrderId, success, amount, orderId, paymentId, paymentMethod));
                }
                if (!fallbackStatus.inventoryStatus) {
                    const shopOrder = (await prisma.shopOrder.findUnique({
                        where: { id: shopOrderId },
                    }));
                    fallbackTasks.push(this.unlockProductInventory(shopOrder.products, shopOrder.userId, false));
                }
                if (!fallbackStatus.transactionStatus) {
                    fallbackTasks.push(this.handleTransactionAfterOrder(shopOrderId, orderId, paymentId, success, paymentMethod));
                }
                const results = await Promise.allSettled(fallbackTasks);
                console.log("Fallback cleanup results:", results);
                results.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        if (index === 0)
                            fallbackStatus.shopOrderStatus = true;
                        if (index === 1)
                            fallbackStatus.transactionStatus = true;
                    }
                    else {
                        console.warn(`Fallback step ${index} failed:`, result.reason);
                    }
                });
            }, 3, 1000).catch((fallbackError) => {
                console.error("Fallback retry failed:", fallbackError);
            });
        }
    }
    static async handleShopOrderUpdate(shopOrderId, success, amount, orderId, paymentId, paymentMethod) {
        try {
            if (success) {
                await prisma.shopOrder.update({
                    where: { id: shopOrderId },
                    data: {
                        confirmedAt: new Date(),
                        orderStatus: booking_model_1.BookingStatus.Confirmed,
                        paymentStatus: booking_model_1.PaymentStatus.Paid,
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
            }
            else {
                await prisma.shopOrder.update({
                    where: { id: shopOrderId },
                    data: {
                        paymentStatus: booking_model_1.PaymentStatus.Failed,
                        orderStatus: booking_model_1.BookingStatus.Failed,
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
        }
        catch (error) {
            console.error("Error handling booking update:", error);
            throw error;
        }
    }
    static async handleTransactionAfterOrder(shopOrderId, orderId, paymentId, success, paymentMethod) {
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
                        name: (shopOrder?.products?.[0]?.name ?? "") +
                            (shopOrder?.products?.[0]?.quantity ??
                                ""),
                    },
                });
            }
            else {
                await prisma.transactionHistory.update({
                    where: { orderId },
                    data: {
                        captured: false,
                        isRefunded: false,
                        paymentMethod: paymentMethod,
                        name: (shopOrder?.products?.[0]?.name ?? "") +
                            (shopOrder?.products?.[0]?.quantity ??
                                ""),
                    },
                });
            }
        }
        catch (error) {
            console.error("Error handling transaction after booking:", error);
            throw error;
        }
    }
    static async lockProductInventory(products, userId) {
        try {
            await prisma.$transaction(async (tx) => {
                (0, lodash_1.forEach)(products, async (product) => {
                    const dbProduct = await tx.product.findUnique({
                        where: { id: product.productId },
                    });
                    if (!dbProduct)
                        throw new Error("Product not found");
                    if (dbProduct.inventory < product.quantity) {
                        throw new Error(`Insufficient inventory for product ${dbProduct.name}`);
                    }
                    let lockArr = dbProduct.lock;
                    let found = false;
                    lockArr = lockArr.map((lock) => {
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
                            lock: lockArr,
                        },
                    });
                });
            });
            return true;
        }
        catch (error) {
            console.error("Error locking inventory:", error);
            throw error;
        }
    }
    static async unlockProductInventory(productsData, userId, success) {
        try {
            await prisma.$transaction(async (tx) => {
                const ids = productsData.map((p) => p.productId);
                const products = await tx.product.findMany({
                    where: { id: { in: ids } },
                });
                await Promise.all(products.map(async (product) => {
                    const lockArr = product.lock;
                    const userLock = (lockArr || []).find((lock) => lock.userId === userId);
                    const newLockArr = (lockArr || []).filter((lock) => lock.userId !== userId);
                    const updateData = {
                        lock: newLockArr,
                    };
                    if (success && userLock) {
                        updateData.inventory = { increment: userLock.quantity };
                    }
                    await tx.product.update({
                        where: { id: product.id },
                        data: updateData,
                    });
                }));
            });
            return true;
        }
        catch (error) {
            console.error("Error unlocking inventory:", error);
            return false;
        }
    }
}
exports.ShopService = ShopService;
//# sourceMappingURL=shop.service.js.map