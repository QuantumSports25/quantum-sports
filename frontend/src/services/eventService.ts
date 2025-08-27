import api from "./api";
import { PaymentMethod } from "./partner-service/paymentService";

export type EventCategory =
  | "All"
  | "Gaming"
  | "Technology"
  | "Music"
  | "Business"
  | "Fitness"
  | "Art";

export interface CreateEventRequest {
  title: string;
  description?: string;
  date: string | Date;
  time: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    coordinates: { lat: number; lang: number };
  };
  venue: string;
  venueName: string;
  capacity: number;
  ticketPrice: number;
  category: EventCategory;
  images: string[];
  featured: boolean;
  tags: string[];
  organizer?: string;
  organizerName?: string;
  mapLocationLink: string;
  archived?: boolean;
  // redundant fields for backend validator
  city: string;
  state: string;
  country: string;
  pincode: string;
  lat: number;
  lang: number;
}

export const eventService = {
  // Create event
  createEvent: async (
    payload: CreateEventRequest
  ): Promise<string | undefined> => {
    const { data } = await api.post("/events/create-event", payload);
    return data;
  },

  // Get all events (minimal GET request)
  getAllEvents: async (params?: {
    page?: number;
    limit?: number;
    sort?: "asc" | "desc";
    date?: string; // ISO string
    archived?: boolean;
  }): Promise<{ events: any[]; total: number }> => {
    const { data } = await api.get("/events/get-events", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        sort: params?.sort ?? "desc",
        date: params?.date ?? new Date().toISOString(),
        archived: params?.archived ?? false,
      },
    });
    return data;
  },

  // Get event by ID
  getEventById: async (id: string): Promise<any> => {
    try {
      const { data } = await api.get(`/events/get-event/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw error;
    }
  },

  // Get events by category
  getEventsByCategory: async (
    category: EventCategory,
    params?: {
      page?: number;
      limit?: number;
      sort?: "asc" | "desc";
      date?: string;
      archived?: boolean;
    }
  ): Promise<{ events: any[]; total: number }> => {
    const { data } = await api.get(
      `/events/get-events-by-category/${category}`,
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          sort: params?.sort ?? "desc",
          date: params?.date ?? "1970-01-01T00:00:00.000Z",
          archived: params?.archived ?? false,
        },
      }
    );
    return data;
  },

  // Update event
  updateEvent: async (
    id: string,
    payload: CreateEventRequest
  ): Promise<string | undefined> => {
    const { data } = await api.put(`/events/update-event/${id}`, payload);
    return data;
  },
};

export const createEventBeforePayment = async ({
  userId,
  eventId,
  seats,
  amount,
  bookedDate,
  paymentMethod = PaymentMethod.Razorpay,
}: {
  userId: string;
  eventId: string;
  seats: number;
  amount: number;
  bookedDate: Date;
  paymentMethod: PaymentMethod;
}) => {
  try {
    const { data } = await api.post(
      `/events/create-event-booking-before-payment/${paymentMethod}`,
      {
        userId,
        eventId,
        seats,
        amount,
        bookedDate,
      }
    );
    return data;
  } catch (error) {
    console.error("Error creating event before payment:", error);
    throw error;
  }
};


export const freeSeats = async (bookingId: string) => {
  try {
    const { data } = await api.post(`/events/free-seats/${bookingId}`);
    return data;
  } catch (error) {
    console.error("Error fetching free seats:", error);
    throw error;
  }
};