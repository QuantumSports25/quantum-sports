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

      // The API may return either an array or an object with a `data` array
      const raw = response?.data;
      const list: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.bookings)
            ? raw.bookings
            : [];

      // Normalize each item to the front-end `BookingData` shape
      const normalizeStatus = (status: string | undefined): string => {
        const s = (status || '').toLowerCase();
        if (s === 'confirmed') return 'Confirmed';
        if (s === 'pending') return 'Pending';
        if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
        if (s === 'completed') return 'Completed';
        return status || '';
      };

      const normalizePayment = (status: string | undefined): string => {
        const s = (status || '').toLowerCase();
        if (s === 'paid' || s === 'completed' || s === 'success') return 'Completed';
        if (s === 'pending') return 'Pending';
        if (s === 'failed' || s === 'refunded') return 'Failed';
        return status || '';
      };

      const bookings: BookingData[] = list.map((item: any) => {
        const bookingData = item?.bookingData || {};
        const customer = item?.customerDetails || {};
        const payment = item?.paymentDetails || {};

        return {
          _id: item._id || item.id,
          userId: item.userId,
          venueId: bookingData.venueId || item.venueId,
          facilityId: bookingData.facilityId || item.facilityId,
          activityId: bookingData.activityId || item.activityId,
          amount: Number(item.amount ?? payment.paymentAmount ?? 0),
          duration: bookingData.duration ?? item.duration ?? 0,
          numberOfSlots: bookingData.numberOfSlots ?? item.numberOfSlots ?? (Array.isArray(item.slots) ? item.slots.length : 1),
          startTime: bookingData.startTime || item.startTime || '',
          endTime: bookingData.endTime || item.endTime || '',
          bookedDate: item.bookedDate || item.date || '',
          bookingStatus: normalizeStatus(item.bookingStatus),
          paymentStatus: normalizePayment(item.paymentStatus),
          customerDetails: {
            name: customer.name || customer.customerName,
            email: customer.email || customer.customerEmail,
            phone: customer.phone || customer.customerPhone,
            customerName: customer.customerName,
            customerEmail: customer.customerEmail,
            customerPhone: customer.customerPhone,
          },
          paymentDetails: {
            paymentAmount: Number(payment.paymentAmount ?? item.amount ?? 0),
            paymentMethod: payment.paymentMethod || '',
            paymentDate: payment.paymentDate || item.createdAt || '',
            isRefunded: Boolean(payment.isRefunded),
          },
        } as BookingData;
      });

      return bookings;
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