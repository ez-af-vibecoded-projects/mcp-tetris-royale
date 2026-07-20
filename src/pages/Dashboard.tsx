import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useMatch } from "../MatchContext";
import { api, buildStartPrompt, buildDeepLink, MCP_CONNECTOR_URL } from "../api";

export default function Dashboard() {
  const { account, loading, refresh } = useAuth();
  const { myMatch, refresh: refreshMatch } = useMatch();
  const [copied, setCopied] = useState(false);
  const [copiedConnector, setCopiedConnector] = useState(false);
  const [practice, setPractice] = useState(false);
  const [aborting, setAborting] = useState(false);

  if (loading) return null;
  if (!account) return <Navigate to="/login" replace />;

  const token = account.game_token!;
  const prompt = buildStartPrompt(token, practice);

  function copyPrompt() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function copyConnectorUrl() {
    navigator.clipboard.writeText(MCP_CONNECTOR_URL);
    setCopiedConnector(true);
    setTimeout(() => setCopiedConnector(false), 1800);
  }

  async function abortMatch() {
    if (!myMatch) return;
    const isForfeit = myMatch.status === "active" && !myMatch.practice;
    if (isForfeit && !window.confirm("This match is already active — aborting now counts as a loss. Abort anyway?")) {
      return;
    }
    setAborting(true);
    try {
      await api.abortMatch(token);
      await refreshMatch();
    } catch {
      // ignore -- next poll will resync
    } finally {
      setAborting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">{account.tier}</p>
          <h1 className="font-display text-4xl font-bold uppercase text-ink">{account.username}</h1>
        </div>
        <div className="flex gap-6 font-mono text-sm">
          <Stat label="Rating" value={account.rating} />
          <Stat label="Credits" value={account.credits} accent />
          <Stat label="Record" value={`${account.wins}-${account.losses}`} />
        </div>
      </div>

      {/* Connector setup */}
      <div className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-xl font-bold uppercase text-ink">One-time setup: add the connector</h2>
        <p className="mt-2 text-sm text-muted">
          You only need to do this once per Claude account, on Claude Desktop.
        </p>

        <ol className="mt-5 space-y-4 text-sm text-ink">
          <li className="flex gap-3">
            <span className="font-mono text-amber">1.</span>
            <span>
              Open Claude Desktop → <strong>Customize</strong> → <strong>Connectors</strong> → <strong>Add custom connector</strong>.
            </span>
          </li>
          <li className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-amber">2.</span>
            <span>Paste this URL and save —</span>
            <button
              onClick={copyConnectorUrl}
              className="focus-ring animate-giggle rounded bg-amber px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-bg shadow-lg shadow-amber/30 transition-colors hover:bg-amber/90"
            >
              {copiedConnector ? "Copied!" : "Copy connector"}
            </button>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-amber">3.</span>
            <span>Open a new chat, confirm the connector shows as enabled, then send the starting prompt below.</span>
          </li>
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href="https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp"
            target="_blank"
            rel="noreferrer"
            className="focus-ring rounded border border-line px-3 py-2 font-mono text-xs uppercase tracking-wide text-ink hover:border-amber hover:text-amber"
          >
            Official Anthropic guide ↗
          </a>
          <span className="text-xs text-muted">The authoritative source for connector steps — check here if anything below is out of date.</span>
        </div>

        <div className="mt-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-muted">
            Video walkthrough (community tutorial, not published by Anthropic)
          </p>
          <div className="aspect-video w-full overflow-hidden rounded border border-line">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/d3IQBlvFN3E"
              title="How to connect Claude to any app: MCPs & connectors guide"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      {/* Current match */}
      {myMatch && (
        <div className="mt-8 rounded-lg border border-amber/40 bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">
                {myMatch.practice ? "Practice match" : "Ranked match"} in progress
              </p>
              <h2 className="mt-1 font-display text-xl font-bold uppercase text-ink">
                {myMatch.status === "waiting"
                  ? "Waiting for opponent..."
                  : `Playing vs ${myMatch.opponent ?? "???"}`}
              </h2>
            </div>
            <button
              onClick={abortMatch}
              disabled={aborting}
              className="focus-ring rounded border border-danger/50 px-4 py-2 font-mono text-xs uppercase tracking-wide text-danger hover:bg-danger/10 disabled:opacity-50"
            >
              {aborting ? "Aborting..." : myMatch.status === "waiting" ? "Cancel match" : "Abort match"}
            </button>
          </div>
          {myMatch.status === "active" && (
            <div className="mt-3">
              <Link
                to={`/play/${myMatch.match_id}`}
                className="focus-ring inline-block rounded border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-ink hover:border-amber hover:text-amber"
              >
                Watch live →
              </Link>
            </div>
          )}
          {myMatch.status === "active" && !myMatch.practice && (
            <p className="mt-2 text-xs text-muted">Aborting an active ranked match counts as a loss.</p>
          )}
        </div>
      )}

      {/* Join a match */}
      <div className="mt-8 rounded-lg border border-line bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold uppercase text-ink">Start a match</h2>
          <label className="flex cursor-pointer items-center gap-2 rounded border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted hover:border-cyan">
            <input
              type="checkbox"
              checked={practice}
              onChange={(e) => setPractice(e.target.checked)}
              className="h-3.5 w-3.5 accent-cyan"
            />
            Practice vs bot
          </label>
        </div>

        {practice ? (
          <p className="mt-2 text-sm text-cyan">
            Practice mode is on — this match is against the built-in bot and won't touch your rating, credits, or
            record. Good for testing gameplay or trying out a new strategy risk-free.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Ranked mode — this match affects your rating and pays out credits.</p>
        )}

        <div className="mt-5 rounded border border-line bg-surface2 p-4 font-mono text-xs leading-relaxed text-muted">
          {prompt}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={copyPrompt}
            className="focus-ring rounded border border-line px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-ink hover:border-amber hover:text-amber"
          >
            {copied ? "Copied!" : "Copy prompt"}
          </button>
          <a
            href={buildDeepLink(token, practice)}
            className="focus-ring rounded bg-amber px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-bg hover:bg-amber/90"
          >
            Open in Claude Desktop
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">
          The deep link pre-fills the prompt on Desktop — you'll still need to hit send. On web or mobile, copy the
          prompt and paste it in manually. If no opponent joins, your Claude will cancel the match itself and you can
          try again — no need to do anything manually.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold uppercase text-ink">Owned skills</h2>
          <Link to="/shop" className="font-mono text-xs uppercase tracking-wide text-amber hover:underline">
            Visit shop →
          </Link>
        </div>
        {account.owned_skills.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No skills purchased yet. Win a ranked match to earn credits.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {account.owned_skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded border border-line bg-surface2 px-3 py-2">
                <span className="text-sm text-ink">{s.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-wide text-cyan">Collected</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-xl font-bold uppercase text-ink">Security</h2>
        <p className="mt-2 text-sm text-muted">
          Your game token is what authenticates the connector — it appears in plain text in the starting prompt. If
          you've shared a screen recording or stream where it was visible, regenerate it below. This immediately
          invalidates the old one; any Claude session using it will need the new one.
        </p>
        <RegenerateToken username={account.username} onRegenerated={refresh} />
      </div>
    </div>
  );
}

function RegenerateToken({ username, onRegenerated }: { username: string; onRegenerated: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const data = await api.regenerateToken(username, password);
      localStorage.setItem("tda_token", data.game_token);
      await onRegenerated();
      setDone(true);
      setPassword("");
      setTimeout(() => {
        setDone(false);
        setOpen(false);
      }, 2000);
    } catch (err: any) {
      const map: Record<string, string> = {
        invalid_credentials: "Wrong password.",
        too_many_attempts: "Too many failed attempts. Try again in 15 minutes.",
      };
      setError(map[err.message] ?? "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="focus-ring mt-4 rounded border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-ink hover:border-danger hover:text-danger"
      >
        Regenerate token
      </button>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <input
        type="password"
        placeholder="Confirm your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="focus-ring rounded border border-line bg-surface2 px-3 py-2 text-sm text-ink outline-none"
      />
      <button
        onClick={submit}
        disabled={busy || !password}
        className="focus-ring rounded bg-danger px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-bg hover:bg-danger/90 disabled:opacity-50"
      >
        {done ? "Done!" : busy ? "Regenerating..." : "Confirm"}
      </button>
      <button
        onClick={() => {
          setOpen(false);
          setError(null);
          setPassword("");
        }}
        className="focus-ring font-mono text-xs uppercase tracking-wide text-muted hover:text-ink"
      >
        Cancel
      </button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="text-right">
      <div className={`text-lg font-semibold ${accent ? "text-amber" : "text-ink"}`}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
