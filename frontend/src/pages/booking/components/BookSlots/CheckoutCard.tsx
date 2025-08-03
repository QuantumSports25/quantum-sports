import React, { useEffect, useState } from "react";
import { MapPin, Gift, ArrowRight, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Slot } from "./SlotSelector";
import { Activity } from "./ActivitySelector";
import { Facility } from "./FacilitySelector";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createBookingOrder,
  validateAndCreateBooking,
  verifyBookingPayment,
  PaymentMethod,
} from "../../../../services/partner-service/paymentService";
import { useAuthStore } from "../../../../store/authStore";
import { toast } from "react-hot-toast";
import { Venue } from "../../VenueDetailsPage";
import { unlockSlots } from "../../../../services/partner-service/slotService";
import { getUserWalletBalance } from "../../../../services/partner-service/walletService";
import PaymentMethodModal from "../../../../components/modals/PaymentMethodModal";
import PaymentFailureModal from "../../../../components/modals/PaymentFailureModal";
import PaymentSuccessModal from "../../../../components/modals/PaymentSuccessModal";
import PaymentLoadingModal from "../../../../components/modals/PaymentLoadingModal";

export enum Currency {
  INR = "INR",
  USD = "USD",
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutCardProps {
  refetchSlots: () => void;
  venue: Venue;
  selectedActivity: Activity | null;
  selectedFacility: Facility | null;
  selectedSlots: Slot[];
}

export enum LoadingStatus {
  Validating = "validating",
  Creating = "creating",
  Verifying = "verifying",
  Processing = "processing",
}

export enum FailedType {
  Validation = "validation",
  OrderCreation = "order_creation",
  PaymentVerification = "payment_verification",
}

const CheckoutCard: React.FC<CheckoutCardProps> = ({
  refetchSlots,
  venue,
  selectedSlots,
  selectedActivity,
  selectedFacility,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const subtotal = selectedSlots.reduce((sum, slot) => sum + slot.amount, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  const [validating, setValidating] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [slotIds, setSlotIds] = useState<string[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);

  // Modal states
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(LoadingStatus.Validating);
  const [failureType, setFailureType] = useState<FailedType>(FailedType.Validation);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPaymentDeducted, setIsPaymentDeducted] = useState(false);
  const [successBookingDetails, setSuccessBookingDetails] = useState<any>(null);

  // User wallet balance query
  const { data: userWalletBalance = 0 } = useQuery({
    queryKey: ["walletBalance", user?.id],
    queryFn: () => getUserWalletBalance(user?.id || ""),
    enabled: !!user?.id && isAuthenticated,
    staleTime: 30000, // 30 seconds
  });

  useEffect(() => {
    setSlotIds(
      selectedSlots
        .map((slot) => slot.id)
        .filter((id): id is string => typeof id === "string")
    );
  }, [selectedSlots]);

  const unlockSlotmutation = useMutation({
    mutationFn: () => unlockSlots(slotIds),
    onSuccess: () => {
      refetchSlots();
    },
  });

  // Step 1: Validate and create booking mutation
  const validateBookingMutation = useMutation({
    mutationFn: () => {
      const bookingData = {
        venueId: selectedActivity?.venueId || "",
        userId: user?.id || "",
        partnerId: venue.partnerId,
        facilityId: selectedFacility?.id || "",
        slotIds: slotIds,
        activityId: selectedActivity?.id || "",
        amount: total,
        startTime: selectedSlots[0]?.startTime || "",
        endTime: selectedSlots[selectedSlots.length - 1]?.endTime || "",
        bookedDate: new Date(),
        paymentMethod: selectedPaymentMethod || PaymentMethod.Razorpay,
      };

      return validateAndCreateBooking(bookingData);
    },
    onSuccess: (bookingResponse) => {
      setBookingId(bookingResponse);
      setValidating(false);
      setLoadingStatus(LoadingStatus.Creating);
      setInitiatingPayment(true);

      // Proceed to create order
      createOrderMutation.mutate(bookingResponse);
    },
    onError: (error: any) => {
      setValidating(false);
      setShowLoadingModal(false);
      setFailureType(FailedType.Validation);
      setErrorMessage(error?.message || "Booking validation failed");
      setShowFailureModal(true);
      unlockSlotmutation.mutate();
    },
  });

  // Step 2: Create payment order mutation
  const createOrderMutation = useMutation({
    mutationFn: (bookingId: string) => {
      return createBookingOrder(bookingId);
    },
    onSuccess: (orderResponse) => {
      if (!orderResponse?.id) {
        throw new Error("Failed to create payment order");
      }
      setInitiatingPayment(false);

      // Handle different payment methods
      if (selectedPaymentMethod === PaymentMethod.Wallet) {
        // For wallet payment, directly verify with orderId
        setLoadingStatus(LoadingStatus.Verifying);
        setVerifyingPayment(true);
        verifyPaymentMutation.mutate({
          bookingId: bookingId,
          orderId: orderResponse.id,
        });
      } else {
        // For Razorpay, close loading modal and open checkout
        setShowLoadingModal(false);
        openRazorpayCheckout(orderResponse);
      }
    },
    onError: (error: any) => {
      setInitiatingPayment(false);
      setShowLoadingModal(false);
      setFailureType(FailedType.OrderCreation);
      setErrorMessage(error?.message || "Order creation failed");
      setShowFailureModal(true);
      unlockSlotmutation.mutate();
    },
  });

  // Step 3: Verify payment mutation
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
    onSuccess: (response) => {
      setVerifyingPayment(false);
      setShowLoadingModal(false);

      // Check if verification was successful
      if (
        response &&
        response.message &&
        response.message.includes("verified")
      ) {
        // Prepare success modal data
        setSuccessBookingDetails({
          bookingId,
          venue,
          selectedActivity,
          selectedFacility,
          selectedSlots,
          total,
          paymentMethod: selectedPaymentMethod,
          paymentId: response.paymentId,
          bookedAt: new Date(),
        });
        setShowSuccessModal(true);
        toast.success("🎉 Payment successful! Your slots are booked.");
      } else {
        setFailureType(FailedType.PaymentVerification);
        setIsPaymentDeducted(true);
        setErrorMessage("Payment verification failed");
        setShowFailureModal(true);
      }
    },
    onError: (error: any) => {
      setVerifyingPayment(false);
      setShowLoadingModal(false);
      setFailureType(FailedType.PaymentVerification);
      setIsPaymentDeducted(selectedPaymentMethod === PaymentMethod.Razorpay); // Wallet payments are instant
      setErrorMessage(error?.message || "Payment verification failed");
      setShowFailureModal(true);
      unlockSlotmutation.mutate();
    },
  });

