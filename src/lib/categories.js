import { databases, ID, Query } from "./appwrite";

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_ID = import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID;

const DEFAULTS = [
  "Breaking News",
  "Sports",
  "Arts & Culture",
  "Academics",
  "Opinion",
  "Events",
  "Community",
];

export const getCategories = async () => {
  try {
    const res = await databases.listDocuments(DB_ID, COL_ID, [
      Query.orderAsc("name"),
    ]);
    return res.documents.length > 0 ? res.documents : DEFAULTS.map((name) => ({ name, $id: name }));
  } catch {
    return DEFAULTS.map((name) => ({ name, $id: name }));
  }
};

export const createCategory = (name) =>
  databases.createDocument(DB_ID, COL_ID, ID.unique(), { name });

export const deleteCategory = (id) =>
  databases.deleteDocument(DB_ID, COL_ID, id);
