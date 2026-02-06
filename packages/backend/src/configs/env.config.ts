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
  // Comma-separated list is supported (e.g. "http://localhost:5173,http://localhost:3000")
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

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

  // Auth config
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10),
  OTP_RESEND_COOLDOWN_SECONDS: parseInt(
    process.env.OTP_RESEND_COOLDOWN_SECONDS || "60",
    10,
  ),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10),
  REFRESH_TOKEN_MIN_TTL_DAYS: parseInt(
    process.env.REFRESH_TOKEN_MIN_TTL_DAYS || "30",
    10,
  ),
  REFRESH_TOKEN_MAX_TTL_DAYS: parseInt(
    process.env.REFRESH_TOKEN_MAX_TTL_DAYS || "90",
    10,
  ),

  // Kavenegar SMS (OTP) - https://github.com/kavenegar/kavenegar-node
  KAVENGAR_API_KEY: process.env.KAVENGAR_API_KEY || "",
  KAVENGAR_TEMPLATE: process.env.KAVENGAR_TEMPLATE_ID || process.env.KAVENGAR_TEMPLATE || "",
  KAVENGAR_SENDER: process.env.KAVENGAR_SENDER || "",
};
