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
    if (data.requires_2fa) {
      return { requires2fa: true, twoFaToken: data.two_fa_token };
    }
    localStorage.setItem("sentinel_token", data.access_token);
    localStorage.setItem("sentinel_user", JSON.stringify(data.user));
    setUser(data.user);
    return { requires2fa: false, user: data.user };
  }, []);

  const verifyTwoFactor = useCallback(async (twoFaToken, code) => {
    const data = await authApi.verifyLogin2fa(twoFaToken, code);
    localStorage.setItem("sentinel_token", data.access_token);
    localStorage.setItem("sentinel_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.getMe();
    setUser(me);
    localStorage.setItem("sentinel_user", JSON.stringify(me));
    return me;
  }, []);

  const signUp = useCallback(async (payload) => {
    await authApi.register(payload);
    const data = await authApi.login(payload.username, payload.password);
    if (data.requires_2fa) {
      // New accounts never have 2FA enabled yet (it's opt-in after registration),
      // so this should be unreachable - but if it ever happens, fail loudly
      // instead of silently writing an undefined user into state.
      throw new Error("Unexpected: a brand new account already requires 2FA.");
    }
    localStorage.setItem("sentinel_token", data.access_token);
    localStorage.setItem("sentinel_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, verifyTwoFactor, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
