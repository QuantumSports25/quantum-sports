import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Filter, Search, Plus, Loader2 } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../hooks';
import { Booking } from '../types';
import { toast } from 'react-hot-toast';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';

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

  // Cancel confirmation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingIdToCancel, setBookingIdToCancel] = useState<string | null>(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

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
      // case 'pending': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'cancelled': return 'text-red-400 bg-red-400/20 border-red-400/30';
      // case 'completed': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const openCancelModal = (bookingId: string) => {
    setBookingIdToCancel(bookingId);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    if (isCancelLoading) return;
    setIsCancelModalOpen(false);
    setBookingIdToCancel(null);
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

  const confirmCancel = async () => {
    if (!bookingIdToCancel) return;
    try {
      setIsCancelLoading(true);
      await handleCancelBooking(bookingIdToCancel);
    } finally {
      setIsCancelLoading(false);
      setIsCancelModalOpen(false);
      setBookingIdToCancel(null);
    }
  };

  const formatBookingTime = (startTime?: string, endTime?: string) => {
    try {
      const hasStart = Boolean(startTime);
      const hasEnd = Boolean(endTime);
      if (hasStart && hasEnd) return `${startTime} - ${endTime}`;
      if (hasStart) return String(startTime);
      return 'Time not available';
    } catch {
      return 'Time not available';
    }
  };

  // Helpers to adapt to both slot bookings and event bookings from backend
  const isEventBooking = (booking: Booking) => {
    const b: any = booking as any;
    return b?.type === 'event' || b?.bookingData?.type === 'event' || !!b?.event;
  };

  const getBookingTitle = (booking: Booking) => {
    const b: any = booking as any;
    return isEventBooking(booking) ? (b?.event?.title || 'Event') : (booking.venue?.name || 'Venue');
  };

  const getBookingDate = (booking: Booking) => {
    const b: any = booking as any;
    const date = isEventBooking(booking) ? (b?.event?.date || booking.bookedDate) : booking.bookedDate;
    return formatDate(date);
  };

  const getBookingTime = (booking: Booking) => {
    const b: any = booking as any;
    if (isEventBooking(booking)) {
      return b?.event?.time || 'Time not available';
    }
    const start = b?.slot?.startTime || b?.bookingData?.startTime || b?.startTime;
    const end = b?.slot?.endTime || b?.bookingData?.endTime || b?.endTime;
    return formatBookingTime(start, end);
  };

  const getBookingAddress = (booking: Booking) => {
    const b: any = booking as any;
    if (isEventBooking(booking)) {
      return b?.event?.location?.address || b?.venue?.location?.address || 'Address not available';
    }
    return b?.venue?.location?.address || b?.customerDetails?.location || 'Address not available';
  };

  const getBookingDescription = (booking: Booking) => {
    const b: any = booking as any;
    if (isEventBooking(booking)) {
      return b?.event?.description || 'Event booking';
    }
    return booking?.venue?.description || b?.venue?.description || 'Venue booking';
  };

  const formatCurrencyINR = (amount: number) => {
    try {
      return amount.toLocaleString('en-IN');
    } catch {
      return String(amount);
    }
  };

  const getBookingAmount = (booking: Booking) => {
    const b: any = booking as any;
    const rawAmount = b?.paymentDetails?.paymentAmount ?? b?.amount ?? (booking as any)?.amountPaid ?? 0;
    const numericAmount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount || 0);
    return `₹${formatCurrencyINR(numericAmount)}`;
  };

  const getTypeBadge = (booking: Booking) => {
    return isEventBooking(booking) ? 'Event' : 'Venue';
  };

  // Filtered bookings before pagination
  const filteredBookings = bookings.filter(booking => {
    const b: any = booking as any;
    const searchableTitle = getBookingTitle(booking);
    const searchableAddress = getBookingAddress(booking);
    const searchableCity = booking.venue?.location?.city || b?.event?.location?.city || '';

    const matchesSearch =
      searchableTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchableAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchableCity?.toLowerCase().includes(searchTerm.toLowerCase());
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
                  <option value="cancelled">Cancelled</option>
                  {/* <option value="pending">Pending</option>
                  <option value="completed">Completed</option> */}
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
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-200">
                        {getBookingTitle(booking)}
                      </h2>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${isEventBooking(booking) ? 'text-pink-400 bg-pink-400/10 border-pink-400/30' : 'text-blue-400 bg-blue-400/10 border-blue-400/30'}`}>
                        {getTypeBadge(booking)}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">{getBookingDate(booking)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">{getBookingTime(booking)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">{getBookingAddress(booking)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-400 italic">{getBookingDescription(booking)}</span>
                      <span className="text-sm font-medium text-green-400">{getBookingAmount(booking)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {booking.bookingStatus === 'confirmed' && (
                        <button
                          onClick={() => openCancelModal(booking.id)}
                          className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                     
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
      <DeleteConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        onConfirm={confirmCancel}
        isLoading={isCancelLoading}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        loadingLabel="Cancelling..."
      />
    </div>
  );
};

export default MyBookingsPage;
