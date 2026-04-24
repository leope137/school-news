import { databases, ID, Query } from "./appwrite";

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COMMENTS_COL = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;
const VOTES_COL = import.meta.env.VITE_APPWRITE_VOTES_COLLECTION_ID;
const COOLDOWN_MS = 90 * 1000; // 1.5 minutes

export const getComments = async (storyId) => {
  const res = await databases.listDocuments(DB_ID, COMMENTS_COL, [
    Query.equal("story_id", storyId),
    Query.limit(100),
  ]);
  return res.documents.sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return (b.likes - b.dislikes) - (a.likes - a.dislikes);
  });
};

export const getUserVotes = async (userId, commentIds) => {
  if (!userId || commentIds.length === 0) return [];
  const res = await databases.listDocuments(DB_ID, VOTES_COL, [
    Query.equal("user_id", userId),
    Query.equal("comment_id", commentIds),
  ]);
  return res.documents;
};

export const createComment = async (storyId, userId, userName, content) => {
  // Server-side cooldown — check last comment by this user
  const recent = await databases.listDocuments(DB_ID, COMMENTS_COL, [
    Query.equal("user_id", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(1),
  ]);
  if (recent.documents.length > 0) {
    const elapsed = Date.now() - new Date(recent.documents[0].$createdAt).getTime();
    if (elapsed < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`Wait ${remaining}s before commenting again.`);
    }
  }
  return await databases.createDocument(DB_ID, COMMENTS_COL, ID.unique(), {
    story_id: storyId,
    user_id: userId,
    user_name: userName,
    content,
    pinned: false,
    likes: 0,
    dislikes: 0,
  });
};

export const pinComment = async (commentId, pinned) =>
  databases.updateDocument(DB_ID, COMMENTS_COL, commentId, { pinned });

export const deleteComment = async (commentId) =>
  databases.deleteDocument(DB_ID, COMMENTS_COL, commentId);

export const voteComment = async (commentId, userId, type) => {
  const [existing, comment] = await Promise.all([
    databases.listDocuments(DB_ID, VOTES_COL, [
      Query.equal("comment_id", commentId),
      Query.equal("user_id", userId),
      Query.limit(1),
    ]),
    databases.getDocument(DB_ID, COMMENTS_COL, commentId),
  ]);

  if (existing.documents.length > 0) {
    const vote = existing.documents[0];
    if (vote.type === type) {
      // Toggle off
      await databases.deleteDocument(DB_ID, VOTES_COL, vote.$id);
      const field = type === "like" ? "likes" : "dislikes";
      await databases.updateDocument(DB_ID, COMMENTS_COL, commentId, {
        [field]: Math.max(0, comment[field] - 1),
      });
      return null;
    } else {
      // Switch vote
      await databases.updateDocument(DB_ID, VOTES_COL, vote.$id, { type });
      const add = type === "like" ? "likes" : "dislikes";
      const remove = type === "like" ? "dislikes" : "likes";
      await databases.updateDocument(DB_ID, COMMENTS_COL, commentId, {
        [add]: comment[add] + 1,
        [remove]: Math.max(0, comment[remove] - 1),
      });
      return type;
    }
  } else {
    // New vote
    await databases.createDocument(DB_ID, VOTES_COL, ID.unique(), {
      comment_id: commentId,
      user_id: userId,
      type,
    });
    const field = type === "like" ? "likes" : "dislikes";
    await databases.updateDocument(DB_ID, COMMENTS_COL, commentId, {
      [field]: comment[field] + 1,
    });
    return type;
  }
};
