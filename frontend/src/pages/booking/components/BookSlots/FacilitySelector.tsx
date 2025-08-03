import React from "react";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { Activity } from "./ActivitySelector";
import { getFacilitiesByActivity } from "../../../../services/partner-service/facilityService";
import { useQuery } from "@tanstack/react-query";

export interface Facility {
  id?: string;
  name: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
  activityId: string;
  start_price_per_hour: number;
  startTime: string; // Format: "HH:MM:SS" (e.g., "09:00:00")
  endTime: string; // Format: "HH:MM:SS" (e.g., "17:00:00")
  isAvailable?: boolean;
  isFillingFast?: boolean;
}

interface FacilitySelectorProps {
  selectedActivity: Activity | null;
  selectedFacility: Facility | null;
  onFacilitySelect: (
    facility: Facility,
    selectedActivity: Activity | null
  ) => void;
  onResetSelection: (refetchFacilities: () => void) => void;
}

const FacilitySelector: React.FC<FacilitySelectorProps> = ({
  selectedActivity,
  selectedFacility,
  onFacilitySelect,
  onResetSelection,
}) => {
  const {
    data: facilities,
    isLoading,
    error,
    refetch: refetchFacilities,
  } = useQuery({
    queryKey: ["facilities", selectedActivity?.id],
    queryFn: () => getFacilitiesByActivity(selectedActivity?.id || ""),
    enabled: !!selectedActivity?.id, // Only fetch when activity is selected
  });

  // Skeleton component for facility cards
  const FacilitySkeleton = () => (
    <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-36 bg-gray-200 rounded-t-2xl"></div>

      <div className="p-1 px-3">
        {/* Facility name skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>

        {/* Price skeleton */}
        <div className="flex items-center justify-between mb-1">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>

        {/* Time skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-1 w-24"></div>

        {/* Status skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
      </div>
    </div>
  );

  if (!selectedActivity) {
    return (
      <div className="space-y-6 bg-white rounded-xl px-8 pt-6 pb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Choose an facility
        </h3>
        <p className="text-gray-600">
          Please select an activity to view available facilities.
        </p>
      </div>
    );
  }

  if (selectedFacility) {
    return (
      <div className="space-y-6 bg-white rounded-xl p-4 lg:px-8 lg:py-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">
            Selected Facility
          </h3>
          <button
            onClick={() => onResetSelection(refetchFacilities)}
            className="flex items-center text-green-600 hover:text-green-700 text-xs lg:text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
            Change Facility
          </button>
        </div>

        <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-green-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
          {/* Image Carousel */}
          {selectedFacility.images && selectedFacility.images.length > 0 ? (
            <div className="relative h-full max-h-36 overflow-hidden rounded-t-2xl">
              <div className="flex transition-transform duration-300 ease-in-out">
                <img
                  src={selectedFacility?.images?.[0] || ""}
                  alt={`${selectedFacility?.name}`}
                  className="w-full h-full object-cover flex-shrink-0"
                />
              </div>
            </div>
          ) : (
            <div className="relative h-36 rounded-t-2xl bg-gray-200 flex items-center justify-center">
              <ImageIcon className="h-20 w-12 text-gray-500" />
            </div>
          )}

          <div className="p-2 px-3">
            <h4 className="text-lg font-semibold text-gray-900">
              {selectedFacility.name}
            </h4>
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl font-bold text-gray-900">
                ₹{selectedFacility.start_price_per_hour}
              </span>
              <span className="text-sm text-gray-500">onwards</span>
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {selectedFacility.startTime} - {selectedFacility.endTime}
            </div>
            <div className="text-sm text-blue-600 font-medium mb-2">
              {selectedFacility.isAvailable
                ? "Available"
                : selectedFacility.isFillingFast
                ? "Filling Fast"
                : "Not Available"}
            </div>
            <div className="text-sm text-green-600 font-medium flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Selected
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-6 bg-white rounded-xl p-2 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">
          Choose a Facility
        </h3>
        {selectedFacility && (
          <button
            onClick={() => onResetSelection(refetchFacilities)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Change Facility
          </button>
        )}
      </div>

      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {isLoading || error ? (
          // Show skeleton loading cards
          <>
            <FacilitySkeleton />
            <FacilitySkeleton />
            <FacilitySkeleton />
          </>
        ) : facilities && facilities.length > 0 ? (
          // Show actual facility cards
          facilities.map((facility: Facility) => (
            <div
              key={facility.id}
              onClick={() => onFacilitySelect(facility, selectedActivity)}
              className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
            >
              {/* Image Carousel */}
              {facility.images && facility.images.length > 0 ? (
                <div className="relative h-full max-h-36 overflow-hidden rounded-t-2xl">
                  <div className="flex transition-transform duration-300 ease-in-out">
                    <img
                      src={facility?.images?.[0] || ""}
                      alt={`${facility?.name}`}
                      className="w-full h-full object-cover flex-shrink-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative h-36 rounded-t-2xl bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-500" />
                </div>
              )}

              <div className="p-2 px-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  {facility.name}
                </h4>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{facility.start_price_per_hour}
                  </span>
                  <span className="text-sm text-gray-500">onwards</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {facility.startTime} - {facility.endTime}
                </div>
                <div className="text-sm text-blue-600 font-medium mb-2">
                  {facility.isAvailable
                    ? "Available"
                    : facility.isFillingFast
                    ? "Filling Fast"
                    : "Not Available"}
                </div>
              </div>
            </div>
          ))
        ) : (
          // Show no facilities message
          <div className="flex-shrink-0 w-80 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <div className="flex flex-col p-4 h-full text-center">
              <div className="text-gray-600 text-lg font-semibold mb-2">
                No Facilities Available
              </div>
              <div className="text-gray-500 text-sm">
                No facilities found for this activity.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilitySelector;
