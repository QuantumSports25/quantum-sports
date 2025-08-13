import axiosInstance from './api';

export interface CustomerDetails {
  // Frontend shape
  name?: string;
  email?: string;
  phone?: string;
  // Backend shape
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface BookingData {
  _id: string;
  userId: string;
  venueId: string;
  facilityId: string;
  activityId: string;
  amount: number;
  duration: number;
  numberOfSlots: number;
  startTime: string;
  endTime: string;
  bookedDate: string;
  bookingStatus: string; // normalize on UI
  paymentStatus: string; // normalize on UI
  customerDetails: CustomerDetails;
  paymentDetails: {
    paymentAmount: number;
    paymentMethod: string;
    paymentDate: string;
    isRefunded: boolean;
  };
}

export const BookingService = {
  getBookingsByPartner: async (partnerId: string): Promise<BookingData[]> => {
    try {
      console.log('Fetching bookings for partner:', partnerId);
      // Use project's shared axios instance (handles token + baseURL)
      const response = await axiosInstance.get(`/booking/get-bookings-by-partner/${partnerId}`);
      console.log('Bookings response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching partner bookings:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};