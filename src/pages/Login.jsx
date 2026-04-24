import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login, loginWithGitHub, getUser } from "../lib/auth";
import { getUserProfile } from "../lib/users";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const afterLogin = async () => {
    const u = await getUser();
    const p = await getUserProfile(u.$id).catch(() => null);
    setUser(u);
    setProfile(p);
    navigate(p ? "/" : "/setup-profile");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      await afterLogin();
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-900/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Logo size={40} />
            <div className="text-left">
              <div className="font-heading font-black text-2xl text-white tracking-tight">SNO</div>
              <div className="text-white/40 text-xs tracking-wider uppercase">School News Official</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="font-heading text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to comment and interact with stories.</p>

          {/* GitHub OAuth */}
          <button
            onClick={loginWithGitHub}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-800 transition-colors mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">admin login</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
