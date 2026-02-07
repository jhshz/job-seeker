import { useParams } from "react-router";
import { Container, Heading } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateJobSchema } from "@/schemas/job.schemas";
import type { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobById } from "@/api/jobs.api";
import { updateJob } from "@/api/recruiters.api";
import { queryKeys } from "@/api/query-keys";
import { Button, Field, Input, Stack, Textarea } from "@chakra-ui/react";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";
import { useNavigate } from "react-router";
import { useEffect } from "react";

type Form = z.infer<typeof updateJobSchema>;

export function EditJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: job, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.jobs.detail(jobId ?? ""),
    queryFn: () => getJobById(jobId!),
    enabled: !!jobId,
  });

  const form = useForm<Form>({
    resolver: zodResolver(updateJobSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "draft",
      type: [],
      location: "",
      tags: [],
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        description: job.description,
        status: job.status,
        type: (job.type ?? []) as Form["type"],
        location: job.location ?? "",
        tags: job.tags ?? [],
      });
    }
  }, [job, form]);

  const update = useMutation({
    mutationFn: (data: Form) => updateJob(jobId!, data),
    onSuccess: () => {
      toaster.create({ title: "آگهی ویرایش شد", type: "success" });
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

  const onSubmit = form.handleSubmit((data) => update.mutate(data));

  if (isLoading) return <Loading />;
  if (error || !job) return <ErrorState message="آگهی یافت نشد" onRetry={() => refetch()} />;

  return (
    <Container maxW="container.md">
      <Heading size="lg" mb="6">
        ویرایش آگهی
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
          <Button type="submit" loading={update.isPending}>
            ذخیره تغییرات
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
