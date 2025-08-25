import { Prisma } from "@prisma/client";
import prisma from "../../config/db";
import { Event, Category, SortDirection } from "../../models/event.model";
import { Location } from "../../models/venue.model";
import { Booking, EventBooking } from "../../models/booking.model";
import { BookingService } from "../booking-services/booking.service";

// Use shared Prisma client

export class EventService {
  static async createEvent(event: Event) {
    try {
      const newEvent = await prisma.event.create({
        data: {
          title: event.title,
          description: event.description ?? "",
          date: new Date(event.date),
          time: event.time,
          location: event.location as unknown as Prisma.InputJsonValue,
          venue: event.venue,
          venueName: event.venueName,
          capacity: event.capacity,
          bookedSeats: event.bookedSeats ?? 0,
          registeredUsers: event.registeredUsers ?? [],
          ticketPrice: event.ticketPrice,
          category: event.category as Category,
          images: event.images,
          featured: event.featured,
          tags: event.tags,
          organizer: event.organizer ?? "",
          organizerName: event.organizerName ?? "",
          mapLocationLink: event.mapLocationLink ?? "",
          archived: event.archived || false,
        },
      });
      return newEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  static async getEventById(eventId: string): Promise<Event> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      const newEvent: Event = {
        id: event.id,
        title: event.title,
        description: event.description || "",
        date: event.date,
        time: event.time,
        location: event.location as unknown as Event["location"],
        venue: event.venue,
        venueName: event.venueName,
        capacity: event.capacity,
        bookedSeats: event.bookedSeats,
        registeredUsers: event.registeredUsers,
        ticketPrice: event.ticketPrice,
        category: event.category as unknown as Category,
        images: event.images || [],
        featured: event.featured as boolean,
        tags: event.tags || [],
        organizer: event.organizer || "",
        organizerName: event.organizerName || "",
        mapLocationLink: event.mapLocationLink || "",
        archived: event.archived || false,
      };

      return newEvent;
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  }

  static async getEventsByCategory({
    category,
    page,
    limit,
    sort,
    date,
    archived,
  }: {
    category: Category;
    page: number;
    limit: number;
    sort: SortDirection;
    date: Date;
    archived: boolean;
  }): Promise<Event[]> {
    try {
      const events = await prisma.event.findMany({
        where: { category, date: { gte: date }, archived },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          date: sort,
        },
      });

      return events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        date: event.date,
        time: event.time,
        location: event.location as unknown as Location,
        venue: event.venue,
        venueName: event.venueName,
        capacity: event.capacity,
        bookedSeats: event.bookedSeats,
        registeredUsers: event.registeredUsers,
        ticketPrice: event.ticketPrice,
        category: event.category as unknown as Category,
        images: event.images || [],
        featured: event.featured as boolean,
        tags: event.tags || [],
        organizer: event.organizer || "",
        organizerName: event.organizerName || "",
        mapLocationLink: event.mapLocationLink || "",
        archived: event.archived || false,
      }));
    } catch (error) {
      console.error("Error fetching events by category:", error);
      throw error;
    }
  }

  static async getAllEvents({
    page,
    limit,
    sort,
    date,
    archived = false,
  }: {
    page: number;
    limit: number;
    sort: SortDirection;
    date: Date;
    archived: boolean;
  }): Promise<Event[]> {
    try {
      const events = await prisma.event.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          date: {
            gte: date,
          },
          archived: archived,
        },
        orderBy: {
          date: sort,
        },
      });

      return events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        date: event.date,
        time: event.time,
        location: event.location as unknown as Location,
        venue: event.venue,
        venueName: event.venueName,
        capacity: event.capacity,
        bookedSeats: event.bookedSeats,
        registeredUsers: event.registeredUsers,
        ticketPrice: event.ticketPrice,
        category: event.category as unknown as Category,
        images: event.images || [],
        featured: event.featured as boolean,
        tags: event.tags || [],
        organizer: event.organizer || "",
        organizerName: event.organizerName || "",
        mapLocationLink: event.mapLocationLink || "",
        archived: event.archived || false,
      }));
    } catch (error) {
      console.error("Error fetching all events:", error);
      throw error;
    }
  }

  static async updateEvent(eventId: string, event: Event) {
    try {
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          title: event.title,
          description: event.description ?? "",
          date: new Date(event.date),
          time: event.time,
          location: event.location as unknown as Prisma.InputJsonValue,
          venue: event.venue,
          venueName: event.venueName,
          capacity: event.capacity,
          bookedSeats: event.bookedSeats,
          registeredUsers: event.registeredUsers,
          ticketPrice: event.ticketPrice,
          category: event.category as Category,
          images: event.images,
          featured: event.featured,
          tags: event.tags,
          organizer: event.organizer ?? "",
          organizerName: event.organizerName ?? "",
          mapLocationLink: event.mapLocationLink ?? "",
        },
      });

      if (!updatedEvent) {
        throw new Error("Event not updated");
      }

      return updatedEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  static async archiveEvent(eventId: string) {
    try {
      const archivedEvent = await prisma.event.update({
        where: { id: eventId },
        data: { archived: true },
      });

      if (!archivedEvent) {
        throw new Error("Event not archived");
      }

      return archivedEvent;
    } catch (error) {
      console.error("Error archiving event:", error);
      throw error;
    }
  }

  static async createEventBeforePayment(booking: Booking, capacity: number, registeredUsers: string[]) {
    try {
      const res = await prisma.$transaction(async (tx) => {
        const newBooking = await tx.booking.create({
          data: BookingService.createBooking(booking),
        });

        await tx.event.update({
          where: {
            id: (booking.bookingData as EventBooking).eventId,
            bookedSeats: {
              lte: capacity - (booking.bookingData as EventBooking).seats,
            },
          },
          data: {
            bookedSeats: {
              increment: (booking.bookingData as EventBooking).seats,
            },
            registeredUsers: {
              set: [...registeredUsers, booking.userId],
            },
          },
        });

        return newBooking;
      });

      return res;
    } catch (error) {
      console.error("Error creating event booking before payment:", error);
      throw error;
    }
  }

  static async handleEventSeats(bookingId: string) {
    try {
      const booking = await BookingService.getBookingById(bookingId);

      if (!booking) {
        return false;
      }

      const { eventId, seats } = booking.bookingData as unknown as EventBooking;

      await prisma.$executeRaw`
        UPDATE "Event"
        SET 
        "bookedSeats" = GREATEST("bookedSeats" - ${seats}, 0),
        "registeredUsers" = array_remove("registeredUsers", ${booking.userId})
        WHERE "id" = ${eventId}
        AND ${booking.userId} = ANY("registeredUsers");
      `;

      return true;
    } catch (error) {
      console.error("Error handling event seats:", error);
      throw error;
    }
  }
}
