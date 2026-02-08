// packages/backend/src/controllers/auth.controller.ts
import type { Request, Response } from "express";
import { authService, tokenService, otpService } from "@services";
import { User } from "@models";
import {
  sendSuccess,
  setAuthCookies,
  clearAuthCookies,
  getRefreshTokenFromCookie,
  catchAsync,
  normalizePhoneE164,
} from "@utils";
import { AppError } from "@middlewares";

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function getUserAgent(req: Request): string {
  return req.headers["user-agent"] || "unknown";
}

export const requestOtp = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { phoneE164, purpose } = req.body;
  const phone = typeof phoneE164 === "string" ? phoneE164 : String(phoneE164);
  let normalized: string;
  try {
    normalized = normalizePhoneE164(phone);
  } catch {
    throw new AppError("Invalid phone number format", 400, false, "INVALID_PHONE");
  }
  const { requestId, expiresAt } = await otpService.createOtpRequest({
    phoneE164: normalized,
    purpose,
    requestIp: getClientIp(req),
    userAgent: getUserAgent(req),
  });
  sendSuccess(res, { requestId, message: "OTP sent successfully", expiresAt });
});

export const verifyOtp = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { phoneE164, purpose, code, role, fullName, companyName } = req.body;
  const result = await authService.verifyOtpAndLogin(
    phoneE164,
    purpose,
    code,
    getClientIp(req),
    getUserAgent(req),
    role,
    fullName,
    companyName,
  );
  setAuthCookies(res, result.tokens.refreshToken);
  sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken });
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { phoneE164, password } = req.body;
  const result = await authService.passwordLogin(
    { phoneE164, password },
    getClientIp(req),
    getUserAgent(req),
  );
  setAuthCookies(res, result.tokens.refreshToken);
  sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken });
});

export const setPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Authentication required", 401, false, "AUTH_REQUIRED");
  const { newPassword } = req.body;
  await authService.setPassword({ userId: req.user.id, newPassword });
  sendSuccess(res, { message: "Password set successfully" });
});

export const refresh = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tokenFromCookie = getRefreshTokenFromCookie(req.headers.cookie);
  const tokenFromBody = req.body?.refreshToken;
  const refreshToken = tokenFromCookie || tokenFromBody;
  if (!refreshToken) {
    throw new AppError("Refresh token required", 400, false, "REFRESH_TOKEN_REQUIRED");
  }
  const refreshTokenDoc = await tokenService.verifyRefreshToken(refreshToken);
  const user = await User.findById(refreshTokenDoc.userId);
  if (!user) throw new AppError("User not found", 404, false, "USER_NOT_FOUND");
  const newRefreshToken = await tokenService.rotateRefreshToken(
    refreshToken,
    user,
    getClientIp(req),
    getUserAgent(req),
  );
  const accessToken = tokenService.generateAccessToken({
    userId: user._id.toString(),
    phoneE164: user.phoneE164,
    passwordVersion: user.passwordVersion,
  });
  setAuthCookies(res, newRefreshToken);
  sendSuccess(res, { accessToken });
});

export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tokenFromCookie = getRefreshTokenFromCookie(req.headers.cookie);
  const tokenFromBody = req.body?.refreshToken;
  const refreshToken = tokenFromCookie || tokenFromBody;
  if (refreshToken) await tokenService.revokeRefreshToken(refreshToken);
  clearAuthCookies(res);
  sendSuccess(res, { message: "Logged out successfully" });
});

export const logoutAll = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Authentication required", 401, false, "AUTH_REQUIRED");
  await tokenService.revokeAllUserTokens(req.user.id);
  clearAuthCookies(res);
  sendSuccess(res, { message: "Logged out from all devices" });
});

export const getMe = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Authentication required", 401, false, "AUTH_REQUIRED");
  const user = await authService.getCurrentUser(req.user.id);
  sendSuccess(res, user);
});
