"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, tokenStore } from "@/lib/api";

export type Jazz91User = {
  id: number;
  username: string;
  email: string;
  role: string;
  bio: string;
  avatar_url: string;
  date_joined: string;
};

type AuthContextValue = {
  user: Jazz91User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Jazz91User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const me = await api.get<Jazz91User>("/api/auth/me/");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tokenStore.getAccess()) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await api.post<{ access: string; refresh: string }>(
        "/api/auth/login/",
        { username, password }
      );
      tokenStore.set(data.access, data.refresh);
      await fetchMe();
    },
    [fetchMe]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await api.post("/api/auth/register/", { username, email, password });
      await login(username, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
