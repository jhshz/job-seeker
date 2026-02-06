// packages/backend/src/utils/api-response.ts
import type { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code?: string; message: string; details?: unknown };
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse["meta"],
): void {
  const body: ApiResponse<T> = { success: true, data };
  if (meta && Object.keys(meta).length > 0) body.meta = meta;
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code?: string,
  details?: unknown,
): void {
  res.status(statusCode).json({
    success: false,
    error: { message, ...(code && { code }), ...(details !== undefined && { details }) },
  });
}
