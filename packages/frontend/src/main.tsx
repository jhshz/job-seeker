import { RouterProvider } from "react-router/dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { router } from "@/router";
import { QueryProvider } from "@/providers/query-provider";
import { ChakraProviderWrapper } from "@/providers/chakra-provider";
import { AuthProvider } from "@/providers/auth-provider";
import "./styles/fonts.css";

if (typeof document !== "undefined") {
  document.documentElement.setAttribute("dir", "rtl");
  document.documentElement.setAttribute("lang", "fa");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProviderWrapper>
      <QueryProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryProvider>
    </ChakraProviderWrapper>
  </StrictMode>,
);
