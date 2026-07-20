import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { api, MyMatch } from "./api";
import { useAuth } from "./AuthContext";

type MatchCtx = {
  myMatch: MyMatch | null;
  refresh: () => Promise<void>;
  justActivatedMatchId: string | null;
  clearJustActivated: () => void;
};

const Ctx = createContext<MatchCtx | null>(null);

export function MatchProvider({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  const [myMatch, setMyMatch] = useState<MyMatch | null>(null);
  const [justActivatedMatchId, setJustActivatedMatchId] = useState<string | null>(null);
  const prevRef = useRef<MyMatch | null>(null);

  async function refresh() {
    if (!account?.game_token) {
      setMyMatch(null);
      return;
    }
    try {
      const data = await api.myMatch(account.game_token);
      const prev = prevRef.current;
      // Detect the exact moment a waiting match becomes active -- this is
      // the cue for the screen transition into the match.
      if (
        data.match &&
        prev &&
        prev.match_id === data.match.match_id &&
        prev.status === "waiting" &&
        data.match.status === "active"
      ) {
        setJustActivatedMatchId(data.match.match_id);
      }
      prevRef.current = data.match;
      setMyMatch(data.match);
    } catch {
      // leave last known state on transient failure
    }
  }

  useEffect(() => {
    if (!account?.game_token) {
      setMyMatch(null);
      prevRef.current = null;
      return;
    }
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.game_token]);

  function clearJustActivated() {
    setJustActivatedMatchId(null);
  }

  return (
    <Ctx.Provider value={{ myMatch, refresh, justActivatedMatchId, clearJustActivated }}>{children}</Ctx.Provider>
  );
}

export function useMatch() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMatch must be used within MatchProvider");
  return ctx;
}
