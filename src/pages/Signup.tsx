import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      const map: Record<string, string> = {
        username_taken: "That username is already taken.",
        invalid_username: "Usernames are 3-24 letters, numbers, or underscores.",
        password_too_short: "Password needs to be at least 6 characters.",
      };
      setError(map[err.message] ?? "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="font-display text-3xl font-bold uppercase text-ink">Create account</h1>
      <p className="mt-2 text-sm text-muted">No email required. Just a username and password.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-muted">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="focus-ring w-full rounded border border-line bg-surface px-3 py-2.5 text-ink outline-none"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-muted">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring w-full rounded border border-line bg-surface px-3 py-2.5 text-ink outline-none"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="focus-ring w-full rounded bg-amber py-3 font-mono text-sm font-semibold uppercase tracking-wide text-bg hover:bg-amber/90 disabled:opacity-50"
        >
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-amber hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
