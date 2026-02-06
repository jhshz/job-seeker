import type { Request, Response } from "express";
import { otpService, authService, tokenService } from "@services";
import { normalizeIranPhoneToE164 } from "@utils";
import { AppError } from "@middlewares";
import { User } from "@models";
import type {
  OtpRequestPayload,
  OtpVerifyPayload,
  PasswordLoginPayload,
  SetPasswordPayload,
  RefreshTokenPayload,
  LogoutPayload,
} from "@types";

/**
 * Get client IP address
 */
function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

/**
 * Get client user agent
 */
function getUserAgent(req: Request): string {
  return req.headers["user-agent"] || "unknown";
}

/**
 * Auth Controller
 */
export class AuthController {
  /**
   * POST /api/auth/otp/request
   * Request OTP for login/register
   */
  async requestOtp(req: Request, res: Response): Promise<void> {
    const { phone, purpose } = req.body as OtpRequestPayload;

    try {
      // Normalize phone
      const phoneE164 = normalizeIranPhoneToE164(phone);

      // Create OTP request
      const { requestId, expiresAt } = await otpService.createOtpRequest({
        phoneE164,
        purpose,
        requestIp: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      // Generic response (doesn't leak if user exists)
      res.status(200).json({
        requestId,
        message: "OTP sent successfully",
        expiresAt,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid phone")) {
        throw new AppError("Invalid phone number format", 400, false, "INVALID_PHONE");
      }
      throw error;
    }
  }

  /**
   * POST /api/auth/otp/verify
   * Verify OTP and login/register
   */
  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { requestId, code } = req.body as OtpVerifyPayload;

    const result = await authService.verifyOtpAndLogin(
      requestId,
      code,
      getClientIp(req),
      getUserAgent(req),
    );

    res.status(200).json(result);
  }

  /**
   * POST /api/auth/password/login
   * Login with phone and password
   */
  async passwordLogin(req: Request, res: Response): Promise<void> {
    const { phone, password } = req.body as PasswordLoginPayload;

    try {
      const result = await authService.passwordLogin(
        { phone, password },
        getClientIp(req),
        getUserAgent(req),
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 409) {
        throw new AppError(
          "Password not set for this account",
          409,
          false,
          "PASSWORD_NOT_SET",
        );
      }
      throw error;
    }
  }

  /**
   * POST /api/auth/password/set
   * Set password (requires authentication)
   */
  async setPassword(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Authentication required", 401, false, "AUTH_REQUIRED");
    }

    const { newPassword } = req.body as SetPasswordPayload;

    await authService.setPassword({
      userId: req.user.id,
      newPassword,
    });

    res.status(200).json({
      message: "Password set successfully",
    });
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as RefreshTokenPayload;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400, false, "REFRESH_TOKEN_REQUIRED");
    }

    // Verify refresh token
    const refreshTokenDoc = await tokenService.verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findById(refreshTokenDoc.userId);

    if (!user) {
      throw new AppError("User not found", 404, false, "USER_NOT_FOUND");
    }

    // Rotate refresh token
    const newRefreshToken = await tokenService.rotateRefreshToken(
      refreshToken,
      user,
      getClientIp(req),
      getUserAgent(req),
    );

    // Generate new access token
    const accessToken = tokenService.generateAccessToken({
      userId: user._id.toString(),
      phoneE164: user.phoneE164,
      passwordVersion: user.passwordVersion,
    });

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  }

  /**
   * POST /api/auth/logout
   * Logout (revoke single refresh token)
   */
  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as LogoutPayload;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400, false, "REFRESH_TOKEN_REQUIRED");
    }

    await tokenService.revokeRefreshToken(refreshToken);

    res.status(200).json({
      message: "Logged out successfully",
    });
  }

  /**
   * POST /api/auth/logout-all
   * Logout from all devices (requires authentication)
   */
  async logoutAll(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Authentication required", 401, false, "AUTH_REQUIRED");
    }

    await tokenService.revokeAllUserTokens(req.user.id);

    res.status(200).json({
      message: "Logged out from all devices successfully",
    });
  }

  /**
   * GET /api/auth/me
   * Get current user (requires authentication)
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Authentication required", 401, false, "AUTH_REQUIRED");
    }

    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json(user);
  }
}

export const authController = new AuthController();
