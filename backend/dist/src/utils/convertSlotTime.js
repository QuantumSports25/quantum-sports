"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeStringToMinutes = void 0;
const timeStringToMinutes = (timeString) => {
    const timeParts = timeString.split(':');
    if (timeParts.length < 2 || !timeParts[0] || !timeParts[1]) {
        return NaN;
    }
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    if (isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59) {
        return NaN;
    }
    return hours * 60 + minutes;
};
exports.timeStringToMinutes = timeStringToMinutes;
//# sourceMappingURL=convertSlotTime.js.map