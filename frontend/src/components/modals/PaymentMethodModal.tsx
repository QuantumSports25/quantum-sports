import React from "react";
import {
  X,
  Wallet,
  CreditCard,
  MapPin,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { Venue } from "../../pages/booking/VenueDetailsPage";
import { Activity } from "../../pages/booking/components/BookSlots/ActivitySelector";
import { Facility } from "../../pages/booking/components/BookSlots/FacilitySelector";
import { Slot } from "../../pages/booking/components/BookSlots/SlotSelector";
import { PaymentMethod } from "../../services/partner-service/paymentService";
import ModalPortal from "../common/ModalPortal";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  venue: Venue;
  selectedActivity: Activity;
  selectedFacility: Facility;
  selectedSlots: Slot[];
  total: number;
  subtotal: number;
  gst: number;
  userWalletBalance?: number;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSelectPaymentMethod,
  venue,
  selectedActivity,
  selectedFacility,
  selectedSlots,
  total,
  subtotal,
  gst,
  userWalletBalance = 0,
}) => {
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

  const isWalletSufficient = userWalletBalance >= total;

  // Prevent background interaction
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Handle ESC key
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscKey);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscKey);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4 pt-20"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-2xl min-h-[500px] max-h-[85vh] overflow-y-auto shadow-2xl mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Choose Payment Method
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Summary
              </h3>

              {/* Venue Info */}
              <div className="flex items-start space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">{venue.name}</h4>
                  <p className="text-sm text-gray-600">
                    {venue.location?.address || venue.location?.city}
                  </p>
                </div>
              </div>

              {/* Activity & Facility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Activity</p>
                    <p className="font-medium text-gray-900">
                      {selectedActivity.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Facility</p>
                    <p className="font-medium text-gray-900">
                      {selectedFacility.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Slots */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Time Slots
                </p>
                <div className="space-y-2">
                  {selectedSlots.map((slot, index) => (
                    <div
                      key={slot.id || index}
                      className="flex items-center justify-between text-sm bg-white rounded-lg p-2"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{formatDate(slot?.date?.toString())}</span>
                        <Clock className="w-4 h-4 text-green-500" />
                        <span>
                          {formatTime(slot?.startTime?.toString())} -{" "}
                          {formatTime(slot?.endTime?.toString())}
                        </span>
                      </div>
                      <span className="font-medium">₹{slot.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-3">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                    <span>Total Amount</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Payment Method
              </h3>

              {/* Wallet Payment */}
              <div
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  isWalletSufficient
                    ? "border-green-200 hover:border-green-300 hover:bg-green-50"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                }`}
                onClick={() =>
                  isWalletSufficient &&
                  onSelectPaymentMethod(PaymentMethod.Wallet)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Wallet Payment
                      </h4>
                      <p className="text-sm text-gray-600">
                        Available Balance: ₹{userWalletBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isWalletSufficient ? (
                      <div className="text-green-600 font-medium">
                        ✓ Sufficient Balance
                      </div>
                    ) : (
                      <div className="text-red-500 font-medium">
                        Insufficient Balance
                      </div>
                    )}
                  </div>
                </div>
                {!isWalletSufficient && (
                  <div className="mt-2 text-xs text-red-500">
                    You need ₹{(total - userWalletBalance).toFixed(2)} more to
                    pay via wallet
                  </div>
                )}
              </div>

              {/* Razorpay Payment */}
              <div
                className="border-2 border-blue-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                onClick={() => onSelectPaymentMethod(PaymentMethod.Razorpay)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Card/UPI/Net Banking
                    </h4>
                    <p className="text-sm text-gray-600">
                      Pay securely via Razorpay - Cards, UPI, Net Banking,
                      Wallets
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Visa
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Mastercard
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      UPI
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Net Banking
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">🔒</span>
                </div>
                <div>
                  <h5 className="font-medium text-blue-900">Secure Payment</h5>
                  <p className="text-sm text-blue-700">
                    Your payment information is encrypted and secure. We never
                    store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default PaymentMethodModal;
