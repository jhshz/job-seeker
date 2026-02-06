// packages/backend/src/middlewares/error-handler.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { config } from "@configs";
import { logger } from "@utils";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(err.message, config.NODE_ENV === "development" ? err.stack : undefined);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const response: {
    success: false;
    data?: never;
    error: { code?: string; message: string; details?: unknown };
    meta?: { timestamp: string; path: string; stack?: string };
  } = {
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      ...(err instanceof AppError && err.code && { code: err.code }),
      ...(err instanceof AppError && err.details !== undefined && { details: err.details }),
    },
  };

  if (config.NODE_ENV === "development") {
    response.meta = {
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(err.stack && { stack: err.stack }),
    };
  }

  res.status(statusCode).json(response);
}
