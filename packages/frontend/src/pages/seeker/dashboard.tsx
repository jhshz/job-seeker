import { Link } from "react-router";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineUser,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { getMyApplications, getMyResumes } from "@/api/seekers.api";
import { queryKeys } from "@/api/query-keys";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

function QuickActionCard({
  to,
  title,
  description,
  Icon,
}: {
  to: string;
  title: string;
  description: string;
  Icon: IconType;
}) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <Box
        p="5"
        borderRadius="md"
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
        transition="border-color 0.15s"
        _hover={{ borderColor: "border.emphasized" }}
      >
        <Flex mb="3" color="brand.fg" aria-hidden>
          <Icon size={28} />
        </Flex>
        <Heading size="sm" mb="2" fontWeight="semibold">
          {title}
        </Heading>
        <Text fontSize="sm" color="fg.muted" mb="4" lineClamp={2}>
          {description}
        </Text>
        <Button size="sm" colorPalette="brand" variant="outline">
          مشاهده
        </Button>
      </Box>
    </Link>
  );
}

export function SeekerDashboard() {
  const { data: applicationsData, isLoading: appsLoading, error: appsError, refetch: refetchApps } = useQuery({
    queryKey: queryKeys.seekers.applications(),
    queryFn: () => getMyApplications({}),
  });
  const { data: resumes, isLoading: resumesLoading, error: resumesError, refetch: refetchResumes } = useQuery({
    queryKey: queryKeys.seekers.resumes,
    queryFn: getMyResumes,
  });

  const isLoading = appsLoading || resumesLoading;
  const error = appsError || resumesError;
  const refetch = () => {
    refetchApps();
    refetchResumes();
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={refetch} />;

  const applicationCount = applicationsData?.applications?.length ?? 0;
  const resumeCount = resumes?.length ?? 0;

  return (
    <Box>
      <Flex align="center" gap="3" mb="6">
        <Heading size="lg">داشبورد کارجو</Heading>
        <Badge colorPalette="brand" size="lg" px="2" py="1" borderRadius="md">
          خوش آمدید
        </Badge>
      </Flex>
      <Text color="fg.muted" mb="8" fontSize="sm">
        مدیریت درخواست‌ها و رزومه‌های خود را از اینجا انجام دهید.
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4" mb="8">
        <Box
          p="4"
          borderRadius="md"
          bg="brand.subtle"
          borderWidth="1px"
          borderColor="border"
        >
          <Text fontSize="sm" color="fg.muted" mb="1">
            تعداد درخواست‌ها
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="brand.fg">
            {applicationCount}
          </Text>
        </Box>
        <Box
          p="4"
          borderRadius="md"
          bg="green.subtle"
          borderWidth="1px"
          borderColor="border"
        >
          <Text fontSize="sm" color="fg.muted" mb="1">
            رزومه‌های من
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="green.fg">
            {resumeCount}
          </Text>
        </Box>
      </SimpleGrid>

      <Heading size="sm" mb="4" fontWeight="semibold" color="fg.muted">
        دسترسی سریع
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        <QuickActionCard
          to="/seeker/applications"
          title="درخواست‌های من"
          description="مشاهده تمام درخواست‌های ارسالی برای آگهی‌ها"
          Icon={HiOutlineClipboardDocumentList}
        />
        <QuickActionCard
          to="/seeker/resumes"
          title="رزومه‌های من"
          description="مشاهده و مدیریت رزومه‌ها"
          Icon={HiOutlineDocumentText}
        />
        <QuickActionCard
          to="/seeker/resume-wizard"
          title="ساخت رزومه"
          description="ایجاد رزومه جدید با راهنمای گام‌به‌گام"
          Icon={HiOutlinePlus}
        />
        <QuickActionCard
          to="/seeker/profile"
          title="پروفایل و تنظیمات"
          description="ویرایش پروفایل و تغییر رمز عبور"
          Icon={HiOutlineUser}
        />
      </SimpleGrid>
    </Box>
  );
}
