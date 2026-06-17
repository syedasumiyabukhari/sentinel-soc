import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("sentinel_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sentinel_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((me) => {
        setUser(me);
        localStorage.setItem("sentinel_user", JSON.stringify(me));
      })
      .catch(() => {
        localStorage.removeItem("sentinel_token");
        localStorage.removeItem("sentinel_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem("sentinel_token", data.access_token);
    localStorage.setItem("sentinel_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const signUp = useCallback(async (payload) => {
    await authApi.register(payload);
    return authApi.login(payload.username, payload.password).then((data) => {
      localStorage.setItem("sentinel_token", data.access_token);
      localStorage.setItem("sentinel_user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
