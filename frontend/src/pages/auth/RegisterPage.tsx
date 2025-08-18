import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { RegisterForm } from "../../types";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: Omit<RegisterForm, "confirmPassword">) =>
      authService.register(userData),
    onSuccess: (response) => {
      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        navigate("/login");
      } else {
        setError(response.message || "Registration failed");
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Registration failed");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return;
    }

    const { confirmPassword, ...userData } = formData;

    try {
      registerMutation.mutate(userData);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex pt-16">  {/* Added pt-16 for top padding */}
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
              console.log('Video failed to load:', e);
              // Fallback to next video or image
              const video = e.target as HTMLVideoElement;
              const parent = video.parentElement;
              if (parent) {
                parent.style.backgroundImage = `
                  linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(17,24,39,0.9) 100%),
                  url('https://images.pexels.com/photos/7991178/pexels-photo-7991178.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')
                `;
                parent.style.backgroundSize = 'cover';
                parent.style.backgroundPosition = 'center';
              }
            }}
          >
            <source
              src="/videos/sign_up_1.mp4"
              type="video/mp4"
            />
            <source
              src="/videos/sign_up_2.mp4"
              type="video/mp4"
            />
          </video>

          {/* Fallback: Try YouTube embed if video fails */}
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playlist=dQw4w9WgXcQ&start=0"
            title="Sign Up Sports Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ display: 'none' }}
            onLoad={(e) => {
              // Show iframe if video fails
              const iframe = e.target as HTMLIFrameElement;
              const video = iframe.parentElement?.querySelector('video');
              if (video && video.readyState === 0) {
                iframe.style.display = 'block';
                video.style.display = 'none';
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
              zIndex: -1
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
              Join Our Community
            </h1>
            <p className="text-xl max-w-md opacity-90 mb-8 leading-relaxed">
              Create your account and unlock a world of sports opportunities.
              Connect, book, and play with ease.
            </p>
          </div>

          {/* Interactive Stats */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold text-yellow-400">500+</div>
              <div className="text-sm text-gray-200">Venues Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold text-green-400">24/7</div>
              <div className="text-sm text-gray-200">Booking Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-black px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Sign up to join Quantum</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="Create a strong password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I agree to the{" "}
                <a href="/terms" className="text-yellow-400 hover:text-yellow-300">
                  Terms of Service
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {registerMutation.isPending ? "Creating Account..." : "Sign Up"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-yellow-400 hover:text-yellow-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
