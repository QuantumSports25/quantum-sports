import React, { useState, useEffect } from 'react';
import { Shield, Eye, Lock, Share2, UserCheck, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sections = [
    {
      id: 'collection',
      icon: Eye,
      title: 'Information We Collect',
      content: `We collect personal information such as your name, email address, phone number, and payment details when you make a purchase, book a court, or subscribe to our services.

We may also collect non-personal information such as your IP address, device type, and browsing patterns for analytics purposes.`
    },
    {
      id: 'usage',
      icon: UserCheck,
      title: 'How We Use Your Information',
      content: `Your information is used to process transactions, manage bookings, deliver products, and improve our app's functionality.

We may also use your information for marketing purposes, such as sending promotional offers or updates, but only with your consent.`
    },
    {
      id: 'sharing',
      icon: Share2,
      title: 'Sharing of Information',
      content: `We do not sell, trade, or otherwise transfer your personal information to outside parties, except to trusted third parties who assist us in operating our app, conducting business, or servicing you, provided that they agree to keep your information confidential.

We may disclose your information if required by law or to protect our rights, property, or safety.`
    },
    {
      id: 'security',
      icon: Lock,
      title: 'Security',
      content: `We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.`
    },
    {
      id: 'consent',
      icon: Shield,
      title: 'Your Consent',
      content: `By using our app, you consent to our Privacy Policy.

We may update this policy from time to time, and any changes will be posted on this page.`
    }
  ];

  const additionalPolicies = [
    {
      id: 'refunds',
      icon: AlertTriangle,
      title: 'Refunds/Cancellations',
      sections: [
        {
          subtitle: 'Refunds for Products',
          content: `Refunds are available for unopened and unused products returned within 15 days of delivery. The product must be in its original packaging and in the same condition as received.

To initiate a refund, please contact our customer service team through the app with your order details.

Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within 7-10 business days to your original payment method.`
        },
        {
          subtitle: 'Cancellations for Bookings',
          content: `Court bookings can be canceled or rescheduled up to 24 hours before the scheduled time.

Cancellations made within 24 hours of the booking time will not be eligible for a refund.

If Quantum Pickleball cancels a booking due to unforeseen circumstances, a full refund or rescheduling option will be provided.`
        },
        {
          subtitle: 'Subscription Cancellations',
          content: `Subscriptions can be canceled at any time through the app, with the cancellation taking effect at the end of the current billing cycle.

No refunds will be provided for partial subscription periods.`
        },
        {
          subtitle: 'Non-Refundable Items',
          content: `Sale items and customized products are non-refundable.

Digital products, such as e-books or online courses, once delivered, are non-refundable.`
        }
      ]
    },
    {
      id: 'shipping',
      icon: Share2,
      title: 'Shipping & Delivery Policies',
      sections: [
        {
          subtitle: 'Shipping Locations',
          content: `We currently ship to all major cities and towns within India.

Shipping to remote areas may involve additional charges and longer delivery times.`
        },
        {
          subtitle: 'Shipping Timeframes',
          content: `Orders are typically processed within 1-2 business days after payment confirmation.

Standard delivery time is 5-7 business days for most locations within India. Delivery to remote areas may take 7-10 business days.

Expedited shipping options are available at an additional cost, with delivery times of 2-4 business days.`
        },
        {
          subtitle: 'Shipping Charges',
          content: `Shipping charges are calculated at checkout based on the delivery location and weight of the package.

Free shipping is available for orders exceeding a specified amount, as indicated on the app.`
        },
        {
          subtitle: 'Delivery Process',
          content: `Once your order is shipped, you will receive a confirmation email or app notification with tracking details.

If delivery cannot be completed due to unavailability, our courier partner will attempt delivery up to three times before the package is returned to us.`
        },
        {
          subtitle: 'Damaged or Lost Items',
          content: `If your package arrives damaged or is lost in transit, please report the issue through the app within 24 hours of delivery.

We will arrange for a replacement product or issue a refund based on availability.`
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden mt-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-green-400 animate-bounce">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium tracking-wide uppercase">Your Privacy Matters</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-400 bg-clip-text text-transparent px-2">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            At Quantum Pickleball, a subsidiary and brand of Exhibit Media Pvt Ltd., we are committed to safeguarding your privacy. 
            This Privacy Policy outlines how we collect, use, and protect your personal information when you use our app.
          </p>
        </div>

        {/* Privacy Policy Sections */}
        <div className="grid gap-6 sm:gap-8 mb-12 sm:mb-16">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className={`group bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-500 transform hover:scale-[1.02] ${
                  activeSection === section.id ? 'ring-2 ring-green-500/50' : ''
                }`}
                onMouseEnter={() => setActiveSection(section.id)}
                onMouseLeave={() => setActiveSection(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 self-center sm:self-start">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-green-400 transition-colors duration-300">
                      {section.title}
                    </h3>
                    <div className="text-gray-300 leading-relaxed space-y-3 sm:space-y-4">
                      {section.content.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-sm sm:text-base lg:text-lg">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Policies */}
        <div className="space-y-8 sm:space-y-12">
          {additionalPolicies.map((policy, policyIndex) => {
            const Icon = policy.icon;
            return (
              <div key={policy.id} className="bg-gray-800/30 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-700/30">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-8 text-center sm:text-left">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {policy.title}
                  </h2>
                </div>
                
                <div className="grid gap-4 sm:gap-6">
                  {policy.sections.map((section, sectionIndex) => (
                    <div 
                      key={sectionIndex}
                      className="bg-gray-700/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-600/30 hover:border-purple-500/30 transition-all duration-300"
                    >
                      <h4 className="text-lg sm:text-xl font-semibold text-purple-300 mb-2 sm:mb-3">
                        {section.subtitle}
                      </h4>
                      <div className="text-gray-300 leading-relaxed space-y-2 sm:space-y-3">
                        {section.content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-sm sm:text-base">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-green-500/20">
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed px-2">
              Your privacy is important to us. If you have any questions about this Privacy Policy, 
              please don't hesitate to contact our support team.
            </p>
            <div className="mt-4 sm:mt-6">
              <span className="text-xs sm:text-sm text-gray-400">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
