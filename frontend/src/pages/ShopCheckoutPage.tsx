import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, Loader2, Plus, MapPin, Edit, Trash2, Check } from 'lucide-react';
import ShopOrderSuccessModal from '../components/modals/ShopOrderSuccessModal';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { shopService, CreateOrderRequest, ShopCartProduct } from '../services/shopService';
import { authService } from '../services/authService';
import { ShippingAddress } from '../types';

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
  icon: React.ReactNode;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { 
    id: 'razorpay', 
    name: 'Credit/Debit Card', 
    description: 'Pay securely with your card',
    icon: <CreditCard className="w-6 h-6 text-primary-500" />
  },
  { 
    id: 'wallet', 
    name: 'Wallet', 
    description: 'Pay using your wallet balance',
    icon: <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs font-bold">₹</span>
    </div>
  }
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Address management states
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormData, setAddressFormData] = useState<ShippingAddress>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'India'
  });
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  
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
    console.log('=== useEffect triggered ===');
    console.log('cartItems.length:', cartItems.length);
    console.log('isAuthenticated:', isAuthenticated);
    
    // Check if cart has items, if not redirect to shop
    if (cartItems.length === 0) {
      navigate('/shop');
    }
    
    // Load saved addresses
    if (isAuthenticated) {
      console.log('Calling loadSavedAddresses from useEffect');
      loadSavedAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length, navigate, isAuthenticated]);

  // Debug effect to monitor address state changes
  useEffect(() => {
    console.log('savedAddresses state changed:', savedAddresses);
  }, [savedAddresses]);

  useEffect(() => {
    console.log('selectedAddress state changed:', selectedAddress);
  }, [selectedAddress]);

  const loadSavedAddresses = async () => {
    try {
      console.log('=== Loading saved addresses ===');
      console.log('Current selectedAddress state:', selectedAddress);
      console.log('Current savedAddresses state:', savedAddresses);
      
      const response = await authService.getAllAddresses();
      console.log('Addresses response:', response);
      
      if (response.success && response.data) {
        console.log('Setting saved addresses:', response.data);
        setSavedAddresses(response.data);
        
        // If we have a previously selected address, try to find it in the new list
        if (selectedAddress && response.data.length > 0) {
          const foundAddress = response.data.find(addr => isSameAddress(addr, selectedAddress));
          if (foundAddress) {
            setSelectedAddress(foundAddress);
            // Update form data with the found address
            setFormData(prev => ({
              ...prev,
              address: foundAddress.addressLine1,
              city: foundAddress.city,
              state: foundAddress.city,
              zipCode: foundAddress.postalCode
            }));
          } else {
            // If the previously selected address is not found, select the first one
            setSelectedAddress(response.data[0]);
            setFormData(prev => ({
              ...prev,
              address: response.data[0].addressLine1,
              city: response.data[0].city,
              state: response.data[0].city,
              zipCode: response.data[0].postalCode
            }));
          }
        } else if (response.data.length > 0 && !selectedAddress) {
          // Auto-select first address if no address was previously selected
          setSelectedAddress(response.data[0]);
          setFormData(prev => ({
            ...prev,
            address: response.data[0].addressLine1,
            city: response.data[0].city,
            state: response.data[0].city,
            zipCode: response.data[0].postalCode
          }));
        }
      } else {
        // Clear addresses if the response is not successful
        console.log('No addresses found or response not successful');
        console.log('Response details:', response);
        setSavedAddresses([]);
        setSelectedAddress(null);
      }
      
      console.log('=== Finished loading addresses ===');
    } catch (error) {
      console.error('Failed to load addresses:', error);
      // Clear addresses on error
      setSavedAddresses([]);
      setSelectedAddress(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAddress = async () => {
    try {
      if (!addressFormData.addressLine1 || !addressFormData.city || !addressFormData.postalCode) {
        setError('Please fill in all required address fields');
        return;
      }

      console.log('Saving address:', addressFormData);

      if (editingAddress) {
        // Remove old address first
        console.log('Removing old address:', editingAddress);
        await authService.removeAddress(editingAddress);
      }
      
      // Prepare address data for backend - handle optional fields properly
      const addressToSend = {
        ...addressFormData,
        // Only send addressLine2 if it has a value
        ...(addressFormData.addressLine2?.trim() ? {} : { addressLine2: undefined })
      };
      
      console.log('Address data to send to backend:', addressToSend);
      
      // Add new address
      console.log('Adding new address to backend...');
      const response = await authService.addAddress(addressToSend);
      console.log('Backend response:', response);
      
      if (response.success) {
        // The backend returns success message, not the address data
        // So we use the addressFormData directly
        const newAddress: ShippingAddress = {
          ...addressFormData
        };
        
        console.log('New address object:', newAddress);
        
        // Update the saved addresses list immediately
        setSavedAddresses(prev => {
          console.log('Previous addresses:', prev);
          if (editingAddress) {
            // Replace the edited address
            const updated = prev.map(addr => 
              isSameAddress(addr, editingAddress) ? newAddress : addr
            );
            console.log('Updated addresses (edit):', updated);
            return updated;
          } else {
            // Add the new address
            const updated = [...prev, newAddress];
            console.log('Updated addresses (add):', updated);
            return updated;
          }
        });
        
        // Select the newly saved address
        setSelectedAddress(newAddress);
        console.log('Selected new address:', newAddress);
        
        // Update form data with the selected address
        setFormData(prev => ({
          ...prev,
          address: newAddress.addressLine1,
          city: newAddress.city,
          state: newAddress.city,
          zipCode: newAddress.postalCode
        }));
        
        // Reset form
        setAddressFormData({
          addressLine1: '',
          addressLine2: '',
          city: '',
          postalCode: '',
          country: 'India'
        });
        setShowAddressForm(false);
        setEditingAddress(null);
        setError(null);
        
        // Show success message
        setSuccessMessage(editingAddress ? 'Address updated successfully!' : 'Address saved successfully!');
        setTimeout(() => setSuccessMessage(null), 3000); // Auto-hide after 3 seconds
        
        // Also reload addresses from server to ensure consistency
        setTimeout(() => {
          loadSavedAddresses();
        }, 500);
      } else {
        throw new Error(response.message || 'Failed to save address');
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      setError(error.message || 'Failed to save address');
    }
  };

  const handleEditAddress = (address: ShippingAddress) => {
    setEditingAddress(address);
    setAddressFormData(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (address: ShippingAddress) => {
    try {
      await authService.removeAddress(address);
      await loadSavedAddresses();
      // The loadSavedAddresses function will handle updating the selected address
      // and form data automatically
    } catch (error: any) {
      setError(error.message || 'Failed to delete address');
    }
  };

  const handleSelectAddress = (address: ShippingAddress) => {
    setSelectedAddress(address);
    // Update form data with selected address
    setFormData(prev => ({
      ...prev,
      address: address.addressLine1,
      city: address.city,
      state: address.city, // Using city as state for now
      zipCode: address.postalCode
    }));
    
    // Clear any previous errors
    setError(null);
  };

  // Helper function to compare addresses
  const isSameAddress = (addr1: ShippingAddress, addr2: ShippingAddress): boolean => {
    return addr1.addressLine1 === addr2.addressLine1 &&
           addr1.city === addr2.city &&
           addr1.postalCode === addr2.postalCode &&
           addr1.country === addr2.country;
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
      
      // Compute subtotal based on backend product price
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
        sellerId: 'default-seller-id',
        paymentMethod: paymentMethodValue
      };

      // Create order before payment
      const created = await shopService.createOrderBeforePayment(orderRequest);
      const orderId = typeof created === 'string' ? created : created?.id;
      if (!orderId) throw new Error('Failed to create order');

      // Create payment order on backend
      const paymentResponse = await shopService.createOrderPayment(orderId);

      if (selectedPaymentMethod === 'wallet') {
        // Wallet flow
        await shopService.verifyPaymentAndOrder(orderId, {
          orderId: paymentResponse.data.id,
        });

        setOrderPlaced(true);
        setOrderSuccessDetails({
          orderId,
          paymentMethod: paymentMethodValue,
          subtotal: backendSubtotal,
          shipping: getShipping(),
          tax: getTax(),
          total: getTotal(),
          items: orderProducts,
          shippingAddress,
          orderDate: new Date(),
        });
        clearCart();
        return;
      }

      // Razorpay flow
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
            setOrderSuccessDetails({
              orderId,
              paymentId: response.razorpay_payment_id,
              paymentMethod: paymentMethodValue,
              subtotal: backendSubtotal,
              shipping: getShipping(),
              tax: getTax(),
              total: getTotal(),
              items: orderProducts,
              shippingAddress,
              orderDate: new Date(),
            });
            clearCart();
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadSavedAddresses}
                      className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(!showAddressForm);
                        setEditingAddress(null);
                        setAddressFormData({
                          addressLine1: '',
                          addressLine2: '',
                          city: '',
                          postalCode: '',
                          country: 'India'
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {showAddressForm ? 'Cancel' : 'Add New Address'}
                    </button>
                  </div>
                </div>

                {/* Debug Info */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                  <div><strong>Debug Info:</strong></div>
                  <div>Saved addresses count: {savedAddresses.length}</div>
                  <div>Selected address: {selectedAddress ? 'Yes' : 'No'}</div>
                  <div>Show form: {showAddressForm ? 'Yes' : 'No'}</div>
                  <div>Editing: {editingAddress ? 'Yes' : 'No'}</div>
                </div>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Addresses</h3>
                    <div className="space-y-3">
                      {savedAddresses.map((address, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            selectedAddress && isSameAddress(selectedAddress, address)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSelectAddress(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {address.city}, {address.postalCode}, {address.country}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                               {selectedAddress && isSameAddress(selectedAddress, address) && (
                                 <Check className="w-5 h-5 text-primary-500" />
                               )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(address);
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Edit className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(address);
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No saved addresses yet</p>
                      <p className="text-xs text-gray-400">Add your first address to get started</p>
                    </div>
                  </div>
                )}

                {/* Address Form */}
                {showAddressForm && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={addressFormData.addressLine1}
                          onChange={handleAddressInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter street address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apartment, suite, etc. (optional)
                        </label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={addressFormData.addressLine2}
                          onChange={handleAddressInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter apartment, suite, etc."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={addressFormData.city}
                            onChange={handleAddressInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={addressFormData.postalCode}
                            onChange={handleAddressInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter postal code"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          {editingAddress ? 'Update Address' : 'Save Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Address Indicator */}
                {selectedAddress && (
                  <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <div className="flex items-center gap-2 text-primary-700">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Using selected address:</span>
                    </div>
                    <div className="mt-2 text-sm text-primary-600">
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                      <br />
                      {selectedAddress.city}, {selectedAddress.postalCode}, {selectedAddress.country}
                    </div>
                  </div>
                )}

                {/* Manual Address Input */}
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
                      {method.icon}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Success Message Display */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex items-center">
                    <div className="text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-green-800 font-medium">Success</p>
                      <p className="text-green-600 text-sm">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

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
                      <p className="text-red-800 font-medium">Error</p>
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
