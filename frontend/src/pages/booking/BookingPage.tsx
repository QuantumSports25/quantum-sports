import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllVenue } from "../../services/partner-service/venue-service/venueService";
import VenueCard from "./components/booking-comp/venueCard";

// List of cities
const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
  "Ghaziabad",
];

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Venue type for our dummy data
export interface Venue {
  id: number;
  name: string;
  location: { city: string };
  rating: number;
  start_price_per_hour: number;
  offer?: string;
  headline: string;
  images: string[];
}

// Search Bar Component
const SearchBar: React.FC<{
  venueName: string;
  sport: string;
  city: string;
  onVenueNameChange: (value: string) => void;
  onSportChange: (value: string) => void;
  onCityChange: (value: string) => void;
  isSearching?: boolean;
}> = ({
  venueName,
  city,
  onVenueNameChange,
  onCityChange,
  isSearching = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState(CITIES);

  // Filter cities based on input
  useEffect(() => {
    if (city === "") {
      setFilteredCities(CITIES);
    } else {
      const filtered = CITIES.filter((cityName) =>
        cityName.toLowerCase().includes(city.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [city]);

  const handleCitySelect = (selectedCity: string) => {
    onCityChange(selectedCity === "All Cities" ? "" : selectedCity);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Only close if clicking outside the entire dropdown container
      if (!target.closest("[data-dropdown-container]")) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Find Your Perfect Venue
        </h2>
        {isSearching && (
          <div className="flex items-center text-sm text-blue-600">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
            Searching...
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Venue Name Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by venue name"
            value={venueName}
            onChange={(e) => onVenueNameChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              isSearching ? "border-blue-300 bg-blue-50/30" : "border-gray-300"
            }`}
          />
        </div>

        {/* Sport Search */}
        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by sport"
            value={sport}
            onChange={(e) => onSportChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              isSearching ? "border-blue-300 bg-blue-50/30" : "border-gray-300"
            }`}
          />
        </div> */}

        {/* City Search */}
        <div className="relative" data-dropdown-container>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search by city"
              value={city}
              onChange={(e) => {
                onCityChange(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsDropdownOpen(false);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (filteredCities.length > 0) {
                    handleCitySelect(filteredCities[0]);
                  }
                }
              }}
              className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                isSearching
                  ? "border-blue-300 bg-blue-50/30"
                  : "border-gray-300"
              } ${isDropdownOpen ? "rounded-b-none border-b-0" : ""}`}
            />
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div
              className={`absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-20 max-h-60 overflow-y-auto transition-all duration-200 transform ${
                isDropdownOpen
                  ? "rounded-b-xl border-t-0 opacity-100 translate-y-0"
                  : "rounded-xl mt-1 opacity-0 -translate-y-2"
              }`}
            >
              {filteredCities.length > 0 ? (
                <>
                  {/* Show search results count */}
                  {city && filteredCities.length < CITIES.length && (
                    <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                      {filteredCities.length}{" "}
                      {filteredCities.length === 1 ? "city" : "cities"} found
                    </div>
                  )}
                  {filteredCities.map((cityName, index) => (
                    <button
                      key={cityName}
                      onClick={() => {
                        console.log(
                          "BookingPage: Button clicked for city:",
                          cityName
                        );
                        handleCitySelect(cityName);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center group ${
                        index === filteredCities.length - 1
                          ? "rounded-b-xl"
                          : ""
                      } ${
                        city === cityName ||
                        (city === "" && cityName === "All Cities")
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-900"
                      }`}
                    >
                      <span className="flex-1">{cityName}</span>
                      {(city === cityName ||
                        (city === "" && cityName === "All Cities")) && (
                        <span className="text-blue-600 font-medium">✓</span>
                      )}
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-6 text-gray-500 text-center rounded-b-xl">
                  <Search className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No cities found</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Try a different search term
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main BookingPage Component
const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [venueName, setVenueName] = useState("");
  const [sport, setSport] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  // Debounced search values with 500ms delay
  const debouncedVenueName = useDebounce(venueName, 500);
  const debouncedSport = useDebounce(sport, 500);
  const debouncedCity = useDebounce(city, 500);

  // Track if user is currently typing (values don't match debounced values)
  const isTyping =
    venueName !== debouncedVenueName ||
    sport !== debouncedSport ||
    city !== debouncedCity;

  // Initialize state from URL search parameters
  useEffect(() => {
    const searchParam = searchParams.get("search");
    const eventParam = searchParams.get("event");
    const cityParam = searchParams.get("city");

    if (searchParam) {
      setVenueName(searchParam);
    }
    if (eventParam) {
      setSport(eventParam);
    }
    if (cityParam) {
      setCity(cityParam);
    }
  }, [searchParams]);

  const {
    data: venues,
    isLoading,
    error,
  } = useQuery<Venue[]>({
    queryKey: [
      "venues",
      {
        searchName: debouncedVenueName,
        page: 1,
        limit: 20,
        city: debouncedCity,
        event: debouncedSport,
      },
    ],
    queryFn: () =>
      getAllVenue(debouncedVenueName, 1, 20, debouncedCity, debouncedSport),
    enabled: true, // Always enabled, but will only refetch when debounced values change
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Book Your Sports Venue
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and book the best sports venues in your city. From football
            to tennis, find the perfect place for your game.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          venueName={venueName}
          sport={sport}
          city={city}
          onVenueNameChange={setVenueName}
          onSportChange={setSport}
          onCityChange={setCity}
          isSearching={isTyping || isLoading}
        />

        {/* Results Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Available Venues
            </h2>
          </div>

          {/* Venue Cards Grid */}
          {isLoading ? (
            // Show skeleton cards while loading
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <VenueCard
                  key={index}
                  venue={null}
                  isLoading={true}
                  error={null}
                />
              ))}
            </div>
          ) : error ? (
            // Show error state
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Error Loading Venues
              </h3>
              <p className="text-red-500 mb-4">
                Failed to load venues. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          ) : venues && venues.length > 0 ? (
            // Show venue cards
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue: Venue) => (
                <div
                  key={venue.id}
                  onClick={() => {
                    navigate(`/booking/${venue.id}`);
                  }}
                >
                  <VenueCard venue={venue} isLoading={false} error={null} />
                </div>
              ))}
            </div>
          ) : (
            // Show empty state
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No venues found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria to find more venues.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
