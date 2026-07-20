import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { useMatch } from "../MatchContext";

export function MatchStatusOverlay() {
  const { account } = useAuth();
  const { myMatch, refresh } = useMatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [aborting, setAborting] = useState(false);

  if (!myMatch || !account?.game_token) return null;
  if (location.pathname === `/play/${myMatch.match_id}`) return null;

  const isForfeit = myMatch.status === "active" && !myMatch.practice;

  async function abort() {
    if (isForfeit && !window.confirm("This match is already active — aborting now counts as a loss. Abort anyway?")) {
      return;
    }
    setAborting(true);
    try {
      await api.abortMatch(account!.game_token!);
      await refresh();
    } catch {
      // next poll resyncs
    } finally {
      setAborting(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-72 rounded-lg border border-amber/40 bg-surface/95 p-4 shadow-lg shadow-amber/10 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
          {myMatch.practice ? "Practice" : "Ranked"}
        </p>
        <span className="h-1.5 w-1.5 rounded-full bg-amber animate-blip" />
      </div>
      <p className="mt-1 font-display text-base font-bold uppercase text-ink">
        {myMatch.status === "waiting" ? "Waiting for opponent" : `vs ${myMatch.opponent ?? "???"}`}
      </p>
      <div className="mt-3 flex gap-2">
        {myMatch.status === "active" && (
          <button
            onClick={() => navigate(`/play/${myMatch.match_id}`)}
            className="focus-ring flex-1 rounded border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-ink hover:border-amber hover:text-amber"
          >
            View match
          </button>
        )}
        <button
          onClick={abort}
          disabled={aborting}
          className="focus-ring flex-1 rounded border border-danger/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-danger hover:bg-danger/10 disabled:opacity-50"
        >
          {aborting ? "..." : myMatch.status === "waiting" ? "Cancel" : "Abort"}
        </button>
      </div>
    </div>
  );
}
