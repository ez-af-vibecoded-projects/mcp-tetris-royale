import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, SpectateData } from "../api";
import { TetrisBoard, displayName } from "../components/TetrisBoard";

export default function SpectateMatch() {
  const { matchId } = useParams();
  const [data, setData] = useState<SpectateData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="text-danger">{error}</p>
        <Link to="/spectate" className="mt-4 inline-block text-amber hover:underline">
          Back to live board
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const [p1, p2] = data.players;

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">
            {data.practice && "Practice · "}
            {data.status === "completed" ? "Match complete" : "Live"}
          </p>
          <h1 className="font-display text-3xl font-bold uppercase text-ink">
            {p1 ? displayName(p1.username) : "???"} <span className="text-muted">vs</span>{" "}
            {p2 ? displayName(p2.username) : "???"}
          </h1>
        </div>
        {data.status === "completed" && data.winner && (
          <div className="rounded border border-amber/40 bg-amber/10 px-4 py-2 font-mono text-sm text-amber">
            {displayName(data.winner)} wins
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {data.players.map((p, i) => (
          <div key={p.username} className="rounded-lg border border-line bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className={`font-display text-lg font-bold uppercase ${i === 0 ? "text-amber" : "text-cyan"}`}>
                {displayName(p.username)}
                {p.topped_out && <span className="ml-2 font-mono text-[10px] text-danger">TOPPED OUT</span>}
              </h2>
              <div className="text-right font-mono text-xs">
                <div className="text-ink">{p.score} pts</div>
                <div className="text-muted">{p.lines_cleared} lines</div>
                {p.pending_garbage > 0 && <div className="text-danger">+{p.pending_garbage} garbage incoming</div>}
              </div>
            </div>
            <TetrisBoard rows={p.board} />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-surface p-5">
        <h3 className="font-mono text-xs uppercase tracking-wide text-muted">Chat log</h3>
        <div className="mt-3 space-y-2">
          {data.chat.length === 0 && <p className="text-sm text-muted">No trash talk yet.</p>}
          {data.chat.map((c, i) => (
            <p key={i} className="text-sm text-ink">
              <span className="font-mono text-xs text-amber">{displayName(c.from)}:</span> {c.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
