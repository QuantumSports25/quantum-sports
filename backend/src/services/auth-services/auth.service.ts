import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EmailService } from "./email.service";
import { User, UserRole, MembershipSummary } from "../../models/user.model";

const prisma = new PrismaClient();

export class AuthService {
  static async registerUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const userData: any = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      };

      if (data.phone) {
        userData.phone = data.phone;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          error: "Email already exists",
          details: { email: data.email },
        };
      }

      // Validate input data
      if (!userData.name || userData.name.length < 2) {
        return {
          success: false,
          error: "Invalid name",
          details: { name: userData.name },
        };
      }

      const user = await prisma.user.create({
        data: userData,
      });

      // Generate JWT token for the newly registered user
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env["JWT_SECRET"] || "",
        { expiresIn: "24h" }
      );

      return {
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
        token,
      };
    } catch (error) {
      // Comprehensive error logging
      console.error("Registration error details:", {
        errorType: error instanceof Error ? error.constructor.name : "Unknown",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : "No stack trace",
        userData: {
          name: data.name,
          email: data.email,
          phoneProvided: !!data.phone,
        },
      });

      // More detailed error handling
      if (error instanceof Error) {
        // Check for various potential error types
        if (error.message.includes("Unique constraint")) {
          return {
            success: false,
            error: "Email already exists",
            details: { email: data.email },
          };
        }

        if (error.message.includes("Foreign key constraint")) {
          return {
            success: false,
            error: "Invalid related data",
            details: { message: error.message },
          };
        }

        if (error.message.includes("Validation failed")) {
          return {
            success: false,
            error: "Data validation failed",
            details: { message: error.message },
          };
        }
      }

      return {
        success: false,
        error: "Registration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async registerPartner(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    companyName: string;
    subscriptionType: "fixed" | "revenue";
    gstNumber?: string | null;
    websiteUrl?: string | null;
  }) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          error: "Email already exists",
          details: { email: data.email },
        };
      }

      // Create partner user
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          role: "partner",
          partnerDetails: {
            create: {
              companyName: data.companyName,
              subscriptionType: data.subscriptionType,
              gstNumber: data.gstNumber ?? null,
              websiteUrl: data.websiteUrl ?? null,
            },
          },
        },
        include: {
          partnerDetails: true,
        },
      });

      // Generate JWT token for the newly registered partner
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env["JWT_SECRET"] || "your-secret-key",
        { expiresIn: "24h" }
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          partnerDetails: user.partnerDetails,
        },
        token,
      };
    } catch (error) {
      console.error("Partner Registration Error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Partner registration failed",
      };
    }
  }

  static async sendLoginOTP(email: string) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Generate OTP
      const otp = EmailService.generateOTP();
      if (process.env["NODE_ENV"] !== "production") {
        console.log(`[DEV] Login OTP for ${email}: ${otp}`);
      }
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await prisma.user.update({
        where: { email },
        data: {
          otp,
          otpExpiry,
        } as any,
      });

      // Send OTP via email
      const emailSent = await EmailService.sendOTP(email, otp);

      if (!emailSent) {
        return { success: false, error: "Failed to send OTP email" };
      }

      return { success: true, message: "OTP sent successfully" };
    } catch (error) {
      return { success: false, error: "Failed to send OTP" };
    }
  }

  static async verifyOTP(email: string, otp: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Check if OTP matches and is not expired
      const userWithOTP = user as any;
      if (
        userWithOTP.otp !== otp ||
        !userWithOTP.otpExpiry ||
        userWithOTP.otpExpiry < new Date()
      ) {
        return { success: false, error: "Invalid or expired OTP" };
      }

      // Clear OTP after successful verification
      await prisma.user.update({
        where: { email },
        data: {
          otp: null,
          otpExpiry: null,
        } as any,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env["JWT_SECRET"] || "your-secret-key",
        { expiresIn: "24h" }
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      return { success: false, error: "OTP verification failed" };
    }
  }

  static async loginUser(
    email: string,
    password: string,
    role?: "user" | "partner" | "admin"
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          partnerDetails: role === "partner", // Only include partner details if role is partner
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // If a specific role is provided, check if it matches
      if (role && user.role !== role) {
        throw new Error(`Access denied. User is not a ${role}`);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env["JWT_SECRET"] || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Prepare user data to return
      const userData: any = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      // If it's a partner login, include partner details
      if (user.role === "partner" && user.partnerDetails) {
        userData.partnerDetails = user.partnerDetails;
      }

      return {
        success: true,
        user: userData,
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  // Add a specific partner login method for clarity
  static async partnerLogin(email: string, password: string) {
    return this.loginUser(email, password, "partner");
  }

  static async initiatePasswordReset(email: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      // Always return success to avoid user enumeration
      if (!user) {
        return { success: true };
      }

      const code = EmailService.generateOTP();
      if (process.env["NODE_ENV"] !== "production") {
        console.log(`[DEV] Password reset code for ${email}: ${code}`);
      }
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: { otp: code, otpExpiry },
      });

      await EmailService.sendPasswordResetOTP(email, code, 15);
      return { success: true };
    } catch (error) {
      console.error("initiatePasswordReset error:", error);
      return { success: true };
    }
  }

  static async verifyPasswordResetCode(email: string, code: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.otp || !user.otpExpiry) {
        return { success: false, error: "Invalid or expired code" };
      }
      if (user.otp !== code || user.otpExpiry < new Date()) {
        return { success: false, error: "Invalid or expired code" };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: "Invalid or expired code" };
    }
  }

  static async resetPasswordWithCode(email: string, code: string, newPassword: string) {
    try {
      const verify = await this.verifyPasswordResetCode(email, code);
      if (!verify.success) {
        return verify;
      }
      if (newPassword.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long" };
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashed, otp: null, otpExpiry: null },
      });
      return { success: true };
    } catch (error) {
      console.error("resetPasswordWithCode error:", error);
      return { success: false, error: "Reset failed" };
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          partnerDetails: true, // Include partner details if available
        },
      });

      if (!user) {
        throw new Error("User not found for userId: " + userId);
      }

      const userData: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user?.phone ?? "",
        role:
          user.role === "partner"
            ? UserRole.PARTNER
            : user.role === "admin"
            ? UserRole.ADMIN
            : UserRole.USER,
      };

      return userData;
    } catch (error) {
      console.error("Get User By ID Error:", error);
      throw new Error("Failed to retrieve user: " + error);
    }
  }

  static async updateUserProfile(
    userId: string,
    data: { name?: string; phone?: string }
  ): Promise<User> {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(typeof data.name === "string" ? { name: data.name } : {}),
          ...(typeof data.phone === "string" ? { phone: data.phone } : {}),
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated?.phone ?? "",
        role:
          updated.role === "partner"
            ? UserRole.PARTNER
            : updated.role === "admin"
            ? UserRole.ADMIN
            : UserRole.USER,
      };
    } catch (error) {
      console.error("Update User Profile Error:", error);
      throw new Error("Failed to update profile");
    }
  }

  static async changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.password) {
        throw new Error("User not found");
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new Error("Current password is incorrect");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });
    } catch (error) {
      console.error("Change Password Error:", error);
      throw error instanceof Error ? error : new Error("Failed to change password");
    }
  }

  static async getAllUsers(
    limit: number,
    offset: number,
    role?: UserRole
  ): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        skip: offset,
        take: limit,
        ...(role ? { where: { role } } : {}),
      });

      const userIds = users.map((u) => u.id);
      const memberships = userIds.length
        ? await prisma.membership.findMany({
            where: {
              isActive: true,
              userId: { in: userIds },
            },
            orderBy: { createdAt: "desc" },
            include: { plan: true },
          })
        : [];

      const latestMembershipByUserId = new Map<string, any>();
      for (const m of memberships) {
        if (!latestMembershipByUserId.has(m.userId)) {
          latestMembershipByUserId.set(m.userId, m);
        }
      }

      console.log("Retrieved Users:", users);

      const allUsers = users.map((user: any) => {
        let membership: MembershipSummary | undefined;
        const latestActive = latestMembershipByUserId.get(user.id);
        if (latestActive) {
          membership = {
            id: latestActive.id,
            planId: latestActive.planId,
            planName: latestActive.plan?.name || "unknown",
            amount: latestActive.plan?.amount ?? 0,
            credits: latestActive.plan?.credits ?? 0,
            startedAt: latestActive.startedAt,
            expiresAt: latestActive.expiresAt,
            isActive: latestActive.isActive,
          };
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user?.phone ?? "",
          role: user.role === "partner" ? UserRole.PARTNER : UserRole.USER,
          membership,
        } as User;
      });

      return allUsers;
    } catch (error) {
      console.error("Get All Users Error:", error);
      throw new Error("Failed to retrieve users: " + error);
    }
  }
}
