import { Link } from "react-router";
import { Container, Heading, Text } from "@chakra-ui/react";

export function SeekerDashboard() {
  return (
    <Container maxW="container.xl">
      <Heading size="lg" mb="4">
        داشبورد کارجو
      </Heading>
      <Text color="fg.muted" mb="6">
        به داشبورد خود خوش آمدید
      </Text>
      <Link to="/jobs" style={{ color: "var(--chakra-colors-blue-500)" }}>مشاهده آگهی‌ها</Link>
      <br />
      <Link to="/seeker/applications">درخواست‌های من</Link>
      <br />
      <Link to="/seeker/resumes">رزومه‌های من</Link>
    </Container>
  );
}
