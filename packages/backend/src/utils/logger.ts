// packages/backend/src/utils/logger.ts

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(`[${new Date().toISOString()}] INFO ${msg}`, meta ?? "");
  },
  error: (msg: string, err?: unknown) => {
    console.error(`[${new Date().toISOString()}] ERROR ${msg}`, err ?? "");
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(`[${new Date().toISOString()}] WARN ${msg}`, meta ?? "");
  },
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (isDev) console.debug(`[${new Date().toISOString()}] DEBUG ${msg}`, meta ?? "");
  },
};
