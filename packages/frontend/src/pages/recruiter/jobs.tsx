import { Link } from "react-router";
import { Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { listRecruiterJobs } from "@/api/recruiters.api";
import { queryKeys } from "@/api/query-keys";
import { JobCard } from "@/components/jobs/job-card";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

export function RecruiterJobs() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.recruiters.jobs,
    queryFn: listRecruiterJobs,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const jobs = data ?? [];

  return (
    <Container maxW="container.xl">
      <Heading size="lg" mb="4">
        آگهی‌های من
      </Heading>
      <Link
        to="/recruiter/jobs/create"
        style={{
          display: "inline-block",
          marginBottom: "24px",
          color: "var(--chakra-colors-blue-500)",
        }}
      >
        ایجاد آگهی جدید
      </Link>
      {jobs.length === 0 ? (
        <Text color="fg.muted">آگهی‌ای یافت نشد</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
          {jobs.map((job) => (
            <div key={job.id}>
              <JobCard job={job} />
              <Link to={`/recruiter/jobs/${job.id}/edit`} style={{ fontSize: "14px", marginTop: "8px", display: "inline-block" }}>
                ویرایش
              </Link>
              <span> | </span>
              <Link to={`/recruiter/jobs/${job.id}/applications`} style={{ fontSize: "14px" }}>
                درخواست‌ها
              </Link>
            </div>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
