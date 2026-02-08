import { Link } from "react-router";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Badge,
  SimpleGrid,
  EmptyState,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyResumes, activateResume } from "@/api/seekers.api";
import { queryKeys } from "@/api/query-keys";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";
import { HiOutlineDocumentText } from "react-icons/hi2";
import type { Resume } from "@/api/types";

export function SeekerResumes() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.seekers.resumes,
    queryFn: getMyResumes,
  });

  const activateMutation = useMutation({
    mutationFn: activateResume,
    onSuccess: () => {
      toaster.create({ title: "رزومه فعال شد", type: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.seekers.resumes });
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const resumes = (data ?? []) as Resume[];

  return (
    <Box>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap="4" mb="6">
        <Heading size="lg">رزومه‌های من</Heading>
        <Link to="/seeker/resume-wizard">
          <Button colorPalette="brand" size="sm">
            ایجاد رزومه جدید
          </Button>
        </Link>
      </Flex>
      {resumes.length === 0 ? (
        <EmptyState.Root
          borderWidth="1px"
          borderRadius="md"
          borderColor="border"
          bg="bg.panel"
          py="12"
        >
          <EmptyState.Content>
            <EmptyState.Indicator />
            <EmptyState.Title>رزومه‌ای یافت نشد</EmptyState.Title>
            <EmptyState.Description>
              اولین رزومه خود را با راهنمای گام‌به‌گام بسازید.
            </EmptyState.Description>
            <Link to="/seeker/resume-wizard">
              <Button colorPalette="brand" mt="4">
                ساخت رزومه
              </Button>
            </Link>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="5">
          {resumes.map((r) => (
            <Box
              key={r.id}
              p="5"
              borderRadius="md"
              borderWidth="1px"
              borderColor="border"
              bg="bg.panel"
              _hover={{ borderColor: "border.emphasized" }}
              transition="border-color 0.15s"
            >
              <Flex mb="3" color="brand.fg" aria-hidden>
                <HiOutlineDocumentText size={28} />
              </Flex>
              <Text fontWeight="semibold" mb="1">
                {r.fullName}
              </Text>
              {r.headline && (
                <Text fontSize="sm" color="fg.muted" mb="3" lineClamp={1}>
                  {r.headline}
                </Text>
              )}
              <Flex gap="2" align="center">
                {r.isActive && (
                  <Badge colorPalette="green" size="sm" variant="subtle">
                    فعال
                  </Badge>
                )}
                {!r.isActive && (
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette="brand"
                    onClick={() => activateMutation.mutate(r.id)}
                    loading={activateMutation.isPending}
                  >
                    فعال‌سازی
                  </Button>
                )}
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
