import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Star,
  Filter,
  Search,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/eventService";
import { Location } from "../pages/booking/VenueDetailsPage";

export interface Event {
  id: string;
  title: string;
  description?: string | undefined;
  date: Date | string;
  time: string;
  location: Location;
  venue: string;
  venueName: string;
  capacity: number;
  bookedSeats: number;
  registeredUsers: string[];
  ticketPrice: number;
  category: Category;
  images: string[];
  featured: boolean;
  tags: string[];
  archived: boolean;
  organizer?: string | undefined;
  organizerName?: string | undefined;
  mapLocationLink?: string | undefined;
}

export enum Category {
  All = "All",
  Gaming = "Gaming",
  Technology = "Technology",
  Music = "Music",
  Business = "Business",
  Fitness = "Fitness",
  Art = "Art",
}

const EventsPage: React.FC = () => {
  // const { user, isAuthenticated } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => eventService.getAllEvents(),
  });

  const categories = [
    "all",
    "Gaming",
    "Technology",
    "Music",
    "Business",
    "Fitness",
    "Art",
  ];

  useEffect(() => {
    // If API returns { events: [...] }, extract events
    let eventArray: Event[] = [];
    if (data) {
      if (Array.isArray(data)) {
        eventArray = data as Event[];
      } else if (
        typeof data === "object" &&
        Array.isArray((data as any).events)
      ) {
        eventArray = (data as any).events;
      }
    }
    setEvents(eventArray);
    setFilteredEvents(eventArray);
  }, [data]);

  useEffect(() => {
    let filtered = events;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, searchTerm]);

  const getAvailabilityColor = (registered: number, capacity: number) => {
    const percentage = (registered / capacity) * 100;
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 70) return "text-yellow-400";
    return "text-green-400";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6 leading-tight py-2">
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover amazing events, connect with like-minded people, and create
            unforgettable memories
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(Array.isArray(filteredEvents) ? filteredEvents : []).map(
            (event, index) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className={`group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden border border-gray-700/50 transition-all duration-500 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-2 block ${
                  event.featured ? "ring-2 ring-blue-500/30" : ""
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {/* Featured Badge */}
                {event.featured && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      <Star className="h-4 w-4" />
                      <span>Featured</span>
                    </div>
                  </div>
                )}

                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-blue-400 opacity-50" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  {/* Event Title */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-300 text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                      <span>{formatDate(event.date?.toString())}</span>
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-blue-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                      <span>{event.location?.address}</span>
                    </div>
                  </div>

                  {/* Capacity and Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1 text-blue-400" />
                      <span
                        className={getAvailabilityColor(
                          event.bookedSeats,
                          event.capacity
                        )}
                      >
                        {event.bookedSeats}/{event.capacity}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Ticket className="h-4 w-4 mr-1 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        ₹{event.ticketPrice}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Register Button */}
                  <button
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      event.bookedSeats >= event.capacity
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                    }`}
                    disabled={event.bookedSeats >= event.capacity}
                  >
                    {event.bookedSeats >= event.capacity
                      ? "Sold Out"
                      : "Register Now"}
                  </button>
                </div>

                {/* Hover Effect Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 transition-opacity duration-300 pointer-events-none ${
                    hoveredEvent === event.id ? "opacity-100" : ""
                  }`}
                ></div>
              </Link>
            )
          )}
        </div>

        {/* No Events Found */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No events found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default EventsPage;
