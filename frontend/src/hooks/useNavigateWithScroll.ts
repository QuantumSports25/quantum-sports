import { useNavigate } from 'react-router-dom';

/**
 * Custom hook that provides navigation with automatic scroll-to-top behavior
 * @returns navigate function with scroll-to-top functionality
 */
export const useNavigateWithScroll = () => {
  const navigate = useNavigate();

  const navigateWithScroll = (to: string, options?: any) => {
    // Navigate to the new route
    navigate(to, options);
    
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 100);
  };

  return navigateWithScroll;
};
