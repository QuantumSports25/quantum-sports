import { Request, Response } from "express";
import { Category, Event, SortDirection } from "../../models/event.model";
import { EventService } from "../../services/event-services/event.services";
import { merge } from "lodash";

export class EventController {
  static async createEvent(req: Request, res: Response) {
    try {
      const data = req.body as unknown as Event;
      const { city, state, country, pincode, lat, lang } = req.body as {
        city: string;
        state: string;
        country: string;
        pincode: string;
        lat: number;
        lang: number;
      };

      if (
        !data.title ||
        !data.date ||
        !data.venue ||
        !data.capacity ||
        !data.ticketPrice ||
        !data.category ||
        !data.location ||
        !data.venueName ||
        !data.time ||
        !data.images ||
        !data.tags ||
        !data.featured ||
        !data.mapLocationLink ||
        !city ||
        !state ||
        !country ||
        !pincode ||
        !lat ||
        !lang
      ) {
        return res.status(400).json({ error: "Invalid event data" });
      }
      const address = `${city}, ${state}, ${country}, ${pincode}`;
      const lowercaseCity = city.toLowerCase();
      const location = {
        address,
        city: lowercaseCity,
        state,
        country,
        pincode: pincode,
        coordinates: {
          lat,
          lang,
        },
      };

      const newEvent: Event = {
        title: data.title,
        description: data.description || "",
        date: new Date(data.date),
        time: data.time,
        location: location,
        venue: data.venue,
        venueName: data.venueName,
        capacity: data.capacity,
        registeredUsers: 0,
        ticketPrice: data.ticketPrice,
        category: data.category,
        images: data.images,
        featured: data.featured,
        tags: data.tags,
        organizer: data.organizer,
        organizerName: data.organizerName,
        mapLocationLink: data.mapLocationLink,
        archived: false,
      };

      return res.status(201).json(newEvent.id);
    } catch (error: any) {
      console.error("Error creating event:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async getEventById(req: Request, res: Response) {
    try {
      const eventId = req.params["id"];

      if (!eventId) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const event = await EventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      return res.status(200).json(event);
    } catch (error: any) {
      console.error("Error fetching event:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const eventId = req.params["id"];
      const eventData = req.body as unknown as Event;

      if (!eventId || !eventData) {
        return res.status(400).json({ error: "Invalid event data" });
      }

      const event = await EventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const mergedEventData = merge({}, event, eventData);

      const updatedEvent = await EventService.updateEvent(
        eventId,
        mergedEventData
      );
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not updated" });
      }

      return res.status(200).json(updatedEvent.id);
    } catch (error: any) {
      console.error("Error updating event:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async getAllEvents(req: Request, res: Response) {
    try {
      const { page, limit, sort, date, archived } = req.query;
      const parsedDate = new Date(date as string) ?? new Date();

      const events = await EventService.getAllEvents({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sort:
          sort === SortDirection.Asc ? SortDirection.Asc : SortDirection.Desc,
        date: parsedDate,
        archived: archived === "true",
      });

      return res.status(200).json({ events, total: events.length });
    } catch (error: any) {
      console.error("Error fetching all events:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async getEventsByCategory(req: Request, res: Response) {
    try {
      const category = req.params["category"];

      if (!category) {
        return res.status(400).json({ error: "Category is required" });
      }

      const { page, limit, sort, date, archived } = req.query;
      const parsedDate = new Date(date as string) ?? new Date();

      if (!Object.values(Category).includes(category as Category)) {
        return res.status(400).json({ error: "Invalid category" });
      }

      const events = await EventService.getEventsByCategory({
        category: category as Category,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sort:
          sort === SortDirection.Asc ? SortDirection.Asc : SortDirection.Desc,
        date: parsedDate,
        archived: archived === "true",
      });
      
      return res.status(200).json({ events, total: events.length });
    } catch (error: any) {
      console.error("Error fetching events by category:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  static async archiveEvent(req: Request, res: Response) {
    try {
      const eventId = req.params["id"];

      if (!eventId) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const event = await EventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const archivedEvent = await EventService.archiveEvent(eventId);
      if (!archivedEvent) {
        return res.status(404).json({ error: "Event not archived" });
      }

      return res.status(200).json(archivedEvent.id);
    } catch (error: any) {
      console.error("Error archiving event:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }


}
