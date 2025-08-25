"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const client_1 = require("@prisma/client");
const event_model_1 = require("../../models/event.model");
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
            console.log(`🔍 Checking wallet balance for user ${userId}`);
            const wallet = await prisma.wallet.findUnique({
                where: { userId },
            });
            if (!wallet) {
                console.error(`Wallet not found for user ${userId}`);
                return false;
            }
            console.log(`💰 Wallet balance for user ${userId}: ${wallet.balance}`);
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
    static async getWalletHistory(userId, page, pageSize, sortDirection = event_model_1.SortDirection.Desc, createdBefore, createdAfter) {
        const updatedAt = {};
        if (createdBefore) {
            const beforeDate = new Date(createdBefore);
            if (!isNaN(beforeDate.getTime())) {
                updatedAt.lte = beforeDate;
            }
        }
        if (createdAfter) {
            const afterDate = new Date(createdAfter);
            if (!isNaN(afterDate.getTime())) {
                updatedAt.gte = afterDate;
            }
        }
        console.log({
            where: {
                userId,
                ...(Object.keys(updatedAt).length > 0 ? { updatedAt } : {}),
            },
            skip: Number((page - 1) * pageSize),
            take: Number(pageSize),
            orderBy: {
                updatedAt: sortDirection,
            },
        });
        try {
            const history = await prisma.transactionHistory.findMany({
                where: {
                    userId,
                    ...(Object.keys(updatedAt).length > 0 ? { updatedAt } : {}),
                },
                skip: Number((page - 1) * pageSize),
                take: Number(pageSize),
                orderBy: {
                    updatedAt: sortDirection,
                },
            });
            const data = history.map((item) => ({
                id: item.orderId,
                amount: Number(item.paymentAmount),
                currency: item.paymentCurrency,
                paymentMethod: item.paymentMethod,
                bookingId: item.bookingId ?? "",
                membershipId: item.membershipId ?? "",
                name: item.name,
                captured: item.captured ?? false,
                capturedAt: item.capturedAt ?? new Date(0),
            }));
            return data;
        }
        catch (error) {
            console.error("Error fetching wallet history:", error);
            throw error;
        }
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=wallet.services.js.map