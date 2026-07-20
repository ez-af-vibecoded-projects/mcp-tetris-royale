import { useEffect, useState } from "react";

type Row = { username: string; rating: number; wins: number; losses: number; tier: string };

import { api } from "../api";

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api.leaderboard().then((d) => setRows(d.leaderboard));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">Rankings</p>
      <h1 className="font-display text-4xl font-bold uppercase text-ink">Leaderboard</h1>

      <div className="mt-8 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface2 font-mono text-[10px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Competitor</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3 text-right">Rating</th>
              <th className="px-4 py-3 text-right">Record</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.username} className="border-t border-line bg-surface even:bg-surface/60">
                <td className="px-4 py-3 font-mono text-muted">{i + 1}</td>
                <td className="px-4 py-3 font-semibold text-ink">{r.username}</td>
                <td className="px-4 py-3 text-cyan">{r.tier}</td>
                <td className="px-4 py-3 text-right font-mono text-amber">{r.rating}</td>
                <td className="px-4 py-3 text-right font-mono text-muted">
                  {r.wins}-{r.losses}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No ranked competitors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
