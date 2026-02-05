import type { Request, Response, NextFunction } from "express";
import { config } from "@configs";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
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
    success: boolean;
    error: string;
    timestamp: string;
    path: string;
    stack?: string;
  } = {
    success: false,
    error: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (config.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
