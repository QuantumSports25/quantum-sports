"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const payment_model_1 = require("../../models/payment.model");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
const razorpayKey = process.env["RAZORPAY_KEY_ID"];
const razorpaySecret = process.env["RAZORPAY_KEY_SECRET"];
class PaymentService {
    static async createPaymentRazorpay({ amount, bookingId, membershipId, customerId, currency = payment_model_1.Currency.INR, }) {
        try {
            if (!razorpayKey || !razorpaySecret) {
                throw new Error("Razorpay credentials are missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.");
            }
            const razorpay = new razorpay_1.default({
                key_id: razorpayKey,
                key_secret: razorpaySecret,
            });
            const order = await razorpay.orders.create({
                amount: Math.round(amount * 100),
                currency: currency,
                receipt: bookingId ?? membershipId,
                notes: {
                    customerId,
                },
            });
            if (!order) {
                throw new Error("Failed to create Razorpay order");
            }
            return order;
        }
        catch (error) {
            console.error("Error creating Razorpay order:", error);
            throw error;
        }
    }
    static async createTransaction({ orderId, bookingId, membershipId, shopOrderId, amount, currency = payment_model_1.Currency.INR, paymentMethod = payment_model_1.PaymentMethod.Razorpay, userId }) {
        try {
            const transactionData = {
                orderId: orderId,
                paymentAmount: amount,
                paymentCurrency: currency,
                paymentMethod: paymentMethod,
                isRefunded: false,
                paymentDate: new Date(),
                userId: userId,
            };
            if (bookingId) {
                transactionData.bookingId = bookingId;
            }
            if (membershipId) {
                transactionData.membershipId = membershipId;
            }
            if (shopOrderId) {
                transactionData.shopOrderId = shopOrderId;
            }
            const transaction = await prisma.transactionHistory.create({
                data: transactionData,
            });
            return transaction;
        }
        catch (error) {
            console.error("Error creating transaction:", error);
            throw error;
        }
    }
    static async verifyPaymentSignature({ orderId, paymentId, signature, }) {
        try {
            if (!razorpaySecret) {
                throw new Error("Razorpay secret is missing. Please set RAZORPAY_KEY_SECRET in your environment variables.");
            }
            const data = `${orderId}|${paymentId}`;
            const expectedSignature = (0, crypto_1.createHmac)("sha256", razorpaySecret)
                .update(data)
                .digest("hex");
            if (expectedSignature !== signature) {
                throw new Error("Invalid payment signature");
            }
            return true;
        }
        catch (error) {
            console.error("Error verifying payment signature:", error);
            throw error;
        }
    }
    static async getTransactionByOrderId(orderId) {
        try {
            const transaction = await prisma.transactionHistory.findUnique({
                where: { orderId },
            });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            const transactionData = {
                orderId: transaction.orderId,
                paymentAmount: Number(transaction.paymentAmount),
                paymentCurrency: transaction.paymentCurrency,
                paymentMethod: transaction.paymentMethod,
                isRefunded: transaction.isRefunded,
                paymentDate: transaction.paymentDate,
                name: transaction.name,
                userId: transaction.userId,
            };
            return transactionData;
        }
        catch (error) {
            console.error("Error fetching transaction by order ID:", error);
            throw error;
        }
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map