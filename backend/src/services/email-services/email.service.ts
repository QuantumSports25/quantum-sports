import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to other providers
    auth: {
      user: process.env['EMAIL_USER'],
      pass: process.env['EMAIL_APP_PASSWORD'],
    },
  });

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: {
          name: 'Quantum Sports',
          address: process.env['EMAIL_USER'] || 'noreply@quantumsports.com',
        },
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Fallback plain text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  static async sendOTPEmail(email: string, otp: string, type: 'login' | 'forgot-password' = 'login'): Promise<boolean> {
    const subject = type === 'login' ? 'Your Login OTP - Quantum Sports' : 'Password Reset OTP - Quantum Sports';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏃‍♂️ Quantum Sports</h1>
            <p>${type === 'login' ? 'Login Verification' : 'Password Reset'}</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>${type === 'login' 
              ? 'You requested a login OTP for your Quantum Sports account.' 
              : 'You requested to reset your password for your Quantum Sports account.'
            }</p>
            
            <div class="otp-box">
              <p>Your OTP Code is:</p>
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>This OTP is valid for 10 minutes.</strong></p>
            
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <ul>
                <li>Never share this OTP with anyone</li>
                <li>Quantum Sports will never ask for your OTP via phone or email</li>
                <li>If you didn't request this OTP, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Quantum Sports. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Alias for backward compatibility
  static async sendOTP(email: string, otp: string): Promise<boolean> {
    return this.sendOTPEmail(email, otp, 'login');
  }

  static async sendWelcomeEmail(email: string, name: string, userType: 'user' | 'partner' = 'user'): Promise<boolean> {
    const subject = `Welcome to Quantum Sports${userType === 'partner' ? ' - Partner Account' : ''}!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .features { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏃‍♂️ Welcome to Quantum Sports!</h1>
            <p>Your ${userType === 'partner' ? 'Partner' : 'Sports'} Journey Begins Here</p>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Thank you for joining Quantum Sports! We're excited to have you as part of our community.</p>
            
            ${userType === 'partner' ? `
            <div class="features">
              <h3>🤝 Partner Benefits</h3>
              <ul>
                <li>✅ Venue management dashboard</li>
                <li>✅ Booking analytics and reports</li>
                <li>✅ Revenue tracking</li>
                <li>✅ Customer management</li>
                <li>✅ Priority support</li>
              </ul>
            </div>
            ` : `
            <div class="features">
              <h3>🎾 What You Can Do</h3>
              <ul>
                <li>✅ Book sports venues instantly</li>
                <li>✅ Purchase sports equipment</li>
                <li>✅ Join membership plans</li>
                <li>✅ Track your activities</li>
                <li>✅ Connect with fellow sports enthusiasts</li>
              </ul>
            </div>
            `}
            
            <p>Ready to get started?</p>
            <a href="${process.env['FRONTEND_URL'] || 'https://quantumsports.com'}" class="button">
              Explore Now
            </a>
            
            <p>If you have any questions, our support team is always here to help!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Quantum Sports. All rights reserved.</p>
            <p>Follow us on social media for updates and tips!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendPasswordResetSuccessEmail(email: string, name: string): Promise<boolean> {
    const subject = 'Password Reset Successful - Quantum Sports';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .security-tips { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00b894; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Successful</h1>
            <p>Your account is secure</p>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2>Hi ${name}!</h2>
            <p>Your password has been successfully reset for your Quantum Sports account.</p>
            <p><strong>Reset completed at:</strong> ${new Date().toLocaleString()}</p>
            
            <div class="security-tips">
              <h3>🛡️ Security Tips</h3>
              <ul>
                <li>Use a strong, unique password</li>
                <li>Don't reuse passwords from other accounts</li>
                <li>Consider enabling two-factor authentication</li>
                <li>Log out of shared devices</li>
              </ul>
            </div>
            
            <p>If you didn't make this change, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Quantum Sports. All rights reserved.</p>
            <p>This is a security notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }
}
