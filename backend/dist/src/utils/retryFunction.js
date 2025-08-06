"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetries = withRetries;
async function withRetries(fn, retries = 3, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
            lastError = err;
            console.warn(`handleBooking: Attempt ${attempt} failed. Retrying...`);
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, delayMs));
            }
        }
    }
    throw lastError;
}
//# sourceMappingURL=retryFunction.js.map