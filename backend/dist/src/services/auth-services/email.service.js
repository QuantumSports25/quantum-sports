"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    static async sendOTP(email, otp) {
        try {
            const mailOptions = {
                from: process.env['EMAIL_USER'],
                to: email,
                subject: 'Login OTP - Quantum Sports',
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
            };
            await this.transporter.sendMail(mailOptions);
            return true;
        }
        catch (error) {
            console.error('Email sending failed:', error);
            return false;
        }
    }
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
exports.EmailService = EmailService;
EmailService.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASSWORD'],
    },
});
//# sourceMappingURL=email.service.js.map