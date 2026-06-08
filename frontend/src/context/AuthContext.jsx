import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authLogin, authLogout, authMe } from "@/lib/api";

const AuthContext = createContext({ user: null, login: async () => {}, logout: async () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anon, object = signed in
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await authMe();
        if (alive) setUser(u);
      } catch {
        if (alive) setUser(false);
      } finally {
        if (alive) setChecked(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await authLogin(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      /* ignore */
    }
    setUser(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, checked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
