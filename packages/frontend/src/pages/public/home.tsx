import { Link } from "react-router";
import { Container, Heading, Text } from "@chakra-ui/react";

export function Home() {
  return (
    <Container maxW="container.xl" py="12">
      <Heading size="xl" mb="4">
        جاب‌سکر
      </Heading>
      <Text color="fg.muted" mb="6">
        پلتفرم جستجوی شغل و استخدام
      </Text>
      <Link to="/jobs" style={{ color: "var(--chakra-colors-blue-500)" }}>
        مشاهده آگهی‌های شغلی
      </Link>
    </Container>
  );
}
