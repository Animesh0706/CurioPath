import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/" style={{ fontWeight: "bold", fontSize: "1.2rem", textDecoration: "none" }}>
          CurioPath
        </Link>
        <Link to="/resources">Resources</Link>
        <Link to="/paths">Learning Paths</Link>
        {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {isAuthenticated ? (
          <>
            <span>Hi, {user?.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
