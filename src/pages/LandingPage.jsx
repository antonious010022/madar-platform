import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import { useAuth } from "../lib/hooks";
import { ArrowLeft, Sparkles, Compass, Menu, X, Sun, Moon, ChevronDown, LogIn } from "lucide-react";
import { SocialIcon } from "../components/SocialIcons.jsx";
const SCATTER = [
  { key: "quiz", title: "أسئلة تفاعلية", sub: "تحقق من فهمك", tone: "rose", x: -42, y: -36, rot: "-6deg", dur: "4.2s", delay: "0s" },
  { key: "mindmap", title: "خريطة ذهنية", sub: "ربط الأفكار", tone: "sky", x: 42, y: -36, rot: "6deg", dur: "4.8s", delay: "0.2s" },
  { key: "timeline", title: "خط زمني", sub: "ترتيب الأحداث", tone: "amber", x: -49, y: 5, rot: "5deg", dur: "5.2s", delay: "0.35s", deskOnly: true },
  { key: "explain", title: "شرح مرئي", sub: "محتوى واضح", tone: "teal", x: 49, y: 7, rot: "-5deg", dur: "4.5s", delay: "0.5s", deskOnly: true },
  { key: "recall", title: "تذكّر سريع", sub: "نقاط أساسية", tone: "emerald", x: -36, y: 40, rot: "-4deg", dur: "4.9s", delay: "0.7s" },
  { key: "review", title: "مراجعة نهائية", sub: "تلخيص الدرس", tone: "violet", x: 36, y: 40, rot: "5deg", dur: "5.5s", delay: "0.85s" },
];

function ScatterIcon({ k }) {
  const p = {
    viewBox: "0 0 24 24",
    width: 16,
    height: 16,
    fill: "currentColor",
    "aria-hidden": true,
  };

  if (k === "mindmap")
    return <svg {...p}><path d="M12 2a3 3 0 0 1 3 3c0 .9-.4 1.7-1 2.2V9h2a3 3 0 1 1 0 6h-2v1.8c.6.5 1 1.3 1 2.2a3 3 0 1 1-6 0c0-.9.4-1.7 1-2.2V15H8a3 3 0 1 1 0-6h2V7.2C9.4 6.7 9 5.9 9 5a3 3 0 0 1 3-3z" /></svg>;

  if (k === "timeline")
    return <svg {...p}><path d="M3 11h18v2H3zm4 1a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm5 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm5 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /></svg>;

  if (k === "explain")
    return <svg {...p}><path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 3V5a1 1 0 0 1 1-1zm2 3v2h10V7H6zm0 4v2h8v-2H6z" /></svg>;

  if (k === "recall")
    return <svg {...p}><path d="M12 3a7 7 0 0 1 7 7c0 3.5-2.5 5.5-4.5 7.2-.6.5-1 1.1-1.2 1.8h-2.6c-.2-.7-.6-1.3-1.2-1.8C7.5 15.5 5 13.5 5 10a7 7 0 0 1 7-7zm-2 18h4v1h-4z" /></svg>;

  if (k === "review")
    return <svg {...p}><path d="M6 2h11l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm10 1.5V8h4.5L16 3.5zM8 11h8v2H8zm0 4h6v2H8z" /></svg>;

  return <svg {...p}><path d="M11 18h2v-2h-2zm1-16a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-14a4 4 0 0 0-4 4h2a2 2 0 1 1 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4z" /></svg>;
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("madar_theme_v1");
      if (saved === "dark") return true;
      if (saved === "light") return false;
    } catch {
      // التخزين غير متاح؛ نستخدم إعداد الجهاز.
    }

    return (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    try {
      localStorage.setItem("madar_theme_v1", dark ? "dark" : "light");
    } catch {
      // عدم توفر التخزين لا يمنع تغيير الثيم.
    }
    try {
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    } catch {
      // ignore SSR / non-DOM
    }
  }, [dark]);

  return [dark, () => setDark((value) => !value)];
}

function ThemeIcon({ dark }) {
  return dark ? (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 14.3A7.5 7.5 0 0 1 9.7 3 9 9 0 1 0 21 14.3z" />
    </svg>
  );
}


