import { PrismaClient } from "@prisma/client";
import { Facility } from "../../models/venue.model";

const prisma = new PrismaClient();

export class FacilityService {
  static async createFacility(facility: Facility) {
    try {
      const newFacility = await prisma.facility.create({
        data: facility,
      });
      return newFacility;
    } catch (error) {
      console.error("Error creating facility:", error);
      throw error;
    }
  }

  static async getFacilitiesByActivity(activityId: string) {
    try {
      const facilities = await prisma.facility.findMany({
        where: { activityId },
      });
      return facilities;
    } catch (error) {
      console.error("Error getting facilities by activity:", error);
      throw error;
    }
  }

  static async getFacilityById(id: string) {
    try {
      const facility = await prisma.facility.findUnique({
        where: { id },
      });
      
      return facility;
    } catch (error) {
      console.error("Error getting facility by id:", error);
      throw error;
    }
  }

  static async updateFacility(id: string, facility: Facility) {
    try {
      const updatedFacility = await prisma.facility.update({
        where: { id },
        data: facility,
      });
      return updatedFacility;
    } catch (error) {
      console.error("Error updating facility:", error);
      throw error;
    }
  }

  static async deleteFacility(id: string) {
    try {
      const deletedFacility = await prisma.facility.delete({
        where: { id },
      });
      return deletedFacility;
    } catch (error) {
      console.error("Error deleting facility:", error);
      throw error;
    }
  }
}
