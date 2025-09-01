import { useEffect, useRef, useState, useCallback } from 'react';
import { sportsData } from './data';

export const useScrollAnimation = (cardsRef: React.MutableRefObject<HTMLDivElement[]>) => {
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateCardTransforms = useCallback((cardIndex: number) => {
    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      let translateY = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = sportsData.length - index;

      if (index < cardIndex) {
        const stackOffset = (cardIndex - index) * 60;
        translateY = -stackOffset;
        scale = 1 - (cardIndex - index) * 0.03;
        opacity = 0.8 - (cardIndex - index) * 0.1;
        zIndex = index;
      } else if (index === cardIndex) {
        translateY = 0;
        scale = 1;
        opacity = 1;
        zIndex = sportsData.length;
      } else {
        translateY = (index - cardIndex) * 20;
        scale = 0.95;
        opacity = 0;
        zIndex = sportsData.length - index;
      }

      card.style.transform = `translateY(${translateY}px) scale(${scale})`;
      card.style.opacity = opacity.toString();
      card.style.zIndex = zIndex.toString();
      card.style.transition = 'all 0.3s ease-out';
    });
  }, [cardsRef]);

  const resetCards = useCallback(() => {
    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      card.style.transform = 'translateY(20px) scale(0.95)';
      card.style.opacity = '0';
      card.style.zIndex = (sportsData.length - index).toString();
      card.style.transition = 'all 0.3s ease-out';
    });
  }, [cardsRef]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !sectionRef.current) return;

      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce scroll events for better performance
      scrollTimeoutRef.current = setTimeout(() => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const containerTop = containerRect.top;
        const containerBottom = containerRect.bottom;
        
        const shouldBeSticky = containerTop <= 0 && containerBottom > windowHeight;
        setIsSticky(shouldBeSticky);

        if (shouldBeSticky) {
          const scrollProgress = Math.abs(containerTop) / (containerRect.height - windowHeight);
          const cardIndex = Math.min(
            sportsData.length - 1,
            Math.floor(scrollProgress * sportsData.length)
          );
          setCurrentCard(cardIndex);
          updateCardTransforms(cardIndex);
        } else {
          resetCards();
          setCurrentCard(0);
        }
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [resetCards, updateCardTransforms]);

  return { currentCard, isSticky, containerRef, sectionRef };
}; 