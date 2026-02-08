import { Box, Flex } from "@chakra-ui/react";

/** Returns strength 0–5: طول مناسب، حرف کوچک، حرف بزرگ، عدد، کاراکتر خاص */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
  return strength;
}

const strengthColors = [
  "gray",
  "red",
  "orange",
  "yellow",
  "teal",
  "green",
] as const;

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getPasswordStrength(password);

  return (
    <Flex gap="1" w="full" mt="1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          flex="1"
          h="2"
          borderRadius="full"
          bg={i < strength ? `${strengthColors[strength]}.500` : "bg.muted"}
          transition="background 0.2s"
        />
      ))}
    </Flex>
  );
}
