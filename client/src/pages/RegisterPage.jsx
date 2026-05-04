import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
          
          <div className="text-center mb-lg">
            <h2 className="font-headline-lg text-headline-lg text-inverse-surface mb-xs tracking-tighter">Join CurioPath</h2>
            <p className="font-body-md text-body-md text-outline">Begin your journey of intellectual discovery.</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto relative">
            {error && <p className="text-error text-center mb-4">{error}</p>}
            
            <div className="input-wrapper">
              <input 
                className="input-field" 
                id="reg-name" 
                name="name" 
                placeholder="Full Name" 
                required 
                type="text"
                value={form.name}
                onChange={handleChange}
              />
              <label className="floating-label font-body-md" htmlFor="reg-name">Full Name</label>
            </div>
            
            <div className="input-wrapper">
              <input 
                className="input-field" 
                id="reg-email" 
                name="email" 
                placeholder="Email Address" 
                required 
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <label className="floating-label font-body-md" htmlFor="reg-email">Email Address</label>
            </div>
            
            <div className="input-wrapper mb-sm">
              <input 
                className="input-field" 
                id="reg-password" 
                name="password" 
                placeholder="Password" 
                required 
                type="password"
                minLength={6}
                value={form.password}
                onChange={handleChange}
              />
              <label className="floating-label font-body-md" htmlFor="reg-password">Password</label>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-label-md text-label-md hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-2 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Creating Account..." : "Register"}</span>
              {!loading && <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>person_add</span>}
              {loading && <span className="material-symbols-outlined spinner">autorenew</span>}
            </button>
            
            <p className="mt-md text-center font-label-sm text-label-sm text-outline px-4">
              Already have an account? <Link to="/login" className="text-secondary hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
