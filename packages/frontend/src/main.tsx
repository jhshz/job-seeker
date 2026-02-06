import { RouterProvider } from "react-router/dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { router } from "./router";
import "./styles/fonts.css";
import { UiProvider, QueryProvider } from "./providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UiProvider>
      <QueryProvider>
        <RouterProvider router={router} />,
      </QueryProvider>
    </UiProvider>
  </StrictMode>
);
