import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

/**
 * Provides the current authenticated user to the whole React tree.
 * Fetches /auth/me on mount and exposes helpers used by ProtectedRoute,
 * AdminRoute, and AppShell.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data.user);
    } catch (err) {
      setUser(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  /** Returns true when the logged-in user has the given permission key. */
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      if (user.role === "ADMIN") return true;
      const perms = user.permissions || [];
      return perms.includes("*") || perms.includes(permission);
    },
    [user]
  );

  /** Returns true only when the logged-in user is an ADMIN. */
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{ user, loading, error, isAdmin, hasPermission, logout, refresh: fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
