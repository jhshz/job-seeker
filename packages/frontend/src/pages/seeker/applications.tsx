import { Link } from "react-router";
import {
  Box,
  Heading,
  Text,
  Table,
  Badge,
  EmptyState,
  Button,
  Flex,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "@/api/seekers.api";
import { queryKeys } from "@/api/query-keys";
import type { JobApplication } from "@/api/types";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

const STATUS_LABELS: Record<string, { label: string; color: "gray" | "blue" | "green" | "red" | "orange" }> = {
  applied: { label: "ارسال شده", color: "blue" },
  reviewing: { label: "در حال بررسی", color: "blue" },
  interview: { label: "مصاحبه", color: "orange" },
  offered: { label: "پیشنهاد شده", color: "green" },
  rejected: { label: "رد شده", color: "red" },
  withdrawn: { label: "انصرافی", color: "gray" },
  pending: { label: "در انتظار", color: "gray" },
  reviewed: { label: "بررسی شده", color: "blue" },
  accepted: { label: "پذیرفته شده", color: "green" },
};

function getJobId(app: JobApplication): string {
  const j = app.jobId;
  if (typeof j === "string") return j;
  return (j?.id ?? j?._id ?? "") as string;
}

function getJobTitle(app: JobApplication): string {
  const j = app.jobId;
  if (typeof j === "string") return j.slice(0, 8) + "…";
  return (j as { title?: string })?.title ?? getJobId(app).slice(0, 8) + "…";
}

function getStatusBadge(status: string) {
  const config = STATUS_LABELS[status] ?? { label: status, color: "gray" as const };
  return (
    <Badge colorPalette={config.color} size="sm" variant="subtle">
      {config.label}
    </Badge>
  );
}

export function SeekerApplications() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.seekers.applications(),
    queryFn: () => getMyApplications({}),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const applications = data?.applications ?? [];

  return (
    <Box>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap="4" mb="6">
        <Heading size="lg">درخواست‌های من</Heading>
      </Flex>
      {applications.length === 0 ? (
        <EmptyState.Root
          borderWidth="1px"
          borderRadius="md"
          borderColor="border"
          bg="bg.panel"
          py="12"
        >
          <EmptyState.Content>
            <EmptyState.Indicator />
            <EmptyState.Title>درخواستی یافت نشد</EmptyState.Title>
            <EmptyState.Description>
              هنوز هیچ درخواستی ارسال نکرده‌اید. برای ارسال درخواست، آگهی مورد نظر خود را انتخاب کنید.
            </EmptyState.Description>
            <Link to="/jobs">
              <Button colorPalette="brand" mt="4">
                مشاهده آگهی‌ها
              </Button>
            </Link>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <Box
          borderRadius="md"
          borderWidth="1px"
          borderColor="border"
          bg="bg.panel"
          overflow="hidden"
        >
          <Text fontSize="sm" color="fg.muted" mb="3" px="4" pt="4">
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
                  <Table.ColumnHeader>آگهی</Table.ColumnHeader>
                  <Table.ColumnHeader>وضعیت</Table.ColumnHeader>
                  <Table.ColumnHeader>تاریخ ثبت</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {applications.map((a) => (
                  <Table.Row key={a.id}>
                    <Table.Cell>
                      <Link to={`/jobs/${getJobId(a)}`}>
                        <Text fontWeight="medium" color="brand.solid" _hover={{ textDecoration: "underline" }}>
                          {getJobTitle(a)}
                        </Text>
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{getStatusBadge(a.status)}</Table.Cell>
                    <Table.Cell>
                      {new Date(a.createdAt).toLocaleDateString("fa-IR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
