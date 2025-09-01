import React from 'react';
import { SportCard } from './types';
// import SportStats from './SportStats';
// import BookingButton from './BookingButton';

interface SportCardContentProps {
  sport: SportCard;
}

const SportCardContent: React.FC<SportCardContentProps> = ({ sport }) => (
  <div className="text-white space-y-6 text-center lg:text-left">
    {/* Sport Icon */}
    <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 transform hover:scale-110 transition-transform duration-300">
      {sport.image}
    </div>

    {/* Sport Name */}
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
      {sport.name}
    </h1>

    {/* Description */}
    <p className="text-lg sm:text-xl md:text-2xl text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
      {sport.description}
    </p>

    {/* Stats */}
    {/* <SportStats sport={sport} /> */}

    {/* CTA Button */}
    {/* <BookingButton sportName={sport.name} /> */}
  </div>
);

export default SportCardContent; 