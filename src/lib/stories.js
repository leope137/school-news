import { databases, storage, ID, Query } from "./appwrite";

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export const getStories = async () => {
  const q = await databases.listDocuments(DB_ID, COL_ID, [
    Query.orderDesc("$createdAt"),
  ]);
  return q.documents;
};

export const getStory = async (id) => {
  return await databases.getDocument(DB_ID, COL_ID, id);
};

export const createStory = async (data, creatorId) => {
  return await databases.createDocument(DB_ID, COL_ID, ID.unique(), {
    ...data,
    creator_id: creatorId || "",
  });
};

export const deleteStory = async (id) => {
  await databases.deleteDocument(DB_ID, COL_ID, id);
};

export const uploadImage = async (file) => {
  const res = await storage.createFile(BUCKET_ID, ID.unique(), file);
  return storage.getFileView(BUCKET_ID, res.$id).toString();
};
