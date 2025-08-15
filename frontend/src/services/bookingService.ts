import api from './api';
import { ApiResponse, Booking } from '../types';

export interface BookingResponse {
  bookings: Booking[];
  totalCount: number;
}

class BookingService {
  // Helper method to fetch venue details
  private async fetchVenueDetails(venueId: string): Promise<any> {
    try {
      const response = await api.get(`/venue/get-venue/${venueId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching venue details:', error);
      return null;
    }
  }

  async getUserBookings(userId: string): Promise<BookingResponse> {
    try {
      type BackendBooking = any; // Flexible to accommodate event/venue bookings

      const response = await api.get<ApiResponse<BackendBooking[]>>(`/booking/get-bookings-by-user/${userId}`);
      
      // Debug logging to understand the data structure
      console.log('Raw booking response:', response.data.data);
      if (response.data.data && response.data.data.length > 0) {
        console.log('First booking structure:', response.data.data[0]);
        console.log('Booking data:', response.data.data[0]?.bookingData);
        console.log('Customer details:', response.data.data[0]?.customerDetails);
        console.log('Slots:', response.data.data[0]?.slots);
      }

      // Normalize payment status to our UI set
      const normalizePaymentStatus = (status?: string): 'pending' | 'completed' | 'failed' | 'refunded' => {
        const s = (status || '').toLowerCase();
        if (s === 'completed' || s === 'paid' || s === 'success') return 'completed';
        if (s === 'failed') return 'failed';
        if (s === 'refunded') return 'refunded';
        // initiated/pending/undefined -> pending
        return 'pending';
      };

      const toNumber = (val: unknown): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return parseFloat(val);
        return 0;
      };

      // Fetch venue details for venue bookings
      const bookingsWithVenueDetails = await Promise.all(
        (response.data.data || []).map(async (booking: any) => {
          if (booking?.type === 'venue' && booking?.bookingData?.venueId) {
            const venueDetails = await this.fetchVenueDetails(booking.bookingData.venueId);
            return { ...booking, venueDetails };
          }
          return booking;
        })
      );

      // Transform backend booking format to frontend booking format, including events
      const transformedBookings: Booking[] = bookingsWithVenueDetails.map((booking: any) => {
        const isEvent = booking?.type === 'event' || booking?.bookingData?.type === 'event' || !!booking?.event;

        // Common fields
        const amountPaid = toNumber(booking?.paymentDetails?.paymentAmount ?? booking?.amount);
        const bookingStatus = String(booking?.bookingStatus || '').toLowerCase();
        const paymentStatus = normalizePaymentStatus(booking?.paymentStatus);

        if (isEvent) {
          const ev = booking.event || {};
          const loc = ev.location || {};
          const venueName = ev.venueName || booking?.customerDetails?.venueName || 'Unnamed Venue';
          const address = loc.address || booking?.customerDetails?.location || 'Address not available';
          const city = loc.city || booking?.customerDetails?.city || '';

          const mapped: any = {
            id: booking.id,
            userId: booking.userId,
            venueId: ev.venue || '',
            slotId: '',
            amountPaid,
            paymentStatus,
            bookingStatus: bookingStatus as any,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            bookedDate: booking.bookedDate || ev.date,
            venue: {
              id: ev.venue || '',
              partnerId: '',
              name: venueName,
              description: ev.description,
              location: {
                address,
                city,
                state: loc.state || '',
                country: loc.country || 'India',
                pincode: loc.pincode || '',
                coordinates: { lat: loc.lat || loc.coordinates?.lat || 0, lang: loc.lang || loc.coordinates?.lang || 0 }
              },
              start_price_per_hour: 0,
              details: {},
              cancellationPolicy: {},
              mapLocationLink: ev.mapLocationLink || '',
              phone: '',
              createdAt: new Date(booking.createdAt),
              updatedAt: new Date(booking.updatedAt)
            },
            slot: {
              id: booking.id,
              venueId: ev.venue || '',
              date: ev.date || booking.bookedDate,
              startTime: ev.time || '',
              endTime: '',
              isBooked: true,
              price: amountPaid
            },
            // Pass-through extra fields for UI helpers
            type: 'event',
            bookingData: booking.bookingData,
            paymentDetails: booking.paymentDetails,
            event: booking.event
          };
          return mapped as Booking;
        }

        // Venue/slot booking - work with existing backend structure
        const slotsArr: any[] = Array.isArray(booking?.slots) ? booking.slots : [];
        const bookingData = booking?.bookingData || {};
        const customerDetails = booking?.customerDetails || {};
        
        // Extract venue information from bookingData and customerDetails
        const venueId = bookingData?.venueId || '';
        const partnerId = bookingData?.partnerId || '';
        
        // Use fetched venue details if available, otherwise fall back to IDs
        const venueDetails = booking.venueDetails;
        const activityId = bookingData?.activityId || '';
        const facilityId = bookingData?.facilityId || '';
        
        // Create meaningful names using venue details or IDs
        const venueName = venueDetails?.name || 
          (venueId ? `Venue (${venueId.slice(-8)})` : 'Venue Booking');
        
        const description = venueDetails?.description || 
          (activityId || facilityId ? 
            `Activity: ${activityId?.slice(-8) || 'N/A'}, Facility: ${facilityId?.slice(-8) || 'N/A'}` :
            'Venue booking details');
        
        // Use venue location if available
        const venueLocation = venueDetails?.location || {};
        const address = venueLocation.address || 'Address not available';
        const city = venueLocation.city || '';

        // Aggregate slots: earliest start, latest end, total price
        const timeToNumber = (t?: string) => {
          if (!t) return Number.POSITIVE_INFINITY;
          const parts = t.split(':').map((p: string) => parseInt(p, 10));
          const h = parts[0] || 0, m = parts[1] || 0, s = parts[2] || 0;
          return h * 3600 + m * 60 + s;
        };
        const timeToNumberMax = (t?: string) => {
          if (!t) return Number.NEGATIVE_INFINITY;
          const parts = t.split(':').map((p: string) => parseInt(p, 10));
          const h = parts[0] || 0, m = parts[1] || 0, s = parts[2] || 0;
          return h * 3600 + m * 60 + s;
        };

        const minStart = slotsArr.reduce((min: { val: number; t?: string }, s: any) => {
          const v = timeToNumber(s?.startTime);
          return v < min.val ? { val: v, t: s?.startTime } : min;
        }, { val: Number.POSITIVE_INFINITY }) as any;

        const maxEnd = slotsArr.reduce((max: { val: number; t?: string }, s: any) => {
          const v = timeToNumberMax(s?.endTime);
          return v > max.val ? { val: v, t: s?.endTime } : max;
        }, { val: Number.NEGATIVE_INFINITY }) as any;

        const summedPrice = slotsArr.reduce((sum: number, s: any) => sum + toNumber(s?.amount), 0);

        const firstSlot = slotsArr.length > 0 ? slotsArr[0] : undefined;
        const startTime = bookingData?.startTime || minStart.t || firstSlot?.startTime || '';
        const endTime = bookingData?.endTime || maxEnd.t || firstSlot?.endTime || '';

        return {
          id: booking.id,
          userId: booking.userId,
          venueId,
          slotId: firstSlot?.id || '',
          amountPaid,
          paymentStatus,
          bookingStatus: bookingStatus as any,
          paymentId: booking.paymentDetails?.paymentId,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          bookedDate: booking.bookedDate || firstSlot?.date || '',
          venue: {
            id: venueId,
            partnerId: partnerId,
            name: venueName,
            description: description,
            location: {
              address,
              city,
              state: venueLocation.state || '',
              country: venueLocation.country || 'India',
              pincode: venueLocation.pincode || '',
              coordinates: { 
                lat: venueLocation.coordinates?.lat || 0, 
                lang: venueLocation.coordinates?.lang || 0 
              }
            },
            start_price_per_hour: toNumber(venueDetails?.start_price_per_hour || booking.amount),
            details: venueDetails?.details || {},
            cancellationPolicy: venueDetails?.cancellationPolicy || {},
            mapLocationLink: venueDetails?.mapLocationLink || '',
            phone: venueDetails?.phone || '',
            createdAt: venueDetails?.createdAt ? new Date(venueDetails.createdAt) : new Date(booking.createdAt),
            updatedAt: venueDetails?.updatedAt ? new Date(venueDetails.updatedAt) : new Date(booking.updatedAt)
          },
          slot: {
            id: firstSlot?.id || booking.id,
            venueId,
            date: firstSlot?.date || booking.bookedDate,
            startTime,
            endTime,
            isBooked: true,
            price: summedPrice || toNumber(booking.amount)
          }
        } as Booking;
      });

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
