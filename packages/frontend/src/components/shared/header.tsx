import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router";
import { ColorModeButton } from "@/components/ui/color-mode";
import logo from "@/assets/images/logo.svg";

const Header = () => {
  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      bg="bg"
      color="fg"
      py="3"
      px="4"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Flex maxW="6xl" mx="auto" align="center" justify="space-between" gap="4">
        <Link to="/">
          <Flex align="center" gap="2">
            <Image src={logo} alt="لوگوی فرم رزومه" boxSize="40px" objectFit="cover" />
            <Text as="span" fontWeight="semibold" fontSize="lg">
              کارباما
            </Text>
          </Flex>
        </Link>

        <Flex align="center" gap="3">
          <Link to="/auth/login">
            <Button as="span" fontWeight="medium">
              ورود
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button as="span" fontWeight="medium" variant="outline">
              ثبت‌نام
            </Button>
          </Link>
          <ColorModeButton aria-label="تغییر حالت تاریک/روشن" />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
