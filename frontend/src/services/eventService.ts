import api from './api';

export type EventCategory = 'All' | 'Gaming' | 'Technology' | 'Music' | 'Business' | 'Fitness' | 'Art';

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
  // Redundant fields required by backend validator
  city: string;
  state: string;
  country: string;
  pincode: string;
  lat: number;
  lang: number;
}

export const eventService = {
  createEvent: async (payload: CreateEventRequest): Promise<string | undefined> => {
    const response = await api.post('/events/create-event', payload);
    return response.data;
  },
  getAllEvents: async (params?: {
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
    date?: string; // ISO string
    archived?: boolean;
  }): Promise<{ events: any[]; total: number }> => {
    const response = await api.get('/events/get-events', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        sort: params?.sort ?? 'desc',
        date: params?.date ?? '1970-01-01T00:00:00.000Z',
        archived: params?.archived ?? false,
        _ts: Date.now(),
      },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },
  getEventById: async (id: string): Promise<any> => {
    const response = await api.get(`/events/get-event/${id}`, { params: { _ts: Date.now() }, headers: { 'Cache-Control': 'no-cache' } });
    return response.data;
  },
  getEventsByCategory: async (category: EventCategory, params?: {
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
    date?: string;
    archived?: boolean;
  }): Promise<{ events: any[]; total: number }> => {
    const response = await api.get(`/events/get-events-by-category/${category}`, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        sort: params?.sort ?? 'desc',
        date: params?.date ?? '1970-01-01T00:00:00.000Z',
        archived: params?.archived ?? false,
        _ts: Date.now(),
      },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },
  updateEvent: async (id: string, payload: CreateEventRequest): Promise<string | undefined> => {
    const response = await api.put(`/events/update-event/${id}`, payload);
    return response.data;
  },
};


