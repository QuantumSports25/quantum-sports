"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipPlanService = void 0;
const client_1 = require("@prisma/client");
const membership_model_1 = require("../../models/membership.model");
const prisma = new client_1.PrismaClient();
class MembershipPlanService {
    static async getAllMembershipPlans(orderBy = "desc") {
        try {
            const plans = await prisma.membershipPlan.findMany({
                orderBy: { createdAt: orderBy },
            });
            if (!plans || plans.length === 0) {
                throw new Error("No active membership plans found");
            }
            const newPlans = plans.map((plan) => ({
                id: plan.id,
                name: plan.name,
                description: plan.description ?? "",
                amount: plan.amount,
                durationDays: plan.durationDays,
                forRole: membership_model_1.MembershipRole[plan.forRole],
                credits: plan.credits,
                isActive: plan.isActive,
                createdAt: plan.createdAt,
                updatedAt: plan.updatedAt,
            }));
            return newPlans;
        }
        catch (error) {
            console.error("Error fetching membership plans:", error);
            throw error;
        }
    }
    static async getActiveMembershipPlans() {
        try {
            const plans = await prisma.membershipPlan.findMany({
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
            });
            if (!plans || plans.length === 0) {
                throw new Error("No active membership plans found");
            }
            const newPlans = plans.map((plan) => ({
                id: plan.id,
                name: plan.name,
                description: plan.description ?? "",
                amount: plan.amount,
                durationDays: plan.durationDays,
                forRole: membership_model_1.MembershipRole[plan.forRole],
                credits: plan.credits,
                isActive: plan.isActive,
                createdAt: plan.createdAt,
                updatedAt: plan.updatedAt,
            }));
            return newPlans;
        }
        catch (error) {
            console.error("Error fetching active membership plans:", error);
            throw error;
        }
    }
    static async getMembershipPlanByName(namePattern) {
        try {
            const plan = await prisma.membershipPlan.findFirst({
                where: {
                    name: {
                        contains: namePattern,
                        mode: 'insensitive'
                    },
                    isActive: true
                },
            });
            if (!plan) {
                throw new Error(`Membership plan with name containing "${namePattern}" not found`);
            }
            const newPlan = {
                id: plan.id,
                name: plan.name,
                description: plan?.description ?? "",
                amount: plan.amount,
                durationDays: plan.durationDays,
                forRole: plan.forRole,
                credits: plan.credits,
                isActive: plan.isActive,
                createdAt: plan.createdAt,
                updatedAt: plan.updatedAt,
            };
            return newPlan;
        }
        catch (error) {
            console.error("Error fetching membership plan by name:", error);
            throw error;
        }
    }
    static async getMembershipPlanById(id) {
        try {
            const plan = await prisma.membershipPlan.findUnique({
                where: { id },
            });
            if (!plan) {
                throw new Error("Membership plan not found");
            }
            const newPlan = {
                id: plan.id,
                name: plan.name,
                description: plan?.description ?? "",
                amount: plan.amount,
                durationDays: plan.durationDays,
                forRole: plan.forRole,
                credits: plan.credits,
                isActive: plan.isActive,
                createdAt: plan.createdAt,
                updatedAt: plan.updatedAt,
            };
            return newPlan;
        }
        catch (error) {
            console.error("Error fetching membership plan by id:", error);
            throw error;
        }
    }
    static async createMembershipPlan({ name, description, amount, durationDays, forRole, credits, isActive = true, }) {
        try {
            const plan = await prisma.membershipPlan.create({
                data: {
                    name,
                    description,
                    amount,
                    durationDays,
                    forRole,
                    credits,
                    isActive,
                },
            });
            if (!plan) {
                throw new Error("Failed to create membership plan");
            }
            const newPlan = {
                id: plan.id,
                name: plan.name,
                description: plan?.description ?? "",
                amount: plan.amount,
                durationDays: plan.durationDays,
                forRole: forRole,
                credits: plan.credits,
                isActive: plan.isActive,
                createdAt: plan.createdAt,
                updatedAt: plan.updatedAt,
            };
            return newPlan;
        }
        catch (error) {
            console.error("Error creating membership plan:", error);
            throw error;
        }
    }
    static async updateMembershipPlan(id, data) {
        try {
            const plan = await prisma.membershipPlan.update({
                where: { id },
                data,
            });
            if (!plan) {
                throw new Error("Failed to update membership plan");
            }
            const newPlan = {
                id: plan.id,
                name: plan.name,
                description: plan?.description ?? "",
                amount: plan.amount,
                durationDays: plan.durationDays,
                forRole: plan.forRole,
                credits: plan.credits,
                isActive: plan.isActive,
                createdAt: plan.createdAt,
                updatedAt: plan.updatedAt,
            };
            return newPlan;
        }
        catch (error) {
            console.error("Error updating membership plan:", error);
            throw error;
        }
    }
    static async deleteMembershipPlan(id) {
        try {
            const plan = await prisma.membershipPlan.delete({
                where: { id },
            });
            if (!plan) {
                throw new Error("Failed to delete membership plan");
            }
            return plan.id;
        }
        catch (error) {
            console.error("Error deleting membership plan:", error);
            throw error;
        }
    }
}
exports.MembershipPlanService = MembershipPlanService;
//# sourceMappingURL=membershipPlan.service.js.map