/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "../api/client";

export interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (returnTo?: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async (skipLoading = false) => {
    try {
      const response = await apiClient.authControllerGetMe();
      // The generated API returns data in response.data
      // Even though the type says void, the actual response has data
      const userData = response.data as User;
      if (userData && userData.username) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  const login = (returnTo?: string) => {
    // Backend handles OIDC redirect/callback and sets the cookie.
    const target =
      typeof returnTo === "string" && returnTo.length > 0
        ? `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
        : "/api/auth/login";
    window.location.assign(target);
  };

  const logout = async () => {
    await apiClient.authControllerLogout();
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
