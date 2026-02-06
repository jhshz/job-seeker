import { createBrowserRouter } from "react-router";
import { Home, Login, Register } from "@/pages";
import { AuthLayout, RootLayout } from "@/components/layouts";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
            handle: {
              title: "ورود به حساب کاربری",
              description: "حساب ندارید؟",
              link: "/auth/register",
              linkText: "ثبت‌نام کنید",
            },
          },
          {
            path: "register",
            element: <Register />,
            handle: {
              title: "ثبت‌نام",
              description: "قبلاً حساب دارید؟",
              link: "/auth/login",
              linkText: "وارد شوید",
            },
          },
        ],
      },
    ],
  },
]);
