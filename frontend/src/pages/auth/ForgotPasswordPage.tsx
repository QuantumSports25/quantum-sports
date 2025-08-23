import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/authService';
import { Mail, Loader2, ArrowLeft, Sparkles, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ForgotPasswordPage: React.FC = () => {
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [stage, setStage] = useState<'request' | 'verify' | 'reset'>('request');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await authService.forgotPassword(email.trim());
      if (res?.success) {
        toast.success(res?.message || 'A 6-digit code has been sent');
      }
      setStage('verify');
    } catch (err: any) {
      // Security: do not leak whether email exists
      toast.success('If the email exists, a code has been sent');
      setStage('verify');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }
    try {
      setIsVerifying(true);
      const res = await authService.verifyResetCode(email.trim(), code.trim());
      if (res?.success) {
        toast.success('Code verified');
        setStage('reset');
      } else {
        toast.error(res?.message || 'Invalid or expired code');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid or expired code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setIsResetting(true);
      const res = await authService.resetPassword(email.trim(), code.trim(), newPassword);
      if (res?.success) {
        toast.success('Password has been reset');
        setStage('request');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res?.message || 'Failed to reset password');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error('Enter email to resend');
      return;
    }
    try {
      setIsSubmitting(true);
      await authService.forgotPassword(email.trim());
      toast.success('Code resent');
    } catch {
      toast.success('If the email exists, a code has been sent');
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

          <div className="rounded-2xl p-6 sm:p-7 space-y-5 bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 shadow-xl shadow-black/10">
            {stage === 'request' && (
              <form onSubmit={handleSubmitEmail} className="space-y-5">
                <p className="text-sm text-gray-400">Enter your account email. We will send you a 6-digit code to reset your password.</p>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl px-4 py-2.5 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
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
                        <span>Send Code</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {stage === 'verify' && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-300">We sent a 6-digit code to {email}. It expires in 15 minutes.</p>
                    <button type="button" onClick={handleResend} disabled={isSubmitting} className="text-xs text-gray-300 hover:text-white mt-1 underline disabled:opacity-60">Resend code</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Enter Code</label>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="______"
                    className="tracking-widest text-center text-lg w-full rounded-xl px-4 py-2.5 bg-gray-800/70 text-white placeholder-gray-500 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStage('request')} className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button type="submit" disabled={isVerifying} className="px-4 py-2.5 rounded-xl text-white font-medium inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-60">
                    {isVerifying ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>Verifying...</span></>) : (<span>Verify Code</span>)}
                  </button>
                </div>
              </form>
            )}

            {stage === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Set New Password</h2>
                    <p className="text-xs text-gray-400">Create a strong password for your account</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a new password"
                      className="w-full rounded-xl px-4 py-2.5 pr-12 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="button" onClick={() => setShowNewPassword(v => !v)} aria-label={showNewPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-xl px-4 py-2.5 pr-12 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStage('verify')} className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button type="submit" disabled={isResetting} className="px-4 py-2.5 rounded-xl text-white font-medium inline-flex items-center gap-2 bg-gray-900 hover:bg-black border border-gray-700/60 disabled:opacity-60">
                    {isResetting ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>Resetting...</span></>) : (<span>Reset Password</span>)}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;


