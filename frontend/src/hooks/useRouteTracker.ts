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
  
  const getAndClearRoute = () => getAndClearLastRoute();

  return {
    getLastRoute,
    getAndClearRoute
  };
};
