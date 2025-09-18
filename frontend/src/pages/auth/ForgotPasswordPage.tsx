import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { authService } from "../../services/authService";
import {
  Mail,
  Loader2,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Lock,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useRouteHistoryStore } from "../../store/routeHistoryStore";
import { useMutation } from "@tanstack/react-query";

interface ForgotPasswordState {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  resetToken: string;
}

type Step = "email" | "otp" | "password";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const clearLastRoute = useRouteHistoryStore((state) => state.clearLastRoute);
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [formData, setFormData] = useState<ForgotPasswordState>({
    email: user?.email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    resetToken: "",
  });

  useEffect(() => {
    if (!formData.email && user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email, formData.email]);

  // Mutation for sending OTP
  const sendOtpMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (data) => {
      if (data?.success) {
        setCurrentStep("otp");
        toast.success(data?.message || "OTP sent to your email");
      } else {
        toast.error(data?.message || "Failed to send OTP");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    },
  });

  // Mutation for verifying OTP
  const verifyOtpMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyForgetPasswordOTP(email, otp),
    onSuccess: (data) => {
      if (data?.success && data?.data?.resetToken) {
        setFormData((prev) => ({ ...prev, resetToken: data.data.resetToken }));
        setCurrentStep("password");
        toast.success("OTP verified successfully");
      } else {
        toast.error("Invalid OTP verification response");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Invalid or expired OTP");
    },
  });

  // Mutation for resetting password
  const resetPasswordMutation = useMutation({
    mutationFn: ({
      resetToken,
      newPassword,
    }: {
      resetToken: string;
      newPassword: string;
    }) => authService.resetPassword(resetToken, newPassword),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Password reset successfully");
        clearLastRoute();
        navigate("/login");
      } else {
        toast.error(data?.message || "Failed to reset password");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    sendOtpMutation.mutate(formData.email.trim());
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    if (formData.otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    verifyOtpMutation.mutate({
      email: formData.email,
      otp: formData.otp.trim(),
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetPasswordMutation.mutate({
      resetToken: formData.resetToken,
      newPassword: formData.newPassword,
    });
  };

  const handleInputChange =
    (field: keyof ForgotPasswordState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleResendOtp = () => {
    sendOtpMutation.mutate(formData.email);
  };

  const goBackToEmail = () => {
    setCurrentStep("email");
    setFormData((prev) => ({
      ...prev,
      otp: "",
      newPassword: "",
      confirmPassword: "",
      resetToken: "",
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300">
                  We'll send a 6-digit OTP to your email address.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Please enter your registered email address.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-2.5 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={sendOtpMutation.isPending}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
              <button
                type="submit"
                disabled={sendOtpMutation.isPending}
                className="px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-200 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {sendOtpMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case "otp":
        return (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-sm text-green-300">
                  OTP sent to {formData.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Enter OTP
              </label>
              <input
                type="text"
                value={formData.otp}
                onChange={handleInputChange("otp")}
                placeholder="123456"
                maxLength={6}
                className="w-full rounded-xl px-4 py-2.5 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-xl tracking-widest"
                disabled={verifyOtpMutation.isPending}
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                OTP expires in 10 minutes
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goBackToEmail}
                className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Change Email
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendOtpMutation.isPending}
                  className="px-4 py-2.5 rounded-xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 transition-colors disabled:opacity-60"
                >
                  Resend OTP
                </button>
                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  className="px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-200 inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl disabled:opacity-60"
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      <span>Verify OTP</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        );

      case "password":
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Lock className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm text-purple-300">
                  Create a new password for your account.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Password must be at least 6 characters long.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange("newPassword")}
                placeholder="Enter new password"
                className="w-full rounded-xl px-4 py-2.5 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={resetPasswordMutation.isPending}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                placeholder="Confirm new password"
                className="w-full rounded-xl px-4 py-2.5 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={resetPasswordMutation.isPending}
                required
                minLength={6}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goBackToEmail}
                className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Start Over
              </button>
              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-200 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "email":
        return "Forgot Password";
      case "otp":
        return "Verify OTP";
      case "password":
        return "Reset Password";
      default:
        return "Forgot Password";
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case "email":
        return <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />;
      case "otp":
        return <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />;
      case "password":
        return <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />;
      default:
        return <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden mt-16">
      <div className="relative z-10 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl">
                {getStepIcon()}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-1 text-cyan-400 text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium tracking-wide uppercase">
                    Step{" "}
                    {currentStep === "email"
                      ? "1"
                      : currentStep === "otp"
                      ? "2"
                      : "3"}{" "}
                    of 3
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {getStepTitle()}
                </h1>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs text-gray-400">
                {currentStep === "email"
                  ? "33%"
                  : currentStep === "otp"
                  ? "66%"
                  : "100%"}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-300"
                style={{
                  width:
                    currentStep === "email"
                      ? "33%"
                      : currentStep === "otp"
                      ? "66%"
                      : "100%",
                }}
              ></div>
            </div>
          </div>

          {/* Form Container */}
          <div className="rounded-2xl p-6 sm:p-7 bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 shadow-xl shadow-black/10">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
