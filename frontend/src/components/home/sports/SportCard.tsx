import React from 'react';
import { SportCard as SportCardType } from './types';
import SportCardContent from './SportCardContent';
import FeaturesCard from './FeaturesCard';
import { sportsData } from './data';

interface SportCardProps {
  sport: SportCardType;
  index: number;
  cardRef: (el: HTMLDivElement | null) => void;
}

const SportCard: React.FC<SportCardProps> = ({ sport, index, cardRef }) => (
  <div
    ref={cardRef}
    className="absolute inset-0 transition-all duration-300 ease-out"
    style={{
      opacity: 0,
      transform: 'translateY(20px) scale(0.95)',
      zIndex: sportsData.length - index,
      willChange: 'transform, opacity',
    }}
  >
    {/* Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${sport.backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className={`absolute inset-0 bg-gradient-to-br ${sport.color} opacity-20`}></div>
    </div>

    {/* Content */}
    <div className="relative z-10 h-full flex items-center justify-center pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <SportCardContent sport={sport} />
          <FeaturesCard sport={sport} />
        </div>
      </div>
    </div>

    {/* Card Number Indicator */}
    <div className="absolute top-20 right-8 z-20 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-bold text-lg">
      {index + 1}
    </div>
  </div>
);

export default SportCard; 