import { useNavigate, useLocation } from 'react-router-dom';
import { redirectToLogin, RedirectToLoginOptions } from '../utils/authRedirect';

/**
 * Hook to handle login redirects with preserved location state
 * Returns a function that can be called to redirect to login
 */
export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToLoginWithState = (options: RedirectToLoginOptions = {}) => {
    redirectToLogin(navigate, location, options);
  };

  return redirectToLoginWithState;
};

/**
 * Hook to check authentication and redirect if needed
 * Useful for components that need authentication but aren't wrapped in ProtectedRoute
 */
export const useRequireAuth = (
  isAuthenticated: boolean,
  options: RedirectToLoginOptions = {}
) => {
  const redirectToLoginWithState = useAuthRedirect();

  const checkAuthAndRedirect = () => {
    if (!isAuthenticated) {
      redirectToLoginWithState(options);
      return false;
    }
    return true;
  };

  return checkAuthAndRedirect;
};
