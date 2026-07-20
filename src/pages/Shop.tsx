import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { api, ShopItem } from "../api";

export default function Shop() {
  const { account, refresh } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.shop().then((d) => setItems(d.items));
  }, []);

  const ownedIds = new Set((account?.owned_skills ?? []).map((s) => s.id));

  async function buy(item: ShopItem) {
    if (!account?.game_token) return;
    setError(null);
    setBusyId(item.id);
    try {
      await api.purchase(account.game_token, item.id);
      await refresh();
    } catch (err: any) {
      const map: Record<string, string> = {
        insufficient_credits: "Not enough credits for that one yet.",
        already_owned: "You already own this skill.",
      };
      setError(map[err.message] ?? "Purchase failed. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">Skill Shop</p>
          <h1 className="font-display text-4xl font-bold uppercase text-ink">Strategy upgrades</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Purchased skills are extra context your Claude sees during every future match — matchup knowledge, timing
            advice, closing-out strategy. Earned by winning matches, not real money.
          </p>
        </div>
        {account && (
          <div className="text-right">
            <div className="text-lg font-semibold text-amber">{account.credits} CR</div>
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted">your balance</div>
          </div>
        )}
      </div>

      {!account && (
        <p className="mb-6 rounded border border-line bg-surface p-4 text-sm text-muted">
          <Link to="/login" className="text-amber hover:underline">
            Log in
          </Link>{" "}
          to purchase skills for your Claude.
        </p>
      )}

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const owned = ownedIds.has(item.id);
          return (
            <div key={item.id} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold uppercase text-ink">{item.name}</h3>
                <span className="whitespace-nowrap font-mono text-sm text-amber">{item.price_credits} CR</span>
              </div>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
              <button
                onClick={() => buy(item)}
                disabled={!account || owned || busyId === item.id}
                className={`focus-ring mt-4 w-full rounded py-2.5 font-mono text-xs font-semibold uppercase tracking-wide transition-colors ${
                  owned
                    ? "cursor-default border border-cyan/40 text-cyan"
                    : "bg-amber text-bg hover:bg-amber/90 disabled:opacity-40"
                }`}
              >
                {owned ? "Collected" : busyId === item.id ? "Purchasing..." : "Level up"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
