import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "@configs";
import { logger, errorHandler, notFound } from "@middlewares";
import routes from "@routes";

export function createApp(): Express {
  const app = express();

  const corsOrigins = config.CORS_ORIGIN.split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  // Middlewares
  app.use(
    cors({
      origin: corsOrigins.length <= 1 ? corsOrigins[0] : corsOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(logger);

  // Ignore favicon requests
  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  // Routes
  app.get("/", (_req, res) => {
    res.json({
      message: `Welcome to ${config.APP_NAME}`,
      status: "running",
      version: "1.0.0",
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", routes);

  // 404 handler
  app.use(notFound);

  // Global error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
