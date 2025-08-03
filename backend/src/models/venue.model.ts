export interface Venue {
  id?: string;
  partnerId: string;
  name: string;
  description?: string;
  highlight?: string;
  location: Location;
  start_price_per_hour: number;
  details: {};
  cancellationPolicy: {};
  images?: string[];
  features?: string[];
  approved?: boolean;
  mapLocationLink: string;
  phone: string;
  rating?: number;
  reviews?: {
    userId: string;
    text: string;
    createdAt: string;
  };
  totalReviews?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  coordinates: {
    lat: number;
    lang: number;
  };
}
export interface Activity {
  id?: string;
  name: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
  venueId?: string;
  start_price_per_hour: number;
}

export interface Facility {
  id?: string;
  name: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  activityId: string;
  start_price_per_hour: number;
  startTime: string; // Format: "HH:MM:SS" (e.g., "09:00:00")
  endTime: string;   // Format: "HH:MM:SS" (e.g., "17:00:00")
  isAvailable?: boolean;
  isFillingFast?: boolean;
}

// Slot Model
export enum SlotAvailability {
  Locked = "locked",
  Available = "available",
  NotAvailable = "not_available",
  Booked = "booked",
  FillingFast = "filling_fast",
}
export interface Slot {
  id?: string;
  date: Date | string; // Allow both Date object and string for flexibility
  amount: number;
  availability: SlotAvailability;
  startTime: string; 
  endTime: string;  
  bookingId?: string;
  facilityId: string; // Required field as per database schema
  createdAt?: Date;
  updatedAt?: Date;
}


export interface GetVenuesParams {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  sport?: string | undefined;
  event?: string | undefined;
  city?: string | undefined;
}