import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import venueRoutes from "./routes/venue-routes/venue.routes";
import bookingRoutes from "./routes/booking.routes";
import membershipRoutes from "./routes/membership/membership.routes";
import walletRoutes from "./routes/wallet.routes";
import activityFacilityRoutes from "./routes/venue-routes/activity.facility.routes";
import slotRoutes from "./routes/venue-routes/slot.routes";
import devScriptRoutes from "./routes/devScriptRoutes";
import eventRoutes from "./routes/event.routes";

// Setup

dotenv.config();

const app = express();
app.use(express.json());

// CORS middleware
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
    "https://quantumpickleball.in",
    process.env["FRONTEND_URL"] || "",
  ].filter(Boolean);

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // More comprehensive origin checking
  const isAllowedOrigin = allowedOrigins.some(
    (allowedOrigin) =>
      (origin && origin.startsWith(allowedOrigin)) ||
      (referer && referer.startsWith(allowedOrigin))
  );

  console.log("Is Allowed Origin:", isAllowedOrigin);

  // Set CORS headers more explicitly
  res.header("Vary", "Origin");

  if (isAllowedOrigin) {
    res.header(
      "Access-Control-Allow-Origin",
      origin || referer || allowedOrigins[0]
    );
  } else {
    // Fallback to first allowed origin if no match
    res.header("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // More permissive Referrer Policy
  res.header("Referrer-Policy", "origin-when-cross-origin");

  // Additional security headers
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "SAMEORIGIN");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling Preflight Request");
    res.sendStatus(200);
    return;
  }

  next();
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/venue", venueRoutes);
app.use("/api/venue/activity-facility", activityFacilityRoutes);
app.use("/api/venue/slot", slotRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/devscript", devScriptRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (_req, res) => {
  res.send("Backend is running");
});

export default app;
