import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getStory, deleteStory, getStoryVote, voteStory } from "../lib/stories";
import { useAuth } from "../context/AuthContext";
import Comments from "../components/Comments";

const CATEGORY_COLORS = {
  "Breaking News": "bg-red-100 text-red-700",
  Sports: "bg-blue-100 text-blue-700",
  "Arts & Culture": "bg-purple-100 text-purple-700",
  Academics: "bg-yellow-100 text-yellow-700",
  Opinion: "bg-orange-100 text-orange-700",
  Events: "bg-green-100 text-green-700",
  Community: "bg-teal-100 text-teal-700",
};

export default function StoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [story, setStory] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStory(id)
      .then((s) => {
        setStory(s);
        if (user) getStoryVote(id, user.$id).then(setMyVote);
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleVote = async (type) => {
    if (!user) return;
    const prev = myVote;
    setStory((s) => {
      let { likes, dislikes } = s;
      if (prev === type) {
        if (type === "like") likes = Math.max(0, likes - 1);
        else dislikes = Math.max(0, dislikes - 1);
      } else {
        if (prev === "like") likes = Math.max(0, likes - 1);
        if (prev === "dislike") dislikes = Math.max(0, dislikes - 1);
        if (type === "like") likes++;
        else dislikes++;
      }
      return { ...s, likes, dislikes };
    });
    setMyVote(prev === type ? null : type);
    await voteStory(id, user.$id, type);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this story?")) return;
    await deleteStory(id);
    navigate("/");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!story) return (
    <div className="text-center py-24">
      <p className="text-gray-400">Story not found.</p>
      <button onClick={() => navigate("/")} className="mt-4 text-sm underline text-gray-500">Go home</button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero image */}
      {story.image_url && (
        <div className="w-full aspect-video max-h-[500px] overflow-hidden">
          <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
        </div>
      )}

      <article className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => navigate("/")} className="text-sm text-gray-400 hover:text-black mb-6 block transition-colors flex items-center gap-1">
          ← Back
        </button>

        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[story.category] || "bg-gray-100 text-gray-600"}`}>
          {story.category}
        </span>

        <h1 className="font-heading text-3xl sm:text-5xl font-bold mt-4 leading-tight">
          {story.title}
        </h1>

        {story.summary && (
          <p className="text-gray-500 text-xl mt-3 leading-relaxed border-l-4 border-red-500 pl-4">
            {story.summary}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-400 mt-5">
          {story.author && <span className="font-medium text-gray-700">{story.author}</span>}
          {story.author && <span>·</span>}
          <span>{new Date(story.$createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>

        {/* Vote buttons */}
        <div className="flex items-center gap-3 mt-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote("like")}
            disabled={!user}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all disabled:cursor-default ${myVote === "like" ? "bg-green-50 border-green-400 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-700"}`}
          >
            ▲ {story.likes || 0}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote("dislike")}
            disabled={!user}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all disabled:cursor-default ${myVote === "dislike" ? "bg-red-50 border-red-400 text-red-600" : "border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-600"}`}
          >
            ▼ {story.dislikes || 0}
          </motion.button>
          {!user && <span className="text-xs text-gray-400"><a href="/login" className="underline hover:text-black">Sign in</a> to vote</span>}
        </div>

        <div className="prose prose-lg max-w-none mt-10 text-gray-800 leading-relaxed whitespace-pre-wrap font-body">
          {story.content}
        </div>

        {isAdmin && (
          <div className="mt-12 pt-6 border-t border-gray-100">
            <button onClick={handleDelete} className="text-sm text-red-400 hover:text-red-600 transition-colors">
              Delete story
            </button>
          </div>
        )}

        <Comments storyId={id} storyCreatorId={story.creator_id} />
      </article>
    </motion.div>
  );
}
