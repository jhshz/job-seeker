import { useState } from "react";
import { Button, Group, Input } from "@chakra-ui/react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import type { InputProps } from "@chakra-ui/react";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  /** When using with react-hook-form, spread register("fieldName") */
  type?: "password" | "text";
}

/**
 * Password input with show/hide toggle. Use with Field.Root + Field.Label.
 * Spread register("fieldName") from react-hook-form.
 */
export function PasswordInput({ type: _type, ...inputProps }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Group attached w="full">
      <Input
        flex="1"
        type={visible ? "text" : "password"}
        aria-label={inputProps["aria-label"]}
        {...inputProps}
      />
      <Button
        type="button"
        aria-label={visible ? "مخفی کردن رمز" : "نمایش رمز"}
        bg="bg.subtle"
        variant="outline"
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <LuEyeOff /> : <LuEye />}
      </Button>
    </Group>
  );
}
