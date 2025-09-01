import React from 'react';
import {
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  SportsSection,
  TestimonialSection,
  CTASection
} from '../components/home';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 overflow-x-hidden">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <SportsSection />
      <TestimonialSection />
      <CTASection />
    </div>
  );
};

export default HomePage; 