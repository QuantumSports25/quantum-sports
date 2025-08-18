import React from "react";
import { X, CreditCard, Handshake } from "lucide-react";
import ModalPortal from "../common/ModalPortal";

interface VenuePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMonthly: () => void;
    onSelectRevenueShare: () => void;
}

const VenuePlanModal: React.FC<VenuePlanModalProps> = ({
    isOpen,
    onClose,
    onSelectMonthly,
    onSelectRevenueShare,
}) => {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    React.useEffect(() => {
        if (!isOpen) return;
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onEsc);
        return () => document.removeEventListener("keydown", onEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                onClick={handleBackdropClick}
            >
                <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="mb-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-900">Choose a plan to add your venue</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Select how you’d like to proceed for adding a new venue
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={onSelectMonthly}
                            className="w-full rounded-xl border-2 border-blue-200 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50"
                        >
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-base font-semibold text-gray-900">Monthly Plan</h4>
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                            ₹4,999 / venue / month
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Pay a flat monthly fee per venue to list and manage bookings
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={onSelectRevenueShare}
                            className="w-full rounded-xl border-2 border-purple-200 p-4 text-left transition-all hover:border-purple-300 hover:bg-purple-50"
                        >
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                                    <Handshake className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900">Revenue Share</h4>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Connect with our sales team to set up a revenue-sharing agreement
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

export default VenuePlanModal;


