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
    <nav className="bg-white/5 dark:bg-neutral-950/40 backdrop-blur-xl font-sans text-sm font-medium tracking-wide fixed top-0 w-full z-50 border-b border-white/10 shadow-xl shadow-violet-500/5">
      <div className="flex items-center justify-between px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-violet-500 dark:text-violet-400" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
          <Link to="/" className="text-2xl font-black tracking-tighter text-neutral-900 dark:text-white">CurioPath</Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-md">
          <Link to="/resources" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/10 dark:hover:bg-neutral-800/50 transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 transform px-3 py-2 rounded-DEFAULT">
            Resources
          </Link>
          <Link to="/paths" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/10 dark:hover:bg-neutral-800/50 transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 transform px-3 py-2 rounded-DEFAULT">
            Learning Paths
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/10 dark:hover:bg-neutral-800/50 transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 transform px-3 py-2 rounded-DEFAULT">
              Dashboard
            </Link>
          )}
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-md">
          <div className="hidden lg:flex relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: "20px" }}>search</span>
            <input className="bg-surface-container text-on-surface border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-full py-1.5 pl-10 pr-4 text-label-sm font-label-sm w-48 placeholder:text-outline-variant transition-colors duration-300" placeholder="Search paths..." type="text"/>
          </div>

          <div className="flex items-center gap-xs">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-label-md font-label-md text-on-surface">
                  Hi, {user?.name}
                </span>
                <button onClick={handleLogout} className="inline-flex items-center justify-center px-4 py-2 text-label-md font-label-md bg-surface-container text-on-surface rounded-lg hover:bg-white/5 transition-all duration-300 border border-outline-variant">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-label-md font-label-md text-on-surface glass-panel rounded-lg hover:bg-white/5 transition-all duration-300">
                  Login
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 text-label-md font-label-md bg-primary text-on-primary rounded-lg hover:bg-primary-fixed-dim transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
