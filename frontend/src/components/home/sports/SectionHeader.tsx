import React from 'react';

const SectionHeader: React.FC = () => (
  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 text-center">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 px-4 drop-shadow-lg">
      Choose from you favourite sports{' '}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
        40+ Sports
      </span>
    </h2>
    <p className="text-sm sm:text-base text-gray-300 px-4 drop-shadow-md">
      Discover your perfect sport from our extensive collection of activities
    </p>
  </div>
);

export default SectionHeader; 