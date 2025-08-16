import { PrismaClient } from "@prisma/client";
import { SortDirection } from "../../models/event.model";
import {
  Currency,
  IUiTransaction,
  PaymentMethod,
} from "../../models/payment.model";

const prisma = new PrismaClient();

export class WalletService {
  static async getWalletBalance(userId: string): Promise<number> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      return wallet ? wallet.balance : 0;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      return 0;
    }
  }

  static async updateUserWallet(userId: string, credits: number) {
    try {
      // Create or update wallet
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
    } catch (error) {
      console.error("Error updating user wallet:", error);
      throw error;
    }
  }

  static async addCredits(userId: string, credits: number): Promise<boolean> {
    try {
      // First verify the user exists
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
    } catch (error) {
      console.error(
        `Failed to add credits to wallet for user ${userId}:`,
        error
      );
      return false;
    }
  }

  static async deductCredits(
    userId: string,
    credits: number
  ): Promise<boolean> {
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
    } catch (error: any) {
      console.error(
        `Failed to deduct credits from wallet for user ${userId}:`,
        error
      );
      throw new Error(`Failed to deduct credits: ${error.message}`);
    }
  }

  static async getUserWallet(userId: string) {
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
    } catch (error) {
      console.error("Error fetching user wallet:", error);
      throw error;
    }
  }

  static async getWalletHistory(
    userId: string,
    page: number,
    pageSize: number,
    sortDirection: SortDirection = SortDirection.Desc,
    createdBefore?: string,
    createdAfter?: string
  ): Promise<IUiTransaction[]> {
    try {
      const history = await prisma.transactionHistory.findMany({
        where: {
          userId,
          ...(createdBefore && { capturedAt: { lte: new Date(createdBefore) } }),
          ...(createdAfter && { capturedAt: { gte: new Date(createdAfter) } }),
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          capturedAt: sortDirection,
        },
      });

      const data: IUiTransaction[] = history.map((item) => ({
        id: item.orderId,
        amount: Number(item.paymentAmount),
        currency: item.paymentCurrency as unknown as Currency,
        paymentMethod: item.paymentMethod as unknown as PaymentMethod,
        bookingId: item.bookingId ?? "",
        membershipId: item.membershipId ?? "",
        name: item.name,
        captured: item.captured ?? false,
        capturedAt: item.capturedAt ?? new Date(0),
      }));

      return data;
    } catch (error) {
      console.error("Error fetching wallet history:", error);
      throw error;
    }
  }
}
