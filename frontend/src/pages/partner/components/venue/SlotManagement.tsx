/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Plus, Edit3, Trash2, Calendar, DollarSign, Loader2, RotateCcw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Venue } from "../../../../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import {
  Facility,
  getFacilitiesByVenue,
} from "../../../../services/partner-service/facilityService";

import {
  Slot,
  SlotFormData,
  BulkSlotFormData,
  createSlot,
  createMultipleSlots,
  getSlotsByVenue,
  updateSlot,
  deleteSlot
} from "../../../../services/partner-service/slotService";

interface SlotModalFormData {
  facilityId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  amount: number;
  availability: 'available' | 'not_available' | 'booked' | 'filling_fast';
}

interface SlotManagementProps {
  venue: Venue;
}

// Helper function to validate 30-minute intervals
const isValidThirtyMinuteInterval = (time: string): boolean => {
  if (!time) return false;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) return false;

  const minutes = parseInt(time.split(':')[1], 10);
  return minutes === 0 || minutes === 30;
};

// Helper function to round time to nearest 30-minute interval
const roundToThirtyMinutes = (time: string): string => {
  if (!time) return time;
  const [hours, minutes] = time.split(':').map(Number);
  const roundedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0;
  const adjustedHours = minutes >= 45 ? (hours + 1) % 24 : hours;

  return `${adjustedHours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
};

// Helper function to convert time from HH:MM:SS to HH:MM format
const convertTimeToHHMM = (time: string): string => {
  if (!time) return time;

  const timeParts = time.split(':');

  // If time already in HH:MM format, return as is
  if (timeParts.length === 2) {
    return time;
  }

  // If time in HH:MM:SS format, remove seconds
  if (timeParts.length === 3) {
    const [hours, minutes] = timeParts;
    // Ensure hours and minutes are properly padded
    const paddedHours = hours.padStart(2, '0');
    const paddedMinutes = minutes.padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}`;
  }

  // For any other format, return as is
  console.warn('Unexpected time format:', time);
  return time;
};

