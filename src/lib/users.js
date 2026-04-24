import { databases, ID, Query } from "./appwrite";

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

export const getUserProfile = async (userId) => {
  const res = await databases.listDocuments(DB_ID, COL_ID, [
    Query.equal("user_id", userId),
    Query.limit(1),
  ]);
  return res.documents[0] || null;
};

export const createUserProfile = async (userId, firstName, middleName, lastName) => {
  return await databases.createDocument(DB_ID, COL_ID, ID.unique(), {
    user_id: userId,
    first_name: firstName,
    middle_name: middleName || "",
    last_name: lastName,
  });
};

export const getDisplayName = (profile) => {
  if (!profile) return "Anonymous";
  return [profile.first_name, profile.middle_name, profile.last_name]
    .filter(Boolean)
    .join(" ");
};
