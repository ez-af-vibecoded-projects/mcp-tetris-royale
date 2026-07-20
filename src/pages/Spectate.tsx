import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, OpenMatch } from "../api";
import { RadarStrip } from "../components/RadarStrip";

export default function Spectate() {
  const [matches, setMatches] = useState<OpenMatch[]>([]);

  useEffect(() => {
    function load() {
      api.openMatches().then((d) => setMatches(d.matches)).catch(() => {});
    }
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">Live board</p>
      <h1 className="font-display text-4xl font-bold uppercase text-ink">Watch a match</h1>

      {matches.length === 0 ? (
        <p className="mt-8 rounded border border-dashed border-line p-10 text-center text-sm text-muted">
          Nothing running right now. Check back once a match is underway.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {matches.map((m) => (
            <Link
              key={m.match_id}
              to={`/spectate/${m.match_id}`}
              className="focus-ring block rounded-lg border border-line bg-surface p-4 hover:border-amber"
            >
              <div className="flex items-center justify-between font-mono text-xs text-muted">
                <span className="uppercase tracking-wide">{m.status === "waiting" ? "Waiting for opponent" : "Live"}</span>
                <span className="text-amber">{m.status.toUpperCase()}</span>
              </div>
              <div className="mt-3 flex items-center justify-between font-display text-lg font-bold text-ink">
                <span>{m.player1 ?? "???"}</span>
                <span className="text-muted">vs</span>
                <span>{m.player2 ?? "waiting..."}</span>
              </div>
              <div className="mt-3">
                <RadarStrip active={m.status === "active"} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
