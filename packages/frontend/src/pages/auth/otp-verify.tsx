import { useLocation } from "react-router";
import { Button, Field, Input, Stack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpVerifySchema } from "@/schemas/auth.schemas";
import type { z } from "zod";
import { useVerifyOtp } from "@/hooks/use-auth";

type Form = z.infer<typeof otpVerifySchema>;

export function OtpVerify() {
  const location = useLocation();
  const state = location.state as {
    phoneE164?: string;
    purpose?: "login" | "register";
    role?: "seeker" | "recruiter";
    password?: string;
  } | null;
  const verifyOtp = useVerifyOtp();

  const form = useForm<Form>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      phoneE164: state?.phoneE164 ?? "",
      purpose: state?.purpose ?? "login",
      code: "",
      role: state?.role,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const payload =
      data.purpose === "register"
        ? {
            phoneE164: data.phoneE164,
            purpose: data.purpose,
            code: data.code,
            role: data.role,
            password: state?.password,
          }
        : { phoneE164: data.phoneE164, purpose: data.purpose, code: data.code };
    verifyOtp.mutate(payload);
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="4">
        <Field.Root invalid={!!form.formState.errors.phoneE164}>
          <Field.Label>شماره موبایل</Field.Label>
          <Input {...form.register("phoneE164")} placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
          <Field.ErrorText>{form.formState.errors.phoneE164?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root invalid={!!form.formState.errors.code}>
          <Field.Label>کد تایید</Field.Label>
          <Input
            {...form.register("code")}
            placeholder="۶ رقم"
            maxLength={6}
            dir="ltr"
          />
          <Field.ErrorText>{form.formState.errors.code?.message}</Field.ErrorText>
        </Field.Root>
        <Button type="submit" loading={verifyOtp.isPending}>
          تایید
        </Button>
      </Stack>
    </form>
  );
}
