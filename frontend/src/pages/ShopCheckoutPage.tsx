import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { shopService, ShippingAddress, CreateOrderRequest, ShopCartProduct } from '../services/shopService';

// Using CartItem from cart store directly

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'razorpay', name: 'Credit/Debit Card', description: 'Pay securely with your card' },
  { id: 'wallet', name: 'Wallet', description: 'Pay using your wallet balance' }
];

const ShopCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items: cartItems, clearCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('razorpay');
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    // Check if cart has items, if not redirect to shop
    if (cartItems.length === 0) {
      navigate('/shop');
    }
  }, [cartItems.length, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.discountPrice * item.quantity), 0);
  };

  const getShipping = () => {
    return getSubtotal() > 2000 ? 0 : 99; // Free shipping over ₹2000
  };

  const getTax = () => {
    return Math.round(getSubtotal() * 0.18); // 18% GST
  };

  const getTotal = () => {
    return getSubtotal() + getShipping() + getTax();
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.state.trim()) return 'State is required';
    if (!formData.zipCode.trim()) return 'ZIP code is required';
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';
    
    // Basic phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: '/shop/checkout' } });
      return;
    }

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Debug: Log current user and auth state
      console.log('Checkout - User:', user);
      console.log('Checkout - Is Authenticated:', isAuthenticated);
      console.log('Checkout - Auth Token:', useAuthStore.getState().token);
      
      // Prepare shipping address
      const shippingAddress: ShippingAddress = {
        addressLine1: formData.address,
        addressLine2: '',
        city: formData.city,
        postalCode: formData.zipCode,
        country: 'India'
      };

      // Prepare cart products for order
      const orderProducts: ShopCartProduct[] = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        name: item.product.name
      }));

      // Create order request
      const paymentMethodValue = selectedPaymentMethod === 'wallet' ? 'Wallet' : 'Razorpay';
      console.log('Selected payment method:', selectedPaymentMethod);
      console.log('Converted payment method:', paymentMethodValue);
      
      // Compute subtotal based on backend product price (exclude discounts/shipping/tax)
      const backendSubtotal = cartItems.reduce(
        (sum, item) => sum + (item.product.markedPrice * item.quantity),
        0
      );

      const orderRequest: CreateOrderRequest = {
        userId: user.id,
        products: orderProducts,
        shippingAddress,
        totalAmount: backendSubtotal,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        sellerId: 'default-seller-id', // TODO: Get seller ID from product when available
        paymentMethod: paymentMethodValue
      };

      // Create order before payment
      console.log('About to create order with request:', orderRequest);
      const created = await shopService.createOrderBeforePayment(orderRequest);
      const orderId = typeof created === 'string' ? created : created?.id;
      if (!orderId) throw new Error('Failed to create order');
      console.log('Order created successfully:', orderId);

      // Create payment order on backend
      const paymentResponse = await shopService.createOrderPayment(orderId);

      if (selectedPaymentMethod === 'wallet') {
        // Wallet flow: backend already deducted credits and created transaction
        await shopService.verifyPaymentAndOrder(orderId, {
          orderId: paymentResponse.data.id,
        });

        setOrderPlaced(true);
        clearCart();
        setTimeout(() => {
          navigate('/shop', {
            state: {
              message: 'Order placed successfully! You will receive a confirmation email shortly.',
            },
          });
        }, 3000);
        return;
      }

      // Razorpay flow
      // Ensure Razorpay script is loaded
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) return resolve();
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        document.body.appendChild(script);
      });

      const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!keyId) {
        throw new Error('Razorpay key not configured');
      }

      const razorpayOptions: any = {
        key: keyId,
        amount: backendSubtotal * 100,
        currency: 'INR',
        name: 'Quantum Sports',
        description: 'Shop Order Payment',
        order_id: paymentResponse.data.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        handler: async (response: any) => {
          try {
            await shopService.verifyPaymentAndOrder(orderId, {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });

            setOrderPlaced(true);
            clearCart();
            setTimeout(() => {
              navigate('/shop', {
                state: {
                  message: 'Order placed successfully! You will receive a confirmation email shortly.',
                },
              });
            }, 3000);
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr);
            setError(verifyErr?.message || 'Payment verification failed');
          }
        },
      };

      const razorpay = new (window as any).Razorpay(razorpayOptions);
      razorpay.on('payment.failed', (resp: any) => {
        setError(`Payment failed: ${resp.error?.description || 'Unknown error'}`);
      });
      razorpay.open();
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.error || err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 mt-16 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-large p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to shop in a few seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/shop')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                      />
                      <CreditCard className="w-6 h-6 text-primary-500" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center">
                    <div className="text-red-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-800 font-medium">Payment Error</p>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product.images[0] || '/api/placeholder/300/300'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.product.name}</h3>
                      <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold text-gray-900">
                      ₹{(item.product.discountPrice * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{getShipping() === 0 ? 'Free' : `₹${getShipping()}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST 18%)</span>
                  <span>₹{getTax().toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{getTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Free shipping over ₹2,000</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                form="checkout-form"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full mt-6 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 shadow-medium hover:shadow-large'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </div>
                ) : (
                  `Place Order - ₹${getTotal().toLocaleString()}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCheckoutPage;
