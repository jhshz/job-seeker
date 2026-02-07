import { Container, Heading, Table, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "@/api/seekers.api";
import { queryKeys } from "@/api/query-keys";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

export function SeekerApplications() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.seekers.applications(),
    queryFn: () => getMyApplications({}),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const applications = data?.applications ?? [];

  return (
    <Container maxW="container.xl">
      <Heading size="lg" mb="6">
        درخواست‌های من
      </Heading>
      {applications.length === 0 ? (
        <Text color="fg.muted">درخواستی یافت نشد</Text>
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>شناسه</Table.ColumnHeader>
              <Table.ColumnHeader>وضعیت</Table.ColumnHeader>
              <Table.ColumnHeader>تاریخ</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {applications.map((a) => (
              <Table.Row key={a.id}>
                <Table.Cell>{a.jobId}</Table.Cell>
                <Table.Cell>{a.status}</Table.Cell>
                <Table.Cell>{new Date(a.createdAt).toLocaleDateString("fa-IR")}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Container>
  );
}
