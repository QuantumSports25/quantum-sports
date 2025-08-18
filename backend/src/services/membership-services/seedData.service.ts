import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SeedDataService {
  static async seedMembershipPlans() {
    try {
      console.log('Seeding membership plans (add missing and sync changes)...');

      const membershipPlans = [
        {
          name: 'Basic Pro',
          description: 'Get started with premium sports booking experience',
          amount: 5000, // ₹50.00 (stored in paise)
          credits: 6000, // ₹60.00 worth of credits (stored in paise)
          forRole: 'user' as any,
          durationDays: 365, // 1 year
          isActive: true,
        },
        {
          name: 'Premium Elite',
          description: 'Ultimate sports booking experience with exclusive perks',
          amount: 10000, // ₹100.00 (stored in paise)
          credits: 12000, // ₹120.00 worth of credits (stored in paise)
          forRole: 'user' as any,
          durationDays: 365, // 1 year
          isActive: true,
        },
        {
          name:'Partner Membership',
          description:'Get started with premium sports booking experience',
          amount:4999,
          credits:4999,
          forRole:'partner' as any,
          durationDays:30,
          isActive:true,
        }
      ];

      let createdCount = 0;
      let updatedCount = 0;

      for (const plan of membershipPlans) {
        const existing = await prisma.membershipPlan.findFirst({
          where: {
            name: plan.name,
            forRole: plan.forRole as any,
          },
        });

        if (!existing) {
          await prisma.membershipPlan.create({ data: plan });
          createdCount += 1;
          continue;
        }

        const needsUpdate =
          existing.description !== plan.description ||
          existing.amount !== plan.amount ||
          existing.credits !== plan.credits ||
          existing.durationDays !== plan.durationDays ||
          existing.isActive !== plan.isActive;

        if (needsUpdate) {
          await prisma.membershipPlan.update({
            where: { id: existing.id },
            data: {
              description: plan.description,
              amount: plan.amount,
              credits: plan.credits,
              durationDays: plan.durationDays,
              isActive: plan.isActive,
            },
          });
          updatedCount += 1;
        }
      }

      const totalPlans = await prisma.membershipPlan.findMany();
      console.log(`✅ Seeding done. Created: ${createdCount}, Updated: ${updatedCount}, Total plans now: ${totalPlans.length}`);
      return totalPlans;
    } catch (error) {
      console.error('Error seeding membership plans:', error);
      throw error;
    }
  }

  static async seedAllData() {
    try {
      console.log('🌱 Starting data seeding...');
      
      await this.seedMembershipPlans();
      
      console.log('✅ Data seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during data seeding:', error);
      throw error;
    }
  }
} 