"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const venue_routes_1 = __importDefault(require("./routes/venue-routes/venue.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const membership_routes_1 = __importDefault(require("./routes/membership/membership.routes"));
const wallet_routes_1 = __importDefault(require("./routes/wallet.routes"));
const activity_facility_routes_1 = __importDefault(require("./routes/venue-routes/activity.facility.routes"));
const slot_routes_1 = __importDefault(require("./routes/venue-routes/slot.routes"));
const devScriptRoutes_1 = __importDefault(require("./routes/devScriptRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log("===== CORS Middleware Debug =====");
    console.log("Full Request Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Request Method:", req.method);
    console.log("Origin:", req.headers.origin);
    console.log("Referer:", req.headers.referer);
    console.log("Host:", req.headers.host);
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:4000",
        "https://quantum-sports.netlify.app",
        process.env["FRONTEND_URL"] || "",
    ].filter(Boolean);
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const isAllowedOrigin = allowedOrigins.some((allowedOrigin) => (origin && origin.startsWith(allowedOrigin)) ||
        (referer && referer.startsWith(allowedOrigin)));
    console.log("Is Allowed Origin:", isAllowedOrigin);
    res.header("Vary", "Origin");
    if (isAllowedOrigin) {
        res.header("Access-Control-Allow-Origin", origin || referer || allowedOrigins[0]);
    }
    else {
        res.header("Access-Control-Allow-Origin", allowedOrigins[0]);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-client-key, x-client-token, x-client-secret, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Referrer-Policy", "origin-when-cross-origin");
    res.header("X-Content-Type-Options", "nosniff");
    res.header("X-Frame-Options", "SAMEORIGIN");
    if (req.method === "OPTIONS") {
        console.log("Handling Preflight Request");
        res.sendStatus(200);
        return;
    }
    next();
});
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/venue", venue_routes_1.default);
app.use("/api/venue/activity-facility", activity_facility_routes_1.default);
app.use("/api/venue/slot", slot_routes_1.default);
app.use("/api/booking", booking_routes_1.default);
app.use("/api/membership", membership_routes_1.default);
app.use("/api/wallet", wallet_routes_1.default);
app.use("/api/devscript", devScriptRoutes_1.default);
app.get("/", (_req, res) => {
    res.send("Backend is running");
});
exports.default = app;
//# sourceMappingURL=app.js.map