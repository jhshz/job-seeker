import { useState } from "react";
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
  Dialog,
  HStack,
  Switch,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyResumes, activateResume, deleteResume } from "@/api/seekers.api";
import { queryKeys } from "@/api/query-keys";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";
import {
  HiOutlineDocumentText,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import type { Resume } from "@/api/types";

export function SeekerResumes() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.seekers.resumes,
    queryFn: getMyResumes,
  });

  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      toaster.create({ title: "رزومه حذف شد", type: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.seekers.resumes });
      setDeleteTarget(null);
    },
    onError: (err) => {
      toaster.create({
        title: "خطا",
        description: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  const onConfirmDelete = () => {
    if (deleteTarget) {
      const id =
        "id" in deleteTarget
          ? deleteTarget.id
          : (deleteTarget as { _id: string })._id;
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Loading />;
  if (error)
    return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const resumes = (data ?? []) as Resume[];

  return (
    <Box>
      <Flex
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap="4"
        mb="6"
      >
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
          {resumes.map((r) => {
            const resumeId = "id" in r ? r.id : (r as { _id: string })._id;
            return (
              <Box
                key={resumeId}
                p="5"
                borderRadius="md"
                borderWidth="1px"
                borderColor="border"
                bg="bg.panel"
                _hover={{ borderColor: "border.emphasized" }}
                transition="border-color 0.15s"
              >
                <Flex mb="3" color="brand.fg" aria-hidden gap="2">
                  <HiOutlineDocumentText size={28} />
                  <Text fontWeight="semibold" mb="1">
                    {r.title?.trim() || "رزومه بدون عنوان"}
                  </Text>
                </Flex>
                <Text fontSize="sm" color="fg.muted" mb="3">
                  {new Intl.DateTimeFormat("fa-IR", {
                    calendar: "persian",
                    dateStyle: "medium",
                  }).format(new Date(r.createdAt))}
                </Text>
                <Flex gap="2" align="center" flexWrap="wrap">
                  {r.isActive ? (
                    <Badge colorPalette="green" size="lg" variant="subtle">
                      فعال
                    </Badge>
                  ) : (
                    <Switch.Root
                      size="sm"
                      colorPalette="green"
                      checked={false}
                      disabled={activateMutation.isPending}
                      onCheckedChange={(details) => {
                        if (details.checked) activateMutation.mutate(resumeId);
                      }}
                      label="فعال‌سازی رزومه"
                    >
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label>فعال‌سازی</Switch.Label>
                    </Switch.Root>
                  )}
                  <Link to={`/seeker/resume-wizard/${resumeId}`}>
                    <Button size="xs" variant="outline">
                      <HStack gap="1.5">
                        <HiOutlinePencilSquare />
                        <span>ویرایش</span>
                      </HStack>
                    </Button>
                  </Link>

                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette="red"
                    onClick={() => setDeleteTarget(r)}
                  >
                    <HStack gap="1.5">
                      <HiOutlineTrash />
                      <span>حذف</span>
                    </HStack>
                  </Button>
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      <Dialog.Root
        open={!!deleteTarget}
        onOpenChange={(e) => !e.open && setDeleteTarget(null)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content textAlign="right">
            <Dialog.Header display="flex" flexDirection="column">
              <Dialog.Title>حذف رزومه</Dialog.Title>
              <Dialog.Description>
                .آیا از حذف این رزومه اطمینان دارید؟ این عمل قابل بازگشت نیست
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer gap="2" flexDirection="row-reverse">
              <Button
                colorPalette="red"
                onClick={onConfirmDelete}
                loading={deleteMutation.isPending}
              >
                حذف
              </Button>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                انصراف
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}
