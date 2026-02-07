import { Outlet, useMatches } from "react-router";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { useEffect } from "react";

export function AuthLayout() {
  const matches = useMatches();
  const match = matches.find((m) => (m.handle as { title?: string })?.title);
  const handle = match?.handle as { title?: string; description?: string };

  useEffect(() => {
    if (handle?.title) {
      document.title = `${handle.title} | جاب‌سکر`;
    }
  }, [handle?.title]);

  return (
    <Container maxW="md" py="8">
      <Box>
        {handle?.title && (
          <Heading size="lg" mb="2">
            {handle.title}
          </Heading>
        )}
        {handle?.description && (
          <Text color="fg.muted" mb="6">
            {handle.description}
          </Text>
        )}
        <Outlet />
      </Box>
    </Container>
  );
}
