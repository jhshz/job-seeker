import { useState } from "react";
import {
  Box,
  Button,
  Field,
  Group,
  Input,
  Stack,
  Tabs,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpRequestSchema, passwordLoginSchema } from "@/schemas/auth.schemas";
import type { z } from "zod";
import { useRequestOtp, useLoginPassword } from "@/hooks/use-auth";
import { useNavigate, Link as RouterLink } from "react-router";
import { LuEye, LuEyeOff } from "react-icons/lu";

type OtpForm = z.infer<typeof otpRequestSchema>;
type PasswordForm = z.infer<typeof passwordLoginSchema>;

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
      onSuccess: (res) => {
        navigate("/auth/otp-verify", {
          state: {
            phoneE164: data.phoneE164,
            purpose: data.purpose,
            expiresAt: res.expiresAt,
          },
        });
      },
    });
  });

  const onPasswordSubmit = passwordForm.handleSubmit((data) => {
    loginPassword.mutate(data);
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Stack gap="6" w="full" maxW="sm">
        <Tabs.Root defaultValue="otp" variant="subtle" fitted dir="rtl">
          <Tabs.List justifyContent="stretch">
            <Tabs.Trigger value="otp" flex="1">
              ورود با کد تایید
            </Tabs.Trigger>
            <Tabs.Trigger value="password" flex="1">
              ورود با رمز عبور
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="otp">
            <form onSubmit={onOtpSubmit}>
              <Stack gap="4" pt="4">
                <Field.Root
                  invalid={!!otpForm.formState.errors.phoneE164}
                  dir="rtl"
                >
                  <Field.Label>شماره موبایل</Field.Label>
                  <Input
                    {...otpForm.register("phoneE164")}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  />
                  <Field.ErrorText>
                    {otpForm.formState.errors.phoneE164?.message}
                  </Field.ErrorText>
                </Field.Root>
                <Button type="submit" loading={requestOtp.isPending} w="full">
                  دریافت کد تایید
                </Button>
              </Stack>
            </form>
          </Tabs.Content>
          <Tabs.Content value="password">
            <form onSubmit={onPasswordSubmit}>
              <Stack gap="4" pt="4">
                <Field.Root
                  invalid={!!passwordForm.formState.errors.phoneE164}
                  dir="rtl"
                >
                  <Field.Label>شماره موبایل</Field.Label>
                  <Input
                    {...passwordForm.register("phoneE164")}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  />
                  <Field.ErrorText>
                    {passwordForm.formState.errors.phoneE164?.message}
                  </Field.ErrorText>
                </Field.Root>
                <Field.Root
                  invalid={!!passwordForm.formState.errors.password}
                  dir="rtl"
                >
                  <Field.Label>رمز عبور</Field.Label>
                  <Group attached w="full">
                    <Input
                      flex="1"
                      {...passwordForm.register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="رمز عبور"
                    />
                    <Button
                      type="button"
                      aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                      bg="bg.subtle"
                      variant="outline"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? <LuEyeOff /> : <LuEye />}
                    </Button>
                  </Group>
                  <Field.ErrorText>
                    {passwordForm.formState.errors.password?.message}
                  </Field.ErrorText>
                </Field.Root>
                <Button
                  type="submit"
                  loading={loginPassword.isPending}
                  w="full"
                >
                  ورود
                </Button>
              </Stack>
            </form>
          </Tabs.Content>
        </Tabs.Root>
        <Box display="flex" alignItems="center" justifyContent="center" gap="2">
          <span>حساب کاربری ندارید؟</span>
          <Button asChild variant="ghost" colorPalette="green">
            <RouterLink to="/auth/register">ثبت‌نام</RouterLink>
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
