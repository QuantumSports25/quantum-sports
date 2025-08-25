"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedDataService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SeedDataService {
    static async seedMembershipPlans() {
        try {
            console.log('Seeding membership plans (add missing and sync changes)...');
            const membershipPlans = [
                {
                    name: 'Basic Pro',
                    description: 'Get started with premium sports booking experience',
                    amount: 5000,
                    credits: 6000,
                    forRole: 'user',
                    durationDays: 365,
                    isActive: true,
                },
                {
                    name: 'Premium Elite',
                    description: 'Ultimate sports booking experience with exclusive perks',
                    amount: 10000,
                    credits: 12000,
                    forRole: 'user',
                    durationDays: 365,
                    isActive: true,
                },
                {
                    name: 'Partner Membership',
                    description: 'Get started with premium venue adding experience',
                    amount: 4999,
                    credits: 4999,
                    forRole: 'partner',
                    durationDays: 30,
                    isActive: true,
                },
                {
                    name: 'Revenue Share',
                    description: 'Get started with premium and low commission sports booking experience',
                    amount: 0,
                    credits: 0,
                    forRole: 'partner',
                    durationDays: 30,
                    isActive: true,
                }
            ];
            let createdCount = 0;
            let updatedCount = 0;
            for (const plan of membershipPlans) {
                const existing = await prisma.membershipPlan.findFirst({
                    where: {
                        name: plan.name,
                        forRole: plan.forRole,
                    },
                });
                if (!existing) {
                    await prisma.membershipPlan.create({ data: plan });
                    createdCount += 1;
                    continue;
                }
                const needsUpdate = existing.description !== plan.description ||
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
        }
        catch (error) {
            console.error('Error seeding membership plans:', error);
            throw error;
        }
    }
    static async seedAllData() {
        try {
            console.log('🌱 Starting data seeding...');
            await this.seedMembershipPlans();
            console.log('✅ Data seeding completed successfully!');
        }
        catch (error) {
            console.error('❌ Error during data seeding:', error);
            throw error;
        }
    }
}
exports.SeedDataService = SeedDataService;
//# sourceMappingURL=seedData.service.js.map