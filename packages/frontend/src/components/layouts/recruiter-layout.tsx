import { Outlet, Link, useLocation } from "react-router";
import {
  Box,
  Container,
  Flex,
  Text,
  Separator,
  Badge,
} from "@chakra-ui/react";

const navItems = [
  { to: "/recruiter/dashboard", label: "داشبورد", icon: "📊" },
  { to: "/recruiter/jobs", label: "آگهی‌های من", icon: "💼" },
  { to: "/recruiter/jobs/create", label: "ایجاد آگهی", icon: "➕" },
  { to: "/recruiter/applications", label: "درخواست‌ها", icon: "📋" },
  { to: "/recruiter/profile", label: "پروفایل", icon: "👤" },
];

function NavItem({
  to,
  label,
  icon,
  isActive,
}: {
  to: string;
  label: string;
  icon: string;
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
        <Text fontSize="lg" aria-hidden>
          {icon}
        </Text>
        <Text fontSize="sm">{label}</Text>
      </Flex>
    </Link>
  );
}

export function RecruiterLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/recruiter/dashboard") {
      return location.pathname === "/recruiter/dashboard" || location.pathname === "/recruiter";
    }
    return location.pathname.startsWith(path);
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
          <Flex
            px="3"
            py="2"
            mb="2"
            align="center"
            gap="2"
            borderBottomWidth="1px"
            borderColor="border"
            pb="3"
          >
            <Badge colorPalette="brand" size="lg" px="2" py="1" borderRadius="md">
              پنل کارفرما
            </Badge>
          </Flex>
          <Flex direction="column" gap="1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
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
