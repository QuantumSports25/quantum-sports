import { Request, Response } from "express";
import { WalletService } from "../../services/payment-wallet-services/wallet.services";
import { SortDirection } from "../../models/event.model";

export class WalletController {
  static async getWalletBalance(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const balance = await WalletService.getWalletBalance(userId);

      return res.status(200).json({
        success: true,
        balance: balance,
      });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  static async getUserWallet(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const wallet = await WalletService.getUserWallet(userId);

      return res.status(200).json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      console.error("Error fetching user wallet:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  static async addCredits(req: Request, res: Response) {
    try {
      const { userId, credits } = req.body;

      if (!userId || !credits) {
        return res
          .status(400)
          .json({ message: "User ID and credits are required" });
      }

      const success = await WalletService.addCredits(userId, credits);

      if (success) {
        return res.status(200).json({
          success: true,
          message: "Credits added successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Failed to add credits",
        });
      }
    } catch (error) {
      console.error("Error adding credits:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  static async deductCredits(req: Request, res: Response) {
    try {
      const { userId, credits } = req.body;

      if (!userId || !credits) {
        return res
          .status(400)
          .json({ message: "User ID and credits are required" });
      }

      const success = await WalletService.deductCredits(userId, credits);

      if (success) {
        return res.status(200).json({
          success: true,
          message: "Credits deducted successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Failed to deduct credits - insufficient balance",
        });
      }
    } catch (error) {
      console.error("Error deducting credits:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  static async getWalletHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const {
        page = 1,
        pageSize = 10,
        sort,
      } = req.query as unknown as {
        page?: number;
        pageSize?: number;
        sort?: SortDirection;
      };

      let { createdBefore, createdAfter } = req.query as unknown as {
        createdBefore?: string;
        createdAfter?: string;
      };

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }


      const history = await WalletService.getWalletHistory(
        userId,
        page,
        pageSize,
        sort,
        createdBefore ?? "",
        createdAfter ?? ""
      );

      return res.status(200).json({
        success: true,
        data: history,
        total: history.length,
        pageSize: pageSize,
        page: page,
      });
    } catch (error) {
      console.error("Error fetching wallet history:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}
