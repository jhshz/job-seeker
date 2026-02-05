import { RouterProvider } from "react-router/dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "@/providers/chakra-provider";
import { router } from "./router";
import "@/styles/fonts.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <RouterProvider router={router} />,
    </Provider>
  </StrictMode>,
);
