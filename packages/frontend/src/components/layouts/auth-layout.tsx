import { Center, Heading, Stack, Text } from "@chakra-ui/react";
import { Link, Outlet, useMatches } from "react-router";

type AuthMeta = {
  title: string;
  description: string;
  link: string;
  linkText: string;
};

const AuthLayout = () => {
  const matches = useMatches();
  const current = matches[matches.length - 1];
  const meta = current?.handle as Partial<AuthMeta> | undefined;

  // safe defaults (optional)
  const title = meta?.title ?? "";
  const description = meta?.description ?? "";
  const link = meta?.link ?? "/auth/login";
  const linkText = meta?.linkText ?? "";

  return (
    <Center minH="100dvh" px="4">
      <Stack gap="6" w="full" maxW="md">
        {/* header */}
        <Stack gap="1" textAlign="center">
          <Heading size="xl">{title}</Heading>
        </Stack>

        <Outlet />

        <Text color="fg.muted" textAlign="center">
          {description} <Link to={link}>{linkText}</Link>
        </Text>
      </Stack>
    </Center>
  );
};

export default AuthLayout;
