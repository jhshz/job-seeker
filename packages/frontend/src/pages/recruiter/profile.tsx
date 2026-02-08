import { useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Field,
  Input,
  Stack,
  Textarea,
  Separator,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecruiterProfile, updateRecruiterProfile } from "@/api/recruiters.api";
import { setPassword } from "@/api/auth.api";
import { queryKeys } from "@/api/query-keys";
import { updateRecruiterProfileSchema } from "@/schemas/profile.schemas";
import { passwordFieldSchema } from "@/schemas/auth.schemas";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";
import { PasswordStrength } from "@/components/auth/password-strength";

type ProfileForm = z.infer<typeof updateRecruiterProfileSchema>;

const resetPasswordSchema = z
  .object({
    newPassword: passwordFieldSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "رمز عبور و تکرار آن مطابقت ندارند",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function RecruiterProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.recruiters.me,
    queryFn: getRecruiterProfile,
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(updateRecruiterProfileSchema),
    defaultValues: {
      companyName: "",
      companyDescription: "",
      website: "",
      location: "",
      industry: "",
      size: "",
    },
  });

  const passwordForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        companyName: profile.companyName ?? "",
        companyDescription: profile.companyDescription ?? "",
        website: profile.website ?? "",
        location: profile.location ?? "",
        industry: profile.industry ?? "",
        size: profile.size ?? "",
      });
    }
  }, [profile, profileForm]);

  const updateProfile = useMutation({
    mutationFn: updateRecruiterProfile,
    onSuccess: () => {
      toaster.create({ title: "پروفایل ذخیره شد", type: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.recruiters.me });
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  const changePassword = useMutation({
    mutationFn: (newPassword: string) => setPassword(newPassword),
    onSuccess: () => {
      toaster.create({ title: "رمز عبور با موفقیت تغییر کرد", type: "success" });
      passwordForm.reset({ newPassword: "", confirmPassword: "" });
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  const onProfileSubmit = profileForm.handleSubmit((data) => updateProfile.mutate(data));
  const onPasswordSubmit = passwordForm.handleSubmit((data) =>
    changePassword.mutate(data.newPassword),
  );

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  return (
    <Box maxW="container.md">
      <Heading size="lg" mb="6">
        پروفایل کارفرما
      </Heading>

      <Box
        p="5"
        borderRadius="md"
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
        mb="6"
      >
        <Heading size="sm" mb="4" fontWeight="semibold">
          ویرایش اطلاعات شرکت
        </Heading>
        <form onSubmit={onProfileSubmit}>
          <Stack gap="4">
            <Field.Root invalid={!!profileForm.formState.errors.companyName}>
              <Field.Label>نام شرکت</Field.Label>
              <Input
                {...profileForm.register("companyName")}
                placeholder="نام شرکت"
              />
              <Field.ErrorText>
                {profileForm.formState.errors.companyName?.message}
              </Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!profileForm.formState.errors.companyDescription}>
              <Field.Label>توضیحات شرکت</Field.Label>
              <Textarea
                {...profileForm.register("companyDescription")}
                placeholder="درباره شرکت..."
                rows={4}
              />
              <Field.ErrorText>
                {profileForm.formState.errors.companyDescription?.message}
              </Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!profileForm.formState.errors.website}>
              <Field.Label>وب‌سایت</Field.Label>
              <Input
                {...profileForm.register("website")}
                placeholder="https://example.com"
              />
              <Field.ErrorText>
                {profileForm.formState.errors.website?.message}
              </Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!profileForm.formState.errors.location}>
              <Field.Label>موقعیت مکانی</Field.Label>
              <Input
                {...profileForm.register("location")}
                placeholder="شهر"
              />
              <Field.ErrorText>
                {profileForm.formState.errors.location?.message}
              </Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!profileForm.formState.errors.industry}>
              <Field.Label>صنعت</Field.Label>
              <Input
                {...profileForm.register("industry")}
                placeholder="صنعت"
              />
              <Field.ErrorText>
                {profileForm.formState.errors.industry?.message}
              </Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!profileForm.formState.errors.size}>
              <Field.Label>اندازه شرکت</Field.Label>
              <Input
                {...profileForm.register("size")}
                placeholder="مثال: ۱–۱۰ نفر"
              />
              <Field.ErrorText>
                {profileForm.formState.errors.size?.message}
              </Field.ErrorText>
            </Field.Root>
            <Button type="submit" colorPalette="brand" loading={updateProfile.isPending}>
              ذخیره تغییرات
            </Button>
          </Stack>
        </form>
      </Box>

      <Separator mb="6" />

      <Box
        p="5"
        borderRadius="md"
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
      >
        <Heading size="sm" mb="2" fontWeight="semibold">
          تغییر رمز عبور
        </Heading>
        <Text fontSize="sm" color="fg.muted" mb="4">
          پس از تغییر رمز عبور، باید مجدداً وارد شوید.
        </Text>
        <form onSubmit={onPasswordSubmit}>
          <Stack gap="4">
            <Field.Root invalid={!!passwordForm.formState.errors.newPassword}>
              <Field.Label>رمز عبور جدید</Field.Label>
              <Input
                type="password"
                {...passwordForm.register("newPassword")}
                placeholder="رمز عبور جدید"
              />
              <PasswordStrength
                password={passwordForm.watch("newPassword", "")}
              />
              <Field.ErrorText>
                {passwordForm.formState.errors.newPassword?.message}
              </Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!passwordForm.formState.errors.confirmPassword}>
              <Field.Label>تکرار رمز عبور</Field.Label>
              <Input
                type="password"
                {...passwordForm.register("confirmPassword")}
                placeholder="تکرار رمز عبور"
              />
              <Field.ErrorText>
                {passwordForm.formState.errors.confirmPassword?.message}
              </Field.ErrorText>
            </Field.Root>
            <Button
              type="submit"
              variant="outline"
              colorPalette="brand"
              loading={changePassword.isPending}
            >
              تغییر رمز عبور
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
