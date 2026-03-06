// src/config/mongooseConnect.ts

import mongoose from "mongoose";
import logger from "../libs/winstonLogger";

const connectDBFn = async (): Promise<void> => {
  const dbUrl = process.env.DB_URL;

  if (!dbUrl) {
    logger.error("DB_URL is not defined in environment variables.");
    process.exit(1);
  }

  try {
await mongoose.connect(dbUrl, {
  autoIndex: false,         // Disable auto-creation of indexes in production
  serverSelectionTimeoutMS: 5000, // Fail fast if server not found
  socketTimeoutMS: 45000,   // Close sockets after 45s of inactivity
});
    logger.info("Connected to DB successfully.");
  } catch (error) {
    logger.error(
      `Failed to connect to DB: ${error instanceof Error ? error.message : error}`
    );
    process.exit(1); // Ensure app exits if DB fails to connect
  }
};

export default connectDBFn;
