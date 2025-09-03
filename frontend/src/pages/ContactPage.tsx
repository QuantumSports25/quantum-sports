import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building2, ArrowRight, Sparkles } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const contactItems = [
    {
      id: 'support',
      icon: Mail,
      title: 'Customer Support',
      email: 'quantum@eipickleball.com ',
      phone: '98765 43210',
      description: 'Get help with technical issues and general questions',
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      id: 'business',
      icon: Building2,
      title: 'Business Inquiries',
      email: 'quantum@eipickleball.com ',
      description: 'Partnership opportunities and enterprise solutions',
      gradient: 'from-purple-500 to-pink-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center relative overflow-hidden mt-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className={`max-w-4xl mx-auto px-4 py-8 relative z-10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 text-cyan-400 animate-bounce">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide uppercase">Get In Touch</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We're here to help! Reach out to us for any questions, suggestions, or support needs.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`relative group cursor-pointer transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group-hover:transform group-hover:scale-105 group-hover:shadow-3xl">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${item.gradient} mb-6 transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    {item.title}
                  </h2>

                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 group/email hover:gap-4 transition-all duration-200">
                      <Mail className="w-5 h-5 text-gray-500 group-hover/email:text-blue-400 transition-colors duration-200" />
                      <span className="text-gray-300 group-hover/email:text-white transition-colors duration-200">{item.email}</span>
                    </div>

                    {item.phone && (
                      <div className="flex items-center gap-3 group/phone hover:gap-4 transition-all duration-200">
                        <Phone className="w-5 h-5 text-gray-500 group-hover/phone:text-green-400 transition-colors duration-200" />
                        <span className="text-gray-300 group-hover/phone:text-white transition-colors duration-200">{item.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Hover indicator */}
                  <div className={`absolute bottom-4 right-4 transform transition-all duration-300 ${hoveredCard === item.id ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        {/* <div className={`text-center transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-600/30">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Ready to get started?
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Don't hesitate to reach out. We typically respond within 24 hours.
            </p>
            
            <button className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95">
              <Send className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Send us a message</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div> */}

        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default ContactPage;