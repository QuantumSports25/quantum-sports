import { NavigateFunction, Location } from 'react-router-dom';

export interface RedirectToLoginOptions {
  intent?: 'proceed_to_payment' | 'protected_route_access' | 'role_required' | 'custom';
  customMessage?: string;
  redirectTo?: string;
}

/**
 * Utility function to redirect to login 
 * The route tracking system will automatically capture the current route
 */
export const redirectToLogin = (
  navigate: NavigateFunction,
  currentLocation: Location,
  options: RedirectToLoginOptions = {}
) => {
  const {
    intent = 'protected_route_access',
    redirectTo = '/login'
  } = options;

  // Simple redirect - the route tracker will have already captured the current route
  navigate(redirectTo, {
    state: {
      from: currentLocation,
      intent,
      ...options
    },
    replace: true
  });
};

/**
 * Hook-like function to get redirect parameters for manual navigation
 */
export const getLoginRedirectParams = (
  currentLocation: Location,
  options: RedirectToLoginOptions = {}
) => {
  const {
    intent = 'protected_route_access',
    redirectTo = '/login'
  } = options;

  return {
    to: redirectTo,
    state: {
      from: currentLocation,
      intent,
      ...options
    },
    replace: true
  };
};
