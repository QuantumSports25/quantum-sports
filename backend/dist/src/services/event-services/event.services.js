"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EventService {
    static async createEvent(event) {
        try {
            const newEvent = await prisma.event.create({
                data: {
                    title: event.title,
                    description: event.description ?? "",
                    date: new Date(event.date),
                    time: event.time,
                    location: event.location,
                    venue: event.venue,
                    venueName: event.venueName,
                    capacity: event.capacity,
                    registeredUsers: 0,
                    ticketPrice: event.ticketPrice,
                    category: event.category,
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
        }
        catch (error) {
            console.error("Error creating event:", error);
            throw error;
        }
    }
    static async getEventById(eventId) {
        try {
            const event = await prisma.event.findUnique({
                where: { id: eventId },
            });
            if (!event) {
                throw new Error("Event not found");
            }
            const newEvent = {
                id: event.id,
                title: event.title,
                description: event.description || "",
                date: event.date,
                time: event.time,
                location: event.location,
                venue: event.venue,
                venueName: event.venueName,
                capacity: event.capacity,
                registeredUsers: event.registeredUsers,
                ticketPrice: event.ticketPrice,
                category: event.category,
                images: event.images || [],
                featured: event.featured,
                tags: event.tags || [],
                organizer: event.organizer || "",
                organizerName: event.organizerName || "",
                mapLocationLink: event.mapLocationLink || "",
                archived: event.archived || false,
            };
            return newEvent;
        }
        catch (error) {
            console.error("Error fetching event:", error);
            throw error;
        }
    }
    static async getEventsByCategory({ category, page, limit, sort, date, archived }) {
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
                location: event.location,
                venue: event.venue,
                venueName: event.venueName,
                capacity: event.capacity,
                registeredUsers: event.registeredUsers,
                ticketPrice: event.ticketPrice,
                category: event.category,
                images: event.images || [],
                featured: event.featured,
                tags: event.tags || [],
                organizer: event.organizer || "",
                organizerName: event.organizerName || "",
                mapLocationLink: event.mapLocationLink || "",
                archived: event.archived || false,
            }));
        }
        catch (error) {
            console.error("Error fetching events by category:", error);
            throw error;
        }
    }
    static async getAllEvents({ page, limit, sort, date, archived = false, }) {
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
                location: event.location,
                venue: event.venue,
                venueName: event.venueName,
                capacity: event.capacity,
                registeredUsers: event.registeredUsers,
                ticketPrice: event.ticketPrice,
                category: event.category,
                images: event.images || [],
                featured: event.featured,
                tags: event.tags || [],
                organizer: event.organizer || "",
                organizerName: event.organizerName || "",
                mapLocationLink: event.mapLocationLink || "",
                archived: event.archived || false,
            }));
        }
        catch (error) {
            console.error("Error fetching all events:", error);
            throw error;
        }
    }
    static async updateEvent(eventId, event) {
        try {
            const updatedEvent = await prisma.event.update({
                where: { id: eventId },
                data: {
                    title: event.title,
                    description: event.description ?? "",
                    date: new Date(event.date),
                    time: event.time,
                    location: event.location,
                    venue: event.venue,
                    venueName: event.venueName,
                    capacity: event.capacity,
                    registeredUsers: 0,
                    ticketPrice: event.ticketPrice,
                    category: event.category,
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
        }
        catch (error) {
            console.error("Error updating event:", error);
            throw error;
        }
    }
    static async archiveEvent(eventId) {
        try {
            const archivedEvent = await prisma.event.update({
                where: { id: eventId },
                data: { archived: true },
            });
            if (!archivedEvent) {
                throw new Error("Event not archived");
            }
            return archivedEvent;
        }
        catch (error) {
            console.error("Error archiving event:", error);
            throw error;
        }
    }
}
exports.EventService = EventService;
//# sourceMappingURL=event.services.js.map