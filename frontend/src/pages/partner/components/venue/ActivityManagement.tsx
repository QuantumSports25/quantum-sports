import React, { useState } from "react";
import { Plus, Edit3, Trash2, Users, Tag,  Loader2 } from "lucide-react";
import { Venue } from "../../../../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Activity,
  // ActivityFormData,
  createActivity,
  getActivitiesByVenue,
  updateActivity,
  deleteActivity,
} from "../../../../services/partner-service/activityService";

interface ActivityModalFormData {
  name: string;
  tags: string[];
  start_price_per_hour: number;
}

interface ActivityManagementProps {
  venue: Venue;
}

const ActivityManagement: React.FC<ActivityManagementProps> = ({ venue }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch activities from backend API
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', venue.id],
    queryFn: () => venue.id ? getActivitiesByVenue(venue.id) : Promise.resolve([]),
    enabled: !!venue.id,
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: ActivityModalFormData) => {
      if (!venue.id) throw new Error('Venue ID is required');
      return createActivity({ ...data, venueId: venue.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', venue.id] });
      setIsAddModalOpen(false);
      toast.success('Activity created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating activity:', error);
      toast.error(error?.response?.data?.message || 'Failed to create activity');
    }
  });

  const updateActivityMutation = useMutation({
    mutationFn: async (data: { id: string; activity: ActivityModalFormData }) => {
      return updateActivity(data.id, data.activity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', venue.id] });
      setIsEditModalOpen(false);
      setEditingActivity(null);
      toast.success('Activity updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating activity:', error);
      toast.error(error?.response?.data?.message || 'Failed to update activity');
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteActivity(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', venue.id] });
      toast.success('Activity deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Error deleting activity:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete activity');
    }
  });

  const handleCreateActivity = (data: ActivityModalFormData) => {
    createActivityMutation.mutate(data);
  };

  const handleUpdateActivity = (data: ActivityModalFormData) => {
    if (editingActivity?.id) {
      updateActivityMutation.mutate({ id: editingActivity.id, activity: data });
    }
  };

  const handleDeleteActivity = (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this activity?')) {
      deleteActivityMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Activities</h2>
          <p className="text-gray-400 text-sm">
            Manage sports and activities available at your venue
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Activities Grid */}
      {activities.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Activities Yet</h3>
          <p className="text-gray-400 mb-4">
            Start by adding activities like Football, Cricket, Tennis, etc.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Activity
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity: Activity) => (
            <div
              key={activity.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {activity.name}
                  </h3>
                  <div className="flex items-center text-gray-400 text-sm">
                    {/* <DollarSign className="h-4 w-4 mr-1" /> */}
                    <span>₹{activity.start_price_per_hour}/hour</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingActivity(activity);
                      setIsEditModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>Features</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Activity Modal */}
      <ActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateActivity}
        title="Add New Activity"
        isLoading={createActivityMutation.isPending}
      />

      {/* Edit Activity Modal */}
      <ActivityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingActivity(null);
        }}
        onSubmit={handleUpdateActivity}
        title="Edit Activity"
        initialData={editingActivity ? {
          name: editingActivity.name,
          tags: editingActivity.tags,
          start_price_per_hour: editingActivity.start_price_per_hour,
        } : undefined}
        isLoading={updateActivityMutation.isPending}
      />
    </div>
  );
};

// Activity Modal Component
interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActivityModalFormData) => void;
  title: string;
  initialData?: ActivityModalFormData;
  isLoading?: boolean;
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ActivityModalFormData>(
    initialData || {
      name: '',
      tags: [],
      start_price_per_hour: 0,
    }
  );
  const [newTag, setNewTag] = useState('');

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.start_price_per_hour <= 0) return;
    onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Activity Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Football, Cricket, Tennis"
              required
            />
          </div>

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
              Features/Tags
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Outdoor, Equipment Required"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-blue-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              disabled={isLoading || !formData.name || formData.start_price_per_hour <= 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save Activity'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityManagement;