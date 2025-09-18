import React, { useState, useEffect, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const videoSourcesRef = useRef<string[]>(["/videos/video.mp4", "/videos/sign_up_2.mp4"]);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { getAndClearRoute, getLastRoute } = useLastRouteRedirect();

  // Lazy-load the video when it becomes visible
  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(container);
    const fallbackTimer = window.setTimeout(() => setShouldLoadVideo(true), 2000);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  // Try autoplay once ready
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !shouldLoadVideo) return;
    const handleReady = () => {
      videoEl
        .play()
        .catch((err) => console.log("Autoplay blocked or failed:", err));
    };
    videoEl.addEventListener("canplay", handleReady);
    videoEl.addEventListener("loadeddata", handleReady);
    return () => {
      videoEl.removeEventListener("canplay", handleReady);
      videoEl.removeEventListener("loadeddata", handleReady);
    };
  }, [shouldLoadVideo]);

  // Determine redirect path
  const fromLocationState = location.state?.from?.pathname;
  const loginIntent = location.state?.intent;
  const lastTrackedRoute = getLastRoute();
  const redirectPath = fromLocationState || lastTrackedRoute || "/";

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authService.login(credentials),
    onSuccess: (response: {
      success: boolean;
      data?: { user: any; token: string };
      message?: string;
    }) => {
      if (response.success && response.data) {
        login(response.data.user, response.data.token);

        let finalRedirectPath = "/";
        switch (loginIntent) {
          case "proceed_to_payment":
            finalRedirectPath = getAndClearRoute() || "/booking";
            break;
          case "protected_route_access":
          case "role_required":
            finalRedirectPath = fromLocationState || getAndClearRoute() || "/";
            break;
          default:
            finalRedirectPath = redirectPath;
            if (lastTrackedRoute) getAndClearRoute();
            break;
        }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  // Context-aware login messages
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
        setError("");
    }
  }, [loginIntent]);

  return (
    <div className="min-h-screen flex pt-16">
      {/* Left Side - Video Background */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div ref={videoContainerRef} className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload={shouldLoadVideo ? "auto" : "none"}
            ref={videoRef}
            src={shouldLoadVideo ? videoSourcesRef.current[activeSourceIndex] : undefined}
            onError={() => {
              setActiveSourceIndex((idx) =>
                idx + 1 < videoSourcesRef.current.length ? idx + 1 : idx
              );
            }}
          />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-green-900/40 mix-blend-multiply"></div>

        {/* Left-side content */}
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

          <div className="grid grid-cols-2 gap-6 ">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold text-yellow-400">2000+</div>
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
