import React, {  useState } from 'react';
import { Search, Clock, DollarSign, Download } from 'lucide-react';
import { format } from 'date-fns';
import { BookingService, BookingData } from '../../services/booking.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const PartnerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuthStore();

  // useEffect(() => {
  //   fetchBookings();
  // }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const partnerId = user?.partnerDetails?.id ?? user?.id;
      if (!partnerId) {
        console.error('Partner ID not found on user');
        toast.error('Authentication error. Please login again.');
        return;
      }

      console.log('Fetching bookings for partner:', partnerId);
      const data = await BookingService.getBookingsByPartner(partnerId);
      setBookings(data);
      if (data.length === 0) {
        toast.success('No bookings found');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.customerDetails?.name || booking.customerDetails?.customerName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.customerDetails?.email || booking.customerDetails?.customerEmail || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || (booking.bookingStatus || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout userRole="partner">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Booking History</h1>
            <p className="text-gray-400 mt-1">
              Manage and monitor your venue bookings
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <button 
              onClick={fetchBookings}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <span>Refresh</span>
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  placeholder="Search bookings..."
                  className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm font-medium text-white">#{booking._id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{booking.customerDetails?.name || booking.customerDetails?.customerName || '-'}</div>
                          <div className="text-sm text-gray-400">{booking.customerDetails?.email || booking.customerDetails?.customerEmail || '-'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {format(new Date(booking.bookedDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="h-4 w-4 mr-1" />
                          {booking.duration} mins
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm font-medium text-white">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ₹{booking.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          booking.bookingStatus === 'Confirmed'
                            ? 'bg-green-400/10 text-green-400'
                            : booking.bookingStatus === 'Pending'
                            ? 'bg-yellow-400/10 text-yellow-400'
                            : 'bg-red-400/10 text-red-400'
                        }`}>
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          booking.paymentStatus === 'Completed' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No bookings found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerBookings;