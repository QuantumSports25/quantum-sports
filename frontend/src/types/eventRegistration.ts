// Event Registration Types
export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  numberOfTickets: number;
  totalAmount: number;
  paymentMethod: string;
  paymentId?: string;
  registrationDate: Date;
  status: "pending" | "confirmed" | "cancelled";
}

export interface EventRegistrationRequest {
  eventId: string;
  userId: string;
  seats: number;
  amount: number;
  bookedDate: Date;
  paymentMethod: string;
}

export interface EventRegistrationResponse {
  registrationId: string;
  status: string;
  message?: string;
}

export enum EventRegistrationStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
}
