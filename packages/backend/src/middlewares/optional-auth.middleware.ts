// packages/backend/src/middlewares/optional-auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { tokenService } from "@services";
import { User } from "@models";

/**
 * Attaches req.user if valid Bearer token present; otherwise continues without user.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = tokenService.verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (!user || user.passwordVersion !== payload.passwordVersion) {
      next();
      return;
    }
    req.user = {
      id: user._id.toString(),
      phoneE164: user.phoneE164,
      passwordVersion: user.passwordVersion,
      roles: user.roles,
    };
  } catch {
    // ignore invalid token
  }
  next();
}
