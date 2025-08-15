import React from "react";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Download,
  Share2,
  Ticket,
} from "lucide-react";
import ModalPortal from "../common/ModalPortal";
import { PaymentMethod } from "../../services/partner-service/paymentService";
import { Event } from "../../pages/EventsPage";

interface EventPaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationDetails: {
    registrationId: string;
    event: Event;
    numberOfTickets: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    paymentId?: string;
    registeredAt: Date;
  };
}

const EventPaymentSuccessModal: React.FC<EventPaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  registrationDetails,
}) => {
  const {
    registrationId,
    event,
    numberOfTickets,
    totalAmount,
    paymentMethod,
    paymentId,
    registeredAt,
  } = registrationDetails;

  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadTicket = () => {
    // TODO: Implement ticket download functionality
    console.log("Download ticket for registration:", registrationId);
  };

  const handleShareEvent = () => {
    // TODO: Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: "Quantum Sports Event Registration",
        text: `I've registered for ${event.title}!`,
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
          className="bg-white rounded-2xl w-full max-w-2xl min-h-[500px] max-h-[85vh] overflow-y-auto shadow-2xl mt-4 scrollbar-hide"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Registration Confirmed!
              </h2>
              <p className="text-green-100">
                Congratulations! Your event registration has been successfully
                confirmed.
              </p>
            </div>
          </div>

          <div className="p-6">
            {/* Registration Reference */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">
                Registration Reference
              </p>
              <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
                #{registrationId.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Keep this reference for future communications
              </p>
            </div>

            {/* Event Information */}
            <div className="border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                Event Details
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-xl">
                    {event.title}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {event.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium text-gray-900">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Venue</p>
                      <p className="font-medium text-gray-900">
                        {event.venueName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Ticket className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500">Tickets</p>
                      <p className="font-medium text-gray-900">
                        {numberOfTickets} ticket{numberOfTickets > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                Event Location
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.location?.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.location?.city}, {event.location?.state}
                    </p>
                    {event.mapLocationLink && (
                      <a
                        href={event.mapLocationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline mt-1 inline-block"
                      >
                        View on Maps
                      </a>
                    )}
                  </div>
                </div>
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
                      {paymentId.slice(-8)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-bold text-xl text-green-600">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Registration Time</span>
                  <span className="text-gray-900">
                    {registeredAt.toLocaleString("en-US", {
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
                🎫 Important Information
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Please arrive 30 minutes before the event starts</li>
                <li>• Bring a valid ID and this confirmation for entry</li>
                <li>• Check your email for event updates and instructions</li>
                <li>
                  • Event cancellation allowed up to 48 hours before event date
                </li>
                <li>
                  • Contact support for any special requirements or queries
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                📞 Need Help?
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Event Organizer: {event.organizerName || "Event Team"}</p>
                <p>Customer Support: support@quantumsports.com</p>
                <p>24/7 Helpline: +91 98765 43210</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleDownloadTicket}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Ticket</span>
              </button>
              <button
                onClick={handleShareEvent}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Event</span>
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
                🌟 <span className="font-medium">Excited for the event?</span>
              </p>
              <p className="text-xs text-yellow-700">
                Share your excitement and help others discover amazing events!
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EventPaymentSuccessModal;
