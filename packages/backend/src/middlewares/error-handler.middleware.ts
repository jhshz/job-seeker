import type { Request, Response, NextFunction } from "express";
import { config } from "@configs";

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
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    url: req.url,
    method: req.method,
    stack: config.NODE_ENV === "development" ? err.stack : undefined,
  });

  const statusCode = err instanceof AppError ? err.statusCode : 500;

  const response: {
    code?: string;
    message: string;
    details?: unknown;
    timestamp?: string;
    path?: string;
    stack?: string;
  } = {
    message: err.message || "Internal Server Error",
  };

  if (err instanceof AppError) {
    if (err.code) {
      response.code = err.code;
    }
    if (err.details) {
      response.details = err.details;
    }
  }

  if (config.NODE_ENV === "development") {
    response.timestamp = new Date().toISOString();
    response.path = req.path;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
