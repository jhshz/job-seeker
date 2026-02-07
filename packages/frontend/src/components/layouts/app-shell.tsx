import { Outlet, Link } from "react-router";
import { Box, Container, Flex } from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/use-auth";

export function AppShell() {
  const { user, accessToken } = useAuthStore();
  const logout = useLogout();

  return (
    <Box minH="100vh" dir="rtl">
      <Box as="header" borderBottomWidth="1px" py="3">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Link to="/" style={{ fontWeight: "bold", fontSize: "1.125rem" }}>
              جاب با ما
            </Link>
            <Flex gap="4" align="center">
              <Link to="/jobs">آگهی‌های شغلی</Link>
              {accessToken && user ? (
                <>
                  {user.roles.includes("seeker") && (
                    <Link to="/seeker/dashboard">داشبورد کارجو</Link>
                  )}
                  {user.roles.includes("recruiter") && (
                    <Link to="/recruiter/dashboard">داشبورد کارفرما</Link>
                  )}
                  <button
                    type="button"
                    onClick={() => logout.mutate()}
                    style={{
                      color: "var(--chakra-colors-red-500)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      font: "inherit",
                    }}
                  >
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/login">ورود</Link>
                  <Link to="/auth/register">ثبت‌نام</Link>
                </>
              )}
              <ColorModeButton />
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Box as="main" py="6">
        <Outlet />
      </Box>
    </Box>
  );
}
