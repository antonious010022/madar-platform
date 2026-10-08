// Visual-only effects for the Duolingo-style skin. None of these components read
// or write app data; they only draw things on top of the existing pages.
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Shown on every full page load / browser reload: a bouncing logo, a chunky
   progress bar that fills up and five jumping dots, then a circular "iris"
   closes over it and reveals the page. Never blocks clicks (pointer-events: none). */
export function LoadSplash() {
  const [phase, setPhase] = useState(() => (prefersReducedMotion() ? "gone" : "show"));
  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    if (phase === "gone") return;
    const t1 = setTimeout(() => setPhase("leaving"), 1050);
    const t2 = setTimeout(() => setPhase("gone"), 1550);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === "gone") return null;
  return (
    <div className={`duo-splash${phase === "leaving" ? " leaving" : ""}`} aria-hidden="true">
      <div className="duo-splash-logo">
        {logoOk ? <img src="/photo/0MSCh.png" alt="" onError={() => setLogoOk(false)} /> : <b>م</b>}
      </div>
      <div className="duo-splash-dots">
        <span /><span /><span /><span /><span />
      </div>
      <div className="duo-splash-bar"><i /></div>
    </div>
  );
}

/* A rainbow bar that sweeps across the top of the screen on every navigation. */
export function RouteProgress() {
  const location = useLocation();
  const first = useRef(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setTick((n) => n + 1);
  }, [location.pathname]);

  if (!tick) return null;
  return (
    <div key={tick} className="duo-routebar" aria-hidden="true">
      <i />
    </div>
  );
}

/* The bubble that follows the finger during the edge swipe-back gesture.
   App.jsx's useEdgeSwipeBack() drives it through a ref (direct style writes, no
   re-renders), so the gesture itself stays exactly as before. */
export function SwipeBackBubble({ bubbleRef }) {
  return (
    <div ref={bubbleRef} className="duo-swipe" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}
