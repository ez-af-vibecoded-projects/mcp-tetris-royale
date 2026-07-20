const CELL_COLORS: Record<string, string> = {
  ".": "bg-surface2",
  I: "bg-cyan",
  O: "bg-amber",
  T: "bg-fuchsia-500",
  S: "bg-emerald-500",
  Z: "bg-danger",
  J: "bg-blue-500",
  L: "bg-orange-500",
  G: "bg-line",
};

export function TetrisBoard({ rows }: { rows: string[] }) {
  return (
    <div className="grid grid-cols-10 gap-[2px] rounded border border-line bg-bg p-1.5">
      {rows.flatMap((row, r) =>
        row.split("").map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`aspect-square rounded-[2px] transition-colors duration-500 ${CELL_COLORS[cell] ?? "bg-surface2"}`}
          />
        )),
      )}
    </div>
  );
}

export function displayName(username: string) {
  return username === "SENTRY_BOT" ? "Sentry Bot" : username;
}
