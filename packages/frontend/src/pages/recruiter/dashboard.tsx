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
  HiOutlineBriefcase,
  HiOutlinePlus,
  HiOutlineClipboard,
  HiOutlineUser,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { listRecruiterJobs } from "@/api/recruiters.api";
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
        p="6"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
        _hover={{
          borderColor: "brand.solid",
          shadow: "lg",
          transform: "translateY(-2px)",
        }}
        transition="all 0.2s"
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

export function RecruiterDashboard() {
  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.recruiters.jobs,
    queryFn: listRecruiterJobs,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message="خطا در بارگذاری" onRetry={() => refetch()} />;

  const jobCount = jobs?.length ?? 0;
  const publishedCount = jobs?.filter((j) => j.status === "published").length ?? 0;

  return (
    <Box>
      <Flex align="center" gap="3" mb="6">
        <Heading size="lg">داشبورد کارفرما</Heading>
        <Badge colorPalette="brand" size="lg" px="2" py="1" borderRadius="md">
          خوش آمدید
        </Badge>
      </Flex>
      <Text color="fg.muted" mb="8" fontSize="sm">
        مدیریت آگهی‌ها و درخواست‌های شغلی خود را از اینجا انجام دهید.
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4" mb="8">
        <Box
          p="4"
          borderRadius="lg"
          bg="brand.subtle"
          borderWidth="1px"
          borderColor="brand.muted"
        >
          <Text fontSize="sm" color="fg.muted" mb="1">
            تعداد آگهی‌ها
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="brand.fg">
            {jobCount}
          </Text>
        </Box>
        <Box
          p="4"
          borderRadius="lg"
          bg="green.subtle"
          borderWidth="1px"
          borderColor="green.muted"
        >
          <Text fontSize="sm" color="fg.muted" mb="1">
            آگهی‌های فعال
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="green.fg">
            {publishedCount}
          </Text>
        </Box>
      </SimpleGrid>

      <Heading size="sm" mb="4" fontWeight="semibold" color="fg.muted">
        دسترسی سریع
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        <QuickActionCard
          to="/recruiter/jobs"
          title="آگهی‌های من"
          description="مشاهده و مدیریت تمام آگهی‌های شغلی"
          Icon={HiOutlineBriefcase}
        />
        <QuickActionCard
          to="/recruiter/jobs/create"
          title="ایجاد آگهی"
          description="ثبت آگهی شغلی جدید"
          Icon={HiOutlinePlus}
        />
        <QuickActionCard
          to="/recruiter/applications"
          title="درخواست‌ها"
          description="مشاهده درخواست‌های دریافتی"
          Icon={HiOutlineClipboard}
        />
        <QuickActionCard
          to="/recruiter/profile"
          title="پروفایل"
          description="ویرایش پروفایل و تغییر رمز عبور"
          Icon={HiOutlineUser}
        />
      </SimpleGrid>
    </Box>
  );
}
