// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'partner' | 'admin';
  partnerDetails?: {
    id: string;
    companyName: string;
    subscriptionType: 'fixed' | 'revenue';
    gstNumber?: string;
    websiteUrl?: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Venue Types
export interface Venue {
  id?: string;
  partnerId: string;
  name: string;
  description?: string;
  highlight?: string;
  location: Location;
  start_price_per_hour: number;
  details:{},
  cancellationPolicy:{};
  images?: string[];
  features?: string[];
  approved?: boolean;
  mapLocationLink: string;
  phone: string;
  rating?: number;
  reviews?: {
    userId:string,
    text:string,
    createdAt:string
  };
  totalReviews?: number;
  createdAt: Date;
  updatedAt: Date;
  membership?: {
    id: string;
    planId: string;
    planName: string;
    amount: number;
    credits: number;
    startedAt: string;
    expiresAt: string | null;
    isActive: boolean;
  } | null;
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

// Slot Types
export interface TimeSlot {
  id: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  price: number;
}

// Booking Types
export interface Booking {
  id: string;
  userId: string;
  venueId: string;
  slotId: string;
  venue: Venue;
  slot: TimeSlot;
  amountPaid: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  bookingStatus: 'confirmed' | 'cancelled' | 'completed';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  bookedDate: string;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  venueId: string;
  venue: Venue;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  images: string[];
  organizer: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  type: 'lite' | 'pro';
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  features: string[];
}

// E-commerce Types
export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  markedPrice: number;
  discountPrice: number;
  category: string;
  inStock: boolean;
  shippingCharges: number;
  rating: number;
  totalReviews: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  discount: number;
  shippingCharges: number;
  couponCode?: string;
}

// Partner Types
export interface PartnerStats {
  totalBookings: number;
  totalEarnings: number;
  last7Days: {
    bookings: number;
    earnings: number;
  };
  last30Days: {
    bookings: number;
    earnings: number;
  };
  last90Days: {
    bookings: number;
    earnings: number;
  };
}

export interface PartnerDashboardData {
  stats: PartnerStats;
  recentBookings: Booking[];
  venues: Venue[];
  earningsChart: {
    labels: string[];
    data: number[];
  };
  bookingsChart: {
    labels: string[];
    data: number[];
  };
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalPartners: number;
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  last7Days: {
    users: number;
    partners: number;
    venues: number;
    bookings: number;
    revenue: number;
  };
  last30Days: {
    users: number;
    partners: number;
    venues: number;
    bookings: number;
    revenue: number;
  };
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentUsers: User[];
  recentPartners: User[];
  pendingVenues: Venue[];
  recentBookings: Booking[];
  revenueChart: {
    labels: string[];
    data: number[];
  };
  usersChart: {
    labels: string[];
    data: number[];
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  companyName?: string;
  subscriptionType?: 'fixed' | 'revenue';
  gstNumber?: string;
  websiteUrl?: string;
}

export interface VenueForm {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  sportType: string[];
  pricePerHour: number;
  amenities: string[];
  images: File[];
}

// Filter Types
export interface VenueFilters {
  sportType?: string;
  city?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  date?: string;
  amenities?: string[];
} 