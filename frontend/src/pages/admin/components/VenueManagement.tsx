import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Edit, Trash2, Building, MapPin, Phone, Star, X,  } from 'lucide-react';
import { AdminComponentProps } from '../types/adminTypes';
import { getStatusColor, getStatusIcon } from '../utils/statusUtils';
import { adminService } from '../../../services/adminService';
import { Venue } from '../../../types';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import ModalPortal from '../../../components/common/ModalPortal';
import { toast } from 'react-hot-toast';

const VenueManagement: React.FC<AdminComponentProps> = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [partners, setPartners] = useState<{ [key: string]: any }>({});
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewVenue, setViewVenue] = useState<Venue | null>(null);

  const fetchPartnerDetails = useCallback(async () => {
    try {
      console.log('🔄 Fetching partner details...');
      const partnersData = await adminService.getPartners();
      
      // Create a map of partner ID to partner info
      const partnersMap: {[key: string]: any} = {};
      partnersData.forEach(partner => {
        partnersMap[partner.id] = partner;
      });
      
      setPartners(partnersMap);
      setAllPartners(partnersData);
      console.log(`✅ Loaded partner details for ${partnersData.length} partners`);
    } catch (err) {
      console.error('❌ Failed to fetch partner details:', err);
    }
  }, []);

  const fetchVenues = useCallback(async () => {
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
  }, [selectedPartnerId]);

  useEffect(() => {
    // Fetch partners list on component mount for dropdown
    fetchPartnerDetails();
  }, [fetchPartnerDetails]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

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
                        <div className="text-sm text-gray-300 space-y-1">
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
                          {venue.membership ? (
                            <div className="text-xs text-blue-300">
                              <span className="text-gray-400">Membership:</span> {venue.membership.planName}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">Membership: None</div>
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
                          {/* <DollarSign className="h-4 w-4 mr-1" /> */}
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
                          <button className="p-1 text-blue-400 hover:text-blue-300" onClick={() => setViewVenue(venue)}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-green-400 hover:text-green-300">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-400 hover:text-red-300" onClick={() => setConfirmDelete({ id: venue.id!, name: venue.name })}>
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
      <DeleteConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            setDeletingId(confirmDelete.id);
            await adminService.deleteVenue(confirmDelete.id);
            setVenues(prev => prev.filter(v => v.id !== confirmDelete.id));
            toast.success('Venue deleted successfully');
          } catch (error: any) {
            console.error('Error deleting venue:', error);
            toast.error(error?.response?.data?.message || 'Failed to delete venue');
          } finally {
            setDeletingId(null);
            setConfirmDelete(null);
          }
        }}
        title="Delete Venue"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This will remove all associated data.`}
        isLoading={!!deletingId}
      />
      {viewVenue && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) setViewVenue(null); }}>
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl overflow-y-auto max-h-[90vh]">
              <button onClick={() => setViewVenue(null)} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Venue Details</h3>
                <p className="text-sm text-gray-600">Full information about the selected venue</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Name</div>
                  <div className="text-sm">{viewVenue.name}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Phone</div>
                  <div className="text-sm">{viewVenue.phone}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-semibold text-gray-900">Address</div>
                  <div className="text-sm">{viewVenue.location?.address}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">City</div>
                  <div className="text-sm">{viewVenue.location?.city}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">State</div>
                  <div className="text-sm">{viewVenue.location?.state}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Price/Hour</div>
                  <div className="text-sm">{formatPrice(viewVenue.start_price_per_hour)}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Status</div>
                  <div className="text-sm">{viewVenue.approved ? 'Approved' : 'Pending'}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Rating</div>
                  <div className="text-sm flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    {viewVenue.rating || 0} ({viewVenue.totalReviews || 0})
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Created</div>
                  <div className="text-sm">{viewVenue.createdAt ? new Date(viewVenue.createdAt).toLocaleString() : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Updated</div>
                  <div className="text-sm">{viewVenue.updatedAt ? new Date(viewVenue.updatedAt).toLocaleString() : 'N/A'}</div>
                </div>
                {viewVenue.mapLocationLink && (
                  <div className="md:col-span-2">
                    <div className="text-sm font-semibold text-gray-900">Map Location</div>
                    <a
                      href={viewVenue.mapLocationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {viewVenue.mapLocationLink}
                    </a>
                  </div>
                )}
                {viewVenue.membership && (
                  <div className="md:col-span-2 rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-900">Membership</div>
                    <div className="text-sm">Plan: {viewVenue.membership.planName} | Active: {viewVenue.membership.isActive ? 'Yes' : 'No'}</div>
                  </div>
                )}
              </div>

              {viewVenue.description && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-900">Description</div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">{viewVenue.description}</div>
                </div>
              )}

              {viewVenue.highlight && (
                <div className="mt-3">
                  <div className="text-sm font-semibold text-gray-900">Highlight</div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">{viewVenue.highlight}</div>
                </div>
              )}

              {Array.isArray(viewVenue.features) && viewVenue.features.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-semibold text-gray-900 mb-1">Features</div>
                  <div className="flex flex-wrap gap-2">
                    {viewVenue.features.map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded border border-gray-200">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(viewVenue.images) && viewVenue.images.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Images</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {viewVenue.images.slice(0, 6).map((img, idx) => (
                      <img key={idx} src={img} alt={`venue-${idx}`} className="w-full h-24 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}

              {viewVenue.cancellationPolicy && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-900 mb-1">Cancellation Policy</div>
                  <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-48">
{JSON.stringify(viewVenue.cancellationPolicy, null, 2)}
                  </pre>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewVenue(null)} className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900">Close</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default VenueManagement; 