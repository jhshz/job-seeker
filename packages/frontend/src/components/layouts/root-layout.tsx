import { Header } from "../shared";
import { Outlet } from "react-router";

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
};

export default RootLayout;
