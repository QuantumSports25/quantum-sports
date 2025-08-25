"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth-services/auth.service");
const user_model_1 = require("../models/user.model");
class AuthController {
    static async register(req, res) {
        try {
            console.log("===== Registration Request Debug =====");
            console.log("Request Body:", JSON.stringify(req.body, null, 2));
            console.log("Request Headers:", JSON.stringify(req.headers, null, 2));
            const { name, email, password, phone } = req.body;
            const validationErrors = [];
            if (!name)
                validationErrors.push("Name is required");
            if (!email)
                validationErrors.push("Email is required");
            if (!password)
                validationErrors.push("Password is required");
            if (validationErrors.length > 0) {
                console.log("Validation Errors:", validationErrors);
                return res.status(400).json({
                    success: false,
                    errors: validationErrors,
                    message: "Invalid input",
                });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log("Invalid email format:", email);
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                    details: { email },
                });
            }
            if (password.length < 6) {
                console.log("Password too short:", password.length);
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters long",
                });
            }
            try {
                const result = await auth_service_1.AuthService.registerUser({
                    name,
                    email,
                    password,
                    phone,
                });
                if (result.success) {
                    console.log("User registered successfully:", result.user);
                    return res.status(201).json({
                        success: true,
                        data: {
                            user: result.user?.id,
                            token: result.token,
                        },
                        message: "User registered successfully",
                    });
                }
                else {
                    console.log("Registration failed:", result.error, "Details:", result.details);
                    return res.status(400).json({
                        success: false,
                        message: result.error || "Registration failed",
                        details: result.details || { name, email, phoneProvided: !!phone },
                    });
                }
            }
            catch (serviceError) {
                console.error("Service registration error:", serviceError);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error during registration",
                    details: serviceError instanceof Error
                        ? serviceError.message
                        : "Unknown error",
                });
            }
        }
        catch (error) {
            console.error("Unexpected registration error:", error);
            return res.status(500).json({
                success: false,
                error: "Registration failed",
                details: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async sendLoginOTP(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: "Email is required",
                });
            }
            const result = await auth_service_1.AuthService.sendLoginOTP(email);
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: { message: result.message },
                    message: "OTP sent successfully",
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: result.error || "Failed to send OTP",
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: "Failed to send OTP",
            });
        }
    }
    static async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({
                    success: false,
                    error: "Email and OTP are required",
                });
            }
            const result = await auth_service_1.AuthService.verifyOTP(email, otp);
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: {
                        user: result.user,
                        token: result.token,
                    },
                    message: "OTP verified successfully",
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: result.error || "OTP verification failed",
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: "OTP verification failed",
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: "Email and password are required",
                });
            }
            const result = await auth_service_1.AuthService.loginUser(email, password);
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: {
                        user: result.user,
                        token: result.token,
                    },
                    message: "Login successful",
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: result.error || "Login failed",
                });
            }
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                error: "Invalid email or password",
            });
        }
    }
    static async registerPartner(req, res) {
        try {
            console.log("===== Partner Registration Request Debug =====");
            console.log("Request Body:", JSON.stringify(req.body, null, 2));
            const { name, email, password, phone, companyName, subscriptionType, gstNumber, websiteUrl, } = req.body;
            const validationErrors = [];
            if (!name)
                validationErrors.push("Name is required");
            if (!email)
                validationErrors.push("Email is required");
            if (!password)
                validationErrors.push("Password is required");
            if (!phone)
                validationErrors.push("Phone number is required");
            if (!companyName)
                validationErrors.push("Company name is required");
            if (!subscriptionType)
                validationErrors.push("Subscription type is required");
            if (validationErrors.length > 0) {
                console.log("Validation Errors:", validationErrors);
                return res.status(400).json({
                    success: false,
                    errors: validationErrors,
                    message: "Invalid input",
                });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log("Invalid email format:", email);
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                    details: { email },
                });
            }
            if (password.length < 6) {
                console.log("Password too short:", password.length);
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters long",
                });
            }
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(phone)) {
                console.log("Invalid phone number:", phone);
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number. Must be 10 digits starting with 6-9.",
                });
            }
            if (gstNumber) {
                const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                if (!gstRegex.test(gstNumber)) {
                    console.log("Invalid GST number:", gstNumber);
                    return res.status(400).json({
                        success: false,
                        message: "Invalid GST number format",
                    });
                }
            }
            if (websiteUrl) {
                const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                if (!urlRegex.test(websiteUrl)) {
                    console.log("Invalid website URL:", websiteUrl);
                    return res.status(400).json({
                        success: false,
                        message: "Invalid website URL format",
                    });
                }
            }
            if (!["fixed", "revenue"].includes(subscriptionType)) {
                console.log("Invalid subscription type:", subscriptionType);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subscription type. Must be "fixed" or "revenue".',
                });
            }
            const result = await auth_service_1.AuthService.registerPartner({
                name,
                email,
                password,
                phone,
                companyName,
                subscriptionType,
                gstNumber,
                websiteUrl,
            });
            if (result.success) {
                return res.status(201).json({
                    success: true,
                    data: {
                        user: result.user,
                        token: result.token,
                    },
                    message: "Partner registration successful",
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: result.error || "Partner registration failed",
                });
            }
        }
        catch (error) {
            console.error("Partner Registration Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error during partner registration",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async partnerLogin(req, res) {
        try {
            console.log("===== Partner Login Request Debug =====");
            console.log("Request Body:", JSON.stringify(req.body, null, 2));
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: "Email and password are required",
                });
            }
            const result = await auth_service_1.AuthService.partnerLogin(email, password);
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: {
                        user: result.user,
                        token: result.token,
                    },
                    message: "Partner login successful",
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: result.error || "Partner login failed",
                });
            }
        }
        catch (error) {
            console.error("Partner Login Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error during partner login",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async adminLogin(req, res) {
        try {
            console.log("===== Admin Login Request Debug =====");
            console.log("Request Body:", JSON.stringify(req.body, null, 2));
            const { email, password } = req.body;
            const validationErrors = [];
            if (!email)
                validationErrors.push("Email is required");
            if (!password)
                validationErrors.push("Password is required");
            if (validationErrors.length > 0) {
                console.log("Admin Login Validation Errors:", validationErrors);
                return res.status(400).json({
                    success: false,
                    errors: validationErrors,
                    message: "Invalid input",
                });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log("Invalid email format:", email);
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                });
            }
            try {
                const result = await auth_service_1.AuthService.loginUser(email, password, "admin");
                console.log("Admin Login Service Result:", {
                    success: result.success,
                    hasUser: !!result.user,
                    hasToken: !!result.token,
                    userRole: result.user?.role,
                });
                if (result.success && result.user && result.token) {
                    if (result.user.role !== "admin") {
                        console.log("Non-admin user attempted admin login:", result.user.email);
                        return res.status(403).json({
                            success: false,
                            message: "Access denied. Admin privileges required.",
                        });
                    }
                    return res.status(200).json({
                        success: true,
                        message: "Admin login successful",
                        data: {
                            user: {
                                id: result.user.id,
                                name: result.user.name,
                                email: result.user.email,
                                role: result.user.role,
                                phone: result.user.phone,
                            },
                            token: result.token,
                        },
                    });
                }
                else {
                    return res.status(401).json({
                        success: false,
                        message: result.error || "Invalid admin credentials",
                    });
                }
            }
            catch (serviceError) {
                console.error("Admin Login Service Error:", serviceError);
                return res.status(401).json({
                    success: false,
                    message: "Invalid admin credentials",
                    details: serviceError instanceof Error
                        ? serviceError.message
                        : "Unknown service error",
                });
            }
        }
        catch (error) {
            console.error("Admin Login Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error during admin login",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async getAllUsersByRole(req, res) {
        try {
            const role = req.query["role"];
            console.log(role);
            const { limit = 20, offset = 0 } = req.query;
            if (role && !Object.values(user_model_1.UserRole).includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid role. Must be one of: ${Object.values(user_model_1.UserRole).join(", ")}`,
                });
            }
            const users = await auth_service_1.AuthService.getAllUsers(limit, offset, role);
            if (users && users.length > 0) {
                return res.status(200).json({
                    success: true,
                    data: users,
                    message: "Users retrieved successfully",
                });
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: "No users found",
                });
            }
        }
        catch (error) {
            console.error("Error retrieving users:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error while retrieving users",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    static async getProfile(req, res) {
        try {
            const authReq = req;
            const userId = authReq.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const user = await auth_service_1.AuthService.getUserById(userId);
            return res.status(200).json({ success: true, data: user, message: "Profile fetched" });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Failed to fetch profile" });
        }
    }
    static async updateProfile(req, res) {
        try {
            const authReq = req;
            const userId = authReq.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const body = req.body;
            const updatePayload = {};
            if (typeof body.name === 'string')
                updatePayload.name = body.name;
            if (typeof body.phone === 'string')
                updatePayload.phone = body.phone;
            const updated = await auth_service_1.AuthService.updateUserProfile(userId, updatePayload);
            return res.status(200).json({ success: true, data: updated, message: "Profile updated" });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to update profile" });
        }
    }
    static async changePassword(req, res) {
        try {
            const authReq = req;
            const userId = authReq.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: "Both currentPassword and newPassword are required" });
            }
            await auth_service_1.AuthService.changeUserPassword(userId, currentPassword, newPassword);
            return res.status(200).json({ success: true, data: "Password changed", message: "Password changed" });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to change password" });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map