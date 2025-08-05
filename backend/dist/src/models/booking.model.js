"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.BookingStatus = void 0;
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