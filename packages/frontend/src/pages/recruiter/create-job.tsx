import { Box, Heading } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema } from "@/schemas/job.schemas";
import type { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "@/api/recruiters.api";
import { queryKeys } from "@/api/query-keys";
import { Button, Field, Input, Stack, Textarea } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";
import { useNavigate } from "react-router";

type Form = z.infer<typeof createJobSchema>;

export function CreateJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
          <Button type="submit" loading={create.isPending}>
            ایجاد آگهی
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
