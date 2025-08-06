"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class WalletService {
    static async getWalletBalance(userId) {
        try {
            const wallet = await prisma.wallet.findUnique({
                where: { userId },
            });
            return wallet ? wallet.balance : 0;
        }
        catch (error) {
            console.error("Error fetching wallet balance:", error);
            return 0;
        }
    }
    static async updateUserWallet(userId, credits) {
        try {
            const wallet = await prisma.wallet.upsert({
                where: { userId },
                update: {
                    balance: {
                        increment: credits,
                    },
                },
                create: {
                    userId,
                    balance: credits,
                },
            });
            return wallet;
        }
        catch (error) {
            console.error("Error updating user wallet:", error);
            throw error;
        }
    }
    static async addCredits(userId, credits) {
        try {
            const userExists = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!userExists) {
                console.error(`User ${userId} not found in database`);
                return false;
            }
            await prisma.wallet.upsert({
                where: { userId },
                update: {
                    balance: {
                        increment: credits,
                    },
                },
                create: {
                    userId,
                    balance: credits,
                },
            });
            console.log(`✅ Added ${credits} credits to user ${userId} wallet`);
            return true;
        }
        catch (error) {
            console.error(`Failed to add credits to wallet for user ${userId}:`, error);
            return false;
        }
    }
    static async deductCredits(userId, credits) {
        try {
            const wallet = await prisma.wallet.findUnique({
                where: { userId },
            });
            if (!wallet || wallet.balance < credits) {
                console.error(`Insufficient balance for user ${userId}`);
                return false;
            }
            await prisma.wallet.update({
                where: { userId },
                data: {
                    balance: {
                        decrement: credits,
                    },
                },
            });
            return true;
        }
        catch (error) {
            console.error(`Failed to deduct credits from wallet for user ${userId}:`, error);
            throw new Error(`Failed to deduct credits: ${error.message}`);
        }
    }
    static async getUserWallet(userId) {
        try {
            const wallet = await prisma.wallet.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            return wallet;
        }
        catch (error) {
            console.error("Error fetching user wallet:", error);
            throw error;
        }
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=wallet.services.js.map