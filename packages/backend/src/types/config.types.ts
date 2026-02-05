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
}
