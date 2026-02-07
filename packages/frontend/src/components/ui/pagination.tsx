import { Button, Flex } from "@chakra-ui/react";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: Props) {
  return (
    <Flex gap="2" justify="center" py="4">
      <Button
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        قبلی
      </Button>
      <Button size="sm" variant="ghost" disabled>
        {page} از {totalPages}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        بعدی
      </Button>
    </Flex>
  );
}
