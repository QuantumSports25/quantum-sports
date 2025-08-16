import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Building2 } from 'lucide-react';
import { AdminComponentProps } from '../types/adminTypes';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import { adminService } from '../../../services/adminService';
import { User } from '../../../types';

const PartnerManagement: React.FC<AdminComponentProps> = ({ mockData }) => {
  const [partners, setPartners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Calling real API endpoint: /auth/users/partner');
      const partnersData = await adminService.getPartners();
      
      if (partnersData.length > 0) {
        setPartners(partnersData);
        console.log(`✅ Loaded ${partnersData.length} partners from API`);
      } else {
        setError('No partners found. This could mean: 1) No partners are registered, 2) Backend pagination bug is preventing data return, or 3) API endpoint issue.');
        setPartners([]);
      }
    } catch (err) {
      console.error('❌ API call failed:', err);
      setError('Failed to fetch partners from API. Check browser console for details.');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPartnerStatus = (partner: User): 'active' | 'pending' | 'blocked' => {
    // For now, use a simple logic - can be enhanced based on backend status
    return 'active'; // Default status
  };

  if (loading && partners.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-white">Loading partners...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-xl">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Partner Management</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={fetchPartners}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Partners
              </button>
              <button 
                onClick={async () => {
                  try {
                    const users = await adminService.getAllUsers();
                    console.log('🎯 ALL USERS from API:', users);
                    
                    const usersByRole = users.reduce((acc, user) => {
                      acc[user.role] = (acc[user.role] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const summary = Object.entries(usersByRole)
                      .map(([role, count]) => `${role}: ${count}`)
                      .join(', ');
                    
                    alert(`Found ${users.length} total users (${summary}). Check console for full details.`);
                  } catch (err) {
                    console.error('❌ Error fetching users:', err);
                    alert('Error fetching users. Check console.');
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Show All Users
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    {loading ? 'Loading...' : 'No partners found'}
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => {
                  const status = getPartnerStatus(partner);
                  const StatusIcon = getStatusIcon(status);
                  return (
                    <tr key={partner.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{partner.name}</div>
                            <div className="text-sm text-gray-400">{partner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 capitalize">{partner.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{partner.phone || 'Not provided'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="capitalize">{status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-blue-400 hover:text-blue-300">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-green-400 hover:text-green-300">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-400 hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
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

        {filteredPartners.length > 0 && (
          <div className="px-6 py-4 bg-gray-700/30 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''}
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
    </div>
  );
};

export default PartnerManagement; 