import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ActivitySelector, { Activity } from "./BookSlots/ActivitySelector";
import FacilitySelector, { Facility } from "./BookSlots/FacilitySelector";
import SlotSelector, { Slot } from "./BookSlots/SlotSelector";
import CheckoutCard from "./BookSlots/CheckoutCard";
import { Venue } from "../VenueDetailsPage";

const BookSlots: React.FC<{ venue: Venue }> = ({ venue }) => {
  const { venueId } = useParams();
  const refetchSlotsRef = useRef<(() => void) | null>(null);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedFacility(null);
    setSelectedSlots([]);
  };

  const handleActivityReset = (refetchActivities: () => void) => {
    setSelectedActivity(null);
    setSelectedFacility(null);
    setSelectedSlots([]);
    refetchActivities();
  };

  const handleFacilitySelect = (
    activity: Activity | null,
    facility: Facility
  ) => {
    setSelectedActivity(activity);
    setSelectedFacility(facility);
    setSelectedSlots([]);
  };

  const handleFacilityReset = () => {
    setSelectedFacility(null);
    setSelectedSlots([]);
  };

  const handleSlotSelect = (slot: Slot) => {
    const isSelected = selectedSlots.some((s) => s.id === slot.id);
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter((s) => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const refetchSlots = () => {
    if (refetchSlotsRef.current) {
      refetchSlotsRef.current();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4">
      {/* Left Section - Booking Steps */}
      <div className="lg:col-span-2 space-y-8 xl:px-4">
        <ActivitySelector
          venueId={venueId || ""}
          selectedActivity={selectedActivity}
          onActivitySelect={handleActivitySelect}
          onResetSelection={handleActivityReset}
        />

        <FacilitySelector
          selectedActivity={selectedActivity}
          selectedFacility={selectedFacility}
          onFacilitySelect={(facility, activity) =>
            handleFacilitySelect(activity, facility)
          }
          onResetSelection={handleFacilityReset}
        />

        <SlotSelector
          refetchSlots={refetchSlotsRef}
          selectedActivity={selectedActivity}
          selectedFacility={selectedFacility}
          selectedSlots={selectedSlots}
          onSlotSelect={handleSlotSelect}
        />
      </div>

      {/* Right Section - Checkout Card */}
      <div className="lg:col-span-1">
        <CheckoutCard
          refetchSlots={refetchSlots}
          venue={venue}
          selectedActivity={selectedActivity}
          selectedFacility={selectedFacility}
          selectedSlots={selectedSlots}
        />
      </div>
    </div>
  );
};

export default BookSlots;
