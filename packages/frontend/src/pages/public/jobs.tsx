import { useState } from "react";
import { Container, SimpleGrid, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { listJobs } from "@/api/jobs.api";
import { queryKeys } from "@/api/query-keys";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/ui/pagination";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

export function Jobs() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [tags, setTags] = useState("");

  const params = { page, limit: 20, q: q || undefined, location: location || undefined, type: type || undefined, tags: tags || undefined };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.jobs.all(params),
    queryFn: () => listJobs(params),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری آگهی‌ها" onRetry={() => refetch()} />;

  const jobs = data?.jobs ?? [];
  const meta = data?.meta as { totalPages?: number } | undefined;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <Container maxW="container.xl" py="6">
      <JobFilters
        search={q}
        onSearchChange={setQ}
        location={location}
        onLocationChange={setLocation}
        type={type}
        onTypeChange={setType}
        tags={tags}
        onTagsChange={setTags}
      />
      {jobs.length === 0 ? (
        <Text color="fg.muted" textAlign="center" py="12">
          آگهی‌ای یافت نشد
        </Text>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </SimpleGrid>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </Container>
  );
}
