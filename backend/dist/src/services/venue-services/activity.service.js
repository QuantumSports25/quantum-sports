"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ActivityService {
    static async createActivity(activity) {
        try {
            const newActivity = await prisma.activity.create({
                data: {
                    ...activity,
                },
            });
            return newActivity;
        }
        catch (error) {
            console.error("Error creating activity:", error);
            throw error;
        }
    }
    static async getActivitiesByVenue(venueId) {
        try {
            const activities = await prisma.activity.findMany({
                where: { venueId },
            });
            return activities;
        }
        catch (error) {
            console.error("Error getting activities by venue:", error);
            throw error;
        }
    }
    static async getActivityById(id) {
        try {
            const activity = await prisma.activity.findUnique({
                where: { id },
            });
            return activity;
        }
        catch (error) {
            console.error("Error getting activity by id:", error);
            throw error;
        }
    }
    static async updateActivity(id, activity) {
        try {
            const updatedActivity = await prisma.activity.update({
                where: { id },
                data: activity,
            });
            return updatedActivity;
        }
        catch (error) {
            console.error("Error updating activity:", error);
            throw error;
        }
    }
    static async deleteActivity(id) {
        try {
            const deletedActivity = await prisma.activity.delete({
                where: { id },
            });
            return deletedActivity;
        }
        catch (error) {
            console.error("Error deleting activity:", error);
            throw error;
        }
    }
}
exports.default = ActivityService;
//# sourceMappingURL=activity.service.js.map