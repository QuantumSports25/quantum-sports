import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, updateUser, getProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Load latest profile into store
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mt-12">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <div className="space-y-8">
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input value={user?.email || ''} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <form onSubmit={handleChangePassword} className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isChanging} className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60">
              {isChanging ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage; 