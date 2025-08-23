// src/services/EmailService.ts
import nodemailer from "nodemailer";

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  // Initialize transporter with Mailtrap credentials
  private static getTransporter() {
    if (this.transporter) return this.transporter;

    this.transporter = nodemailer.createTransport({
      host: process.env["SMTP_HOST"],
      port: Number(process.env["SMTP_PORT"]) || 587,
      secure: process.env["SMTP_SECURE"] === "true", // Mailtrap = false
      auth: {
        user: process.env["SMTP_USER"],
        pass: process.env["SMTP_PASS"],
      },
    });

    return this.transporter;
  }

  private static getFromAddress(): string {
    return (
      process.env["EMAIL_USER"] ||
      process.env["SMTP_USER"] ||
      '"Quantum Sports" <no-reply@quantumsports.com>'
    );
  }

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Backwards-compatible: send login OTP (as used by AuthService.sendLoginOTP)
  static async sendOTP(email: string, otp: string): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: "Login OTP - Quantum Sports",
        text: `Your login OTP is: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Quantum Sports Login</h2>
            <p>Your login OTP is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
        `,
      });

      console.log("[EmailService] OTP email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("[EmailService] Error sending OTP email:", error);
      return false;
    }
  }

  // Send Password Reset Link Email (not used in current OTP flow but kept if needed)
  static async sendPasswordResetEmail(to: string, resetLink: string) {
    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: this.getFromAddress(),
        to,
        subject: "Password Reset Request",
        text: `Click this link to reset your password: ${resetLink}`,
        html: `<p>Click here to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
      });

      console.log("[EmailService] Password reset link email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("[EmailService] Error sending reset email:", error);
      return false;
    }
  }

  // Send Password Reset OTP (as used by AuthService.initiatePasswordReset)
  static async sendPasswordResetOTP(
    email: string,
    otp: string,
    expiresInMinutes = 15
  ): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: "Reset your password - Quantum Sports",
        text: `Use this 6-digit code to reset your password: ${otp} (expires in ${expiresInMinutes} minutes)`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #111827;">Reset your password</h2>
            <p>Use the following 6-digit code to reset your password:</p>
            <div style="background-color: #111827; color: #fff; padding: 16px 24px; text-align: center; margin: 20px 0; border-radius: 12px;">
              <h1 style="font-size: 32px; letter-spacing: 6px; margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in ${expiresInMinutes} minutes.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `,
      });

      console.log("[EmailService] Password reset OTP email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("[EmailService] Password reset OTP email failed:", error);
      return false;
    }
  }

  // Send Test Email (to confirm Mailtrap works)
  static async sendTestEmail(to: string = "test@example.com") {
    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: this.getFromAddress(),
        to,
        subject: "Hello from Mailtrap",
        text: "This is a test email sent via Mailtrap SMTP.",
      });

      console.log("[EmailService] Test email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("[EmailService] Error sending test email:", error);
      return false;
    }
  }
}
