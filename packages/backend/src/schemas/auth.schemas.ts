import { z } from "zod";

/**
 * Zod schemas for authentication endpoints
 */

export const otpRequestSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[\d\s\-+]+$/, "Phone number contains invalid characters"),
  purpose: z.enum(["login", "register"], {
    error: "Purpose must be 'login' or 'register'",
  }),
});

export const otpVerifySchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  code: z
    .string()
    .length(6, "OTP code must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP code must contain only digits"),
});

export const passwordLoginSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[\d\s\-+]+$/, "Phone number contains invalid characters"),
  password: z.string().min(1, "Password is required"),
});

export const setPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
