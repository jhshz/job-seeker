import dotenv from "dotenv";
import type { Config } from "@types";

dotenv.config();

export const config: Config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // App
  APP_NAME: process.env.APP_NAME || "NotesApp Backend",

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

  // Database
  DATABASE_URL:
    process.env.DATABASE_URL || "mongodb://localhost:27017/notesapp_db",

  // JWT
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET || "access_token_secret_key",
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || "refresh_token_secret_key",
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
};
