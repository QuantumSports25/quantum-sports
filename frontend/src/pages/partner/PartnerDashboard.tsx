import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Building, 
  MapPin, 
  Eye,
  Edit,
  Download,
  Star,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Chart from '../../components/common/Chart';
import { useAuthStore } from '../../store/authStore';
import PartnerSettings from './components/Settings';
import { useLocation } from 'react-router-dom';

const PartnerDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const { user } = useAuthStore();
  const location = useLocation();
  const isSettings = location.pathname.includes('/partner/dashboard/settings');

  // Mock data
  const mockStats = {
    totalEarnings: 125000,
    totalBookings: 89,
    totalVenues: 3,
    avgRating: 4.8,
    last30Days: {
      earnings: 22,
      bookings: 15,
      venues: 0,
      rating: 0.2,
    }
  };

  const mockEarningsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [18000, 22000, 19000, 25000, 28000, 32000]
  };

  const mockBookingsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [12, 15, 18, 22, 25, 28]
  };



  return (
    <DashboardLayout userRole="partner">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user?.name ? `${user.name}'s Dashboard` : 'Partner Dashboard'}
            </h1>
            <p className="text-gray-400 mt-1">
              Monitor your venue performance and bookings
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

        {isSettings ? (
          <PartnerSettings />
        ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-6 w-6 text-blue-400" />
              <span className="text-sm text-gray-400">Total Earnings</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">₹{mockStats.totalEarnings.toLocaleString()}</h2>
              <p className="text-sm text-green-400">+{mockStats.last30Days.earnings}% this month</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-6 w-6 text-purple-400" />
              <span className="text-sm text-gray-400">Total Bookings</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{mockStats.totalBookings}</h2>
              <p className="text-sm text-red-400">-{mockStats.last30Days.bookings}% this month</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Building className="h-6 w-6 text-green-400" />
              <span className="text-sm text-gray-400">Total Venues</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{mockStats.totalVenues}</h2>
              <p className="text-sm text-gray-400">No change this month</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Star className="h-6 w-6 text-yellow-400" />
              <span className="text-sm text-gray-400">Avg. Rating</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{mockStats.avgRating}</h2>
              <p className="text-sm text-green-400">+{mockStats.last30Days.rating} this month</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Earnings Overview</h3>
              <select className="bg-gray-700 text-white text-sm rounded-lg px-2 py-1">
                <option>Last 6 Months</option>
              </select>
            </div>
            <Chart 
              type="line" 
              labels={mockEarningsData.labels} 
              data={mockEarningsData.data} 
              height={250} 
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Bookings Trend</h3>
              <select className="bg-gray-700 text-white text-sm rounded-lg px-2 py-1">
                <option>Last 6 Months</option>
              </select>
            </div>
            <Chart 
              type="bar" 
              labels={mockBookingsData.labels} 
              data={mockBookingsData.data} 
              height={250} 
            />
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
              View All <MapPin className="h-4 w-4 ml-2" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="py-3 px-4 text-gray-400">Venue</th>
                  <th className="py-3 px-4 text-gray-400">Customer</th>
                  <th className="py-3 px-4 text-gray-400">Date</th>
                  <th className="py-3 px-4 text-gray-400">Status</th>
                  <th className="py-3 px-4 text-gray-400">Amount</th>
                  <th className="py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-4 px-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <span>Elite Sports Arena</span>
                  </td>
                  <td className="py-4 px-4">John Doe</td>
                  <td className="py-4 px-4">May 15, 2024</td>
                  <td className="py-4 px-4">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                      Confirmed
                    </span>
                  </td>
                  <td className="py-4 px-4">₹2,000</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="text-green-400 hover:text-green-300">
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* More booking rows can be added here */}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard; 