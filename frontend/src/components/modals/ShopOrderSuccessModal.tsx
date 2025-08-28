import React from "react";
import { CheckCircle, CreditCard, Home,  Package, Receipt, Truck } from "lucide-react";

interface OrderItemSummary {
  name: string;
  quantity: number;
}

interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ShopOrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: {
    orderId: string;
    paymentId?: string;
    paymentMethod: "Wallet" | "Razorpay";
    subtotal: number;
    total: number;
    items: OrderItemSummary[];
    shippingAddress: ShippingAddress;
    orderDate: Date;
  };
}

const ShopOrderSuccessModal: React.FC<ShopOrderSuccessModalProps> = ({ isOpen, onClose, details }) => {
  if (!isOpen) return null;

  const { orderId, paymentId, paymentMethod, subtotal, total, items, shippingAddress, orderDate } = details;

  // Safely format numbers with fallbacks
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '₹0';
    return `₹${value.toLocaleString()}`;
  };

  // Safely format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    try {
      return date.toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50 p-4 pt-20" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Order Confirmed</h2>
              <p className="text-green-100">Thank you! Your order has been placed successfully.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order IDs */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Order ID</p>
              <p className="font-mono text-lg font-semibold text-gray-900">{orderId}</p>
            </div>
            {paymentId && (
              <div>
                <p className="text-xs text-gray-600">Payment ID</p>
                <p className="font-mono text-sm text-gray-900">{paymentId}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-600">Order Date</p>
              <p className="text-gray-900">{formatDate(orderDate)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="border border-gray-200 rounded-xl">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Items</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {items && items.length > 0 ? (
                items.map((item, idx) => (
                  <li key={idx} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-gray-800">{item.name}</span>
                    <span className="text-gray-600">Qty: {item.quantity}</span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-gray-500">No items found</li>
              )}
            </ul>
          </div>

          {/* Shipping */}
          <div className="border border-gray-200 rounded-xl">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Shipping Address</h3>
            </div>
            <div className="px-4 py-3 text-gray-800 space-y-0.5">
              <div className="flex items-start gap-2">
                <Home className="w-4 h-4 text-gray-600 mt-0.5" />
                <div>
                  <p>{shippingAddress?.addressLine1 || 'N/A'}</p>
                  {shippingAddress?.addressLine2 ? <p>{shippingAddress.addressLine2}</p> : null}
                  <p>
                    {shippingAddress?.city || 'N/A'} - {shippingAddress?.postalCode || 'N/A'}
                  </p>
                  <p>{shippingAddress?.country || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="border border-gray-200 rounded-xl">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Payment Summary</h3>
            </div>
            <div className="px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="text-gray-900">{paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-semibold">
                <span>Total Paid</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onClose} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">Continue Shopping</button>
            <a href={`/orders`} className="flex-1 inline-flex items-center justify-center bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              <Receipt className="w-4 h-4 mr-2" /> View My Orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOrderSuccessModal;


