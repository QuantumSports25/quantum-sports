import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield,  Loader2 } from 'lucide-react';
import ShopOrderSuccessModal from '../components/modals/ShopOrderSuccessModal';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { shopService, ShippingAddress, CreateOrderRequest, ShopCartProduct } from '../services/shopService';
import { useMutation } from '@tanstack/react-query';

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
  const [orderSuccessDetails, setOrderSuccessDetails] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('razorpay');
  const [error, setError] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [backendSubtotal,setBackendSubtotal] = useState(0);
  
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

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: (orderRequest: CreateOrderRequest) => shopService.createOrderBeforePayment(orderRequest),
    onError: (error: any) => {
      console.error('Order creation failed:', error);
      setError(error?.response?.data?.error || error.message || 'Failed to create order');
    }
  });

  const createPaymentMutation = useMutation({
    mutationFn: (orderId: string) => shopService.createOrderPayment(orderId),
    onError: async (error: any, orderId: string) => {
      console.error('Payment creation failed:', error);
      // Unlock inventory if payment creation fails
      if (orderId) {
        await unlockInventoryMutation.mutateAsync(orderId);
      }
      setError(error?.response?.data?.error || error.message || 'Failed to create payment');
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: ({ orderId, paymentData }: { orderId: string; paymentData: any }) => 
      shopService.verifyPaymentAndOrder(orderId, paymentData),
    onSuccess: (data, { orderId, paymentData }) => {
      setOrderPlaced(true);
      setOrderSuccessDetails({
        orderId,
        paymentId: paymentData.paymentId,
        paymentMethod: selectedPaymentMethod === 'wallet' ? 'Wallet' : 'Razorpay',
        subtotal: cartItems.reduce((sum, item) => sum + (item.product.markedPrice * item.quantity), 0),
        total: backendSubtotal,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          name: item.product.name
        })),
        shippingAddress: {
          addressLine1: formData.address,
          addressLine2: '',
          city: formData.city,
          postalCode: formData.zipCode,
          country: 'India'
        },
        orderDate: new Date(),
      });
      clearCart();
      setCurrentOrderId(null);
    },
    onError: async (error: any, { orderId }) => {
      console.error('Payment verification failed:', error);
      // Unlock inventory if payment verification fails
      if (orderId) {
        await unlockInventoryMutation.mutateAsync(orderId);
      }
      setError(error?.response?.data?.error || error.message || 'Payment verification failed');
    }
  });

  const unlockInventoryMutation = useMutation({
    mutationFn: (orderId: string) => shopService.unlockInventoryByOrderId(orderId),
    onError: (error: any) => {
      console.error('Failed to unlock inventory:', error);
      // Don't show this error to user, just log it
    }
  });

  useEffect(() => {
    // Check if cart has items, if not redirect to shop
    if (cartItems.length === 0) {
      navigate('/shop');
    }

    const backendSubtotal = cartItems.reduce(
        (sum, item) => sum + (item.product.markedPrice * item.quantity),
        0
      );

    setBackendSubtotal(backendSubtotal);
  }, [cartItems, cartItems.length, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      

      const orderRequest: CreateOrderRequest = {
        userId: user.id,
        products: orderProducts,
        shippingAddress,
        totalAmount: backendSubtotal,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        sellerId: 'default-seller-id', 
        paymentMethod: paymentMethodValue
      };

      // Step 1: Create order using mutation
      const created = await createOrderMutation.mutateAsync(orderRequest);
      const orderId = typeof created === 'string' ? created : created?.id;
      if (!orderId) throw new Error('Failed to create order');
      
      setCurrentOrderId(orderId);
      console.log('Order created successfully:', orderId);

      // Step 2: Create payment order using mutation
      const paymentResponse = await createPaymentMutation.mutateAsync(orderId);

      if (selectedPaymentMethod === 'wallet') {
        // Wallet flow: backend already deducted credits and created transaction
        await verifyPaymentMutation.mutateAsync({
          orderId,
          paymentData: {
            orderId: paymentResponse.data.id,
          }
        });
        return;
      }

      // Step 3: Razorpay flow
      await handleRazorpayPayment(orderId, paymentResponse, backendSubtotal);

    } catch (err: any) {
      console.error('Error in checkout process:', err);
      // Error handling is done in individual mutations
      if (!error) { // Only set error if not already set by mutation
        setError(err.response?.data?.error || err.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (orderId: string, paymentResponse: any, amount: number) => {
    try {
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
        amount: amount * 100,
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
          await verifyPaymentMutation.mutateAsync({
            orderId,
            paymentData: {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }
          });
        },
      };

      const razorpay = new (window as any).Razorpay(razorpayOptions);
      
      razorpay.on('payment.failed', async (resp: any) => {
        console.error('Razorpay payment failed:', resp);
        // Unlock inventory on payment failure
        if (orderId) {
          await unlockInventoryMutation.mutateAsync(orderId);
        }
        setError(`Payment failed: ${resp.error?.description || 'Unknown error'}`);
      });

      // Handle modal close without payment
      razorpay.on('payment.cancelled', async () => {
        console.log('Payment cancelled by user');
        // Unlock inventory on payment cancellation
        if (orderId) {
          await unlockInventoryMutation.mutateAsync(orderId);
        }
        setError('Payment was cancelled');
      });

      razorpay.open();
    } catch (err: any) {
      console.error('Razorpay setup failed:', err);
      // Unlock inventory if Razorpay setup fails
      if (orderId) {
        await unlockInventoryMutation.mutateAsync(orderId);
      }
      setError(err.message || 'Failed to initialize payment');
    }
  };

  // Cleanup function to unlock inventory if user navigates away
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentOrderId && !orderPlaced) {
        await unlockInventoryMutation.mutateAsync(currentOrderId);
      }
    };

    const handlePopState = async () => {
      if (currentOrderId && !orderPlaced) {
        await unlockInventoryMutation.mutateAsync(currentOrderId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentOrderId, orderPlaced, unlockInventoryMutation]);

  if (orderPlaced) {
    return (
      <>
        <ShopOrderSuccessModal isOpen={true} onClose={() => navigate('/shop')} details={orderSuccessDetails} />
      </>
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
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{backendSubtotal?.toLocaleString()}</span>
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
                    Processing Payment...l̥
                  </div>
                ) : (
                  `Place Order - ₹${backendSubtotal?.toLocaleString()}`
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
