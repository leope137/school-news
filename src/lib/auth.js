import { account } from "./appwrite";

export const login = (email, password) =>
  account.createEmailPasswordSession(email, password);

export const logout = () => account.deleteSession("current");

export const getUser = () => account.get();
