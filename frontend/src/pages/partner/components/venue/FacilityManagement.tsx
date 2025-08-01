import React, { useState } from "react";
import { Plus, Edit3, Trash2, Settings, Clock, DollarSign, Loader2, Image as ImageIcon } from "lucide-react";
import { Venue } from "../../../../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Activity,
  getActivitiesByVenue,
} from "../../../../services/partner-service/activityService";
import {
  Facility,
  FacilityFormData,
  createFacility,
  getFacilitiesByVenue,
  updateFacility,
  deleteFacility,
} from "../../../../services/partner-service/facilityService";

interface FacilityManagementProps {
  venue: Venue;
}

const FacilityManagement: React.FC<FacilityManagementProps> = ({ venue }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch activities from backend API
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', venue.id],
    queryFn: () => venue.id ? getActivitiesByVenue(venue.id) : Promise.resolve([]),
    enabled: !!venue.id,
  });

  // Fetch facilities from backend API
  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['facilities', venue.id],
    queryFn: () => venue.id ? getFacilitiesByVenue(venue.id) : Promise.resolve([]),
    enabled: !!venue.id,
  });

  const createFacilityMutation = useMutation({
    mutationFn: async (data: FacilityFormData) => {
      return createFacility(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', venue.id] });
      setIsAddModalOpen(false);
      toast.success('Facility created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating facility:', error);
      toast.error(error?.response?.data?.message || 'Failed to create facility');
    }
  });

  const updateFacilityMutation = useMutation({
    mutationFn: async (data: { id: string; facility: FacilityFormData }) => {
      return updateFacility(data.id, data.facility);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', venue.id] });
      setIsEditModalOpen(false);
      setEditingFacility(null);
      toast.success('Facility updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating facility:', error);
      toast.error(error?.response?.data?.message || 'Failed to update facility');
    }
  });

  const deleteFacilityMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteFacility(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', venue.id] });
      toast.success('Facility deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Error deleting facility:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete facility');
    }
  });

  const handleCreateFacility = (data: FacilityFormData) => {
    createFacilityMutation.mutate(data);
  };

  const handleUpdateFacility = (data: FacilityFormData) => {
    if (editingFacility?.id) {
      updateFacilityMutation.mutate({ id: editingFacility.id, facility: data });
    }
  };

  const handleDeleteFacility = (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this facility? This will also delete all associated time slots.')) {
      deleteFacilityMutation.mutate(id);
    }
  };

  const filteredFacilities = selectedActivity === 'all' 
    ? facilities 
    : facilities.filter(f => f.activityId === selectedActivity);

  if (isLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Facilities</h2>
          <p className="text-gray-400 text-sm">
            Configure courts, fields, and facility details for each activity
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Activities</option>
            {activities.map((activity: Activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {/* Facilities Grid */}
      {filteredFacilities.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <Settings className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Facilities Yet</h3>
          <p className="text-gray-400 mb-4">
                      {selectedActivity === 'all' 
            ? 'Add facilities like Court 1, Court 2, Cricket Ground, etc.'
            : `No facilities found for ${activities.find((a: Activity) => a.id === selectedActivity)?.name}`
          }
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Facility
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
            >
              {/* Facility Header */}
              <div className="relative h-48 bg-gray-700 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-500" />
                {facility.isFillingFast && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                    Filling Fast
                  </div>
                )}
                {!facility.isAvailable && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Unavailable
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {facility.name}
                    </h3>
                    <p className="text-blue-400 text-sm">{facility.activityName}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingFacility(facility);
                        setIsEditModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFacility(facility.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400 text-sm">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>₹{facility.start_price_per_hour}/hour</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      facility.isAvailable 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {facility.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{facility.startTime} - {facility.endTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Facility Modal */}
      <FacilityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateFacility}
        title="Add New Facility"
        activities={activities}
        isLoading={createFacilityMutation.isPending}
      />

      {/* Edit Facility Modal */}
      <FacilityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFacility(null);
        }}
        onSubmit={handleUpdateFacility}
        title="Edit Facility"
        activities={activities}
        initialData={editingFacility ? {
          name: editingFacility.name,
          activityId: editingFacility.activityId,
          start_price_per_hour: editingFacility.start_price_per_hour,
          startTime: editingFacility.startTime,
          endTime: editingFacility.endTime,
          isAvailable: editingFacility.isAvailable,
          isFillingFast: editingFacility.isFillingFast,
        } : undefined}
        isLoading={updateFacilityMutation.isPending}
      />
    </div>
  );
};

// Facility Modal Component
interface FacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FacilityFormData) => void;
  title: string;
  activities: Activity[];
  initialData?: FacilityFormData;
  isLoading?: boolean;
}

const FacilityModal: React.FC<FacilityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  activities,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FacilityFormData>(
    initialData || {
      name: '',
      activityId: '',
      start_price_per_hour: 0,
      startTime: '06:00',
      endTime: '23:00',
      isAvailable: true,
      isFillingFast: false,
    }
  );
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.activityId || formData.start_price_per_hour <= 0) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Facility Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Court 1, Cricket Ground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Activity
              </label>
              <select
                value={formData.activityId}
                onChange={(e) => setFormData(prev => ({ ...prev, activityId: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Activity</option>
                {activities.map((activity: Activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price per Hour (₹)
              </label>
              <input
                type="number"
                value={formData.start_price_per_hour}
                onChange={(e) => setFormData(prev => ({ ...prev, start_price_per_hour: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="399"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isAvailable" className="text-sm text-gray-300">
                Available for booking
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFillingFast"
                checked={formData.isFillingFast}
                onChange={(e) => setFormData(prev => ({ ...prev, isFillingFast: e.target.checked }))}
                className="rounded bg-gray-700 border-gray-600 text-yellow-600 focus:ring-yellow-500"
              />
              <label htmlFor="isFillingFast" className="text-sm text-gray-300">
                Mark as "Filling Fast"
              </label>
            </div>
          </div>



          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={isLoading || !formData.name || !formData.activityId || formData.start_price_per_hour <= 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save Facility'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacilityManagement;