import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopOptions {
  behavior?: ScrollBehavior;
  top?: number;
}

/**
 * Hook to automatically scroll to top when route changes
 * @param options - Scroll behavior options
 */
export const useScrollToTop = (options: ScrollToTopOptions = {}) => {
  const location = useLocation();
  const { behavior = 'smooth', top = 0 } = options;

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top,
      behavior,
    });
  }, [location.pathname, location.search, behavior, top]);
};
