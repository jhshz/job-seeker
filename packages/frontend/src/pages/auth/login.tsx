import { Box, Button, Input, Stack, Tabs, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { passwordLogin, requestOtp, verifyOtp } from "@/api/auth.api";
import { toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/stores/auth.store";
import {
  passwordSchema,
  phoneSchema,
  otpSchema,
  type PasswordFormValues,
  type OtpFormValues,
} from "@/schemas/auth.schema";
import { getApiErrorMessage } from "@/lib/http";

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const [otpRequestId, setOtpRequestId] = useState<string | null>(null);
  const [phoneForOtp, setPhoneForOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState<"otp" | "password">("otp");
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { phone: "", password: "" },
  });

  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm<{ phone: string }>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const passwordLoginMutation = useMutation({
    mutationFn: passwordLogin,
    onSuccess: data => {
      setAuth(data);
      toaster.create({ type: "success", title: "ورود موفق", description: "خوش آمدید" });
      navigate("/");
    },
    onError: error => {
      toaster.create({
        type: "error",
        title: "ورود ناموفق",
        description: getApiErrorMessage(error),
      });
    },
  });

  const requestOtpMutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: data => {
      setOtpRequestId(data.requestId);
      setOtpSent(true);
      setCountdown(120);

      toaster.create({ type: "success", title: "کد تایید ارسال شد", description: data.message });

      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: error => {
      toaster.create({
        type: "error",
        title: "خطا در ارسال کد",
        description: getApiErrorMessage(error),
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: data => {
      setAuth(data);
      toaster.create({ type: "success", title: "ورود موفق", description: "خوش آمدید" });
      navigate("/");
    },
    onError: error => {
      toaster.create({
        type: "error",
        title: "کد تایید نامعتبر",
        description: getApiErrorMessage(error),
      });
    },
  });

  const onPasswordSubmit = (values: PasswordFormValues) => passwordLoginMutation.mutate(values);

  const onPhoneSubmit = (values: { phone: string }) => {
    setPhoneForOtp(values.phone);
    requestOtpMutation.mutate({ phone: values.phone, purpose: "login" });
  };

  const onOtpSubmit = (values: OtpFormValues) => {
    if (!otpRequestId) return;
    verifyOtpMutation.mutate({ requestId: otpRequestId, code: values.code });
  };

  const handleResendOtp = () => {
    if (!phoneForOtp || countdown > 0) return;
    requestOtpMutation.mutate({ phone: phoneForOtp, purpose: "login" });
  };

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtpRequestId(null);
    setPhoneForOtp("");
    setCountdown(0);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Tabs.Root
      maxW="md"
      fitted
      value={activeTab}
      defaultValue="otp"
      onValueChange={e => setActiveTab(e.value as "otp" | "password")}
      variant="enclosed"
    >
      <Tabs.List>
        <Tabs.Trigger value="otp">ورود با کد تایید</Tabs.Trigger>
        <Tabs.Trigger value="password">ورود با رمز عبور</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="otp">
        <Stack gap="4" mt="4">
          {!otpSent ? (
            <Box as="form" onSubmit={handlePhoneSubmit(onPhoneSubmit)}>
              <Stack gap="4">
                <Stack gap="1">
                  <Text fontWeight="medium" fontSize="sm">
                    شماره موبایل
                  </Text>
                  <Input
                    placeholder="مثلا 09123456789"
                    autoComplete="tel"
                    inputMode="tel"
                    size="lg"
                    {...registerPhone("phone")}
                  />
                  {phoneErrors.phone?.message ? (
                    <Text color="red.500" fontSize="sm">
                      {phoneErrors.phone.message}
                    </Text>
                  ) : null}
                </Stack>

                <Button
                  type="submit"
                  size="lg"
                  disabled={requestOtpMutation.isPending}
                  width="full"
                >
                  {requestOtpMutation.isPending ? "در حال ارسال..." : "ارسال کد تایید"}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box as="form" onSubmit={handleOtpSubmit(onOtpSubmit)}>
              <Stack gap="4">
                <Stack gap="1">
                  <Text fontWeight="medium" fontSize="sm">
                    کد تایید ارسال شده به {phoneForOtp}
                  </Text>
                  <Input
                    placeholder="کد ۶ رقمی"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                    size="lg"
                    textAlign="center"
                    fontSize="xl"
                    letterSpacing="wide"
                    {...registerOtp("code")}
                  />
                  {otpErrors.code?.message ? (
                    <Text color="red.500" fontSize="sm">
                      {otpErrors.code.message}
                    </Text>
                  ) : null}
                </Stack>

                <Stack gap="2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={verifyOtpMutation.isPending}
                    width="full"
                  >
                    {verifyOtpMutation.isPending ? "در حال تایید..." : "تایید و ورود"}
                  </Button>

                  <Stack direction="row" align="center" justify="center" gap="2">
                    <Text fontSize="sm" color="fg.muted">
                      کد را دریافت نکردید؟
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || requestOtpMutation.isPending}
                    >
                      {countdown > 0 ? `ارسال مجدد (${formatCountdown(countdown)})` : "ارسال مجدد"}
                    </Button>
                  </Stack>

                  <Button variant="ghost" size="sm" onClick={resetOtpFlow} width="full">
                    تغییر شماره موبایل
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </Stack>
      </Tabs.Content>

      <Tabs.Content value="password">
        <Box as="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} mt="4">
          <Stack gap="4">
            <Stack gap="1">
              <Text fontWeight="medium" fontSize="sm">
                شماره موبایل
              </Text>
              <Input
                placeholder="مثلا 09123456789"
                autoComplete="tel"
                inputMode="tel"
                size="lg"
                {...registerPassword("phone")}
              />
              {passwordErrors.phone?.message ? (
                <Text color="red.500" fontSize="sm">
                  {passwordErrors.phone.message}
                </Text>
              ) : null}
            </Stack>

            <Stack gap="1">
              <Text fontWeight="medium" fontSize="sm">
                رمز عبور
              </Text>
              <Input
                type="password"
                placeholder="رمز عبور خود را وارد کنید"
                autoComplete="current-password"
                size="lg"
                {...registerPassword("password")}
              />
              {passwordErrors.password?.message ? (
                <Text color="red.500" fontSize="sm">
                  {passwordErrors.password.message}
                </Text>
              ) : null}
            </Stack>

            <Button type="submit" size="lg" disabled={passwordLoginMutation.isPending} width="full">
              {passwordLoginMutation.isPending ? "در حال ورود..." : "ورود"}
            </Button>
          </Stack>
        </Box>
      </Tabs.Content>
    </Tabs.Root>
  );
}
