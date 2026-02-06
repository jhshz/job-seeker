import { Box, Button, Input, Stack, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { requestOtp, setPassword, verifyOtp } from "@/api/auth.api";
import { toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/stores/auth.store";

const requestSchema = z.object({
  phone: z
    .string()
    .min(1, "شماره موبایل الزامی است")
    .regex(/^[\d\s\-+]+$/, "شماره موبایل نامعتبر است"),
});
type RequestValues = z.infer<typeof requestSchema>;

const verifySchema = z.object({
  code: z
    .string()
    .length(6, "کد باید ۶ رقم باشد")
    .regex(/^\d{6}$/, "کد فقط باید عدد باشد"),
});
type VerifyValues = z.infer<typeof verifySchema>;

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
    confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),
  })
  .refine(v => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "تکرار رمز عبور مطابقت ندارد",
  });
type SetPasswordValues = z.infer<typeof setPasswordSchema>;

function getApiErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ message?: string }>;
  return err.response?.data?.message || err.message || "خطایی رخ داد";
}

type Step = "request" | "verify" | "setPassword";

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const [step, setStep] = useState<Step>("request");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>("");

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: requestErrors },
  } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { phone: "" },
  });

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: verifyErrors },
  } = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const {
    register: registerSetPassword,
    handleSubmit: handleSubmitSetPassword,
    formState: { errors: setPasswordErrors },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const otpRequestMutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: (data, vars) => {
      setRequestId(data.requestId);
      setPhone(vars.phone);
      setStep("verify");
      toaster.create({
        type: "success",
        title: "کد ارسال شد",
        description: "کد تایید را وارد کنید",
      });
    },
    onError: error => {
      toaster.create({
        type: "error",
        title: "ارسال کد ناموفق",
        description: getApiErrorMessage(error),
      });
    },
  });

  const otpVerifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: data => {
      // If your backend returns auth data here, keep setAuth.
      // If it returns only "ok", remove setAuth and just go next step.
      setAuth(data);

      setStep("setPassword");
      toaster.create({
        type: "success",
        title: "تایید موفق",
        description: "در صورت تمایل رمز عبور تعیین کنید",
      });
    },
    onError: error => {
      toaster.create({
        type: "error",
        title: "تایید ناموفق",
        description: getApiErrorMessage(error),
      });
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      toaster.create({ type: "success", title: "رمز عبور تنظیم شد" });
      navigate("/");
    },
    onError: error => {
      toaster.create({
        type: "error",
        title: "تنظیم رمز عبور ناموفق",
        description: getApiErrorMessage(error),
      });
    },
  });

  const canVerify = useMemo(() => Boolean(requestId), [requestId]);

  return (
    <Stack gap="4">
      {step === "request" ? (
        <Box
          as="form"
          onSubmit={handleSubmitRequest(values =>
            otpRequestMutation.mutate({ phone: values.phone, purpose: "register" })
          )}
        >
          <Stack gap="4">
            <Stack gap="1">
              <Text fontWeight="medium">شماره موبایل</Text>
              <Input
                placeholder="مثلا 09123456789"
                autoComplete="tel"
                inputMode="tel"
                {...registerRequest("phone")}
              />
              {requestErrors.phone?.message ? (
                <Text color="red.500" fontSize="sm">
                  {requestErrors.phone.message}
                </Text>
              ) : null}
            </Stack>

            <Button type="submit" disabled={otpRequestMutation.isPending} width="full">
              {otpRequestMutation.isPending ? "در حال ارسال..." : "ارسال کد تایید"}
            </Button>
          </Stack>
        </Box>
      ) : null}

      {step === "verify" ? (
        <Box
          as="form"
          onSubmit={handleSubmitVerify(values => {
            if (!requestId) return;
            otpVerifyMutation.mutate({ requestId, code: values.code });
          })}
        >
          <Stack gap="4">
            <Text color="fg.muted">شماره: {phone}</Text>

            <Stack gap="1">
              <Text fontWeight="medium">کد تایید</Text>
              <Input
                placeholder="۶ رقم"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                {...registerVerify("code")}
              />
              {verifyErrors.code?.message ? (
                <Text color="red.500" fontSize="sm">
                  {verifyErrors.code.message}
                </Text>
              ) : null}
            </Stack>

            <Stack gap="2">
              <Button
                type="submit"
                disabled={!canVerify || otpVerifyMutation.isPending}
                width="full"
              >
                {otpVerifyMutation.isPending ? "در حال تایید..." : "تایید کد"}
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setStep("request");
                  setRequestId(null);
                  setPhone("");
                }}
                width="full"
              >
                تغییر شماره
              </Button>
            </Stack>
          </Stack>
        </Box>
      ) : null}

      {step === "setPassword" ? (
        <Box
          as="form"
          onSubmit={handleSubmitSetPassword(values =>
            setPasswordMutation.mutate({ newPassword: values.newPassword })
          )}
        >
          <Stack gap="4">
            <Text color="fg.muted">می‌توانید برای ورودهای بعدی رمز عبور تعیین کنید (اختیاری).</Text>

            <Stack gap="1">
              <Text fontWeight="medium">رمز عبور</Text>
              <Input
                type="password"
                autoComplete="new-password"
                {...registerSetPassword("newPassword")}
              />
              {setPasswordErrors.newPassword?.message ? (
                <Text color="red.500" fontSize="sm">
                  {setPasswordErrors.newPassword.message}
                </Text>
              ) : null}
            </Stack>

            <Stack gap="1">
              <Text fontWeight="medium">تکرار رمز عبور</Text>
              <Input
                type="password"
                autoComplete="new-password"
                {...registerSetPassword("confirmPassword")}
              />
              {setPasswordErrors.confirmPassword?.message ? (
                <Text color="red.500" fontSize="sm">
                  {setPasswordErrors.confirmPassword.message}
                </Text>
              ) : null}
            </Stack>

            <Stack gap="2">
              <Button type="submit" disabled={setPasswordMutation.isPending} width="full">
                {setPasswordMutation.isPending ? "در حال ذخیره..." : "ذخیره رمز عبور"}
              </Button>

              <Button variant="outline" type="button" onClick={() => navigate("/")} width="full">
                فعلا نه، برو صفحه اصلی
              </Button>
            </Stack>
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}
