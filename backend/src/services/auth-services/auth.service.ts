import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EmailService } from "./email.service";
import { User, UserRole} from "../../models/user.model";

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
        role: user.role === "partner" ? UserRole.PARTNER : UserRole.USER,
      };

      return userData;
    } catch (error) {
      console.error("Get User By ID Error:", error);
      throw new Error("Failed to retrieve user: " + error);
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

      console.log("Retrieved Users:", users);

      const allUsers = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user?.phone ?? "",
        role: user.role === "partner" ? UserRole.PARTNER : UserRole.USER,
      }));

      return allUsers;
    } catch (error) {
      console.error("Get All Users Error:", error);
      throw new Error("Failed to retrieve users: " + error);
    }
  }
}
