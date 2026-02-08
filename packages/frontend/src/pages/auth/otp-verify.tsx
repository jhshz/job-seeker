import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Box, Button, Field, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpVerifySchema } from "@/schemas/auth.schemas";
import type { z } from "zod";
import { useRequestOtp, useVerifyOtp } from "@/hooks/use-auth";

const RESEND_COOLDOWN_SECONDS = 60;

type Form = z.infer<typeof otpVerifySchema>;

type OtpVerifyState = {
  phoneE164?: string;
  purpose?: "login" | "register";
  role?: "seeker" | "recruiter";
  fullName?: string;
  password?: string;
  expiresAt?: string;
};

function formatRemaining(ms: number): {
  minutes: number;
  seconds: number;
  text: string;
} {
  if (ms <= 0) return { minutes: 0, seconds: 0, text: "۰" };
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const text = m > 0 ? `${m} دقیقه و ${s} ثانیه` : `${s} ثانیه`;
  return { minutes: m, seconds: s, text };
}

export function OtpVerify() {
  const location = useLocation();
  const state = location.state as OtpVerifyState | null;
  const verifyOtp = useVerifyOtp();
  const requestOtp = useRequestOtp();

  const [expiresAt, setExpiresAt] = useState<string | undefined>(
    state?.expiresAt,
  );
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  const form = useForm<Form>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      phoneE164: state?.phoneE164 ?? "",
      purpose: state?.purpose ?? "login",
      code: "",
      role: state?.role,
    },
  });

  const phoneE164 = form.watch("phoneE164") || state?.phoneE164 || "";
  const purpose = form.watch("purpose") || state?.purpose || "login";

  // Sync expiresAt from location.state when navigating (e.g. back)
  useEffect(() => {
    if (state?.expiresAt) setExpiresAt(state.expiresAt);
  }, [state?.expiresAt]);

  // Countdown until code expiry
  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(null);
      return;
    }
    const update = () => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      setRemainingMs(ms <= 0 ? 0 : ms);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  // Resend cooldown tick
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(
      () => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = () => {
    if (!phoneE164 || resendCooldown > 0 || requestOtp.isPending) return;
    requestOtp.mutate(
      { phoneE164, purpose: purpose as "login" | "register" },
      {
        onSuccess: (res) => {
          setExpiresAt(res.expiresAt);
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        },
      },
    );
  };

  const onSubmit = form.handleSubmit((data) => {
    const payload =
      data.purpose === "register"
        ? {
            phoneE164: data.phoneE164,
            purpose: data.purpose,
            code: data.code,
            role: data.role,
            fullName: state?.fullName?.trim() || undefined,
            password: state?.password,
          }
        : { phoneE164: data.phoneE164, purpose: data.purpose, code: data.code };
    verifyOtp.mutate(payload);
  });

  const isExpired = remainingMs !== null && remainingMs <= 0;
  const remaining = remainingMs !== null ? formatRemaining(remainingMs) : null;

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="4">
        <Field.Root invalid={!!form.formState.errors.phoneE164}>
          <Field.Label>شماره موبایل</Field.Label>
          <Input
            {...form.register("phoneE164")}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            dir="ltr"
            readOnly
          />
          <Field.ErrorText>
            {form.formState.errors.phoneE164?.message}
          </Field.ErrorText>
        </Field.Root>

        {expiresAt != null && remainingMs != null && (
          <Box
            py="3"
            px="4"
            borderRadius="lg"
            bg={isExpired ? "red.subtle" : "bg.subtle"}
            borderWidth="1px"
            borderColor={isExpired ? "red.200" : "border"}
          >
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={isExpired ? "red.600" : "fg.muted"}
            >
              {isExpired ? (
                "کد تأیید منقضی شد"
              ) : remaining ? (
                <Flex align="center" justify="space-between" gap="3">
                  {/* متن (RTL) */}
                  <Box as="span" textAlign="right">
                    زمان باقی‌مانده تا انقضای کد
                  </Box>

                  {/* تایمر (LTR) — همیشه سمت چپ باکس */}
                  <Box
                    as="span"
                    dir="ltr"
                    unicodeBidi="isolate"
                    fontFeatureSettings="tnum"
                    fontWeight="semibold"
                    color="fg.emphasized"
                    flexShrink={0}
                  >
                    {remaining.minutes}:
                    {String(remaining.seconds).padStart(2, "0")}
                  </Box>
                </Flex>
              ) : null}
            </Text>
          </Box>
        )}

        <Field.Root invalid={!!form.formState.errors.code}>
          <Field.Label>کد تایید</Field.Label>
          <Input
            {...form.register("code")}
            placeholder="۶ رقم"
            maxLength={6}
            dir="ltr"
            readOnly={isExpired}
          />
          <Field.ErrorText>
            {form.formState.errors.code?.message}
          </Field.ErrorText>
        </Field.Root>

        {!isExpired && (
          <Button type="submit" loading={verifyOtp.isPending} w="full">
            تایید
          </Button>
        )}

        {isExpired && (
          <Button
            type="button"
            variant="solid"
            w="full"
            disabled={resendCooldown > 0 || requestOtp.isPending || !phoneE164}
            onClick={handleResend}
            loading={requestOtp.isPending}
          >
            {resendCooldown > 0
              ? `ارسال مجدد (${resendCooldown} ثانیه)`
              : "ارسال مجدد کد"}
          </Button>
        )}
      </Stack>
    </form>
  );
}
