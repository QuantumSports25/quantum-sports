import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { Eye, EyeOff } from "lucide-react";

const PartnerLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({});
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Partner login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authService.partnerLogin(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Verify that the logged-in user is a partner
        if (response.data.user.role !== 'partner') {
          setError("Access denied. Not a partner account.");
          return;
        }
        
        login(response.data.user, response.data.token);
        navigate("/partner/dashboard");
      } else {
        setError(response.message || "Partner Login failed");
      }
    },
    onError: (error: any) => {
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message || "Partner Login failed");
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Partner Login Error:", error);
    }
  });

  // Form validation
  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    loginMutation.mutate({ email, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans mt-12 relative">
      {/* Sports Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://plus.unsplash.com/premium_photo-1685303469251-4ee0ea014bb3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`
        }}
      ></div>
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-primary-500 to-primary-700 opacity-20"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            
          </div>
          
          <h2 className="text-4xl font-bold text-white tracking-tight mb-3 drop-shadow-lg">
            Partner Portal
          </h2>
          <p className="text-base text-neutral-100 drop-shadow-md">
          Join and  Manage your sports venues with us
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in relative z-10">
        <div className=" bg-opacity-95 backdrop-blur-sm py-10 px-8 shadow-2xl sm:rounded-3xl border border-white border-opacity-20 relative overflow-hidden">
          {/* Enhanced decorative element */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm 
              transition-all duration-300 ease-in-out animate-pulse">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                className={`mt-1 block w-full border-2 rounded-xl shadow-soft py-3 px-4 
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                transition-all duration-300 ease-in-out hover:border-primary-300
                placeholder-neutral-400 ${
                  fieldErrors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-neutral-200'
                }`}
                placeholder="Enter your email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`mt-1 block w-full border-2 rounded-xl shadow-soft py-3 px-4 pr-12
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  transition-all duration-300 ease-in-out hover:border-primary-300
                  placeholder-neutral-400 ${
                    fieldErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-neutral-200'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors duration-200"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgot-password"><button
                  type="button"
                  className="font-semibold text-primary-600 hover:text-primary-700 
                  transition-colors duration-300 ease-in-out focus:outline-none focus:underline"
                >
                  Forgot password?
                </button></a>
                
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending || !email.trim() || !password.trim()}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-medium 
                text-base font-bold text-white bg-primary-600 hover:bg-primary-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loginMutation.isPending && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loginMutation.isPending ? "Signing in..." : "Sign in to Partner Portal"}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              {/* <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div> */}
              <div className="relative flex justify-center text-sm">
                <span className="px-3  text-white font-semibold rounded-xl">
                  New to our platform?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/partner/register"
                className="w-full flex justify-center py-3 px-4 border-2 border-primary-500 rounded-xl 
                text-base font-bold text-primary-700 bg-white hover:bg-primary-50
                transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Partner Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerLoginPage;