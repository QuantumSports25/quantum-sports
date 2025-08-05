"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipPlanController = void 0;
const membershipPlan_service_1 = require("../../services/membership-services/membershipPlan.service");
const membership_model_1 = require("../../models/membership.model");
class MembershipPlanController {
    static async getAllMembershipPlans(req, res) {
        try {
            const orderBy = req.query["orderBy"];
            const plans = await membershipPlan_service_1.MembershipPlanService.getAllMembershipPlans(orderBy);
            return res.status(200).json(plans);
        }
        catch (error) {
            console.error("Error fetching membership plans:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    static async getActiveMembershipPlans(_req, res) {
        try {
            const plans = await membershipPlan_service_1.MembershipPlanService.getActiveMembershipPlans();
            return res.status(200).json({
                success: true,
                data: plans
            });
        }
        catch (error) {
            console.error("Error fetching active membership plans:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    }
    static async getMembershipPlanById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Plan ID is required" });
            }
            const plan = await membershipPlan_service_1.MembershipPlanService.getMembershipPlanById(id);
            if (!plan) {
                return res.status(404).json({ message: "Membership plan not found" });
            }
            return res.status(200).json(plan);
        }
        catch (error) {
            console.error("Error fetching membership plan by ID:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    static async createMembershipPlan(req, res) {
        try {
            const planData = req.body;
            if (!planData.name ||
                !planData.amount ||
                !planData.forRole ||
                !planData.credits ||
                !planData.isActive) {
                return res.status(400).json({ message: "Invalid plan data" });
            }
            if (planData.forRole !== "user" && planData.forRole !== "partner") {
                return res.status(400).json({ message: "Invalid membership role" });
            }
            const newPlan = await membershipPlan_service_1.MembershipPlanService.createMembershipPlan({
                name: planData.name,
                description: planData.description ?? "",
                amount: planData.amount,
                durationDays: planData.durationDays,
                forRole: planData.forRole === membership_model_1.MembershipRole.User ? membership_model_1.MembershipRole.User : membership_model_1.MembershipRole.Partner,
                credits: planData.credits,
                isActive: planData.isActive
            });
            return res.status(201).json(newPlan.id);
        }
        catch (error) {
            console.error("Error creating membership plan:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    static async updateMembershipPlan(req, res) {
        try {
            const { id } = req.params;
            const planData = req.body;
            if (!id || !planData) {
                return res.status(400).json({ message: "Invalid request data" });
            }
            const existingPlan = await membershipPlan_service_1.MembershipPlanService.getMembershipPlanById(id);
            if (!existingPlan) {
                return res.status(404).json({ message: "Membership plan not found" });
            }
            const updatedPlan = await membershipPlan_service_1.MembershipPlanService.updateMembershipPlan(id, {
                name: planData.name ?? existingPlan.name,
                description: planData.description ?? existingPlan.description ?? "",
                amount: planData.amount ?? existingPlan.amount,
                durationDays: planData.durationDays ?? existingPlan.durationDays,
                forRole: planData.forRole === membership_model_1.MembershipRole.User ? membership_model_1.MembershipRole.User : membership_model_1.MembershipRole.Partner,
                credits: planData.credits ?? existingPlan.credits,
                isActive: planData.isActive ?? existingPlan.isActive
            });
            if (!updatedPlan) {
                return res.status(404).json({ message: "Membership plan not found" });
            }
            return res.status(200).json(updatedPlan.id);
        }
        catch (error) {
            console.error("Error updating membership plan:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    static async deleteMembershipPlan(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Plan ID is required" });
            }
            const deletedPlan = await membershipPlan_service_1.MembershipPlanService.deleteMembershipPlan(id);
            if (!deletedPlan) {
                return res.status(404).json({ message: "Membership plan not found" });
            }
            return res.status(200).json({ message: "Membership plan deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting membership plan:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.MembershipPlanController = MembershipPlanController;
//# sourceMappingURL=membershipPlan.controller.js.map