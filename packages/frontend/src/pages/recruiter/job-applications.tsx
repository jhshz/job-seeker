import { Link, useParams } from "react-router";
import {
  Box,
  Heading,
  Table,
  Text,
  Button,
  Badge,
  EmptyState,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getJobApplications } from "@/api/recruiters.api";
import { queryKeys } from "@/api/query-keys";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

const STATUS_LABELS: Record<string, { label: string; color: "gray" | "blue" | "green" | "red" }> = {
  pending: { label: "در انتظار", color: "gray" },
  reviewed: { label: "بررسی شده", color: "blue" },
  accepted: { label: "پذیرفته شده", color: "green" },
  rejected: { label: "رد شده", color: "red" },
};

function getStatusBadge(status: string) {
  const config = STATUS_LABELS[status] ?? { label: status, color: "gray" as const };
  return <Badge colorPalette={config.color} size="sm" variant="subtle">{config.label}</Badge>;
}

export function JobApplications() {
  const { jobId } = useParams<{ jobId: string }>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.recruiters.jobApplications(jobId ?? ""),
    queryFn: () => getJobApplications(jobId!),
    enabled: !!jobId,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const applications = data?.applications ?? [];

  return (
    <Box>
      <Link to="/recruiter/jobs">
        <Button size="sm" variant="ghost" mb="4">
          ← بازگشت به آگهی‌ها
        </Button>
      </Link>
      <Heading size="lg" mb="6">
        درخواست‌های این آگهی
      </Heading>
      {applications.length === 0 ? (
        <EmptyState.Root
          borderWidth="1px"
          borderRadius="md"
          borderColor="border"
          py="12"
        >
          <EmptyState.Content>
            <EmptyState.Indicator />
            <EmptyState.Title>درخواستی یافت نشد</EmptyState.Title>
            <EmptyState.Description>
              هنوز هیچ متقاضی برای این آگهی درخواست نداده است.
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <Box
          borderRadius="md"
          borderWidth="1px"
          borderColor="border"
          overflow="hidden"
        >
          <Text fontSize="sm" color="fg.muted" mb="3">
            تعداد {applications.length} درخواست
          </Text>
          <Table.ScrollArea>
            <Table.Root
              size="sm"
              variant="outline"
              striped
              interactive
              stickyHeader
            >
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>شناسه</Table.ColumnHeader>
                  <Table.ColumnHeader>وضعیت</Table.ColumnHeader>
                  <Table.ColumnHeader>تاریخ ثبت</Table.ColumnHeader>
                  <Table.ColumnHeader>رزومه</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {applications.map((a) => (
                  <Table.Row key={a.id}>
                    <Table.Cell fontWeight="medium">{a.id.slice(0, 8)}…</Table.Cell>
                    <Table.Cell>{getStatusBadge(a.status)}</Table.Cell>
                    <Table.Cell>
                      {new Date(a.createdAt).toLocaleDateString("fa-IR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="xs" color="fg.muted">
                        {a.resumeId.slice(0, 8)}…
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      )}
    </Box>
  );
}
