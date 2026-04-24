import { account } from "./appwrite";

const ORIGIN = window.location.origin;

export const login = (email, password) =>
  account.createEmailPasswordSession(email, password);

export const loginWithGitHub = () =>
  account.createOAuth2Session("github", `${ORIGIN}/`, `${ORIGIN}/login`);

export const logout = () => account.deleteSession("current");

export const getUser = () => account.get();
