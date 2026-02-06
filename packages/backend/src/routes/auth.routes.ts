// packages/backend/src/routes/auth.routes.ts
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
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
  refreshTokenBodySchema,
  logoutSchema,
} from "@schemas";

const router = Router();

router.post(
  "/otp/request",
  otpRequestRateLimiter,
  validateRequest({ body: otpRequestSchema }),
  authController.requestOtp,
);

router.post(
  "/otp/verify",
  validateRequest({ body: otpVerifySchema }),
  authController.verifyOtp,
);

router.post(
  "/login",
  validateRequest({ body: passwordLoginSchema }),
  authController.login,
);

router.post(
  "/password/set",
  requireAuth,
  validateRequest({ body: setPasswordSchema }),
  authController.setPassword,
);

router.post(
  "/refresh",
  validateRequest({ body: refreshTokenBodySchema }),
  authController.refresh,
);

router.post("/logout", validateRequest({ body: logoutSchema }), authController.logout);

router.post("/logout-all", requireAuth, authController.logoutAll);

router.get("/me", requireAuth, authController.getMe);

export default router;
