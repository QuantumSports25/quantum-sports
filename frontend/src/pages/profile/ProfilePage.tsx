import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';
import { User as UserIcon, Lock, Loader2, Save, Sparkles, Eye, EyeOff } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateUser, getProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Load latest profile into store
    getProfile().catch(() => { });
  }, [getProfile]);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user?.name, user?.phone]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await authService.updateProfile({ name, phone });
      if (res.success && res.data) {
        updateUser(res.data);
        toast.success('Profile updated');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setIsChanging(true);
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password changed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden mt-16">
      <div className="relative z-10 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl">
                <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-1 text-cyan-400 text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium tracking-wide uppercase">Account Center</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Profile Settings</h1>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <form onSubmit={handleSave} className="rounded-2xl p-6 sm:p-7 space-y-5 bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 shadow-xl shadow-black/10">
              <div className="flex items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Personal Information</h2>
                    <p className="text-xs text-gray-400">Update your profile and contact details</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full rounded-xl px-4 py-2.5 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                <input value={user?.email || ''} disabled className="w-full rounded-xl px-4 py-2.5 bg-gray-800/50 text-gray-400 border border-gray-700/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" className="w-full rounded-xl px-4 py-2.5 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isSaving} className="px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl disabled:opacity-60">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <form onSubmit={handleChangePassword} className="rounded-2xl p-6 sm:p-7 space-y-5 bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 shadow-xl shadow-black/10">
              <div className="flex items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Change Password</h2>
                    <p className="text-xs text-gray-400">Use a strong password you don’t use elsewhere</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-xl px-4 py-2.5 pr-12 bg-gray-800/70 text-white placeholder-gray-400 border border-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(v => !v)}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(v => !v)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
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
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isChanging} className="px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2 bg-gray-900 hover:bg-black border border-gray-700/60 disabled:opacity-60">
                  {isChanging ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 