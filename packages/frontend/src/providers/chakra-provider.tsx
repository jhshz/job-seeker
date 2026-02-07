"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "@/components/ui/color-mode";
import { Toaster } from "@/components/ui/toaster";

export function ChakraProviderWrapper(props: ColorModeProviderProps) {
  const { children, ...rest } = props;
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...rest}>
        <div dir="rtl" style={{ direction: "rtl" }}>
          {children}
        </div>
        <Toaster />
      </ColorModeProvider>
    </ChakraProvider>
  );
}
