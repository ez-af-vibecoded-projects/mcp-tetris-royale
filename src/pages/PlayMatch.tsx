import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api, SpectateData } from "../api";
import { useAuth } from "../AuthContext";
import { useMatch } from "../MatchContext";
import { TetrisBoard, displayName } from "../components/TetrisBoard";
import { DraggableChat } from "../components/DraggableChat";

export default function PlayMatch() {
  const { matchId } = useParams();
  const { account } = useAuth();
  const { refresh: refreshMatch } = useMatch();
  const navigate = useNavigate();
  const [data, setData] = useState<SpectateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aborting, setAborting] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    function load() {
      api
        .spectate(matchId!)
        .then((d) => {
          setData(d);
          setError(null);
        })
        .catch(() => setError("Match not found."));
    }
    load();
    const id = setInterval(load, 1500);
    return () => clearInterval(id);
  }, [matchId]);

  async function abort() {
    if (!account?.game_token) return;
    if (data?.status === "active" && !data.practice) {
      if (!window.confirm("Aborting an active ranked match counts as a loss. Abort anyway?")) return;
    }
    setAborting(true);
    try {
      await api.abortMatch(account.game_token);
      await refreshMatch();
      navigate("/dashboard");
    } catch {
      setAborting(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="text-danger">{error}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-amber hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const me = data.players.find((p) => p.username === account?.username);
  const opponent = data.players.find((p) => p.username !== account?.username);

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">
            {data.practice && "Practice · "}
            {data.status === "completed" ? "Match complete" : "Your match — live"}
          </p>
          <h1 className="font-display text-3xl font-bold uppercase text-ink">
            You <span className="text-muted">vs</span> {opponent ? displayName(opponent.username) : "???"}
          </h1>
        </div>
        {data.status === "completed" ? (
          <div
            className={`rounded border px-4 py-2 font-mono text-sm ${
              data.winner === account?.username
                ? "border-amber/40 bg-amber/10 text-amber"
                : "border-danger/40 bg-danger/10 text-danger"
            }`}
          >
            {data.winner === account?.username ? "You win" : data.winner ? `${displayName(data.winner)} wins` : "Draw"}
          </div>
        ) : (
          <button
            onClick={abort}
            disabled={aborting}
            className="focus-ring rounded border border-danger/50 px-4 py-2 font-mono text-xs uppercase tracking-wide text-danger hover:bg-danger/10 disabled:opacity-50"
          >
            {aborting ? "Aborting..." : "Abort match"}
          </button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {me && (
          <div className="rounded-lg border border-amber/40 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold uppercase text-amber">
                You
                {me.topped_out && <span className="ml-2 font-mono text-[10px] text-danger">TOPPED OUT</span>}
              </h2>
              <div className="text-right font-mono text-xs">
                <div className="text-ink">{me.score} pts</div>
                <div className="text-muted">{me.lines_cleared} lines</div>
                {me.pending_garbage > 0 && <div className="text-danger">+{me.pending_garbage} garbage incoming</div>}
              </div>
            </div>
            <TetrisBoard rows={me.board} />
          </div>
        )}
        {opponent && (
          <div className="rounded-lg border border-line bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold uppercase text-cyan">
                {displayName(opponent.username)}
                {opponent.topped_out && <span className="ml-2 font-mono text-[10px] text-danger">TOPPED OUT</span>}
              </h2>
              <div className="text-right font-mono text-xs">
                <div className="text-ink">{opponent.score} pts</div>
                <div className="text-muted">{opponent.lines_cleared} lines</div>
                {opponent.pending_garbage > 0 && (
                  <div className="text-danger">+{opponent.pending_garbage} garbage incoming</div>
                )}
              </div>
            </div>
            <TetrisBoard rows={opponent.board} />
          </div>
        )}
      </div>

      <DraggableChat chat={data.chat} displayName={displayName} />
    </div>
  );
}
