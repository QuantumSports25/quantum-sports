"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.BookingStatus = exports.BookingType = void 0;
var BookingType;
(function (BookingType) {
    BookingType["Event"] = "event";
    BookingType["Venue"] = "venue";
})(BookingType || (exports.BookingType = BookingType = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["Pending"] = "pending";
    BookingStatus["Confirmed"] = "confirmed";
    BookingStatus["Cancelled"] = "cancelled";
    BookingStatus["Refunded"] = "refunded";
    BookingStatus["Failed"] = "failed";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Initiated"] = "initiated";
    PaymentStatus["Paid"] = "paid";
    PaymentStatus["Failed"] = "failed";
    PaymentStatus["Refunded"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
//# sourceMappingURL=booking.model.js.map