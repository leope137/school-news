import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStories } from "../lib/stories";

const CATEGORIES = [
  "All",
  "Breaking News",
  "Sports",
  "Arts & Culture",
  "Academics",
  "Opinion",
  "Events",
  "Community",
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

  const filtered =
    activeCategory === "All"
      ? stories
      : stories.filter((s) => s.category === activeCategory);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-black text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg mb-4">No stories yet.</p>
          <button
            onClick={() => navigate("/create")}
            className="bg-black text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
          >
            Write the first story
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((story) => (
            <article
              key={story.$id}
              onClick={() => navigate(`/story/${story.$id}`)}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              {story.image_url && (
                <img
                  src={story.image_url}
                  alt={story.title}
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-4">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    CATEGORY_COLORS[story.category] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {story.category}
                </span>
                <h2 className="font-heading font-bold text-lg mt-2 leading-snug line-clamp-2">
                  {story.title}
                </h2>
                {story.summary && (
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {story.summary}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  {story.author && <span>{story.author}</span>}
                  {story.author && <span>·</span>}
                  <span>
                    {new Date(story.$createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
