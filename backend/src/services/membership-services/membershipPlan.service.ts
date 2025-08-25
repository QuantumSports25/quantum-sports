import prisma from "../../config/db";
import { MembershipPlan, MembershipRole } from "../../models/membership.model";

// Use shared Prisma client

export class MembershipPlanService {
  static async getAllMembershipPlans(
    orderBy: "asc" | "desc" = "desc"
  ): Promise<MembershipPlan[]> {
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
        forRole: MembershipRole[plan.forRole as keyof typeof MembershipRole],
        credits: plan.credits,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      }));

      return newPlans;
    } catch (error) {
      console.error("Error fetching membership plans:", error);
      throw error;
    }
  }

  static async getActiveMembershipPlans(): Promise<MembershipPlan[]> {
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
        forRole: MembershipRole[plan.forRole as keyof typeof MembershipRole],
        credits: plan.credits,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      }));

      return newPlans;
    } catch (error) {
      console.error("Error fetching active membership plans:", error);
      throw error;
    }
  }
  // Helper method to find plan by name pattern (for basic/premium matching)
  static async getMembershipPlanByName(namePattern: string) {
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

      const newPlan: MembershipPlan = {
        id: plan.id,
        name: plan.name,
        description: plan?.description ?? "",
        amount: plan.amount,
        durationDays: plan.durationDays,
        forRole: plan.forRole as MembershipRole,
        credits: plan.credits,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };

      return newPlan;
    } catch (error) {
      console.error("Error fetching membership plan by name:", error);
      throw error;
    }
  }

  static async getMembershipPlanById(id: string) {
    try {
      const plan = await prisma.membershipPlan.findUnique({
        where: { id },
      });
      if (!plan) {
        throw new Error("Membership plan not found");
      }

      const newPlan: MembershipPlan = {
        id: plan.id,
        name: plan.name,
        description: plan?.description ?? "",
        amount: plan.amount,
        durationDays: plan.durationDays,
        forRole: plan.forRole as MembershipRole,
        credits: plan.credits,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };

      return newPlan;
    } catch (error) {
      console.error("Error fetching membership plan by id:", error);
      throw error;
    }
  }

  static async createMembershipPlan({
    name,
    description,
    amount,
    durationDays,
    forRole,
    credits,
    isActive = true,
  }: {
    name: string;
    description: string;
    amount: number;
    durationDays: number;
    forRole: MembershipRole;
    credits: number;
    isActive: boolean;
  }): Promise<MembershipPlan> {
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

      const newPlan: MembershipPlan = {
        id: plan.id,
        name: plan.name,
        description: plan?.description ?? "",
        amount: plan.amount,
        durationDays: plan.durationDays,
        forRole: forRole as MembershipRole,
        credits: plan.credits,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };

      return newPlan;
    } catch (error) {
      console.error("Error creating membership plan:", error);
      throw error;
    }
  }

  static async updateMembershipPlan(
    id: string,
    data: {
      name?: string;
      description?: string;
      amount?: number;
      durationDays?: number;
      forRole?: MembershipRole;
      credits?: number;
      isActive?: boolean;
    }
  ): Promise<MembershipPlan | null> {
    try {
      const plan = await prisma.membershipPlan.update({
        where: { id },
        data,
      });
      if (!plan) {
        throw new Error("Failed to update membership plan");
      }

      const newPlan: MembershipPlan = {
        id: plan.id,
        name: plan.name,
        description: plan?.description ?? "",
        amount: plan.amount,
        durationDays: plan.durationDays,
        forRole: plan.forRole as MembershipRole,
        credits: plan.credits,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };

      return newPlan;
    } catch (error) {
      console.error("Error updating membership plan:", error);
      throw error;
    }
  }

  static async deleteMembershipPlan(id: string) {
    try {
      const plan = await prisma.membershipPlan.delete({
        where: { id },
      });
      if (!plan) {
        throw new Error("Failed to delete membership plan");
      }

      return plan.id;
    } catch (error) {
      console.error("Error deleting membership plan:", error);
      throw error;
    }
  }
}