  // Payment method selection handler
  const handlePaymentMethodSelection = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodModal(false);

    // Start the booking flow with loading modal
    setLoadingStatus(LoadingStatus.Validating);
    setShowLoadingModal(true);
    setValidating(true);
    validateBookingMutation.mutate();
  };

  // Modal handlers
  const handleCloseFailureModal = () => {
    setShowFailureModal(false);
    setErrorMessage("");
    setIsPaymentDeducted(false);
  };

  const handleRetryPayment = () => {
    setShowFailureModal(false);
    setShowLoadingModal(false);
    setShowPaymentMethodModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessBookingDetails(null);
    // Optionally navigate to bookings page or refresh slots
    refetchSlots();
  };
  const openRazorpayCheckout = (orderData: any) => {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      toast.error(
        "Payment system not loaded. Please refresh the page and try again."
      );
      setInitiatingPayment(false);
      return;
    }

    const razorpayOptions = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || "", // TODO: Add your Razorpay key
      amount: total * 100, // Amount in paise
      currency: Currency.INR,
      name: venue.name,
      order_id: orderData?.id,

      // Payment success handler
      handler: async function (response: any) {
        setShowLoadingModal(true);
        setLoadingStatus(LoadingStatus.Verifying);
        setVerifyingPayment(true);

        const verificationPayload = {
          bookingId: bookingId,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        };
        verifyPaymentMutation.mutate(verificationPayload);
      },

      // Pre-fill user information
      prefill: {
        name: user?.name || user?.email?.split("@")[0] || "Customer",
        email: userInfo.email || user?.email || "",
        contact: userInfo.mobile || user?.phone || "",
      },

      // Additional booking details
      notes: {
        venue_id: selectedActivity?.venueId || "",
        facility_id: selectedFacility?.id || "",
        activity_id: selectedActivity?.id || "",
        booking_id: bookingId,
        user_id: user?.id || "",
      },

      // UI theme
      theme: {
        color: "#16a34a", // Green color matching your design
      },

      // Payment modal settings
      modal: {
        ondismiss: function () {
          setInitiatingPayment(false);
          setVerifyingPayment(false);
          toast.error("Payment cancelled");
        },
      },
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(razorpayOptions);

    // Handle payment failures
    razorpay.on("payment.failed", function (response: any) {
      toast.error(`Payment failed: ${response.error.description}`);
      setInitiatingPayment(false);
      setVerifyingPayment(false);
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

  // Main payment initiation handler
  const handleProceed = () => {
    // Check authentication first
    if (!isAuthenticated) {
      // Navigate to login with payment intent
      navigate("/login", {
        state: {
          intent: "proceed_to_payment",
          from: { pathname: window.location.pathname },
        },
      });
      return;
    }

    // Validate required fields - use user data if userInfo is empty
    const email = userInfo.email || user?.email || "";
    const mobile = userInfo.mobile || user?.phone || "";

    if (!email && !mobile) {
      toast.error("Please fill in email and mobile number");
      return;
    }

    if (!selectedActivity || !selectedFacility || selectedSlots.length === 0) {
      toast.error(
        "Please select an activity, facility, and at least one slot."
      );
      return;
    }

    // Show payment method selection modal
    setShowPaymentMethodModal(true);
  };
  const [userInfo, setUserInfo] = useState({
    email: user?.email || "",
    mobile: user?.phone || "",
    dob: "",
  });

  // Update userInfo when user data changes (after login/register)
  useEffect(() => {
    if (user) {
      setUserInfo((prev) => ({
        email: user.email || prev.email,
        mobile: user.phone || prev.mobile,
        dob: prev.dob, // Keep existing dob as it's not in User interface
      }));
    }
  }, [user]);

  const [saveToProfile, setSaveToProfile] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  // Check if user info has changed from profile data
  const hasUserInfoChanged = () => {
    if (!user) return false;
    return (
      userInfo.email !== (user.email || "") ||
      userInfo.mobile !== (user.phone || "")
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Show closed state until all selections are made
  if (!selectedActivity) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-fit sticky top-4">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Booking Summary
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Choose an Activity
          </h4>
          <p className="text-gray-600 text-sm">
            Please select an activity to start your booking.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedFacility) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-fit sticky top-4">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Booking Summary
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Choose a Facility
          </h4>
          <p className="text-gray-600 text-sm">
            Please select a facility for your chosen activity.
          </p>
        </div>
      </div>
    );
  }

  if (selectedSlots.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-fit sticky top-4">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Booking Summary
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Choose Time Slots
          </h4>
          <p className="text-gray-600 text-sm">
            Please select at least one time slot to proceed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-fit sticky top-4">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>

      {/* Venue Info */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">{venue.name}</h4>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{venue.location?.city || "Location not available"}</span>
        </div>
      </div>

      {/* Selected Slots */}
      {selectedSlots.length > 0 && (
        <div className="mb-6 max-h-[300px] overflow-y-auto scrollbar-hide">
          <h5 className="font-medium text-gray-900 mb-3">Selected Slots</h5>
          <div className="space-y-3">
            {selectedSlots.map((slot: Slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(slot?.date?.toString())}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(slot?.startTime?.toString())}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ₹{slot.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Information */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-medium text-gray-900">Booking Information</h5>
          {user && (user.email || user.phone) && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ✓ Auto-filled from profile
            </span>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) =>
                setUserInfo({ ...userInfo, email: e.target.value })
              }
              placeholder="Enter your email"
              className={`w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                user?.email ? "bg-green-50" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile
            </label>
            <input
              type="tel"
              value={userInfo.mobile}
              onChange={(e) =>
                setUserInfo({ ...userInfo, mobile: e.target.value })
              }
              placeholder="Enter your mobile number"
              className={`w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                user?.phone ? "bg-green-50" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth (Optional)
            </label>
            <input
              type="date"
              value={userInfo.dob}
              onChange={(e) =>
                setUserInfo({ ...userInfo, dob: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Options */}
        <div className="mt-4 space-y-2">
          {user && hasUserInfoChanged() && (
            <div className="text-xs bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
              <span className="text-yellow-700">
                ℹ️ You've modified your contact information from your profile
              </span>
            </div>
          )}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={saveToProfile}
              onChange={(e) => setSaveToProfile(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              {user
                ? "Update profile with this information"
                : "Save to profile"}
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={whatsappUpdates}
              onChange={(e) => setWhatsappUpdates(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Get WhatsApp updates</span>
          </label>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowCoupon(!showCoupon)}
          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Gift className="w-4 h-4 mr-1" />
          {showCoupon ? "Hide Coupon" : "Add Coupon"}
        </button>
        {showCoupon && (
          <div className="mt-3">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>GST (18%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleProceed}
          disabled={
            selectedSlots.length === 0 ||
            validating ||
            initiatingPayment ||
            verifyingPayment
          }
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {validating ? (
            <span>Validating Booking...</span>
          ) : initiatingPayment ? (
            <span>Opening Payment...</span>
          ) : verifyingPayment ? (
            <span>Verifying Payment...</span>
          ) : (
            <>
              <span>Pay ₹{total.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>

      {/* Payment Method Selection Modal */}
      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        onSelectPaymentMethod={handlePaymentMethodSelection}
        venue={venue}
        selectedActivity={selectedActivity!}
        selectedFacility={selectedFacility!}
        selectedSlots={selectedSlots}
        total={total}
        subtotal={subtotal}
        gst={gst}
        userWalletBalance={userWalletBalance}
      />

      {/* Payment Loading Modal */}
      <PaymentLoadingModal isOpen={showLoadingModal} status={loadingStatus} />

      {/* Payment Failure Modal */}
      <PaymentFailureModal
        isOpen={showFailureModal}
        onClose={handleCloseFailureModal}
        onRetry={handleRetryPayment}
        failureType={failureType}
        errorMessage={errorMessage}
        isPaymentDeducted={isPaymentDeducted}
      />

      {/* Payment Success Modal */}
      {successBookingDetails && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          bookingDetails={successBookingDetails}
        />
      )}
    </div>
  );
};

export default CheckoutCard;
