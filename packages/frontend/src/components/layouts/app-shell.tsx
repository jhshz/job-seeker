import { Outlet, Link } from "react-router";
import {
  Box,
  Container,
  Flex,
  Text,
  Button,
  SimpleGrid,
  Separator,
  Image,
} from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/use-auth";
import logoUrl from "@/assets/images/logo.svg?url";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to}>
      <Text
        as="span"
        fontSize="sm"
        fontWeight="medium"
        color="fg.muted"
        _hover={{ color: "brand.solid" }}
        transition="color 0.2s"
      >
        {children}
      </Text>
    </Link>
  );
}

export function AppShell() {
  const { user, accessToken } = useAuthStore();
  const logout = useLogout();

  return (
    <Box minH="100vh" dir="rtl" display="flex" flexDirection="column">
      <Box
        as="header"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.panel"
        py="3"
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" gap="6">
            <Link to="/">
              <Flex align="center" gap="3">
                <Image src={logoUrl} alt="جاب با ما" height="10" width="auto" />
                <Text fontWeight="bold" fontSize="xl" color="fg">
                  جاب با ما
                </Text>
              </Flex>
            </Link>
            <Flex gap="6" align="center" flexWrap="wrap">
              <NavLink to="/jobs">آگهی‌های شغلی</NavLink>
              {accessToken && user ? (
                <>
                  {user.roles.includes("seeker") && (
                    <NavLink to="/seeker/dashboard">داشبورد کارجو</NavLink>
                  )}
                  {user.roles.includes("recruiter") && (
                    <NavLink to="/recruiter/dashboard">داشبورد کارفرما</NavLink>
                  )}
                  <Button
                    variant="ghost"
                    colorPalette="red"
                    size="sm"
                    onClick={() => logout.mutate()}
                  >
                    خروج
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">
                      ورود
                    </Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button colorPalette="brand" size="sm">
                      ثبت‌نام
                    </Button>
                  </Link>
                </>
              )}
              <ColorModeButton />
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Box as="main" py="8" flex="1">
        <Outlet />
      </Box>

      <Box
        as="footer"
        borderTopWidth="1px"
        borderColor="border"
        bg="bg.muted"
        py="10"
        mt="auto"
      >
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="8" mb="8">
            <Box>
              <Link to="/">
                <Flex align="center" gap="2" mb="3" display="inline-flex">
                  <Image src={logoUrl} alt="" height="8" width="auto" />
                  <Text fontWeight="bold" fontSize="lg" color="fg">
                    جاب با ما
                  </Text>
                </Flex>
              </Link>
              <Text fontSize="sm" color="fg.muted" lineHeight="tall">
                پلتفرم جستجوی شغل و استخدام. ارتباط مستقیم کارجو و کارفرما.
              </Text>
            </Box>
            <Box>
              <Text fontWeight="semibold" fontSize="sm" color="fg" mb="3">
                لینک‌های سریع
              </Text>
              <Flex direction="column" gap="2">
                <Link to="/jobs">
                  <Text
                    as="span"
                    fontSize="sm"
                    color="fg.muted"
                    _hover={{ color: "brand.solid" }}
                  >
                    آگهی‌های شغلی
                  </Text>
                </Link>
                <Link to="/auth/login">
                  <Text
                    as="span"
                    fontSize="sm"
                    color="fg.muted"
                    _hover={{ color: "brand.solid" }}
                  >
                    ورود
                  </Text>
                </Link>
                <Link to="/auth/register">
                  <Text
                    as="span"
                    fontSize="sm"
                    color="fg.muted"
                    _hover={{ color: "brand.solid" }}
                  >
                    ثبت‌نام
                  </Text>
                </Link>
              </Flex>
            </Box>
          </SimpleGrid>
          <Separator mb="6" />
          <Text fontSize="xs" color="fg.muted" textAlign="center">
            © {new Date().getFullYear()} جاب با ما. تمامی حقوق محفوظ است.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
