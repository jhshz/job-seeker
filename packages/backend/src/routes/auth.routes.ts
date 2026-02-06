import { Router } from "express";
import { authController } from "@controllers";
import {
  requireAuth,
  validateRequest,
  otpRequestRateLimiter,
} from "@middlewares";
import {
  otpRequestSchema,
  otpVerifySchema,
  passwordLoginSchema,
  setPasswordSchema,
  refreshTokenSchema,
  logoutSchema,
} from "@schemas";

const router = Router();

/**
 * POST /api/auth/otp/request
 * Request OTP for login/register
 */
router.post(
  "/otp/request",
  otpRequestRateLimiter,
  validateRequest({ body: otpRequestSchema }),
  (req, res, next) => {
    authController.requestOtp(req, res).catch(next);
  },
);

/**
 * POST /api/auth/otp/verify
 * Verify OTP and login/register
 */
router.post(
  "/otp/verify",
  validateRequest({ body: otpVerifySchema }),
  (req, res, next) => {
    authController.verifyOtp(req, res).catch(next);
  },
);

/**
 * POST /api/auth/password/login
 * Login with phone and password
 */
router.post(
  "/password/login",
  validateRequest({ body: passwordLoginSchema }),
  (req, res, next) => {
    authController.passwordLogin(req, res).catch(next);
  },
);

/**
 * POST /api/auth/password/set
 * Set password (requires authentication)
 */
router.post(
  "/password/set",
  requireAuth,
  validateRequest({ body: setPasswordSchema }),
  (req, res, next) => {
    authController.setPassword(req, res).catch(next);
  },
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
  "/refresh",
  validateRequest({ body: refreshTokenSchema }),
  (req, res, next) => {
    authController.refreshToken(req, res).catch(next);
  },
);

/**
 * POST /api/auth/logout
 * Logout (revoke single refresh token)
 */
router.post(
  "/logout",
  validateRequest({ body: logoutSchema }),
  (req, res, next) => {
    authController.logout(req, res).catch(next);
  },
);

/**
 * POST /api/auth/logout-all
 * Logout from all devices (requires authentication)
 */
router.post("/logout-all", requireAuth, (req, res, next) => {
  authController.logoutAll(req, res).catch(next);
});

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
router.get("/me", requireAuth, (req, res, next) => {
  authController.getCurrentUser(req, res).catch(next);
});

export default router;
