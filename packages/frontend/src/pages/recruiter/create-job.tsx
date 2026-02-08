import { useState, useCallback } from "react";
import { Box, Heading, HStack } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema } from "@/schemas/job.schemas";
import type { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "@/api/recruiters.api";
import { queryKeys } from "@/api/query-keys";
import {
  Badge,
  Button,
  Field,
  Input,
  RadioGroup,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";
import { useNavigate } from "react-router";
import { LuX } from "react-icons/lu";

const CREATE_JOB_STATUS_OPTIONS: { value: "draft" | "published"; label: string }[] = [
  { value: "draft", label: "پیش‌نویس (پیش‌فرض)" },
  { value: "published", label: "فعال" },
];

type Form = z.infer<typeof createJobSchema>;

export function CreateJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState("");

  const form = useForm<Form>({
    resolver: zodResolver(createJobSchema) as never,
    defaultValues: {
      title: "",
      description: "",
      status: "draft",
      type: [],
      location: "",
      tags: [],
    },
  });

  const tags = form.watch("tags") ?? [];

  const addTag = useCallback(() => {
    const value = tagInput.trim().slice(0, 50);
    if (!value) return;
    if (tags.includes(value)) {
      setTagInput("");
      return;
    }
    form.setValue("tags", [...tags, value]);
    setTagInput("");
  }, [tagInput, tags, form]);

  const removeTag = useCallback(
    (index: number) => {
      form.setValue(
        "tags",
        tags.filter((_, i) => i !== index),
      );
    },
    [tags, form],
  );

  const create = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      toaster.create({ title: "آگهی ایجاد شد", type: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.recruiters.jobs });
      navigate("/recruiter/jobs");
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => create.mutate(data));

  return (
    <Box maxW="container.md">
      <Heading size="lg" mb="6">
        ایجاد آگهی
      </Heading>
      <form onSubmit={onSubmit}>
        <Stack gap="4">
          <Field.Root invalid={!!form.formState.errors.title}>
            <Field.Label>عنوان</Field.Label>
            <Input {...form.register("title")} placeholder="عنوان شغل" />
            <Field.ErrorText>{form.formState.errors.title?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!form.formState.errors.description}>
            <Field.Label>توضیحات</Field.Label>
            <Textarea {...form.register("description")} placeholder="توضیحات..." rows={6} />
            <Field.ErrorText>{form.formState.errors.description?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root>
            <Field.Label>موقعیت مکانی</Field.Label>
            <Input {...form.register("location")} placeholder="شهر" />
          </Field.Root>

          <Field.Root invalid={!!form.formState.errors.status}>
            <Field.Label>وضعیت آگهی</Field.Label>
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <RadioGroup.Root
                  value={field.value ?? "draft"}
                  onValueChange={(details) =>
                    field.onChange(
                      typeof details === "string" ? details : (details as { value: string }).value,
                    )
                  }
                  orientation="horizontal"
                  display="flex"
                  flexWrap="wrap"
                  gap="3"
                >
                  {CREATE_JOB_STATUS_OPTIONS.map((opt) => (
                    <RadioGroup.Item key={opt.value} value={opt.value}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>{opt.label}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  ))}
                </RadioGroup.Root>
              )}
            />
            <Field.ErrorText>{form.formState.errors.status?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!form.formState.errors.tags}>
            <Field.Label>تگ‌ها</Field.Label>
            <Field.HelperText>تگ‌ها را وارد کنید و با Enter یا دکمه افزودن اضافه کنید (حداکثر ۵۰ کاراکتر برای هر تگ)</Field.HelperText>
            <HStack gap="2" mt="2" flexWrap="wrap">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="مثال: React، Node.js"
                maxLength={50}
                flex="1"
                minW="120px"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                افزودن تگ
              </Button>
            </HStack>
            {tags.length > 0 && (
              <HStack gap="2" mt="2" flexWrap="wrap">
                {tags.map((tag, index) => (
                  <Badge
                    key={`${tag}-${index}`}
                    size="sm"
                    variant="subtle"
                    colorPalette="gray"
                    gap="1"
                    pr="1"
                    cursor="default"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      aria-label="حذف تگ"
                      style={{ display: "inline-flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <LuX size={14} />
                    </button>
                  </Badge>
                ))}
              </HStack>
            )}
            <Field.ErrorText>{form.formState.errors.tags?.message}</Field.ErrorText>
          </Field.Root>

          <Button type="submit" loading={create.isPending}>
            ایجاد آگهی
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
