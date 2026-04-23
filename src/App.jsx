import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import CreateStory from "./pages/CreateStory";
import StoryDetail from "./pages/StoryDetail";

function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-heading text-2xl font-black tracking-tight">
          The School Press
        </Link>
        <Link
          to="/create"
          className="bg-black text-white text-sm font-body px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Write Story
        </Link>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateStory />} />
        <Route path="/story/:id" element={<StoryDetail />} />
      </Routes>
    </div>
  );
}
