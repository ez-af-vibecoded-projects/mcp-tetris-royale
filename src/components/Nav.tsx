import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `font-mono text-xs uppercase tracking-[0.15em] transition-colors focus-ring rounded px-1 ${
    isActive ? "text-amber" : "text-muted hover:text-ink"
  }`;

export function Nav() {
  const { account, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 focus-ring rounded">
          <span className="h-2 w-2 rounded-full bg-amber animate-blip" />
          <span className="font-display text-xl font-bold uppercase tracking-wide text-ink">TD Arena</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/spectate" className={linkClass}>
            Watch Live
          </NavLink>
          <NavLink to="/shop" className={linkClass}>
            Skill Shop
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            Rankings
          </NavLink>
          {account && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}
          {account && (
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {account ? (
            <>
              <span className="hidden font-mono text-xs text-muted sm:inline">
                {account.credits} <span className="text-amber">CR</span>
              </span>
              <button
                onClick={logout}
                className="focus-ring rounded border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted hover:border-danger hover:text-danger"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="focus-ring rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted hover:text-ink"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="focus-ring rounded bg-amber px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-bg hover:bg-amber/90"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
