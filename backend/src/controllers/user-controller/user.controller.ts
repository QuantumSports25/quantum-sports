import { Request, Response } from "express";
import { UserRole } from "../../models/user.model";
import { AuthService } from "../../services/auth-services/auth.service";
import { ShoppingAddress } from "../../models/shop.model";

export class UserController {
  static async getAllUsersByRole(req: Request, res: Response) {
    try {
      const role = req.query["role"];
      console.log(role);
      const { limit = 20, offset = 0 } = req.query as unknown as {
        limit: number;
        offset: number;
      };

      // Only validate role if it is provided
      if (role && !Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${Object.values(
            UserRole
          ).join(", ")}`,
        });
      }

      // Pass role only if present and valid
      const users = await AuthService.getAllUsers(
        limit,
        offset,
        role as UserRole
      );

      if (users && users.length > 0) {
        return res.status(200).json({
          success: true,
          data: users,
          message: "Users retrieved successfully",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No users found",
        });
      }
    } catch (error) {
      console.error("Error retrieving users:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while retrieving users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const authReq = req as any;
      const userId = authReq.user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const user = await AuthService.getUserById(userId);
      return res
        .status(200)
        .json({ success: true, data: user, message: "Profile fetched" });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch profile" });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const authReq = req as any;
      const userId = authReq.user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const body = req.body as { name?: string; phone?: string };
      const updatePayload: { name?: string; phone?: string } = {};
      if (typeof body.name === "string") updatePayload.name = body.name;
      if (typeof body.phone === "string") updatePayload.phone = body.phone;
      const updated = await AuthService.updateUserProfile(
        userId,
        updatePayload
      );
      return res
        .status(200)
        .json({ success: true, data: updated, message: "Profile updated" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    }
  }

  static async addAddress(req: Request, res: Response) {
    try {
      const address = req.body as ShoppingAddress;
      const userId = (req as any).user?.userId;

      if (
        !address.addressLine1 ||
        !address.city ||
        !address.country ||
        !address.postalCode
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All address fields are required" });
      }

      const user = await AuthService.getUserById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const addresses: ShoppingAddress[] = Array.isArray(user?.shippingAddress)
        ? (user.shippingAddress as ShoppingAddress[])
        : [];

      // Check for duplicate
      const exists = addresses.some(
        (a) =>
          a.city === address.city &&
          a.country === address.country &&
          a.postalCode === address.postalCode &&
          a.addressLine1 === address.addressLine1
      );

      if (exists) {
        return res
          .status(409)
          .json({ success: false, message: "Address already exists" });
      }

      const updatedAddresses = [...addresses, address];

      await AuthService.updateAddress(userId, updatedAddresses);
      return res.status(201).json({ success: true, message: "Address added" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to manage address",
      });
    }
  }

  static async deleteAddress(req: Request, res: Response) {
    try {
      const address = req.body as ShoppingAddress;
      const userId = (req as any).user?.userId;

      if (
        !address.addressLine1 ||
        !address.city ||
        !address.country ||
        !address.postalCode
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All address fields are required" });
      }

      const user = await AuthService.getUserById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const addresses: ShoppingAddress[] = Array.isArray(user?.shippingAddress)
        ? (user.shippingAddress as ShoppingAddress[])
        : [];

      // Check for duplicate
      const exists = addresses.some(
        (a) =>
          a.city === address.city &&
          a.country === address.country &&
          a.postalCode === address.postalCode &&
          a.addressLine1 === address.addressLine1
      );

      if (!exists) {
        return res
          .status(404)
          .json({ success: false, message: "Address not found" });
      }

      const updatedAddresses = addresses.filter(
        (a) =>
          a.city !== address.city ||
          a.country !== address.country ||
          a.postalCode !== address.postalCode ||
          a.addressLine1 !== address.addressLine1
      );

      await AuthService.updateAddress(userId, updatedAddresses);
      return res
        .status(200)
        .json({ success: true, message: "Address deleted" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to manage address",
      });
    }
  }

  static async getAllAddress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      const user = await AuthService.getUserById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const addresses: ShoppingAddress[] = Array.isArray(user?.shippingAddress)
        ? (user.shippingAddress as ShoppingAddress[])
        : [];

      return res
        .status(200)
        .json({ success: true, data: addresses, message: "Addresses fetched" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to manage address",
      });
    }
  }
}
