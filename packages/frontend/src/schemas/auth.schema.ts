import { z } from "zod";

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "شماره موبایل الزامی است")
    .regex(/^[\d\s\-+]+$/, "شماره موبایل نامعتبر است"),
});

export const passwordSchema = phoneSchema.extend({
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export const otpSchema = z.object({
  code: z
    .string()
    .min(1, "کد تایید الزامی است")
    .regex(/^\d+$/, "کد تایید باید عدد باشد")
    .length(6, "کد تایید باید ۶ رقم باشد"),
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
