import { Link } from "react-router";
import { Box, Heading, SimpleGrid, Text, Button, Flex } from "@chakra-ui/react";
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
  if (error)
    return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const jobs = data ?? [];

  return (
    <Box>
      <Flex
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap="4"
        mb="6"
      >
        <Heading size="lg">آگهی‌های من</Heading>
        <Link to="/recruiter/jobs/create">
          <Button colorPalette="brand" size="sm">
            ایجاد آگهی جدید
          </Button>
        </Link>
      </Flex>
      {jobs.length === 0 ? (
        <Box
          p="12"
          textAlign="center"
          borderRadius="md"
          borderWidth="1px"
          borderColor="border"
          bg="bg.muted"
        >
          <Text color="fg.muted" mb="4">
            آگهی‌ای یافت نشد. اولین آگهی خود را ایجاد کنید.
          </Text>
          <Link to="/recruiter/jobs/create">
            <Button colorPalette="brand">ایجاد آگهی</Button>
          </Link>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="5">
          {jobs.map((job) => (
            <Box key={job.id}>
              <JobCard job={job} showStatus />
              <Flex gap="2" mt="2" flexWrap="wrap">
                <Link to={`/recruiter/jobs/${job.id}/applications`}>
                  <Button size="xs" variant="outline" colorPalette="brand">
                    درخواست‌ها
                  </Button>
                </Link>
                <Link to={`/recruiter/jobs/${job.id}/edit`}>
                  <Button size="xs" variant="ghost">
                    ویرایش
                  </Button>
                </Link>
                <Link to={`/jobs/${job.id}`}>
                  <Button size="xs" variant="ghost">
                    مشاهده آگهی
                  </Button>
                </Link>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
