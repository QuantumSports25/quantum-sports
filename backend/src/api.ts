import app from "./app";
import { connectDatabase } from "./config/db";

// Ensure DB connection before handling requests
let isConnected = false;

export default async (req: any, res: any) => {
  try {
    if (!isConnected) {
      await connectDatabase();
      isConnected = true;
    }
    return app(req, res);
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};