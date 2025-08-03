import axiosInstance from "../api";

export interface Facility {
  id?: string;
  name: string;
  images: string[];
  activityId: string;
  activityName?: string;
  start_price_per_hour: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isFillingFast: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityFormData {
  name: string;
  images: string[];
  activityId: string;
  start_price_per_hour: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isFillingFast: boolean;
}

export const createFacility = async (facility: FacilityFormData) => {
  try {
    const response = await axiosInstance.post("/venue/activity-facility/create-facility", facility);
    return response.data;
  } catch (error) {
    console.error("Error creating facility:", error);
    throw error;
  }
};

export const getFacilitiesByActivity = async (activityId: string) => {
  try {
    const response = await axiosInstance.get(`/venue/activity-facility/get-facilities-by-activity/${activityId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error getting facilities by activity:", error);
    throw error;
  }
};

export const getFacilityById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/venue/activity-facility/get-facility-by-id/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error getting facility by id:", error);
    throw error;
  }
};

export const updateFacility = async (id: string, facility: Partial<FacilityFormData>) => {
  try {
    const response = await axiosInstance.put(`/venue/activity-facility/update-facility/${id}`, facility);
    return response.data;
  } catch (error) {
    console.error("Error updating facility:", error);
    throw error;
  }
};

export const deleteFacility = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/venue/activity-facility/delete-facility/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting facility:", error);
    throw error;
  }
};

// Helper function to get all facilities for a venue by getting all activities first
export const getFacilitiesByVenue = async (venueId: string) => {
  try {
    // First get all activities for the venue
    const activitiesResponse = await axiosInstance.get(`/venue/activity-facility/get-activities-by-venue/${venueId}`);
    const activities = activitiesResponse.data.data;
    
    // Then get all facilities for each activity
    const allFacilities: Facility[] = [];
    for (const activity of activities) {
      try {
        const facilitiesResponse = await axiosInstance.get(`/venue/activity-facility/get-facilities-by-activity/${activity.id}`);
        const facilities = facilitiesResponse.data.data.map((facility: Facility) => ({
          ...facility,
          activityName: activity.name
        }));
        allFacilities.push(...facilities);
      } catch (error) {
        console.warn(`Error getting facilities for activity ${activity.id}:`, error);
      }
    }
    
    return allFacilities;
  } catch (error) {
    console.error("Error getting facilities by venue:", error);
    throw error;
  }
}; 