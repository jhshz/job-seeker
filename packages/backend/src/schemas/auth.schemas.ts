// packages/backend/src/schemas/auth.schemas.ts
import { z } from "zod";
import { phoneE164Schema } from "./common.schemas";

export const otpRequestSchema = z.object({
  phoneE164: phoneE164Schema,
  purpose: z.enum(["login", "register"], {
    message: "Purpose must be 'login' or 'register'",
  }),
});

export const otpVerifySchema = z.object({
  phoneE164: phoneE164Schema,
  purpose: z.enum(["login", "register"]),
  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const passwordLoginSchema = z.object({
  phoneE164: phoneE164Schema,
  password: z.string().min(1, "Password is required"),
});

export const setPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const logoutSchema = z.object({});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
