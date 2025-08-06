import React, { useState, useEffect } from 'react';
import { FileText, Shield, Scale, Clock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const TermsPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sections = [
    {
      id: 'general',
      icon: Scale,
      title: 'General Terms',
      content: `These Terms & Conditions apply to all users of the Quantum Pickleball app, including but not limited to those who browse, make purchases, book courts, or subscribe to our services.

By using any part of the app, you agree to be bound by these Terms & Conditions. If you do not agree to all the terms, you may not access or use any of our services.

We reserve the right to update, change, or replace any part of these Terms & Conditions by posting updates on our app. It is your responsibility to review this page periodically for changes.`
    },
    {
      id: 'products',
      icon: FileText,
      title: 'Product Information',
      content: `We strive to present our products as accurately as possible in terms of colors, images, and descriptions. However, we cannot guarantee that your device's display of any color will be accurate.

Prices and availability of products are subject to change without notice.

We reserve the right to modify or discontinue products or services at any time without prior notice.`
    },
    {
      id: 'booking',
      icon: Clock,
      title: 'Court Booking System',
      content: `Court bookings are subject to availability and are confirmed only upon successful payment.

Users must adhere to the booked time slots. Any changes or cancellations must be made in accordance with our Cancellation Policy.

Quantum Pickleball reserves the right to cancel bookings due to unforeseen circumstances, with a full refund provided or an option to reschedule.`
    },
    {
      id: 'subscription',
      icon: CheckCircle,
      title: 'Subscription Services',
      content: `Subscriptions are available on a monthly basis and automatically renew unless canceled before the renewal date.

Subscription services provide access to exclusive app features as per the terms outlined in the subscription plan.

We reserve the right to change subscription prices and features, with changes effective at the start of the next subscription period.`
    },
    {
      id: 'payment',
      icon: Shield,
      title: 'Payment Terms',
      content: `Payments made through our app are secure and can be made via credit/debit cards or other online payment gateways.

By making a purchase or booking, you agree to provide accurate and complete payment information.`
    },
    {
      id: 'liability',
      icon: Scale,
      title: 'Liability',
      content: `Quantum Pickleball is not liable for any damages resulting from the use or inability to use our products, services, or booking system.

In no case shall Quantum Pickleball's liability exceed the amount paid for the product or service in question.`
    },
    {
      id: 'law',
      icon: Scale,
      title: 'Governing Law',
      content: `These Terms & Conditions are governed by and construed in accordance with the laws of India.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden mt-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-cyan-400 animate-bounce">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium tracking-wide uppercase">Legal Information</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent px-2">
            Terms & Conditions
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Welcome to Quantum Pickleball, a subsidiary and a brand of Exhibit Media Pvt Ltd. 
            By accessing or using our app, you agree to comply with the following Terms & Conditions.
          </p>
        </div>

        {/* Content Sections */}
        <div className="grid gap-6 sm:gap-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className={`group bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500 transform hover:scale-[1.02] ${
                  activeSection === section.id ? 'ring-2 ring-cyan-500/50' : ''
                }`}
                onMouseEnter={() => setActiveSection(section.id)}
                onMouseLeave={() => setActiveSection(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 self-center sm:self-start">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-cyan-400 transition-colors duration-300">
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
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-cyan-500/20">
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed px-2">
              Please read these terms carefully before making any purchase or using our services. 
              If you have any questions about these Terms & Conditions, please contact our support team.
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

export default TermsPage;
