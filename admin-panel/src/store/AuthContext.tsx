"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { UserResponse } from "@/types/api";
import * as api from "@/lib/api";

interface AuthState {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const tokens = api.getStoredTokens();
    if (!tokens) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      const type = (me?.type ?? "").toUpperCase().replace(/-/g, "_");
      if (type !== "SUPER_ADMIN") {
        setUser(null);
        api.clearStoredTokens();
        return;
      }
      setUser(me);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(me));
        document.cookie = "admin_authenticated=1; path=/; max-age=86400; samesite=lax";
      }
    } catch {
      setUser(null);
      api.clearStoredTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (stored) {
      try {
        const u = JSON.parse(stored) as UserResponse;
        const type = (u?.type ?? "").toUpperCase().replace(/-/g, "_");
        if (type === "SUPER_ADMIN") setUser(u);
      } catch {}
    }
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const data = await api.login(email, password);
    const type = (data.user?.type ?? "").toUpperCase().replace(/-/g, "_");
    if (type !== "SUPER_ADMIN") {
      api.clearStoredTokens();
      throw new Error("Access denied. Super admin only.");
    }
    api.setStoredTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }, []);

  const logout = useCallback(async () => {
    const tokens = api.getStoredTokens();
    if (tokens) await api.logout(tokens.refresh);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
