import {
  LayoutDashboard,
  Users,
  Building,
  Calendar,
  Settings,
  UserCheck,
  BarChart3,
  PartyPopper,
  LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const adminMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/dashboard/users' },
  { id: 'partners', label: 'Partners', icon: UserCheck, path: '/admin/dashboard/partners' },
  { id: 'venues', label: 'Venues', icon: Building, path: '/admin/dashboard/venues' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/admin/dashboard/bookings' },
  { id: 'events', label: 'Events', icon: PartyPopper, path: '/admin/dashboard/events' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/dashboard/settings' },
];

export const partnerMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/partner/dashboard' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/partner/dashboard/bookings' },
  { id: 'venues', label: 'Venues', icon: Building, path: '/partner/dashboard/venues' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/partner/dashboard/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/partner/dashboard/settings' },
];

export const getMenuItems = (userRole: 'admin' | 'partner'): MenuItem[] => {
  return userRole === 'admin' ? adminMenuItems : partnerMenuItems;
}; 