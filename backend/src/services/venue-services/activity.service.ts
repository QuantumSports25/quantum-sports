
import prisma from "../../config/db";
import { Activity } from "../../models/venue.model";

// Use shared Prisma client

class ActivityService {
  static async createActivity(activity: Activity) {
    try {
      const newActivity = await prisma.activity.create({
        data: {
          ...activity,
        },
      });
      return newActivity;
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  }

  static async getActivitiesByVenue(venueId: string) {
    try {
      const activities = await prisma.activity.findMany({
        where: { venueId },
      });
      return activities;
    } catch (error) {
      console.error("Error getting activities by venue:", error);
      throw error;
    }
  }

  static async getActivityById(id: string) {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id },
      });
      return activity;
    } catch (error) {
      console.error("Error getting activity by id:", error);
      throw error;
    }
  }

  static async updateActivity(id: string, activity: Activity) {
    try {
      const updatedActivity = await prisma.activity.update({
        where: { id },
        data: activity,
      });
      return updatedActivity;
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  }

  static async deleteActivity(id: string) {
    try {
      const deletedActivity = await prisma.activity.delete({
        where: { id },
      });
      return deletedActivity;
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  }
}

export default ActivityService;
