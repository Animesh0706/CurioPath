import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
