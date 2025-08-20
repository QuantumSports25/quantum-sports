import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, User as UserIcon, X, Phone, Mail } from 'lucide-react';
import { AdminComponentProps } from '../types/adminTypes';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import { adminService } from '../../../services/adminService';
import { User } from '../../../types';
import { toast } from 'react-hot-toast';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import ModalPortal from '../../../components/common/ModalPortal';

const UserManagement: React.FC<AdminComponentProps> = ({ mockData }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Calling real API endpoint: /auth/users?role=user');
      const usersData = await adminService.getAllUsers();

      // Filter only regular users (not partners)
      const regularUsers = usersData.filter(user => user.role === 'user');

      if (regularUsers.length > 0) {
        setUsers(regularUsers);
        console.log(`✅ Loaded ${regularUsers.length} users from API`);
      } else {
        setError('No users found. This could mean: 1) No users are registered, 2) Backend pagination bug is preventing data return, or 3) API endpoint issue.');
        setUsers([]);
      }
    } catch (err) {
      console.error('❌ API call failed:', err);
      setError('Failed to fetch users from API. Check browser console for details.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserStatus = (user: User): 'active' | 'pending' | 'blocked' => {
    // For now, use a simple logic - can be enhanced based on backend status
    return 'active'; // Default status
  };

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-white">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeletingId(userId);
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-xl">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">User Management</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchUsers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Users
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border-l-4 border-red-500">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    {loading ? 'Loading...' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const status = getUserStatus(user);
                  const StatusIcon = getStatusIcon(status);
                  return (
                    <tr key={user.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 capitalize">{user.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{user.phone || 'Not provided'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="capitalize">{status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-blue-400 hover:text-blue-300" onClick={() => setViewUser(user)}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-green-400 hover:text-green-300">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ id: user.id, name: user.name })}
                            disabled={deletingId === user.id}
                            className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            {deletingId === user.id ? (
                              <span className="text-xs text-gray-400">Deleting...</span>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 bg-gray-700/30 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-600 text-gray-300 rounded hover:bg-gray-500 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm bg-gray-600 text-gray-300 rounded hover:bg-gray-500 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDeleteUser(confirmDelete.id)}
        title="Delete User"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        isLoading={!!deletingId}
      />
      {viewUser && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) setViewUser(null); }}>
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <button onClick={() => setViewUser(null)} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
                <p className="text-sm text-gray-600">Full information about the selected user</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">{viewUser.name}</div>
                    <div className="text-xs text-gray-500 capitalize">Role: {viewUser.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{viewUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{viewUser.phone || 'Not provided'}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewUser(null)} className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900">Close</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default UserManagement; 