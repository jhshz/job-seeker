import { Link } from "react-router";
import {
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Box,
  SimpleGrid,
} from "@chakra-ui/react";

const features = [
  {
    title: "آگهی‌های معتبر",
    description: "ارتباط مستقیم با کارفرمایان و آگهی‌های به‌روز",
  },
  {
    title: "رزومه و درخواست",
    description: "مدیریت رزومه و پیگیری درخواست‌ها در یک جا",
  },
  {
    title: "ساده و سریع",
    description: "ثبت‌نام و جستجو در چند دقیقه",
  },
];

export function Home() {
  return (
    <Box>
      <Box
        bg="brand.subtle/50"
        borderBottomWidth="1px"
        borderColor="border"
        py={{ base: "12", md: "20" }}
      >
        <Container maxW="container.xl">
          <Flex
            direction="column"
            align="center"
            textAlign="center"
            gap="6"
            maxW="2xl"
            mx="auto"
          >
            <Heading
              size={{ base: "2xl", md: "3xl" }}
              color="fg"
              fontWeight="bold"
              lineHeight="tight"
            >
              شغل مناسب خود را پیدا کنید
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="fg.muted"
              lineHeight="tall"
            >
              پلتفرم جستجوی شغل و استخدام. هزاران آگهی شغلی از کارفرمایان معتبر.
            </Text>
            <Flex
              gap="4"
              direction={{ base: "column", sm: "row" }}
              w="full"
              justify="center"
              flexWrap="wrap"
            >
              <Link to="/jobs">
                <Button
                  colorPalette="brand"
                  size="lg"
                  w={{ base: "full", sm: "auto" }}
                >
                  مشاهده آگهی‌های شغلی
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button
                  variant="outline"
                  colorPalette="brand"
                  size="lg"
                  w={{ base: "full", sm: "auto" }}
                >
                  ثبت‌نام / ورود
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py="16">
        <Text
          fontWeight="semibold"
          fontSize="sm"
          color="fg.muted"
          textAlign="center"
          mb="8"
        >
          چرا جاب با ما؟
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="8">
          {features.map((item) => (
            <Box
              key={item.title}
              p="6"
              rounded="lg"
              bg="bg.panel"
              borderWidth="1px"
              borderColor="border"
            >
              <Heading size="sm" color="fg" mb="2">
                {item.title}
              </Heading>
              <Text fontSize="sm" color="fg.muted" lineHeight="tall">
                {item.description}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
