import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    // Optimistic update
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

  if (loading) return <div className="text-center py-24 text-gray-400">Loading...</div>;

  if (!story) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-400">Story not found.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-sm underline text-gray-500">
          Go home
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-gray-400 hover:text-gray-700 mb-6 block transition-colors"
      >
        ← Back to stories
      </button>

      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[story.category] || "bg-gray-100 text-gray-600"}`}>
        {story.category}
      </span>

      <h1 className="font-heading text-3xl sm:text-4xl font-bold mt-3 leading-tight">
        {story.title}
      </h1>

      {story.summary && (
        <p className="text-gray-500 text-lg mt-3">{story.summary}</p>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
        {story.author && <span>{story.author}</span>}
        {story.author && <span>·</span>}
        <span>
          {new Date(story.$createdAt).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
          })}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => handleVote("like")}
          disabled={!user}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:cursor-default ${myVote === "like" ? "bg-green-50 border-green-300 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-700"}`}
        >
          ▲ {story.likes || 0}
        </button>
        <button
          onClick={() => handleVote("dislike")}
          disabled={!user}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:cursor-default ${myVote === "dislike" ? "bg-red-50 border-red-300 text-red-500" : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500"}`}
        >
          ▼ {story.dislikes || 0}
        </button>
        {!user && <span className="text-xs text-gray-400"><a href="/login" className="underline">Sign in</a> to vote</span>}
      </div>

      {story.image_url && (
        <img
          src={story.image_url}
          alt={story.title}
          className="w-full rounded-xl mt-6 aspect-video object-cover"
        />
      )}

      <div className="mt-8 text-gray-800 leading-relaxed whitespace-pre-wrap">
        {story.content}
      </div>

      {isAdmin && (
        <div className="mt-12 pt-6 border-t border-gray-100">
          <button
            onClick={handleDelete}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            Delete story
          </button>
        </div>
      )}

      <Comments storyId={id} storyCreatorId={story.creator_id} />
    </article>
  );
}
