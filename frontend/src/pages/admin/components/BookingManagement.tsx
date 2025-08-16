import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Edit, Calendar, CreditCard, Building, Clock, DollarSign } from 'lucide-react';
import { AdminComponentProps } from '../types/adminTypes';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import { adminService } from '../../../services/adminService';

// Define booking interface based on backend structure
interface AdminBooking {
  id: string;
  userId: string;
  type: 'venue' | 'event';
  bookingData: any;
  amount: number;
  bookedDate: string;
  confirmedAt?: string;
  cancelledAt?: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'initiated' | 'completed' | 'failed' | 'refunded';
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  paymentDetails?: any;
  venue?: any;
  event?: any;
  createdAt?: string;
  updatedAt?: string;
}

const BookingManagement: React.FC<AdminComponentProps> = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'venue' | 'event'>('all');
  const [partners, setPartners] = useState<{[key: string]: any}>({});
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('all');

  const fetchPartnerDetails = useCallback(async () => {
    try {
      console.log('🔄 Fetching partner details...');
      const partnersData = await adminService.getPartners();
      
      const partnersMap: {[key: string]: any} = {};
      partnersData.forEach(partner => {
        partnersMap[partner.id] = partner;
      });
      
      setPartners(partnersMap);
      setAllPartners(partnersData);
      console.log(`✅ Loaded partner details for ${partnersData.length} partners`);
    } catch (err) {
      console.error('❌ Failed to fetch partner details:', err);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let bookingsData: AdminBooking[] = [];

      if (selectedPartnerId === 'all') {
        console.log('🚀 Fetching all bookings (placeholder - admin endpoint needed)');
        // For now, we'll fetch bookings from a few sample partners
        // In production, you'd want an admin endpoint that gets all bookings
        bookingsData = await adminService.getAllBookings();
        
        if (bookingsData.length === 0) {
          // Fallback: Fetch bookings from all partners
          const partnerBookingPromises = allPartners.slice(0, 5).map(partner => 
            adminService.getBookingsByPartner(partner.id)
          );
          
          const partnerBookings = await Promise.all(partnerBookingPromises);
          bookingsData = partnerBookings.flat();
        }
      } else {
        console.log(`🚀 Calling API endpoint: /booking/get-bookings-by-partner/${selectedPartnerId}`);
        bookingsData = await adminService.getBookingsByPartner(selectedPartnerId);
      }

      if (bookingsData.length > 0) {
        setBookings(bookingsData);
        console.log(`✅ Loaded ${bookingsData.length} bookings from API`);
      } else {
        const message = selectedPartnerId === 'all' 
          ? 'No bookings found. This could mean: 1) No bookings are made yet, 2) Admin booking endpoint needed, or 3) API endpoint issue.'
          : `No bookings found for the selected partner. This partner may not have any bookings yet.`;
        setError(message);
        setBookings([]);
      }
    } catch (err) {
      console.error('❌ API call failed:', err);
      setError('Failed to fetch bookings from API. Check browser console for details.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPartnerId, allPartners]);

  useEffect(() => {
    fetchPartnerDetails();
  }, [fetchPartnerDetails]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerDetails.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerDetails.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedFilter === 'all' || booking.bookingStatus === selectedFilter;
    const matchesType = selectedTypeFilter === 'all' || booking.type === selectedTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getBookingStatus = (booking: AdminBooking): 'active' | 'pending' | 'blocked' => {
    switch (booking.bookingStatus) {
      case 'confirmed': return 'active';
      case 'pending': return 'pending';
      case 'cancelled': return 'blocked';
      default: return 'pending';
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-white">Loading bookings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-xl">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Booking Management</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
              >
                <option value="all">All Partners</option>
                {allPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value as 'all' | 'venue' | 'event')}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="venue">Venue Bookings</option>
                <option value="event">Event Bookings</option>
              </select>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'confirmed' | 'pending' | 'cancelled')}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button 
                onClick={fetchBookings}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border-l-4 border-red-500">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    {loading ? 'Loading...' : 'No bookings found'}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const status = getBookingStatus(booking);
                  const StatusIcon = getStatusIcon(status);
                  return (
                    <tr key={booking.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            booking.type === 'venue' ? 'bg-green-600' : 'bg-purple-600'
                          }`}>
                            {booking.type === 'venue' ? <Building className="h-5 w-5 text-white" /> : <Calendar className="h-5 w-5 text-white" />}
                          </div>
                          <div>
                            <div className="font-medium text-white">#{booking.id.slice(-8)}</div>
                            <div className="text-sm text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(booking.bookedDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          <div className="font-medium text-white">{booking.customerDetails.customerName}</div>
                          <div className="text-xs text-gray-400">{booking.customerDetails.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          <div className="capitalize font-medium">{booking.type}</div>
                          <div className="text-xs text-gray-400">
                            {booking.type === 'venue' ? 'Venue Booking' : 'Event Booking'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatPrice(booking.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          <div>{formatDate(booking.bookedDate)}</div>
                          {booking.confirmedAt && (
                            <div className="text-xs text-green-400">
                              Confirmed: {formatDate(booking.confirmedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="capitalize">{booking.bookingStatus}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-blue-400 hover:text-blue-300">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-green-400 hover:text-green-300">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-orange-400 hover:text-orange-300">
                            <CreditCard className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredBookings.length > 0 && (
          <div className="px-6 py-4 bg-gray-700/30 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} of {bookings.length} total
                {selectedPartnerId !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-blue-600 rounded text-xs">
                    Partner: {partners[selectedPartnerId]?.name || 'Loading...'}
                  </span>
                )}
                {selectedTypeFilter !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-purple-600 rounded text-xs">
                    Type: {selectedTypeFilter}
                  </span>
                )}
                {selectedFilter !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-gray-600 rounded text-xs">
                    Status: {selectedFilter}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-600 text-gray-300 rounded hover:bg-gray-500 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm bg-gray-600 text-gray-300 rounded hover:bg-gray-500 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
