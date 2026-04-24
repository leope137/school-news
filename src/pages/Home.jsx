import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getStories } from "../lib/stories";
import Ticker from "../components/Ticker";

const CATEGORIES = [
  "All", "Breaking News", "Sports", "Arts & Culture",
  "Academics", "Opinion", "Events", "Community",
];

const CATEGORY_COLORS = {
  "Breaking News": "bg-red-100 text-red-700",
  Sports: "bg-blue-100 text-blue-700",
  "Arts & Culture": "bg-purple-100 text-purple-700",
  Academics: "bg-yellow-100 text-yellow-700",
  Opinion: "bg-orange-100 text-orange-700",
  Events: "bg-green-100 text-green-700",
  Community: "bg-teal-100 text-teal-700",
};

const CATEGORY_BG = {
  "Breaking News": "from-red-900 to-red-700",
  Sports: "from-blue-900 to-blue-700",
  "Arts & Culture": "from-purple-900 to-purple-700",
  Academics: "from-yellow-900 to-yellow-700",
  Opinion: "from-orange-900 to-orange-700",
  Events: "from-green-900 to-green-700",
  Community: "from-teal-900 to-teal-700",
};

function HeroStory({ story }) {
  const navigate = useNavigate();
  if (!story) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/story/${story.$id}`)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ minHeight: "420px" }}
    >
      {story.image_url ? (
        <img src={story.image_url} alt={story.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_BG[story.category] || "from-gray-900 to-gray-700"}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${CATEGORY_COLORS[story.category] || "bg-gray-100 text-gray-700"}`}>
          {story.category}
        </span>
        <h2 className="font-heading text-2xl sm:text-4xl font-bold text-white leading-tight mb-2 group-hover:text-red-200 transition-colors">
          {story.title}
        </h2>
        {story.summary && (
          <p className="text-white/70 text-sm sm:text-base line-clamp-2 mb-3">{story.summary}</p>
        )}
        <div className="flex items-center gap-3 text-white/50 text-xs">
          {story.author && <span>{story.author}</span>}
          {story.author && <span>·</span>}
          <span>{new Date(story.$createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
          {story.likes > 0 && <><span>·</span><span className="text-green-400">▲ {story.likes}</span></>}
        </div>
      </div>
    </motion.div>
  );
}

function StoryCard({ story, index }) {
  const navigate = useNavigate();
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/story/${story.$id}`)}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer card-hover"
    >
      {story.image_url ? (
        <div className="overflow-hidden aspect-video">
          <img src={story.image_url} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      ) : (
        <div className={`aspect-video bg-gradient-to-br ${CATEGORY_BG[story.category] || "from-gray-800 to-gray-600"} flex items-center justify-center`}>
          <span className="font-heading text-white/20 text-4xl font-black">{story.category?.[0]}</span>
        </div>
      )}
      <div className="p-4">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[story.category] || "bg-gray-100 text-gray-600"}`}>
          {story.category}
        </span>
        <h3 className="font-heading font-bold text-base mt-2 leading-snug line-clamp-2">
          {story.title}
        </h3>
        {story.summary && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{story.summary}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            {story.author && <span className="font-medium text-gray-600">{story.author}</span>}
            {story.author && <span>·</span>}
            <span>{new Date(story.$createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          {story.likes > 0 && <span className="text-green-600 font-medium">▲ {story.likes}</span>}
        </div>
      </div>
    </motion.article>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStories()
      .then(setStories)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All"
    ? stories
    : stories.filter((s) => s.category === activeCategory);

  const [hero, ...rest] = filtered;

  return (
    <main>
      {/* Hero banner */}
      <div className="bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-900/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="relative max-w-6xl mx-auto px-4 py-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <p className="text-red-500 text-xs font-bold tracking-widest uppercase mb-2 flex items-center justify-center gap-2">
              <span className="animate-blink">●</span> Live Coverage
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl font-black tracking-tight">
              School News <span className="text-gradient">Official</span>
            </h1>
            <p className="text-white/50 text-sm mt-2 font-body tracking-wider">Your school. Your stories.</p>
          </motion.div>
        </div>
      </div>

      {/* Ticker */}
      <Ticker stories={stories.slice(0, 6)} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-black text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-4">No stories yet.</p>
            <button onClick={() => navigate("/create")} className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 transition-colors">
              Write the first story
            </button>
          </div>
        ) : (
          <>
            {hero && (
              <div className="mb-8">
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">● Top Story</p>
                <HeroStory story={hero} />
              </div>
            )}
            {rest.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Latest Stories</p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((story, i) => (
                    <StoryCard key={story.$id} story={story} index={i} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
