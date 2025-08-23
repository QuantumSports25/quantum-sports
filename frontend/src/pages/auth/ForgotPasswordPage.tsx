import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/authService';
import { Mail, Loader2, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ForgotPasswordPage: React.FC = () => {
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Fix: include 'email' in dependency array to satisfy exhaustive-deps
  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [user?.email, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await authService.forgotPassword(email.trim());
      if (res?.success) {
        setIsSent(true);
        toast.success(res?.message || 'Password reset email sent');
      } else {
        toast.success('If the email exists, a reset link has been sent');
        setIsSent(true);
      }
    } catch (err: any) {
      // Security: do not leak whether email exists
      toast.success('If the email exists, a reset link has been sent');
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden mt-16">
      <div className="relative z-10 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-1 text-cyan-400 text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium tracking-wide uppercase">Account Recovery</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Forgot Password</h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl p-6 sm:p-7 space-y-5 bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 shadow-xl shadow-black/10">
            {isSent ? (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm text-green-300">If the email exists, we have sent a password reset link.</p>
                  <p className="text-xs text-gray-400 mt-1">Please check your inbox and spam folder.</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Enter your account email. We will send you a link to reset your password.</p>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-2.5 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting || isSent}
              />
            </div>

            <div className="flex items-center justify-between">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isSent}
                className="px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-200 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
