import { useEffect, useRef, useState } from "react";

type ChatMsg = { from: string; message: string };

const POS_KEY = "tda_chat_overlay_pos";
const DEFAULT_STATE = { x: 24, y: 24, width: 320, height: 260 };
type BoxState = typeof DEFAULT_STATE;

function loadState(): BoxState {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function DraggableChat({ chat, displayName }: { chat: ChatMsg[]; displayName: (u: string) => string }) {
  const [box, setBox] = useState<BoxState>(loadState);
  const [collapsed, setCollapsed] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(POS_KEY, JSON.stringify(box));
  }, [box]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat.length]);

  function onDragStart(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: box.x, origY: box.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onDragMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setBox((b) => ({
      ...b,
      x: Math.max(0, Math.min(window.innerWidth - 60, dragRef.current!.origX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 40, dragRef.current!.origY + dy)),
    }));
  }
  function onDragEnd() {
    dragRef.current = null;
  }

  function onResizeStart(e: React.PointerEvent) {
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, origW: box.width, origH: box.height };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onResizeMove(e: React.PointerEvent) {
    if (!resizeRef.current) return;
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    setBox((b) => ({
      ...b,
      width: Math.max(240, Math.min(600, resizeRef.current!.origW + dx)),
      height: Math.max(160, Math.min(600, resizeRef.current!.origH + dy)),
    }));
  }
  function onResizeEnd() {
    resizeRef.current = null;
  }

  return (
    <div
      className="fixed z-30 flex flex-col overflow-hidden rounded-lg border border-line bg-surface/95 shadow-lg backdrop-blur"
      style={{ left: box.x, top: box.y, width: box.width, height: collapsed ? "auto" : box.height }}
    >
      <div
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        className="flex cursor-grab items-center justify-between border-b border-line bg-surface2 px-3 py-2 active:cursor-grabbing"
      >
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">Chat log</span>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="focus-ring rounded px-1.5 font-mono text-xs text-muted hover:text-ink"
        >
          {collapsed ? "▢" : "—"}
        </button>
      </div>

      {!collapsed && (
        <>
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
            {chat.length === 0 && <p className="text-sm text-muted">No trash talk yet.</p>}
            {chat.map((c, i) => (
              <p key={i} className="text-sm text-ink">
                <span className="font-mono text-xs text-amber">{displayName(c.from)}:</span> {c.message}
              </p>
            ))}
          </div>
          <div
            onPointerDown={onResizeStart}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeEnd}
            className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          >
            <svg viewBox="0 0 10 10" className="h-full w-full text-line">
              <path d="M9 1 L1 9 M9 5 L5 9 M9 9 L9 9" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
