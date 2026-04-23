import { Client, Databases, Storage, ID, Query } from "appwrite";

const client = new Client()
  .setEndpoint("https://sfo.cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };
