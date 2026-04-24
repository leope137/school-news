import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { logout } from "./lib/auth";
import Home from "./pages/Home";
import CreateStory from "./pages/CreateStory";
import StoryDetail from "./pages/StoryDetail";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import SetupProfile from "./pages/SetupProfile";
import Splash from "./components/Splash";
import Logo from "./components/Logo";

function Navbar() {
  const { user, isAdmin, canWrite, displayName, setUser, setProfile } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setProfile(null);
    navigate("/");
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "glass border-b border-gray-200 shadow-sm" : "bg-white border-b border-gray-200"}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo size={34} />
          <div>
            <span className="font-heading font-black text-lg tracking-tight leading-none block">SNO</span>
            <span className="text-gray-400 text-[10px] font-body tracking-wider uppercase leading-none">School News Official</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {displayName && (
                <span className="hidden sm:block text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {displayName}
                </span>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm text-gray-500 hover:text-black transition-colors hidden sm:block">
                  Categories
                </Link>
              )}
              {canWrite && (
                <Link to="/create" className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-red-700 transition-colors shadow-sm">
                  + Write Story
                </Link>
              )}
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-black transition-colors">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function ProfileGuard({ children }) {
  const { user, profile } = useAuth();
  const location = useLocation();
  const exempt = ["/setup-profile", "/login"];
  if (user && profile === null && !exempt.includes(location.pathname)) {
    return <Navigate to="/setup-profile" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Splash />
      <div className="min-h-screen bg-gray-50 font-body">
        <Navbar />
        <ProfileGuard>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateStory />} />
            <Route path="/story/:id" element={<StoryDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/setup-profile" element={<SetupProfile />} />
          </Routes>
        </ProfileGuard>
      </div>
    </AuthProvider>
  );
}
