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
  /** Role for new user when purpose is "register" */
  role: z.enum(["seeker", "recruiter"]).optional(),
});

export const passwordLoginSchema = z.object({
  phoneE164: phoneSchema,
  password: z.string().min(1, "رمز عبور الزامی است"),
});

/** فقط حروف انگلیسی، اعداد انگلیسی (۰-۹ رد می‌شود) و کاراکترهای خاص مجاز */
const ONLY_ENGLISH_AND_ASCII =
  /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;':",.<>?/\\`~]+$/;

export const passwordFieldSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .max(128, "رمز عبور حداکثر ۱۲۸ کاراکتر")
  .regex(/[a-zA-Z]/, "رمز عبور باید حداقل یک حرف انگلیسی داشته باشد")
  .regex(/[0-9]/, "رمز عبور باید حداقل یک عدد انگلیسی داشته باشد")
  .regex(/[^a-zA-Z0-9]/, "رمز عبور باید حداقل یک کاراکتر خاص (مثل !@#$%) داشته باشد")
  .refine(
    (p) => ONLY_ENGLISH_AND_ASCII.test(p),
    "رمز عبور فقط باید شامل حروف انگلیسی، اعداد انگلیسی و کاراکترهای مجاز باشد (بدون حروف یا اعداد فارسی)",
  );

export const registerFormSchema = z
  .object({
    phoneE164: phoneSchema,
    purpose: z.literal("register"),
    role: z.enum(["seeker", "recruiter"], { message: "نقش را انتخاب کنید" }),
    fullName: z.string().max(200).optional(),
    companyName: z.string().max(200).optional(),
    password: passwordFieldSchema,
    confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),
  })
  .refine((data) => data.role !== "seeker" || (data.fullName?.trim()?.length ?? 0) > 0, {
    message: "نام و نام خانوادگی الزامی است",
    path: ["fullName"],
  })
  .refine((data) => data.role !== "recruiter" || (data.companyName?.trim()?.length ?? 0) > 0, {
    message: "نام شرکت الزامی است",
    path: ["companyName"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
export type RegisterFormInput = z.infer<typeof registerFormSchema>;
