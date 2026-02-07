import { useState } from "react";
import { Button, Dialog, Textarea } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyToJob } from "@/api/applications.api";
import { getMyResumes } from "@/api/seekers.api";
import { queryKeys } from "@/api/query-keys";
import { applyJobSchema } from "@/schemas/job.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";

type Props = { jobId: string; trigger: React.ReactNode };

export function ApplyDialog({ jobId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: resumes = [] } = useQuery({
    queryKey: queryKeys.seekers.resumes,
    queryFn: getMyResumes,
    enabled: open,
  });

  const form = useForm({
    resolver: zodResolver(applyJobSchema),
    defaultValues: { resumeId: "", coverLetter: "" },
  });

  const apply = useMutation({
    mutationFn: () =>
      applyToJob(jobId, {
        resumeId: form.getValues("resumeId"),
        coverLetter: form.getValues("coverLetter"),
      }),
    onSuccess: () => {
      toaster.create({ title: "درخواست با موفقیت ارسال شد", type: "success" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.seekers.applications() });
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>ارسال درخواست</Dialog.Title>
          </Dialog.Header>
          <form
            onSubmit={form.handleSubmit(() => apply.mutate())}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label>رزومه</label>
              <select
                {...form.register("resumeId")}
                style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              >
                <option value="">انتخاب رزومه</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName}
                  </option>
                ))}
              </select>
              {form.formState.errors.resumeId && (
                <span style={{ color: "red", fontSize: "12px" }}>
                  {form.formState.errors.resumeId.message}
                </span>
              )}
            </div>
            <div>
              <label>پیام همراه (اختیاری)</label>
              <Textarea
                {...form.register("coverLetter")}
                placeholder="پیام همراه..."
                rows={4}
              />
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setOpen(false)}>
                انصراف
              </Button>
              <Button type="submit" loading={apply.isPending}>
                ارسال درخواست
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
