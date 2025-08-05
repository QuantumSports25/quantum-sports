"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipController = void 0;
const payment_model_1 = require("../../models/payment.model");
const payment_service_1 = require("../../services/payment-wallet-services/payment.service");
const seedData_service_1 = require("../../services/membership-services/seedData.service");
const membership_service_1 = require("../../services/membership-services/membership.service");
const membershipPlan_service_1 = require("../../services/membership-services/membershipPlan.service");
const wallet_services_1 = require("../../services/payment-wallet-services/wallet.services");
class MembershipController {
    static async createMembershipBeforePayment(req, res) {
        try {
            const { userId, planId } = req.body;
            if (!userId || !planId) {
                return res.status(400).json({ message: "Missing required fields" });
            }
            let membershipPlan;
            try {
                membershipPlan = await membershipPlan_service_1.MembershipPlanService.getMembershipPlanById(planId);
            }
            catch (error) {
                if (planId === 'basic') {
                    membershipPlan = await membershipPlan_service_1.MembershipPlanService.getMembershipPlanByName('basic');
                }
                else if (planId === 'premium') {
                    membershipPlan = await membershipPlan_service_1.MembershipPlanService.getMembershipPlanByName('premium');
                }
                else {
                    throw error;
                }
            }
            if (!membershipPlan) {
                return res.status(404).json({ message: "Membership plan not found" });
            }
            const membership = await membership_service_1.MembershipService.createMembership({
                userId,
                planId,
                creditsGiven: membershipPlan.credits,
                startedAt: new Date(),
                transactionOrderId: null,
                expiresAt: membershipPlan.durationDays
                    ? new Date(Date.now() + membershipPlan.durationDays * 24 * 60 * 60 * 1000)
                    : null,
            });
            return res.status(201).json({
                success: true,
                message: "Membership created successfully",
                id: membership,
            });
        }
        catch (error) {
            console.error("Error creating membership before payment:", error);
            return res.status(500).json({
                message: "Failed to create membership before payment",
                error: error.message,
            });
        }
    }
    static async createMembershipOrder(req, res) {
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
            let membershipPlan;
            try {
                membershipPlan = await membershipPlan_service_1.MembershipPlanService.getMembershipPlanById(planId);
            }
            catch (error) {
                if (planId === 'basic') {
                    membershipPlan = await membershipPlan_service_1.MembershipPlanService.getMembershipPlanByName('basic');
                }
                else if (planId === 'premium') {
                    membershipPlan = await membershipPlan_service_1.MembershipPlanService.getMembershipPlanByName('premium');
                }
                else {
                    throw error;
                }
            }
            if (!membershipPlan) {
                return res.status(404).json({ message: "Membership plan not found" });
            }
            const membership = await membership_service_1.MembershipService.getMembershipById(id);
            if (!membership) {
                return res.status(404).json({ message: "Membership not found" });
            }
            const order = await payment_service_1.PaymentService.createPaymentRazorpay({
                amount: Number(amount),
                membershipId: membership.id,
                customerId: userId,
                currency: payment_model_1.Currency.INR,
            });
            const orderData = {
                id: order.id,
                receipt: order.receipt,
            };
            if (!orderData) {
                throw new Error("Failed to create Razorpay order");
            }
            const transaction = await payment_service_1.PaymentService.createTransaction({
                orderId: order.id,
                membershipId: membership.id,
                amount: Number(amount),
                currency: payment_model_1.Currency.INR,
                paymentMethod: payment_model_1.PaymentMethod.Razorpay,
            });
            if (!transaction) {
                console.log("Transaction creation failed for membership order");
            }
            return res.status(200).json({
                success: true,
                data: orderData,
            });
        }
        catch (error) {
            console.error("Error creating membership order:", error);
            return res.status(500).json({
                message: "Failed to create membership order",
                error: error.message,
            });
        }
    }
    static async verifyMembershipPayment(req, res) {
        try {
            const { paymentId, signature, orderId, membershipId } = req.body;
            if (!membershipId) {
                return res.status(400).json({ message: "Missing membership ID" });
            }
            if (!paymentId || !signature || !orderId) {
                return res.status(400).json({ message: "Payment details are missing" });
            }
            const membership = await membership_service_1.MembershipService.getMembershipById(membershipId);
            if (!membership) {
                return res.status(404).json({ message: "Membership not found" });
            }
            const planId = membership.planId;
            const plan = await membershipPlan_service_1.MembershipPlanService.getMembershipPlanById(planId);
            if (!plan) {
                return res.status(404).json({ message: "Membership plan not found" });
            }
            const verified = await payment_service_1.PaymentService.verifyPaymentSignature({
                paymentId,
                signature,
                orderId,
            });
            if (!verified) {
                await membership_service_1.MembershipService.handleMembershipPayment({
                    success: false,
                    membershipId: membership.id,
                    planId: membership.planId,
                    orderId,
                    paymentId,
                    expiresAt: membership.expiresAt || null,
                });
                throw new Error("Payment verification failed");
            }
            await membership_service_1.MembershipService.handleMembershipPayment({
                success: true,
                membershipId: membership.id,
                planId: membership.planId,
                orderId,
                paymentId,
                expiresAt: membership.expiresAt || null,
            });
            const walletUpdated = await wallet_services_1.WalletService.addCredits(membership.userId, plan.credits);
            if (!walletUpdated) {
                console.warn(`Warning: Membership activated but wallet update failed for user ${membership.userId}`);
            }
            return res.status(200).json({
                success: true,
                message: "Payment verified and membership activated successfully",
                walletUpdated: walletUpdated
            });
        }
        catch (error) {
            console.error("Error verifying membership payment:", error);
            const appError = error;
            return res.status(500).json({
                message: "Failed to verify membership payment",
                error: appError.message || "Unknown error",
            });
        }
    }
    static async getUserMemberships(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "User not authenticated" });
            }
            const memberships = await membership_service_1.MembershipService.getUserMemberships(userId);
            return res.status(200).json({
                success: true,
                data: memberships,
            });
        }
        catch (error) {
            console.error("Error fetching user memberships:", error);
            return res.status(500).json({
                message: "Failed to fetch user memberships",
                error: error.message,
            });
        }
    }
    static async seedMembershipPlans(_req, res) {
        try {
            if (process.env["NODE_ENV"] === "production") {
                return res.status(403).json({
                    message: "Seeding not allowed in production",
                });
            }
            const plans = await seedData_service_1.SeedDataService.seedMembershipPlans();
            return res.status(200).json({
                success: true,
                message: "Membership plans seeded successfully",
                data: plans,
            });
        }
        catch (error) {
            console.error("Error seeding membership plans:", error);
            return res.status(500).json({
                message: "Failed to seed membership plans",
                error: error.message,
            });
        }
    }
}
exports.MembershipController = MembershipController;
//# sourceMappingURL=membership.controller.js.map