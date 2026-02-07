import { z } from "zod";

function toE164(s: string): string {
  const t = s.trim().replace(/[\s-]/g, "");
  if (t.startsWith("+98")) return t;
  if (t.startsWith("0098")) return "+98" + t.slice(4);
  if (t.startsWith("98") && t.length >= 12) return "+" + t;
  if (t.startsWith("09")) return "+98" + t.slice(1);
  if (t.startsWith("9") && t.length === 10) return "+98" + t;
  return t;
}

const phoneSchema = z
  .string()
  .min(1, "شماره موبایل الزامی است")
  .transform(toE164)
  .refine((s) => /^\+98[0-9]{10}$/.test(s), "شماره موبایل نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)");

export const otpRequestSchema = z.object({
  phoneE164: phoneSchema,
  purpose: z.enum(["login", "register"], { message: "نوع درخواست نامعتبر است" }),
});

export const otpVerifySchema = z.object({
  phoneE164: phoneSchema,
  purpose: z.enum(["login", "register"]),
  code: z
    .string()
    .length(6, "کد تایید باید ۶ رقم باشد")
    .regex(/^\d{6}$/, "کد تایید باید فقط شامل اعداد باشد"),
});

export const passwordLoginSchema = z.object({
  phoneE164: phoneSchema,
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
