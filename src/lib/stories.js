import { databases, storage, ID, Query } from "./appwrite";

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const VOTES_COL = import.meta.env.VITE_APPWRITE_VOTES_COLLECTION_ID;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export const getStories = async () => {
  const q = await databases.listDocuments(DB_ID, COL_ID, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  // Sort by net score (likes - dislikes) descending
  return q.documents.sort((a, b) =>
    ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0))
  );
};

export const getStory = async (id) => {
  return await databases.getDocument(DB_ID, COL_ID, id);
};

export const createStory = async (data, creatorId) => {
  return await databases.createDocument(DB_ID, COL_ID, ID.unique(), {
    ...data,
    creator_id: creatorId || "",
    likes: 0,
    dislikes: 0,
  });
};

export const deleteStory = async (id) => {
  await databases.deleteDocument(DB_ID, COL_ID, id);
};

export const uploadImage = async (file) => {
  const res = await storage.createFile(BUCKET_ID, ID.unique(), file);
  return storage.getFileView(BUCKET_ID, res.$id).toString();
};

export const getStoryVote = async (storyId, userId) => {
  if (!userId) return null;
  const res = await databases.listDocuments(DB_ID, VOTES_COL, [
    Query.equal("comment_id", storyId),
    Query.equal("user_id", userId),
    Query.limit(1),
  ]);
  return res.documents[0]?.type || null;
};

export const voteStory = async (storyId, userId, type) => {
  const [existing, story] = await Promise.all([
    databases.listDocuments(DB_ID, VOTES_COL, [
      Query.equal("comment_id", storyId),
      Query.equal("user_id", userId),
      Query.limit(1),
    ]),
    databases.getDocument(DB_ID, COL_ID, storyId),
  ]);

  const likes = story.likes || 0;
  const dislikes = story.dislikes || 0;

  if (existing.documents.length > 0) {
    const vote = existing.documents[0];
    if (vote.type === type) {
      await databases.deleteDocument(DB_ID, VOTES_COL, vote.$id);
      const field = type === "like" ? "likes" : "dislikes";
      await databases.updateDocument(DB_ID, COL_ID, storyId, {
        [field]: Math.max(0, story[field] - 1),
      });
      return null;
    } else {
      await databases.updateDocument(DB_ID, VOTES_COL, vote.$id, { type });
      const add = type === "like" ? "likes" : "dislikes";
      const remove = type === "like" ? "dislikes" : "likes";
      await databases.updateDocument(DB_ID, COL_ID, storyId, {
        [add]: story[add] + 1,
        [remove]: Math.max(0, story[remove] - 1),
      });
      return type;
    }
  } else {
    await databases.createDocument(DB_ID, VOTES_COL, ID.unique(), {
      comment_id: storyId,
      user_id: userId,
      type,
    });
    const field = type === "like" ? "likes" : "dislikes";
    await databases.updateDocument(DB_ID, COL_ID, storyId, {
      [field]: story[field] + 1,
    });
    return type;
  }
};
