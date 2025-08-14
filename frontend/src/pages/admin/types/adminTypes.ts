export type AdminTab = 'overview' | 'users' | 'partners' | 'venues' | 'bookings' | 'events' | 'settings';

export type UserStatus = 'active' | 'pending' | 'blocked';
export type VenueStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'partner';
  joinDate: string;
  status: UserStatus;
  avatar: string;
}

export interface Venue {
  id: string;
  name: string;
  partner: string;
  location: string;
  sport: string;
  submittedDate: string;
  status: VenueStatus;
}

export interface Booking {
  id: string;
  venue: string;
  user: string;
  partner: string;
  date: string;
  time: string;
  amount: number;
  status: BookingStatus;
  sport: string;
  name?: string;
}

export interface Stats {
  totalUsers: number;
  totalPartners: number;
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  last30Days: {
    users: number;
    partners: number;
    venues: number;
    bookings: number;
    revenue: number;
    approvals: number;
  };
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface MockData {
  stats: Stats;
  revenueData: ChartData;
  usersData: ChartData;
  recentUsers: User[];
  pendingVenues: Venue[];
  recentBookings: Booking[];
}

export interface AdminComponentProps {
  selectedPeriod: '7d' | '30d' | '90d';
  mockData: MockData;
} 