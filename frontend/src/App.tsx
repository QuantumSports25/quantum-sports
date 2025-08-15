import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Page Components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import OTPLoginPage from "./pages/auth/OTPLoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VenuesPage from "./pages/venue/VenuesPage";
import VenueDetailPage from "./pages/venue/VenueDetailPage";
import BookingPage from "./pages/booking/BookingPage";
import ProfilePage from "./pages/profile/ProfilePage";
import MembershipPage from "./pages/MembershipPage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";

// Partner Pages
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerVenues from "./pages/partner/PartnerVenues";
import PartnerBookings from "./pages/partner/PartnerBookings";
import PartnerLoginPage from "./pages/auth/PartnerLoginPage";
import PartnerRegisterPage from "./pages/auth/PartnerRegisterPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLoginPage from "./pages/auth/AdminLoginPage";

// Demo Page
// import DashboardDemo from './pages/DashboardDemo';

// Protected Route Component
import ProtectedRoute from "./components/common/ProtectedRoute";
import VenueDetailsPage from "./pages/booking/VenueDetailsPage";

// Import new page components
import ContactPage from "./pages/ContactPage";
import WalletPage from "./pages/WalletPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ShopPage from "./pages/ShopPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ShopCheckoutPage from "./pages/ShopCheckoutPage";

// Import route tracking hook
import { useRouteTracker } from "./hooks/useRouteTracker";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Layout component that conditionally renders Header and Footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  // Track route changes (except for auth pages)
  useRouteTracker();

  // Define routes where Header and Footer should be hidden
  const dashboardRoutes = ["/admin/dashboard", "/partner/dashboard"];

  // Check if current route is a dashboard route
  const isDashboardRoute = dashboardRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route)
  );

  if (isDashboardRoute) {
    // For dashboard routes, render without Header and Footer
    return <>{children}</>;
  }

  // For regular routes, render with Header and Footer
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-otp" element={<OTPLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/venues/:id" element={<VenueDetailPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/checkout" element={<ShopCheckoutPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Demo Routes */}
            {/* <Route path="/demo" element={<DashboardDemo />} />
            <Route path="/dashboard-demo" element={<DashboardDemo />} */}

            {/* Protected User Routes */}
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/:venueId" element={<VenueDetailsPage />} />
  
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <ContactPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Protected with admin role */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard/users"
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard/partners"
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard/venues"
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard/bookings"
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard/settings"
              element={<AdminDashboard />}
            />
            <Route
              path="/admin/dashboard/events"
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Partner Routes - Nested dashboard routes */}
            <Route path="/partner/login" element={<PartnerLoginPage />} />
            <Route path="/partner/register" element={<PartnerRegisterPage />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route
              path="/partner/dashboard/bookings"
              element={
                <ProtectedRoute requiredRole="partner" redirectTo="/partner/login">
                  <PartnerBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/partner/dashboard/venues"
              element={<PartnerVenues />}
            />
            <Route
              path="/partner/dashboard/analytics"
              element={<PartnerDashboard />}
            />
            <Route
              path="/partner/dashboard/settings"
              element={<PartnerDashboard />}
            />

            {/* Legacy Partner Routes for backward compatibility */}
            {/* <Route path="/partner/venues" element={<PartnerVenues />} /> */}

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="container mx-auto px-4 py-8 text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="text-gray-600">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              }
            />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1F2937",
                color: "#fff",
                border: "1px solid #374151",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </Layout>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
