import app from "./app";
import { connectDatabase } from "./config/db";

// Ensure DB connection before handling requests
let isConnected = false;

export default async (req, res) => {
  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }
  return app(req, res);
};