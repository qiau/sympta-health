import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/userType";
import {
  register as registerService,
  login as loginService,
  logout as logoutService,
  refreshAccessToken,
  getMe,
} from "../services/authService";
import { authTokenStore } from "../lib/authTokenStore";

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = authTokenStore.get();
        if (storedToken) {
          try {
            setAccessToken(storedToken);
            const me = await getMe();
            setUser(me);
            setLoading(false);
            return;
          } catch (err: any) {
            console.warn("Stored access token tidak valid, mencoba refresh...");
          }
        }
        const refresh = await refreshAccessToken();
        const newAccess = refresh.access_token;
        setAccessToken(newAccess);
        authTokenStore.set(newAccess);

        const me = await getMe();
        setUser(me);
      } catch {
        setUser(null);
        setAccessToken(null);
        authTokenStore.clear();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginService({ email, password });
    setUser(data.user);
    setAccessToken(data.tokens.access_token);
    authTokenStore.set(data.tokens.access_token);
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    await registerService({ email, username, password });
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch {
    } finally {
      setUser(null);
      setAccessToken(null);
      authTokenStore.clear();
    }
  };

  const value: AuthContextValue = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
