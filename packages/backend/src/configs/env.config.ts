// packages/backend/src/configs/env.config.ts
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_NAME: z.string().default("Job Seeker Backend"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().default(60),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  REFRESH_TOKEN_MIN_TTL_DAYS: z.coerce.number().default(30),
  REFRESH_TOKEN_MAX_TTL_DAYS: z.coerce.number().default(90),
  KAVENGAR_API_KEY: z.string().default(""),
  KAVENGAR_TEMPLATE: z.string().default(""),
  KAVENGAR_SENDER: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export type Env = z.infer<typeof envSchema>;
export const config: Env = parsed.data;
