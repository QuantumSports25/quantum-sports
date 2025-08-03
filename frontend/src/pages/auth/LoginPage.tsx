import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { useLastRouteRedirect } from "../../hooks/useRouteTracker";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { getAndClearRoute, getLastRoute } = useLastRouteRedirect();

  // Determine the redirect path from location state OR route history
  const fromLocationState = location.state?.from?.pathname;
  const loginIntent = location.state?.intent;
  const lastTrackedRoute = getLastRoute();

  // Priority: location state > tracked route > default
  const redirectPath = fromLocationState || lastTrackedRoute || "/";

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authService.login(credentials),
    onSuccess: (response: {
      success: boolean;
      data?: {
        user: any;
        token: string;
      };
      message?: string;
    }) => {
      if (response.success && response.data) {
        login(response.data.user, response.data.token);

        // Determine where to redirect
        let finalRedirectPath = "/";

        switch (loginIntent) {
          case "proceed_to_payment":
            // For payment intent, try to go back to the original route
            finalRedirectPath = getAndClearRoute() || "/booking";
            break;
          case "protected_route_access":
          case "role_required":
            // Use the original route or fallback to tracked route
            finalRedirectPath = fromLocationState || getAndClearRoute() || "/";
            break;
          default:
            // For normal login, use the best available redirect path
            finalRedirectPath = redirectPath;
            // Clear the tracked route since we're using it
            if (lastTrackedRoute) {
              getAndClearRoute();
            }
            break;
        }

        // Ensure we don't redirect to login pages
        const authPages = [
          "/login",
          "/register",
          "/login-otp",
          "/admin/login",
          "/partner/login",
        ];
        if (authPages.includes(finalRedirectPath)) {
          finalRedirectPath = "/";
        }

        navigate(finalRedirectPath, { replace: true });
      } else {
        setError(response.message || "Login failed");
      }
    },
    onError: () => {
      setError("Login failed. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  // Optional: Show a context-aware message based on login intent
  useEffect(() => {
    switch (loginIntent) {
      case "proceed_to_payment":
        setError("Please log in to proceed with your booking.");
        break;
      case "protected_route_access":
        setError("Please log in to access this page.");
        break;
      case "role_required":
        setError(
          "Please log in with the appropriate account to access this page."
        );
        break;
      default:
        // Clear any existing error for normal login
        setError("");
    }
  }, [loginIntent]);

  return (
    <div className="min-h-screen flex pt-16">
      {" "}
      {/* Added pt-16 for top padding */}
      {/* Left Side - Video Background */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Sports Video Background - Working Implementation */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Primary Video */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={(e) => {
              console.log("Video failed to load:", e);
              // Fallback to next video or image
              const video = e.target as HTMLVideoElement;
              const parent = video.parentElement;
              if (parent) {
                parent.style.backgroundImage = `
                  linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(17,24,39,0.9) 100%),
                  url('https://images.pexels.com/photos/7991178/pexels-photo-7991178.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')
                `;
                parent.style.backgroundSize = "cover";
                parent.style.backgroundPosition = "center";
              }
            }}
          >
            <source src="/videos/video.mp4" type="video/mp4" />
            <source src="/videos/video.mp4" type="video/mp4" />
          </video>

          {/* Fallback: Try YouTube embed if video fails */}
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playlist=dQw4w9WgXcQ&start=0"
            title="Login Sports Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ display: "none" }}
            onLoad={(e) => {
              // Show iframe if video fails
              const iframe = e.target as HTMLIFrameElement;
              const video = iframe.parentElement?.querySelector("video");
              if (video && video.readyState === 0) {
                iframe.style.display = "block";
                video.style.display = "none";
              }
            }}
          ></iframe>

          {/* Final Fallback: Static Sports Image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `
                linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(17,24,39,0.8) 100%),
                url('https://images.pexels.com/photos/7991178/pexels-photo-7991178.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')
              `,
              zIndex: -1,
            }}
          ></div>
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>

        {/* Interactive gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-green-900/40 mix-blend-multiply"></div>

        {/* Content */}
        <div className="absolute top-[320px] inset-0 flex flex-col justify-center items-start p-16 text-white z-10 mt-auto">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-xl max-w-md opacity-90 mb-8 leading-relaxed">
              Sign in to your account and continue your sports journey. Book
              venues and connect with your community.
            </p>
          </div>

          {/* Interactive Stats */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold text-yellow-400">1000+</div>
              <div className="text-sm text-gray-200">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold text-green-400">Instant</div>
              <div className="text-sm text-gray-200">Access</div>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-black px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-400">Welcome back to Quantum</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/login-otp"
                className="text-yellow-400 hover:text-yellow-300 text-sm"
              >
                Login with OTP
              </Link>
              <Link
                to="/forgot-password"
                className="text-yellow-400 hover:text-yellow-300 text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-yellow-400 hover:text-yellow-300"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
