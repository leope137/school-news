import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { logout } from "./lib/auth";
import Home from "./pages/Home";
import CreateStory from "./pages/CreateStory";
import StoryDetail from "./pages/StoryDetail";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-heading text-2xl font-black tracking-tight">
          The School Press
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/admin"
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Categories
              </Link>
              <Link
                to="/create"
                className="bg-black text-white text-sm font-body px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                + Write Story
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-black transition-colors"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 font-body">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateStory />} />
          <Route path="/story/:id" element={<StoryDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
