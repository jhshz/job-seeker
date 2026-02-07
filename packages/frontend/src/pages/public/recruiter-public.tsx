import { useParams } from "react-router";
import { Container, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getRecruiterPublic } from "@/api/recruiters.api";
import { queryKeys } from "@/api/query-keys";
import { JobCard } from "@/components/jobs/job-card";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

export function RecruiterPublic() {
  const { recruiterId } = useParams<{ recruiterId: string }>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.recruiters.public(recruiterId ?? ""),
    queryFn: () => getRecruiterPublic(recruiterId!),
    enabled: !!recruiterId,
  });

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorState message="کارفرما یافت نشد" onRetry={() => refetch()} />;

  const jobs = data.jobs ?? [];

  return (
    <Container maxW="container.xl" py="6">
      <Heading size="lg" mb="2">
        {data.recruiter?.companyName ?? "شرکت"}
      </Heading>
      {data.recruiter?.companyDescription && (
        <Text color="fg.muted" mb="6">
          {data.recruiter.companyDescription}
        </Text>
      )}
      <Heading size="md" mb="4">
        آگهی‌های شغلی
      </Heading>
      {jobs.length === 0 ? (
        <Text color="fg.muted">آگهی‌ای یافت نشد</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
