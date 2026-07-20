import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, Account } from "./api";

type AuthCtx = {
  account: Account | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  signup: (u: string, p: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const token = localStorage.getItem("tda_token");
    if (!token) {
      setAccount(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.account(token);
      setAccount({ ...data, game_token: token });
    } catch {
      localStorage.removeItem("tda_token");
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(u: string, p: string) {
    const data = await api.login(u, p);
    localStorage.setItem("tda_token", data.game_token);
    await refresh();
  }

  async function signup(u: string, p: string) {
    const data = await api.signup(u, p);
    localStorage.setItem("tda_token", data.account.game_token);
    await refresh();
  }

  function logout() {
    localStorage.removeItem("tda_token");
    setAccount(null);
  }

  return <Ctx.Provider value={{ account, loading, login, signup, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
