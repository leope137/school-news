import { account } from "./appwrite";

const ORIGIN = window.location.origin;

export const login = (email, password) =>
  account.createEmailPasswordSession(email, password);

export const loginWithGoogle = () =>
  account.createOAuth2Session("google", `${ORIGIN}/`, `${ORIGIN}/login`);

export const loginWithMicrosoft = () =>
  account.createOAuth2Session("microsoft", `${ORIGIN}/`, `${ORIGIN}/login`);

export const logout = () => account.deleteSession("current");

export const getUser = () => account.get();
