import api from './api';
import { LoginForm, RegisterForm, User, ApiResponse } from '../types';

// Add ShippingAddress interface
export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export const authService = {
  // Login user
  login: async (credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Send OTP for login
  sendLoginOTP: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  // Verify OTP for login
  verifyOTP: async (email: string, otp: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Register user
  register: async (userData: Omit<RegisterForm, 'confirmPassword'>): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Register partner
  registerPartner: async (userData: RegisterForm & { 
    companyName: string; 
    subscriptionType: 'fixed' | 'revenue';
    gstNumber?: string;
    websiteUrl?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register-partner', userData);
    return response.data;
  },

  // Partner login
  partnerLogin: async (credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/partner-login', credentials);
    return response.data;
  },

  // Admin login
  adminLogin: async (credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/admin-login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<string>> => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse<string>> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<string>> => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Logout (if needed for server-side logout)
  logout: async (): Promise<ApiResponse<string>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Address management methods
  getAddresses: async (): Promise<ApiResponse<ShippingAddress[]>> => {
    const response = await api.get('/auth/profile/addresses');
    return response.data;
  },

  addAddress: async (address: ShippingAddress): Promise<ApiResponse<string>> => {
    const response = await api.post('/auth/profile/add-address', address);
    return response.data;
  },

  removeAddress: async (address: ShippingAddress): Promise<ApiResponse<string>> => {
    const response = await api.post('/auth/profile/remove-address', address);
    return response.data;
  },
}; 