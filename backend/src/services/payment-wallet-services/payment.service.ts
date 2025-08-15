import Razorpay from "razorpay";
import { Currency, Payment, PaymentMethod } from "../../models/payment.model";
import { PrismaClient } from "@prisma/client";
import { createHmac } from "crypto";

const prisma = new PrismaClient();
const razorpayKey = process.env["RAZORPAY_KEY_ID"];
const razorpaySecret = process.env["RAZORPAY_KEY_SECRET"];

export class PaymentService {
  static async createPaymentRazorpay({
    amount,
    bookingId,
    membershipId,
    customerId,
    currency = Currency.INR,
  }: {
    amount: number;
    bookingId?: string;
    membershipId?: string;
    customerId: string;
    currency: Currency;
  }) {
    try {
      // Validate Razorpay credentials
      if (!razorpayKey || !razorpaySecret) {
        throw new Error(
          "Razorpay credentials are missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables."
        );
      }

      const razorpay = new Razorpay({
        key_id: razorpayKey,
        key_secret: razorpaySecret,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: currency,
        receipt: bookingId ?? (membershipId as string),
        notes: {
          customerId,
        },
      });

      if (!order) {
        throw new Error("Failed to create Razorpay order");
      }

      return order;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw error;
    }
  }

  static async createTransaction({
    orderId,
    bookingId,
    membershipId,
    amount,
    currency = Currency.INR,
    paymentMethod = PaymentMethod.Razorpay,
  }: {
    orderId: string;
    bookingId?: string;
    membershipId?: string;
    amount: number;
    currency: Currency;
    paymentMethod: PaymentMethod;
  }) {
    try {
      const transactionData: Payment = {
        orderId: orderId,
        paymentAmount: amount,
        paymentCurrency: currency,
        paymentMethod: paymentMethod,
        isRefunded: false,
        paymentDate: new Date(),
      };

      if (bookingId) {
        transactionData.bookingId = bookingId;
      }

      if (membershipId) {
        transactionData.membershipId = membershipId;
      }

      const transaction = await prisma.transactionHistory.create({
        data: transactionData,
      });

      return transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  static async verifyPaymentSignature({
    orderId,
    paymentId,
    signature,
  }: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    try {
      // Validate Razorpay secret
      if (!razorpaySecret) {
        throw new Error(
          "Razorpay secret is missing. Please set RAZORPAY_KEY_SECRET in your environment variables."
        );
      }

      const data = `${orderId}|${paymentId}`;
      const expectedSignature = createHmac("sha256", razorpaySecret)
        .update(data)
        .digest("hex");

      if (expectedSignature !== signature) {
        throw new Error("Invalid payment signature");
      }

      return true;
    } catch (error) {
      console.error("Error verifying payment signature:", error);
      throw error;
    }
  }

  static async getTransactionByOrderId(orderId: string) {
    try {
      const transaction = await prisma.transactionHistory.findUnique({
        where: { orderId },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      const transactionData: Payment = {
        orderId: transaction.orderId,
        paymentAmount: Number(transaction.paymentAmount),
        paymentCurrency: transaction.paymentCurrency as Currency,
        paymentMethod: transaction.paymentMethod as PaymentMethod,
        isRefunded: transaction.isRefunded,
        paymentDate: transaction.paymentDate,
      };

      return transactionData;
    } catch (error) {
      console.error("Error fetching transaction by order ID:", error);
      throw error;
    }
  }
}

/**
 * Razorpay Webhook Handling Strategy
 * ----------------------------------
 *
 * This endpoint processes Razorpay webhook POST requests for payment events such as:
 *  - payment.failed
 *  - payment.captured
 *  - order.paid
 *
 * Workflow:
 * 1. Razorpay sends webhook requests to this endpoint whenever an event occurs.
 * 2. Each request contains a payload and a signature in the `x-razorpay-signature` header.
 * 3. Verify the signature using HMAC-SHA256 with your Razorpay secret key to ensure authenticity.
 * 4. If verification passes, process the event accordingly:
 *    - Update transaction/order status in your database.
 *    - Handle idempotency because Razorpay may send the same webhook multiple times.
 * 5. Respond with HTTP 200 OK to acknowledge successful processing.
 *
 * Security:
 *  - Reject requests with invalid signatures (respond with 400).
 *  - Keep your webhook secret key safe and do not expose it publicly.
 *
 * Testing:
 *  - Use Razorpay Dashboard's webhook simulation tool to send test webhooks.
 *  - Webhooks are only simulated in test mode.
 *
 * Sample verification & event handling code:
 *
 * ```
 * import { createHmac } from "crypto";
 *
 * const signature = req.headers["x-razorpay-signature"];
 * const body = JSON.stringify(req.body);
 * const expectedSignature = createHmac("sha256", RAZORPAY_SECRET)
 *   .update(body)
 *   .digest("hex");
 *
 * if (signature !== expectedSignature) {
 *   // Invalid signature, reject request
 *   res.status(400).send("Invalid signature");
 *   return;
 * }
 *
 * const event = req.body.event;
 * if (event === "payment.failed") {
 *   // Mark payment as failed in DB
 * } else if (event === "order.paid") {
 *   // Mark order as paid in DB
 * }
 *
 * res.status(200).send("OK");
 * ```
 *
 * Notes:
 * - Ensure your DB updates are idempotent to handle retries.
 * - Log webhook processing for monitoring and debugging.
 */
