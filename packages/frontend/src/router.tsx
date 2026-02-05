import { createBrowserRouter } from "react-router";
import { Home, Form } from "@/pages";
import { RootLayout } from "@/components/layouts";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/form",
        element: <Form />,
      },
    ],
  },
]);
