import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";

const Home = () => {
  return (
    <Box as="main" flex="1" py="12" px="4">
      <Container maxW="2xl">
        <VStack gap="8" textAlign="center" py="8">
          <Heading size="2xl" fontWeight="bold" color="fg">
            رزومه‌ی حرفه‌ای خود را بسازید
          </Heading>
          <Text fontSize="lg" color="fg.muted" lineHeight="tall" maxW="md">
            با چند قدم ساده اطلاعات و سوابق خود را وارد کنید و رزومه‌ی آماده‌ی
            ارسال داشته باشید.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;
