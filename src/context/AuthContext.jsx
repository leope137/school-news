import { createContext, useContext, useEffect, useState } from "react";
import { getUser } from "../lib/auth";
import { getUserProfile } from "../lib/users";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    getUser()
      .then(async (u) => {
        setUser(u);
        const p = await getUserProfile(u.$id).catch(() => null);
        setProfile(p);
      })
      .catch(() => {
        setUser(null);
        setProfile(null);
      });
  }, []);

  const isAdmin = user?.labels?.includes("admin") ?? false;
  const displayName = profile
    ? [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ")
    : null;

  return (
    <AuthContext.Provider value={{ user, setUser, profile, setProfile, isAdmin, displayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
