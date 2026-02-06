import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error-handler.middleware";

export function notFound(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const error = new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404);
  next(error);
}
