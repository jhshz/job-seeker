import { Button, Field, Input, Stack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpRequestSchema } from "@/schemas/auth.schemas";
import type { z } from "zod";
import { useRequestOtp } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router";

type Form = z.infer<typeof otpRequestSchema>;

export function Register() {
  const navigate = useNavigate();
  const requestOtp = useRequestOtp();

  const form = useForm<Form>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { phoneE164: "", purpose: "register" },
  });

  const onSubmit = form.handleSubmit((data) => {
    requestOtp.mutate(data, {
      onSuccess: () => {
        navigate("/auth/otp-verify", {
          state: { phoneE164: data.phoneE164, purpose: data.purpose },
        });
      },
    });
  });

  return (
    <Stack gap="6">
      <form onSubmit={onSubmit}>
        <Stack gap="4">
          <Field.Root invalid={!!form.formState.errors.phoneE164}>
            <Field.Label>شماره موبایل</Field.Label>
            <Input
              {...form.register("phoneE164")}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              dir="ltr"
            />
            <Field.ErrorText>
              {form.formState.errors.phoneE164?.message}
            </Field.ErrorText>
          </Field.Root>
          <Button type="submit" loading={requestOtp.isPending}>
            دریافت کد تایید
          </Button>
        </Stack>
      </form>
      <Stack direction="row" justify="center" gap="2">
        <span>قبلاً ثبت‌نام کرده‌اید؟</span>
        <Link to="/auth/login">ورود</Link>
      </Stack>
    </Stack>
  );
}
