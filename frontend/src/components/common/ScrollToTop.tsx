import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  behavior?: ScrollBehavior;
  top?: number;
}

/**
 * Component to scroll to top when route changes
 * Can be used as an alternative to the hook for more control
 */
const ScrollToTop: React.FC<ScrollToTopProps> = ({ 
  behavior = 'smooth', 
  top = 0 
}) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top,
      behavior,
    });
  }, [location.pathname, location.search, behavior, top]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
