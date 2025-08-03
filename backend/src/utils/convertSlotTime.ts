export interface TimeStringToMinutesParams {
    timeString: string;
}

export interface TimeStringToMinutesResult {
    minutes: number;
}

export const timeStringToMinutes = (
    timeString: TimeStringToMinutesParams['timeString']
): TimeStringToMinutesResult['minutes'] => {
    const timeParts: string[] = timeString.split(':');
    if (timeParts.length < 2 || !timeParts[0] || !timeParts[1]) {
        return NaN;
    }

    const hours: number = parseInt(timeParts[0], 10);
    const minutes: number = parseInt(timeParts[1], 10);

    if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return NaN;
    }

    return hours * 60 + minutes;
};