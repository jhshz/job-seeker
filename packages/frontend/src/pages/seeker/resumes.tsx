import { Link } from "react-router";
import { Container, Heading, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getMyResumes } from "@/api/seekers.api";
import { queryKeys } from "@/api/query-keys";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

export function SeekerResumes() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.seekers.resumes,
    queryFn: getMyResumes,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const resumes = data ?? [];

  return (
    <Container maxW="container.xl">
      <Heading size="lg" mb="4">
        رزومه‌های من
      </Heading>
      <Link to="/seeker/resume-wizard" style={{ color: "var(--chakra-colors-blue-500)", display: "block", marginBottom: "24px" }}>
        ایجاد رزومه جدید
      </Link>
      {resumes.length === 0 ? (
        <Text color="fg.muted">رزومه‌ای یافت نشد</Text>
      ) : (
        <ul>
          {resumes.map((r) => (
            <li key={r.id}>
              {r.fullName}
              {r.isActive && <span> (فعال)</span>}
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
