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
  /** Role for new user when purpose is "register" */
  role: z.enum(["seeker", "recruiter"]).optional(),
  /** Full name for seeker when purpose is "register" and role is "seeker" */
  fullName: z.string().max(200).trim().optional(),
  /** Company name for recruiter when purpose is "register" and role is "recruiter" */
  companyName: z.string().min(1).max(200).trim().optional(),
});

export const passwordLoginSchema = z.object({
  phoneE164: phoneE164Schema,
  password: z.string().min(1, "Password is required"),
});

/** Only English letters, English digits (0-9), and ASCII special chars allowed */
const PASSWORD_ASCII_ONLY = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;':",.<>?/\\`~]+$/;

export const setPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one English letter")
    .regex(/[0-9]/, "Password must contain at least one English digit")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
    .refine(
      (p) => PASSWORD_ASCII_ONLY.test(p),
      "Password must contain only English letters, English digits, and allowed special characters",
    ),
});

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const logoutSchema = z.object({});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