const SlotManagement: React.FC<SlotManagementProps> = ({ venue }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkCreateModalOpen, setIsBulkCreateModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Toggle collapse state for a date section
  const toggleSectionCollapse = (date: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  // Helper function to ensure time format is HH:MM (backend expects this format)
  const formatTimeForBackend = (time: string): string => {
    if (!time) return time;
    // Convert HH:MM:SS to HH:MM by removing seconds
    const timeParts = time.split(':');
    if (timeParts.length === 3) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    // If already HH:MM format, return as is
    return time;
  };



  // Fetch facilities from backend API
  const { data: facilities = [], isLoading: facilitiesLoading } = useQuery({
    queryKey: ['facilities', venue.id],
    queryFn: () => venue.id ? getFacilitiesByVenue(venue.id) : Promise.resolve([]),
    enabled: !!venue.id,
  });

  // Fetch slots from backend API
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['slots', venue.id, selectedFacility, selectedDateRange],
    queryFn: () => {
      if (!venue.id) return Promise.resolve([]);
      return getSlotsByVenue(venue.id, selectedDateRange.start, selectedDateRange.end);
    },
    enabled: !!venue.id,
  });

  const createSlotMutation = useMutation({
    mutationFn: async (data: SlotModalFormData) => {
      console.log('Original slot data for creation:', data);

      // Validate required fields
      if (!data.startDate || !data.facilityId || !data.startTime || !data.endTime || !data.amount) {
        throw new Error('All fields are required');
      }

      // Validate 30-minute intervals
      if (!isValidThirtyMinuteInterval(data.startTime)) {
        throw new Error('Start time must be in 30-minute intervals (e.g., 09:00, 09:30, 10:00)');
      }
      if (!isValidThirtyMinuteInterval(data.endTime)) {
        throw new Error('End time must be in 30-minute intervals (e.g., 09:00, 09:30, 10:00)');
      }

      const slotData: SlotFormData = {
        date: data.startDate,
        startTime: formatTimeForBackend(data.startTime),
        endTime: formatTimeForBackend(data.endTime),
        amount: data.amount,
        availability: data.availability,
        facilityId: data.facilityId,
      };

      console.log('Formatted slot data being sent to backend for creation:', slotData);
      return createSlot(slotData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots', venue.id] });
      setIsAddModalOpen(false);
      toast.success('Slot created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating slot:', error);
      toast.error(error?.response?.data?.message || 'Failed to create slot');
    }
  });

  const createBulkSlotsMutation = useMutation({
    mutationFn: async (data: SlotModalFormData) => {
      console.log('Original bulk slot data:', data);

      // Validate required fields for bulk creation
      if (!data.startDate || !data.endDate || !data.facilityId || !data.startTime || !data.endTime || !data.amount) {
        throw new Error('All fields are required for bulk creation');
      }

      // Validate 30-minute intervals for bulk creation
      if (!isValidThirtyMinuteInterval(data.startTime)) {
        throw new Error('Start time must be in 30-minute intervals (e.g., 09:00, 09:30, 10:00)');
      }
      if (!isValidThirtyMinuteInterval(data.endTime)) {
        throw new Error('End time must be in 30-minute intervals (e.g., 09:00, 09:30, 10:00)');
      }

      const bulkData: BulkSlotFormData = {
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: formatTimeForBackend(data.startTime),
        endTime: formatTimeForBackend(data.endTime),
        amount: data.amount,
        availability: data.availability,
        facilityId: data.facilityId,
      };

      console.log('Formatted bulk creation data being sent to backend:', bulkData);
      return createMultipleSlots(data.facilityId, bulkData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['slots', venue.id] });
      setIsBulkCreateModalOpen(false);
      toast.success(`Successfully created ${data?.data?.count || 'multiple'} slots!`);
    },
    onError: (error: any) => {
      console.error('Error creating bulk slots:', error);
      toast.error(error?.response?.data?.message || 'Failed to create bulk slots');
    }
  });

  const updateSlotMutation = useMutation({
    mutationFn: async (data: { id: string; slot: Partial<SlotModalFormData> }) => {
      console.log('Original slot data for update:', data.slot);

      const slotData: Partial<SlotFormData> = {
        date: data.slot.startDate,
        startTime: data.slot.startTime ? formatTimeForBackend(data.slot.startTime) : undefined,
        endTime: data.slot.endTime ? formatTimeForBackend(data.slot.endTime) : undefined,
        amount: data.slot.amount,
        availability: data.slot.availability,
        facilityId: data.slot.facilityId, // This is required for update
      };

      console.log('Formatted slot data being sent to backend:', slotData);
      return updateSlot(data.id, slotData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots', venue.id] });
      setIsEditModalOpen(false);
      setEditingSlot(null);
      toast.success('Slot updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating slot:', error);
      toast.error(error?.response?.data?.message || 'Failed to update slot');
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteSlot(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots', venue.id] });
      toast.success('Slot deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Error deleting slot:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete slot');
    }
  });

  const handleCreateSlot = (data: SlotModalFormData) => {
    console.log('handleCreateSlot called with data:', data);
    console.log('This should trigger single slot creation mutation');
    createSlotMutation.mutate(data);
  };

  const handleCreateBulkSlots = (data: SlotModalFormData) => {
    console.log('handleCreateBulkSlots called with data:', data);
    console.log('This should trigger bulk creation mutation');
    createBulkSlotsMutation.mutate(data);
  };

  const handleUpdateSlot = (data: Partial<SlotModalFormData>) => {
    if (editingSlot?.id) {
      updateSlotMutation.mutate({ id: editingSlot.id, slot: data });
    }
  };

  const handleDeleteSlot = (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this slot?')) {
      deleteSlotMutation.mutate(id);
    }
  };

  const getAvailabilityColor = (availability: Slot['availability']) => {
    switch (availability) {
      case 'available':
        return 'bg-green-600/20 text-green-400';
      case 'booked':
        return 'bg-red-600/20 text-red-400';
      case 'filling_fast':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'not_available':
        return 'bg-gray-600/20 text-gray-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getAvailabilityText = (availability: Slot['availability']) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'booked':
        return 'Booked';
      case 'filling_fast':
        return 'Filling Fast';
      case 'not_available':
        return 'Not Available';
      default:
        return 'Unknown';
    }
  };

  const filteredSlots = selectedFacility === 'all'
    ? slots
    : slots.filter(s => s.facilityId === selectedFacility);

  // Group slots by date for better display
  const slotsByDate = filteredSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  if (isLoading || facilitiesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Time Slots</h2>
          <p className="text-gray-400 text-sm">
            Set up booking time slots and availability for your facilities
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Facilities</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name} ({facility.activityName})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDateRange.start}
            onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />

          <input
            type="date"
            value={selectedDateRange.end}
            onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={() => setIsBulkCreateModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Bulk Create</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Collapse/Expand All Controls - Only show when there are slots */}
      {Object.keys(slotsByDate).length > 1 && (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setCollapsedSections(new Set(Object.keys(slotsByDate)))}
            className="text-gray-400 hover:text-white text-sm px-3 py-1 hover:bg-gray-700 rounded transition-colors"
          >
            Collapse All
          </button>
          <button
            onClick={() => setCollapsedSections(new Set())}
            className="text-gray-400 hover:text-white text-sm px-3 py-1 hover:bg-gray-700 rounded transition-colors"
          >
            Expand All
          </button>
        </div>
      )}

      {/* Slots Display */}
      {Object.keys(slotsByDate).length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Slots Available</h3>
          <p className="text-gray-400 mb-4">
            Create time slots for your facilities to start accepting bookings.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setIsBulkCreateModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Bulk Create Slots
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Individual Slot
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(slotsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateSlots]) => {
              const isCollapsed = collapsedSections.has(date);
              return (
                <div key={date} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  <div 
                    className="p-6 pb-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors border-b border-gray-700/50"
                    onClick={() => toggleSectionCollapse(date)}
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400">
                        {dateSlots.length} slot{dateSlots.length !== 1 ? 's' : ''}
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {dateSlots
                          .sort((a: Slot, b: Slot) => a.startTime.localeCompare(b.startTime))
                          .map((slot: Slot) => (
                      <div
                        key={slot.id}
                        className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-white font-medium">
                              {convertTimeToHHMM(slot.startTime)} - {convertTimeToHHMM(slot.endTime)}
                            </div>
                            <div className="text-blue-400 text-sm">
                              {slot.facilityName}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {slot.activityName}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setEditingSlot(slot);
                                setIsEditModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-gray-400 hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-400 text-sm">
                              <DollarSign className="h-3 w-3 mr-1" />
                              <span>₹{slot.amount}</span>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(slot.availability)}`}>
                              {getAvailabilityText(slot.availability)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Add Single Slot Modal */}
      <SlotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateSlot}
        title="Add New Slot"
        facilities={facilities}
        isLoading={createSlotMutation.isPending}
        isBulk={false}
      />

      {/* Bulk Create Slots Modal */}
      <SlotModal
        isOpen={isBulkCreateModalOpen}
        onClose={() => setIsBulkCreateModalOpen(false)}
        onSubmit={handleCreateBulkSlots}
        title="Bulk Create Slots"
        facilities={facilities}
        isLoading={createBulkSlotsMutation.isPending}
        isBulk={true}
      />

      {/* Edit Slot Modal */}
      <SlotModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSlot(null);
        }}
        onSubmit={(data) => handleUpdateSlot(data)}
        title="Edit Slot"
        facilities={facilities}
        initialData={editingSlot ? (() => {
          console.log('Creating initialData for editing slot:', editingSlot);
          const initialData = {
            facilityId: editingSlot.facilityId,
            startDate: editingSlot.date,
            endDate: editingSlot.date,
            startTime: convertTimeToHHMM(editingSlot.startTime),
            endTime: convertTimeToHHMM(editingSlot.endTime),
            amount: editingSlot.amount,
            availability: editingSlot.availability,
          };
          console.log('Processed initialData:', initialData);
          return initialData;
        })() : undefined}
        isLoading={updateSlotMutation.isPending}
        isBulk={false}
      />
    </div>
  );
};

// Slot Modal Component
interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SlotModalFormData) => void;
  title: string;
  facilities: Facility[];
  initialData?: SlotModalFormData;
  isLoading?: boolean;
  isBulk?: boolean;
}

const SlotModal: React.FC<SlotModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  facilities,
  initialData,
  isLoading = false,
  isBulk = false,
}) => {
  const [formData, setFormData] = useState<SlotModalFormData>(
    initialData || {
      facilityId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      amount: 0,
      availability: 'available',
    }
  );

  React.useEffect(() => {
    if (initialData) {
      console.log('SlotModal - Setting initial data:', initialData);
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('SlotModal handleSubmit called');
    console.log('isBulk:', isBulk);
    console.log('Form data:', formData);

    // Validate required fields
    if (!formData.facilityId) {
      alert('Please select a facility');
      return;
    }
    if (!formData.startDate) {
      alert('Please select a start date');
      return;
    }
    if (isBulk && !formData.endDate) {
      alert('Please select an end date for bulk creation');
      return;
    }
    if (isBulk && formData.startDate > formData.endDate) {
      alert('End date must be after or equal to start date');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      alert('Please select start and end times');
      return;
    }
    if (!isValidThirtyMinuteInterval(formData.startTime)) {
      console.error('Start time validation failed for:', formData.startTime);
      alert('Start time must be in 30-minute intervals (e.g., 09:00, 09:30, 10:00)');
      return;
    }
    if (!isValidThirtyMinuteInterval(formData.endTime)) {
      console.error('End time validation failed for:', formData.endTime);
      alert('End time must be in 30-minute intervals (e.g., 09:00, 09:30, 10:00)');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      alert('End time must be after start time');
      return;
    }
    if (formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    console.log('Submitting form data:', { ...formData, isBulk });
    console.log('About to call onSubmit with mode:', isBulk ? 'BULK' : 'SINGLE');
    onSubmit(formData);
  };

  const selectedFacility = facilities.find(f => f.id === formData.facilityId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Facility
            </label>
            <select
              value={formData.facilityId}
              onChange={(e) => {
                const facility = facilities.find(f => f.id === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  facilityId: e.target.value,
                  amount: facility?.start_price_per_hour || 0
                }));
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Facility</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name} ({facility.activityName})
                </option>
              ))}
            </select>
          </div>

          {isBulk ? (
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Bulk Creation Mode</h4>
                  <p className="text-blue-300 text-sm">
                    This will create 30-minute slots for all days between the selected date range
                    during the specified time period. For example: 09:00-17:00 will create slots
                    from 09:00-09:30, 09:30-10:00, 10:00-10:30, etc.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isBulk ? 'Start Date' : 'Date'}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {isBulk && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => {
                  const roundedTime = roundToThirtyMinutes(e.target.value);
                  setFormData(prev => ({ ...prev, startTime: roundedTime }));
                }}
                step="1800"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Only 30-minute intervals (e.g., 09:00, 09:30)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => {
                  const roundedTime = roundToThirtyMinutes(e.target.value);
                  setFormData(prev => ({ ...prev, endTime: roundedTime }));
                }}
                step="1800"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Only 30-minute intervals (e.g., 09:00, 09:30)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="399"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value as SlotModalFormData['availability'] }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="available">Available</option>
                <option value="not_available">Not Available</option>
                <option value="filling_fast">Filling Fast</option>
                <option value="booked">Booked</option>
              </select>
            </div>
          </div>

          {selectedFacility && (
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-300">
                <div>Facility Hours: {selectedFacility.startTime} - {selectedFacility.endTime}</div>
                <div>Base Price: ₹{selectedFacility.start_price_per_hour}/hour</div>
              </div>
            </div>
          )}

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
              disabled={isLoading || !formData.facilityId || formData.amount <= 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isBulk ? 'Create Slots' : 'Save Slot'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SlotManagement;