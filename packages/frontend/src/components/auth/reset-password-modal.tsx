import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import { requestOtp, setPassword, resetPasswordByOtp } from "@/api/auth.api";
import {
  setPasswordFormSchema,
  resetPasswordByOtpSchema,
} from "@/schemas/auth.schemas";
import type {
  SetPasswordFormInput,
  ResetPasswordByOtpFormInput,
} from "@/schemas/auth.schemas";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";

const RESEND_COOLDOWN_SECONDS = 60;

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

function formatRemaining(ms: number): string {
  if (ms <= 0) return "۰";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s} ثانیه`;
}

export function ResetPasswordModal({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | undefined>();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpRemainingMs, setOtpRemainingMs] = useState<number | null>(null);

  const formWithCurrent = useForm<SetPasswordFormInput>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const formWithOtp = useForm<ResetPasswordByOtpFormInput>({
    resolver: zodResolver(resetPasswordByOtpSchema),
    defaultValues: {
      phoneE164: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const requestOtpMutation = useMutation({
    mutationFn: (phoneE164: string) =>
      requestOtp({ phoneE164, purpose: "reset_password" }),
    onSuccess: (res) => {
      setOtpExpiresAt(res.expiresAt);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: (data: SetPasswordFormInput) =>
      setPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toaster.create({
        title: "رمز عبور با موفقیت تغییر کرد",
        type: "success",
      });
      onOpenChange(false);
      clearAuth();
      navigate("/auth/login", { replace: true });
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  const resetByOtpMutation = useMutation({
    mutationFn: (data: ResetPasswordByOtpFormInput) =>
      resetPasswordByOtp({
        phoneE164: data.phoneE164,
        code: data.code,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toaster.create({ title: "رمز عبور با موفقیت تغییر شد", type: "success" });
      onOpenChange(false);
      clearAuth();
      navigate("/auth/login", { replace: true });
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  useEffect(() => {
    if (!otpExpiresAt) {
      setOtpRemainingMs(null);
      return;
    }
    const update = () => {
      const ms = new Date(otpExpiresAt).getTime() - Date.now();
      setOtpRemainingMs(ms <= 0 ? 0 : ms);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(
      () => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [resendCooldown]);

  const phoneE164 = formWithOtp.watch("phoneE164");
  const handleRequestOtp = () => {
    formWithOtp.trigger("phoneE164").then((ok) => {
      if (ok && phoneE164) requestOtpMutation.mutate(phoneE164);
    });
  };

  const onWithCurrentSubmit = formWithCurrent.handleSubmit((data) =>
    setPasswordMutation.mutate(data),
  );
  const onWithOtpSubmit = formWithOtp.handleSubmit((data) =>
    resetByOtpMutation.mutate(data),
  );

  const isOtpExpired = otpRemainingMs !== null && otpRemainingMs <= 0;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content w="full" maxW="min(32rem, 95vw)" dir="rtl" p={6}>
          <Dialog.Header
            display="flex"
            flexDirection="column"
            gap="2"
            textAlign="right"
          >
            <Dialog.Title>تغییر رمز عبور</Dialog.Title>
            <Dialog.Description>
              با رمز فعلی یا با شماره تلفن و کد تأیید می‌توانید رمز را عوض کنید.
              پس از تغییر باید مجدداً وارد شوید.
            </Dialog.Description>
          </Dialog.Header>
          <Tabs.Root defaultValue="current" variant="subtle" fitted dir="rtl">
            <Tabs.List mb="4">
              <Tabs.Trigger value="current">با رمز فعلی</Tabs.Trigger>
              <Tabs.Trigger value="otp">با کد تأیید</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="current">
              <form onSubmit={onWithCurrentSubmit} dir="rtl">
                <Stack gap="4">
                  <Field.Root
                    invalid={!!formWithCurrent.formState.errors.currentPassword}
                  >
                    <Field.Label>رمز عبور فعلی</Field.Label>
                    <PasswordInput
                      autoComplete="current-password"
                      {...formWithCurrent.register("currentPassword")}
                      placeholder="رمز عبور فعلی"
                    />
                    <Field.ErrorText>
                      {
                        formWithCurrent.formState.errors.currentPassword
                          ?.message
                      }
                    </Field.ErrorText>
                  </Field.Root>
                  <Field.Root
                    invalid={!!formWithCurrent.formState.errors.newPassword}
                  >
                    <Field.Label>رمز عبور جدید</Field.Label>
                    <PasswordInput
                      autoComplete="new-password"
                      {...formWithCurrent.register("newPassword")}
                      placeholder="رمز عبور جدید"
                    />
                    <PasswordStrength
                      password={formWithCurrent.watch("newPassword", "")}
                    />
                    <Field.ErrorText>
                      {formWithCurrent.formState.errors.newPassword?.message}
                    </Field.ErrorText>
                  </Field.Root>
                  <Field.Root
                    invalid={!!formWithCurrent.formState.errors.confirmPassword}
                  >
                    <Field.Label>تکرار رمز عبور</Field.Label>
                    <PasswordInput
                      autoComplete="new-password"
                      {...formWithCurrent.register("confirmPassword")}
                      placeholder="تکرار رمز عبور"
                    />
                    <Field.ErrorText>
                      {
                        formWithCurrent.formState.errors.confirmPassword
                          ?.message
                      }
                    </Field.ErrorText>
                  </Field.Root>
                  <Dialog.Footer flexDirection="row-reverse" gap="2">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      انصراف
                    </Button>
                    <Button
                      type="submit"
                      colorPalette="brand"
                      loading={setPasswordMutation.isPending}
                    >
                      تغییر رمز عبور
                    </Button>
                  </Dialog.Footer>
                </Stack>
              </form>
            </Tabs.Content>
            <Tabs.Content value="otp">
              <form onSubmit={onWithOtpSubmit} dir="rtl">
                <Stack gap="4">
                  <Field.Root
                    invalid={!!formWithOtp.formState.errors.phoneE164}
                  >
                    <Field.Label>شماره موبایل</Field.Label>
                    <Flex gap="2">
                      <Input
                        flex="1"
                        {...formWithOtp.register("phoneE164")}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        dir="ltr"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRequestOtp}
                        loading={requestOtpMutation.isPending}
                        disabled={resendCooldown > 0}
                      >
                        {resendCooldown > 0
                          ? `${resendCooldown} ثانیه`
                          : otpExpiresAt
                            ? "ارسال مجدد"
                            : "دریافت کد"}
                      </Button>
                    </Flex>
                    <Field.ErrorText>
                      {formWithOtp.formState.errors.phoneE164?.message}
                    </Field.ErrorText>
                  </Field.Root>
                  {otpExpiresAt != null && (
                    <Box
                      py="2"
                      px="3"
                      borderRadius="md"
                      bg={isOtpExpired ? "red.subtle" : "bg.subtle"}
                      borderWidth="1px"
                      borderColor={isOtpExpired ? "red.200" : "border"}
                    >
                      <Text
                        fontSize="sm"
                        color={isOtpExpired ? "red.600" : "fg.muted"}
                      >
                        {isOtpExpired
                          ? "کد منقضی شد. دوباره درخواست کد دهید."
                          : `زمان باقی‌مانده: ${formatRemaining(otpRemainingMs ?? 0)}`}
                      </Text>
                    </Box>
                  )}
                  <Field.Root invalid={!!formWithOtp.formState.errors.code}>
                    <Field.Label>کد تأیید (۶ رقم)</Field.Label>
                    <Input
                      {...formWithOtp.register("code")}
                      placeholder="۱۲۳۴۵۶"
                      dir="ltr"
                      maxLength={6}
                    />
                    <Field.ErrorText>
                      {formWithOtp.formState.errors.code?.message}
                    </Field.ErrorText>
                  </Field.Root>
                  <Field.Root
                    invalid={!!formWithOtp.formState.errors.newPassword}
                  >
                    <Field.Label>رمز عبور جدید</Field.Label>
                    <PasswordInput
                      autoComplete="new-password"
                      {...formWithOtp.register("newPassword")}
                      placeholder="رمز عبور جدید"
                    />
                    <PasswordStrength
                      password={formWithOtp.watch("newPassword", "")}
                    />
                    <Field.ErrorText>
                      {formWithOtp.formState.errors.newPassword?.message}
                    </Field.ErrorText>
                  </Field.Root>
                  <Field.Root
                    invalid={!!formWithOtp.formState.errors.confirmPassword}
                  >
                    <Field.Label>تکرار رمز عبور</Field.Label>
                    <PasswordInput
                      autoComplete="new-password"
                      {...formWithOtp.register("confirmPassword")}
                      placeholder="تکرار رمز عبور"
                    />
                    <Field.ErrorText>
                      {formWithOtp.formState.errors.confirmPassword?.message}
                    </Field.ErrorText>
                  </Field.Root>
                  <Dialog.Footer flexDirection="row-reverse" gap="2">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      انصراف
                    </Button>
                    <Button
                      type="submit"
                      colorPalette="brand"
                      loading={resetByOtpMutation.isPending}
                    >
                      تغییر رمز عبور
                    </Button>
                  </Dialog.Footer>
                </Stack>
              </form>
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
