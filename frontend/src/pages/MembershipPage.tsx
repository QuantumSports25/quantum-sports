import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, Gift, CheckCircle, XCircle, AlertCircle, Loader2, CreditCard, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import FaqAndInfo from './membership/components/FaqAndInfo';
import HeroSection from './membership/components/HeroSection';
import membershipService, { MembershipPlan as APIMembershipPlan } from '../services/membershipService';

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  bookingValue: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  popular?: boolean;
  features: string[];
  perks: string[];
}

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Toast types
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message: string;
  duration?: number;
  icon?: React.ReactNode;
}

// Toast Component
const ToastNotification: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          gradient: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/30',
          iconBg: 'from-green-500 to-emerald-500',
          titleColor: 'text-green-400',
          shadow: 'shadow-green-500/20'
        };
      case 'error':
        return {
          gradient: 'from-red-500/20 to-rose-500/20',
          border: 'border-red-500/30',
          iconBg: 'from-red-500 to-rose-500',
          titleColor: 'text-red-400',
          shadow: 'shadow-red-500/20'
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-500/30',
          iconBg: 'from-yellow-500 to-orange-500',
          titleColor: 'text-yellow-400',
          shadow: 'shadow-yellow-500/20'
        };
      case 'info':
        return {
          gradient: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-500/30',
          iconBg: 'from-blue-500 to-cyan-500',
          titleColor: 'text-blue-400',
          shadow: 'shadow-blue-500/20'
        };
      case 'loading':
        return {
          gradient: 'from-purple-500/20 to-indigo-500/20',
          border: 'border-purple-500/30',
          iconBg: 'from-purple-500 to-indigo-500',
          titleColor: 'text-purple-400',
          shadow: 'shadow-purple-500/20'
        };
      default:
        return {
          gradient: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/30',
          iconBg: 'from-gray-500 to-gray-600',
          titleColor: 'text-gray-400',
          shadow: 'shadow-gray-500/20'
        };
    }
  };

  const styles = getToastStyles();

  const getIcon = () => {
    if (toast.icon) return toast.icon;
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
        return <Shield className="h-5 w-5" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
    >
      <div className={`
        relative overflow-hidden rounded-xl border backdrop-blur-xl
        bg-gradient-to-br from-gray-800/90 to-gray-900/90
        ${styles.gradient} ${styles.border} ${styles.shadow}
        shadow-2xl max-w-sm w-full p-4
      `}>
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
        
        <div className="relative flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${styles.iconBg} flex items-center justify-center shadow-lg`}>
            <div className="text-white">
              {getIcon()}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${styles.titleColor} mb-1`}>
              {toast.title}
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {toast.message}
            </p>
          </div>
          
          {/* Close button */}
          {toast.type !== 'loading' && (
            <button
              onClick={handleRemove}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Toast Container
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

const MembershipPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiPlans, setApiPlans] = useState<APIMembershipPlan[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch membership plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await membershipService.getMembershipPlans();
        if (response.success) {
          setApiPlans(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch membership plans:', error);
      }
    };

    fetchPlans();
  }, []);

  // Toast management functions
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'loading' ? 0 : 5000)
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const updateToast = (id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  };

  const membershipPlans: MembershipPlan[] = [
    {
      id: 'basic',
      name: 'Basic Pro',
      price: 5000,
      bookingValue: 6000,
      icon: <Zap className="h-8 w-8" />,
      color: 'from-blue-600 to-cyan-600',
      gradient: 'from-blue-600/20 to-cyan-600/20',
      features: [
        'Book turfs worth ₹6,000',
        '20% bonus value',
        'Priority booking slots',
        'Free cancellation',
        'Member exclusive events',
        '24/7 customer support'
      ],
      perks: [
        'Save ₹1,000 instantly',
        'VIP customer status',
        'Early access to new venues'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Elite',
      price: 10000,
      bookingValue: 12000,
      icon: <Crown className="h-8 w-8" />,
      color: 'from-purple-600 to-pink-600',
      gradient: 'from-purple-600/20 to-pink-600/20',
      popular: true,
      features: [
        'Book turfs worth ₹12,000',
        '20% bonus value',
        'Guaranteed priority slots',
        'Free cancellation anytime',
        'Exclusive premium events',
        'Dedicated support manager',
        'Complimentary equipment',
        'Guest booking privileges'
      ],
      perks: [
        'Save ₹2,000 instantly',
        'Elite member status',
        'Premium venue access',
        'Monthly bonus credits'
      ]
    }
  ];

  const handleRazorpayPayment = async (plan: MembershipPlan, apiPlan?: APIMembershipPlan) => {
    if (!isAuthenticated) {
      addToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please login to purchase a membership plan.',
        icon: <Shield className="h-5 w-5" />
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    // Show processing toast
    const processingToastId = addToast({
      type: 'loading',
      title: 'Processing Payment',
      message: `Initiating payment for ${plan.name} membership...`,
      icon: <CreditCard className="h-5 w-5" />
    });

    // If no API plans loaded, try to fetch them first
    if (apiPlans.length === 0) {
      try {
        console.log('API plans not loaded, fetching...');
        const response = await membershipService.getMembershipPlans();
        if (response.success) {
          setApiPlans(response.data);
          // Re-match the API plan after loading
          if (plan.id === 'basic') {
            apiPlan = response.data.find(p => p.name.toLowerCase().includes('basic'));
          } else if (plan.id === 'premium') {
            apiPlan = response.data.find(p => p.name.toLowerCase().includes('premium') || p.name.toLowerCase().includes('elite'));
          }
        }
      } catch (error) {
        console.error('Failed to fetch membership plans:', error);
      }
    }

    try {
      // Use API plan data if available, otherwise use static plan data
      const amount = apiPlan ? apiPlan.amount : plan.price;
      const planId = apiPlan ? apiPlan.id : plan.id;

      console.log('Payment attempt:', {
        staticPlan: plan.name,
        apiPlan: apiPlan?.name,
        amount,
        planId
      });

      // Step 1: Create membership record first
      const membershipResponse = await membershipService.createMembership({
        userId: user?.id || '',
        planId: planId
      });

      if (!membershipResponse.success) {
        removeToast(processingToastId);
        addToast({
          type: 'error',
          title: 'Membership Creation Failed',
          message: 'Unable to create membership record. Please try again.',
          icon: <XCircle className="h-5 w-5" />
        });
        throw new Error('Failed to create membership');
      }

      console.log('Membership created:', membershipResponse.id);

      // Step 2: Create order for the membership
      const orderResponse = await membershipService.createMembershipOrder(membershipResponse.id, {
        amount: amount,
        userId: user?.id || '',
        planId: planId
      });

      if (!orderResponse.success) {
        removeToast(processingToastId);
        addToast({
          type: 'error',
          title: 'Order Creation Failed',
          message: 'Unable to create payment order. Please try again.',
          icon: <XCircle className="h-5 w-5" />
        });
        throw new Error('Failed to create order');
      }

      // Update processing toast
      updateToast(processingToastId, {
        title: 'Opening Payment Gateway',
        message: 'Redirecting to secure payment gateway...'
      });

      // Step 3: Initialize Razorpay payment
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_MJwUIvOIpb6jEQ',
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'Quantum Sports',
        description: `${plan.name} Membership`,
        image: '/logo192.png',
        order_id: orderResponse.data.id,
        handler: async function (response: any) {
          try {
            // Step 4: Verify payment
            const verificationPayload = {
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              orderId: response.razorpay_order_id,
              membershipId: membershipResponse.id
            };

            const verificationResponse = await membershipService.verifyMembershipPayment(verificationPayload);

            if (verificationResponse.success) {
              removeToast(processingToastId);
              addToast({
                type: 'success',
                title: 'Payment Successful! 🎉',
                message: `Your ${plan.name} membership has been activated successfully!`,
                icon: <CheckCircle className="h-5 w-5" />,
                duration: 8000
              });
              // You can redirect to a success page or refresh user data here
              setTimeout(() => {
                window.location.reload(); // Refresh to update user membership status
              }, 2000);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            removeToast(processingToastId);
            addToast({
              type: 'error',
              title: 'Payment Verification Failed',
              message: 'Payment verification failed. Please contact support if amount was deducted.',
              icon: <XCircle className="h-5 w-5" />,
              duration: 10000
            });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          membership_plan: plan.name,
          user_id: user?.id || ''
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function () {
            removeToast(processingToastId);
            addToast({
              type: 'warning',
              title: 'Payment Cancelled',
              message: 'Payment was cancelled. You can try again anytime.',
              icon: <AlertCircle className="h-5 w-5" />
            });
            setLoading(false);
            setSelectedPlan(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        removeToast(processingToastId);
        addToast({
          type: 'error',
          title: 'Payment Failed',
          message: `Payment failed: ${response.error.description}`,
          icon: <XCircle className="h-5 w-5" />,
          duration: 8000
        });
        setLoading(false);
        setSelectedPlan(null);
      });

      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      removeToast(processingToastId);
      addToast({
        type: 'error',
        title: 'Payment Initiation Failed',
        message: 'Failed to initiate payment. Please check your connection and try again.',
        icon: <XCircle className="h-5 w-5" />,
        duration: 8000
      });
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handlePlanSelect = (planId: string) => {
    const plan = membershipPlans.find(p => p.id === planId);

    // Better matching logic for API plans
    let apiPlan;
    if (planId === 'basic') {
      apiPlan = apiPlans.find(p => p.name.toLowerCase().includes('basic'));
    } else if (planId === 'premium') {
      apiPlan = apiPlans.find(p => p.name.toLowerCase().includes('premium') || p.name.toLowerCase().includes('elite'));
    }

    // If no API plan found, log available plans for debugging
    if (!apiPlan && apiPlans.length > 0) {
      console.log('Available API plans:', apiPlans.map(p => ({ id: p.id, name: p.name })));
      console.log(`No API plan found for ${planId}, using first available plan`);
      apiPlan = apiPlans[0]; // Fallback to first plan
    }

    if (plan) {
      handleRazorpayPayment(plan, apiPlan);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 ">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Membership Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {membershipPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative group transition-all duration-500 transform ${hoveredPlan === plan.id
                ? 'scale-105 -translate-y-2'
                : hoveredPlan && hoveredPlan !== plan.id
                  ? 'scale-95 opacity-75'
                  : 'scale-100'
                }`}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    <Star className="inline h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`
                relative overflow-hidden rounded-2xl border transition-all duration-500
                ${plan.popular
                  ? 'border-purple-500/50 bg-gradient-to-br from-gray-800 via-gray-800 to-purple-900/20'
                  : 'border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900'
                }
                ${hoveredPlan === plan.id ? 'shadow-2xl shadow-purple-500/20' : 'shadow-xl'}
                backdrop-blur-xl
              `}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {/* Content */}
                <div className="relative p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} mb-4 shadow-lg`}>
                      <div className="text-white">
                        {plan.icon}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          ₹{plan.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-400">One-time payment</p>
                    </div>

                    {/* Value Proposition */}
                    <div className={`mt-4 p-4 rounded-xl bg-gradient-to-r ${plan.gradient} border border-gray-600/30`}>
                      <div className="flex items-center justify-center space-x-2">
                        <Gift className="h-5 w-5 text-green-400" />
                        <span className="text-lg font-semibold text-white">
                          Get ₹{plan.bookingValue.toLocaleString()} Booking Value
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        Save ₹{(plan.bookingValue - plan.price).toLocaleString()} instantly!
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <h4 className="font-semibold text-gray-200 text-center">What's Included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center space-x-3 text-gray-300"
                          style={{
                            animationDelay: `${(index * 200) + (idx * 100)}ms`
                          }}
                        >
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center flex-shrink-0`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Perks */}
                  <div className="space-y-3 mb-8">
                    <h4 className="font-semibold text-gray-200 text-center">Exclusive Perks:</h4>
                    <div className="space-y-2">
                      {plan.perks.map((perk, idx) => (
                        <div
                          key={idx}
                          className={`text-center p-2 rounded-lg bg-gradient-to-r ${plan.gradient} border border-gray-600/20`}
                        >
                          <span className="text-sm text-gray-200 font-medium">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={loading && selectedPlan === plan.id}
                    className={`
                      w-full py-4 px-6 rounded-xl font-bold text-white text-lg
                      bg-gradient-to-r ${plan.color}
                      hover:shadow-2xl hover:shadow-purple-500/25
                      transform transition-all duration-300
                      ${hoveredPlan === plan.id ? 'scale-105' : ''}
                      ${selectedPlan === plan.id ? 'animate-pulse' : ''}
                      ${loading && selectedPlan === plan.id ? 'opacity-75 cursor-not-allowed' : ''}
                      relative overflow-hidden group
                    `}
                  >
                    <span className="relative z-10">
                      {loading && selectedPlan === plan.id ? 'Processing...' : 'Choose This Plan'}
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>

                  {!isAuthenticated && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      *Login required to purchase membership
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <FaqAndInfo />
      </div>
    </div>
  );
};

export default MembershipPage; 