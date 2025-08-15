import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  AdminOverview,
  UserManagement,
  PartnerManagement,
  VenueManagement,
  BookingManagement,
    PlatformSettings,
    EventManagement
} from './components';
import { mockData } from './data/mockData';
import { AdminTab } from './types/adminTypes';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Determine which tab to show based on the current route
  const getCurrentTab = (): AdminTab => {
    const path = location.pathname;
    if (path === '/admin/dashboard') return 'overview';
    if (path.includes('/users')) return 'users';
    if (path.includes('/partners')) return 'partners';
    if (path.includes('/venues')) return 'venues';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/events')) return 'events';
    if (path.includes('/settings')) return 'settings';
    return 'overview';
  };

  const selectedTab = getCurrentTab();

  const getTabTitle = (tab: AdminTab): string => {
    const titles = {
      overview: 'Admin Dashboard',
      users: 'User Management',
      partners: 'Partner Management',
      venues: 'Venue Management',
      bookings: 'Booking Management',
      events: 'Event Management',
      settings: 'Platform Settings'
    };
    return titles[tab];
  };

  const getTabDescription = (tab: AdminTab): string => {
    const descriptions = {
      overview: 'Monitor platform performance and key metrics',
      users: 'Manage user accounts and permissions',
      partners: 'Manage partner applications and accounts',
      venues: 'Approve and manage venue listings',
      bookings: 'Monitor and manage all bookings',
      events: 'Create and manage events',
      settings: 'Configure platform settings and preferences'
    };
    return descriptions[tab];
  };

  const renderContent = () => {
    const commonProps = {
      selectedPeriod,
      mockData
    };

    switch (selectedTab) {
      case 'users':
        return <UserManagement {...commonProps} />;
      case 'partners':
        return <PartnerManagement {...commonProps} />;
      case 'venues':
        return <VenueManagement {...commonProps} />;
      case 'bookings':
        return <BookingManagement {...commonProps} />;
      case 'events':
        return <EventManagement {...commonProps} />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return <AdminOverview {...commonProps} />;
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getTabTitle(selectedTab)}
            </h1>
            <p className="text-gray-400 mt-1">
              {getTabDescription(selectedTab)}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
              className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 