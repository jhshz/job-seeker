import mongoose from "mongoose";
import { config } from "./env.config";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.DATABASE_URL!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
