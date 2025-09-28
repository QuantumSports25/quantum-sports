import React, { useState, useEffect, useCallback } from "react";
import { X, Upload, Phone, Globe, Navigation, Loader2 } from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";

interface AddCartProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VenueFormData) => void;
  isLoading?: boolean;
}

export interface VenueFormData {
  name: string;
  highlight: string;
  start_price_per_hour: number | null;
  partnerId: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
  mapLocationLink: string;
  lat: number | null;
  lang: number | null;
  images: string[];
  features: string[];
  cancellationPolicy: string;
}

const AddCart: React.FC<AddCartProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { user } = useAuthStore();
  const partnerId = user?.id;

  // Initial form data using useCallback to fix dependency issue
  const getInitialFormData = useCallback(
    (): VenueFormData => ({
      name: "",
      highlight: "",
      start_price_per_hour: null,
      partnerId: partnerId || "",
      city: "",
      state: "",
      country: "",
      zip: "",
      phone: "",
      mapLocationLink: "",
      lat: null,
      lang: null,
      images: [],
      features: [],
      cancellationPolicy: "",
    }),
    [partnerId]
  );

  const [formData, setFormData] = useState<VenueFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageLink, setImageLink] = useState<string>("");
  const [imageMode, setImageMode] = useState<"upload" | "link">("upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [newFeature, setNewFeature] = useState<string>("");

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      // Reset all form states when modal opens
      setFormData(getInitialFormData());
      setErrors({});
      setImageFiles([]);
      setImageUrls([]);
      setImageLink("");
      setImageMode("upload");
      setIsDragOver(false);
      setNewFeature("");
    }
  }, [isOpen, getInitialFormData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Venue name is required";
    } else if (formData.name.length > 30) {
      newErrors.name = "Venue name must be 30 characters or less";
    }

    if (!formData.highlight.trim()) {
      newErrors.highlight = "Highlight is required";
    }

    if (!formData.cancellationPolicy.trim()) {
      newErrors.cancellationPolicy = "Cancellation policy is required";
    }

    if (
      formData.start_price_per_hour === null ||
      formData.start_price_per_hour === undefined ||
      formData.start_price_per_hour < 0
    ) {
      newErrors.start_price_per_hour = "Valid price per hour is required";
    }

    if (!formData.partnerId.trim()) {
      newErrors.partnerId = "Partner ID is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.zip.trim()) {
      newErrors.zip = "ZIP code is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.mapLocationLink.trim()) {
      newErrors.mapLocationLink = "Map location link is required";
    }

    if (
      formData.lat === null ||
      formData.lat === undefined ||
      isNaN(formData.lat)
    ) {
      newErrors.lat = "Latitude is required";
    }

    if (
      formData.lang === null ||
      formData.lang === undefined ||
      isNaN(formData.lang)
    ) {
      newErrors.lang = "Longitude is required";
    }

    if (imageUrls.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof VenueFormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  function extractLatLongFromGoogleMaps(
    url: string
  ): { lat: number; lang: number } | null {
    try {
      const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match = url.match(regex);

      if (match && match.length >= 3) {
        const latitude = parseFloat(match[1]);
        const longitude = parseFloat(match[2]);
        console.log("Extracted coordinates:", latitude, longitude);
        return { lat: latitude, lang: longitude };
      }

      console.log("No coordinates found in URL");
      return null;
    } catch (error) {
      console.error("Error extracting coordinates:", error);
      return null;
    }
  }

  const handleMapLinkChange = (value: string) => {
    handleInputChange("mapLocationLink", value);

    // Try to extract coordinates from the map link
    try {
      const coordinates = extractLatLongFromGoogleMaps(value);
      if (coordinates) {
        setFormData((prev) => ({
          ...prev,
          lat: coordinates.lat,
          lang: coordinates.lang,
        }));
        // Clear any existing lat/lang errors
        setErrors((prev) => ({
          ...prev,
          lat: "",
          lang: "",
        }));
      }
    } catch (error) {
      console.error("Error in handleMapLinkChange:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    setImageFiles((prev) => [...prev, ...imageFiles]);

    // Create preview URLs
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setImageUrls((prev) => [...prev, url]);
        setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      const trimmedFeature = newFeature.trim();
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, trimmedFeature],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddImageLink = () => {
    if (imageLink.trim()) {
      // More flexible image URL validation
      const isValidImageUrl = (url: string): boolean => {
        // Check for common image file extensions
        const imageExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".svg",
          ".bmp",
          ".tiff",
        ];
        const hasImageExtension = imageExtensions.some((ext) =>
          url.toLowerCase().includes(ext)
        );

        // Check for data URLs
        const isDataUrl = url.startsWith("data:image");

        // Check for common image hosting services
        const imageHostingServices = [
          "unsplash.com",
          "pexels.com",
          "pixabay.com",
          "flickr.com",
          "imgur.com",
          "cloudinary.com",
          "images.unsplash.com",
          "images.pexels.com",
          "cdn.unsplash.com",
          "images.pixabay.com",
        ];
        const isFromImageHosting = imageHostingServices.some((service) =>
          url.toLowerCase().includes(service)
        );

        // Check for URLs with image parameters (like Unsplash with w=800&h=600)
        const hasImageParams =
          url.includes("w=") ||
          url.includes("h=") ||
          url.includes("fit=") ||
          url.includes("crop=");

        // Basic URL validation
        const isValidUrl =
          url.startsWith("http://") || url.startsWith("https://");

        return (
          isValidUrl &&
          (hasImageExtension ||
            isDataUrl ||
            isFromImageHosting ||
            hasImageParams)
        );
      };

      if (isValidImageUrl(imageLink)) {
        setImageUrls((prev) => [...prev, imageLink]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageLink],
        }));
        setImageLink("");
        // Clear any existing image errors
        setErrors((prev) => ({ ...prev, images: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          images: "Please enter a valid image URL from a supported service",
        }));
      }
    }
  };

  const handleImageModeChange = (mode: "upload" | "link") => {
    setImageMode(mode);
    setImageLink("");
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Only prevent default if there are files being dragged
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    // Only prevent default if there are files being dragged
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only prevent default if there are files being dragged
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      // Only set drag over to false if we're leaving the drop zone entirely
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    // Only handle drop if there are files
    if (e.dataTransfer.files.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length > 0) {
        setImageFiles((prev) => [...prev, ...imageFiles]);

        // Create preview URLs
        imageFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            setImageUrls((prev) => [...prev, url]);
            setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
          };
          reader.onerror = (error) => {
            console.error("Error reading file:", error);
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission attempted");
    console.log("Current form data:", formData);
    console.log("Current errors:", errors);

    if (validateForm()) {
      console.log("Form validation passed, submitting data:", formData);
      onSubmit(formData);
    } else {
      console.log("Form validation failed. Errors:", errors);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Add New Venue</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Venue Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                maxLength={30}
                disabled={isLoading}
                className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                  errors.name ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Enter venue name (max 30 characters)"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                {formData.name.length}/30 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Highlight <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.highlight}
                onChange={(e) => handleInputChange("highlight", e.target.value)}
                disabled={isLoading}
                className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                  errors.highlight ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Brief highlight of the venue"
              />
              {errors.highlight && (
                <p className="text-red-400 text-sm mt-1">{errors.highlight}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price per Hour (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.start_price_per_hour || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === "" ? null : Number(value);
                  handleInputChange("start_price_per_hour", numValue);
                }}
                min="0"
                disabled={isLoading}
                className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                  errors.start_price_per_hour
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                placeholder="Enter price per hour"
              />
              {errors.start_price_per_hour && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.start_price_per_hour}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cancellation Policy <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.cancellationPolicy}
                onChange={(e) =>
                  handleInputChange("cancellationPolicy", e.target.value)
                }
                disabled={isLoading}
                rows={4}
                className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none ${
                  errors.cancellationPolicy
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                placeholder="Enter your cancellation policy details (e.g., Free cancellation up to 24 hours before booking, 50% refund for cancellations 12-24 hours before, No refund for cancellations within 12 hours)"
              />
              {errors.cancellationPolicy && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.cancellationPolicy}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Specify your cancellation terms to help customers understand the
                refund policy.
              </p>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              Location Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                    errors.city ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                    errors.state ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                    errors.country ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter country"
                />
                {errors.country && (
                  <p className="text-red-400 text-sm mt-1">{errors.country}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                    errors.zip ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter ZIP code"
                />
                {errors.zip && (
                  <p className="text-red-400 text-sm mt-1">{errors.zip}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-gray-700 text-white border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                    errors.phone ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Map Location Link <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={formData.mapLocationLink}
                  onChange={(e) => handleMapLinkChange(e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-gray-700 text-white border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                    errors.mapLocationLink
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                  placeholder="Enter Google Maps link"
                />
              </div>
              {errors.mapLocationLink && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.mapLocationLink}
                </p>
              )}
              {formData.mapLocationLink &&
                extractLatLongFromGoogleMaps(formData.mapLocationLink) && (
                  <p className="text-green-400 text-sm mt-1">
                    ✓ Coordinates extracted successfully
                  </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="any"
                    value={formData.lat || ""}
                    onChange={(e) =>
                      handleInputChange("lat", Number(e.target.value) || null)
                    }
                    disabled={isLoading}
                    className={`w-full bg-gray-700 text-white border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                      errors.lat ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Enter latitude"
                  />
                </div>
                {errors.lat && (
                  <p className="text-red-400 text-sm mt-1">{errors.lat}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="any"
                    value={formData.lang || ""}
                    onChange={(e) =>
                      handleInputChange("lang", Number(e.target.value) || null)
                    }
                    disabled={isLoading}
                    className={`w-full bg-gray-700 text-white border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                      errors.lang ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Enter longitude"
                  />
                </div>
                {errors.lang && (
                  <p className="text-red-400 text-sm mt-1">{errors.lang}</p>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="block text-sm font-medium text-gray-300 mb-2">
              Venue Features
            </h3>

            <div>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Enter a feature (e.g., Parking, WiFi, Air Conditioning)"
                  className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={isLoading || !newFeature.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              {/* Features Display */}
              {formData.features.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Added Features ({formData.features.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          disabled={isLoading}
                          className="text-blue-300 hover:text-white transition-colors disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-500 text-sm">
                Add features like parking, WiFi, air conditioning, etc. to help
                customers know what's available.
              </p>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Venue Images</h3>

            {/* Image Mode Toggle */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleImageModeChange("upload")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  imageMode === "upload"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Upload Files
              </button>
              <button
                type="button"
                onClick={() => handleImageModeChange("link")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  imageMode === "link"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Add Image Links
              </button>
            </div>

            {imageMode === "upload" ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Images <span className="text-red-400">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed border-gray-600 rounded-lg p-6 text-center transition-colors ${
                    isDragOver
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600"
                  }`}
                  style={{
                    minHeight: "120px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  draggable={false}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 mb-2">
                    {isDragOver
                      ? "Drop images here"
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    At least one image is required
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Choose Images
                  </label>
                </div>
                {errors.images && (
                  <p className="text-red-400 text-sm mt-1">{errors.images}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Add Image Links <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={imageLink}
                      onChange={(e) => setImageLink(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageLink}
                      disabled={isLoading || !imageLink.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Supported formats: JPG, PNG, GIF, WebP, SVG. Also supports
                    Unsplash, Pexels, Pixabay, and other image hosting services.
                    At least one image is required.
                  </p>
                  {errors.images && (
                    <p className="text-red-400 text-sm">{errors.images}</p>
                  )}
                </div>
              </div>
            )}

            {/* Image Preview */}
            {imageUrls.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Image Preview ({imageUrls.length} images)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Venue ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/300/200";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isLoading}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Add Venue</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCart;
