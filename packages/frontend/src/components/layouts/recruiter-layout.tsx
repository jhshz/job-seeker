import { Outlet, Link, useLocation } from "react-router";
import { Box, Container, Flex, Text, Badge } from "@chakra-ui/react";
import {
  HiOutlineChartBar,
  HiOutlineBriefcase,
  HiOutlinePlus,
  HiOutlineClipboard,
  HiOutlineUser,
} from "react-icons/hi2";
import type { IconType } from "react-icons";

const navItems: { to: string; label: string; Icon: IconType }[] = [
  { to: "/recruiter/dashboard", label: "داشبورد", Icon: HiOutlineChartBar },
  { to: "/recruiter/jobs", label: "آگهی‌های من", Icon: HiOutlineBriefcase },
  { to: "/recruiter/jobs/create", label: "ایجاد آگهی", Icon: HiOutlinePlus },
  {
    to: "/recruiter/applications",
    label: "درخواست‌ها",
    Icon: HiOutlineClipboard,
  },
  { to: "/recruiter/profile", label: "پروفایل", Icon: HiOutlineUser },
];

function NavItem({
  to,
  label,
  Icon,
  isActive,
}: {
  to: string;
  label: string;
  Icon: IconType;
  isActive: boolean;
}) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <Flex
        align="center"
        gap="3"
        px="4"
        py="3"
        borderRadius="lg"
        bg={isActive ? "brand.subtle" : "transparent"}
        color={isActive ? "brand.fg" : "fg.muted"}
        fontWeight={isActive ? "semibold" : "medium"}
        _hover={{
          bg: isActive ? "brand.subtle" : "bg.muted",
          color: isActive ? "brand.fg" : "fg",
        }}
        transition="all 0.2s"
      >
        <Text fontSize="lg" aria-hidden display="flex" alignItems="center">
          <Icon size={20} />
        </Text>
        <Text fontSize="sm">{label}</Text>
      </Flex>
    </Link>
  );
}

export function RecruiterLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    const { pathname } = location;
    if (path === "/recruiter/dashboard") {
      return pathname === "/recruiter/dashboard" || pathname === "/recruiter";
    }
    if (pathname === path) return true;
    if (!pathname.startsWith(path + "/")) return false;
    // On a sub-route of path; only active if no other nav item is a more specific match
    const moreSpecific = navItems.some(
      (item) =>
        item.to !== path &&
        item.to.length > path.length &&
        pathname.startsWith(item.to),
    );
    return !moreSpecific;
  };

  return (
    <Container maxW="container.xl">
      <Flex gap="8" flexDir={{ base: "column", lg: "row" }} align="stretch">
        <Box
          as="aside"
          flexShrink={0}
          w={{ base: "100%", lg: "240px" }}
          borderWidth="1px"
          borderColor="border"
          borderRadius="xl"
          bg="bg.panel"
          p="2"
          alignSelf={{ base: "stretch", lg: "flex-start" }}
        >
          <Flex direction="column" gap="1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                Icon={item.Icon}
                isActive={isActive(item.to)}
              />
            ))}
          </Flex>
        </Box>

        <Box flex="1" minW={0}>
          <Outlet />
        </Box>
      </Flex>
    </Container>
  );
}
