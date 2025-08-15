import { Location } from "./venue.model";

export interface Event {
  id?: string;
  title: string;
  description?: string | undefined;
  date: Date;
  time: string; 
  location: Location;
  venue: string;
  venueName: string;
  capacity: number;
  registeredUsers: number;
  ticketPrice: number;
  category: Category;
  images: string[];
  featured: boolean;
  tags: string[];
  archived: boolean;
  organizer?: string | undefined;
  organizerName?: string | undefined;
  mapLocationLink?: string | undefined;
}

export enum Category {
   All = 'All',
   Gaming = 'Gaming',
   Technology = 'Technology',
   Music = 'Music',
   Business = 'Business',
   Fitness = 'Fitness',
   Art = 'Art'
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc'
}