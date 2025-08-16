import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Building, MapPin, Phone, Star, DollarSign } from 'lucide-react';
import { AdminComponentProps } from '../types/adminTypes';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import { adminService } from '../../../services/adminService';
import { Venue } from '../../../types';

const VenueManagement: React.FC<AdminComponentProps> = ({ mockData }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [partners, setPartners] = useState<{ [key: string]: any }>({});
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('all');

  useEffect(() => {
    fetchVenues();
  }, [selectedPartnerId]);

  useEffect(() => {
    // Fetch partners list on component mount for dropdown
    fetchPartnerDetails();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);

      let venuesData: Venue[] = [];

      if (selectedPartnerId === 'all') {
        console.log('🚀 Calling real API endpoint: /venue/get-all-venues');
        venuesData = await adminService.getAllVenues();
      } else {
        console.log(`🚀 Calling real API endpoint: /venue/get-all-venues-by-partner/ with partnerId: ${selectedPartnerId}`);
        venuesData = await adminService.getVenuesByPartner(selectedPartnerId);
      }

      if (venuesData.length > 0) {
        setVenues(venuesData);
        console.log(`✅ Loaded ${venuesData.length} venues from API`);

        // Partner details are already fetched in useEffect, no need to fetch again
      } else {
        const message = selectedPartnerId === 'all'
          ? 'No venues found. This could mean: 1) No venues are registered, 2) API endpoint issue, or 3) Database connection problem.'
          : `No venues found for the selected partner. This partner may not have any venues registered yet.`;
        setError(message);
        setVenues([]);
      }
    } catch (err) {
      console.error('❌ API call failed:', err);
      setError('Failed to fetch venues from API. Check browser console for details.');
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerDetails = async () => {
    try {
      console.log('🔄 Fetching partner details...');
      const partnersData = await adminService.getPartners();

      // Create a map of partner ID to partner info
      const partnersMap: { [key: string]: any } = {};
      partnersData.forEach(partner => {
        partnersMap[partner.id] = partner;
      });

      setPartners(partnersMap);
      setAllPartners(partnersData);
      console.log(`✅ Loaded partner details for ${partnersData.length} partners`);
    } catch (err) {
      console.error('❌ Failed to fetch partner details:', err);
    }
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'approved') return matchesSearch && venue.approved;
    if (selectedFilter === 'pending') return matchesSearch && !venue.approved;

    return matchesSearch;
  });

  const getVenueStatus = (venue: Venue): 'active' | 'pending' | 'blocked' => {
    return venue.approved ? 'active' : 'pending';
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading && venues.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-white">Loading venues...</span>
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
            <h3 className="text-lg font-semibold text-white">Venue Management</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
              >
                <option value="all">All Partners</option>
                {allPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'approved' | 'pending')}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
              <button
                onClick={fetchVenues}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Venue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price/Hour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredVenues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    {loading ? 'Loading...' : 'No venues found'}
                  </td>
                </tr>
              ) : (
                filteredVenues.map((venue) => {
                  const status = getVenueStatus(venue);
                  const StatusIcon = getStatusIcon(status);
                  const partner = partners[venue.partnerId];
                  return (
                    <tr key={venue.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                            <Building className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{venue.name}</div>
                            <div className="text-sm text-gray-400 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {venue.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {partner ? (
                            <div>
                              <div className="font-medium text-white">{partner.name}</div>
                              <div className="text-xs text-gray-400">{partner.email}</div>
                            </div>
                          ) : (
                            <div className="text-gray-400">
                              <div>Partner ID: {venue.partnerId}</div>
                              <div className="text-xs">Details loading...</div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {venue.location?.city || 'Unknown'}, {venue.location?.state || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {venue.location?.address || 'No address'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatPrice(venue.start_price_per_hour)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          {venue.rating || 0} ({venue.totalReviews || 0})
                        </div>
                      </td>
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

        {filteredVenues.length > 0 && (
          <div className="px-6 py-4 bg-gray-700/30 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} of {venues.length} total
                {selectedPartnerId !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-blue-600 rounded text-xs">
                    Partner: {partners[selectedPartnerId]?.name || 'Loading...'}
                  </span>
                )}
                {selectedFilter !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-gray-600 rounded text-xs">
                    Status: {selectedFilter}
                  </span>
                )}
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

export default VenueManagement; 