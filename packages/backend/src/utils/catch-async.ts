// packages/backend/src/utils/catch-async.ts
import type { Request, Response, NextFunction } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps async route handlers to forward errors to errorHandler middleware.
 */
export function catchAsync(fn: AsyncHandler): AsyncHandler {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}
