"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateThirtyMinuteSlots = exports.validateTimeSlot = exports.isValidThirtyMinuteInterval = void 0;
const isValidThirtyMinuteInterval = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
        return false;
    }
    const parts = time.split(':');
    const minutes = parts[1];
    if (typeof minutes === 'undefined') {
        return false;
    }
    const minuteValue = parseInt(minutes, 10);
    return minuteValue === 0 || minuteValue === 30;
};
exports.isValidThirtyMinuteInterval = isValidThirtyMinuteInterval;
const validateTimeSlot = (startTime, endTime) => {
    if (!(0, exports.isValidThirtyMinuteInterval)(startTime)) {
        return {
            isValid: false,
            error: 'Start time must be in 30-minute intervals (e.g., 09:00, 09:30, 10:00)'
        };
    }
    if (!(0, exports.isValidThirtyMinuteInterval)(endTime)) {
        return {
            isValid: false,
            error: 'End time must be in 30-minute intervals (e.g., 09:00, 09:30, 10:00)'
        };
    }
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (startMinutes >= endMinutes) {
        return {
            isValid: false,
            error: 'Start time must be before end time'
        };
    }
    return {
        isValid: true,
        error: null
    };
};
exports.validateTimeSlot = validateTimeSlot;
const timeToMinutes = (time) => {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    if (Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59) {
        throw new Error(`Invalid time format: ${time}`);
    }
    return hours * 60 + minutes;
};
const generateThirtyMinuteSlots = (startTime, endTime) => {
    const validation = (0, exports.validateTimeSlot)(startTime, endTime);
    if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid time slot');
    }
    const slots = [];
    let currentMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    while (currentMinutes < endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push(timeString);
        currentMinutes += 30;
    }
    return slots;
};
exports.generateThirtyMinuteSlots = generateThirtyMinuteSlots;
//# sourceMappingURL=timeValidation.js.map