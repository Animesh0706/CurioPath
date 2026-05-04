import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-md relative overflow-hidden bg-grid font-body-md text-body-md min-h-[80vh]">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-container blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-container blur-[100px] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="glass-card rounded-xl p-lg flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          {/* Top Inner Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <div className="text-center mb-lg">
            <h1 className="font-headline-lg text-headline-lg text-inverse-surface mb-xs tracking-tighter">Welcome Back</h1>
            <p className="font-body-md text-body-md text-outline">Access your learning paths and resources.</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
            {error && <p className="text-error text-center mb-4">{error}</p>}
            
            <div className="input-wrapper">
              <input 
                className="input-field" 
                id="login-email" 
                name="email" 
                placeholder="Email Address" 
                required 
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <label className="floating-label font-body-md" htmlFor="login-email">Email Address</label>
            </div>
            
            <div className="input-wrapper mb-sm">
              <input 
                className="input-field" 
                id="login-password" 
                name="password" 
                placeholder="Password" 
                required 
                type="password"
                value={form.password}
                onChange={handleChange}
              />
              <label className="floating-label font-body-md" htmlFor="login-password">Password</label>
            </div>
            
            <div className="flex items-center justify-between mb-lg px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input className="form-checkbox bg-surface-container border-outline rounded text-primary focus:ring-primary focus:ring-offset-background" type="checkbox"/>
                <span className="font-label-md text-label-md text-on-surface-variant">Remember me</span>
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Logging in..." : "Login"}</span>
              {!loading && <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>login</span>}
              {loading && <span className="material-symbols-outlined spinner">autorenew</span>}
            </button>
            
            <div className="mt-md text-center">
              <p className="font-label-md text-label-md text-outline mb-2">Don't have an account?</p>
              <Link to="/register" className="text-primary hover:text-primary-fixed transition-colors font-label-md">Register instead</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
