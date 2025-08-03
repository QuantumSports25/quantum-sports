import React, { useState, useEffect } from "react";
import DateFilter from "./DateFilter";
import SlotCard from "./SlotCard";
import { Sun, Moon } from "lucide-react";
import { Activity } from "./ActivitySelector";
import { Facility } from "./FacilitySelector";
import { useQuery } from "@tanstack/react-query";
import { getSlotsByFacility } from "../../../../services/partner-service/slotService";

export type SlotAvailability =
  | "available"
  | "not-available"
  | "booked"
  | "filling-fast";

export interface Slot {
  id?: string;
  date: Date | string; // Allow both Date object and string for flexibility
  amount: number;
  availability: SlotAvailability;
  startTime: string;
  endTime: string;
  bookingId?: string;
  facilityId: string; // Required field as per database schema
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SlotDataByDate {
  [date: string]: Slot[];
}

interface SlotSelectorProps {
  refetchSlots?: React.MutableRefObject<(() => void) | null>;
  selectedFacility: Facility | null;
  selectedActivity: Activity | null;
  selectedSlots?: Slot[]; // Add selectedSlots as optional prop
  onSlotSelect: (slot: Slot) => void;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({
  refetchSlots,
  selectedActivity,
  selectedFacility,
  selectedSlots = [], // Default to empty array
  onSlotSelect,
}) => {
  const {
    data: rawData,
    isLoading,
    error,
    refetch: refetchSlotsQuery,
  } = useQuery({
    queryKey: ["slots", selectedFacility?.id],
    queryFn: () => getSlotsByFacility(selectedFacility?.id || ""),
    enabled: !!selectedFacility?.id, // Only fetch when facility is selected
  });

  // Use useEffect to call the prop refetchSlots when we need to refetch
  React.useEffect(() => {
    if (refetchSlots) {
      // Replace the refetchSlots prop with our actual refetch function
      refetchSlots.current = refetchSlotsQuery;
    }
  }, [refetchSlotsQuery, refetchSlots]);

  // Skeleton component for slot grid
  const SlotSkeleton = () => (
    <div className="bg-white rounded-xl py-6">
      <div className="flex items-center justify-between mb-6 px-2 lg:px-8">
        <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">
          Select Time Slot
        </h3>
      </div>
      <div className="px-2 xl:px-8">
        <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl border-2 border-gray-200 animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );

  // Error component for slot grid
  const SlotError = () => (
    <div className="bg-white rounded-xl py-6">
      <div className="flex items-center justify-between mb-6 px-2 lg:px-8">
        <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">
          Select Time Slot
        </h3>
      </div>
      <div className="px-2 xl:px-8">
        <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-xl border-2 border-red-200">
          <div className="text-red-600 text-xl font-semibold mb-2">
            Error Loading Slots
          </div>
          <div className="text-red-500 text-sm mb-4 text-center">
            Failed to load time slots for this facility. Please try again.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  // Transform the flat array of slots into a date-grouped structure
  const data: SlotDataByDate = React.useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return {};

    const grouped: SlotDataByDate = {};
    rawData.forEach((slot: Slot) => {
      // Extract date string from the slot date
      const dateStr =
        slot.date instanceof Date
          ? slot.date.toISOString().split("T")[0]
          : new Date(slot.date).toISOString().split("T")[0];

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      // Ensure amount is a number
      const processedSlot = {
        ...slot,
        amount:
          typeof slot.amount === "string"
            ? parseFloat(slot.amount)
            : slot.amount,
      };

      grouped[dateStr].push(processedSlot);
    });

    // Sort slots within each date by startTime
    Object.keys(grouped).forEach((dateStr) => {
      grouped[dateStr].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [rawData]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!selectedFacility || !selectedActivity) {
    return (
      <div className="space-y-6 bg-white rounded-xl px-8 pt-6 pb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Select Time Slot
        </h3>
        <p className="text-gray-600">
          Please select a facility to view available slots.
        </p>
      </div>
    );
  }

  // Show loading skeleton
  if (isLoading) {
    return <SlotSkeleton />;
  }

  // Show error state
  if (error) {
    return <SlotError />;
  }

  // Generate timeLabels from the first available date in data
  const firstDateWithSlots = data
    ? Object.keys(data).find((date) => data[date] && data[date].length > 0)
    : null;
  const timeLabels =
    firstDateWithSlots && data
      ? data[firstDateWithSlots].map((slot: Slot) => slot.startTime)
      : [];

  // Prepare the visible dates for the grid (3 for mobile, 4 for desktop)
  const numVisibleDates = isMobile ? 3 : 4;
  const visibleDates = Array.from({ length: numVisibleDates }, (_, i) => {
    const dateObj = new Date(selectedDate);
    dateObj.setDate(selectedDate.getDate() + i);
    return dateObj.toISOString().split("T")[0];
  });

  return (
    <div className="bg-white rounded-xl py-6">
      <div className="flex items-center justify-between mb-6 px-2 lg:px-8">
        <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">
          Select Time Slot
        </h3>
      </div>

      <div className="px-2 xl:px-8">
        <DateFilter
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          filter={filter}
          onFilterChange={setFilter}
        />

        {/* Date Headers Row (outside scrollable area) */}
        <div
          className={`grid gap-2 p-2 xl:p-5 border-t border-x border-gray-300 rounded-t-xl bg-gray-100 mt-5`}
          style={{ gridTemplateColumns: `1fr repeat(${numVisibleDates}, 1fr)` }}
        >
          {/* Empty cell for time labels */}
          <div className="flex flex-col items-center justify-center text-center text-sm lg:text-xl">
            Timings
          </div>
          {/* Date headers */}
          {visibleDates.map((dateStr, dayIndex) => {
            const dateObj = new Date(dateStr);
            const dayNum = dateObj.getDate().toString().padStart(2, "0");
            const weekday = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const month = dateObj.toLocaleDateString("en-US", {
              month: "short",
            });
            return (
              <div
                className="flex flex-col items-center justify-center text-center"
                key={dayIndex}
              >
                <span className="text-md lg:text-2xl font-bold text-gray-900">
                  {dayNum}
                </span>
                <div className="flex flex-row items-center justify-center gap-1">
                  <span className="text-xs lg:text-base text-gray-700">
                    {weekday}
                  </span>
                  <span className="text-xs lg:text-base text-gray-500">
                    {month}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Slot Grid (Scrollable) */}
        <div className="h-[400px] overflow-y-auto scrollbar-hide border border-gray-300 rounded-b-xl">
          <div
            className={`grid gap-2 p-2 xl:p-5`}
            style={{
              gridTemplateColumns: `1fr repeat(${numVisibleDates}, 1fr)`,
            }}
          >
            {/* Time Labels */}
            <div className="flex flex-col justify-center text-center gap-2">
              {timeLabels.map((label: string, rowIdx: number) => {
                // Determine if this is a day or night slot (6 AM = 12, 6 PM = 36)
                const isDay = rowIdx >= 12 && rowIdx < 36;
                return (
                  <div
                    key={rowIdx}
                    className={`h-full flex justify-center items-center text-center text-[10px] lg:text-sm font-medium pl-2 gap-1 border-r border-gray-400 ${
                      isDay
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    <span className="block lg:hidden">{label.slice(0, 5)}</span>
                    <span className="hidden lg:block">{label}</span>
                    {isDay ? (
                      <Sun className="w-3 h-3 lg:w-4 lg:h-4 inline-block ml-1 text-yellow-400" />
                    ) : (
                      <Moon className="w-3 h-3 lg:w-4 lg:h-4 inline-block ml-1 text-blue-400" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Date Columns: Render by row for perfect alignment */}
            {visibleDates.map((dateStr, dayIndex) => (
              <div
                className="flex flex-col h-full space-y-3 min-h-0 scrollbar-hide"
                key={dateStr}
              >
                {timeLabels.map((_: string, rowIdx: number) => {
                  const slotsForDate = (data && data[dateStr]) || [];
                  const slot = slotsForDate[rowIdx];
                  const matchesFilter =
                    filter === "all" || (slot && slot.availability === filter);
                  return slot && matchesFilter ? (
                    <SlotCard
                      key={slot.id + "-" + slot.date}
                      slot={slot}
                      isSelected={selectedSlots.some(
                        (selectedSlot: Slot) => selectedSlot.id === slot.id
                      )}
                      onClick={() => onSlotSelect(slot)}
                    />
                  ) : (
                    <div
                      key={`not-available-${dateStr}-${rowIdx}`}
                      className="h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg border border-gray-200 text-sm font-semibold"
                    >
                      N/A
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;
