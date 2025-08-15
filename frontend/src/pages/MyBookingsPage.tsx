import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, MoreHorizontal, Filter, Search, Plus, Loader2 } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../hooks';
import { Booking } from '../types';
import { toast } from 'react-hot-toast';

// Date formatting helper
const formatDate = (date: Date | string) => {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!user?.id) return;
        setIsLoading(true);

        const response = await bookingService.getUserBookings(user.id);
        setBookings(response.bookings || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch bookings. Please try again later.');
        toast.error('Failed to fetch bookings');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'cancelled': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'completed': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await bookingService.cancelBooking(bookingId);
      if (user?.id) {
        const response = await bookingService.getUserBookings(user.id);
        setBookings(response.bookings);
      }
      toast.success('Booking cancelled successfully');
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  const formatBookingTime = (startTime: string, endTime: string) => {
    try {
      return `${startTime} - ${endTime}`;
    } catch {
      return 'Invalid time';
    }
  };

  // Filtered bookings before pagination
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venue?.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venue?.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.bookingStatus.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-8 px-4 mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                My Bookings
              </h1>
              <p className="text-gray-400 text-lg">Manage and track your venue reservations</p>
            </div>
            <button className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
                <span className="font-medium">New Booking</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className={`transition-all duration-1000 delay-200 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading/Error */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-xl text-red-400">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentBookings.map((booking) => (
                <div key={booking.id} className="bg-gray-800 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">
                      {booking.venue?.name || 'Unnamed Venue'}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">{formatDate(booking.bookedDate)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">{formatBookingTime(booking.slot.startTime, booking.slot.endTime)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">{booking.venue?.location?.address || 'Location not available'}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-400 italic">
                        {booking.venue?.description || 'No description available'}
                      </span>
                      <span className="text-sm font-medium text-green-400">
                        ₹{booking.amountPaid}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {booking.bookingStatus === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="More Details">
                        <MoreHorizontal className="h-5 w-5 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-400">
                    {searchTerm || filterStatus !== 'all'
                      ? 'No bookings match your filters.'
                      : "You haven't made any bookings yet."}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-lg ${currentPage === i + 1 ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
