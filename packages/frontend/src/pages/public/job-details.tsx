import { useParams } from "react-router";
import { Badge, Container, Button, Text, Box, HStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getJobById } from "@/api/jobs.api";
import { queryKeys } from "@/api/query-keys";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { useAuthStore } from "@/stores/auth.store";
import { ApplyDialog } from "./apply-dialog";

const JOB_STATUS_LABELS: Record<string, string> = {
  draft: "پیش‌نویس",
  published: "فعال",
  closed: "بسته‌شده",
};

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

  const validId = jobId && jobId !== "undefined" ? jobId : undefined;
  const { data: job, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.jobs.detail(validId ?? ""),
    queryFn: () => getJobById(validId!),
    enabled: !!validId,
  });

  if (!validId) return <ErrorState message="آگهی یافت نشد" />;
  if (isLoading) return <Loading />;
  if (error || !job) return <ErrorState message="آگهی یافت نشد" onRetry={() => refetch()} />;

  const types = job.type?.map((t) => JOB_TYPE_LABELS[t] ?? t).join("، ") ?? "";

  return (
    <Container maxW="container.md" py="6">
      <Box mb="6">
        <HStack gap="2" mb="2">
          <Text fontSize="2xl" fontWeight="bold">
            {job.title}
          </Text>
          <Badge
            size="sm"
            colorPalette={
              job.status === "published"
                ? "green"
                : job.status === "closed"
                  ? "orange"
                  : "gray"
            }
            variant="subtle"
          >
            {JOB_STATUS_LABELS[job.status] ?? job.status}
          </Badge>
        </HStack>
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
