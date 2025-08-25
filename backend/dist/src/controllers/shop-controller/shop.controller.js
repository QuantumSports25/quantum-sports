"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopController = void 0;
const shop_service_1 = require("../../services/shop-services/shop.service");
const checkInventory_1 = require("../../utils/checkInventory");
const booking_model_1 = require("../../models/booking.model");
const payment_model_1 = require("../../models/payment.model");
const auth_service_1 = require("../../services/auth-services/auth.service");
const wallet_services_1 = require("../../services/payment-wallet-services/wallet.services");
const payment_service_1 = require("../../services/payment-wallet-services/payment.service");
class ShopController {
    static async createProducts(req, res) {
        try {
            const productData = req.body;
            if (!productData.name ||
                !productData.price ||
                !productData.sellerId ||
                !productData.inventory) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            const product = {
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
            const newProduct = await shop_service_1.ShopService.createProduct(product);
            return res.status(201).json(newProduct);
        }
        catch (error) {
            console.error("Error creating product:", error);
            return res.status(500).json({ error: "Failed to create product" });
        }
    }
    static async getProductsById(req, res) {
        try {
            const { productIds } = req.body;
            if (!productIds || productIds.length === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            const products = await shop_service_1.ShopService.getProductByIds(productIds);
            return res.status(200).json(products);
        }
        catch (error) {
            console.error("Error fetching product:", error);
            return res.status(500).json({ error: "Failed to fetch product" });
        }
    }
    static async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query["page"]) || 1;
            const pageSize = parseInt(req.query["pageSize"]) || 10;
            const products = await shop_service_1.ShopService.getAllProducts(page, pageSize);
            return res.status(200).json(products ?? []);
        }
        catch (error) {
            console.error("Error fetching products:", error);
            return res.status(500).json({ error: "Failed to fetch products" });
        }
    }
    static async getAllShopOrders(req, res) {
        try {
            const page = parseInt(req.query["page"]) || 1;
            const pageSize = parseInt(req.query["pageSize"]) || 10;
            const orders = await shop_service_1.ShopService.getAllShopOrders(page, pageSize);
            return res.status(200).json(orders ?? []);
        }
        catch (error) {
            console.error("Error fetching shop orders:", error);
            return res.status(500).json({ error: "Failed to fetch shop orders" });
        }
    }
    static async getShopOrderById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: "Missing order ID" });
            }
            const order = await shop_service_1.ShopService.getShopOrderById(id);
            return res.status(200).json(order);
        }
        catch (error) {
            console.error("Error fetching shop order:", error);
            return res.status(500).json({ error: "Failed to fetch shop order" });
        }
    }
    static async unlockInventoryByOrderId(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: "Missing order ID" });
            }
            const order = await shop_service_1.ShopService.getShopOrderById(id);
            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }
            await shop_service_1.ShopService.unlockProductInventory(order.products, order.userId, false);
            return res.status(200).json({ message: "Inventory unlocked successfully" });
        }
        catch (error) {
            console.error("Error unlocking inventory:", error);
            return res.status(500).json({ error: "Failed to unlock inventory" });
        }
    }
    static async createOrderBeforePayment(req, res) {
        try {
            const orderData = req.body;
            const paymentMethod = req.params["paymentMethod"];
            if (!orderData.userId ||
                !orderData.products ||
                !orderData.shippingAddress ||
                !orderData.totalAmount ||
                !orderData.totalItems ||
                orderData.totalItems <= 0 ||
                !orderData.sellerId) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            if (!Object.values(payment_model_1.PaymentMethod).includes(paymentMethod)) {
                return res.status(400).json({ message: "Invalid payment method" });
            }
            const productData = await shop_service_1.ShopService.getProductByIds(orderData.products.map((p) => p.productId));
            if (!productData) {
                return res.status(404).json({ error: "No Products Data found" });
            }
            if (orderData.totalItems !==
                orderData.products.reduce((acc, p) => acc + p.quantity, 0)) {
                return res.status(400).json({ error: "Total items do not match" });
            }
            if (!(0, checkInventory_1.checkInventory)(orderData.products, productData)) {
                return res.status(400).json({ error: "Insufficient inventory" });
            }
            if (!orderData.shippingAddress.addressLine1 ||
                !orderData.shippingAddress.city ||
                !orderData.shippingAddress.postalCode ||
                !orderData.shippingAddress.country) {
                return res.status(400).json({ error: "Invalid shipping address" });
            }
            if (orderData.totalAmount !==
                orderData.products.reduce((acc, p) => {
                    const product = productData.find((prod) => prod.id === p.productId);
                    return acc + (product ? product.price * p.quantity : 0);
                }, 0)) {
                return res.status(400).json({ error: "Total amount does not match" });
            }
            const user = await auth_service_1.AuthService.getUserById(orderData.userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            await shop_service_1.ShopService.lockProductInventory(orderData.products, user.id);
            const customerDetails = {
                customerId: user.id,
                customerName: user.name,
                customerEmail: user.email ?? "",
                customerPhone: user.phone ?? "",
            };
            const order = {
                products: orderData.products,
                shippingAddress: orderData.shippingAddress,
                totalAmount: orderData.totalAmount,
                totalItems: orderData.totalItems,
                confirmedAt: new Date(),
                orderStatus: booking_model_1.BookingStatus.Pending,
                paymentStatus: booking_model_1.PaymentStatus.Initiated,
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
            const newOrder = await shop_service_1.ShopService.createOrder(order);
            return res.status(201).json(newOrder);
        }
        catch (error) {
            console.error("Error creating order:", error);
            return res.status(500).json({ error: "Failed to create order" });
        }
    }
    static async createBookingPayment(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Booking ID is required" });
            }
            const shopOrder = await shop_service_1.ShopService.getShopOrderById(id);
            if (!shopOrder ||
                shopOrder?.paymentStatus !== booking_model_1.PaymentStatus.Initiated ||
                shopOrder.orderStatus !== booking_model_1.BookingStatus.Pending) {
                return res.status(400).json({
                    message: "Payment has already been initiated for this booking",
                });
            }
            if (!shopOrder.paymentDetails || !shopOrder.paymentDetails) {
                return res.status(400).json({ message: "Payment method is required" });
            }
            let orderData = null;
            switch (shopOrder.paymentDetails.paymentMethod) {
                case payment_model_1.PaymentMethod.Wallet:
                    await wallet_services_1.WalletService.deductCredits(shopOrder.userId, shopOrder.totalAmount);
                    orderData = {
                        id: `order-${Math.random()
                            .toString(36)
                            .slice(2)
                            .padEnd(12, "0")
                            .slice(0, 12)}`,
                        receipt: shopOrder.id,
                    };
                    break;
                case payment_model_1.PaymentMethod.Razorpay:
                    const order = await payment_service_1.PaymentService.createPaymentRazorpay({
                        amount: shopOrder.totalAmount,
                        bookingId: shopOrder.id,
                        customerId: shopOrder.customerDetails.customerId,
                        currency: payment_model_1.Currency.INR,
                    });
                    orderData = {
                        id: order.id,
                        receipt: order.receipt,
                    };
                    break;
            }
            if (!orderData) {
                throw new Error("Failed to create Razorpay order");
            }
            const transaction = await payment_service_1.PaymentService.createTransaction({
                orderId: orderData.id,
                bookingId: shopOrder.id,
                amount: shopOrder.totalAmount,
                currency: payment_model_1.Currency.INR,
                paymentMethod: shopOrder.paymentDetails.paymentMethod,
                userId: shopOrder.userId,
            });
            if (!transaction) {
            }
            return res.status(200).json({ data: orderData });
        }
        catch (error) {
            console.error("Error creating Razorpay order:", error);
            return res.status(500).json({
                message: "Failed to create Razorpay order ",
                error: error.message,
            });
        }
    }
    static async verifyPaymentAndShopOrder(req, res) {
        try {
            const { id } = req.params;
            let { paymentId } = req.body;
            const { signature, orderId } = req.body;
            if (!id || !orderId) {
                return res
                    .status(400)
                    .json({ message: "shopOrder ID and Order ID are required" });
            }
            const shopOrder = await shop_service_1.ShopService.getShopOrderById(id);
            if (!shopOrder) {
                return res.status(404).json({ message: "Shop order not found" });
            }
            const paymentMethod = shopOrder.paymentDetails?.paymentMethod === payment_model_1.PaymentMethod.Razorpay
                ? payment_model_1.PaymentMethod.Razorpay
                : payment_model_1.PaymentMethod.Wallet;
            let verified = false;
            if (paymentMethod == payment_model_1.PaymentMethod.Wallet) {
                const transaction = await payment_service_1.PaymentService.getTransactionByOrderId(orderId);
                if (!transaction) {
                    throw new Error("Payment verification failed");
                }
                paymentId = "pay" + transaction.orderId;
                verified = true;
            }
            else {
                if (!paymentId || !signature || !orderId) {
                    return res
                        .status(400)
                        .json({ message: "Payment details are missing" });
                }
                if (!shopOrder ||
                    shopOrder.paymentStatus !== booking_model_1.PaymentStatus.Initiated ||
                    shopOrder.orderStatus !== booking_model_1.BookingStatus.Pending) {
                    return res.status(400).json({ message: "Invalid booking state" });
                }
                verified = await payment_service_1.PaymentService.verifyPaymentSignature({
                    paymentId,
                    signature,
                    orderId,
                });
            }
            if (!verified) {
                shop_service_1.ShopService.handleShopOrder({
                    success: false,
                    shopOrderId: id,
                    amount: shopOrder.totalAmount,
                    orderId,
                    paymentId,
                    paymentMethod,
                });
                throw new Error("Payment verification failed");
            }
            shop_service_1.ShopService.handleShopOrder({
                success: true,
                shopOrderId: id,
                amount: shopOrder.totalAmount,
                orderId,
                paymentId,
                paymentMethod,
            });
            return res.status(200).json({ message: "Payment verified successfully" });
        }
        catch (error) {
            console.error("Error confirming booking:", error);
            const appError = error;
            return res.status(500).json({
                message: "Failed to confirm booking",
                error: appError.message || "Unknown error",
            });
        }
    }
}
exports.ShopController = ShopController;
//# sourceMappingURL=shop.controller.js.map