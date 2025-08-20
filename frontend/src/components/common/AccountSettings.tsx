import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

interface AccountSettingsProps {
  variant?: 'light' | 'dark';
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ variant = 'dark' }) => {
  const { user, updateUser, getProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    getProfile().catch(() => {});
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

  const isDark = variant === 'dark';
  const card = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const label = isDark ? 'text-gray-300' : 'text-gray-700';
  const input = isDark
    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500'
    : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className={`${card} rounded-xl p-6 space-y-4`}>
        <h2 className={`text-lg font-semibold ${heading}`}>Account</h2>
        <div>
          <label className={`block text-sm font-medium mb-2 ${label}`}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${input}`} />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${label}`}>Email</label>
          <input value={user?.email || ''} disabled className={`w-full rounded-lg border px-4 py-2 ${isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-200'}`} />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${label}`}>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${input}`} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <form onSubmit={handleChangePassword} className={`${card} rounded-xl p-6 space-y-4`}>
        <h2 className={`text-lg font-semibold ${heading}`}>Change Password</h2>
        <div>
          <label className={`block text-sm font-medium mb-2 ${label}`}>Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${input}`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${label}`}>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${input}`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${label}`}>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${input}`} />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isChanging} className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60">
            {isChanging ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;


