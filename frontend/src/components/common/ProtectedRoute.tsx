import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "partner" | "admin";
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with the current location as state
    // This allows us to send the user back to their intended destination after login
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          intent: "protected_route_access",
        }}
        replace
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    // User doesn't have the required role - redirect to appropriate login
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          intent: "role_required",
          requiredRole,
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
