import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OTPService {
  // Generate a 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP in User table
  static async storeOTP(email: string, otp: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Update user's OTP and expiry
    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry: expiresAt,
      },
    });
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (!user.otp || !user.otpExpiry) {
        return { success: false, error: 'No OTP found for this user' };
      }

      // Check if OTP is expired
      if (new Date() > user.otpExpiry) {
        // Clear expired OTP
        await prisma.user.update({
          where: { email },
          data: {
            otp: null,
            otpExpiry: null,
          },
        });
        return { success: false, error: 'OTP has expired' };
      }

      // Check if OTP matches
      if (user.otp !== otp) {
        return { success: false, error: 'Invalid OTP' };
      }

      // OTP is valid, clear it
      await prisma.user.update({
        where: { email },
        data: {
          otp: null,
          otpExpiry: null,
        },
      });
      
      return { success: true };

    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Clean up expired OTPs (can be called periodically)
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      await prisma.user.updateMany({
        where: {
          otpExpiry: {
            lt: new Date(),
          },
        },
        data: {
          otp: null,
          otpExpiry: null,
        },
      });
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }

  // Get OTP status for rate limiting
  static async getOTPStatus(email: string): Promise<{
    exists: boolean;
    expiresAt?: Date;
    canRequest: boolean;
    timeUntilNextRequest?: number; // in seconds
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.otp || !user.otpExpiry) {
        return { exists: false, canRequest: true };
      }

      const now = new Date();
      const otpCreationTime = user.updatedAt; // Assuming updatedAt reflects when OTP was set
      const timeSinceCreation = now.getTime() - otpCreationTime.getTime();
      const minInterval = 60 * 1000; // 1 minute between requests

      // Check if OTP is expired
      if (now > user.otpExpiry) {
        // Clean up expired OTP
        await prisma.user.update({
          where: { email },
          data: {
            otp: null,
            otpExpiry: null,
          },
        });
        return { exists: false, canRequest: true };
      }

      const canRequest = timeSinceCreation >= minInterval;
      const timeUntilNextRequest = canRequest ? 0 : Math.ceil((minInterval - timeSinceCreation) / 1000);

      return {
        exists: true,
        expiresAt: user.otpExpiry,
        canRequest,
        timeUntilNextRequest,
      };

    } catch (error) {
      console.error('Error getting OTP status:', error);
      return { exists: false, canRequest: true };
    }
  }
}
