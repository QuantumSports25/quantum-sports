import React from "react";
import { Loader2, Clock, CheckCircle, CreditCard } from "lucide-react";
import ModalPortal from "../common/ModalPortal";

interface PaymentLoadingModalProps {
  isOpen: boolean;
  status: "validating" | "creating" | "verifying" | "processing";
}

const PaymentLoadingModal: React.FC<PaymentLoadingModalProps> = ({
  isOpen,
  status,
}) => {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusContent = () => {
    switch (status) {
      case "validating":
        return {
          icon: <Clock className="w-8 h-8 text-blue-600" />,
          title: "Validating Booking",
          description:
            "We're checking slot availability and validating your booking details...",
          color: "blue",
        };
      case "creating":
        return {
          icon: <CreditCard className="w-8 h-8 text-orange-600" />,
          title: "Creating Payment Order",
          description:
            "Setting up your payment order and preparing the checkout process...",
          color: "orange",
        };
      case "verifying":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          title: "Verifying Payment",
          description: "Confirming your payment and finalizing your booking...",
          color: "green",
        };
      case "processing":
        return {
          icon: <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />,
          title: "Processing Request",
          description: "Please wait while we process your request...",
          color: "purple",
        };
      default:
        return {
          icon: <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />,
          title: "Processing",
          description: "Please wait...",
          color: "gray",
        };
    }
  };

  const content = getStatusContent();

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4 pt-20">
        <div className="bg-white rounded-2xl w-full max-w-md min-h-[400px] shadow-2xl mt-4">
          <div className="p-8 h-full flex flex-col justify-center">
            {/* Loading Animation */}
            <div className="flex flex-col items-center text-center">
              {/* Icon with pulsing animation */}
              <div
                className={`w-16 h-16 bg-${content.color}-100 rounded-full flex items-center justify-center mb-6 animate-pulse`}
              >
                {content.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {content.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {content.description}
              </p>

              {/* Progress Indicator */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs text-gray-500">
                    {status === "validating" && "Step 1 of 3"}
                    {status === "creating" && "Step 2 of 3"}
                    {status === "verifying" && "Step 3 of 3"}
                    {status === "processing" && "Processing..."}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${content.color}-600 h-2 rounded-full transition-all duration-500 ease-in-out`}
                    style={{
                      width:
                        status === "validating"
                          ? "33%"
                          : status === "creating"
                          ? "66%"
                          : status === "verifying"
                          ? "100%"
                          : "50%",
                    }}
                  ></div>
                </div>
              </div>

              {/* Status Steps */}
              <div className="flex items-center justify-between w-full mt-6 text-xs">
                <div
                  className={`flex flex-col items-center ${
                    status === "validating"
                      ? "text-blue-600"
                      : ["creating", "verifying"].includes(status)
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === "validating"
                        ? "bg-blue-600 animate-pulse"
                        : ["creating", "verifying"].includes(status)
                        ? "bg-green-600"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="mt-1">Validate</span>
                </div>

                <div
                  className={`flex flex-col items-center ${
                    status === "creating"
                      ? "text-orange-600"
                      : status === "verifying"
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === "creating"
                        ? "bg-orange-600 animate-pulse"
                        : status === "verifying"
                        ? "bg-green-600"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="mt-1">Create</span>
                </div>

                <div
                  className={`flex flex-col items-center ${
                    status === "verifying" ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === "verifying"
                        ? "bg-green-600 animate-pulse"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="mt-1">Verify</span>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  🔒 Secure transaction in progress. Please do not close this
                  window.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default PaymentLoadingModal;
