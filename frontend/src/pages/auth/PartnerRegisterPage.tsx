import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { RegisterForm } from "../../types";

const PartnerRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    subscriptionType: "fixed",
    gstNumber: "",
    websiteUrl: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Partner Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterForm & {
      companyName: string;
      subscriptionType: 'fixed' | 'revenue';
      gstNumber?: string;
      websiteUrl?: string;
    }) => authService.registerPartner(userData),
    onSuccess: (response) => {
      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        navigate("/partner/dashboard");
      } else {
        setError(response.message || "Partner Registration failed");
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Partner Registration failed");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    registerMutation.mutate(submitData as RegisterForm & {
      companyName: string;
      subscriptionType: 'fixed' | 'revenue';
      gstNumber?: string;
      websiteUrl?: string;
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans mt-12 relative">
      {/* Sports Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1610684082661-5d4763eecb39?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`
        }}
      ></div>
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Gradient Overlay */}
      {/* <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-primary-500 to-primary-700 opacity-20"></div> */}

      <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-fade-in relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            
          </div>

          <h2 className="text-4xl font-bold text-white tracking-tight mb-3 drop-shadow-lg">
            Join Quantum as a Partner
          </h2>
          <p className="text-base text-neutral-100 drop-shadow-md">
            Grow your sports venue business with precision
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl animate-fade-in relative z-10">
        <div className="bg-opacity-95 backdrop-blur-sm py-10 px-8 shadow-2xl sm:rounded-3xl border border-white border-opacity-20 relative overflow-hidden">
          {/* Enhanced decorative element */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700"></div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm 
              transition-all duration-300 ease-in-out animate-pulse">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="mt-1 block w-full border-2 border-neutral-200 rounded-xl shadow-soft py-3 px-4 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  transition-all duration-300 ease-in-out hover:border-primary-300
                  placeholder-neutral-400"
                />
              </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="mt-1 block w-full border-2 border-neutral-200 rounded-xl shadow-soft py-3 px-4 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  transition-all duration-300 ease-in-out hover:border-primary-300
                  placeholder-neutral-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="mt-1 block w-full border-2 border-neutral-200 rounded-xl shadow-soft py-3 px-4 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  transition-all duration-300 ease-in-out hover:border-primary-300
                  placeholder-neutral-400"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-white mb-2">
                  Company/Venue Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                  className="mt-1 block w-full border-2 border-neutral-200 rounded-xl shadow-soft py-3 px-4 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  transition-all duration-300 ease-in-out hover:border-primary-300
                  placeholder-neutral-400"
                />
              </div>
            </div>

            <div>
              {/* <label htmlFor="subscriptionType" className="block text-sm font-semibold text-white mb-2">
                Subscription Type
              </label> */}
              {/* <select
                id="subscriptionType"
                name="subscriptionType"
                required
                value={formData.subscriptionType}
                onChange={handleChange}
                className="mt-1 block w-full border-2 border-neutral-200 rounded-xl shadow-soft py-3 px-4 
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                transition-all duration-300 ease-in-out hover:border-primary-300
                text-neutral-700"
              >
                <option value="fixed">Fixed Monthly (₹5,000/month)</option>
                <option value="revenue">Revenue Share</option>
              </select> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gstNumber" className="block text-sm font-semibold text-white mb-2">
                  GST Number (Optional)
                </label>
                <input
                  id="gstNumber"
                  name="gstNumber"
                  type="text"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                  className="mt-1 block w-full border-2 border-neutral-200 rounded-xl shadow-soft py-3 px-4 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  transition-all duration-300 ease-in-out hover:border-primary-300
                  placeholder-neutral-400"
                />
              </div>

              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-semibold text-white mb-2">
                  Website URL (Optional)
                </label>
                <input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="Enter website URL"
                  className="mt-1 block w-full border-2 border-neutral-200 rounded-xl shadow-soft py-3 px-4 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  transition-all duration-300 ease-in-out hover:border-primary-300
                  placeholder-neutral-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="mt-1 block w-full border-2 border-neutral-200 rounded-xl shadow-soft py-3 px-4 pr-12
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                    transition-all duration-300 ease-in-out hover:border-primary-300
                    placeholder-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="mt-1 block w-full border-2 border-neutral-200 rounded-xl shadow-soft py-3 px-4 pr-12
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                    transition-all duration-300 ease-in-out hover:border-primary-300
                    placeholder-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-medium 
                text-base font-bold text-white bg-primary-600 hover:bg-primary-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending ? "Registering..." : "Create Partner Account"}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                {/* <div className="w-full border-t border-neutral-200"></div> */}
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3  text-white font-semibold rounded-xl">
                  Already have a partner account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/partner/login"
                className="w-full flex justify-center py-3 px-4 border-2 border-primary-500 rounded-xl 
                text-base font-bold text-primary-700 bg-white hover:bg-primary-50
                transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign in to Existing Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegisterPage;