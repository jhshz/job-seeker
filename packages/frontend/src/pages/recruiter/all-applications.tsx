import { Link } from "react-router";
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Button,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { listRecruiterJobs } from "@/api/recruiters.api";
import { queryKeys } from "@/api/query-keys";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import type { Job } from "@/api/types";

function JobApplicationsCard({ job }: { job: Job }) {
  const statusLabel =
    job.status === "published"
      ? "فعال"
      : job.status === "draft"
        ? "پیش‌نویس"
        : "بسته";
  const statusColor = job.status === "published" ? "green" : job.status === "draft" ? "gray" : "red";

  return (
    <Box
      p="5"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border"
      bg="bg.panel"
      _hover={{ borderColor: "brand.solid", shadow: "md" }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start" mb="3">
        <Heading size="sm" fontWeight="semibold" lineClamp={2}>
          {job.title}
        </Heading>
        <Badge colorPalette={statusColor} size="sm">
          {statusLabel}
        </Badge>
      </Flex>
      {(job.location || job.type?.length) && (
        <Text fontSize="sm" color="fg.muted" mb="3" lineClamp={1}>
          {[job.location, job.type?.join("، ")].filter(Boolean).join(" · ")}
        </Text>
      )}
      <Flex gap="2" mt="4" flexWrap="wrap">
        <Link to={`/recruiter/jobs/${job.id}/applications`}>
          <Button size="sm" colorPalette="brand">
            مشاهده درخواست‌ها
          </Button>
        </Link>
        <Link to={`/recruiter/jobs/${job.id}/edit`}>
          <Button size="sm" variant="outline">
            ویرایش
          </Button>
        </Link>
      </Flex>
    </Box>
  );
}

export function RecruiterAllApplications() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.recruiters.jobs,
    queryFn: listRecruiterJobs,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const jobs = data ?? [];

  return (
    <Box>
      <Heading size="lg" mb="2">
        درخواست‌های دریافتی
      </Heading>
      <Text color="fg.muted" mb="6" fontSize="sm">
        برای مشاهده درخواست‌ها به هر آگهی، روی دکمه «مشاهده درخواست‌ها» کلیک کنید.
      </Text>
      {jobs.length === 0 ? (
        <Box
          p="12"
          textAlign="center"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border"
          bg="bg.muted"
        >
          <Text color="fg.muted" mb="4">
            آگهی‌ای یافت نشد. ابتدا یک آگهی ایجاد کنید.
          </Text>
          <Link to="/recruiter/jobs/create">
            <Button colorPalette="brand">ایجاد آگهی</Button>
          </Link>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
          {jobs.map((job) => (
            <JobApplicationsCard key={job.id} job={job} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
