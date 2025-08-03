import React from "react";
import {
  CheckCircle,
  Download,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Users,
  CreditCard,
} from "lucide-react";
import { Venue } from "../../pages/booking/VenueDetailsPage";
import { Activity } from "../../pages/booking/components/BookSlots/ActivitySelector";
import { Facility } from "../../pages/booking/components/BookSlots/FacilitySelector";
import { Slot } from "../../pages/booking/components/BookSlots/SlotSelector";
import { PaymentMethod } from "../../services/partner-service/paymentService";
import ModalPortal from "../common/ModalPortal";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    bookingId: string;
    venue: Venue;
    selectedActivity: Activity;
    selectedFacility: Facility;
    selectedSlots: Slot[];
    total: number;
    paymentMethod: PaymentMethod;
    paymentId?: string;
    bookedAt: Date;
  };
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  bookingDetails,
}) => {
  const {
    bookingId,
    venue,
    selectedActivity,
    selectedFacility,
    selectedSlots,
    total,
    paymentMethod,
    paymentId,
    bookedAt,
  } = bookingDetails;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download functionality
    console.log("Download receipt for booking:", bookingId);
  };

  const handleShareBooking = () => {
    // TODO: Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: "Quantum Sports Booking Confirmation",
        text: `I've booked ${selectedActivity.name} at ${venue.name}!`,
        url: window.location.href,
      });
    }
  };

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
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-green-100">
                Congratulations! Your sports booking has been successfully
                confirmed.
              </p>
            </div>
          </div>

          <div className="p-6">
            {/* Booking Reference */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
              <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
                #{bookingId.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Keep this reference for future communications
              </p>
            </div>

            {/* Venue Information */}
            <div className="border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                Venue Details
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-xl">
                    {venue.name}
                  </h4>
                  <p className="text-gray-600">
                    {venue.location?.address || venue.location?.city}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Booking Schedule */}
            <div className="border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                Booking Schedule
              </h3>
              <div className="space-y-3">
                {selectedSlots.map((slot, index) => (
                  <div
                    key={slot.id || index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(slot?.date?.toString())}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatTime(slot?.startTime?.toString())} -{" "}
                            {formatTime(slot?.endTime?.toString())}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{slot.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 text-indigo-600 mr-2" />
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-900">
                    {paymentMethod === PaymentMethod.Wallet
                      ? "Wallet"
                      : "Card/UPI"}
                  </span>
                </div>
                {paymentId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="font-mono text-sm text-gray-900">
                      {paymentId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-bold text-xl text-green-600">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Booking Time</span>
                  <span className="text-gray-900">
                    {bookedAt.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-3">
                📋 Important Information
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Please arrive 15 minutes before your scheduled time</li>
                <li>• Bring a valid ID for verification</li>
                <li>
                  • Cancellation allowed up to 24 hours before booking time
                </li>
                <li>• Contact the venue for any special requirements</li>
                <li>• Keep this booking confirmation for entry</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                📞 Need Help?
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Venue Contact: {venue.phone || "+91 12345 67890"}</p>
                <p>Customer Support: support@quantumsports.com</p>
                <p>24/7 Helpline: +91 98765 43210</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
              <button
                onClick={handleShareBooking}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Booking</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Continue
              </button>
            </div>

            {/* Rating Prompt */}
            <div className="mt-6 text-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800 mb-2">
                🌟 <span className="font-medium">Enjoyed your experience?</span>
              </p>
              <p className="text-xs text-yellow-700">
                Rate your booking experience and help others find great venues!
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default PaymentSuccessModal;
