import { Request, Response } from "express";
import { BookingService } from "../../services/booking-services/booking.service";
import {
  Booking,
  BookingStatus,
  BookingType,
  PaymentStatus
} from "../../models/booking.model";
import { customerDetails } from "../../models/booking.model";
import { Currency, Order, PaymentMethod } from "../../models/payment.model";
import { PaymentService } from "../../services/payment-wallet-services/payment.service";
import { SlotService } from "../../services/venue-services/slot.service";
import { AuthService } from "../../services/auth-services/auth.service";
import { AppError } from "../../types";
import { timeStringToMinutes } from "../../utils/convertSlotTime";
import { WalletService } from "../../services/payment-wallet-services/wallet.services";

export class BookingController {
  // Helper method to convert time string (HH:MM:SS) to minutes

  static async createVenueBookingBeforePayment(req: Request, res: Response) {
    try {
      const bookingData = req.body as Booking;
      const data = req.body;
      const paymentMethod = req.params["paymentMethod"] as PaymentMethod;

      // Validate required fields
      if (
        !bookingData.userId ||
        !data.partnerId ||
        !data.venueId ||
        !data.facilityId ||
        !data.slotIds ||
        !data.activityId ||
        !bookingData.amount ||
        !data.startTime ||
        !data.endTime ||
        !bookingData.bookedDate
      ) {
        return res.status(400).json({ message: "Required fields are missing" });
      }

      if (!Object.values(PaymentMethod).includes(paymentMethod)) {
        return res.status(400).json({ message: "Invalid payment method" });
      }

      // Validate time format and calculate duration
      const startTime = data.startTime;
      const endTime = data.endTime;

      // Validate time string format (HH:MM:SS or HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          message: "Invalid time format. Expected HH:MM or HH:MM:SS format",
        });
      }

      // Convert time strings to minutes for duration calculation
      const startMinutes = timeStringToMinutes(startTime);
      const endMinutes = timeStringToMinutes(endTime);
      const duration = endMinutes - startMinutes;

      if (isNaN(startMinutes) || isNaN(endMinutes) || duration <= 0) {
        return res.status(400).json({
          message: "Invalid time values or end time must be after start time",
        });
      }

      if (duration % 30 !== 0) {
        return res
          .status(400)
          .json({ message: "Duration must be a multiple of 30" });
      }

      const numberOfSlots = duration / 30;

      if (!Array.isArray(data.slotIds) || data.slotIds.length === 0) {
        return res
          .status(400)
          .json({ message: "slotIds must be a non-empty array" });
      }

      const [allSlotsAvailable, partner, user] = await Promise.all([
        SlotService.areAllSlotsAvailable(data.slotIds),
        AuthService.getUserById(data.partnerId),
        AuthService.getUserById(data.userId),
      ]);

      if (!allSlotsAvailable) {
        return res.status(400).json({
          message: "Some slots are not available or do not exist",
        });
      }

      if (!partner || partner.role !== "partner") {
        return res.status(404).json({ message: "Partner not found" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const customerDetails: customerDetails = {
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email ?? "",
        customerPhone: user.phone ?? "",
      };

      // Create booking object
      const booking: Booking = {
        userId: bookingData.userId,
        type: BookingType.Venue,
        bookingData: {
          type: BookingType.Venue,
          facilityId: data.facilityId,
          slotIds: data.slotIds,
          activityId: data.activityId,
          partnerId: data.partnerId,
          venueId: data.venueId,
          duration: duration,
          numberOfSlots: numberOfSlots,
          startTime: startTime,
          endTime: endTime,
        },
        amount: bookingData.amount,
        bookedDate: new Date(bookingData.bookedDate),
        bookingStatus: BookingStatus.Pending,
        paymentStatus: PaymentStatus.Initiated,
        customerDetails: customerDetails,
        paymentDetails: {
          paymentAmount: bookingData.amount,
          paymentMethod: paymentMethod,
          paymentDate: new Date(),
          isRefunded: false,
        },
      };

      const createdBooking =
        await BookingService.createVenueBookingBeforePayment(booking);

      return res.status(201).json({
        message: "Booking created successfully",
        data: createdBooking.id,
      });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      return res.status(500).json({
        message: "Failed to create booking",
        error: error.message,
      });
    }
  }

  static async createBookingPayment(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;

      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
      }

      const booking = await BookingService.getBookingById(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (
        booking.paymentStatus !== PaymentStatus.Initiated ||
        booking.bookingStatus !== BookingStatus.Pending
      ) {
        return res.status(400).json({
          message: "Payment has already been initiated for this booking",
        });
      }

      if (!booking.paymentDetails || !booking.paymentDetails.paymentMethod) {
        return res.status(400).json({ message: "Payment method is required" });
      }

      let orderData: Order | null = null;
      //wallet flow
      switch (booking.paymentDetails.paymentMethod) {
        case PaymentMethod.Wallet:
          await WalletService.deductCredits(booking.userId, booking.amount);
          orderData = {
            id: `order-${Math.random()
              .toString(36)
              .slice(2)
              .padEnd(12, "0")
              .slice(0, 12)}`,
            receipt: bookingId,
          };
          break;

        case PaymentMethod.Razorpay:
          const order = await PaymentService.createPaymentRazorpay({
            amount: booking.amount,
            bookingId: bookingId,
            customerId: booking.customerDetails.customerId,
            currency: Currency.INR,
          });

          orderData = {
            id: order.id,
            receipt: order.receipt as string,
          };
          break;
      }

      if (!orderData) {
        throw new Error("Failed to create Razorpay order");
      }

      const transaction = await PaymentService.createTransaction({
        orderId: orderData.id,
        bookingId: bookingId,
        amount: booking.amount,
        currency: Currency.INR,
        paymentMethod: PaymentMethod.Razorpay,
      });

      if (!transaction) {
        //transaction is not created
        // inform on whatsapp
      }

      return res.status(200).json({ data: orderData });
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      return res.status(500).json({
        message: "Failed to create Razorpay order ",
        error: error.message,
      });
    }
  }

  static async verifyPaymentAndBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let { paymentId } = req.body as {
        paymentId?: string;
      };

      const { signature, orderId } = req.body as {
        signature: string;
        orderId: string;
      };

      if (!id || !orderId) {
        return res
          .status(400)
          .json({ message: "Booking ID and Order ID are required" });
      }

      const booking = await BookingService.getBookingById(id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const paymentMethod =
        booking.paymentDetails?.paymentMethod === PaymentMethod.Razorpay
          ? PaymentMethod.Razorpay
          : PaymentMethod.Wallet;

      let verified = false;
      if (paymentMethod == PaymentMethod.Wallet) {
        const transaction = await PaymentService.getTransactionByOrderId(
          orderId
        );

        if (!transaction) {
          throw new Error("Payment verification failed");
        }
        paymentId = "pay" + transaction.orderId;
        verified = true;
      } else {
        if (!paymentId || !signature || !orderId) {
          return res
            .status(400)
            .json({ message: "Payment details are missing" });
        }

        if (
          !booking ||
          booking.paymentStatus !== PaymentStatus.Initiated ||
          booking.bookingStatus !== BookingStatus.Pending
        ) {
          return res.status(400).json({ message: "Invalid booking state" });
        }

        verified = await PaymentService.verifyPaymentSignature({
          paymentId,
          signature,
          orderId,
        });
      }

      if (!verified) {
        BookingService.handleBooking({
          success: false,
          bookingId: id,
          amount: booking.amount,
          orderId,
          paymentId,
          paymentMethod,
          type: booking.type
        });
        throw new Error("Payment verification failed");
      }

      BookingService.handleBooking({
        success: true,
        bookingId: id,
        amount: booking.amount,
        orderId,
        paymentId,
        paymentMethod,
        type: booking.type
      });

      return res.status(200).json({ message: "Payment verified successfully" });
    } catch (error) {
      console.error("Error confirming booking:", error);
      const appError = error as AppError;
      return res.status(500).json({
        message: "Failed to confirm booking",
        error: appError.message || "Unknown error",
      });
    }
  }

  static async getBookingById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Booking ID is required" });
      }

      const booking = await BookingService.getBookingById(id);

      return res.status(200).json({ data: booking });
    } catch (error: any) {
      console.error("Error getting booking:", error);
      return res.status(500).json({
        message: "Failed to get booking",
        error: error.message,
      });
    }
  }

  static async getBookingsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const bookings = await BookingService.getBookingsByUserId(userId);

      return res.status(200).json({
        data: bookings,
        total: bookings.length,
      });
    } catch (error: any) {
      console.error("Error getting user bookings:", error);
      return res.status(500).json({
        message: "Failed to get user bookings",
        error: error.message,
      });
    }
  }

  static async getBookingsByPartner(req: Request, res: Response) {
    try {
      const { partnerId } = req.params;

      if (!partnerId) {
        return res.status(400).json({ message: "Partner ID is required" });
      }

      const bookings = await BookingService.getBookingsByPartnerId(partnerId);

      return res.status(200).json({
        data: bookings,
        total: bookings.length,
      });
    } catch (error: any) {
      console.error("Error getting partner bookings:", error);
      return res.status(500).json({
        message: "Failed to get partner bookings",
        error: error.message,
      });
    }
  }

  static async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { cancellationReason } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Booking ID is required" });
      }

      const cancelledBooking = await BookingService.cancelBooking(
        id,
        cancellationReason
      );

      return res.status(200).json({
        message: "Booking cancelled successfully",
        data: cancelledBooking,
      });
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      return res.status(500).json({
        message: "Failed to cancel booking",
        error: error.message,
      });
    }
  }
}