/* Components and design styles adapted from the supplied "تعليمات وطريقة التشغيل.txt". */
const ROTATING_WORDS = ["تفاعلية", "حديثة", "ذكية", "متكاملة", "عربية"];
/* Floating scatter cards — feature pills around the hero */
const SCATTER_CARDS = [
  {
    key: "quiz", title: "أسئلة تفاعلية", sub: "تحقق من فهمك", tone: "rose",
    xD: -42, yD: -28, xM: -38, yM: -22, rot: "-4deg", dur: "3.2s", delay: "0s", hideMobile: false,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M11 18h2v-2h-2v2zm1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2 2 2 0 0 1 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4z" />
      </svg>
    ),
  },
  {
    key: "mindmap", title: "خريطة ذهنية", sub: "ربط الأفكار", tone: "sky",
    xD: 40, yD: -26, xM: 36, yM: -20, rot: "3deg", dur: "4s", delay: "0.2s", hideMobile: false,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 2a3 3 0 0 1 3 3c0 .9-.4 1.7-1 2.2V9h2a3 3 0 1 1 0 6h-2v1.8c.6.5 1 1.3 1 2.2a3 3 0 1 1-6 0c0-.9.4-1.7 1-2.2V15H8a3 3 0 1 1 0-6h2V7.2C9.4 6.7 9 5.9 9 5a3 3 0 0 1 3-3z" />
      </svg>
    ),
  },
  {
    key: "timeline", title: "خط زمني", sub: "ترتيب الأحداث", tone: "amber",
    xD: -46, yD: 6, xM: -40, yM: 18, rot: "3deg", dur: "4.6s", delay: "0.35s", hideMobile: false,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M4 11h16v2H4v-2zm3 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
      </svg>
    ),
  },
  {
    key: "explain", title: "شرح مرئي", sub: "محتوى واضح", tone: "teal",
    xD: 44, yD: 8, xM: 38, yM: 20, rot: "-3deg", dur: "3.5s", delay: "0.5s", hideMobile: false,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 3V5a1 1 0 0 1 1-1zm2 3v2h8V7H6zm0 4v2h12v-2H6z" />
      </svg>
    ),
  },
  {
    key: "recall", title: "تذكّر سريع", sub: "نقاط أساسية", tone: "emerald",
    xD: -34, yD: 32, xM: -28, yM: 42, rot: "-2deg", dur: "4.2s", delay: "0.7s", hideMobile: false,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 3a7 7 0 0 1 7 7c0 3.5-2.5 5.5-4.5 7.2-.6.5-1 1.1-1.2 1.8h-2.6c-.2-.7-.6-1.3-1.2-1.8C7.5 15.5 5 13.5 5 10a7 7 0 0 1 7-7zm-2 18h4v1h-4v-1z" />
      </svg>
    ),
  },
  {
    key: "review", title: "مراجعة نهائية", sub: "تلخيص الدرس", tone: "violet",
    xD: 32, yD: 34, xM: 26, yM: 44, rot: "4deg", dur: "5s", delay: "0.9s", hideMobile: true,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M6 2h11l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm10 1.5V8h4.5L16 3.5zM8 11h8v2H8v-2zm0 4h6v2H8v-2z" />
      </svg>
    ),
  },
];
const TONE_BG = {
  rose: "#F5E6EC", sky: "#E6EEF3", amber: "#F8EFD8",
  teal: "#E0F1EC", emerald: "#E4EFE3", violet: "#EFE8F4",
};
const TONE_INK = {
  rose: "#8A4560", sky: "#2F5870", amber: "#86600F",
  teal: "#0E5348", emerald: "#3F6B3A", violet: "#5A4175",
};
const TONE_BG_DARK = {
  rose: "#2E1D24", sky: "#1A2730", amber: "#2A2418",
  teal: "#13332C", emerald: "#1A2E20", violet: "#241D2E",
};
function FloatingScatterCards({ theme }) {
  return (
    <div className="md-scatter-layer" aria-hidden="true">
      {SCATTER_CARDS.map((c) => {
        const bg = theme === "dark" ? TONE_BG_DARK[c.tone] : TONE_BG[c.tone];
        return (
          <div
            key={c.key}
            className={`md-scatter-card${c.hideMobile ? " md-scatter-card--desktop-only" : ""}`}
            style={{
              "--card-x-d": `${c.xD}`,
              "--card-y-d": `${c.yD}`,
              "--card-x-m": `${c.xM}`,
              "--card-y-m": `${c.yM}`,
              "--card-rot": c.rot,
              "--card-anim-dur": c.dur,
              "--card-anim-delay": c.delay,
            }}
          >
            <div className="md-scatter-inner" style={{ borderColor: "var(--duo-line)" }}>
              <span className="md-scatter-icon" style={{ background: bg, color: TONE_INK[c.tone] }}>
                {c.icon}
              </span>
              <div className="md-scatter-text">
                <span className="md-scatter-title">{c.title}</span>
                <span className="md-scatter-sub">{c.sub}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function RotatingWord({ theme }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef();
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => window.clearInterval(timerRef.current);
  }, []);
  return (
    <span
      className="hero-rotor-badge"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="hero-rotor-grid" aria-hidden="true">
        {ROTATING_WORDS.map((w, i) => (
          <span
            key={w}
            className={`hero-rotor-word${i === idx ? " is-active" : ""}`}
          >
            {w}
          </span>
        ))}
      </span>
      <span className="hero-rotor-sr">{ROTATING_WORDS[idx]}</span>
    </span>
  );
}
function HeroSection({ theme, onStart, onFeatures }) {
  return (
    <section id="top" className="md-hero md-hero--scatter">
      <style>{HERO_CSS}</style>
      <FloatingScatterCards theme={theme} />
      <div className="md-hero-core">
        {/* Badge with rotating word */}
        <div className="hero-badge-line">
          <span className="hero-badge-text">منصة تعليمية</span>
          <RotatingWord theme={theme} />
        </div>
        {/* Main headline */}
        <h1 className="hero-headline">
          لم نطوّر تجربة التعليم…
          <br />
          <span className="hero-headline-accent">أعدنا بناءها.</span>
        </h1>
        {/* Description */}
        <p className="hero-desc">
          مَدَار منصة تعليمية عربية تعيد تعريف طريقة دراسة الدراسات الاجتماعية.
          بدلًا من الاعتماد على الحفظ، نساعد الطالب على{" "}
          <strong>الفهم الحقيقي</strong> من خلال شرح مرئي، خرائط ذهنية،
          خطوط زمنية، وأسئلة تفاعلية — كل ما تحتاجه لتفهم الدرس في مكان واحد.
        </p>
        {/* Buttons */}
        <div className="hero-actions">
          <button type="button" onClick={onStart} className="hero-btn hero-btn-primary">
            <span>ابدأ التعلّم</span>
            <ArrowLeft size={18} />
          </button>
          <button type="button" onClick={onFeatures} className="hero-btn hero-btn-secondary">
            <Sparkles size={17} />
            <span>اكتشف مميزات مَدَار</span>
          </button>
        </div>
        {/* Trust indicators */}
        <div className="hero-trust">
          <div className="hero-trust-item">
            <Compass size={16} />
            <span>منهج متكامل</span>
          </div>
          <div className="hero-trust-dot" />
          <div className="hero-trust-item">
            <span className="hero-trust-num">٤</span>
            <span>أدوات تعلّم</span>
          </div>
          <div className="hero-trust-dot" />
          <div className="hero-trust-item">
            <span className="hero-trust-num">RTL</span>
            <span>عربية بالكامل</span>
          </div>
        </div>
      </div>
    </section>
  );
}
const HERO_CSS = `
.md-hero--scatter {
  position: relative;
  overflow: visible;
  isolation: isolate;
  min-height: 28rem;
  padding: 7rem 1rem 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.md-hero-core {
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 0 auto;
}
/* ---- scatter cards ---- */
.md-scatter-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: visible;
}
.md-scatter-card {
  position: absolute;
  left: calc(50% + var(--card-x-m) * 1%);
  top: calc(50% + var(--card-y-m) * 1%);
  transform: translate(-50%, -50%) rotate(var(--card-rot));
  animation: md-scatter-float var(--card-anim-dur) ease-in-out var(--card-anim-delay) infinite alternate;
  will-change: transform;
}
@media (min-width: 768px) {
  .md-scatter-card {
    left: calc(50% + var(--card-x-d) * 1%);
    top: calc(50% + var(--card-y-d) * 1%);
  }
}
.md-scatter-card--desktop-only { display: none; }
@media (min-width: 768px) {
  .md-scatter-card--desktop-only { display: block; }
}
.md-scatter-inner {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.8rem;
  border-radius: 1rem;
  border: 1.5px solid;
  background: var(--duo-surface);
  box-shadow: 0 10px 28px -12px rgba(14, 83, 72, 0.18);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}
.dark .md-scatter-inner {
  box-shadow: 0 10px 28px -12px rgba(0, 0, 0, 0.4);
}
.md-scatter-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.75rem;
  flex: none;
}
.md-scatter-text {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  line-height: 1.2;
}
.md-scatter-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--duo-ink);
  font-family: var(--duo-font-display);
}
.md-scatter-sub {
  font-size: 9px;
  color: var(--duo-muted);
}
@media (min-width: 1024px) {
  .md-scatter-title { font-size: 13px; }
  .md-scatter-sub { font-size: 10px; }
}
@keyframes md-scatter-float {
  from { transform: translate(-50%, -50%) rotate(var(--card-rot)) translateY(0); }
  to   { transform: translate(-50%, -50%) rotate(var(--card-rot)) translateY(-10px); }
}
@media (prefers-reduced-motion: reduce) {
  .md-scatter-card { animation: none !important; }
}
@media (max-width: 479px) {
  .md-scatter-inner { padding: 0.4rem 0.55rem; gap: 0.4rem; }
  .md-scatter-icon { width: 1.6rem; height: 1.6rem; }
  .md-scatter-title { font-size: 9px; }
  .md-scatter-sub { font-size: 8px; }
}
/* ---- badge with rotating word ---- */
.hero-badge-line {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.55rem 0.45rem 1rem;
  border-radius: 999px;
  background: var(--duo-green-soft);
  border: 1.5px solid color-mix(in srgb, var(--duo-green) 20%, transparent);
  margin-bottom: 1.75rem;
  animation: hero-badge-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-badge-text {
  font-family: var(--duo-font-display);
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--duo-green-ink);
}
/* The rotating word inside a circular badge */
.hero-rotor-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--duo-green), var(--duo-green-ink));
  box-shadow: 0 6px 20px -6px var(--duo-green);
  flex: none;
}
.hero-rotor-grid {
  display: inline-grid;
  grid-area: 1 / 1;
}
.hero-rotor-word {
  grid-area: 1 / 1;
  font-family: var(--duo-font-display);
  font-size: 0.78rem;
  font-weight: 900;
  color: #fff;
  opacity: 0;
  transform: scale(0.6) translateY(8px);
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
}
.hero-rotor-word.is-active {
  opacity: 1;
  transform: scale(1) translateY(0);
}
.hero-rotor-sr {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
/* ---- headline ---- */
.hero-headline {
  font-family: var(--duo-font-display);
  font-size: clamp(1.8rem, 5.5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.3;
  color: var(--duo-ink);
  margin: 0 0 1.25rem;
  animation: hero-rise 0.8s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-headline-accent {
  background: linear-gradient(135deg, var(--duo-green), var(--duo-amber));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
/* ---- description ---- */
.hero-desc {
  font-family: var(--duo-font-body);
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--duo-muted);
  max-width: 580px;
  margin: 0 auto 2.25rem;
  animation: hero-rise 0.8s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-desc strong {
  color: var(--duo-green-ink);
  font-weight: 800;
}
/* ---- buttons ---- */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  justify-content: center;
  animation: hero-rise 0.8s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 999px;
  font-family: var(--duo-font-display);
  font-size: 1rem;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;
}
.hero-btn-primary {
  background: var(--duo-green);
  color: #fff;
  box-shadow: 0 5px 0 var(--duo-green-ink), 0 12px 30px -10px var(--duo-green);
}
.hero-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 0 var(--duo-green-ink), 0 16px 36px -10px var(--duo-green);
}
.hero-btn-primary:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--duo-green-ink), 0 6px 18px -10px var(--duo-green);
}
.hero-btn-secondary {
  background: var(--duo-surface);
  color: var(--duo-ink);
  border: 2px solid var(--duo-line);
  box-shadow: 0 4px 0 var(--duo-line);
}
.hero-btn-secondary:hover {
  border-color: var(--duo-green);
  color: var(--duo-green-ink);
  transform: translateY(-2px);
  box-shadow: 0 6px 0 color-mix(in srgb, var(--duo-green) 25%, var(--duo-line));
}
.hero-btn-secondary:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0 var(--duo-line);
}
/* ---- trust indicators ---- */
.hero-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
  animation: hero-rise 0.8s 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-trust-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--duo-muted);
}
.hero-trust-item svg { color: var(--duo-green); }
.hero-trust-num {
  font-family: var(--duo-font-display);
  font-weight: 900;
  color: var(--duo-green-ink);
  font-size: 0.9rem;
}
.hero-trust-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--duo-line);
}
@keyframes hero-rise {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: none; }
}
@keyframes hero-badge-in {
  from { opacity: 0; transform: scale(0.85) translateY(-10px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-headline, .hero-desc, .hero-actions, .hero-trust, .hero-badge-line {
    animation: none !important;
  }
  .hero-rotor-word { transition: none !important; }
}
@media (max-width: 640px) {
  .hero-badge-line { gap: 0.35rem; padding: 0.35rem 0.4rem 0.35rem 0.8rem; }
  .hero-rotor-badge { width: 3.5rem; height: 3.5rem; }
  .hero-rotor-word { font-size: 0.68rem; }
  .hero-desc { font-size: 0.95rem; }
  .hero-btn { font-size: 0.9rem; padding: 0.75rem 1.4rem; }
}
`;


function MadarLogo({ size = 40, withText = true, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="flex-none"
      >
        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" opacity="0.35" />
        <ellipse cx="20" cy="20" rx="17" ry="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45" transform="rotate(-25 20 20)" />
        <circle cx="20" cy="20" r="6.5" fill="currentColor" />
        <circle cx="35" cy="13" r="2.8" fill="#C98512" />
      </svg>
      {withText && (
        <span
          className="font-display font-extrabold text-xl tracking-tight"
          style={{ color: "var(--duo-green)" }}
        >
          مَدَار
        </span>
      )}
    </span>
  );
}

const FOOTER_LINKS = [
  {
    title: "التعلّم",
    items: [
      { label: "المناهج", href: "#showcase" },
      { label: "طريقة التعلّم", href: "#showcase" },
      { label: "ابدأ الآن", href: "#student" },
    ],
  },
  {
    title: "المنصة",
    items: [
      { label: "عن مَدَار", href: "#about" },
      { label: "الخصوصية", href: "#privacy" },
      { label: "الشروط", href: "#terms" },
    ],
  },
];
const SOCIALS = [
  { key: "facebook", label: "فيسبوك" },
  { key: "instagram", label: "إنستجرام" },
  { key: "youtube", label: "يوتيوب" },
  { key: "telegram", label: "تليجرام" },
];
function InternalLandingFooter() {
  return (
    <footer
      className="landing-footer"
      style={{
        background: "var(--duo-bg-alt)",
        borderTop: "1.5px solid var(--duo-line)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <MadarLogo size={36} />
            <p className="footer-tagline">
              منصة تعليمية عربية تفاعلية تعيد تعريف طريقة دراسة الدراسات الاجتماعية.
            </p>
            <div className="footer-socials">
              {SOCIALS.map((s) => (
                <a
                  key={s.key}
                  href="#"
                  aria-label={s.label}
                  className="footer-social"
                  style={{
                    borderColor: "var(--duo-line)",
                    background: "var(--duo-surface)",
                    color: "var(--duo-ink-soft)",
                  }}
                >
                  <SocialIcon name={s.key} />
                </a>
              ))}
            </div>
          </div>
          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title} className="footer-col">
              <h4 className="footer-heading">{col.title}</h4>
              <ul className="footer-list">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="footer-link">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} مَدَار — جميع الحقوق محفوظة
          </p>
          <p className="footer-made">
            صُنع بعناية لطلاب العربية
          </p>
        </div>
      </div>
      <style>{`
        .landing-footer { margin-top: 0; }
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 640px) {
          .footer-grid { grid-template-columns: 1.5fr 1fr 1fr; gap: 2.5rem; }
        }
        .footer-brand { display: flex; flex-direction: column; gap: 0.75rem; }
        .footer-tagline {
          font-size: 0.85rem;
          line-height: 1.7;
          color: var(--duo-muted);
          margin: 0;
          max-width: 280px;
        }
        .footer-socials { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
        .footer-social {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.65rem;
          border: 1.5px solid;
          transition: all 0.2s ease;
        }
        .footer-social:hover {
          transform: translateY(-2px);
          border-color: var(--duo-green);
          color: var(--duo-green) !important;
        }
        .footer-col { display: flex; flex-direction: column; gap: 0.6rem; }
        .footer-heading {
          font-family: var(--duo-font-display);
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--duo-ink);
          margin: 0 0 0.25rem;
        }
        .footer-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .footer-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--duo-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-link:hover { color: var(--duo-green-ink); }
        .footer-bottom {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--duo-line);
        }
        .footer-copy { font-size: 0.8rem; color: var(--duo-muted); margin: 0; font-weight: 600; }
        .footer-made { font-size: 0.8rem; color: var(--duo-green-ink); margin: 0; font-weight: 700; }
      `}</style>
    </footer>
  );
}


const INK = "#0E5348";
const TEAL = "#147A6A";
const FEATURES = [
  {
    id: "visual",
    title: "شرح مرئي مبسّط",
    text: "فيديو وصور وشرح واضح يرافق كل فكرة في الدرس.",
    tag: "افهم",
    ac: TEAL, soft: "#E2F3EE", ink: INK,
    fd: "5.4s", dl: "-0.6s", rot: "0.35deg",
    points: ["صور وفيديو مع كل فكرة", "السبب ثم الحدث ثم النتيجة", "شرح بلغة بسيطة وواضحة"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="6" width="13" height="12" rx="3" />
        <path d="M15.5 10.5l6-3.5v10l-6-3.5z" />
      </svg>
    ),
  },
  {
    id: "mind",
    title: "خرائط ذهنية",
    text: "تربط الأفكار ببعضها لتتذكّرها وتفهمها بسهولة.",
    tag: "اربط",
    ac: "#C98512", soft: "#FBF0D6", ink: "#8A5A00",
    fd: "6.2s", dl: "-2.1s", rot: "-0.3deg",
    points: ["فكرة رئيسية تتفرّع منها التفاصيل", "روابط تُظهر علاقة المعلومات", "تذكّر أسهل وأسرع"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <circle cx="4.5" cy="5.5" r="2" />
        <circle cx="19.5" cy="5.5" r="2" />
        <circle cx="12" cy="20" r="2" />
        <path d="M10 10L6 7M14 10l4-3M12 15v3" />
      </svg>
    ),
  },
  {
    id: "timeline",
    title: "خطوط زمنية",
    text: "تتبّع الأحداث بترتيبها الصحيح عبر الزمن.",
    tag: "رتّب",
    ac: "#C2562F", soft: "#FBE7DE", ink: "#9A3B1A",
    fd: "5.8s", dl: "-3.4s", rot: "0.25deg",
    points: ["الأحداث بترتيبها الصحيح", "كل حدث مرتبط بما قبله", "ترى الصورة الكبيرة دفعة واحدة"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18" />
        <circle cx="6" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="18" cy="12" r="1.6" />
        <path d="M6 6v3M12 15v3M18 6v3" />
      </svg>
    ),
  },
  {
    id: "quiz",
    title: "أسئلة ومراجعة",
    text: "اختبر فهمك أولًا بأول وراجع قبل أن تنتقل للتالي.",
    tag: "راجع",
    ac: "#7A4FA0", soft: "#EFE6F7", ink: "#563478",
    fd: "6.6s", dl: "-1.3s", rot: "-0.4deg",
    points: ["اختبر فهمك أولًا بأول", "راجع قبل الانتقال للتالي", "ثبّت ما تعلّمته"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.7 2.7L16 9.5" />
      </svg>
    ),
  },
];
/* ------------------------------ teaching drawings ------------------------------ */
const D = (ms) => ({ "--d": `${ms}ms` });
// text size inside the drawings (grows a little on phones through --ts)
const fs = (n) => ({ fontSize: `calc(${n}px * var(--ts, 1))` });
/* 1) visual explainer: media frame + cause → event → effect chain */
function VisualArt({ ac }) {
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label="شرح مرئي: صورة وفيديو ثم سبب وحدث ونتيجة">
      <defs>
        <linearGradient id="msc-v-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2FAF7" />
          <stop offset="1" stopColor="#D5EBE4" />
        </linearGradient>
      </defs>
      <g className="msc-pop" style={D(0)}>
        <rect x="22" y="14" width="230" height="146" rx="18" fill="url(#msc-v-sky)" stroke={ac} strokeWidth="2.5" />
        <circle cx="62" cy="40" r="9" fill="#FFD27A" />
        <g className="msc-spin" style={{ transformOrigin: "137px 82px" }}>
          <ellipse cx="137" cy="82" rx="74" ry="20" fill="none" stroke={ac} strokeWidth="1.6" strokeDasharray="3 6" opacity=".55" transform="rotate(-18 137 82)" />
          <circle cx="205" cy="64" r="5" fill={ac} />
        </g>
        <circle cx="137" cy="82" r="44" fill="#BFE3DA" stroke={ac} strokeWidth="2.2" />
        <path d="M108 70c8-10 20-9 26-3 5 5 1 12-6 13-6 1-8 8-15 6-7-3-10-10-5-16z" fill={ac} opacity=".85" />
        <path d="M146 92c8-4 18-1 20 6 3 8-4 14-11 13-8-1-14-12-9-19z" fill={ac} opacity=".7" />
        <ellipse cx="137" cy="82" rx="19" ry="44" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".6" />
        <path d="M95 82h84" stroke="#fff" strokeWidth="1.4" opacity=".6" />
        <circle className="msc-pulse" cx="52" cy="136" r="15" fill="none" stroke={ac} strokeWidth="2" />
        <circle cx="52" cy="136" r="15" fill={ac} />
        <path d="M48 129l12 7-12 7z" fill="#fff" />
        <rect x="78" y="133" width="158" height="7" rx="3.5" fill="#fff" opacity=".9" />
        <rect className="msc-bar" x="78" y="133" width="158" height="7" rx="3.5" fill={ac} />
      </g>
      <g className="msc-rise" style={D(300)}>
        <rect x="22" y="176" width="70" height="26" rx="13" fill="#fff" stroke={ac} strokeWidth="1.8" />
        <text x="57" y="193.5" textAnchor="middle" style={fs(11.5)} fontWeight="800" fill={INK}>فيديو</text>
        <rect x="100" y="176" width="70" height="26" rx="13" fill="#fff" stroke={ac} strokeWidth="1.8" />
        <text x="135" y="193.5" textAnchor="middle" style={fs(11.5)} fontWeight="800" fill={INK}>صور</text>
        <rect x="178" y="176" width="74" height="26" rx="13" fill="#fff" stroke={ac} strokeWidth="1.8" />
        <text x="215" y="193.5" textAnchor="middle" style={fs(11.5)} fontWeight="800" fill={INK}>شرح</text>
      </g>
      {[
        { y: 12, tag: "السبب", t: "طرق تجارة جديدة", d: 450 },
        { y: 92, tag: "الحدث", t: "رحلات الاستكشاف", d: 650 },
        { y: 172, tag: "النتيجة", t: "خرائط جديدة", d: 850 },
      ].map((n) => (
        <g key={n.tag} className="msc-pop" style={D(n.d)}>
          <rect x="268" y={n.y} width="124" height="46" rx="14" fill="#fff" stroke={ac} strokeWidth="2" />
          <text x="330" y={n.y + 18} textAnchor="middle" style={fs(10.5)} fontWeight="800" fill={ac}>{n.tag}</text>
          <text x="330" y={n.y + 35} textAnchor="middle" style={fs(11.5)} fontWeight="800" fill={INK}>{n.t}</text>
        </g>
      ))}
      <path className="msc-flow" d="M330 58v34" stroke={ac} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M324 86l6 7 6-7" stroke={ac} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path className="msc-flow" d="M330 138v34" stroke={ac} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M324 166l6 7 6-7" stroke={ac} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
/* 2) mind map: one idea, branches grow out of it */
function MindArt({ ac }) {
  const nodes = [
    { x: 39, y: 24, w: 86, t: "الموقع", e: "M170 96 Q140 52 125 41", d: 350 },
    { x: 275, y: 24, w: 86, t: "المظاهر", e: "M230 96 Q262 52 275 41", d: 480 },
    { x: 303, y: 100, w: 90, t: "المناخ", e: "M238 115 Q272 115 303 115", d: 610 },
    { x: 275, y: 176, w: 86, t: "السكان", e: "M230 134 Q262 178 275 191", d: 740 },
    { x: 39, y: 176, w: 86, t: "الموارد", e: "M170 134 Q140 178 125 191", d: 870 },
    { x: 3, y: 100, w: 106, t: "السبب والنتيجة", e: "M164 115 Q134 115 106 115", d: 1000 },
  ];
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label="خريطة ذهنية: فكرة رئيسية تتفرع منها خمسة أفرع">
      <g className="msc-spin-slow" style={{ transformOrigin: "200px 115px" }}>
        <circle cx="200" cy="115" r="78" fill="none" stroke={ac} strokeWidth="1.4" strokeDasharray="2 8" opacity=".5" />
        <circle cx="278" cy="115" r="4.5" fill={ac} opacity=".7" />
      </g>
      {nodes.map((n) => (
        <path key={n.t + "e"} className="msc-draw" pathLength="1" d={n.e} fill="none" stroke={ac} strokeWidth="2.6" strokeLinecap="round" style={D(n.d - 150)} />
      ))}
      <circle className="msc-pulse" cx="200" cy="115" r="38" fill="none" stroke={ac} strokeWidth="2" />
      <g className="msc-pop" style={D(0)}>
        <circle cx="200" cy="115" r="38" fill={ac} />
        <text x="200" y="111" textAnchor="middle" style={fs(13)} fontWeight="800" fill="#fff">العالم</text>
        <text x="200" y="128" textAnchor="middle" style={fs(13)} fontWeight="800" fill="#fff">الجديد</text>
      </g>
      {nodes.map((n) => (
        <g key={n.t} className="msc-pop" style={D(n.d)}>
          <rect x={n.x} y={n.y} width={n.w} height="32" rx="16" fill="#fff" stroke={ac} strokeWidth="2.2" />
          <text x={n.x + n.w / 2} y={n.y + 20.5} textAnchor="middle" style={fs(12)} fontWeight="800" fill={INK}>{n.t}</text>
        </g>
      ))}
      <circle className="msc-pop" style={D(1150)} cx="26" cy="64" r="5" fill={ac} opacity=".55" />
      <circle className="msc-pop" style={D(1250)} cx="378" cy="70" r="4" fill={ac} opacity=".45" />
      <circle className="msc-pop" style={D(1350)} cx="196" cy="214" r="4.5" fill={ac} opacity=".5" />
    </svg>
  );
}
/* 3) timeline: events in order (oldest on the right) with a light marker travelling along */
function TimelineArt({ ac }) {
  const ev = [
    { x: 330, up: true, y: "1492", t: "وصول كولومبس", d: 300 },
    { x: 240, up: false, y: "1519", t: "رحلة ماجلان", d: 500 },
    { x: 150, up: true, y: "1607", t: "تأسيس جيمستاون", d: 700 },
    { x: 60, up: false, y: "1776", t: "إعلان الاستقلال", d: 900 },
  ];
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label="خط زمني بأربعة أحداث مرتبة">
      <path className="msc-draw" pathLength="1" d="M388 118H18" stroke={ac} strokeWidth="4" strokeLinecap="round" fill="none" opacity=".35" />
      <path d="M388 118H18" stroke={ac} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 8" fill="none" />
      <path d="M28 108l-12 10 12 10" stroke={ac} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g className="msc-march">
        <circle cx="372" cy="118" r="13" fill={ac} opacity=".18" />
        <circle cx="372" cy="118" r="5.5" fill={ac} />
      </g>
      {ev.map((e) => {
        const cy = e.up ? 30 : 152;
        return (
          <g key={e.y}>
            <path d={e.up ? `M${e.x} 109V84` : `M${e.x} 127V152`} stroke={ac} strokeWidth="2" strokeDasharray="3 4" opacity=".7" />
            <g className="msc-pop" style={D(e.d)}>
              <circle cx={e.x} cy="118" r="11" fill="#fff" stroke={ac} strokeWidth="3.2" />
              <circle cx={e.x} cy="118" r="4.2" fill={ac} />
            </g>
            <g className="msc-pop" style={D(e.d + 120)}>
              <rect x={e.x - 56} y={cy} width="112" height="54" rx="14" fill="#fff" stroke={ac} strokeWidth="2" />
              <text x={e.x} y={cy + 24} textAnchor="middle" style={fs(16)} fontWeight="900" fill={ac}>{e.y}</text>
              <text x={e.x} y={cy + 42} textAnchor="middle" style={fs(11)} fontWeight="800" fill={INK}>{e.t}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
/* 4) quiz: ask, try, correct answer lights up, progress fills */
function QuizArt({ ac }) {
  const rows = [
    { y: 84, t: "المحيط الأطلسي", cls: "msc-q-wrong" },
    { y: 126, t: "المحيط الهادئ", cls: "msc-q-right" },
    { y: 168, t: "المحيط الهندي", cls: "" },
  ];
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label="سؤال باختيارات والإجابة الصحيحة تُضيء">
      <g className="msc-pop" style={D(0)}>
        <rect x="24" y="12" width="352" height="54" rx="16" fill={ac} />
        <text x="200" y="35" textAnchor="middle" style={fs(11)} fontWeight="800" fill="#fff" opacity=".85">سؤال ١</text>
        <text x="200" y="54" textAnchor="middle" style={fs(13.5)} fontWeight="800" fill="#fff">أي المحيطات يقع غرب أمريكا الجنوبية؟</text>
      </g>
      {rows.map((r, i) => (
        <g key={r.t} className="msc-rise" style={D(250 + i * 140)}>
          <rect className={r.cls} x="24" y={r.y} width="352" height="36" rx="12" fill="#fff" stroke="#DCCFE9" strokeWidth="2" />
          <circle cx="352" cy={r.y + 18} r="9" fill="#fff" stroke="#BBA6D1" strokeWidth="2" />
          <text x="332" y={r.y + 23} textAnchor="start" style={fs(13)} fontWeight="800" fill={INK}>{r.t}</text>
          {r.cls === "msc-q-right" && (
            <g className="msc-q-check">
              <circle cx="352" cy={r.y + 18} r="9" fill="#147A6A" />
              <path d={`M347.5 ${r.y + 18.5}l3.6 3.6 6-6.6`} stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          )}
          {r.cls === "msc-q-right" && (
            <g className="msc-q-chip">
              <rect x="30" y={r.y + 6} width="64" height="24" rx="12" fill="#147A6A" />
              <text x="62" y={r.y + 22.5} textAnchor="middle" style={fs(11.5)} fontWeight="800" fill="#fff">أحسنت!</text>
            </g>
          )}
        </g>
      ))}
      <g className="msc-rise" style={D(900)}>
        <rect x="24" y="214" width="352" height="8" rx="4" fill="#E7DDF1" />
        <rect className="msc-q-fill" x="24" y="214" width="352" height="8" rx="4" fill={ac} />
      </g>
    </svg>
  );
}
const ARTS = { visual: VisualArt, mind: MindArt, timeline: TimelineArt, quiz: QuizArt };
/* ------------------------------ background decoration ------------------------------ */
function Decor() {
  return (
    <div className="msc-decor" aria-hidden="true">
      <div className="msc-gridbg" />
      <div className="msc-glow msc-glow-a" />
      <div className="msc-glow msc-glow-b" />
      <div className="msc-topline" />
      <svg className="msc-orbit" viewBox="0 0 220 220">
        <g className="msc-spin-slow" style={{ transformOrigin: "110px 110px" }}>
          <circle cx="110" cy="110" r="96" fill="none" stroke={TEAL} strokeWidth="1.4" strokeDasharray="3 9" opacity=".35" />
          <circle cx="206" cy="110" r="6" fill={TEAL} opacity=".5" />
        </g>
        <g className="msc-spin-rev" style={{ transformOrigin: "110px 110px" }}>
          <circle cx="110" cy="110" r="64" fill="none" stroke="#C98512" strokeWidth="1.4" strokeDasharray="2 8" opacity=".4" />
          <circle cx="110" cy="46" r="4.5" fill="#C98512" opacity=".6" />
        </g>
        <circle cx="110" cy="110" r="10" fill={TEAL} opacity=".18" />
      </svg>
      <svg className="msc-compass" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#C98512" strokeWidth="1.6" opacity=".35" />
        <circle cx="60" cy="60" r="38" fill="none" stroke="#C98512" strokeWidth="1" strokeDasharray="2 5" opacity=".35" />
        <path d="M60 14v10M60 96v10M14 60h10M96 60h10" stroke="#C98512" strokeWidth="2" strokeLinecap="round" opacity=".45" />
        <g className="msc-sway" style={{ transformOrigin: "60px 60px" }}>
          <path d="M60 28l7 32H53z" fill="#C2562F" opacity=".5" />
          <path d="M60 92l7-32H53z" fill={INK} opacity=".25" />
        </g>
      </svg>
      <span className="msc-spark msc-spark-1" />
      <span className="msc-spark msc-spark-2" />
      <span className="msc-spark msc-spark-3" />
      <span className="msc-spark msc-spark-4" />
    </div>
  );
}
/* ------------------------------ main component ------------------------------ */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", on);
    else mq.addListener(on);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", on);
      else mq.removeListener(on);
    };
  }, []);
  return reduced;
}
function InternalMadarShowcase() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(false);
  const [shown, setShown] = useState(false);
  const [inView, setInView] = useState(false);
  const [geo, setGeo] = useState(null);
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef(null);
  const wrapRef = useRef(null);
  const mainRef = useRef(null);
  const slotRefs = useRef([]);
  const f = FEATURES[active];
  const Art = ARTS[f.id];
  // reveal on scroll + know when it is on screen (auto-rotate only while visible)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          setInView(e.isIntersecting);
          if (e.isIntersecting) setShown(true);
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // gentle auto-rotation until the visitor picks something (timer restarts after every change)
  useEffect(() => {
    if (!auto || reduced || !inView || hover) return undefined;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % FEATURES.length), 7000);
    return () => window.clearTimeout(t);
  }, [auto, reduced, inView, hover, active]);
  // desktop wires: measured from layout (offset* ignores the floating transforms)
  useLayoutEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const main = mainRef.current;
      if (!wrap || !main || window.innerWidth < 1024) {
        setGeo(null);
        return;
      }
      const x1 = main.offsetLeft;
      const y1 = main.offsetTop + main.offsetHeight / 2;
      const paths = slotRefs.current.map((el) => {
        if (!el) return null;
        const x2 = el.offsetLeft + el.offsetWidth;
        const y2 = el.offsetTop + el.offsetHeight / 2;
        const mx = (x1 + x2) / 2;
        return { d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, x2, y2 };
      });
      setGeo({ w: wrap.offsetWidth, h: wrap.offsetHeight, x1, y1, paths });
    };
    measure();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      if (wrapRef.current) ro.observe(wrapRef.current);
      if (mainRef.current) ro.observe(mainRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  function pick(i) {
    setAuto(false);
    setActive(i);
  }
  const vars = { "--ac": f.ac, "--soft": f.soft, "--ink": f.ink };
  return (
    <section ref={rootRef} className={`msc${shown ? " is-in" : ""}`} style={vars} aria-label="أدوات التعلّم في مَدَار">
      <style>{SHOWCASE_CSS}</style>
      <Decor />
      <div className="msc-wrap">
        <header className="msc-head">
          <span className="msc-badge msc-rv" style={{ "--i": 0 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" />
            </svg>
            تعلّم بطريقة تفاعلية
          </span>
          <h2 className="msc-rv" style={{ "--i": 1 }}>أربع أدوات تعمل معًا لتصل إلى الفهم</h2>
          <p className="msc-rv" style={{ "--i": 2 }}>اختر أداة لترى كيف تساعدك داخل الدرس، من الشرح إلى المراجعة.</p>
        </header>
        <div
          ref={wrapRef}
          className="msc-stage"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {geo && (
            <svg className="msc-wires" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
              {geo.paths.map((p, i) => {
                if (!p) return null;
                const on = i === active;
                const c = FEATURES[i].ac;
                return (
                  <g key={FEATURES[i].id}>
                    <path d={p.d} fill="none" stroke={on ? c : INK} strokeOpacity={on ? 0.35 : 0.14} strokeWidth={on ? 3 : 2} strokeDasharray={on ? undefined : "4 7"} className="msc-wire" />
                    {on && <path d={p.d} fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" className="msc-flow-wire" style={{ filter: `drop-shadow(0 0 6px ${c}99)` }} />}
                    <circle cx={p.x2} cy={p.y2} r={on ? 6 : 4} fill="#fff" stroke={on ? c : "#B9CBC6"} strokeWidth="2.4" className="msc-wire-node" />
                  </g>
                );
              })}
              <circle cx={geo.x1} cy={geo.y1} r="7" fill="#fff" stroke={f.ac} strokeWidth="3" className="msc-wire-node" />
            </svg>
          )}
          <article ref={mainRef} id="msc-panel" className="msc-main msc-rv" style={{ "--i": 3 }} aria-live="polite">
            <div className="msc-sheen" aria-hidden="true" />
            <div className="msc-main-top">
              <span className="msc-live"><i aria-hidden="true" />معاينة تفاعلية</span>
              <span className="msc-count">{active + 1} من {FEATURES.length}</span>
            </div>
            <div key={f.id} className="msc-copy">
              <span className="msc-tag">{f.tag}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <ul className="msc-points">
                {f.points.map((p, i) => (
                  <li key={p} style={{ "--k": i }}><i aria-hidden="true" />{p}</li>
                ))}
              </ul>
            </div>
            <div className="msc-canvas">
              <div key={f.id} className="msc-canvas-in">
                <Art ac={f.ac} />
              </div>
            </div>
          </article>
          <div className="msc-vline" aria-hidden="true"><i /></div>
          <div className="msc-cards" role="group" aria-label="اختر أداة">
            {FEATURES.map((x, i) => {
              const on = i === active;
              return (
                <div key={x.id} ref={(el) => { slotRefs.current[i] = el; }} className="msc-slot msc-rv" style={{ "--i": 4 + i }}>
                  <button
                    type="button"
                    className={`msc-card${on ? " is-on" : ""}`}
                    style={{ "--ac": x.ac, "--soft": x.soft, "--ink": x.ink, "--fd": x.fd, "--dl": x.dl, "--rot": x.rot }}
                    aria-pressed={on}
                    aria-controls="msc-panel"
                    onClick={() => pick(i)}
                  >
                    <span className="msc-card-bar" aria-hidden="true" />
                    <span className="msc-card-icon" aria-hidden="true">{x.icon}</span>
                    <span className="msc-card-body">
                      <b>{x.title}</b>
                      <small>{x.text}</small>
                    </span>
                    <span className="msc-card-tag">{x.tag}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <p className="msc-foot msc-rv" style={{ "--i": 9 }}>افهم · اربط · رتّب · راجع — خطوات تمرّ بها مع كل درس</p>
      </div>
    </section>
  );
}
/* ------------------------------ styles ------------------------------ */
const SHOWCASE_CSS = `
.msc { --ac: ${TEAL}; --soft: #E2F3EE; --ink: ${INK};
  position: relative; isolation: isolate; overflow: hidden; margin: 56px 0 8px; padding: 54px 0 46px;
  border-radius: 36px; border: 2px solid #EFE3C8; color: ${INK};
  background: linear-gradient(180deg, #FFFCF4 0%, #FFF6E3 100%); text-align: start; }
.msc *, .msc *::before, .msc *::after { box-sizing: border-box; }
.msc-wrap { position: relative; z-index: 2; width: 100%; max-width: 1120px; margin: 0 auto; padding: 0 20px; }
/* ---- decoration ---- */
.msc-decor { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.msc-gridbg { position: absolute; inset: 0; opacity: .9;
  background-image: linear-gradient(rgba(20,122,106,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(20,122,106,.09) 1px, transparent 1px);
  background-size: 38px 38px;
  -webkit-mask-image: radial-gradient(ellipse 75% 70% at 50% 45%, #000 20%, transparent 78%);
  mask-image: radial-gradient(ellipse 75% 70% at 50% 45%, #000 20%, transparent 78%); }
.msc-glow { position: absolute; border-radius: 50%; filter: blur(60px); transition: background .8s ease; }
.msc-glow-a { width: 340px; height: 340px; top: -90px; inset-inline-start: -60px; background: rgba(20,122,106,.14); }
.msc-glow-b { width: 360px; height: 360px; bottom: -120px; inset-inline-end: -70px; background: var(--ac); opacity: .2; }
.msc-topline { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(20,122,106,.45), transparent); }
.msc-orbit { position: absolute; width: 220px; height: 220px; top: 18px; inset-inline-end: 22px; opacity: .8; }
.msc-compass { position: absolute; width: 120px; height: 120px; bottom: 22px; inset-inline-end: 26px; }
.msc-spark { position: absolute; width: 9px; height: 9px; border-radius: 3px; background: #C98512; opacity: .5; transform: rotate(45deg); animation: msc-twinkle 4.8s ease-in-out infinite; }
.msc-spark-1 { top: 120px; inset-inline-start: 7%; }
.msc-spark-2 { top: 64px; inset-inline-start: 38%; background: ${TEAL}; animation-delay: -1.6s; }
.msc-spark-3 { bottom: 90px; inset-inline-end: 9%; background: #C2562F; animation-delay: -3s; }
.msc-spark-4 { bottom: 40px; inset-inline-end: 40%; animation-delay: -2.2s; }
/* ---- heading ---- */
.msc-head { text-align: center; max-width: 720px; margin: 0 auto 40px; }
.msc-badge { display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; border-radius: 999px; font-size: .8rem; font-weight: 800;
  color: ${TEAL}; background: rgba(20,122,106,.08); border: 1.5px solid rgba(20,122,106,.22); }
.msc-badge svg { animation: msc-pulse-soft 2.4s ease-in-out infinite; }
.msc .msc-head h2 { margin: 16px 0 10px; font-family: var(--duo-font-display, inherit); font-size: clamp(1.6rem, 4.4vw, 2.5rem); font-weight: 900; line-height: 1.25; color: ${INK}; }
.msc .msc-head p { margin: 0; font-size: 1rem; line-height: 1.9; color: #5C6B66; }
/* ---- stage layout ---- */
.msc-stage { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; }
.msc-wires { position: absolute; left: 0; top: 0; z-index: 6; pointer-events: none; overflow: visible; display: none; }
.msc-vline { display: flex; justify-content: center; order: 2; height: 26px; }
.msc-vline i { width: 4px; height: 100%; border-radius: 4px; background: linear-gradient(180deg, transparent, var(--ac), transparent); background-size: 100% 220%; animation: msc-vflow 1.8s linear infinite; transition: background .5s; }
.msc-cards { order: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.msc-main { order: 3; }
@media (min-width: 1024px) {
  .msc-stage { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); column-gap: 84px; align-items: stretch; }
  .msc-wires { display: block; }
  .msc-vline { display: none; }
  .msc-main { order: 1; }
  .msc-cards { order: 2; grid-template-columns: minmax(0, 1fr); gap: 16px; align-content: center; }
}
/* ---- main card ---- */
.msc-main { position: relative; z-index: 3; overflow: hidden; padding: 22px 20px 20px; border-radius: 30px; background: rgba(255,255,255,.92);
  border: 2px solid #E3D8BE; box-shadow: 0 18px 44px -18px rgba(14,83,72,.35), 0 5px 0 #EFE3C8;
  border-color: color-mix(in srgb, var(--ac) 32%, #EFE3C8); box-shadow: 0 18px 44px -18px color-mix(in srgb, var(--ac) 45%, transparent), 0 5px 0 color-mix(in srgb, var(--ac) 22%, #EFE3C8);
  transition: border-color .5s ease, box-shadow .5s ease; }
.msc-sheen { position: absolute; inset: 0; pointer-events: none; opacity: .55;
  background: radial-gradient(520px 220px at 85% -10%, rgba(20,122,106,.14), transparent 70%);
  background: radial-gradient(520px 220px at 85% -10%, color-mix(in srgb, var(--ac) 16%, transparent), transparent 70%); transition: background .6s ease; }
.msc-main-top { position: relative; display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; margin-bottom: 14px; border-bottom: 1.5px solid #F0E7D3; }
.msc-live { display: inline-flex; align-items: center; gap: 9px; font-size: .86rem; font-weight: 800; color: #5C6B66; }
.msc-live i { position: relative; width: 10px; height: 10px; border-radius: 50%; background: var(--ac); transition: background .5s; }
.msc-live i::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--ac); animation: msc-ping 1.9s ease-out infinite; }
.msc-count { padding: 3px 11px; border-radius: 999px; font-size: .78rem; font-weight: 800; color: var(--ink); background: var(--soft); transition: background .5s, color .5s; }
.msc-copy { position: relative; animation: msc-swap .5s ease both; }
.msc-tag { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: .76rem; font-weight: 900; color: #fff; background: var(--ac); transition: background .5s; }
.msc .msc-copy h3 { margin: 10px 0 6px; font-family: var(--duo-font-display, inherit); font-size: clamp(1.35rem, 3vw, 1.8rem); font-weight: 900; line-height: 1.3; color: var(--ink); transition: color .5s; }
.msc .msc-copy p { margin: 0; font-size: 1rem; line-height: 1.85; color: #4F5E59; }
.msc-points { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.msc-points li { display: inline-flex; align-items: center; gap: 8px; padding: 6px 13px; border-radius: 999px; font-size: .84rem; font-weight: 700; color: var(--ink); background: var(--soft);
  animation: msc-rise-in .5s ease both; animation-delay: calc(var(--k) * 90ms + 120ms); transition: background .5s, color .5s; }
.msc-points li i { width: 7px; height: 7px; border-radius: 50%; background: var(--ac); flex: none; }
.msc-canvas { position: relative; margin-top: 18px; border-radius: 22px; padding: 10px; background: var(--soft); border: 1.5px solid rgba(20,122,106,.2); transition: background .5s, border-color .5s;
  background-image: radial-gradient(circle at 1px 1px, rgba(20,122,106,.2) 1px, transparent 1.4px); background-size: 18px 18px;
  border-color: color-mix(in srgb, var(--ac) 22%, transparent);
  background-image: radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ac) 22%, transparent) 1px, transparent 1.4px); }
.msc-canvas-in { animation: msc-swap .55s ease both; }
.msc-canvas { --ts: 1; }
.msc-art { display: block; width: 100%; height: auto; font-family: inherit; direction: rtl; overflow: visible; }
/* ---- tool cards ---- */
.msc-slot { position: relative; }
.msc-card { position: relative; display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px 18px; border-radius: 24px; text-align: start; cursor: pointer; font: inherit; color: inherit;
  background: rgba(255,255,255,.94); border: 2px solid #EDE3CB; box-shadow: 0 4px 0 #EDE3CB, 0 12px 26px -16px rgba(14,83,72,.35);
  animation: msc-float var(--fd, 6s) ease-in-out var(--dl, 0s) infinite; will-change: transform;
  transition: border-color .35s, box-shadow .35s, background .35s; }
.msc-card:hover { border-color: var(--ac); }
.msc-card:focus-visible { outline: 3px solid rgba(20,122,106,.5); outline: 3px solid color-mix(in srgb, var(--ac) 55%, transparent); outline-offset: 3px; }
.msc-card.is-on { background: #fff; border-color: var(--ac); box-shadow: 0 5px 0 var(--ac), 0 18px 34px -16px rgba(14,83,72,.45); box-shadow: 0 5px 0 var(--ac), 0 18px 34px -16px color-mix(in srgb, var(--ac) 60%, transparent); }
.msc-card-bar { position: absolute; inset-block: 14px; inset-inline-start: 0; width: 5px; border-radius: 5px 0 0 5px; background: var(--ac); transform: scaleY(0); transition: transform .4s ease; }
.msc-card.is-on .msc-card-bar { transform: scaleY(1); }
.msc-card-icon { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; border-radius: 16px; color: var(--ink); background: var(--soft); transition: background .35s, color .35s, transform .35s; }
.msc-card-icon svg { width: 25px; height: 25px; }
.msc-card.is-on .msc-card-icon { color: #fff; background: var(--ac); transform: rotate(-4deg) scale(1.05); }
.msc-card-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1 1 auto; }
.msc-card-body b { font-family: var(--duo-font-display, inherit); font-size: 1.02rem; font-weight: 900; color: var(--ink); line-height: 1.3; }
.msc-card-body small { font-size: .8rem; line-height: 1.65; color: #5C6B66; }
.msc-card-tag { position: absolute; top: 12px; inset-inline-end: 14px; font-size: .68rem; font-weight: 800; color: var(--ac); opacity: .85; }
.msc-card-body { padding-inline-end: 34px; }
@media (max-width: 1023px) {
  .msc { margin-top: 40px; padding: 40px 0 34px; border-radius: 28px; }
  .msc-card { flex-direction: column; align-items: flex-start; gap: 10px; padding: 14px 14px 13px; border-radius: 20px; animation-duration: calc(var(--fd, 6s) * 1.2); }
  .msc-card-icon { width: 42px; height: 42px; border-radius: 14px; }
  .msc-card-icon svg { width: 22px; height: 22px; }
  .msc-card-body { padding-inline-end: 0; }
  .msc-card-body small { display: none; }
  .msc-card-body b { font-size: .95rem; }
  .msc-card-bar { display: none; }
  .msc-orbit { width: 150px; height: 150px; top: 8px; opacity: .6; }
  .msc-compass { display: none; }
}
@media (max-width: 520px) {
  .msc-canvas { --ts: 1.2; }
  .msc-wrap { padding: 0 14px; }
  .msc-main { padding: 18px 14px 14px; border-radius: 24px; }
  .msc-canvas { padding: 6px; border-radius: 18px; }
  .msc-points li { font-size: .8rem; }
}
.msc-foot { margin: 34px 0 0; text-align: center; font-size: .92rem; font-weight: 800; color: #5C6B66; }
/* ---- reveal on scroll ---- */
.msc .msc-rv { opacity: 0; transform: translateY(18px); }
.msc.is-in .msc-rv { animation: msc-rise-in .65s cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i, 0) * 90ms); }
/* ---- wires ---- */
.msc-flow-wire { stroke-dasharray: 12 16; animation: msc-dash 1.1s linear infinite; }
.msc-wire, .msc-wire-node { transition: stroke .5s, stroke-opacity .5s; }
/* ---- drawing animations (everything is visible by default; keyframes only animate from hidden) ---- */
.msc-art .msc-pop { transform-box: fill-box; transform-origin: center; animation: msc-pop .55s cubic-bezier(.34,1.56,.64,1) both; animation-delay: var(--d, 0ms); }
.msc-art .msc-rise { animation: msc-rise-in .6s ease both; animation-delay: var(--d, 0ms); }
.msc-art .msc-draw { animation: msc-draw .8s ease both; animation-delay: var(--d, 0ms); }
.msc-art .msc-flow { stroke-dasharray: 5 7; animation: msc-dash 1.2s linear infinite; }
.msc-art .msc-pulse { transform-box: fill-box; transform-origin: center; animation: msc-ring 2.2s ease-out infinite; }
.msc-art .msc-bar { transform-box: fill-box; transform-origin: 100% 50%; animation: msc-fill 5.5s ease-in-out infinite; }
.msc-art .msc-spin { animation: msc-rot 22s linear infinite; }
.msc-art .msc-spin-slow, .msc-orbit .msc-spin-slow { animation: msc-rot 38s linear infinite; }
.msc-orbit .msc-spin-rev { animation: msc-rot 26s linear infinite reverse; }
.msc-compass .msc-sway { animation: msc-sway 7s ease-in-out infinite; }
.msc-art .msc-march { animation: msc-march 6s cubic-bezier(.45,.05,.55,.95) 1.2s infinite; }
.msc-art .msc-q-wrong { animation: msc-q-wrong 9s ease-in-out infinite; }
.msc-art .msc-q-right { animation: msc-q-right 9s ease-in-out infinite; }
.msc-art .msc-q-check { transform-box: fill-box; transform-origin: center; animation: msc-q-pop 9s ease-in-out infinite; }
.msc-art .msc-q-chip { transform-box: fill-box; transform-origin: center; animation: msc-q-pop 9s ease-in-out infinite; }
.msc-art .msc-q-fill { transform-box: fill-box; transform-origin: 100% 50%; animation: msc-q-fill 9s ease-in-out infinite; }
@keyframes msc-rise-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes msc-swap { from { opacity: 0; transform: translateY(10px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes msc-pop { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: scale(1); } }
@keyframes msc-draw { from { stroke-dasharray: 1; stroke-dashoffset: 1; } to { stroke-dasharray: 1; stroke-dashoffset: 0; } }
@keyframes msc-float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-7px) rotate(var(--rot, .3deg)); } }
@keyframes msc-dash { to { stroke-dashoffset: -56; } }
@keyframes msc-vflow { from { background-position: 0 220%; } to { background-position: 0 -120%; } }
@keyframes msc-ping { 0% { transform: scale(1); opacity: .7; } 80%, 100% { transform: scale(2.7); opacity: 0; } }
@keyframes msc-ring { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(1.9); opacity: 0; } }
@keyframes msc-fill { 0% { transform: scaleX(.05); } 80%, 100% { transform: scaleX(1); } }
@keyframes msc-rot { to { transform: rotate(360deg); } }
@keyframes msc-sway { 0%, 100% { transform: rotate(-14deg); } 50% { transform: rotate(18deg); } }
@keyframes msc-twinkle { 0%, 100% { opacity: .15; transform: rotate(45deg) scale(.7); } 50% { opacity: .65; transform: rotate(45deg) scale(1.15); } }
@keyframes msc-pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
@keyframes msc-march { 0% { transform: translateX(0); } 100% { transform: translateX(-340px); } }
@keyframes msc-q-wrong { 0%, 14% { fill: #fff; stroke: #DCCFE9; } 20%, 34% { fill: #FBE7DE; stroke: #C2562F; } 42%, 100% { fill: #fff; stroke: #DCCFE9; } }
@keyframes msc-q-right { 0%, 40% { fill: #fff; stroke: #DCCFE9; } 46%, 92% { fill: #E1F2EC; stroke: #147A6A; } 100% { fill: #fff; stroke: #DCCFE9; } }
@keyframes msc-q-pop { 0%, 42% { opacity: 0; transform: scale(.4); } 50%, 92% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(.4); } }
@keyframes msc-q-fill { 0%, 40% { transform: scaleX(.34); } 50%, 92% { transform: scaleX(.67); } 100% { transform: scaleX(.34); } }
/* ---- reduced motion: nothing moves, nothing is hidden ---- */
@media (prefers-reduced-motion: reduce) {
  .msc *, .msc *::before, .msc *::after { animation: none !important; transition: none !important; }
  .msc .msc-rv { opacity: 1; transform: none; }
  .msc-art .msc-q-right { fill: #E1F2EC; stroke: #147A6A; }
  .msc-art .msc-q-fill { transform: scaleX(.67); }
  .msc-art .msc-bar { transform: scaleX(.6); }
}
`;


export default function LandingPage() {
  const navigate = useNavigate();
  const session = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [dark, toggleDark] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // 3D Parallax Tilt Effect for Demo Card
  const demoCardRef = useRef(null);
  const handleMouseMove = (e) => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const card = demoCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 12;
    const rotateY = (x / rect.width) * 12;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
  };

  const handleMouseLeave = () => {
    const card = demoCardRef.current;
    if (card) {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }
  };

  function startLearning() {
    navigate("/student");
  }

  function scrollToFeatures() {
    document.getElementById("features")?.scrollIntoView({
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }

  return (
    <div
      className={`lp-root${dark ? " is-dark" : ""}`}
      dir="rtl"
      data-theme={dark ? "dark" : "light"}
    >
      {/* Dynamic Background Ambient Elements */}
      <div className="lp-ambient-bg" aria-hidden="true">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-grid-pattern" />
      </div>

      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-header-start">
            <Link to="/about" className="lp-logo" aria-label="مَدَار — صفحة التعريف">
              <div className="lp-logo-glow" />
              <img src="/photo/IevsR.png" alt="مَدَار" className="lp-logo-img" />
            </Link>

            <nav className="lp-nav-desk" aria-label="روابط رئيسية">
              <Link to="/student" className="lp-nav-link">المناهج</Link>
              <a
                href="#features"
                className="lp-nav-link"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToFeatures();
                }}
              >
                طريقة التعلُّم
              </a>
              <Link to="/student/about" className="lp-nav-link">عن مَدَار</Link>
            </nav>
          </div>

          <div className="lp-header-end">
            <button
              type="button"
              className="lp-icon-btn"
              onClick={toggleDark}
              aria-label={dark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
              title={dark ? "الوضع الفاتح" : "الوضع الداكن"}
            >
              <ThemeIcon dark={dark} />
            </button>

            {session ? (
              <Link to="/student" className="lp-btn lp-btn-ghost">منصتي</Link>
            ) : (
              <button
                type="button"
                className="lp-btn lp-btn-ghost"
                onClick={() => setAuthOpen(true)}
              >
                تسجيل الدخول
              </button>
            )}

            <button
              type="button"
              className="lp-menu-btn"
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lp-menu-mobile" role="navigation" aria-label="قائمة الموبايل">
            <Link to="/student" className="lp-menu-item" onClick={() => setMenuOpen(false)}>المناهج</Link>
            <button type="button" className="lp-menu-item" onClick={() => { setMenuOpen(false); scrollToFeatures(); }}>طريقة التعلُّم</button>
            <Link to="/student/about" className="lp-menu-item" onClick={() => setMenuOpen(false)}>عن مَدَار</Link>
            <Link to="/student/privacy" className="lp-menu-item" onClick={() => setMenuOpen(false)}>الخصوصية</Link>
          </div>
        )}
      </header>

      <main>
        <HeroSection theme={dark ? "dark" : "light"} onStart={startLearning} onFeatures={scrollToFeatures} />

        <section className="lp-highlight-section" aria-labelledby="lp-highlight-title">
          <div className="lp-highlight-card">
            <div className="lp-highlight-glow" aria-hidden="true" />

            <div className="lp-highlight-content">
              <div className="lp-highlight-copy">
                <span className="lp-badge">
                  <span className="lp-badge-dot" />
                  فهم حقيقي لا حفظ
                </span>

                <h2 id="lp-highlight-title" className="lp-highlight-title">
                  <span className="lp-highlight-em">افهمها</span>
                  {" — واربط المعلومات ببعضها"}
                </h2>

                <p className="lp-highlight-description">
                  مَدَار تساعدك على فهم أحداث التاريخ وأسرار الجغرافيا بطريقة
                  مبسّطة ومرئية، وتربط الأسباب بالنتائج؛ حتى تستوعب الدرس
                  وتستطيع الإجابة عن سؤال: لماذا؟ لا مجرد حفظ الإجابة.
                </p>

                <ul className="lp-benefits">
                  <li>
                    <span className="lp-check">✓</span>
                    <span>افهم أسباب الأحداث التاريخية ونتائجها بدل حفظها دون ترابط.</span>
                  </li>
                  <li>
                    <span className="lp-check">✓</span>
                    <span>اربط المعلومات الجغرافية وافهم أهمية المواقع والموارد والممرات المائية.</span>
                  </li>
                  <li>
                    <span className="lp-check">✓</span>
                    <span>راجع أفكار الدرس وعلاقاته من خلال الشرح المرئي والخرائط الذهنية والأسئلة، وفقًا للمحتوى المتاح فعلًا في المنصة.</span>
                  </li>
                </ul>
              </div>

              <div className="lp-demo-wrap" dir="rtl">
                <div className="lp-float-label lp-float-label-top" aria-hidden="true">
                  <span className="lp-float-icon lp-icon-map">🗺️</span>
                  <span>فهم الأسباب والنتائج</span>
                </div>

                <div className="lp-float-label lp-float-label-bottom" aria-hidden="true">
                  <span className="lp-float-icon lp-icon-link">🔗</span>
                  <span>ربط المعلومات ببعضها</span>
                </div>

                <div className="lp-float-label lp-float-label-side" aria-hidden="true">
                  <span className="lp-float-icon lp-icon-mind">🧠</span>
                  <span>خرائط ذهنية ومراجعة</span>
                </div>

                <article
                  className="lp-demo-card"
                  ref={demoCardRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="lp-demo-header">
                    <span className="lp-demo-logo">🌐</span>
                    <div>
                      <h3>توضيح جغرافي وتاريخي</h3>
                      <p>دراسات اجتماعية إعدادية · ربط الموقع والتجارة</p>
                    </div>
                  </div>

                  <div className="lp-demo-body">
                    <div className="lp-chat-row">
                      <span className="lp-chat-icon lp-question-icon">❓</span>
                      <p className="lp-question-bubble">ليه قناة بنما مهمة للتجارة العالمية؟</p>
                    </div>

                    <div className="lp-chat-row lp-answer-row">
                      <span className="lp-chat-icon lp-answer-icon">💡</span>
                      <p className="lp-answer-bubble">لأنها تربط بين المحيط الأطلنطي والمحيط الهادي.</p>
                    </div>

                    <div className="lp-result-card">
                      <strong>🚢 النتيجة الملاحية</strong>
                      <p>بتساعد على اختصار مسافات الرحلات البحرية.</p>
                      <small>✨ فهم العلاقة بين الموقع والملاحة والتجارة.</small>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-video-section" aria-labelledby="lp-video-title">
          <div className="lp-video-card">
            <div className="lp-video-copy">
              <span className="lp-video-badge">
                <span className="lp-video-badge-dot" aria-hidden="true" />
                شرح بالفيديو
              </span>
              <h2 id="lp-video-title" className="lp-video-title">
                ابدأ الدرس بمشاهدة الشرح
              </h2>
              <p className="lp-video-desc">
                شاهد فيديو الشرح الموجود داخل الدرس، وافهم الأفكار الأساسية بطريقة
                مبسّطة قبل أن تبدأ باستكشاف المحتوى وربط المعلومات ببعضها.
              </p>
              <ul className="lp-video-points">
                <li>
                  <span className="lp-video-check" aria-hidden="true">✓</span>
                  <span>الفيديو جزء من صفحة الدرس نفسها، وليس رابطًا خارجيًا منفصلًا.</span>
                </li>
                <li>
                  <span className="lp-video-check" aria-hidden="true">✓</span>
                  <span>بعد المشاهدة تنتقل بسلاسة إلى الشرح المكتوب والخرائط والأسئلة.</span>
                </li>
              </ul>
            </div>

            <div className="lp-video-visual" aria-hidden="true">
              <div className="lp-video-frame">
                <div className="lp-video-screen">
                  <div className="lp-video-play-wrap">
                    <div className="lp-video-play-pulse" />
                    <div className="lp-video-play">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="lp-video-bars">
                    <i /><i /><i /><i /><i />
                  </div>
                </div>
                <div className="lp-video-caption">
                  <span className="lp-video-caption-title">فيديو الشرح</span>
                  <span className="lp-video-caption-sub">داخل صفحة الدرس · مَدَار</span>
                </div>
              </div>
              <div className="lp-video-chip lp-video-chip--a">▶ ابدأ المشاهدة</div>
              <div className="lp-video-chip lp-video-chip--b">ثم استكشف المحتوى</div>
            </div>
          </div>
        </section>

        <section className="lp-diff-section" aria-labelledby="lp-diff-title">
          <div className="lp-diff-head">
            <h2 id="lp-diff-title" className="lp-diff-title">
              إيه اللي بيميّز تجربة التعلّم في مَدَار؟
            </h2>
            <p className="lp-diff-lead">
              مش مجرد منصة لعرض الدروس؛ تجربة تعليمية تساعدك تفهم المعلومات،
              وتربطها ببعضها، وتراجعها بطريقة أوضح.
            </p>
          </div>

          <div className="lp-diff-grid">
            <article className="lp-diff-card lp-diff-card--a">
              <div className="lp-diff-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm1 4v5.4l3.3 2-1 1.6L11 13V7h2z" />
                </svg>
              </div>
              <span className="lp-diff-num" aria-hidden="true">01</span>
              <div className="lp-diff-body">
                <span className="lp-diff-tag">فهم</span>
                <h3 className="lp-diff-card-title">افهم الدرس قبل ما تحفظه</h3>
                <p className="lp-diff-card-text">
                  نساعدك تفهم أسباب الأحداث ونتائجها، وتربط المعلومات ببعضها
                  حتى تستوعب الدرس بصورة أوضح.
                </p>
              </div>
            </article>

            <article className="lp-diff-card lp-diff-card--b">
              <div className="lp-diff-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12 2a3 3 0 0 1 3 3c0 .9-.4 1.7-1 2.2V9h2a3 3 0 1 1 0 6h-2v1.8c.6.5 1 1.3 1 2.2a3 3 0 1 1-6 0c0-.9.4-1.7 1-2.2V15H8a3 3 0 1 1 0-6h2V7.2C9.4 6.7 9 5.9 9 5a3 3 0 0 1 3-3z" />
                </svg>
              </div>
              <span className="lp-diff-num" aria-hidden="true">02</span>
              <div className="lp-diff-body">
                <span className="lp-diff-tag">مرئي</span>
                <h3 className="lp-diff-card-title">حوّل المعلومات لصورة واضحة</h3>
                <p className="lp-diff-card-text">
                  استخدم الشرح المرئي المبسّط والخرائط الذهنية والخطوط الزمنية
                  لتنظيم المعلومات وفهم العلاقات بينها.
                </p>
              </div>
            </article>

            <article className="lp-diff-card lp-diff-card--c">
              <div className="lp-diff-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M9 21h6v-1.5H9V21zM12 2a7 7 0 0 1 4 12.7V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.3A7 7 0 0 1 12 2zm0 2a5 5 0 0 0-2.7 9.2l.7.5V16h4v-2.3l.7-.5A5 5 0 0 0 12 4z" />
                </svg>
              </div>
              <span className="lp-diff-num" aria-hidden="true">03</span>
              <div className="lp-diff-body">
                <span className="lp-diff-tag">تفاعلي</span>
                <h3 className="lp-diff-card-title">مرّر، اكتشف، وافهم أكتر</h3>
                <p className="lp-diff-card-text">
                  مرّر على الكلمات التفاعلية داخل الدرس لاكتشاف شروحات مرتبطة،
                  ومعلومات إضافية، وخرائط وصور توضّح المعنى وتساعدك على ربط
                  المعلومات ببعضها.
                </p>
              </div>
            </article>

            <article className="lp-diff-card lp-diff-card--d">
              <div className="lp-diff-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M11 18h2v-2h-2v2zm1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2 2 2 0 0 1 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4z" />
                </svg>
              </div>
              <span className="lp-diff-num" aria-hidden="true">04</span>
              <div className="lp-diff-body">
                <span className="lp-diff-tag">مراجعة</span>
                <h3 className="lp-diff-card-title">اختبر فهمك وراجع معلوماتك</h3>
                <p className="lp-diff-card-text">
                  استفد من الأسئلة والمراجعة المتاحة داخل الدروس لتقيّم فهمك
                  وتعرف ما الذي يحتاج إلى مراجعة.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section id="features" className="lp-showcase-wrap" aria-label="مميزات مَدَار">
          <InternalMadarShowcase />
        </section>
      </main>

        <section className="lp-final-cta" aria-labelledby="lp-final-cta-title">
          <div className="lp-final-cta-card">
            <span className="lp-final-cta-cap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
              </svg>
            </span>
            <h2 id="lp-final-cta-title" className="lp-final-cta-title">جاهز تبدأ رحلتك في التعلّم؟</h2>
            <p className="lp-final-cta-lead">
              ادخل إلى واجهة الطالب واختر صفك الدراسي لتبدأ مسارك التعليمي المنظم.
            </p>
            <button type="button" className="lp-final-cta-btn" onClick={startLearning}>
              ابدأ التعلّم الآن
            </button>
            <div className="lp-final-cta-pills" aria-hidden="true">
              <span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg> فهم لا حفظ</span>
              <span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> لكل الطلاب</span>
              <span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> منهج متكامل</span>
            </div>
          </div>
        </section>

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <style>{HERO_CSS}</style>
      <style>{SHOWCASE_CSS}</style>
      <style>{LP_CSS}</style>
    </div>
  );
}

const LP_CSS = `
  .lp-root { --duo-green: #147A6A; --duo-green-ink: #0E5348; --duo-green-soft: #E2F3EE; --duo-line: #DED4BD; --duo-surface: #FFFFFF; --duo-bg: #FFFCF4; --duo-bg-alt: #FFF6E3; --duo-ink: #263B35; --duo-ink-soft: #40544D; --duo-muted: #5C6B66; --duo-font-display: inherit; }
  .lp-root.is-dark { --duo-green: #55B9A7; --duo-green-ink: #A3E0D3; --duo-green-soft: #183A34; --duo-line: #344943; --duo-surface: #192723; --duo-bg: #111B18; --duo-bg-alt: #17231F; --duo-ink: #E9F2EF; --duo-ink-soft: #D1E0DB; --duo-muted: #A4B8B0; }
  .lp-root.is-dark .msc { background: linear-gradient(180deg, #182823 0%, #14211D 100%); border-color: #344943; color: #E9F2EF; }
  .lp-root.is-dark .msc .msc-head h2 { color: #E9F2EF; }
  .lp-root.is-dark .msc .msc-head p, .lp-root.is-dark .msc-foot { color: #A4B8B0; }
  .lp-root.is-dark .msc-main { background: rgba(25,39,35,.96); border-color: color-mix(in srgb, var(--ac) 40%, #344943); }
  .lp-root.is-dark .msc-card { background: #1B2D27; border-color: #344943; box-shadow: 0 4px 0 #263B33, 0 12px 26px -16px rgba(0,0,0,.4); }
  .lp-root.is-dark .msc-card.is-on { background: #20372F; }
  .lp-root.is-dark .msc-card-body b, .lp-root.is-dark .msc-copy h3 { color: #E9F2EF; }
  .lp-root.is-dark .msc-card-body small, .lp-root.is-dark .msc-copy p { color: #B3C4BD; }
  .lp-root.is-dark .msc-main-top { border-color: #344943; }
  .lp-root.is-dark .msc-canvas { background-color: #20372F; }

  .hero-btn { font: inherit; cursor: pointer; }
  .hero-btn-primary, .hero-btn-secondary { border: 0; }
  .hero-btn-secondary { border: 2px solid var(--duo-line); }

  /* Keyframes for smooth entrance & ambient motions */
  @keyframes lpFadeInUp {
    from { opacity: 0; transform: translateY(22px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes lpOrbRotate {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(40px, -30px) rotate(180deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }

  @keyframes lpPulseGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.08); }
  }

  @keyframes lpFloat3D {
    0% { transform: translate(-50%, -50%) rotate(var(--srot)) translateY(0px) translateZ(0px); }
    50% { transform: translate(-50%, -50%) rotate(var(--srot)) translateY(-10px) translateZ(15px); }
    100% { transform: translate(-50%, -50%) rotate(var(--srot)) translateY(0px) translateZ(0px); }
  }

  @keyframes lpFloatLabel {
    0%, 100% { transform: translateY(0) translateZ(20px); }
    50% { transform: translateY(-6px) translateZ(28px); }
  }

  @keyframes lpVideoPulse {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.6); opacity: 0; }
  }

  /* Root styles & Premium Theme Design */
  .lp-root {
    --lp-bg: #FAF6ED;
    --lp-surface: #FFFFFF;
    --lp-surface-soft: #F4EFE2;
    --lp-text: #1C2D28;
    --lp-muted: #596D66;
    --lp-teal: #147A6A;
    --lp-teal-deep: #0E5348;
    --lp-gold: #B9791F;
    --lp-line: rgba(222, 212, 189, 0.7);
    --lp-line-strong: #DED4BD;
    --lp-soft-accent: rgba(20, 122, 106, 0.08);
    --lp-card-shadow: 0 20px 40px -15px rgba(14, 83, 72, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
    --lp-card-shadow-hover: 0 30px 60px -20px rgba(14, 83, 72, 0.18), 0 12px 24px -8px rgba(20, 122, 106, 0.12);
    --lp-glass-bg: rgba(255, 255, 255, 0.82);

    position: relative;
    min-height: 100vh;
    overflow-x: clip;
    color: var(--lp-text);
    background-color: var(--lp-bg);
    font-family: "Cairo", "Segoe UI", system-ui, -apple-system, sans-serif;
    direction: rtl;
    color-scheme: light;
    transition: background-color .3s cubic-bezier(0.16, 1, 0.3, 1), color .3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .lp-root.is-dark {
    --lp-bg: #0C1412;
    --lp-surface: #14211D;
    --lp-surface-soft: #1A2C27;
    --lp-text: #ECF4F0;
    --lp-muted: #9BB0A7;
    --lp-teal: #3A9C89;
    --lp-teal-deep: #8CE0CE;
    --lp-gold: #D69336;
    --lp-line: rgba(48, 66, 59, 0.7);
    --lp-line-strong: #2C3E37;
    --lp-soft-accent: rgba(58, 156, 137, 0.12);
    --lp-card-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    --lp-card-shadow-hover: 0 30px 60px -20px rgba(0, 0, 0, 0.75), 0 0 20px rgba(58, 156, 137, 0.15);
    --lp-glass-bg: rgba(20, 33, 29, 0.85);

    color-scheme: dark;
  }

  .lp-root *, .lp-root *::before, .lp-root *::after {
    box-sizing: border-box;
  }

  /* Ambient Dynamic Background */
  .lp-ambient-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .lp-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.6;
    animation: lpOrbRotate 22s ease-in-out infinite alternate;
  }

  .lp-orb-1 {
    top: -12rem;
    left: 50%;
    transform: translateX(-50%);
    width: 45rem;
    height: 45rem;
    background: radial-gradient(circle, var(--lp-soft-accent) 0%, rgba(20, 122, 106, 0.02) 70%, transparent 100%);
  }

  .lp-orb-2 {
    top: 25rem;
    right: -10rem;
    width: 35rem;
    height: 35rem;
    background: radial-gradient(circle, rgba(185, 121, 31, 0.08) 0%, transparent 70%);
    animation-delay: -7s;
  }

  .lp-grid-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(var(--lp-line) 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.25;
    mask-image: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%);
  }

  /* Header & Navigation */
  .lp-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--lp-glass-bg);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid var(--lp-line);
    transition: background .3s ease, border-color .3s ease;
  }

  .lp-header-inner {
    max-width: 1140px;
    margin: 0 auto;
    padding: .7rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .lp-header-start, .lp-header-end {
    display: flex;
    align-items: center;
    gap: .85rem;
  }

  .lp-logo {
    position: relative;
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    padding: .2rem;
  }

  .lp-logo-glow {
    position: absolute;
    inset: -4px;
    background: radial-gradient(circle, var(--lp-soft-accent), transparent 70%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity .3s ease;
  }

  .lp-logo:hover .lp-logo-glow { opacity: 1; }
  .lp-logo-img { height: 38px; width: auto; object-fit: contain; transform: translateZ(0); transition: transform .25s ease; }
  .lp-logo:hover .lp-logo-img { transform: scale(1.04); }

  .lp-nav-desk { display: none; gap: .4rem; }
  @media (min-width: 860px) { .lp-nav-desk { display: flex; } }

  .lp-nav-link {
    padding: .5rem .85rem;
    border-radius: .75rem;
    font-size: .92rem;
    font-weight: 700;
    color: var(--lp-muted);
    text-decoration: none;
    transition: all .2s ease;
  }

  .lp-nav-link:hover, .lp-menu-item:hover {
    background: var(--lp-soft-accent);
    color: var(--lp-teal);
    transform: translateY(-1px);
  }

  .lp-icon-btn, .lp-menu-btn {
    width: 2.55rem;
    height: 2.55rem;
    border-radius: 50%;
    border: 1px solid var(--lp-line);
    background: var(--lp-surface);
    color: var(--lp-teal-deep);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all .2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .lp-icon-btn:hover, .lp-menu-btn:hover {
    border-color: var(--lp-teal);
    transform: translateY(-2px);
    box-shadow: 0 6px 14px -4px rgba(20, 122, 106, 0.2);
  }

  .lp-menu-btn { display: inline-flex; }
  @media (min-width: 860px) { .lp-menu-btn { display: none; } }

  .lp-menu-mobile {
    display: flex;
    flex-direction: column;
    gap: .35rem;
    padding: .75rem 1.25rem 1.1rem;
    border-top: 1px solid var(--lp-line);
    background: var(--lp-surface);
    animation: lpFadeInUp .25s ease forwards;
  }

  @media (min-width: 860px) { .lp-menu-mobile { display: none !important; } }

  .lp-menu-item {
    text-align: right;
    padding: .75rem .9rem;
    border-radius: .75rem;
    border: 0;
    background: transparent;
    color: var(--lp-text);
    font: inherit;
    font-weight: 700;
    font-size: .95rem;
    text-decoration: none;
    cursor: pointer;
    transition: all .2s ease;
  }

  /* Premium Interactive Buttons */
  .lp-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .55rem;
    min-height: 3rem;
    padding: .7rem 1.6rem;
    border-radius: 1rem;
    font-size: .98rem;
    font-weight: 800;
    cursor: pointer;
    text-decoration: none;
    border: 1px solid transparent;
    transition: all .25s cubic-bezier(0.16, 1, 0.3, 1);
    transform-style: preserve-3d;
  }

  .lp-btn-primary {
    background: linear-gradient(135deg, var(--lp-teal) 0%, var(--lp-teal-deep) 100%);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 28px -10px rgba(20, 122, 106, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  .lp-btn-primary:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 18px 36px -12px rgba(20, 122, 106, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }

  .lp-btn-primary:active { transform: translateY(-1px) scale(0.99); }

  .lp-btn-arrow {
    width: 1.1rem;
    height: 1.1rem;
    transform: rotate(180deg) translateX(0);
    transition: transform .25s ease;
  }

  .lp-btn-primary:hover .lp-btn-arrow { transform: rotate(180deg) translateX(4px); }

  .lp-btn-secondary, .lp-btn-ghost {
    background: var(--lp-surface);
    color: var(--lp-teal-deep);
    border-color: var(--lp-line-strong);
    box-shadow: var(--lp-card-shadow);
  }

  .lp-btn-secondary:hover, .lp-btn-ghost:hover {
    border-color: var(--lp-teal);
    background: var(--lp-soft-accent);
    transform: translateY(-2px);
    box-shadow: 0 10px 22px -8px rgba(20, 122, 106, 0.2);
  }

  .lp-btn-ghost {
    min-height: 2.5rem;
    padding: .45rem 1.15rem;
    font-size: .88rem;
    border-radius: .85rem;
  }

  .lp-btn:focus-visible, .lp-icon-btn:focus-visible, .lp-menu-btn:focus-visible, .lp-nav-link:focus-visible {
    outline: 2px solid var(--lp-teal);
    outline-offset: 3px;
  }

  /* Hero Section & 3D Cards */
  .lp-hero {
    position: relative;
    z-index: 1;
    max-width: 960px;
    margin: 0 auto;
    padding: clamp(2rem, 5vw, 3.5rem) 1.25rem 3.5rem;
    text-align: center;
    animation: lpFadeInUp .7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .lp-hero-scatter-wrap {
    position: relative;
    width: min(100%, 36rem);
    min-height: 13rem;
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 1200px;
  }

  .lp-hero-logo-3d-wrap {
    position: relative;
    z-index: 3;
    transform-style: preserve-3d;
  }

  .lp-hero-logo-backdrop {
    position: absolute;
    inset: -12px;
    background: radial-gradient(circle, var(--lp-soft-accent) 0%, transparent 80%);
    border-radius: 2rem;
    animation: lpPulseGlow 4s ease-in-out infinite;
  }

  .lp-hero-logo-wrap {
    position: relative;
    padding: 1rem 1.75rem;
    border-radius: 1.5rem;
    background: var(--lp-surface);
    border: 1px solid var(--lp-line-strong);
    box-shadow: 0 24px 50px -20px rgba(14, 83, 72, 0.2), 0 0 0 8px var(--lp-soft-accent);
    transform: translateZ(20px);
    transition: transform .3s ease;
  }

  .lp-hero-logo-wrap:hover { transform: translateZ(30px) scale(1.03); }
  .lp-hero-logo { height: 58px; width: auto; object-fit: contain; display: block; }

  .lp-scatter {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    transform-style: preserve-3d;
  }

  .lp-scatter-card {
    position: absolute;
    left: calc(50% + var(--sx) * var(--sk, 1) * 1%);
    top: calc(50% + var(--sy) * 1%);
    display: flex;
    align-items: center;
    gap: .6rem;
    padding: .55rem .85rem;
    border-radius: 1.15rem;
    background: var(--lp-surface);
    border: 1px solid var(--lp-line-strong);
    box-shadow: 0 16px 36px -16px rgba(14, 83, 72, 0.22);
    white-space: nowrap;
    animation: lpFloat3D var(--sdur) ease-in-out var(--sdelay) infinite;
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }

  .lp-scatter--desk { display: none; }
  @media (min-width: 768px) { .lp-scatter--desk { display: flex; } }

  .lp-scatter-ico {
    background: var(--tb);
    color: var(--ti);
    width: 2rem;
    height: 2rem;
    border-radius: .75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
  }

  .lp-scatter-txt { display: flex; flex-direction: column; gap: .1rem; line-height: 1.25; text-align: right; }
  .lp-scatter-txt b { font-size: .78rem; font-weight: 800; color: var(--lp-teal-deep); }
  .lp-scatter-txt small { font-size: .65rem; color: var(--lp-muted); font-weight: 600; }

  .lp-kicker {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    margin: 0 0 1rem;
    font-size: 1.02rem;
    font-weight: 700;
    color: var(--lp-muted);
  }

  .lp-rotator {
    position: relative;
    display: inline-grid;
    justify-items: center;
    align-items: center;
    overflow: hidden;
    border-radius: 999px;
    padding: .25rem 1rem;
    background: var(--lp-soft-accent);
    color: var(--lp-teal-deep);
    border: 1px solid var(--lp-line-strong);
    font-weight: 900;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);
  }

  .lp-rotator-grid { display: contents; }
  .lp-rotator-measure, .lp-rotator-word { grid-area: 1 / 1; white-space: nowrap; }
  .lp-rotator-measure { visibility: hidden; pointer-events: none; }
  .lp-word-in { animation: lp-word-in .45s cubic-bezier(0.16, 1, 0.3, 1) both; }

  @keyframes lp-word-in {
    from { opacity: 0; transform: translateY(60%) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .lp-sr-only {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
  }

  .lp-title {
    margin: 0 auto 1.25rem;
    max-width: 19em;
    font-size: clamp(1.85rem, 5.2vw, 3rem);
    font-weight: 900;
    line-height: 1.4;
    color: var(--lp-text);
    text-wrap: balance;
    letter-spacing: -.02em;
  }

  .lp-title-em {
    background: linear-gradient(135deg, var(--lp-teal) 0%, var(--lp-gold) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }

  .lp-lead {
    margin: 0 auto 2rem;
    max-width: 36em;
    font-size: clamp(1rem, 2.4vw, 1.15rem);
    line-height: 1.9;
    color: var(--lp-muted);
    text-wrap: balance;
  }

  .lp-cta {
    display: flex;
    flex-wrap: wrap;
    gap: .9rem;
    justify-content: center;
    align-items: center;
  }

  /* Highlight Section & Interactive 3D Card */
  .lp-highlight-section {
    max-width: 1140px;
    margin: 0 auto;
    padding: 1.25rem 1.25rem 3rem;
  }

  .lp-highlight-card {
    position: relative;
    overflow: hidden;
    padding: clamp(1.75rem, 4.5vw, 4.25rem);
    border: 1px solid var(--lp-line-strong);
    border-radius: 2.25rem;
    background:
      radial-gradient(circle at 100% 0%, var(--lp-soft-accent), transparent 50%),
      var(--lp-surface);
    box-shadow: var(--lp-card-shadow);
    transition: box-shadow .3s ease;
  }

  .lp-highlight-glow {
    position: absolute;
    pointer-events: none;
    width: 22rem;
    height: 22rem;
    top: -8rem;
    inset-inline-end: -6rem;
    border-radius: 50%;
    background: var(--lp-soft-accent);
    filter: blur(65px);
  }

  .lp-highlight-content {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    gap: 3rem;
  }

  @media (min-width: 900px) {
    .lp-highlight-content { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); }
  }

  .lp-highlight-copy { min-width: 0; }

  .lp-badge {
    display: inline-flex;
    align-items: center;
    gap: .55rem;
    padding: .5rem 1rem;
    border-radius: 999px;
    background: var(--lp-soft-accent);
    border: 1px solid var(--lp-line-strong);
    color: var(--lp-teal-deep);
    font-size: .8rem;
    font-weight: 800;
  }

  .lp-badge-dot {
    width: .5rem;
    height: .5rem;
    border-radius: 50%;
    background: var(--lp-teal);
    box-shadow: 0 0 8px var(--lp-teal);
  }

  .lp-highlight-title {
    margin: 1.35rem 0;
    color: var(--lp-text);
    font-size: clamp(1.8rem, 3.6vw, 2.65rem);
    line-height: 1.55;
    font-weight: 900;
    letter-spacing: -.02em;
  }

  .lp-highlight-em {
    color: var(--lp-teal);
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--lp-teal) 45%, transparent);
    text-decoration-thickness: 4px;
    text-underline-offset: .2em;
  }

  .lp-highlight-description {
    margin: 0;
    color: var(--lp-muted);
    font-size: 1.05rem;
    line-height: 1.95;
  }

  .lp-benefits {
    list-style: none;
    margin: 1.75rem 0 0;
    padding: 0;
    border-top: 1px solid var(--lp-line);
  }

  .lp-benefits li {
    display: flex;
    align-items: flex-start;
    gap: .85rem;
    padding: 1.1rem 0;
    color: var(--lp-text);
    font-size: .95rem;
    font-weight: 700;
    line-height: 1.8;
    border-bottom: 1px solid var(--lp-line);
  }

  .lp-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 1.55rem;
    height: 1.55rem;
    margin-top: .15rem;
    border-radius: 50%;
    background: var(--lp-soft-accent);
    color: var(--lp-teal);
    font-weight: 900;
    border: 1px solid var(--lp-line);
  }

  /* Interactive Demo Card with Perspective */
  .lp-demo-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 2.5rem .25rem;
    perspective: 1000px;
  }

  .lp-demo-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 430px;
    overflow: hidden;
    border-radius: 1.65rem;
    border: 1px solid var(--lp-line-strong);
    background: var(--lp-surface);
    box-shadow: var(--lp-card-shadow);
    transition: transform .25s ease-out, box-shadow .25s ease-out;
    transform-style: preserve-3d;
  }

  .lp-demo-card:hover {
    box-shadow: var(--lp-card-shadow-hover);
  }

  .lp-demo-header {
    display: flex;
    align-items: center;
    gap: .9rem;
    padding: 1.15rem;
    border-bottom: 1px solid var(--lp-line);
    background: var(--lp-soft-accent);
  }

  .lp-demo-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 2.7rem;
    height: 2.7rem;
    border-radius: .9rem;
    background: var(--lp-teal);
    color: #fff;
    font-size: 1.2rem;
    box-shadow: 0 8px 18px -6px rgba(20, 122, 106, 0.4);
  }

  .lp-demo-header h3 { margin: 0; color: var(--lp-text); font-size: .95rem; font-weight: 850; }
  .lp-demo-header p { margin: .25rem 0 0; color: var(--lp-teal); font-size: .72rem; line-height: 1.6; font-weight: 700; }

  .lp-demo-body {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    padding: 1.15rem;
    background: var(--lp-surface);
  }

  .lp-chat-row { display: flex; align-items: flex-start; gap: .75rem; }
  .lp-answer-row { flex-direction: row-reverse; }

  .lp-chat-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    font-size: .9rem;
  }

  .lp-question-icon { background: rgba(65, 145, 180, .14); }
  .lp-answer-icon { background: var(--lp-soft-accent); }

  .lp-question-bubble, .lp-answer-bubble {
    max-width: 88%;
    margin: 0;
    padding: .8rem 1rem;
    border-radius: 1.15rem;
    font-size: .82rem;
    line-height: 1.8;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }

  .lp-question-bubble {
    background: color-mix(in srgb, #4296BC 10%, var(--lp-surface));
    color: var(--lp-text);
    border: 1px solid color-mix(in srgb, #4296BC 30%, var(--lp-line));
    border-top-right-radius: .3rem;
  }

  .lp-answer-bubble {
    background: var(--lp-teal);
    color: #FFFFFF;
    border-top-left-radius: .3rem;
    font-weight: 700;
  }

  .lp-result-card {
    padding: 1.1rem;
    border-radius: 1.1rem;
    background: var(--lp-soft-accent);
    border: 1px solid color-mix(in srgb, var(--lp-teal) 30%, var(--lp-line));
  }

  .lp-result-card strong { color: var(--lp-teal-deep); font-size: .82rem; display: block; }
  .lp-result-card p { margin: .5rem 0; color: var(--lp-text); font-size: .85rem; font-weight: 800; line-height: 1.8; }
  .lp-result-card small { color: var(--lp-muted); font-size: .74rem; line-height: 1.8; font-weight: 600; }

  /* Floating 3D Badges */
  .lp-float-label {
    position: absolute;
    z-index: 4;
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    max-width: 90%;
    padding: .6rem .85rem;
    border: 1px solid var(--lp-line-strong);
    border-radius: 1rem;
    background: var(--lp-surface);
    color: var(--lp-text);
    box-shadow: 0 14px 30px -12px rgba(0,0,0,0.18);
    font-size: .76rem;
    font-weight: 800;
    pointer-events: none;
    animation: lpFloatLabel 4.5s ease-in-out infinite alternate;
  }

  .lp-float-label-top { top: -0.5rem; right: -0.5rem; animation-delay: 0s; }
  .lp-float-label-bottom { bottom: -0.5rem; left: -0.5rem; animation-delay: 1.5s; }
  .lp-float-label-side { top: 46%; right: -1.2rem; animation-delay: 0.8s; }

  .lp-float-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 2rem;
    height: 2rem;
    border-radius: .7rem;
    color: #fff;
    font-size: .95rem;
  }

  .lp-icon-map { background: #7660B5; }
  .lp-icon-link { background: #398BA5; }
  .lp-icon-mind { background: #8D639F; }

  /* Video Explainer Section */
  .lp-video-section {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0.5rem 1.25rem 3rem;
  }

  .lp-video-card {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
    align-items: center;
    padding: clamp(1.6rem, 4vw, 2.75rem);
    border-radius: 2rem;
    border: 1px solid var(--lp-line-strong);
    background:
      radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--lp-teal) 12%, transparent), transparent 45%),
      var(--lp-surface);
    box-shadow: var(--lp-card-shadow);
  }

  @media (min-width: 900px) {
    .lp-video-card { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); }
  }

  .lp-video-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: var(--lp-soft-accent);
    border: 1px solid var(--lp-line-strong);
    color: var(--lp-teal-deep);
    font-size: 0.78rem;
    font-weight: 800;
  }

  .lp-video-badge-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: var(--lp-teal);
  }

  .lp-video-title {
    margin: 1.15rem 0 0.85rem;
    font-size: clamp(1.45rem, 3.2vw, 2rem);
    font-weight: 900;
    line-height: 1.5;
    color: var(--lp-text);
  }

  .lp-video-desc {
    margin: 0;
    font-size: 1.02rem;
    line-height: 1.9;
    color: var(--lp-muted);
  }

  .lp-video-points {
    list-style: none;
    margin: 1.25rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .lp-video-points li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.92rem;
    line-height: 1.75;
    color: var(--lp-text);
    font-weight: 700;
  }

  .lp-video-check {
    flex: none;
    width: 1.45rem;
    height: 1.45rem;
    margin-top: 0.1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--lp-soft-accent);
    color: var(--lp-teal);
    font-size: 0.8rem;
    font-weight: 900;
    border: 1px solid var(--lp-line);
  }

  .lp-video-visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 15rem;
    padding: 1.25rem 0.5rem;
  }

  .lp-video-frame {
    width: 100%;
    max-width: 23rem;
    border-radius: 1.5rem;
    border: 1px solid var(--lp-line-strong);
    background: var(--lp-surface);
    box-shadow: 0 20px 45px -18px rgba(14, 83, 72, 0.25);
    overflow: hidden;
    transition: transform .3s ease;
  }

  .lp-video-frame:hover { transform: scale(1.02); }

  .lp-video-screen {
    position: relative;
    aspect-ratio: 16 / 10;
    background: linear-gradient(160deg, #0E5348 0%, #147A6A 55%, #1E8C7A 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lp-video-play-wrap { position: relative; display: flex; align-items: center; justify-content: center; }

  .lp-video-play-pulse {
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    animation: lpVideoPulse 2s ease-out infinite;
  }

  .lp-video-play {
    position: relative;
    z-index: 2;
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    background: #FFFFFF;
    color: #0E5348;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 14px 32px -8px rgba(0, 0, 0, 0.4);
    padding-inline-start: 3px;
    transition: transform .25s ease;
  }

  .lp-video-frame:hover .lp-video-play { transform: scale(1.1); }

  .lp-video-bars {
    position: absolute;
    inset-inline: 12%;
    bottom: 14%;
    display: flex;
    align-items: flex-end;
    gap: 6px;
    height: 1.2rem;
    opacity: 0.65;
  }

  .lp-video-bars i {
    display: block;
    width: 5px;
    border-radius: 3px;
    background: #FFFFFF;
    animation: lp-video-eq 1.2s ease-in-out infinite alternate;
  }

  .lp-video-bars i:nth-child(1) { height: 35%; animation-delay: 0s; }
  .lp-video-bars i:nth-child(2) { height: 75%; animation-delay: 0.15s; }
  .lp-video-bars i:nth-child(3) { height: 100%; animation-delay: 0.3s; }
  .lp-video-bars i:nth-child(4) { height: 60%; animation-delay: 0.1s; }
  .lp-video-bars i:nth-child(5) { height: 40%; animation-delay: 0.25s; }

  @keyframes lp-video-eq {
    from { transform: scaleY(0.5); }
    to { transform: scaleY(1); }
  }

  .lp-video-caption {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.95rem 1.15rem;
    border-top: 1px solid var(--lp-line);
    background: var(--lp-surface-soft);
  }

  .lp-video-caption-title { font-size: 0.9rem; font-weight: 850; color: var(--lp-teal-deep); }
  .lp-video-caption-sub { font-size: 0.75rem; color: var(--lp-muted); font-weight: 600; }

  .lp-video-chip {
    position: absolute;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 0.8rem;
    border-radius: 0.85rem;
    border: 1px solid var(--lp-line-strong);
    background: var(--lp-surface);
    color: var(--lp-text);
    font-size: 0.72rem;
    font-weight: 800;
    box-shadow: 0 12px 28px -10px rgba(0,0,0,0.18);
    pointer-events: none;
  }

  .lp-video-chip--a { top: 0.2rem; inset-inline-end: 0.1rem; }
  .lp-video-chip--b { bottom: 0.3rem; inset-inline-start: 0rem; }

  /* Differentiation Feature Grid */
  .lp-diff-section {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0.5rem 1.25rem 3.25rem;
  }

  .lp-diff-head { text-align: center; max-width: 42rem; margin: 0 auto 2.25rem; }

  .lp-diff-title {
    margin: 0 0 0.9rem;
    font-size: clamp(1.45rem, 3.4vw, 2rem);
    font-weight: 900;
    line-height: 1.5;
    color: var(--lp-text);
    text-wrap: balance;
  }

  .lp-diff-lead {
    margin: 0;
    font-size: 1.02rem;
    line-height: 1.9;
    color: var(--lp-muted);
    text-wrap: balance;
  }

  .lp-diff-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 640px) { .lp-diff-grid { grid-template-columns: 1fr 1fr; gap: 1.35rem; } }
  @media (min-width: 1024px) { .lp-diff-grid { grid-template-columns: repeat(4, 1fr); gap: 1.25rem; } }

  .lp-diff-card {
    position: relative;
    isolation: isolate;
    padding: 2.75rem 1.45rem 1.6rem;
    border-radius: 1.85rem;
    border: 1px solid color-mix(in srgb, var(--lp-teal) 25%, var(--lp-line-strong));
    background:
      linear-gradient(
        160deg,
        color-mix(in srgb, var(--lp-teal) 7%, var(--lp-surface)) 0%,
        var(--lp-surface) 50%,
        color-mix(in srgb, var(--lp-teal) 9%, var(--lp-surface)) 100%
      );
    box-shadow: var(--lp-card-shadow);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .lp-diff-card:hover {
    transform: translateY(-6px);
    border-color: color-mix(in srgb, var(--lp-teal) 55%, var(--lp-line-strong));
    box-shadow: var(--lp-card-shadow-hover);
  }

  .lp-diff-card--b {
    border-color: color-mix(in srgb, #3F7FA3 30%, var(--lp-line-strong));
    background: linear-gradient(160deg, color-mix(in srgb, #3F7FA3 8%, var(--lp-surface)) 0%, var(--lp-surface) 50%, color-mix(in srgb, #3F7FA3 10%, var(--lp-surface)) 100%);
  }

  .lp-diff-card--c {
    border-color: color-mix(in srgb, #B8832A 30%, var(--lp-line-strong));
    background: linear-gradient(160deg, color-mix(in srgb, #B8832A 9%, var(--lp-surface)) 0%, var(--lp-surface) 50%, color-mix(in srgb, #B8832A 11%, var(--lp-surface)) 100%);
  }

  .lp-diff-card--d {
    border-color: color-mix(in srgb, #7A5CA3 28%, var(--lp-line-strong));
    background: linear-gradient(160deg, color-mix(in srgb, #7A5CA3 8%, var(--lp-surface)) 0%, var(--lp-surface) 50%, color-mix(in srgb, #7A5CA3 10%, var(--lp-surface)) 100%);
  }

  .lp-diff-icon {
    position: absolute;
    top: -1.15rem;
    inset-inline-start: 1.25rem;
    z-index: 2;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    background: var(--lp-teal);
    color: #fff;
    box-shadow: 0 10px 22px -8px rgba(20, 122, 106, 0.6), 0 0 0 5px var(--lp-surface);
    transition: transform 0.3s ease;
  }

  .lp-diff-card:hover .lp-diff-icon { transform: scale(1.1) rotate(-3deg); }
  .lp-diff-card--b .lp-diff-icon { background: #3F7FA3; box-shadow: 0 10px 22px -8px rgba(63, 127, 163, 0.55), 0 0 0 5px var(--lp-surface); }
  .lp-diff-card--c .lp-diff-icon { background: #B8832A; box-shadow: 0 10px 22px -8px rgba(184, 131, 42, 0.55), 0 0 0 5px var(--lp-surface); }
  .lp-diff-card--d .lp-diff-icon { background: #5A4175; box-shadow: 0 10px 22px -8px rgba(90, 65, 117, 0.55), 0 0 0 5px var(--lp-surface); }

  .lp-diff-num {
    position: absolute;
    top: 0.6rem;
    inset-inline-end: 0.95rem;
    z-index: 0;
    font-size: clamp(2.6rem, 6.5vw, 3.4rem);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.04em;
    color: color-mix(in srgb, var(--lp-teal) 22%, transparent);
    pointer-events: none;
    user-select: none;
    transition: color 0.3s ease;
  }

  .lp-diff-body { position: relative; z-index: 1; }

  .lp-diff-tag {
    display: inline-flex;
    align-items: center;
    padding: 0.22rem 0.75rem;
    border-radius: 999px;
    background: var(--lp-soft-accent);
    color: var(--lp-teal-deep);
    font-size: 0.72rem;
    font-weight: 800;
  }

  .lp-diff-card-title {
    margin: 0.8rem 0 0;
    padding-inline-end: 2rem;
    font-size: 1.08rem;
    font-weight: 850;
    line-height: 1.45;
    color: var(--lp-text);
  }

  .lp-diff-card-text {
    margin: 0.6rem 0 0;
    font-size: 0.88rem;
    line-height: 1.85;
    color: var(--lp-muted);
  }

  /* Showcase Section */
  .lp-showcase-wrap {
    scroll-margin-top: 5rem;
    max-width: 1140px;
    margin: 0 auto;
    padding: .5rem 1.25rem 3rem;
    color: var(--lp-text);
  }

  .lp-feat-cta {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  /* Tone Colors for Scatter Cards */
  .lp-tone--rose { --tb: #F8E8EE; --ti: #8A4560; }
  .lp-tone--sky { --tb: #E6EEF3; --ti: #2F5870; }
  .lp-tone--amber { --tb: #FAF0D9; --ti: #86600F; }
  .lp-tone--teal { --tb: #E0F2EC; --ti: #0E5348; }
  .lp-tone--emerald { --tb: #E5F0E4; --ti: #3F6B3A; }
  .lp-tone--violet { --tb: #F0E9F5; --ti: #5A4175; }

  .lp-root.is-dark .lp-tone--rose { --tb: rgba(231,180,200,.18); --ti: #E7B4C8; }
  .lp-root.is-dark .lp-tone--sky { --tb: rgba(169,204,224,.18); --ti: #A9CCE0; }
  .lp-root.is-dark .lp-tone--amber { --tb: rgba(230,196,122,.18); --ti: #E6C47A; }
  .lp-root.is-dark .lp-tone--teal { --tb: rgba(158,216,203,.18); --ti: #9ED8CB; }
  .lp-root.is-dark .lp-tone--emerald { --tb: rgba(181,217,174,.18); --ti: #B5D9AE; }
  .lp-root.is-dark .lp-tone--violet { --tb: rgba(205,184,227,.18); --ti: #CDB8E3; }

  /* Responsive Design */
  @media (max-width: 600px) {
    .lp-hero-scatter-wrap { min-height: 12rem; }
    .lp-scatter { --sk: .82; }
    .lp-scatter-card { padding: .4rem .6rem; gap: .4rem; }
    .lp-scatter-ico { width: 1.6rem; height: 1.6rem; }
    .lp-scatter-txt b { font-size: .68rem; }
    .lp-scatter-txt small { font-size: .58rem; }
    .lp-highlight-section { padding-inline: .85rem; }
    .lp-highlight-card { border-radius: 1.6rem; }
    .lp-benefits { display: none; }
    .lp-demo-wrap { padding: 2.8rem .1rem; }
    .lp-float-label { font-size: .68rem; padding: .45rem .6rem; gap: .4rem; }
    .lp-float-icon { width: 1.7rem; height: 1.7rem; }
  }

  /* Accessibility: Prefers Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .lp-root *, .lp-root *::before, .lp-root *::after {
      scroll-behavior: auto !important;
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }


/* —— Hero style match (Landing reference design) —— */
.lp-badge-line {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.55rem 0.45rem 1rem;
  border-radius: 999px;
  background: color-mix(in srgb, #147A6A 10%, #FFFFFF);
  border: 1.5px solid color-mix(in srgb, #147A6A 22%, transparent);
  margin: 0 auto 1.5rem;
}
.lp-badge-text {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0E5348;
}
.lp-rotor-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #147A6A, #0E5348);
  box-shadow: 0 6px 20px -6px rgba(20, 122, 106, 0.55);
  flex: none;
}
.lp-rotor-grid { display: inline-grid; }
.lp-rotor-word {
  grid-area: 1 / 1;
  font-size: 0.78rem;
  font-weight: 900;
  color: #fff;
  opacity: 0;
  transform: scale(0.6) translateY(8px);
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  text-align: center;
}
.lp-rotor-word.is-active {
  opacity: 1;
  transform: scale(1) translateY(0);
}
.lp-title {
  font-size: clamp(1.8rem, 5.5vw, 3.2rem) !important;
  font-weight: 900;
  line-height: 1.3;
  text-align: center;
}
.lp-title-em {
  background: linear-gradient(135deg, #147A6A, #B9791F);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.lp-lead {
  max-width: 580px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  line-height: 1.9;
  color: #5C6B66;
}
.lp-lead strong { color: #0E5348; font-weight: 800; }
.lp-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  justify-content: center;
}
.lp-btn-primary {
  background: #147A6A !important;
  color: #fff !important;
  border-radius: 999px !important;
  box-shadow: 0 5px 0 #0E5348, 0 12px 30px -10px rgba(20, 122, 106, 0.55) !important;
  font-weight: 800 !important;
}
.lp-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 0 #0E5348, 0 16px 36px -10px rgba(20, 122, 106, 0.55) !important;
}
.lp-btn-primary:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #0E5348 !important;
}
.lp-btn-secondary {
  border-radius: 999px !important;
  border: 2px solid #DED4BD !important;
  background: #FFFFFF !important;
  color: #263B35 !important;
  font-weight: 800 !important;
  box-shadow: 0 4px 0 #DED4BD !important;
}
.lp-btn-secondary:hover {
  border-color: #147A6A !important;
  color: #0E5348 !important;
  transform: translateY(-2px);
}
.lp-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2.25rem;
  flex-wrap: wrap;
}
.lp-trust-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #6B7A75;
}
.lp-trust-item svg { color: #147A6A; }
.lp-trust-num {
  font-weight: 900;
  color: #0E5348;
  font-size: 0.9rem;
}
.lp-trust-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #DED4BD;
}
html[data-theme="dark"] .lp-badge-line {
  background: color-mix(in srgb, #147A6A 18%, #192723);
  border-color: color-mix(in srgb, #147A6A 35%, transparent);
}
html[data-theme="dark"] .lp-badge-text { color: #B5DDD2; }
html[data-theme="dark"] .lp-lead { color: #A5B7AF; }
html[data-theme="dark"] .lp-lead strong { color: #B5DDD2; }
html[data-theme="dark"] .lp-btn-secondary {
  background: #192723 !important;
  border-color: #30423B !important;
  color: #EAF1ED !important;
  box-shadow: 0 4px 0 #30423B !important;
}
html[data-theme="dark"] .lp-trust-item { color: #A5B7AF; }
html[data-theme="dark"] .lp-trust-num { color: #B5DDD2; }
@media (max-width: 640px) {
  .lp-rotor-badge { width: 3.5rem; height: 3.5rem; }
  .lp-rotor-word { font-size: 0.68rem; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-rotor-word { transition: none !important; }
  .lp-rotor-word.is-active { opacity: 1 !important; transform: none !important; }
  .lp-rotor-word:not(.is-active) { opacity: 0 !important; }
}


/* Final CTA card */
.lp-final-cta {
  max-width: 960px;
  margin: 0 auto 2.5rem;
  padding: 0 1.25rem;
}
.lp-final-cta-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  text-align: center;
  padding: clamp(2.2rem, 5vw, 3.25rem) clamp(1.25rem, 4vw, 2.5rem);
  border-radius: 1.75rem;
  background: linear-gradient(145deg, #0E5348 0%, #147A6A 55%, #1A8F7C 100%);
  color: #fff;
  box-shadow: 0 24px 48px -20px rgba(14, 83, 72, 0.45);
}
.lp-final-cta-cap {
  position: absolute;
  top: 1.25rem;
  inset-inline-end: 1.35rem;
  color: rgba(227, 192, 139, 0.9);
  opacity: 0.85;
}
.lp-final-cta-title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.45rem, 3.5vw, 2rem);
  font-weight: 900;
  line-height: 1.45;
  color: #fff;
}
.lp-final-cta-lead {
  margin: 0 auto 1.5rem;
  max-width: 28rem;
  font-size: 0.98rem;
  line-height: 1.85;
  color: rgba(255, 255, 255, 0.88);
}
.lp-final-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0.75rem 1.85rem;
  border: 0;
  border-radius: 999px;
  background: #FFFFFF;
  color: #0E5348;
  font-size: 1rem;
  font-weight: 850;
  cursor: pointer;
  box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.lp-final-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.4);
}
.lp-final-cta-btn:active { transform: translateY(1px); }
.lp-final-cta-btn:focus-visible {
  outline: 3px solid rgba(227, 192, 139, 0.7);
  outline-offset: 3px;
}
.lp-final-cta-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem 1.25rem;
  margin-top: 1.5rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
}
.lp-final-cta-pills span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.lp-final-cta-pills svg { opacity: 0.9; }
html[data-theme="dark"] .lp-final-cta-card {
  background: linear-gradient(145deg, #0A3F36 0%, #0E5348 50%, #147A6A 100%);
}
@media (prefers-reduced-motion: reduce) {
  .lp-final-cta-btn { transition: none !important; }
}

`;