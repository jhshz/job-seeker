import mongoose from "mongoose";
import { config } from "./env.config";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.DATABASE_URL!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
};
