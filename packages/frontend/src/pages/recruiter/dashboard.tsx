import { Link } from "react-router";
import { Container, Heading, Text } from "@chakra-ui/react";

export function RecruiterDashboard() {
  return (
    <Container maxW="container.xl">
      <Heading size="lg" mb="4">
        داشبورد کارفرما
      </Heading>
      <Text color="fg.muted" mb="6">
        به داشبورد خود خوش آمدید
      </Text>
      <Link to="/recruiter/jobs" style={{ color: "var(--chakra-colors-blue-500)" }}>
        آگهی‌های من
      </Link>
      <br />
      <Link to="/recruiter/jobs/create" style={{ color: "var(--chakra-colors-blue-500)" }}>
        ایجاد آگهی جدید
      </Link>
    </Container>
  );
}
