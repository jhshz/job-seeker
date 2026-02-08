import { useState } from "react";
import {
  Box,
  Button,
  Field,
  Group,
  Input,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema } from "@/schemas/auth.schemas";
import type { RegisterFormInput } from "@/schemas/auth.schemas";
import { useRequestOtp } from "@/hooks/use-auth";
import { useNavigate, Link as RouterLink } from "react-router";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { PasswordStrength } from "@/components/auth/password-strength";

export function Register() {
  const navigate = useNavigate();
  const requestOtp = useRequestOtp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      phoneE164: "",
      purpose: "register",
      role: "seeker",
      fullName: "",
      companyName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const role = form.watch("role");
  const isSeeker = role === "seeker";
  const isRecruiter = role === "recruiter";

  const onSubmit = form.handleSubmit((data) => {
    requestOtp.mutate(
      { phoneE164: data.phoneE164, purpose: "register" },
      {
        onSuccess: (res) => {
          navigate("/auth/otp-verify", {
            state: {
              phoneE164: data.phoneE164,
              purpose: "register" as const,
              role: data.role,
              fullName: data.fullName,
              companyName: data.companyName,
              password: data.password,
              expiresAt: res.expiresAt,
            },
          });
        },
      },
    );
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Stack gap="6" w="full" maxW="sm" as="form" onSubmit={onSubmit}>
        <Stack gap="4">
          <Field.Root invalid={!!form.formState.errors.role}>
            <Field.Label>نقش</Field.Label>
            <Controller
              name="role"
              control={form.control}
              render={({ field }) => (
                <RadioGroup.Root
                  value={field.value ?? "seeker"}
                  onValueChange={(details) =>
                    field.onChange(
                      typeof details === "string"
                        ? details
                        : (details as { value: string }).value,
                    )
                  }
                  orientation="horizontal"
                  display="flex"
                  flexDirection="row"
                  gap="4"
                >
                  <RadioGroup.Item value="seeker">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>کارجو</RadioGroup.ItemText>
                  </RadioGroup.Item>
                  <RadioGroup.Item value="recruiter">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>کارفرما</RadioGroup.ItemText>
                  </RadioGroup.Item>
                </RadioGroup.Root>
              )}
            />
            <Field.ErrorText>
              {form.formState.errors.role?.message}
            </Field.ErrorText>
          </Field.Root>
          {isSeeker && (
            <Field.Root invalid={!!form.formState.errors.fullName}>
              <Field.Label>نام و نام خانوادگی</Field.Label>
              <Input
                {...form.register("fullName")}
                placeholder="نام و نام خانوادگی خود را وارد کنید"
              />
              <Field.ErrorText>
                {form.formState.errors.fullName?.message}
              </Field.ErrorText>
            </Field.Root>
          )}
          {isRecruiter && (
            <Field.Root invalid={!!form.formState.errors.companyName}>
              <Field.Label>نام شرکت</Field.Label>
              <Input
                {...form.register("companyName")}
                placeholder="نام شرکت یا سازمان را وارد کنید"
              />
              <Field.ErrorText>
                {form.formState.errors.companyName?.message}
              </Field.ErrorText>
            </Field.Root>
          )}
          <Field.Root invalid={!!form.formState.errors.phoneE164}>
            <Field.Label>شماره موبایل</Field.Label>
            <Input {...form.register("phoneE164")} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
            <Field.ErrorText>
              {form.formState.errors.phoneE164?.message}
            </Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!form.formState.errors.password}>
            <Field.Label>رمز عبور</Field.Label>
            <Group attached w="full">
              <Input
                flex="1"
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="حداقل ۸ کاراکتر، حرف، عدد و کاراکتر خاص"
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
            <PasswordStrength password={form.watch("password") ?? ""} />
            <Field.ErrorText>
              {form.formState.errors.password?.message}
            </Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!form.formState.errors.confirmPassword}>
            <Field.Label>تکرار رمز عبور</Field.Label>
            <Group attached w="full">
              <Input
                flex="1"
                {...form.register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="رمز عبور را دوباره وارد کنید"
              />
              <Button
                type="button"
                aria-label={showConfirmPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                bg="bg.subtle"
                variant="outline"
                onClick={() => setShowConfirmPassword((p) => !p)}
              >
                {showConfirmPassword ? <LuEyeOff /> : <LuEye />}
              </Button>
            </Group>
            <Field.ErrorText>
              {form.formState.errors.confirmPassword?.message}
            </Field.ErrorText>
          </Field.Root>
          <Button type="submit" loading={requestOtp.isPending} w="full">
            دریافت کد تایید
          </Button>
        </Stack>
        <Box display="flex" alignItems="center" justifyContent="center" gap="2">
          <span>قبلاً ثبت‌نام کرده‌اید؟</span>
          <Button asChild variant="ghost" colorPalette="green">
            <RouterLink to="/auth/login">ورود</RouterLink>
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
