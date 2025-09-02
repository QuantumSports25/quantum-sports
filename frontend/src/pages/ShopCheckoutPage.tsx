import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, Loader2, MapPin, Trash2, CheckCircle, AlertCircle, Info, Receipt, Package, Home } from 'lucide-react';
import CheckoutProgress from '../components/checkout/CheckoutProgress';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { shopService, ShippingAddress, CreateOrderRequest, ShopCartProduct } from '../services/shopService';
import { authService } from '../services/authService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Using CartItem from cart store directly

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
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
  const [orderPlaced] = useState(false);
  const [orderSuccessDetails, setOrderSuccessDetails] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('razorpay');
  const [error, setError] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [backendSubtotal,setBackendSubtotal] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'contact' | 'shipping' | 'payment' | 'review' | 'success'>('contact');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [, setIsFormValid] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || '',
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    address: '',
    city: '',
    country: 'India',
    zipCode: '',
    phone: user?.phone || ''
  });

  // Fetch saved addresses
  const { data: savedAddresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['userAddresses'],
    queryFn: authService.getAddresses,
    enabled: isAuthenticated,
  });

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: (orderRequest: CreateOrderRequest) => shopService.createOrderBeforePayment(orderRequest),
    onError: (error: any) => {
      console.error('Order creation failed:', error);
      const errorMessage = error?.response?.data?.error || error.message || 'Failed to create order';
      setError(errorMessage);
      toast.error(errorMessage);
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
      const errorMessage = error?.response?.data?.error || error.message || 'Failed to create payment';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: ({ orderId, paymentData }: { orderId: string; paymentData: any }) => 
      shopService.verifyPaymentAndOrder(orderId, paymentData),
    onSuccess: (data, { orderId, paymentData }) => {
      setCurrentStep('success');
      
      // Ensure all values are properly defined before setting order details
      const orderDetails = {
        orderId: orderId || 'N/A',
        paymentId: paymentData?.paymentId || undefined,
        paymentMethod: (selectedPaymentMethod === 'wallet' ? 'Wallet' : 'Razorpay') as 'Wallet' | 'Razorpay',
        subtotal: cartItems.reduce((sum, item) => sum + (item.product.markedPrice * item.quantity), 0) || 0,
        total: backendSubtotal || 0,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          name: item.product.name
        })) || [],
        shippingAddress: {
          addressLine1: formData.address || '',
          addressLine2: '',
          city: formData.city || '',
          postalCode: formData.zipCode || '',
          country: formData.country || 'India'
        },
        orderDate: new Date(),
      };
      
      setOrderSuccessDetails(orderDetails);
      console.log('Setting order success details:', orderDetails);
      clearCart();
      setCurrentOrderId(null);
      
      // Show success toast
      toast.success('🎉 Order placed successfully!');
    },
    onError: async (error: any, { orderId }) => {
      console.error('Payment verification failed:', error);
      // Unlock inventory if payment verification fails
      if (orderId) {
        await unlockInventoryMutation.mutateAsync(orderId);
      }
      const errorMessage = error?.response?.data?.error || error.message || 'Payment verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  });

  const unlockInventoryMutation = useMutation({
    mutationFn: (orderId: string) => shopService.unlockInventoryByOrderId(orderId),
    onError: (error: any) => {
      console.error('Failed to unlock inventory:', error);
      // Don't show this error to user, just log it
    }
  });

  // Address management mutations
  const addAddressMutation = useMutation({
    mutationFn: authService.addAddress,
    onSuccess: () => {
      refetchAddresses();
      setShowAddressForm(false);
      setError(null);
      toast.success('Address saved successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error.message || 'Failed to add address';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  });

  const removeAddressMutation = useMutation({
    mutationFn: authService.removeAddress,
    onSuccess: () => {
      refetchAddresses();
      setSelectedAddressId(null);
      setError(null);
      toast.success('Address removed successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error.message || 'Failed to remove address';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  });

  useEffect(() => {
    // Check if cart has items, if not redirect to shop
    if (cartItems.length === 0) {
      navigate('/shop');
    }

    const calculatedSubtotal = cartItems.reduce(
        (sum, item) => sum + (item.product.markedPrice * item.quantity),
        0
      );

    setBackendSubtotal(calculatedSubtotal);
  }, [cartItems, cartItems.length, navigate]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.name ? user.name.split(' ')[0] : prev.firstName,
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : prev.lastName,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (address: ShippingAddress) => {
    setFormData(prev => ({
      ...prev,
      address: address.addressLine1,
      city: address.city,
      country: address.country,
      zipCode: address.postalCode,
    }));
    setSelectedAddressId(`${address.addressLine1}-${address.city}-${address.postalCode}`);
  };


  const handleRemoveAddress = async (address: ShippingAddress) => {
    await removeAddressMutation.mutateAsync(address);
  };

  const handleSaveAddress = async () => {
    const addressToSave: ShippingAddress = {
      addressLine1: formData.address,
      addressLine2: '',
      city: formData.city,
      postalCode: formData.zipCode,
      country: formData.country
    };
    
    await addAddressMutation.mutateAsync(addressToSave);
  };

  const validateForm = (): string | null => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Basic phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    
    return isValid ? null : Object.values(errors)[0];
  };

  const validateStep = (step: string): boolean => {
    switch (step) {
      case 'contact':
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 'shipping':
        return !!(formData.address && formData.city && formData.country && formData.zipCode);
      case 'payment':
        return !!selectedPaymentMethod;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      switch (currentStep) {
        case 'contact':
          setCurrentStep('shipping');
          break;
        case 'shipping':
          setCurrentStep('payment');
          break;
        case 'payment':
          setCurrentStep('review');
          break;
        case 'review':
          // Don't advance from review - this will be handled by form submission
          break;
      }
    }
  };

  const prevStep = () => {
    // If user has entered shipping information, ask for confirmation
    if (currentStep === 'shipping' && (formData.address || formData.city || formData.zipCode)) {
      const hasConfirmed = window.confirm('Going back will clear your shipping information. Are you sure you want to continue?');
      if (!hasConfirmed) {
        return;
      }
      // Clear shipping form data when going back
      setFormData(prev => ({
        ...prev,
        address: '',
        city: '',
        zipCode: ''
      }));
      setSelectedAddressId(null);
    }
    
    switch (currentStep) {
      case 'shipping':
        setCurrentStep('contact');
        break;
      case 'payment':
        setCurrentStep('shipping');
        break;
      case 'review':
        setCurrentStep('payment');
        break;
    }
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
        country: formData.country
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
         const errorMessage = `Payment failed: ${resp.error?.description || 'Unknown error'}`;
         setError(errorMessage);
         toast.error(errorMessage);
       });

       // Handle modal close without payment
       razorpay.on('payment.cancelled', async () => {
         console.log('Payment cancelled by user');
         // Unlock inventory on payment cancellation
         if (orderId) {
           await unlockInventoryMutation.mutateAsync(orderId);
         }
         const errorMessage = 'Payment was cancelled';
         setError(errorMessage);
         toast.error(errorMessage);
       });

      razorpay.open();
         } catch (err: any) {
       console.error('Razorpay setup failed:', err);
       // Unlock inventory if Razorpay setup fails
       if (orderId) {
         await unlockInventoryMutation.mutateAsync(orderId);
       }
       const errorMessage = err.message || 'Failed to initialize payment';
       setError(errorMessage);
       toast.error(errorMessage);
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

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/shop')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Indicator */}
        <CheckoutProgress currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Contact Information Step */}
              {currentStep === 'contact' && (
                <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm sm:text-base">
                      1
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Contact Information</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.firstName ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {formErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                      )}
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
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.lastName ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {formErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.email ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.phone ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                    <button
                      type="button"
                      onClick={() => navigate('/shop')}
                      className="w-full sm:w-auto bg-gray-100 text-gray-700 px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                    >
                      Back to Shop
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full sm:w-auto bg-primary-500 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200"
                    >
                      Continue to Shipping
                    </button>
                  </div>
                </div>
              )}

              {/* Shipping Address Step */}
              {currentStep === 'shipping' && (
                <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm sm:text-base">
                      2
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Shipping Address</h2>
                  </div>
                  
                  {/* Saved Addresses */}
                  {savedAddresses?.data && savedAddresses.data.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Addresses</h3>
                      <div className="space-y-3">
                        {savedAddresses.data.map((address, index) => (
                          <div
                            key={index}
                            className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                              selectedAddressId === `${address.addressLine1}-${address.city}-${address.postalCode}`
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleAddressSelect(address)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{address.addressLine1}</p>
                                  <p className="text-sm text-gray-600">
                                    {address.city}, {address.postalCode}, {address.country}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAddress(address);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Address Button */}
                  {savedAddresses?.data && savedAddresses.data.length > 0 && (
                    <div className="mb-6">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium">Add New Address</span>
                      </button>
                    </div>
                  )}

                  {/* Address Form */}
                  {(showAddressForm || !savedAddresses?.data || savedAddresses.data.length === 0) && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">New Address</h3>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            formErrors.address ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                        {formErrors.address && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              formErrors.city ? 'border-red-300' : 'border-gray-200'
                            }`}
                          />
                          {formErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              formErrors.country ? 'border-red-300' : 'border-gray-200'
                            }`}
                          />
                          {formErrors.country && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                          )}
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
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              formErrors.zipCode ? 'border-red-300' : 'border-gray-200'
                            }`}
                          />
                          {formErrors.zipCode && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Save Address Button */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          disabled={addAddressMutation.isPending}
                          className="flex-1 bg-primary-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {addAddressMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              Save Address
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  
                                     <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                     <button
                       type="button"
                       onClick={prevStep}
                       className="w-full sm:w-auto bg-gray-100 text-gray-700 px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                     >
                       Back
                     </button>
                     <button
                       type="button"
                       onClick={nextStep}
                       className="w-full sm:w-auto bg-primary-500 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200"
                     >
                       Continue to Payment
                     </button>
                   </div>
                </div>
              )}

              {/* Payment Method Step */}
              {currentStep === 'payment' && (
                <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm sm:text-base">
                      3
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Payment Method</h2>
                  </div>
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
                                     <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                     <button
                       type="button"
                       onClick={prevStep}
                       className="w-full sm:w-auto bg-gray-100 text-gray-700 px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                     >
                       Back
                     </button>
                     <button
                       type="button"
                       onClick={nextStep}
                       className="w-full sm:w-auto bg-primary-500 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200"
                     >
                       Review Order
                     </button>
                   </div>
                </div>
              )}

                                             {/* Review Step */}
                {currentStep === 'review' && (
                  <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm sm:text-base">
                        4
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Review Order</h2>
                    </div>
                   
                   {/* Order Summary */}
                   <div className="space-y-4 mb-6">
                     <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
                     {cartItems.map((item) => (
                       <div key={item.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                         <img
                           src={item.product.images[0] || '/api/placeholder/300/300'}
                           alt={item.product.name}
                           className="w-16 h-16 object-cover rounded-lg"
                         />
                         <div className="flex-1">
                           <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                           <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                         </div>
                         <div className="font-semibold text-gray-900">
                           ₹{(item.product.discountPrice * item.quantity).toLocaleString()}
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Shipping Address */}
                   <div className="mb-6">
                     <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
                     <div className="p-4 bg-gray-50 rounded-xl">
                       <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                       <p className="text-gray-600">{formData.address}</p>
                       <p className="text-gray-600">{formData.city}, {formData.zipCode}, {formData.country}</p>
                       <p className="text-gray-600">{formData.phone}</p>
                     </div>
                   </div>

                   {/* Payment Method */}
                   <div className="mb-6">
                     <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
                     <div className="p-4 bg-gray-50 rounded-xl">
                       <div className="flex items-center gap-3">
                         <CreditCard className="w-5 h-5 text-primary-500" />
                         <span className="font-medium">
                           {selectedPaymentMethod === 'wallet' ? 'Wallet' : 'Credit/Debit Card'}
                         </span>
                       </div>
                     </div>
                   </div>

                                       <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="w-full sm:w-auto bg-gray-100 text-gray-700 px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary-500 text-white hover:bg-primary-600 shadow-medium hover:shadow-large'
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing Payment...
                          </div>
                        ) : (
                          `Place Order - ₹${(backendSubtotal || 0).toLocaleString()}`
                        )}
                      </button>
                    </div>
                 </div>
               )}

                               {/* Success Step */}
                {currentStep === 'success' && orderSuccessDetails && (
                  <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Order Confirmed!</h2>
                    </div>
                    
                    {/* Success Message */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-green-200">
                      <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">🎉 Thank You!</h3>
                        <p className="text-gray-600 text-base sm:text-lg">Your order has been placed successfully.</p>
                      </div>
                    </div>

                                       {/* Order Details */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Order Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          Order Summary
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100">
                            <p className="text-xs text-gray-600 mb-1">Order ID</p>
                            <p className="font-mono text-xs sm:text-sm font-semibold text-gray-900 break-all">{orderSuccessDetails.orderId}</p>
                          </div>
                          {orderSuccessDetails.paymentId && (
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100">
                              <p className="text-xs text-gray-600 mb-1">Payment ID</p>
                              <p className="font-mono text-xs sm:text-sm text-gray-900 break-all">{orderSuccessDetails.paymentId}</p>
                            </div>
                          )}
                          <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100">
                            <p className="text-xs text-gray-600 mb-1">Order Date</p>
                            <p className="text-xs sm:text-sm text-gray-900">{orderSuccessDetails.orderDate.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                                           {/* Delivery Estimate */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Estimated Delivery</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {new Date(orderSuccessDetails.orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                                           {/* Items */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Ordered Items</h3>
                          <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                            {orderSuccessDetails.items?.length || 0} items
                          </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {orderSuccessDetails.items && orderSuccessDetails.items.length > 0 ? (
                            orderSuccessDetails.items.map((item: any, idx: number) => (
                              <div key={idx} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <span className="text-gray-600 text-xs sm:text-sm">Qty: {item.quantity}</span>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 text-center text-sm">No items found</div>
                          )}
                        </div>
                      </div>

                                           {/* Payment Summary */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Payment Summary</h3>
                        </div>
                        <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Payment Method</span>
                            <span className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                              {orderSuccessDetails.paymentMethod}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Subtotal</span>
                            <span className="text-gray-900 text-sm">₹{orderSuccessDetails.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Shipping</span>
                            <span className="text-gray-900 text-sm">{orderSuccessDetails.subtotal > 2000 ? 'Free' : '₹99'}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-3 flex justify-between text-base sm:text-lg font-bold text-gray-900">
                            <span>Total Paid</span>
                            <span className="text-green-600">₹{orderSuccessDetails.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                                           {/* Next Steps */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">What's Next?</h4>
                        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                          <li>• You'll receive an email confirmation shortly</li>
                          <li>• We'll send tracking updates as your order ships</li>
                          <li>• Estimated delivery: {new Date(orderSuccessDetails.orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</li>
                        </ul>
                      </div>

                                           {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => navigate('/shop')} 
                          className="flex-1 bg-green-600 text-white py-3 sm:py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                          Continue Shopping
                        </button>
                        <a 
                          href="/orders" 
                          className="flex-1 inline-flex items-center justify-center bg-gray-100 text-gray-800 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200 gap-2"
                        >
                          <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                          View My Orders
                        </a>
                      </div>

                      {/* Footer */}
                      <div className="text-center text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-gray-200">
                        <p>Need help? Contact our support team at support@quantumsports.com</p>
                      </div>
                   </div>
                 </div>
               )}

                             {/* Error Display */}
               {error && (
                 <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                   <div className="flex items-center">
                     <AlertCircle className="w-6 h-6 text-red-600" />
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
            {currentStep !== 'success' && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6 sticky top-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>
                  
                  {/* Cart Items */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.product.images[0] || '/api/placeholder/300/300'}
                          alt={item.product.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-xs sm:text-sm">{item.product.name}</h3>
                          <div className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">
                          ₹{(item.product.discountPrice * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                                   {/* Price Breakdown */}
                  <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{(backendSubtotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>{(backendSubtotal || 0) > 2000 ? 'Free' : '₹99'}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 sm:pt-3">
                      <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{((backendSubtotal || 0) + ((backendSubtotal || 0) > 2000 ? 0 : 99)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                                   {/* Security Features */}
                  <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      <span>Free shipping over ₹2,000</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Info className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                      <span>30-day return policy</span>
                    </div>
                  </div>

                                   {/* Step-specific actions */}
                  {currentStep === 'review' && (
                    <div className="mt-4 sm:mt-6">
                      <button
                        type="submit"
                        form="checkout-form"
                        disabled={loading}
                        className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary-500 hover:bg-primary-600 shadow-medium hover:shadow-large'
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            Processing Payment...
                          </div>
                        ) : (
                          `Place Order - ₹${((backendSubtotal || 0) + ((backendSubtotal || 0) > 2000 ? 0 : 99)).toLocaleString()}`
                        )}
                      </button>
                    </div>
                  )}
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   );
 };

export default ShopCheckoutPage;
