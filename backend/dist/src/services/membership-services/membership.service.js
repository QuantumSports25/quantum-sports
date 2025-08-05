"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipService = void 0;
const payment_model_1 = require("../../models/payment.model");
const retryFunction_1 = require("../../utils/retryFunction");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class MembershipService {
    static async createMembership(data) {
        try {
            const createdMembership = await prisma.membership.create({
                data: {
                    userId: data.userId,
                    planId: data.planId,
                    transactionOrderId: data.transactionOrderId,
                    creditsGiven: data.creditsGiven,
                    startedAt: data.startedAt,
                    expiresAt: data.expiresAt,
                    isActive: false,
                },
            });
            return createdMembership.id;
        }
        catch (error) {
            console.error("Error creating membership:", error);
            throw error;
        }
    }
    static async getUserMemberships(userId) {
        try {
            const memberships = await prisma.membership.findMany({
                where: { userId, isActive: true },
                include: { plan: true },
                orderBy: { createdAt: "desc" },
            });
            if (!memberships || memberships.length === 0) {
                return [];
            }
            const mappedMemberships = memberships.map((membership) => ({
                id: membership.id,
                userId: membership.userId,
                planId: membership.planId,
                creditsGiven: membership.creditsGiven,
                startedAt: membership.startedAt,
                expiresAt: membership.expiresAt,
                isActive: membership.isActive,
                createdAt: membership.createdAt,
                updatedAt: membership.updatedAt,
            }));
            return mappedMemberships;
        }
        catch (error) {
            console.error("Error fetching user memberships:", error);
            throw error;
        }
    }
    static async getAllActiveMemberships() {
        try {
            const memberships = await prisma.membership.findMany({
                where: {
                    isActive: true,
                },
            });
            if (!memberships || memberships.length === 0) {
                return [];
            }
            const mappedMemberships = memberships.map((membership) => ({
                id: membership.id,
                userId: membership.userId,
                planId: membership.planId,
                creditsGiven: membership.creditsGiven,
                startedAt: membership.startedAt,
                expiresAt: membership.expiresAt,
                isActive: membership.isActive,
                createdAt: membership.createdAt,
                updatedAt: membership.updatedAt,
            }));
            return mappedMemberships;
        }
        catch (error) {
            console.error("Error fetching active memberships:", error);
            throw error;
        }
    }
    static async getMembershipById(id) {
        try {
            const membership = await prisma.membership.findUnique({
                where: { id },
            });
            if (!membership) {
                throw new Error("Membership not found");
            }
            return {
                id: membership.id,
                userId: membership.userId,
                planId: membership.planId,
                creditsGiven: membership.creditsGiven,
                startedAt: membership.startedAt,
                expiresAt: membership.expiresAt,
                isActive: membership.isActive,
                createdAt: membership.createdAt,
                updatedAt: membership.updatedAt,
            };
        }
        catch (error) {
            console.error("Error fetching membership by ID:", error);
            throw error;
        }
    }
    static async handleMembershipPayment({ success, membershipId, planId, orderId, paymentId }) {
        try {
            await (0, retryFunction_1.withRetries)(async () => {
                await prisma.$transaction(async (tx) => {
                    const membership = await tx.membership.findUnique({
                        where: { id: membershipId },
                    });
                    const membershipPlan = await tx.membershipPlan.findUnique({
                        where: { id: planId },
                    });
                    if (!membership || !membershipPlan) {
                        throw new Error("Membership or membership plan not found");
                    }
                    if (success) {
                        await tx.membership.update({
                            where: { id: membershipId },
                            data: {
                                isActive: true,
                                startedAt: new Date(),
                                expiresAt: membership.expiresAt || null,
                                paymentDetails: {
                                    paymentMethod: payment_model_1.PaymentMethod.Razorpay,
                                    paymentDate: new Date(),
                                    isRefunded: false,
                                    razorpayOrderId: orderId,
                                    razorpayPaymentId: paymentId,
                                },
                            },
                        });
                        console.log(`Membership activated for user ${membership.userId}`);
                        await tx.transactionHistory.update({
                            where: { orderId },
                            data: {
                                captured: true,
                                capturedAt: new Date(),
                                razorpayPaymentId: paymentId,
                                membershipId: membership.id,
                            },
                        });
                    }
                    else {
                        await tx.membership.update({
                            where: { id: membershipId },
                            data: {
                                isActive: false,
                                paymentDetails: {
                                    isRefunded: true,
                                    razorpayOrderId: orderId
                                },
                            },
                        });
                        await tx.transactionHistory.update({
                            where: { orderId },
                            data: {
                                captured: false,
                                capturedAt: null,
                            },
                        });
                    }
                });
            }, 3);
        }
        catch (error) {
            console.error("Error handling membership payment:", error);
            throw error;
        }
    }
}
exports.MembershipService = MembershipService;
//# sourceMappingURL=membership.service.js.map