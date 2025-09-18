import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// List of cities for dropdown
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

interface SearchFilters {
  search: string;
  event: string;
  city: string;
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: "",
    event: "",
    city: "", // default
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [, setFilteredCities] = useState<string[]>(CITIES);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // refs for detecting outside clicks & scrolling highlighted into view
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Filter cities when user types into city input
  useEffect(() => {
    const value = (searchFilters.city || "").trim();
    if (!value || value === "All Cities") {
      setFilteredCities(CITIES);
    } else {
      const filtered = CITIES.filter((cityName) =>
        cityName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
    }
    // reset highlight whenever the filter changes
    setHighlightedIndex(-1);
  }, [searchFilters.city]);

  // Close dropdown when clicking outside container
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleMouseDown);
      return () => document.removeEventListener("mousedown", handleMouseDown);
    }
  }, [isDropdownOpen]);

  // Ensure highlighted option is scrolled into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const optionEls = listRef.current.querySelectorAll<HTMLButtonElement>(
      "button[data-city-option]"
    );
    const el = optionEls[highlightedIndex];
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);


  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (searchFilters.search.trim()) {
        searchParams.set("search", searchFilters.search.trim());
      }
      if (searchFilters.event) {
        searchParams.set("event", searchFilters.event);
      }
      if (searchFilters.city && searchFilters.city !== "All Cities") {
        searchParams.set("city", searchFilters.city);
      }

      const searchQuery = searchParams.toString();
      const navigationPath = searchQuery ? `/booking?${searchQuery}` : "/booking";
      navigate(navigationPath);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Key handlers for the city input (arrow navigation, enter, escape)
  // const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "ArrowDown") {
  //     e.preventDefault();
  //     setIsDropdownOpen(true);
  //     setHighlightedIndex((prev) =>
  //       prev < filteredCities.length - 1 ? prev + 1 : 0
  //     );
  //   } else if (e.key === "ArrowUp") {
  //     e.preventDefault();
  //     setIsDropdownOpen(true);
  //     setHighlightedIndex((prev) =>
  //       prev <= 0 ? Math.max(filteredCities.length - 1, 0) : prev - 1
  //     );
  //   } else if (e.key === "Enter") {
  //     e.preventDefault();
  //     if (isDropdownOpen) {
  //       if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
  //         selectCity(filteredCities[highlightedIndex]);
  //       } else if (filteredCities.length > 0) {
  //         selectCity(filteredCities[0]);
  //       } else {
  //         setIsDropdownOpen(false);
  //       }
  //     } else {
  //       // If dropdown closed, treat Enter as submit (search)
  //       handleSearch();
  //     }
  //   } else if (e.key === "Escape") {
  //     setIsDropdownOpen(false);
  //   }
  // };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/23848540/pexels-photo-23848540.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/90 text-xs sm:text-sm font-medium mb-6 sm:mb-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1.5 sm:mr-2 animate-pulse group-hover:animate-bounce"></span>
            Book in Seconds, Play for Hours!
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2 animate-fade-in-up">
            Book Your Perfect Game,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
              Anytime, Anywhere
            </span>
          </h1>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto px-2 sm:px-0 animate-fade-in-up delay-200">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Venue Name Input */}
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    placeholder="Search Venue Name"
                    value={searchFilters.search}
                    onChange={(e) =>
                      handleInputChange("search", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white/20 transition-all duration-300 text-sm sm:text-base hover:border-white/30"
                  />
                </div>

                {/* City Selection (dropdown disabled, typing allowed) */}
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    placeholder=" Search City"
                    value={searchFilters.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    autoComplete="off"
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white/20 transition-all duration-300 text-sm sm:text-base hover:border-white/30"
                  />
                </div>

                {/* Search Button */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-lg sm:rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center space-x-2 text-sm sm:text-base group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-300" />
                    )}
                    <span>{isLoading ? "Searching..." : "Search"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 animate-fade-in-up delay-400 select-none -z-[99] ${isDropdownOpen ? "pointer-events-none" : ""}`}>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  0
                </div>
                <div className="text-white/70 text-sm sm:text-base group-hover:text-white/90 transition-colors duration-300">
                  Hassle Guarantee
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 group-hover:text-purple-400 transition-colors duration-300">
                  2K+
                </div>
                <div className="text-white/70 text-sm sm:text-base group-hover:text-white/90 transition-colors duration-300">
                  Plus Players
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 group-hover:text-pink-400 transition-colors duration-300">
                  100%
                </div>
                <div className="text-white/70 text-sm sm:text-base group-hover:text-white/90 transition-colors duration-300">
                  Verified venues
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 group-hover:text-green-400 transition-colors duration-300">
                  24/7
                </div>
                <div className="text-white/70 text-sm sm:text-base group-hover:text-white/90 transition-colors duration-300">
                  Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:animate-pulse transition-all duration-300">
        <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-white/70 hover:text-white transition-colors duration-300" />
      </div>

      {/* Custom CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes gradient-x {
            0%, 100% {
              background-size: 200% 200%;
              background-position: left center;
            }
            50% {
              background-size: 200% 200%;
              background-position: right center;
            }
          }
          
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes spin-slow {
            0% {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            100% {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }
          
          .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }
          
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          
          .delay-200 {
            animation-delay: 0.2s;
          }
          
          .delay-400 {
            animation-delay: 0.4s;
          }
          
          .delay-1000 {
            animation-delay: 1s;
          }
        `,
        }}
      />
    </section>
  );
};

export default HeroSection;
