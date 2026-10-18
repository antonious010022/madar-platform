// Visual-only effects for the Duolingo-style skin. None of these components read
// or write app data; they only draw things on top of the existing pages.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const LOGO_SRC = "/photo/0MSCh.png";
const THEME_KEY = "madar_theme_v1";

// true  = the splash plays once per browser session (first visit / new tab)
// false = it plays on every full page load
const SPLASH_ONCE_PER_SESSION = false;
const SPLASH_KEY = "madar_splash_seen_v1";

// how long the see-through loading veil stays on screen when moving between pages
const VEIL_MS = 700;

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function savedTheme() {
  try {
    const s = localStorage.getItem(THEME_KEY);
    return s === "dark" || s === "light" ? s : null;
  } catch {
    return null;
  }
}

// The pages only set <html data-theme> after they mount, so the splash works out
// the theme itself: the saved choice first, then the device setting.
function resolveTheme() {
  const saved = savedTheme();
  if (saved) return saved;
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function splashAlreadySeen() {
  if (!SPLASH_ONCE_PER_SESSION) return false;
  try {
    return sessionStorage.getItem(SPLASH_KEY) === "1";
  } catch {
    return false;
  }
}

function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH_KEY, "1");
  } catch {
    /* ignore */
  }
}

/* Main loading screen: the platform logo spins inside an orbit with two small
   planets. The veil behind it is see-through (the page shows through, blurred),
   follows light/dark mode, and closes like an iris once the page has loaded
   (at least 0.9s, at most 3s). It never blocks clicks (pointer-events: none). */
export function LoadSplash() {
  const [phase, setPhase] = useState(() => (prefersReducedMotion() || splashAlreadySeen() ? "gone" : "show"));
  const [logoOk, setLogoOk] = useState(true);
  const [theme] = useState(resolveTheme);

  // Paint the page behind the splash in the right mode from the very first frame.
  useLayoutEffect(() => {
    const saved = savedTheme();
    const html = document.documentElement;
    if (saved && !html.getAttribute("data-theme")) html.setAttribute("data-theme", saved);
  }, []);

  useEffect(() => {
    if (phase === "gone") return undefined;
    markSplashSeen();

    const MIN_MS = 900;
    const MAX_MS = 3000;
    const startedAt = Date.now();
    let left = false;
    let goneTimer = null;
    let minTimer = null;

    function leave() {
      if (left) return;
      left = true;
      setPhase("leaving");
      goneTimer = setTimeout(() => setPhase("gone"), 500);
    }
    function onReady() {
      minTimer = setTimeout(leave, Math.max(0, MIN_MS - (Date.now() - startedAt)));
    }

    if (document.readyState === "complete") onReady();
    else window.addEventListener("load", onReady, { once: true });
    const maxTimer = setTimeout(leave, MAX_MS);

    return () => {
      window.removeEventListener("load", onReady);
      clearTimeout(maxTimer);
      clearTimeout(minTimer);
      clearTimeout(goneTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === "gone") return null;
  return (
    <div className={`duo-splash${phase === "leaving" ? " leaving" : ""}`} data-theme={theme} aria-hidden="true">
      <div className="duo-splash-orbit">
        <span className="duo-splash-ring" />
        <span className="duo-splash-spin"><i /></span>
        <span className="duo-splash-spin duo-splash-spin2"><i /></span>
        <div className="duo-splash-logo">
          {logoOk ? <img src={LOGO_SRC} alt="" onError={() => setLogoOk(false)} /> : <b>م</b>}
        </div>
      </div>
      <p className="duo-splash-name">مَدَار</p>
    </div>
  );
}

/* Loading state for everything inside the platform (pages, lists, lessons):
   a softly pulsing logo with a thin progress bar. `compact` is for loading a
   section inside a page; the default fills the page area. */
export function PageLoader({ label = "جاري التحميل…", compact = false, veil = false }) {
  const [logoOk, setLogoOk] = useState(true);
  return (
    <div className={`duo-loader${compact ? " compact" : ""}${veil ? " duo-loader-veil" : ""}`} role="status" aria-live="polite">
      <div className="duo-loader-logo" aria-hidden="true">
        {logoOk ? <img src={LOGO_SRC} alt="" onError={() => setLogoOk(false)} /> : <b>م</b>}
      </div>
      <div className="duo-loader-bar" aria-hidden="true"><i /></div>
      <span className="duo-loader-cap">{label}</span>
    </div>
  );
}

/* When moving between pages: for a moment (VEIL_MS) the page stays visible but
   see-through and soft, with the small loader running on top of it, so the
   screen is never a solid white or solid dark page. Never blocks clicks. */
export function RouteVeil() {
  const location = useLocation();
  const first = useRef(true);
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    if (prefersReducedMotion()) return undefined;
    setTick((n) => n + 1);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), VEIL_MS);
    return () => clearTimeout(t);
  }, [location.pathname]);

  if (!visible) return null;
  return (
    <div key={tick} className="duo-veil" aria-hidden="true">
      <PageLoader compact veil />
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
