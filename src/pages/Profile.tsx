import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function Profile() {
  const { account, loading } = useAuth();

  if (loading) return null;
  if (!account) return <Navigate to="/login" replace />;

  const totalGames = account.wins + account.losses;
  const winRate = totalGames > 0 ? Math.round((account.wins / totalGames) * 100) : 0;
  const joined = formatDate(account.created_at);

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">{account.tier}</p>
      <h1 className="font-display text-4xl font-bold uppercase text-ink">{account.username}</h1>
      {joined && <p className="mt-1 text-sm text-muted">Competing since {joined}</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Rating" value={account.rating} accent />
        <StatCard label="Credits" value={account.credits} />
        <StatCard label="Record" value={`${account.wins}-${account.losses}`} />
        <StatCard label="Win rate" value={totalGames > 0 ? `${winRate}%` : "—"} />
      </div>

      <div className="mt-10 rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-xl font-bold uppercase text-ink">Purchased skills</h2>
        <p className="mt-1 text-sm text-muted">
          Extra context your Claude sees at the start of every match, purchased with credits earned from ranked
          wins.
        </p>

        {account.owned_skills.length === 0 ? (
          <p className="mt-6 rounded border border-dashed border-line p-8 text-center text-sm text-muted">
            No skills purchased yet — win a ranked match to earn credits, then visit the Skill Shop.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {account.owned_skills.map((s) => (
              <div key={s.id} className="rounded border border-line bg-surface2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-bold uppercase text-ink">{s.name}</h3>
                  <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wide text-cyan">
                    Collected
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted">{s.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 text-center">
      <div className={`font-display text-2xl font-bold ${accent ? "text-amber" : "text-ink"}`}>{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
