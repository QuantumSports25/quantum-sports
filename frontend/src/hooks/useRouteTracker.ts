import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRouteHistoryStore } from '../store/routeHistoryStore';

/**
 * Hook to automatically track route changes and save the last meaningful route
 */
export const useRouteTracker = () => {
  const location = useLocation();
  const { setLastRoute } = useRouteHistoryStore();

  useEffect(() => {
    // Track the current route
    setLastRoute(location.pathname + location.search);
  }, [location.pathname, location.search, setLastRoute]);
};

/**
 * Hook to get the last route and provide redirect functionality
 */
export const useLastRouteRedirect = () => {
  const { getAndClearLastRoute, lastRoute } = useRouteHistoryStore();

  const getLastRoute = () => lastRoute;
  
  const getAndClearRoute = () => {
    const route = getAndClearLastRoute();
    
    // Handle route overrides using switch case
    switch (route) {
      case '/forgot-password':
        // Redirect to home page instead of forgot-password
        return '/';
      
      default:
        // Return the original route for all other cases
        return route;
    }
  };

  return {
    getLastRoute,
    getAndClearRoute
  };
};
