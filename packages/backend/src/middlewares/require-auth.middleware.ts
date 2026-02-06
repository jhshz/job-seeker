// packages/backend/src/middlewares/require-auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { tokenService } from "@services";
import { User } from "@models";
import { AppError } from "./error-handler.middleware";
import type { RequestUser } from "@types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401, false, "AUTH_REQUIRED");
    }
    const token = authHeader.slice(7);
    const payload = tokenService.verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AppError("User not found", 401, false, "USER_NOT_FOUND");
    }
    if (user.passwordVersion !== payload.passwordVersion) {
      throw new AppError("Session expired. Please login again", 401, false, "SESSION_EXPIRED");
    }
    req.user = {
      id: user._id.toString(),
      phoneE164: user.phoneE164,
      passwordVersion: user.passwordVersion,
      roles: user.roles,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) next(error);
    else next(new AppError("Invalid authentication token", 401, false, "INVALID_TOKEN"));
  }
}
