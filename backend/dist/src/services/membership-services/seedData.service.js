"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedDataService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SeedDataService {
    static async seedMembershipPlans() {
        try {
            const existingPlans = await prisma.membershipPlan.findMany();
            if (existingPlans.length > 0) {
                console.log('Membership plans already exist, skipping seed...');
                return existingPlans;
            }
            console.log('Seeding membership plans...');
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
                }
            ];
            const createdPlans = await Promise.all(membershipPlans.map(plan => prisma.membershipPlan.create({ data: plan })));
            console.log(`✅ Created ${createdPlans.length} membership plans`);
            return createdPlans;
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