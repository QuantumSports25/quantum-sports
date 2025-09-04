import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Search, Users, Shield, CreditCard, Clock } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden bg-gray-900">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        {/* Dark Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full -translate-x-24 sm:-translate-x-32 -translate-y-24 sm:-translate-y-32 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-white/5 rounded-full translate-x-36 sm:translate-x-48 translate-y-36 sm:translate-y-48 animate-pulse delay-700"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm font-medium mb-6 sm:mb-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-yellow-400 group-hover:animate-spin" />
          Join 2000+ Happy Users
        </div>
        
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
          Ready to Book Your 
          <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">Next Game?</span>
        </h2>
        
        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
          Join thousands of sports enthusiasts who trust Quantum for their venue booking needs. 
          Start your fitness journey today!
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
          <Link
            to="/booking"
            className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-base sm:text-lg font-bold rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
          >
            <Search className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-300" />
            Find Venues Now
            <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <Link
            to="/register"
            className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-md text-white text-base sm:text-lg font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105"
          >
            <Users className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-300" />
            Create Free Account
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-12 sm:mt-16 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center gap-2 group hover:text-white transition-colors duration-300">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
            <span>Secure Booking</span>
          </div>
          <div className="flex items-center gap-2 group hover:text-white transition-colors duration-300">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            <span>Zero Hidden Charges</span>
          </div>
          <div className="flex items-center gap-2 group hover:text-white transition-colors duration-300">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection; 