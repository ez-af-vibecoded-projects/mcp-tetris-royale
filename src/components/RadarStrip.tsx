export function RadarStrip({ active = true, label }: { active?: boolean; label?: string }) {
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <span>you</span>
          <span>{label}</span>
          <span>opponent</span>
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface2 ring-1 ring-line">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-amber/10 via-amber/40 to-amber/70" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-cyan/10 via-cyan/40 to-cyan/70" />
        {active && (
          <div className="absolute inset-y-0 left-0 w-10 -translate-x-1/2 bg-white/40 blur-[3px] animate-sweep" />
        )}
      </div>
    </div>
  );
}
