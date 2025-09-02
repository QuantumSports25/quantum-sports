import React from "react";
import { CheckCircle, CreditCard, Home, Package, Receipt, Truck,  Share2, Copy,  MapPin } from "lucide-react";

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
      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  // Copy order ID to clipboard
  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy order ID:', err);
    }
  };

  // Share order details
  const shareOrder = async () => {
    const shareText = `Order Confirmed! Order ID: ${orderId}\nTotal: ${formatCurrency(total)}\nOrder Date: ${formatDate(orderDate)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Order Confirmation',
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy order details:', err);
      }
    }
  };

  // Calculate estimated delivery date (3-5 business days)
  const getEstimatedDelivery = () => {
    if (!orderDate) return 'N/A';
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 5); // Add 5 days
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(deliveryDate);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50 p-4 pt-20" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">🎉 Order Confirmed!</h2>
              <p className="text-green-100 text-lg">Thank you for your purchase! Your order has been placed successfully.</p>
            </div>
          </div>
          
          {/* Confetti effect */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Order Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-xs text-gray-600 mb-1">Order ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-semibold text-gray-900">{orderId}</p>
                  <button
                    onClick={copyOrderId}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy Order ID"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {paymentId && (
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-xs text-gray-600 mb-1">Payment ID</p>
                  <p className="font-mono text-sm text-gray-900">{paymentId}</p>
                </div>
              )}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-xs text-gray-600 mb-1">Order Date</p>
                <p className="text-sm text-gray-900">{formatDate(orderDate)}</p>
              </div>
            </div>
          </div>

          {/* Delivery Estimate */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-purple-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Estimated Delivery</h4>
                <p className="text-sm text-gray-600">{getEstimatedDelivery()}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Ordered Items</h3>
              <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                {items?.length || 0} items
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {items && items.length > 0 ? (
                items.map((item, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">Qty: {item.quantity}</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-gray-500 text-center">No items found</div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Shipping Address</h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{shippingAddress?.addressLine1 || 'N/A'}</p>
                  {shippingAddress?.addressLine2 && (
                    <p className="text-gray-600">{shippingAddress.addressLine2}</p>
                  )}
                  <p className="text-gray-600">
                    {shippingAddress?.city || 'N/A'}, {shippingAddress?.postalCode || 'N/A'}
                  </p>
                  <p className="text-gray-600">{shippingAddress?.country || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Payment Summary</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {paymentMethod || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">{(subtotal || 0) > 2000 ? 'Free' : '₹99'}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total Paid</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• You'll receive an email confirmation shortly</li>
              <li>• We'll send tracking updates as your order ships</li>
              <li>• Estimated delivery: {getEstimatedDelivery()}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </button>
            <button
              onClick={shareOrder}
              className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Order
            </button>
            <a 
              href="/orders" 
              className="flex-1 inline-flex items-center justify-center bg-gray-100 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200 gap-2"
            >
              <Receipt className="w-5 h-5" />
              View My Orders
            </a>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p>Need help? Contact our support team at support@quantumsports.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOrderSuccessModal;



