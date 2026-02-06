export interface Config {
  PORT: string | number;
  NODE_ENV: string;
  APP_NAME: string;
  CORS_ORIGIN: string;
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string | number;
  REFRESH_TOKEN_EXPIRY: string | number;
  // Auth config
  OTP_EXPIRY_MINUTES: number;
  OTP_RESEND_COOLDOWN_SECONDS: number;
  OTP_MAX_ATTEMPTS: number;
  REFRESH_TOKEN_MIN_TTL_DAYS: number;
  REFRESH_TOKEN_MAX_TTL_DAYS: number;
  // Kavenegar SMS (OTP)
  KAVENGAR_API_KEY: string;
  KAVENGAR_TEMPLATE: string;
  KAVENGAR_SENDER: string;
}
