import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    throw new Error(`API ${options?.method ?? "GET"} ${url} failed: ${res.status}${body ? ` — ${body}` : ""}`);
  }
  return res.json();
}

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  subscriptionPlan: string | null;
  role: string;
  onboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (u: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("gamingos_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("gamingos_user"); }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const users = await apiFetch<Array<User>>("/api/users");
    const found = users.find(u => u.username === username);
    if (!found) throw new Error("Invalid username or password");
    const enriched = { ...found, onboardingComplete: true };
    setUser(enriched);
    localStorage.setItem("gamingos_user", JSON.stringify(enriched));
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const newUser = await apiFetch<User>("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, email, password, displayName: username, avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}` }),
    });
    const enriched = { ...newUser, onboardingComplete: false };
    setUser(enriched);
    localStorage.setItem("gamingos_user", JSON.stringify(enriched));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("gamingos_user");
  }, []);

  const updateUser = useCallback((u: any) => {
    setUser(u);
    localStorage.setItem("gamingos_user", JSON.stringify(u));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user, updateUser, }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getUserId() {
  try {
    const stored = localStorage.getItem("gamingos_user");
    if (stored) return JSON.parse(stored).id;
  } catch {}
  return 8;
}
