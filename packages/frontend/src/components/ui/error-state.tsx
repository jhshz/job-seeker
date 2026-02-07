import { Box, Button, Text } from "@chakra-ui/react";

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = "خطایی رخ داد", onRetry }: Props) {
  return (
    <Box textAlign="center" py="12">
      <Text color="fg.muted" mb="4">
        {message}
      </Text>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          تلاش مجدد
        </Button>
      )}
    </Box>
  );
}
