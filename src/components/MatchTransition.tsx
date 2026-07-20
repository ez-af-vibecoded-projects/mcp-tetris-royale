import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../MatchContext";

export function MatchTransition() {
  const { justActivatedMatchId, clearJustActivated } = useMatch();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!justActivatedMatchId) return;
    setVisible(true);
    const toNavigate = setTimeout(() => {
      navigate(`/play/${justActivatedMatchId}`);
    }, 650);
    const toClear = setTimeout(() => {
      setVisible(false);
      clearJustActivated();
    }, 1100);
    return () => {
      clearTimeout(toNavigate);
      clearTimeout(toClear);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justActivatedMatchId]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-sm">
      <div className="animate-[pulse_0.6s_ease-in-out] text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber">Opponent found</p>
        <h2 className="mt-2 font-display text-4xl font-extrabold uppercase text-ink">Entering match</h2>
      </div>
    </div>
  );
}
