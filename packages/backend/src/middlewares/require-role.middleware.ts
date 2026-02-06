// packages/backend/src/middlewares/require-role.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error-handler.middleware";
import type { Role } from "@types";

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, false, "AUTH_REQUIRED"));
      return;
    }
    const hasRole = allowedRoles.some((r) => req.user!.roles.includes(r));
    if (!hasRole) {
      next(new AppError("Forbidden", 403, false, "FORBIDDEN"));
      return;
    }
    next();
  };
}
