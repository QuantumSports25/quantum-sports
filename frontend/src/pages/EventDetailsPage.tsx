import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Star,
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import {
  createEventBeforePayment,
  eventService,
  freeSeats,
} from "../services/eventService";
import { Event } from "../pages/EventsPage";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createBookingOrder,
  PaymentMethod,
  verifyBookingPayment,
} from "../services/partner-service/paymentService";
import {
  LoadingStatus,
  FailedType,
  Currency,
} from "../pages/booking/components/BookSlots/CheckoutCard";
import EventPaymentMethodModal from "../components/modals/EventPaymentMethodModal";
import EventPaymentLoadingModal from "../components/modals/EventPaymentLoadingModal";
import EventPaymentFailureModal from "../components/modals/EventPaymentFailureModal";
import EventPaymentSuccessModal from "../components/modals/EventPaymentSuccessModal";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [registrationId, setRegistrationId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Validating
  );
  const [failureType, setFailureType] = useState<FailedType>(
    FailedType.Validation
  );
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [isPaymentDeducted, setIsPaymentDeducted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    data: event,
    isLoading,
    error,
    refetch: refetchEvent,
  } = useQuery<Event>({
    queryKey: ["event", eventId],
    queryFn: () => eventService.getEventById(eventId ?? ""),
  });

  // Calculate pricing
  const subtotal = (event?.ticketPrice || 0) * numberOfTickets;
  const totalAmount = subtotal;

  // Free seats mutation (equivalent to unlockSlots for venues)
  const freeSeatsMutation = useMutation({
    mutationFn: () => freeSeats(registrationId),
    onSuccess: () => {
      refetchEvent();
    },
  });

  // Main validation mutation - validates event registration before payment
  const validateEventRegistrationMutation = useMutation({
    mutationFn: () => {
      return createEventBeforePayment({
        userId: user?.id || "",
        eventId: eventId!,
        seats: numberOfTickets,
        amount: totalAmount,
        bookedDate: new Date(),
        paymentMethod: selectedPaymentMethod || PaymentMethod.Razorpay,
      });
    },
    onSuccess: (data) => {
      setRegistrationId(data.data);
      setLoadingStatus(LoadingStatus.Creating);
      createOrderMutation.mutate(data.data);
    },
    onError: (error: any) => {
      setShowLoadingModal(false);
      setFailureType(FailedType.Validation);
      setErrorMessage(
        error.response?.data?.message || "Registration validation failed"
      );
      setShowFailureModal(true);
    },
  });

  // Order creation mutation
  const createOrderMutation = useMutation({
    mutationFn: (bookingId: string) => {
      return createBookingOrder(bookingId ?? registrationId);
    },
    onSuccess: (data) => {
      if (selectedPaymentMethod === PaymentMethod.Wallet) {
        setLoadingStatus(LoadingStatus.Verifying);
        verifyPaymentMutation.mutate({
          bookingId: data.receipt,
          orderId: data.id,
        });
      } else {
        // For Razorpay, close loading modal and open checkout
        setShowLoadingModal(false);
        openRazorpayCheckout(data);
      }
    },
    onError: (error: any) => {
      if (registrationId) {
        freeSeatsMutation.mutate();
      }
      setFailureType(FailedType.OrderCreation);
      setErrorMessage(error.response?.data?.message || "Order creation failed");
      setShowLoadingModal(false);
      setShowFailureModal(true);
      freeSeatsMutation.mutate();
    },
  });

  // Payment verification mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: ({
      bookingId,
      paymentId,
      orderId,
      signature,
    }: {
      bookingId: string;
      paymentId?: string;
      orderId: string;
      signature?: string;
    }) => {
      return verifyBookingPayment({ bookingId, paymentId, orderId, signature });
    },
    onSuccess: () => {
      setShowLoadingModal(false);
      setShowSuccessModal(true);
      setShowSuccessModal(true);
      refetchEvent();
      toast.success("🎉 Payment successful! Your slots are booked.");
    },
    onError: (error: any) => {
      if (registrationId) {
        freeSeatsMutation.mutate();
      }
      setIsPaymentDeducted(true);
      setErrorMessage(
        error.response?.data?.message || "Payment verification failed"
      );
      setShowLoadingModal(false);
      setShowFailureModal(true);
      refetchEvent();
    },
  });

  const openRazorpayCheckout = (orderData: any) => {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      setErrorMessage(
        "Payment system not loaded. Please refresh the page and try again."
      );
      freeSeatsMutation.mutate();
      return;
    }

    const razorpayOptions = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || "", // TODO: Add your Razorpay key
      amount: totalAmount * 100, // Amount in paise
      currency: Currency.INR,
      name: event?.title,
      order_id: orderData?.id,

      // Payment success handler
      handler: async function (response: any) {
        setShowLoadingModal(true);
        setLoadingStatus(LoadingStatus.Verifying);

        const verificationPayload = {
          bookingId: registrationId,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        };
        verifyPaymentMutation.mutate(verificationPayload);
      },

      // Pre-fill user information
      prefill: {
        name: user?.name || user?.email?.split("@")[0] || "Customer",
        email: user?.email,
        contact: user?.phone || "",
      },

      // Additional booking details
      notes: {
        booking_id: registrationId,
        user_id: user?.id || "",
      },

      // UI theme
      theme: {
        color: "#16a34a", // Green color matching your design
      },

      // Payment modal settings
      modal: {
        ondismiss: function () {
          freeSeatsMutation.mutate();
          toast.error("Payment cancelled");
        },
      },
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(razorpayOptions);

    // Handle payment failures
    razorpay.on("payment.failed", function (response: any) {
      toast.error(`Payment failed: ${response.error.description}`);
      freeSeatsMutation.mutate();
    });

    razorpay.open();
  };

  // Load Razorpay script on component mount
  useEffect(() => {
    // Load Razorpay script only if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Only remove if we added it
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  // Payment method selection handler
  const handlePaymentMethodSelection = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodModal(false);

    // Start the registration flow with loading modal
    setLoadingStatus(LoadingStatus.Validating);
    setShowLoadingModal(true);
    validateEventRegistrationMutation.mutate();
  };

  const handleRetryRegistration = () => {
    setShowFailureModal(false);
    setShowPaymentMethodModal(true);
  };

  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Show payment method modal for ticket selection
    setShowPaymentMethodModal(true);
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getAvailabilityStatus = () => {
    if (!event) return { text: "", color: "", icon: null };
    const percentage = (event.bookedSeats / event.capacity) * 100;
    if (percentage >= 100) {
      return {
        text: "Sold Out",
        color: "text-red-400",
        icon: <AlertCircle className="h-4 w-4" />,
      };
    } else if (percentage >= 90) {
      return {
        text: "Almost Full",
        color: "text-yellow-400",
        icon: <AlertCircle className="h-4 w-4" />,
      };
    } else {
      return {
        text: "Available",
        color: "text-green-400",
        icon: <CheckCircle className="h-4 w-4" />,
      };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Event Not Found
            </h1>
            <Link to="/events" className="text-blue-400 hover:text-blue-300">
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/events")}
          className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden border border-gray-700/50">
              {/* Event Image */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                  <Calendar className="h-24 w-24 text-blue-400 opacity-50" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                {/* Featured Badge */}
                {event?.featured && (
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      <Star className="h-4 w-4" />
                      <span>Featured</span>
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={handleFavorite}
                    className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                      isFavorited
                        ? "bg-red-500/80 text-white"
                        : "bg-gray-800/80 text-gray-300 hover:text-red-400"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-gray-800/80 backdrop-blur-md rounded-full text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {/* Event Info */}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {event?.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {event?.title}
                </h1>
                <p className="text-gray-300 text-lg mb-6">
                  {event?.description}
                </p>
                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                    <span>{formatDate(event?.date?.toString() ?? "")}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-5 w-5 mr-3 text-blue-400" />
                    <span>{event?.time}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="h-5 w-5 mr-3 text-blue-400" />
                    <span>{event?.location?.address}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Users className="h-5 w-5 mr-3 text-blue-400" />
                    <span>Capacity: {event?.capacity}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Ticket className="h-5 w-5 mr-3 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      ₹{event?.ticketPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 sticky top-24">
              <div className="flex justify-between">
                <div className="flex flex-col text-white gap-3">
                  <div className="text-2xl font-bold">{event?.venueName}</div>
                  <div className="text-md">
                    <span>{formatDate(event?.date?.toString() ?? "")}</span>
                  </div>
                </div>
                <div>
                  <div className="text-center mb-2">
                    <div className="text-3xl font-bold text-white">
                      ₹{event?.ticketPrice}
                    </div>
                    <div className="text-gray-400">per ticket</div>
                  </div>
                  {/* Availability Status */}
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    {availabilityStatus.icon}
                    <span
                      className={`font-semibold ${availabilityStatus.color}`}
                    >
                      {availabilityStatus.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Selector */}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Tickets
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={numberOfTickets}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (
                        value + (event?.bookedSeats || 0) <=
                        (event?.capacity || 0)
                      ) {
                        setNumberOfTickets(value);
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter number of tickets"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Ticket className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Price per ticket:</span>
                    <span className="text-white font-medium">
                      ₹{event?.ticketPrice || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-400">Quantity:</span>
                    <span className="text-white font-medium">
                      {numberOfTickets} ticket{numberOfTickets > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white font-medium">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 mt-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">
                        Total Amount:
                      </span>
                      <span className="text-green-400 font-bold text-lg">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity Info */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                <span>Booked</span>
                <span>
                  {event?.bookedSeats}/{event?.capacity}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      ((event?.bookedSeats || 0) / (event?.capacity || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              {/* Registration Button */}
              <button
                onClick={handleRegister}
                disabled={(event?.bookedSeats || 0) >= (event?.capacity || 0)}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                  (event?.bookedSeats || 0) >= (event?.capacity || 0)
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                }`}
              >
                {(event?.bookedSeats || 0) >= (event?.capacity || 0)
                  ? "Sold Out"
                  : "Register Now"}
              </button>

              {!isAuthenticated && (
                <p className="text-center text-gray-400 text-sm mt-3">
                  <Link
                    to="/login"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Login
                  </Link>{" "}
                  required to register
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Custom CSS */}
      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Event Registration Modals */}
      {event && (
        <>
          <EventPaymentMethodModal
            isOpen={showPaymentMethodModal}
            onClose={() => setShowPaymentMethodModal(false)}
            onSelectPaymentMethod={handlePaymentMethodSelection}
            event={event}
            numberOfTickets={numberOfTickets}
            totalAmount={totalAmount}
            subtotal={subtotal}
          />

          <EventPaymentLoadingModal
            isOpen={showLoadingModal}
            status={loadingStatus}
          />

          <EventPaymentFailureModal
            isOpen={showFailureModal}
            onClose={() => setShowFailureModal(false)}
            onRetry={handleRetryRegistration}
            failureType={failureType}
            errorMessage={errorMessage}
            isPaymentDeducted={isPaymentDeducted}
          />

          <EventPaymentSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            registrationDetails={{
              registrationId,
              event,
              numberOfTickets,
              totalAmount,
              paymentMethod: selectedPaymentMethod || PaymentMethod.Razorpay,
              paymentId: "mock-payment-id", // TODO: Get from payment response
              registeredAt: new Date(),
            }}
          />
        </>
      )}
    </div>
  );
};

export default EventDetailsPage;
