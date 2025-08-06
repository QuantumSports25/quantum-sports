"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_service_1 = require("./email.service");
const prisma = new client_1.PrismaClient();
class AuthService {
    static async registerUser(data) {
        try {
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            const userData = {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            };
            if (data.phone) {
                userData.phone = data.phone;
            }
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser) {
                return {
                    success: false,
                    error: 'Email already exists',
                    details: { email: data.email }
                };
            }
            if (!userData.name || userData.name.length < 2) {
                return {
                    success: false,
                    error: 'Invalid name',
                    details: { name: userData.name }
                };
            }
            const user = await prisma.user.create({
                data: userData,
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env['JWT_SECRET'] || 'your-secret-key', { expiresIn: '24h' });
            return {
                success: true,
                user: { id: user.id, name: user.name, email: user.email },
                token
            };
        }
        catch (error) {
            console.error('Registration error details:', {
                errorType: error instanceof Error ? error.constructor.name : 'Unknown',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorStack: error instanceof Error ? error.stack : 'No stack trace',
                userData: {
                    name: data.name,
                    email: data.email,
                    phoneProvided: !!data.phone
                }
            });
            if (error instanceof Error) {
                if (error.message.includes('Unique constraint')) {
                    return {
                        success: false,
                        error: 'Email already exists',
                        details: { email: data.email }
                    };
                }
                if (error.message.includes('Foreign key constraint')) {
                    return {
                        success: false,
                        error: 'Invalid related data',
                        details: { message: error.message }
                    };
                }
                if (error.message.includes('Validation failed')) {
                    return {
                        success: false,
                        error: 'Data validation failed',
                        details: { message: error.message }
                    };
                }
            }
            return {
                success: false,
                error: 'Registration failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async registerPartner(data) {
        try {
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser) {
                return {
                    success: false,
                    error: 'Email already exists',
                    details: { email: data.email }
                };
            }
            const user = await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    phone: data.phone,
                    role: 'partner',
                    partnerDetails: {
                        create: {
                            companyName: data.companyName,
                            subscriptionType: data.subscriptionType,
                            gstNumber: data.gstNumber ?? null,
                            websiteUrl: data.websiteUrl ?? null
                        }
                    }
                },
                include: {
                    partnerDetails: true
                }
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env['JWT_SECRET'] || 'your-secret-key', { expiresIn: '24h' });
            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    partnerDetails: user.partnerDetails
                },
                token
            };
        }
        catch (error) {
            console.error('Partner Registration Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Partner registration failed'
            };
        }
    }
    static async sendLoginOTP(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return { success: false, error: 'User not found' };
            }
            const otp = email_service_1.EmailService.generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await prisma.user.update({
                where: { email },
                data: {
                    otp,
                    otpExpiry,
                },
            });
            const emailSent = await email_service_1.EmailService.sendOTP(email, otp);
            if (!emailSent) {
                return { success: false, error: 'Failed to send OTP email' };
            }
            return { success: true, message: 'OTP sent successfully' };
        }
        catch (error) {
            return { success: false, error: 'Failed to send OTP' };
        }
    }
    static async verifyOTP(email, otp) {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return { success: false, error: 'User not found' };
            }
            const userWithOTP = user;
            if (userWithOTP.otp !== otp || !userWithOTP.otpExpiry || userWithOTP.otpExpiry < new Date()) {
                return { success: false, error: 'Invalid or expired OTP' };
            }
            await prisma.user.update({
                where: { email },
                data: {
                    otp: null,
                    otpExpiry: null,
                },
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env['JWT_SECRET'] || 'your-secret-key', { expiresIn: '24h' });
            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                token,
            };
        }
        catch (error) {
            return { success: false, error: 'OTP verification failed' };
        }
    }
    static async loginUser(email, password, role) {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    partnerDetails: role === 'partner'
                }
            });
            if (!user) {
                throw new Error('User not found');
            }
            if (role && user.role !== role) {
                throw new Error(`Access denied. User is not a ${role}`);
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
                role: user.role
            }, process.env['JWT_SECRET'] || 'your-secret-key', { expiresIn: '24h' });
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };
            if (user.role === 'partner' && 'partnerDetails' in user) {
                userData.partnerDetails = user.partnerDetails;
            }
            return {
                success: true,
                user: userData,
                token,
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed'
            };
        }
    }
    static async partnerLogin(email, password) {
        return this.loginUser(email, password, 'partner');
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map