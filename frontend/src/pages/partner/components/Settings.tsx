import React, { useEffect, useState } from 'react';
import AccountSettings from '../../../components/common/AccountSettings';
import { useAuthStore } from '../../../store/authStore';
import membershipService from '../../../services/membershipService';
import { getAllVenuesByPartner } from '../../../services/partner-service/venue-service/venueService';
import { Venue } from '../../../types';

const PartnerSettings: React.FC = () => {
  const { user } = useAuthStore();
  const partnerId = user?.id || '';
  const [, setMembershipInfo] = useState<any | null>(null);
  const [venuesCount, setVenuesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membershipsRes, venuesList] = await Promise.all([
          membershipService.getUserMemberships().catch(() => ({ success: false, data: [] } as any)),
          partnerId ? getAllVenuesByPartner(partnerId) : Promise.resolve([]),
        ]);

        const latestMembership = membershipsRes?.data?.[0] || null;
        setMembershipInfo(latestMembership);
        const arr = Array.isArray(venuesList) ? venuesList : [];
        setVenues(arr as Venue[]);
        setVenuesCount(arr.length);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [partnerId]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Partner Overview</h2>
        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Membership Plan</p>
              <p className="text-white font-medium mt-1">{membershipInfo?.plan?.name || 'No active plan'}</p>
              {membershipInfo && (
                <p className="text-gray-400 text-xs mt-1">Credits: {membershipInfo?.plan?.credits ?? 0}</p>
              )}
            </div> */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Venues</p>
              <p className="text-white font-medium mt-1">{venuesCount}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Role</p>
              <p className="text-white font-medium mt-1 capitalize">{user?.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Venues and their membership plans */}
      {!loading && venues.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Venues and Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="py-3 px-4 text-gray-400">Venue</th>
                  <th className="py-3 px-4 text-gray-400">Plan Name</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v.id} className="border-b border-gray-700">
                    <td className="py-3 px-4 text-white">{v.name}</td>
                    <td className="py-3 px-4 text-gray-300">{(v as any).membership?.planName || 'No plan'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-white">Account Settings</h2>
      <AccountSettings variant="dark" />
    </div>
  );
};

export default PartnerSettings;