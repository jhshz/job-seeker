import { useParams } from "react-router";
import { Container, Button, Text, Box } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getJobById } from "@/api/jobs.api";
import { queryKeys } from "@/api/query-keys";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { useAuthStore } from "@/stores/auth.store";
import { ApplyDialog } from "./apply-dialog";

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "تمام وقت",
  "part-time": "پاره وقت",
  remote: "دورکاری",
  hybrid: "ترکیبی",
  contract: "قراردادی",
  internship: "کارآموزی",
  freelance: "دورکاری",
};

export function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const user = useAuthStore((s) => s.user);
  const isSeeker = user?.roles?.includes("seeker");

  const { data: job, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.jobs.detail(jobId ?? ""),
    queryFn: () => getJobById(jobId!),
    enabled: !!jobId,
  });

  if (isLoading) return <Loading />;
  if (error || !job) return <ErrorState message="آگهی یافت نشد" onRetry={() => refetch()} />;

  const types = job.type?.map((t) => JOB_TYPE_LABELS[t] ?? t).join("، ") ?? "";

  return (
    <Container maxW="container.md" py="6">
      <Box mb="6">
        <Text fontSize="2xl" fontWeight="bold" mb="2">
          {job.title}
        </Text>
        <Text color="fg.muted" fontSize="sm" mb="4">
          {[job.location, types].filter(Boolean).join(" · ")}
        </Text>
        <Text>{job.description}</Text>
        {job.tags?.length ? (
          <Text fontSize="sm" color="fg.muted" mt="4">
            تگ‌ها: {job.tags.join("، ")}
          </Text>
        ) : null}
      </Box>
      {isSeeker && (
        <ApplyDialog jobId={job.id} trigger={<Button>ارسال درخواست</Button>} />
      )}
    </Container>
  );
}
