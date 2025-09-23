import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  Star,
  Share2,
  Calendar,
  // Award,
} from "lucide-react";
import {
  getVenue,
  updateVenue,
} from "../../services/partner-service/venue-service/venueService";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface Venue {
  id?: string;
  partnerId: string;
  name: string;
  description?: string;
  highlight?: string;
  location: Location;
  start_price_per_hour: number;
  details: {};
  cancellationPolicy: {};
  images?: string[];
  features?: string[];
  approved?: boolean;
  mapLocationLink: string;
  phone: string;
  rating?: number;
  reviews?: {
    userId: string;
    text: string;
    createdAt: string;
  };
  totalReviews?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  coordinates: {
    lat: number;
    lang: number;
  };
}

// Venue Media Component
const VenueMedia: React.FC<{ venue: Venue }> = ({ venue }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Only use images since videoUrl is not in the new model
  const mediaItems = [
    ...(venue.images || []).map((image, index) => ({
      type: "image",
      src: image,
      id: index,
    })),
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mediaItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + mediaItems.length) % mediaItems.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="space-y-4">
      {/* Media Carousel */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden rounded-2xl">
        {mediaItems.length > 0 ? (
          <>
            {/* Media Container with Sliding Effect */}
            <div
              className="w-full h-full flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {mediaItems.map((item, index) => (
                <div key={item.id} className="w-full h-full flex-shrink-0">
                  <img
                    src={item.src}
                    alt={`${venue.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {mediaItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </>
        ) : (
          // Placeholder when no images are available
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">{venue.name}</p>
              <p className="text-gray-400 text-sm">No images available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Venue Details Component
const VenueDetails: React.FC<{
  venue: Venue;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
}> = ({ venue, error, isLoading, refetch }) => {
  const updateMutation = useMutation({
    mutationFn: (data: Venue) => updateVenue(venue?.id ?? "", data),
    onSuccess: () => {
      refetch();
    },
  });
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showRatingTooltip, setShowRatingTooltip] = useState(false);

  // Close rating tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (showRatingTooltip) {
        setShowRatingTooltip(false);
      }
    };

    if (showRatingTooltip) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showRatingTooltip]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-red-600 text-lg font-semibold">
          Error loading venue details
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: venue.name,
        text: venue.description || venue.highlight,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleRating = async (rating: number) => {
    try {
      setUserRating(rating);

      console.log(parseFloat(rating.toFixed(1)));
      // Update venue with new rating
      const updatedVenue = {
        ...venue,
        rating: parseFloat(rating.toFixed(1)),
      };

      await updateMutation.mutateAsync(updatedVenue);
      // Close tooltip after successful rating
      setShowRatingTooltip(false);
    } catch (error) {
      console.error("Error updating rating:", error);
      // Revert user rating on error
      setUserRating(0);
    }
  };

  const openMaps = () => {
    const address = venue.location?.address || "";
    const city = venue.location?.city || "";
    const location = `${address}, ${city}`.trim().replace(/^,|,$/, ""); // Remove leading/trailing commas

    if (location) {
      const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
        location
      )}`;
      window.open(mapsUrl, "_blank");
    } else if (venue.mapLocationLink) {
      window.open(venue.mapLocationLink, "_blank");
    } else {
      alert("Location information not available");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {venue.name || "Venue Name"}
          </h1>
          <div className="flex flex-col lg:items-center space-x-2">
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i <
                      Math.floor(
                        (venue?.rating || 0) / (venue?.totalReviews || 1)
                      ) || 0
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-lg text-gray-600 mb-4">
          {venue.description || venue.highlight || "Venue Description"}
        </p>
      </div>

      {/* Address */}
      <div className="flex items-start space-x-3">
        <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-gray-700">
            {venue.location?.address || "Address not available"}
          </p>
          <button
            onClick={openMaps}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1 transition-colors duration-200"
          >
            View on Maps →
          </button>
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Features</h3>
        <div className="flex flex-wrap gap-2">
          {venue.features && venue.features.length > 0 ? (
            venue.features.map((feature: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
              >
                {feature}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No features available</span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Starting from</span>
            <div className="text-2xl font-bold text-gray-900">
              ₹
              {venue.start_price_per_hour
                ? venue.start_price_per_hour.toLocaleString()
                : "N/A"}
              <span className="text-sm font-normal text-gray-500">/hour</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Contact</div>
            <div className="font-semibold text-gray-900">
              {venue.phone || "Not available"}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative">
        {/* Action Buttons Row */}
        <div className="flex space-x-3">
          {/* Add Rating Button */}
          <div
            onMouseEnter={() => setShowRatingTooltip(true)}
            onMouseLeave={() => setShowRatingTooltip(false)}
            className="flex-1"
          >
            <button
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border transition-all duration-200 transform hover:scale-[1.02] ${
                showRatingTooltip
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-700 shadow-lg"
                  : "bg-white border-gray-200 text-gray-700 hover:border-yellow-300 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:shadow-md"
              }`}
            >
              <Star
                className={`w-5 h-5 ${
                  showRatingTooltip
                    ? "text-yellow-500 fill-current animate-pulse"
                    : "text-yellow-400"
                }`}
              />
              <span className="font-medium">Add Rating</span>
              {userRating > 0 && (
                <div className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
                  {userRating}★
                </div>
              )}
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md group"
          >
            <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-medium">Share</span>
          </button>
        </div>

        {/* Rating Tooltip */}
        {showRatingTooltip && (
          <div
            className="absolute top-full left-1/2 transform -translate-x-3/4 mt-1 z-50 animate-in fade-in slide-in-from-top-2 duration-300"
            onMouseEnter={() => setShowRatingTooltip(true)}
            onMouseLeave={() => setShowRatingTooltip(false)}
          >
            {/* Invisible bridge to prevent tooltip from closing when moving mouse */}
            <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent"></div>

            <div className="bg-white border border-yellow-200 rounded-2xl p-5 shadow-2xl shadow-yellow-100/50 min-w-max backdrop-blur-sm">
              {/* Tooltip Arrow */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-white border-l border-t border-yellow-200 rotate-45 shadow-sm"></div>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-gray-800 mb-1">
                    Rate Your Experience
                  </h4>
                  <p className="text-sm text-gray-600">
                    How would you rate this venue?
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={updateMutation.isPending}
                      className="transition-all duration-200 hover:scale-125 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 rounded-full p-1"
                    >
                      <Star
                        className={`w-8 h-8 transition-all duration-200 ${
                          star <= (hoverRating || userRating)
                            ? "text-yellow-400 fill-current drop-shadow-sm"
                            : "text-gray-300 hover:text-yellow-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Rating Feedback */}
                <div className="text-center min-h-[2rem] flex items-center justify-center">
                  {updateMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-yellow-600 font-medium">
                        Saving your rating...
                      </p>
                    </div>
                  ) : userRating > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-sm text-green-600 font-medium">
                        Thanks! You rated {userRating} star
                        {userRating !== 1 ? "s" : ""}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Click a star to rate
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowRatingTooltip(false)}
                  className="w-full py-2 px-4 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Tab Component
const Tab: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-2 md:px-4 text-sm lg:text-2xl py-2 font-medium lg:font-bold transition-all duration-200 ${
      isActive
        ? "text-green-500 border-b-2 border-green-500"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

// Book Slots Tab Component
const BookSlots: React.FC<{ venue: Venue }> = ({ venue }) => {
  const BookSlotsComponent = React.lazy(() => import("./components"));

  return (
    <React.Suspense
      fallback={
        <div className="space-y-6">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Booking System...
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Please wait while we load the booking interface.
            </p>
          </div>
        </div>
      }
    >
      <BookSlotsComponent venue={venue} />
    </React.Suspense>
  );
};

// Membership Plans Tab Component
// const MembershipPlans: React.FC = () => (
//   <div className="space-y-6">
//     <div className="text-center py-12">
//       <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//       <h3 className="text-xl font-semibold text-gray-900 mb-2">
//         Membership Plans
//       </h3>
//       <p className="text-gray-600 max-w-md mx-auto">
//         Explore our membership plans for exclusive benefits and discounts. Plans
//         will be displayed here.
//       </p>
//     </div>
//   </div>
// );

// Details Tab Component
const Details: React.FC<{ venue: Venue }> = ({ venue }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        About this venue
      </h3>
      <p className="text-gray-700 leading-relaxed">
        {venue.description || venue.highlight || "No description available"}
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Phone: {venue.phone || "Not available"}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Address: {venue.location?.address || "Not available"}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>City: {venue.location?.city || "Not available"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Features</h4>
        <div className="space-y-2">
          {venue.features && venue.features.length > 0 ? (
            venue.features.map((feature: string, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-gray-700"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{feature}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>No features listed</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Additional Details */}
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Additional Information</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Partner ID</div>
          <div className="font-medium text-gray-900">{venue.partnerId}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Status</div>
          <div className="font-medium text-gray-900">
            {venue.approved ? (
              <span className="text-green-600">Approved</span>
            ) : (
              <span className="text-yellow-600">Pending Approval</span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Venue Info Tabs Component
const VenueInfoTabs: React.FC<{ venue: Venue }> = ({ venue }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, name: "Book Slots", component: <BookSlots venue={venue} /> },
    // { id: 1, name: "Membership Plans", component: <MembershipPlans /> },
    {
      id: 1,
      name: "Details",
      component: venue ? (
        <Details venue={venue} />
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading venue details...</div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-200">
      {/* Tab Headers */}
      <div className="bg-white border-b border-gray-400 px-2 lg:px-8">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </Tab>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">{tabs[activeTab].component}</div>
    </div>
  );
};

// Main VenueDetailsPage Component
const VenueDetailsPage: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();

  console.log("Venue ID from params:", venueId);

  // Get venue data for the media component
  const {
    data: venue,
    isLoading: venueLoading,
    error: venueError,
    refetch,
  } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getVenue(venueId!),
    enabled: !!venueId,
  });

  if (!venueId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Invalid Venue
          </h2>
          <p className="text-gray-600">Venue ID not found in URL parameters.</p>
        </div>
      </div>
    );
  }

  if (venueLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Venue...
          </h2>
          <p className="text-gray-500">
            Please wait while we fetch venue details.
          </p>
        </div>
      </div>
    );
  }

  if (venueError || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Venue
          </h2>
          <p className="text-gray-600">
            Unable to load venue details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="py-8 mt-24">
        {/* Top Section - Venue Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 px-4 lg:px-20">
          {/* Left Side - Media Area */}
          <div>
            <VenueMedia venue={venue} />
          </div>

          {/* Right Side - Venue Info Area */}
          <div className="flex flex-col justify-center">
            <VenueDetails
              venue={venue}
              error={venueError}
              isLoading={venueLoading}
              refetch={refetch}
            />
          </div>
        </div>
        <div className="bg-white-50 rounded-xl">
          <VenueInfoTabs venue={venue} />
        </div>
      </div>
    </div>
  );
};

export default VenueDetailsPage;
