import { X, Upload, Loader2 } from "lucide-react";
import { Venue } from "../../../types";
import { useState } from "react";

interface EditableVenueCardProps {
  venue: Venue;
  onSave: (updatedVenue: Venue) => void;
  onCancel: () => void;
  isOpen: boolean;
  isLoading?: boolean;
}

const EditableVenueCard: React.FC<EditableVenueCardProps> = ({
  venue,
  onSave,
  onCancel,
  isOpen,
  isLoading = false,
}) => {
  const [editedVenue, setEditedVenue] = useState<Venue>({
    ...venue,
    images: venue.images || [], // Ensure images is initialized as an array
  });
  const [imageLink, setImageLink] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "link">("upload");
  const [newFeature, setNewFeature] = useState<string>("");

  const handleInputChange = (field: keyof Venue, value: any) => {
    setEditedVenue((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (
    field: keyof typeof venue.location,
    value: string | { lat: number | null; lang: number | null }
  ) => {
    setEditedVenue((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]:
          field === "coordinates" && typeof value === "object" ? value : value,
      },
    }));
  };

  const handleSave = () => {
    onSave(editedVenue);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Create preview URLs
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setEditedVenue((prev) => ({
          ...prev,
          images: [...(prev.images || []), url],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.files.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setEditedVenue((prev) => ({
            ...prev,
            images: [...(prev.images || []), url],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddImageLink = () => {
    if (imageLink.trim()) {
      const isValidImageUrl = (url: string): boolean => {
        const imageExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".svg",
        ];
        const hasImageExtension = imageExtensions.some((ext) =>
          url.toLowerCase().includes(ext)
        );

        const isDataUrl = url.startsWith("data:image");

        const imageHostingServices = [
          "unsplash.com",
          "pexels.com",
          "pixabay.com",
          "imgur.com",
          "cloudinary.com",
        ];
        const isFromImageHosting = imageHostingServices.some((service) =>
          url.toLowerCase().includes(service)
        );

        const hasImageParams =
          url.includes("w=") || url.includes("h=") || url.includes("fit=");
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
        setEditedVenue((prev) => ({
          ...prev,
          images: [...(prev.images || []), imageLink],
        }));
        setImageLink("");
      }
    }
  };

  const removeImage = (index: number) => {
    setEditedVenue((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleImageModeChange = (mode: "upload" | "link") => {
    setImageMode(mode);
    setImageLink("");
  };

  const handleAddFeature = () => {
    if (
      newFeature.trim() &&
      !(editedVenue.features || []).includes(newFeature.trim())
    ) {
      const trimmedFeature = newFeature.trim();
      setEditedVenue((prev) => ({
        ...prev,
        features: [...(prev.features || []), trimmedFeature],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setEditedVenue((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  // Add this helper to safely access images array
  const getImages = () => editedVenue.images || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Edit Venue</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
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
                value={editedVenue.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                maxLength={30}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter venue name (max 30 characters)"
              />
              <p className="text-gray-400 text-xs mt-1">
                {editedVenue.name.length}/30 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Highlight <span className="text-red-400">*</span>
              </label>
              <textarea
                value={editedVenue.highlight || ""}
                onChange={(e) => handleInputChange("highlight", e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief highlight of the venue"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price per Hour (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={editedVenue.start_price_per_hour}
                onChange={(e) =>
                  handleInputChange(
                    "start_price_per_hour",
                    parseInt(e.target.value)
                  )
                }
                min="0"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter price per hour"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cancellation Policy <span className="text-red-400">*</span>
              </label>
              <textarea
                value={editedVenue.cancellationPolicy || ""}
                onChange={(e) =>
                  handleInputChange("cancellationPolicy", e.target.value)
                }
                rows={4}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your cancellation policy details (e.g., Free cancellation up to 24 hours before booking, 50% refund for cancellations 12-24 hours before, No refund for cancellations within 12 hours)"
              />
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
                  value={editedVenue.location.city}
                  onChange={(e) => handleLocationChange("city", e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editedVenue.location.state}
                  onChange={(e) =>
                    handleLocationChange("state", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editedVenue.location.country}
                  onChange={(e) =>
                    handleLocationChange("country", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Postal Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editedVenue.location.pincode}
                  onChange={(e) =>
                    handleLocationChange("pincode", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={editedVenue.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Map Location Link <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={editedVenue.mapLocationLink || ""}
                onChange={(e) =>
                  handleInputChange("mapLocationLink", e.target.value)
                }
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Google Maps link"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={editedVenue.location.coordinates.lat || ""}
                  onChange={(e) =>
                    handleLocationChange("coordinates", {
                      ...editedVenue.location.coordinates,
                      lat: Number(e.target.value) || null,
                    })
                  }
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter latitude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={editedVenue.location.coordinates.lang || ""}
                  onChange={(e) =>
                    handleLocationChange("coordinates", {
                      ...editedVenue.location.coordinates,
                      lang: Number(e.target.value) || null,
                    })
                  }
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter longitude"
                />
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
              {(editedVenue.features || []).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Added Features ({(editedVenue.features || []).length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(editedVenue.features || []).map((feature, index) => (
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

          {/* Rating */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Rating</h3>
            <div className="flex items-center bg-gray-700/50 rounded-lg px-4 py-3">
              <Star className="w-5 h-5 text-yellow-400 mr-2" />
              <input
                type="number"
                value={editedVenue.rating}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                className="w-20 bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                min="0"
                max="5"
                step="0.1"
              />
              <span className="text-gray-400 ml-2">/ 5</span>
            </div>
          </div> */}

          {/* Images Section */}
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

            {/* Upload or Link Input */}
            {imageMode === "upload" ? (
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed border-gray-600 rounded-lg p-6 text-center transition-colors ${
                    isDragOver ? "border-blue-500 bg-blue-500/10" : ""
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 mb-2">
                    {isDragOver
                      ? "Drop images here"
                      : "Click to upload or drag and drop"}
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
                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Choose Images
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={imageLink}
                    onChange={(e) => setImageLink(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageLink}
                    disabled={isLoading || !imageLink.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <p className="text-gray-500 text-sm">
                  Supported formats: JPG, PNG, GIF, WebP, SVG. Also supports
                  Unsplash, Pexels, Pixabay, and other image hosting services.
                </p>
              </div>
            )}

            {/* Image Preview Grid */}
            {getImages().length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Images ({getImages().length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {getImages().map((url, index) => (
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
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-700 flex justify-end space-x-4">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>

        {/* Other Fields */}
      </div>
    </div>
  );
};

export default EditableVenueCard;
