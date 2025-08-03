import { MapPin, Star, Tag } from "lucide-react";
import ImageCarousel from "./ImageCarousel";
import { Venue } from "../../BookingPage";

const VenueCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 sm:h-56 bg-gray-300"></div>

      {/* Card Content */}
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-1"></div>
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
          <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
        </div>

        {/* Headline Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>

        {/* Price and Offer Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 bg-gray-300 rounded w-16 mb-1"></div>
            <div className="h-6 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// Venue Card Error Component
const VenueCardError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
      {/* Error Image */}
      <div className="h-48 sm:h-56 bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-600 text-sm font-medium">
            Failed to load image
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Error Loading Venue
          </h3>
          <p className="text-red-500 text-sm mb-4">
            Unable to load venue information. Please try again.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Venue Card Component
const VenueCard: React.FC<{
  venue: Venue | null;
  isLoading: boolean;
  error: Error | null;
}> = ({ venue, isLoading, error }) => {
  const handleCardClick = () => {
    // Placeholder for navigation to venue detail page
    if (venue) {
      console.log(`Navigating to venue: ${venue.name}`);
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <VenueCardSkeleton />;
  }

  // Show error state if there's an error
  if (error) {
    return <VenueCardError onRetry={() => window.location.reload()} />;
  }

  // Show error state if venue data is incomplete
  if (!venue || !venue.name || !venue.location) {
    return <VenueCardError onRetry={() => window.location.reload()} />;
  }

  // Show actual venue card
  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] group"
    >
      {/* Image Carousel */}
      <ImageCarousel images={venue.images || []} />

      {/* Card Content */}
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
              {venue.name || "Unknown Venue"}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{venue.location?.city || "Unknown Location"}</span>
            </div>
          </div>
          <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {venue.rating || 0}
          </div>
        </div>

        {/* Headline */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {venue.headline || "No description available"}
        </p>

        {/* Price and Offer */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Starting from</span>
            <div className="text-lg font-bold text-gray-900">
              ₹{(venue.start_price_per_hour || 0).toLocaleString()}
              <span className="text-sm font-normal text-gray-500">/hour</span>
            </div>
          </div>
          {venue.offer && (
            <div className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
              <Tag className="w-3 h-3 mr-1" />
              {venue.offer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
