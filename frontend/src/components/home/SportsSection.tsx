import React, { useRef } from 'react';
import { sportsData } from './sports/data';
import { useScrollAnimation } from './sports/useScrollAnimation';
import SectionHeader from './sports/SectionHeader';
import SportCard from './sports/SportCard';
import ProgressIndicator from './sports/ProgressIndicator';
import ScrollIndicator from './sports/ScrollIndicator';

const SportsSection: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const { currentCard, isSticky, containerRef, sectionRef } = useScrollAnimation(cardsRef);

  return (
    <div ref={containerRef} style={{ height: `${sportsData.length * 100}vh` }} className="relative">
      <div
        ref={sectionRef}
        className={`${
          isSticky ? 'fixed top-0 left-0 w-full' : 'relative'
        } h-screen bg-gray-900 transition-all duration-300 ease-out`}
        style={{ 
          zIndex: isSticky ? 10 : 1,
          willChange: isSticky ? 'transform' : 'auto'
        }}
      >
        {/* Sport Cards */}
        {sportsData.map((sport, index) => (
          <SportCard
            key={sport.id}
            sport={sport}
            index={index}
            cardRef={(el) => {
              if (el) cardsRef.current[index] = el;
            }}
          />
        ))}

        {/* UI Components */}
        <SectionHeader />
        <ProgressIndicator currentCard={currentCard} totalCards={sportsData.length} />
        {isSticky && <ScrollIndicator currentCard={currentCard} totalCards={sportsData.length} />}
      </div>
    </div>
  );
};

export default SportsSection; 