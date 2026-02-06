// packages/backend/src/utils/cookies.ts
import type { Response } from "express";
import { config } from "@configs";

const COOKIE_NAME = "refreshToken";

const defaultOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api/auth",
};

export function setAuthCookies(
  res: Response,
  refreshToken: string,
  maxAgeDays = 7,
): void {
  res.cookie(COOKIE_NAME, refreshToken, {
    ...defaultOptions,
    maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(COOKIE_NAME, { ...defaultOptions, path: "/api/auth" });
}

export function getRefreshTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  return value != null ? decodeURIComponent(value.trim()) : null;
}

export const REFRESH_COOKIE_NAME = COOKIE_NAME;
