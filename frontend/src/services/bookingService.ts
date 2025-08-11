import api from './api';
import { ApiResponse, Booking } from '../types';

export interface BookingResponse {
  bookings: Booking[];
  totalCount: number;
}

class BookingService {
  async getUserBookings(userId: string): Promise<BookingResponse> {
    try {
      interface BackendBooking {
        id: string;
        userId: string;
        activityId: string;
        amount: string;
        bookedDate: string;
        bookingStatus: string;
        cancelledAt: string | null;
        confirmedAt: string | null;
        createdAt: string;
        customerDetails: {
          customerId: string;
          venueName?: string;
          location?: string;
          city?: string;
        };
        duration: number;
        endTime: string;
        facilityId: string;
        numberOfSlots: number;
        partnerId: string;
        paymentDetails: {
          isRefunded: boolean;
          paymentDate: string;
          paymentStatus: string;
          paymentId?: string;
        };
        slots: any[];
        startTime: string;
        updatedAt: string;
        venueId: string;
      }

      const response = await api.get<ApiResponse<BackendBooking[]>>(`/booking/get-bookings-by-user/${userId}`);
      
      // Transform backend booking format to frontend booking format
      const transformedBookings: Booking[] = response.data.data.map(booking => ({
        id: booking.id,
        userId: booking.userId,
        venueId: booking.venueId,
        slotId: booking.slots?.[0]?.id || '',
        amountPaid: parseFloat(booking.amount),
        paymentStatus: (booking.paymentDetails?.paymentStatus?.toLowerCase() || 'pending') as 'pending' | 'completed' | 'failed' | 'refunded',
        bookingStatus: booking.bookingStatus.toLowerCase() as 'confirmed' | 'cancelled' | 'completed',
        paymentId: booking.paymentDetails?.paymentId,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        // Use actual venue data from backend
        venue: {
          id: booking.venueId,
          partnerId: booking.partnerId,
          name: booking.customerDetails?.venueName || 'Unnamed Venue',
          location: {
            address: booking.customerDetails?.location || 'Address not available',
            city: booking.customerDetails?.city || '',
            state: '',
            country: 'India',
            pincode: '',
            coordinates: { lat: 0, lang: 0 }
          },
          start_price_per_hour: parseFloat(booking.amount),
          details: {},
          cancellationPolicy: {},
          mapLocationLink: '',
          phone: '',
          createdAt: new Date(booking.createdAt),
          updatedAt: new Date(booking.updatedAt)
        },
        slot: {
          id: booking.slots?.[0]?.id || booking.id,
          venueId: booking.venueId,
          date: booking.bookedDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          isBooked: true,
          price: parseFloat(booking.amount)
        }
      }));

      return {
        bookings: transformedBookings,
        totalCount: transformedBookings.length
      };
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await api.put<ApiResponse<Booking>>(`/booking/cancel-booking/${bookingId}`, {
        cancellationReason: 'Cancelled by user'
      });
      return response.data.data;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  }

  async getBookingById(bookingId: string): Promise<Booking> {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/booking/get-booking/${bookingId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
