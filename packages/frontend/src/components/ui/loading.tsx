import { Center, Spinner } from "@chakra-ui/react";

export function Loading() {
  return (
    <Center py="12">
      <Spinner size="lg" />
    </Center>
  );
}
