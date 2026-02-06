import type { Request, Response, NextFunction } from "express";
import { tokenService } from "@services";
import { User } from "@models";
import { AppError } from "./error-handler.middleware";

/**
 * Extend Express Request to include user
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phoneE164: string;
        passwordVersion: number;
      };
    }
  }
}

/**
 * Middleware to require authentication
 * Extracts and verifies JWT token from Authorization header
 */
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

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const payload = tokenService.verifyAccessToken(token);

    // Verify user exists and password version matches
    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError("User not found", 401, false, "USER_NOT_FOUND");
    }

    // Check if password was changed (token invalidation)
    if (user.passwordVersion !== payload.passwordVersion) {
      throw new AppError(
        "Session expired. Please login again",
        401,
        false,
        "SESSION_EXPIRED",
      );
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      phoneE164: user.phoneE164,
      passwordVersion: user.passwordVersion,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Invalid authentication token", 401, false, "INVALID_TOKEN"));
    }
  }
}
