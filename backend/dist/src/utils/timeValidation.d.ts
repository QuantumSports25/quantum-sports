export declare const isValidThirtyMinuteInterval: (time: string) => boolean;
export declare const validateTimeSlot: (startTime: string, endTime: string) => {
    isValid: boolean;
    error: string;
} | {
    isValid: boolean;
    error: null;
};
export declare const generateThirtyMinuteSlots: (startTime: string, endTime: string) => string[];
//# sourceMappingURL=timeValidation.d.ts.map