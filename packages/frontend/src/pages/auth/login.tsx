import { useState } from "react";
import { Button, Field, Input, Stack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpRequestSchema, passwordLoginSchema } from "@/schemas/auth.schemas";
import type { z } from "zod";
import { useRequestOtp, useLoginPassword } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

type OtpForm = z.infer<typeof otpRequestSchema>;
type PasswordForm = z.infer<typeof passwordLoginSchema>;

export function Login() {
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const navigate = useNavigate();
  const requestOtp = useRequestOtp();
  const loginPassword = useLoginPassword();

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { phoneE164: "", purpose: "login" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { phoneE164: "", password: "" },
  });

  const onOtpSubmit = otpForm.handleSubmit((data) => {
    requestOtp.mutate(data, {
      onSuccess: () => {
        navigate("/auth/otp-verify", {
          state: { phoneE164: data.phoneE164, purpose: data.purpose },
        });
      },
    });
  });

  const onPasswordSubmit = passwordForm.handleSubmit((data) => {
    loginPassword.mutate(data);
  });

  return (
    <Stack gap="6">
      <Stack gap="4">
        <Button
          variant={mode === "otp" ? "solid" : "outline"}
          onClick={() => setMode("otp")}
        >
          ورود با کد تایید
        </Button>
        <Button
          variant={mode === "password" ? "solid" : "outline"}
          onClick={() => setMode("password")}
        >
          ورود با رمز عبور
        </Button>
      </Stack>

      {mode === "otp" ? (
        <form onSubmit={onOtpSubmit}>
          <Stack gap="4">
            <Field.Root invalid={!!otpForm.formState.errors.phoneE164}>
              <Field.Label>شماره موبایل</Field.Label>
              <Input
                {...otpForm.register("phoneE164")}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
              />
              <Field.ErrorText>
                {otpForm.formState.errors.phoneE164?.message}
              </Field.ErrorText>
            </Field.Root>
            <Field.Root>
              <Field.Label>نوع</Field.Label>
              <select
                {...otpForm.register("purpose")}
                style={{ padding: "8px", width: "100%" }}
              >
                <option value="login">ورود</option>
                <option value="register">ثبت‌نام</option>
              </select>
            </Field.Root>
            <Button type="submit" loading={requestOtp.isPending}>
              دریافت کد تایید
            </Button>
          </Stack>
        </form>
      ) : (
        <form onSubmit={onPasswordSubmit}>
          <Stack gap="4">
            <Field.Root invalid={!!passwordForm.formState.errors.phoneE164}>
              <Field.Label>شماره موبایل</Field.Label>
              <Input
                {...passwordForm.register("phoneE164")}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
              />
              <Field.ErrorText>
                {passwordForm.formState.errors.phoneE164?.message}
              </Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!passwordForm.formState.errors.password}>
              <Field.Label>رمز عبور</Field.Label>
              <Input
                {...passwordForm.register("password")}
                type="password"
                placeholder="رمز عبور"
              />
              <Field.ErrorText>
                {passwordForm.formState.errors.password?.message}
              </Field.ErrorText>
            </Field.Root>
            <Button type="submit" loading={loginPassword.isPending}>
              ورود
            </Button>
          </Stack>
        </form>
      )}
    </Stack>
  );
}
