import { Request, Response } from "express";
import { Currency, Order, PaymentMethod } from "../../models/payment.model";
import { PaymentService } from "../../services/payment-wallet-services/payment.service";
import { SeedDataService } from "../../services/membership-services/seedData.service";
import { AppError } from "../../types";
import { MembershipService } from "../../services/membership-services/membership.service";
import { MembershipPlanService } from "../../services/membership-services/membershipPlan.service";
import { WalletService } from "../../services/payment-wallet-services/wallet.services";

export class MembershipController {
  static async createMembershipBeforePayment(req: Request, res: Response) {
    try {
      const { userId, planId } = req.body;

      if (!userId || !planId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Try to get plan by ID first, if not found, try by name pattern
      let membershipPlan;
      try {
        membershipPlan = await MembershipPlanService.getMembershipPlanById(planId);
      } catch (error) {
        // If not found by ID, try to find by name pattern (for basic/premium)
        if (planId === 'basic') {
          membershipPlan = await MembershipPlanService.getMembershipPlanByName('basic');
        } else if (planId === 'premium') {
          membershipPlan = await MembershipPlanService.getMembershipPlanByName('premium');
        } else {
          throw error;
        }
      }
      
      if (!membershipPlan) {
        return res.status(404).json({ message: "Membership plan not found" });
      }

      const membership = await MembershipService.createMembership({
        userId,
        planId,
        creditsGiven: membershipPlan.credits,
        startedAt: new Date(),
        transactionOrderId: null, // Set to null initially
        expiresAt: membershipPlan.durationDays
          ? new Date(
              Date.now() + membershipPlan.durationDays * 24 * 60 * 60 * 1000
            )
          : null,
      });

      // Auto-activate free/zero-amount plans (e.g., Revenue Share)
      if (membershipPlan.amount === 0) {
        await MembershipService.activateFreeMembership({
          membershipId: membership,
          planId: membershipPlan.id,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Membership created successfully",
        id: membership,
        activated: membershipPlan.amount === 0,
      });
    } catch (error: any) {
      console.error("Error creating membership before payment:", error);
      return res.status(500).json({
        message: "Failed to create membership before payment",
        error: error.message,
      });
    }
  }

  static async createMembershipOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Missing membership ID" });
      }

      const { amount, userId, planId } = req.body;

      if (!amount || !userId || !planId) {
        return res.status(400).json({
          message: "Missing required fields: amount, userId, planId",
        });
      }

      const membershipPlan = await MembershipPlanService.getMembershipPlanById(planId);

      if (!membershipPlan) {
        return res.status(404).json({ message: "Membership plan not found" });
      }

      const membership = await MembershipService.getMembershipById(id);

      if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
      }

      // Create Razorpay order
      const order = await PaymentService.createPaymentRazorpay({
        amount: Number(amount),
        membershipId: membership.id,
        customerId: userId,
        currency: Currency.INR,
      });

      const orderData: Order = {
        id: order.id,
        receipt: order.receipt as string,
      };

      if (!orderData) {
        throw new Error("Failed to create Razorpay order");
      }

      // Create transaction record (don't set membershipId yet - will be set after payment success)
      const transaction = await PaymentService.createTransaction({
        orderId: order.id,
        membershipId: membership.id,
        amount: Number(amount),
        currency: Currency.INR,
        paymentMethod: PaymentMethod.Razorpay,
        userId: membership.userId,
      });

      if (!transaction) {
        console.log("Transaction creation failed for membership order");
      }

      return res.status(200).json({
        success: true,
        data: orderData,
      });
    } catch (error: any) {
      console.error("Error creating membership order:", error);
      return res.status(500).json({
        message: "Failed to create membership order",
        error: error.message,
      });
    }
  }

  static async verifyMembershipPayment(req: Request, res: Response) {
    try {
      const { paymentId, signature, orderId, membershipId } = req.body as {
        paymentId: string;
        signature: string;
        orderId: string;
        membershipId: string;
      };

      if (!membershipId) {
        return res.status(400).json({ message: "Missing membership ID" });
      }

      if (!paymentId || !signature || !orderId) {
        return res.status(400).json({ message: "Payment details are missing" });
      }

      const membership = await MembershipService.getMembershipById(membershipId);

      if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
      }

      const planId = membership.planId;

      const plan = await MembershipPlanService.getMembershipPlanById(planId);
      if (!plan) {
        return res.status(404).json({ message: "Membership plan not found" });
      }

      // Verify payment signature
      const verified = await PaymentService.verifyPaymentSignature({
        paymentId,
        signature,
        orderId,
      });

      if (!verified) {
        await MembershipService.handleMembershipPayment({
          success: false,
          membershipId: membership.id,
          planId: membership.planId,
          orderId,
          paymentId,
          expiresAt: membership.expiresAt || null,
        });

        throw new Error("Payment verification failed");
      }

      // Handle successful payment
      await MembershipService.handleMembershipPayment({
          success: true,
          membershipId: membership.id,
          planId: membership.planId,
          orderId,
          paymentId,
          expiresAt: membership.expiresAt || null,
        });

      // Add credits to user wallet
      const walletUpdated = await WalletService.addCredits(membership.userId, plan.credits);
      
      if (!walletUpdated) {
        console.warn(`Warning: Membership activated but wallet update failed for user ${membership.userId}`);
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified and membership activated successfully",
        walletUpdated: walletUpdated
      });
    } catch (error) {
      console.error("Error verifying membership payment:", error);
      const appError = error as AppError;
      return res.status(500).json({
        message: "Failed to verify membership payment",
        error: appError.message || "Unknown error",
      });
    }
  }

  static async getUserMemberships(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const memberships = await MembershipService.getUserMemberships(userId);
      return res.status(200).json({
        success: true,
        data: memberships,
      });
    } catch (error: any) {
      console.error("Error fetching user memberships:", error);
      return res.status(500).json({
        message: "Failed to fetch user memberships",
        error: error.message,
      });
    }
  }

  // Development only - seed membership plans
  static async seedMembershipPlans(_req: Request, res: Response) {
    try {
      if (process.env["NODE_ENV"] === "production") {
        return res.status(403).json({
          message: "Seeding not allowed in production",
        });
      }

      const plans = await SeedDataService.seedMembershipPlans();
      return res.status(200).json({
        success: true,
        message: "Membership plans seeded successfully",
        data: plans,
      });
    } catch (error: any) {
      console.error("Error seeding membership plans:", error);
      return res.status(500).json({
        message: "Failed to seed membership plans",
        error: error.message,
      });
    }
  }
}
