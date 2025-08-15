"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_model_1 = require("../../models/event.model");
const event_services_1 = require("../../services/event-services/event.services");
const lodash_1 = require("lodash");
class EventController {
    static async createEvent(req, res) {
        try {
            const data = req.body;
            const { city, state, country, pincode, lat, lang } = req.body;
            if (!data?.title ||
                !data?.date ||
                !data?.venue ||
                typeof data?.capacity !== "number" ||
                typeof data?.ticketPrice !== "number" ||
                !data?.category ||
                !data?.venueName ||
                !data?.time ||
                !Array.isArray(data.images) ||
                !Array.isArray(data.tags) ||
                typeof data.featured !== "boolean" ||
                !data?.mapLocationLink ||
                city == null ||
                state == null ||
                country == null ||
                pincode == null ||
                lat == null ||
                lang == null) {
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
            const newEvent = {
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
            const createdEvent = await event_services_1.EventService.createEvent(newEvent);
            return res.status(201).json(createdEvent.id);
        }
        catch (error) {
            console.error("Error creating event:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async getEventById(req, res) {
        try {
            const eventId = req.params["id"];
            if (!eventId) {
                return res.status(400).json({ error: "Invalid event ID" });
            }
            const event = await event_services_1.EventService.getEventById(eventId);
            if (!event) {
                return res.status(404).json({ error: "Event not found" });
            }
            return res.status(200).json(event);
        }
        catch (error) {
            console.error("Error fetching event:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async updateEvent(req, res) {
        try {
            const eventId = req.params["id"];
            const eventData = req.body;
            if (!eventId || !eventData) {
                return res.status(400).json({ error: "Invalid event data" });
            }
            const event = await event_services_1.EventService.getEventById(eventId);
            if (!event) {
                return res.status(404).json({ error: "Event not found" });
            }
            const mergedEventData = (0, lodash_1.merge)({}, event, eventData);
            const updatedEvent = await event_services_1.EventService.updateEvent(eventId, mergedEventData);
            if (!updatedEvent) {
                return res.status(404).json({ error: "Event not updated" });
            }
            return res.status(200).json(updatedEvent.id);
        }
        catch (error) {
            console.error("Error updating event:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async getAllEvents(req, res) {
        try {
            const { page, limit, sort, date, archived } = req.query;
            const parsedDate = new Date(date) ?? new Date();
            const events = await event_services_1.EventService.getAllEvents({
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                sort: sort === event_model_1.SortDirection.Asc ? event_model_1.SortDirection.Asc : event_model_1.SortDirection.Desc,
                date: parsedDate,
                archived: archived === "true",
            });
            return res.status(200).json({ events, total: events.length });
        }
        catch (error) {
            console.error("Error fetching all events:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async getEventsByCategory(req, res) {
        try {
            const category = req.params["category"];
            if (!category) {
                return res.status(400).json({ error: "Category is required" });
            }
            const { page, limit, sort, date, archived } = req.query;
            const parsedDate = new Date(date) ?? new Date();
            if (!Object.values(event_model_1.Category).includes(category)) {
                return res.status(400).json({ error: "Invalid category" });
            }
            const events = await event_services_1.EventService.getEventsByCategory({
                category: category,
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                sort: sort === event_model_1.SortDirection.Asc ? event_model_1.SortDirection.Asc : event_model_1.SortDirection.Desc,
                date: parsedDate,
                archived: archived === "true",
            });
            return res.status(200).json({ events, total: events.length });
        }
        catch (error) {
            console.error("Error fetching events by category:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
    static async archiveEvent(req, res) {
        try {
            const eventId = req.params["id"];
            if (!eventId) {
                return res.status(400).json({ error: "Invalid event ID" });
            }
            const event = await event_services_1.EventService.getEventById(eventId);
            if (!event) {
                return res.status(404).json({ error: "Event not found" });
            }
            const archivedEvent = await event_services_1.EventService.archiveEvent(eventId);
            if (!archivedEvent) {
                return res.status(404).json({ error: "Event not archived" });
            }
            return res.status(200).json(archivedEvent.id);
        }
        catch (error) {
            console.error("Error archiving event:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error.message });
        }
    }
}
exports.EventController = EventController;
//# sourceMappingURL=event.controller.js.map