import { useEffect, useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSeekerProfile, updateSeekerProfile } from "@/api/seekers.api";
import { queryKeys } from "@/api/query-keys";
import { z } from "zod";

const seekerProfileFormSchema = z.object({
  fullName: z.string().optional(),
  headline: z.string().optional(),
  location: z.string().optional(),
  about: z.string().optional(),
});
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";
import { ResetPasswordModal } from "@/components/auth/reset-password-modal";

type ProfileForm = z.infer<typeof seekerProfileFormSchema>;

export function SeekerProfile() {
  const queryClient = useQueryClient();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.seekers.me,
    queryFn: getSeekerProfile,
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(seekerProfileFormSchema),
    defaultValues: {
      fullName: "",
      headline: "",
      location: "",
      about: "",
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        fullName: profile.fullName ?? "",
        headline: profile.headline ?? "",
        location: profile.location ?? "",
        about: profile.about ?? "",
      });
    }
  }, [profile, profileForm]);

  const updateProfile = useMutation({
    mutationFn: updateSeekerProfile,
    onSuccess: () => {
      toaster.create({ title: "پروفایل ذخیره شد", type: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.seekers.me });
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

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  return (
    <Box maxW="container.md">
      <Heading size="lg" mb="6">
        پروفایل و تنظیمات
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
          ویرایش اطلاعات پروفایل
        </Heading>
        <form onSubmit={onProfileSubmit}>
          <Stack gap="4">
            <Field.Root invalid={!!profileForm.formState.errors.fullName}>
              <Field.Label>نام و نام خانوادگی</Field.Label>
              <Input
                {...profileForm.register("fullName")}
                placeholder="نام و نام خانوادگی"
              />
              <Field.ErrorText>
                {profileForm.formState.errors.fullName?.message}
              </Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!profileForm.formState.errors.headline}>
              <Field.Label>عنوان شغلی</Field.Label>
              <Input
                {...profileForm.register("headline")}
                placeholder="مثال: توسعه‌دهنده فرانت‌اند"
              />
              <Field.ErrorText>
                {profileForm.formState.errors.headline?.message}
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
            <Field.Root invalid={!!profileForm.formState.errors.about}>
              <Field.Label>درباره من</Field.Label>
              <Textarea
                {...profileForm.register("about")}
                placeholder="توضیحات کوتاه درباره خود..."
                rows={4}
              />
              <Field.ErrorText>
                {profileForm.formState.errors.about?.message}
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
        <Button
          variant="outline"
          colorPalette="brand"
          onClick={() => setPasswordModalOpen(true)}
        >
          تغییر رمز عبور
        </Button>
      </Box>

      <ResetPasswordModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
      />
    </Box>
  );
}
