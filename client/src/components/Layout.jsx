import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main className="pt-[104px] px-margin max-w-screen-2xl mx-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
