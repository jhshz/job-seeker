import { Button, Field, Input, Stack, Tabs } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpRequestSchema, passwordLoginSchema } from "@/schemas/auth.schemas";
import type { z } from "zod";
import { useRequestOtp, useLoginPassword } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router";

type OtpForm = z.infer<typeof otpRequestSchema>;
type PasswordForm = z.infer<typeof passwordLoginSchema>;

export function Login() {
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
      <Tabs.Root defaultValue="otp" variant="enclosed" fitted>
        <Tabs.List>
          <Tabs.Trigger value="otp">ورود با کد تایید</Tabs.Trigger>
          <Tabs.Trigger value="password">ورود با رمز عبور</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="otp">
          <form onSubmit={onOtpSubmit}>
            <Stack gap="4" pt="4">
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
              <Button type="submit" loading={requestOtp.isPending}>
                دریافت کد تایید
              </Button>
            </Stack>
          </form>
        </Tabs.Content>
        <Tabs.Content value="password">
          <form onSubmit={onPasswordSubmit}>
            <Stack gap="4" pt="4">
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
        </Tabs.Content>
      </Tabs.Root>
      <Stack direction="row" justify="center" gap="2">
        <span>حساب کاربری ندارید؟</span>
        <Link to="/auth/register">ثبت‌نام</Link>
      </Stack>
    </Stack>
  );
}
