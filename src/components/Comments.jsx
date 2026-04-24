import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getComments,
  getUserVotes,
  createComment,
  pinComment,
  deleteComment,
  voteComment,
} from "../lib/comments";

const COOLDOWN_MS = 90 * 1000;

function CooldownTimer({ lastCommentTime, onExpire }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!lastCommentTime) return;
    const update = () => {
      const elapsed = Date.now() - lastCommentTime;
      const left = Math.max(0, COOLDOWN_MS - elapsed);
      setRemaining(Math.ceil(left / 1000));
      if (left === 0) onExpire();
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastCommentTime]);

  if (remaining <= 0) return null;
  return (
    <p className="text-xs text-amber-600 mt-1">
      Wait {remaining}s before commenting again.
    </p>
  );
}

export default function Comments({ storyId, storyCreatorId }) {
  const { user, isAdmin, displayName } = useAuth();
  const [comments, setComments] = useState([]);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastCommentTime, setLastCommentTime] = useState(null);
  const [onCooldown, setOnCooldown] = useState(false);
  const [error, setError] = useState("");

  const canPin = isAdmin || (user && user.$id === storyCreatorId);

  const load = useCallback(async () => {
    const c = await getComments(storyId);
    setComments(c);
    if (user) {
      const v = await getUserVotes(user.$id, c.map((x) => x.$id));
      const map = {};
      v.forEach((vote) => { map[vote.comment_id] = vote.type; });
      setVotes(map);
    }
    setLoading(false);
  }, [storyId, user]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || onCooldown) return;
    setSubmitting(true);
    setError("");
    try {
      const c = await createComment(storyId, user.$id, displayName, content.trim());
      setContent("");
      setLastCommentTime(Date.now());
      setOnCooldown(true);
      setComments((prev) => [c, ...prev]);
    } catch (err) {
      setError(err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId, type) => {
    if (!user) return;
    const prevVote = votes[commentId];
    // Optimistic update
    setComments((prev) =>
      prev.map((c) => {
        if (c.$id !== commentId) return c;
        let { likes, dislikes } = c;
        if (prevVote === type) {
          if (type === "like") likes = Math.max(0, likes - 1);
          else dislikes = Math.max(0, dislikes - 1);
        } else {
          if (prevVote === "like") likes = Math.max(0, likes - 1);
          if (prevVote === "dislike") dislikes = Math.max(0, dislikes - 1);
          if (type === "like") likes++;
          else dislikes++;
        }
        return { ...c, likes, dislikes };
      })
    );
    setVotes((prev) => ({
      ...prev,
      [commentId]: prevVote === type ? null : type,
    }));
    await voteComment(commentId, user.$id, type);
  };

  const handlePin = async (commentId, pinned) => {
    await pinComment(commentId, !pinned);
    setComments((prev) =>
      prev
        .map((c) => (c.$id === commentId ? { ...c, pinned: !pinned } : c))
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return b.pinned - a.pinned;
          return (b.likes - b.dislikes) - (a.likes - a.dislikes);
        })
    );
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.$id !== commentId));
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-100">
      <h2 className="font-heading text-xl font-bold mb-6">
        Comments {comments.length > 0 && <span className="text-gray-400 font-normal text-base">({comments.length})</span>}
      </h2>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <p className="text-xs text-gray-400 mb-2">Commenting as <span className="font-medium text-gray-700">{displayName}</span></p>
          <textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            disabled={onCooldown}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:opacity-50"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <CooldownTimer
            lastCommentTime={lastCommentTime}
            onExpire={() => setOnCooldown(false)}
          />
          <button
            type="submit"
            disabled={submitting || onCooldown || !content.trim()}
            className="mt-2 bg-black text-white px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-400 mb-8">
          <a href="/login" className="underline hover:text-black">Sign in</a> to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.$id}
              className={`rounded-xl border px-4 py-3 ${comment.pinned ? "border-black bg-gray-50" : "border-gray-100 bg-white"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {comment.pinned && (
                    <span className="text-xs font-semibold text-black bg-black/10 px-1.5 py-0.5 rounded">
                      📌 Pinned
                    </span>
                  )}
                  <span className="text-sm font-semibold">{comment.user_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.$createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {canPin && (
                    <button
                      onClick={() => handlePin(comment.$id, comment.pinned)}
                      className="text-xs text-gray-400 hover:text-black transition-colors"
                    >
                      {comment.pinned ? "Unpin" : "Pin"}
                    </button>
                  )}
                  {(isAdmin || (user && user.$id === comment.user_id)) && (
                    <button
                      onClick={() => handleDelete(comment.$id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleVote(comment.$id, "like")}
                  disabled={!user}
                  className={`flex items-center gap-1 text-xs transition-colors disabled:cursor-default ${votes[comment.$id] === "like" ? "text-green-600 font-semibold" : "text-gray-400 hover:text-green-600"}`}
                >
                  ▲ {comment.likes}
                </button>
                <button
                  onClick={() => handleVote(comment.$id, "dislike")}
                  disabled={!user}
                  className={`flex items-center gap-1 text-xs transition-colors disabled:cursor-default ${votes[comment.$id] === "dislike" ? "text-red-500 font-semibold" : "text-gray-400 hover:text-red-500"}`}
                >
                  ▼ {comment.dislikes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
