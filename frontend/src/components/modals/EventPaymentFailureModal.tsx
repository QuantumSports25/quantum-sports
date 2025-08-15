import React from "react";
import { X, AlertTriangle, RefreshCw, Headphones } from "lucide-react";
import ModalPortal from "../common/ModalPortal";

interface EventPaymentFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  failureType: "validation" | "order_creation" | "payment_verification";
  errorMessage?: string;
  isPaymentDeducted?: boolean;
}

const EventPaymentFailureModal: React.FC<EventPaymentFailureModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  failureType,
  errorMessage,
  isPaymentDeducted = false,
}) => {
  const getFailureContent = () => {
    switch (failureType) {
      case "validation":
        return {
          title: "Event Registration Validation Failed",
          description:
            "We couldn't validate your event registration details. This might be due to ticket availability changes.",
          action: "Please try registering for the event again.",
          canRetry: true,
          showPaymentDeductedWarning: false,
        };
      case "order_creation":
        return {
          title: "Payment Order Creation Failed",
          description:
            "We couldn't create your payment order for the event registration. This is usually a temporary issue.",
          action: "Please try again in a few moments.",
          canRetry: true,
          showPaymentDeductedWarning: false,
        };
      case "payment_verification":
        return {
          title: "Payment Verification Failed",
          description:
            "We couldn't verify your payment for the event registration. This might be a temporary issue with our payment system.",
          action: isPaymentDeducted
            ? "If your payment was deducted, don't worry - our team will contact you shortly to resolve this and confirm your event registration."
            : "Please try the payment process again.",
          canRetry: !isPaymentDeducted,
          showPaymentDeductedWarning: isPaymentDeducted,
        };
      default:
        return {
          title: "Event Registration Failed",
          description:
            "Something went wrong during the event registration process.",
          action: "Please try again.",
          canRetry: true,
          showPaymentDeductedWarning: false,
        };
    }
  };

  const content = getFailureContent();

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
          className="bg-white rounded-2xl w-full max-w-md min-h-[400px] shadow-2xl mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {content.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Error Description */}
            <div className="mb-6">
              <p className="text-gray-700 mb-3">{content.description}</p>
              <p className="text-gray-600 text-sm">{content.action}</p>

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Error details: </span>
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Deducted Warning */}
            {content.showPaymentDeductedWarning && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      Payment Deducted?
                    </h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      If money has been deducted from your account, please don't
                      worry. Our team will:
                    </p>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Contact you within 24 hours</li>
                      <li>• Verify your payment details</li>
                      <li>
                        • Complete your event registration or process a refund
                      </li>
                      <li>• Keep you updated throughout the process</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Support Information */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Headphones className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Need Help?
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Our support team is here to help you resolve any event
                    registration or payment issues.
                  </p>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>📧 Email: support@quantumsports.com</p>
                    <p>📞 Phone: +91 12345 67890</p>
                    <p>💬 Live Chat: Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {content.canRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              )}
              <button
                onClick={onClose}
                className={`${
                  content.canRetry ? "flex-1" : "w-full"
                } bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200`}
              >
                {content.canRetry ? "Cancel" : "Close"}
              </button>
            </div>

            {/* Additional Information */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Transaction ID: {Date.now().toString().slice(-8)} • Time:{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EventPaymentFailureModal;
