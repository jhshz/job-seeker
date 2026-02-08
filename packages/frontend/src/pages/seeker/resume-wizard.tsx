import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Box,
  Heading,
  Text,
  Button,
  Field,
  Input,
  Stack,
  Textarea,
  Flex,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createResumeSchema,
  type CreateResumeInput,
  type EducationEntry,
  type ExperienceEntry,
} from "@/schemas/resume.schemas";
import { createResume, getSeekerProfile, type CreateResumePayload } from "@/api/seekers.api";
import { queryKeys } from "@/api/query-keys";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";

const STEPS = [
  { id: 1, title: "مهارت‌ها", key: "skills" },
  { id: 2, title: "تحصیلات", key: "education" },
  { id: 3, title: "سوابق کاری", key: "experience" },
  { id: 4, title: "بررسی و ارسال", key: "review" },
];

const resumeFormSchema = createResumeSchema.omit({
  fullName: true,
  headline: true,
  location: true,
  about: true,
});

type ResumeFormInput = {
  skills: string[];
  education: CreateResumeInput["education"];
  experience: CreateResumeInput["experience"];
};

export function ResumeWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const { data: profile, isLoading: profileLoading, error: profileError, refetch } = useQuery({
    queryKey: queryKeys.seekers.me,
    queryFn: getSeekerProfile,
  });

  const form = useForm<ResumeFormInput>({
    // @ts-expect-error - zod optional vs form required
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      skills: [],
      education: [],
      experience: [],
    },
  });

  const educationFields = useFieldArray({
    control: form.control,
    name: "education",
  });

  const experienceFields = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const createMutation = useMutation({
    mutationFn: createResume,
    onSuccess: () => {
      toaster.create({ title: "رزومه با موفقیت ساخته شد", type: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.seekers.resumes });
      navigate("/seeker/resumes");
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const payload: CreateResumePayload = {
      fullName: profile?.fullName ?? "",
      headline: profile?.headline,
      location: profile?.location,
      about: profile?.about,
      skills: data.skills,
      education: data.education,
      experience: data.experience,
    };
    createMutation.mutate(payload);
  });

  const addSkill = () => {
    const input = document.getElementById("skill-input") as HTMLInputElement;
    const value = input?.value?.trim();
    if (value) {
      const skills = form.getValues("skills") ?? [];
      if (!skills.includes(value)) {
        form.setValue("skills", [...skills, value]);
        input.value = "";
      }
    }
  };

  const removeSkill = (index: number) => {
    const skills = form.getValues("skills") ?? [];
    form.setValue(
      "skills",
      skills.filter((_, i) => i !== index),
    );
  };

  const nextStep = async () => {
    if (step < 4) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => (s > 1 ? s - 1 : 1));

  const skills = form.watch("skills") ?? [];

  if (profileLoading) return <Loading />;
  if (profileError || !profile)
    return (
      <ErrorState
        message="خطا در بارگذاری پروفایل. ابتدا پروفایل خود را تکمیل کنید."
        onRetry={() => refetch()}
      />
    );

  if (!profile.fullName?.trim()) {
    return (
      <Box>
        <Heading size="lg" mb="4">
          ساخت رزومه
        </Heading>
        <Box
          p="6"
          borderRadius="md"
          borderWidth="1px"
          borderColor="border"
          bg="bg.panel"
        >
          <Text mb="4" color="fg.muted">
            برای ساخت رزومه، ابتدا نام و نام خانوادگی خود را در پروفایل ثبت کنید.
          </Text>
          <Link to="/seeker/profile">
            <Button colorPalette="brand">رفتن به پروفایل</Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box maxW="container.md">
      <Flex align="center" gap="3" mb="6">
        <Heading size="lg">ساخت رزومه</Heading>
        <Badge colorPalette="brand" size="lg" px="2" py="1" borderRadius="md">
          گام {step} از {STEPS.length}
        </Badge>
      </Flex>
      <Text color="fg.muted" mb="8" fontSize="sm">
        با راهنمای گام‌به‌گام رزومه حرفه‌ای خود را بسازید.
      </Text>

      <Flex gap="2" mb="8" flexWrap="wrap">
        {STEPS.map((s) => (
          <Box
            key={s.id}
            px="3"
            py="1.5"
            borderRadius="md"
            bg={step === s.id ? "brand.subtle" : "bg.muted"}
            color={step === s.id ? "brand.fg" : "fg.muted"}
            fontSize="sm"
            fontWeight={step === s.id ? "semibold" : "medium"}
          >
            {s.id}. {s.title}
          </Box>
        ))}
      </Flex>

      <Box
        p="5"
        borderRadius="md"
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
      >
        <form onSubmit={onSubmit}>
          {step === 1 && (
            <Stack gap="4">
              <Heading size="sm" mb="2" fontWeight="semibold">
                مهارت‌ها
              </Heading>
              <Text fontSize="sm" color="fg.muted">
                مهارت‌های خود را وارد کرده و Enter بزنید.
              </Text>
              <Flex gap="2" flexWrap="wrap">
                <Input
                  id="skill-input"
                  placeholder="مثال: React"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  maxW="200px"
                />
                <Button type="button" size="sm" onClick={addSkill}>
                  <HiOutlinePlus style={{ marginLeft: 6 }} />
                  افزودن
                </Button>
              </Flex>
              <Flex gap="2" flexWrap="wrap">
                {skills.map((skill, i) => (
                  <Badge
                    key={i}
                    colorPalette="brand"
                    variant="subtle"
                    px="2"
                    py="1"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => removeSkill(i)}
                    _hover={{ opacity: 0.8 }}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </Flex>
            </Stack>
          )}

          {step === 2 && (
            <Stack gap="4">
              <Heading size="sm" mb="2" fontWeight="semibold">
                تحصیلات
              </Heading>
              {educationFields.fields.map((_, index) => (
                <Box
                  key={educationFields.fields[index]?.id}
                  p="4"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.subtle"
                >
                  <Flex justify="space-between" align="center" mb="3">
                    <Text fontWeight="medium">مدرک {index + 1}</Text>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => educationFields.remove(index)}
                    >
                      <HiOutlineTrash />
                    </Button>
                  </Flex>
                  <Stack gap="3">
                    <Field.Root
                      invalid={
                        !!form.formState.errors.education?.[index]?.institution
                      }
                    >
                      <Field.Label>نام مؤسسه *</Field.Label>
                      <Input
                        {...form.register(`education.${index}.institution`)}
                        placeholder="نام دانشگاه یا مؤسسه"
                      />
                    </Field.Root>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
                      <Field.Root
                        invalid={
                          !!form.formState.errors.education?.[index]?.degree
                        }
                      >
                        <Field.Label>مدرک *</Field.Label>
                        <Input
                          {...form.register(`education.${index}.degree`)}
                          placeholder="لیسانس، فوق‌لیسانس..."
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>رشته</Field.Label>
                        <Input
                          {...form.register(`education.${index}.field`)}
                          placeholder="رشته تحصیلی"
                        />
                      </Field.Root>
                    </SimpleGrid>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
                      <Field.Root
                        invalid={
                          !!form.formState.errors.education?.[index]?.startYear
                        }
                      >
                        <Field.Label>سال شروع *</Field.Label>
                        <Input
                          type="number"
                          {...form.register(`education.${index}.startYear`, {
                            valueAsNumber: true,
                          })}
                          placeholder="۱۳۹۵"
                        />
                      </Field.Root>
                      <Field.Root
                        invalid={
                          !!form.formState.errors.education?.[index]?.endYear
                        }
                      >
                        <Field.Label>سال پایان</Field.Label>
                        <Input
                          type="number"
                          {...form.register(`education.${index}.endYear`, {
                            setValueAs: (v) =>
                              v === "" || v === undefined ? null : parseInt(String(v), 10),
                          })}
                          placeholder="۱۳۹۹"
                        />
                      </Field.Root>
                    </SimpleGrid>
                  </Stack>
                </Box>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  educationFields.append({
                    institution: "",
                    degree: "",
                    field: "",
                    startYear: new Date().getFullYear(),
                    endYear: null,
                    description: "",
                  } as EducationEntry)
                }
              >
                <HiOutlinePlus style={{ marginLeft: 8 }} />
                افزودن مدرک
              </Button>
            </Stack>
          )}

          {step === 3 && (
            <Stack gap="4">
              <Heading size="sm" mb="2" fontWeight="semibold">
                سوابق کاری
              </Heading>
              {experienceFields.fields.map((_, index) => (
                <Box
                  key={experienceFields.fields[index]?.id}
                  p="4"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.subtle"
                >
                  <Flex justify="space-between" align="center" mb="3">
                    <Text fontWeight="medium">تجربه {index + 1}</Text>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => experienceFields.remove(index)}
                    >
                      <HiOutlineTrash />
                    </Button>
                  </Flex>
                  <Stack gap="3">
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
                      <Field.Root
                        invalid={
                          !!form.formState.errors.experience?.[index]?.company
                        }
                      >
                        <Field.Label>نام شرکت *</Field.Label>
                        <Input
                          {...form.register(`experience.${index}.company`)}
                          placeholder="نام شرکت"
                        />
                      </Field.Root>
                      <Field.Root
                        invalid={
                          !!form.formState.errors.experience?.[index]?.title
                        }
                      >
                        <Field.Label>عنوان شغلی *</Field.Label>
                        <Input
                          {...form.register(`experience.${index}.title`)}
                          placeholder="عنوان شغلی"
                        />
                      </Field.Root>
                    </SimpleGrid>
                    <Field.Root>
                      <Field.Label>موقعیت مکانی</Field.Label>
                      <Input
                        {...form.register(`experience.${index}.location`)}
                        placeholder="شهر"
                      />
                    </Field.Root>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
                      <Field.Root
                        invalid={
                          !!form.formState.errors.experience?.[index]?.startDate
                        }
                      >
                        <Field.Label>تاریخ شروع *</Field.Label>
                        <Input
                          type="date"
                          {...form.register(`experience.${index}.startDate`)}
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>تاریخ پایان</Field.Label>
                        <Input
                          type="date"
                          {...form.register(`experience.${index}.endDate`)}
                        />
                      </Field.Root>
                    </SimpleGrid>
                    <Field.Root>
                      <Field.Label>توضیحات</Field.Label>
                      <Textarea
                        {...form.register(`experience.${index}.description`)}
                        placeholder="مسئولیت‌ها و دستاوردها..."
                        rows={2}
                      />
                    </Field.Root>
                  </Stack>
                </Box>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  experienceFields.append({
                    company: "",
                    title: "",
                    location: "",
                    startDate: new Date(),
                    endDate: null,
                    current: false,
                    description: "",
                  } as ExperienceEntry)
                }
              >
                <HiOutlinePlus style={{ marginLeft: 8 }} />
                افزودن سابقه کاری
              </Button>
            </Stack>
          )}

          {step === 4 && (
            <Stack gap="4">
              <Heading size="sm" mb="2" fontWeight="semibold">
                بررسی اطلاعات
              </Heading>
              <Box
                p="4"
                borderRadius="md"
                bg="bg.subtle"
                borderWidth="1px"
                borderColor="border"
              >
                <Text fontWeight="semibold" mb="1">
                  {profile.fullName}
                </Text>
                <Text fontSize="sm" color="fg.muted" mb="2">
                  {profile.headline || "—"}
                </Text>
                <Text fontSize="sm" mb="2">
                  {profile.about || "—"}
                </Text>
                {skills.length > 0 && (
                  <Flex gap="2" flexWrap="wrap" mb="2">
                    {skills.map((s, i) => (
                      <Badge key={i} size="sm" variant="subtle">
                        {s}
                      </Badge>
                    ))}
                  </Flex>
                )}
                <Text fontSize="xs" color="fg.muted">
                  {form.watch("education")?.length ?? 0} مدرک تحصیلی ·{" "}
                  {form.watch("experience")?.length ?? 0} سابقه کاری
                </Text>
              </Box>
            </Stack>
          )}

          <Flex
            justify="space-between"
            mt="8"
            pt="4"
            borderTopWidth="1px"
            borderColor="border"
          >
            <Flex gap="2">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  قبلی
                </Button>
              ) : (
                <Link to="/seeker/resumes">
                  <Button type="button" variant="ghost">
                    انصراف
                  </Button>
                </Link>
              )}
              {step < 4 ? (
                <Button type="button" colorPalette="brand" onClick={nextStep}>
                  بعدی
                </Button>
              ) : (
                <Button
                  type="submit"
                  colorPalette="brand"
                  loading={createMutation.isPending}
                >
                  ذخیره رزومه
                </Button>
              )}
            </Flex>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
