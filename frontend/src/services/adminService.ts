import api from './api';
import { 
  AdminDashboardData, 
  AdminStats, 
  User, 
  Venue, 
  ApiResponse, 
  PaginatedResponse 
} from '../types';

export const adminService = {
  // Get admin dashboard data
  getDashboardData: async (): Promise<AdminDashboardData> => {
    const response = await api.get<ApiResponse<AdminDashboardData>>('/admin/dashboard');
    return response.data.data;
  },

  // Get admin statistics
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data.data;
  },

  // User Management
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/admin/users', { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (userId: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${userId}`);
    return response.data.data;
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}`, userData);
    return response.data.data;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Block/Unblock user
  toggleUserStatus: async (userId: string, action: 'block' | 'unblock'): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/${action}`);
    return response.data.data;
  },

  // Venue API functions
  getAllVenues: async (): Promise<Venue[]> => {
    try {
      console.log('🚀 Calling real API endpoint: /venue/get-all-venues');
      const response = await api.get<{
        message: string;
        data: Venue[];
      }>('/venue/get-all-venues');
      
      if (response.data.data && response.data.data.length > 0) {
        console.log(`✅ Successfully fetched ${response.data.data.length} venues`);
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch venues:', error);
      return [];
    }
  },

  getVenuesByPartner: async (partnerId?: string): Promise<Venue[]> => {
    try {
      const endpoint = partnerId 
        ? `/venue/get-all-venues-by-partner/?partnerId=${partnerId}`
        : '/venue/get-all-venues-by-partner/';
      
      console.log(`🚀 Calling real API endpoint: ${endpoint}`);
      const response = await api.get<{
        message: string;
        data: Venue[];
        total?: number;
      }>(endpoint);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log(`✅ Successfully fetched ${response.data.data.length} venues by partner`);
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch venues by partner:', error);
      return [];
    }
  },

  // Booking API functions
  getAllBookings: async (): Promise<any[]> => {
    try {
      console.log('🚀 Fetching all bookings...');
      // Since there's no admin endpoint for all bookings yet, we'll need to combine user and partner bookings
      // For now, return empty array - this can be implemented when admin booking endpoint is added
      console.log('ℹ️ Admin booking endpoint not available yet');
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch all bookings:', error);
      return [];
    }
  },

  getBookingsByUser: async (userId: string): Promise<any[]> => {
    try {
      console.log(`🚀 Calling real API endpoint: /booking/get-bookings-by-user/${userId}`);
      const response = await api.get<{
        data: any[];
        total: number;
      }>(`/booking/get-bookings-by-user/${userId}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log(`✅ Successfully fetched ${response.data.data.length} bookings for user`);
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch user bookings:', error);
      return [];
    }
  },

  getBookingsByPartner: async (partnerId: string): Promise<any[]> => {
    try {
      console.log(`🚀 Calling real API endpoint: /booking/get-bookings-by-partner/${partnerId}`);
      const response = await api.get<{
        data: any[];
        total: number;
      }>(`/booking/get-bookings-by-partner/${partnerId}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log(`✅ Successfully fetched ${response.data.data.length} bookings for partner`);
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch partner bookings:', error);
      return [];
    }
  },

  // Get all users - call the users endpoint with role query parameter
  getAllUsers: async (): Promise<User[]> => {
    try {
      console.log('🔄 Fetching users from /auth/users?role=user...');
      
      // Call the users endpoint with role=user query parameter
      const response = await api.get<ApiResponse<User[]>>('/auth/users?role=user');
      if (response.data.success) {
        console.log(`✅ Successfully fetched ${response.data.data.length} users`);
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      return [];
    }
  },

  // Get partners - call the users endpoint with role query parameter
  getPartners: async (): Promise<User[]> => {
    try {
      console.log('🔄 Fetching partners from /auth/users?role=partner...');
      
      // Call the users endpoint with role=partner query parameter
      const response = await api.get<ApiResponse<User[]>>('/auth/users?role=partner');
      
      if (response.data.success) {
        console.log(`✅ Successfully fetched ${response.data.data.length} partners`);
        return response.data.data;
      } else {
        console.log('❌ API call succeeded but returned no data');
        return [];
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch partners:', error);
      
      // Check if it's a specific error we can handle
      if (error.response?.status === 404) {
        console.log('📝 404 error - no partners found or endpoint issue');
      } else if (error.response?.status === 500) {
        console.log('📝 500 error - backend parameter parsing issue');
      }
      
      return [];
    }
  },

  // Approve/Reject partner
  updatePartnerStatus: async (partnerId: string, status: 'approved' | 'rejected'): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/admin/partners/${partnerId}/status`, {
      status,
    });
    return response.data.data;
  },

  // Venue Management
  getVenues: async (params?: {
    page?: number;
    limit?: number;
    approved?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<Venue>> => {
    const response = await api.get<PaginatedResponse<Venue>>('/admin/venues', { params });
    return response.data;
  },

  // Get pending venues for approval
  getPendingVenues: async (): Promise<Venue[]> => {
    const response = await api.get<ApiResponse<Venue[]>>('/admin/venues/pending');
    return response.data.data;
  },

  // Approve/Reject venue
  updateVenueStatus: async (venueId: string, status: 'approved' | 'rejected', reason?: string): Promise<Venue> => {
    const response = await api.patch<ApiResponse<Venue>>(`/admin/venues/${venueId}/status`, {
      status,
      reason,
    });
    return response.data.data;
  },

  // Delete venue
  deleteVenue: async (venueId: string): Promise<void> => {
    await api.delete(`/admin/venues/${venueId}`);
  },

  // Booking Management
  getBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<any>> => {
    const response = await api.get<PaginatedResponse<any>>('/admin/bookings', { params });
    return response.data;
  },

  // Get recent bookings
  getRecentBookings: async (limit: number = 10): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>(`/admin/bookings/recent?limit=${limit}`);
    return response.data.data;
  },

  // Analytics and Charts
  getRevenueChart: async (period: '7d' | '30d' | '90d' = '30d'): Promise<{
    labels: string[];
    data: number[];
  }> => {
    const response = await api.get<ApiResponse<{
      labels: string[];
      data: number[];
    }>>(`/admin/revenue-chart?period=${period}`);
    return response.data.data;
  },

  getUsersChart: async (period: '7d' | '30d' | '90d' = '30d'): Promise<{
    labels: string[];
    data: number[];
  }> => {
    const response = await api.get<ApiResponse<{
      labels: string[];
      data: number[];
    }>>(`/admin/users-chart?period=${period}`);
    return response.data.data;
  },

  // Platform Settings
  getSettings: async (): Promise<{
    platformFee: number;
    partnerCommission: number;
    maintenanceMode: boolean;
    supportEmail: string;
    supportPhone: string;
  }> => {
    const response = await api.get<ApiResponse<{
      platformFee: number;
      partnerCommission: number;
      maintenanceMode: boolean;
      supportEmail: string;
      supportPhone: string;
    }>>('/admin/settings');
    return response.data.data;
  },

  updateSettings: async (settings: {
    platformFee?: number;
    partnerCommission?: number;
    maintenanceMode?: boolean;
    supportEmail?: string;
    supportPhone?: string;
  }): Promise<void> => {
    await api.put('/admin/settings', settings);
  },

  // Reports
  generateReport: async (type: 'revenue' | 'bookings' | 'users', params: {
    startDate: string;
    endDate: string;
    format: 'pdf' | 'csv';
  }): Promise<Blob> => {
    const response = await api.get(`/admin/reports/${type}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
}; 