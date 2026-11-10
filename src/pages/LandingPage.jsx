import { createContext, useContext, useEffect, useLayoutEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import { useAuth } from "../lib/hooks";
import { ArrowLeft, ArrowRight, Sparkles, Compass, Menu, X, Sun, Moon, ChevronDown, LogIn } from "lucide-react";
import { SocialIcon } from "../components/SocialIcons.jsx";

/* ===== اللغة / Language (عربي – English) ===== */
const LANG_KEY = "madar_lang_v1";
const LangCtx = createContext("ar");
const B = (ar, en) => ({ ar, en });
function makeT(lang) {
  const fn = (ar, en) => {
    if (ar && typeof ar === "object" && Object.prototype.hasOwnProperty.call(ar, "ar")) return ar[lang] ?? ar.ar;
    return lang === "en" && en !== undefined ? en : ar;
  };
  fn.lang = lang;
  return fn;
}
function useT() { return makeT(useContext(LangCtx)); }
function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch { /* التخزين غير متاح */ }
  const nav = typeof navigator !== "undefined" ? (navigator.languages && navigator.languages[0]) || navigator.language || "" : "";
  return String(nav).toLowerCase().startsWith("ar") ? "ar" : "en";
}
function useLang() {
  const [lang, setLang] = useState(detectLang);
  useEffect(() => { document.documentElement.setAttribute("lang", lang); }, [lang]);
  const choose = (next) => {
    setLang(next);
    try { localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
  };
  return [lang, choose];
}
function Arrow(props) {
  const lang = useContext(LangCtx);
  return lang === "ar" ? <ArrowLeft {...props} /> : <ArrowRight {...props} />;
}
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
const ROTATING_EN = ["Interactive", "Modern", "Smart", "Integrated", "Arabic"];
const SCATTER_EN = {
  quiz: ["Interactive quizzes", "Check your understanding"],
  mindmap: ["Mind map", "Connect ideas"],
  timeline: ["Timeline", "Order the events"],
  explain: ["Visual explainer", "Clear content"],
  recall: ["Quick recall", "Key points"],
  review: ["Final review", "Lesson summary"],
};
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
  const tr = useT();
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
                <span className="md-scatter-title">{tr(c.title, SCATTER_EN[c.key][0])}</span>
                <span className="md-scatter-sub">{tr(c.sub, SCATTER_EN[c.key][1])}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function RotatingWord({ theme }) {
  const tr = useT();
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
            {tr(w, ROTATING_EN[i])}
          </span>
        ))}
      </span>
      <span className="hero-rotor-sr">{tr(ROTATING_WORDS[idx], ROTATING_EN[idx])}</span>
    </span>
  );
}
// شخصية المنصة (public/photo/5554.png) — بتظهر أول الصفحة وبتطمّن الطالب
const GUIDE_IMGS = {
  hi: encodeURI("/photo/He hands over1.png"),
  cheer: encodeURI("/photo/Happy3.png"),
};
const GUIDE_NAME = "تونة";

function HeroSection({ theme, onStart }) {
  const tr = useT();
  return (
    <section id="top" className="md-hero md-hero--scatter">
      <style>{HERO_CSS}</style>
      <div className="lp-hero-glow" aria-hidden="true" />
      <FloatingScatterCards theme={theme} />
      <div className="md-hero-core">
        <div className="hero-badge-line">
          <span className="hero-badge-text">{tr("منصة تعليمية", "educational platform")}</span>
          <RotatingWord theme={theme} />
        </div>
        <h1 className="hero-headline">
          <span className="hero-headline-lead">{tr("الدراسات الاجتماعية…", "Social Studies…")}</span>
          <span className="hero-headline-accent">
            {tr("تفهمها مش تحفظها!", "Understand it, don’t memorize it!")}
            <svg className="hero-underline" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
              <path d="M3 9 C 55 2, 110 13, 170 6 S 265 3, 297 8" />
            </svg>
          </span>
        </h1>
        <p className="hero-desc">
          {tr.lang === "ar" ? (
            <>
              مَدَار منصة تعليمية عربية تعيد تعريف طريقة دراسة الدراسات الاجتماعية.
              بدلًا من الاعتماد على الحفظ، نساعد الطالب على{" "}
              <strong>الفهم الحقيقي</strong> من خلال شرح مرئي، خرائط ذهنية،
              خطوط زمنية، وأسئلة تفاعلية — كل ما تحتاجه لتفهم الدرس في مكان واحد.
            </>
          ) : (
            <>
              Madar is an Arabic educational platform that rethinks how Social Studies is learned.
              Instead of relying on memorization, we help students reach{" "}
              <strong>real understanding</strong> through visual explanations, mind maps,
              timelines and interactive questions — everything you need to understand a lesson in one place.
            </>
          )}
        </p>
        <div className="hero-actions">
          <button type="button" onClick={onStart} className="hero-btn hero-btn-primary">
            <span>{tr("ابدأ التعلّم", "Start learning")}</span>
            <Arrow size={18} />
          </button>
        </div>
        <p className="hero-hint">{tr("اختر صفّك وابدأ أول درس الآن.", "Pick your grade and start your first lesson.")}</p>
        <div className="hero-trust">
          <div className="hero-trust-item">
            <Compass size={16} />
            <span>{tr("منهج متكامل", "Complete curriculum")}</span>
          </div>
          <div className="hero-trust-dot" />
          <div className="hero-trust-item">
            <span className="hero-trust-num">{tr("٩", "9")}</span>
            <span>{tr("مميزات تعلّم", "learning features")}</span>
          </div>
          <div className="hero-trust-dot" />
          <div className="hero-trust-item">
            <span className="hero-trust-num">{tr("١٠٠٪", "100%")}</span>
            <span>{tr("عربية بالكامل", "Arabic-first")}</span>
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
  max-width: 64rem;
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
  gap: 0.85rem;
  padding: 0.6rem 0.7rem 0.6rem 1.6rem;
  border-radius: 999px;
  background: var(--duo-green-soft);
  border: 1.5px solid color-mix(in srgb, var(--duo-green) 20%, transparent);
  margin-bottom: 1.75rem;
  animation: hero-badge-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-badge-text {
  font-family: var(--duo-font-display);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--duo-green-ink);
}
/* The rotating word inside a circular badge */
.hero-rotor-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 6.25rem;
  height: 6.25rem;
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
  font-size: 1.1rem;
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
  font-size: clamp(1rem, 4.4vw, 3rem);
  white-space: nowrap;
  font-weight: 900;
  line-height: 1.5;
  color: var(--duo-ink);
  margin: 0 0 1.25rem;
  animation: hero-rise 0.8s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hero-headline-accent {
  display: inline-block;
  padding: 0.05em 0.45em 0.15em;
  border-radius: 0.55em;
  background: linear-gradient(145deg, #0E5348 0%, #147A6A 55%, #1A8F7C 100%);
  color: #fff;
  -webkit-text-fill-color: #fff;
  box-shadow: 0 18px 36px -18px rgba(14, 83, 72, 0.55);
}
html[data-theme="dark"] .hero-headline-accent {
  background: linear-gradient(145deg, #0A3F36 0%, #0E5348 50%, #147A6A 100%);
}
@media (max-width: 640px) {
  .hero-headline {
    white-space: normal;
    font-size: clamp(1.5rem, 7vw, 2.1rem);
    line-height: 1.5;
  }
  .hero-headline-lead { display: block; margin-bottom: 0.6rem; }
  .hero-headline-accent { padding: 0.05em 0.5em 0.15em; border-radius: 0.6em; }
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
  .hero-badge-line { gap: 0.55rem; padding: 0.45rem 0.5rem 0.45rem 1.1rem; }
  .hero-badge-text { font-size: 1rem; }
  .hero-rotor-badge { width: 4.9rem; height: 4.9rem; }
  .hero-rotor-word { font-size: 0.9rem; }
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



/* ===== رحلة الطالب: كل ميزة في مكانها داخل الصفحة (بديل MadarShowcase) ===== */
const FEATURES = [
  {
    id: "progress",
    title: "تقدّمك أولًا بأول",
    text: "تعرف كم درسًا أنهيت وكم بقي عليك في الفصل، وتستكمل من حيث توقفت.",
    tag: "تابع",
    ac: "#147A6A", darkAc: "#3E9A8A", soft: "rgba(20, 122, 106, 0.12)", ink: "var(--lp-text)",
    fd: "5.4s", dl: "-0.6s", rot: "0.35deg",
    points: ["نسبة تقدّمك في الفصل وعدد الدروس المكتملة", "تقدّم كل وحدة دراسية على حدة", "تقدّمك محفوظ بحسابك لتكمل من أي جهاز"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 15l4-4 3 3 5-6" />
      </svg>
    ),
  },
  {
    id: "dyk",
    title: "هل تعلم؟",
    text: "معلومة قصيرة في كل زيارة تثبت في ذاكرتك دون مجهود.",
    tag: "ثبّت",
    ac: "#C98512", darkAc: "#E6C47A", soft: "rgba(201, 133, 18, 0.12)", ink: "var(--lp-text)",
    fd: "6.2s", dl: "-2.1s", rot: "-0.3deg",
    points: ["معلومة جديدة عشوائية من منهجك في كل زيارة", "مخصّصة لمرحلتك وصفّك الدراسي"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" />
      </svg>
    ),
  },
  {
    id: "scenes",
    title: "درس مقسّم إلى عناوين",
    text: "كل درس مقسّم إلى عناوين قصيرة، تنهي كل عنوان وتتابع تقدّمك داخل الدرس.",
    tag: "قسّم",
    ac: "#2F7FB5", darkAc: "#7CB6DE", soft: "rgba(47, 127, 181, 0.12)", ink: "var(--lp-text)",
    fd: "5.8s", dl: "-3.4s", rot: "0.25deg",
    points: ["قائمة بعناوين الدرس إلى جانب المحتوى", "شريط يعرض عدد العناوين المكتملة", "العنوان التالي يُفتح بعد إنهاء السابق"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6h11M9 12h11M9 18h11" />
        <circle cx="4.5" cy="6" r="1.2" />
        <circle cx="4.5" cy="12" r="1.2" />
        <circle cx="4.5" cy="18" r="1.2" />
      </svg>
    ),
  },
  {
    id: "words",
    title: "شرح وكلمات تفاعلية",
    text: "الكلمات المهمة في الشرح مظلّلة: اضغط عليها ليظهر ما يوضّح معناها.",
    tag: "افهم",
    ac: "#7A4FA0", darkAc: "#A981CD", soft: "rgba(122, 79, 160, 0.12)", ink: "var(--lp-text)",
    fd: "6.6s", dl: "-1.3s", rot: "-0.4deg",
    points: ["تعريف أو ملاحظة تشرح الكلمة", "صورة توضّح الكلمة إذا لم تكن مفهومة"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 18h16M4 12h5" />
        <rect x="11" y="9.5" width="9" height="5" rx="2.2" />
      </svg>
    ),
  },
  {
    id: "video",
    title: "فيديو شرح الدرس",
    text: "شاهد شرح الدرس بالفيديو داخل صفحة الدرس نفسها دون مغادرة المنصة.",
    tag: "شاهد",
    ac: "#4F8A2E", darkAc: "#9BC76A", soft: "rgba(79, 138, 46, 0.12)", ink: "var(--lp-text)",
    fd: "5.2s", dl: "-1.8s", rot: "0.4deg",
    points: ["الفيديو داخل صفحة الدرس دون رابط خارجي", "اضغط تشغيل لتبدأ المشاهدة", "ثم تكمل الشرح والخرائط والأسئلة"],
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
    ac: "#C98512", darkAc: "#E6C47A", soft: "rgba(201, 133, 18, 0.12)", ink: "var(--lp-text)",
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
    ac: "#C2562F", darkAc: "#E08769", soft: "rgba(194, 86, 47, 0.12)", ink: "var(--lp-text)",
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
    ac: "#7A4FA0", darkAc: "#A981CD", soft: "rgba(122, 79, 160, 0.12)", ink: "var(--lp-text)",
    fd: "6.6s", dl: "-1.3s", rot: "-0.4deg",
    points: ["اختبر فهمك أولًا بأول", "راجع قبل الانتقال للتالي", "ثبّت ما تعلّمته"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.7 2.7L16 9.5" />
      </svg>
    ),
  },
  {
    id: "recall",
    title: "تذكّر سريع",
    text: "قبل أن تبدأ الدرس، استرجع ما سيُبنى عليه.",
    tag: "تذكّر",
    ac: "#B5476B", darkAc: "#E08AA8", soft: "rgba(181, 71, 107, 0.12)", ink: "var(--lp-text)",
    fd: "6.4s", dl: "-2.6s", rot: "-0.3deg",
    points: ["تعريفات ومفاهيم سابقة يبني عليها الدرس", "معلومات قديمة تحتاج أن تتذكّرها قبل البدء", "فكّر في كل نقطة ثم اضغط لتتأكد"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
        <path d="M12 8v4l3 2" />
      </svg>
    ),
  },
];

const D = (ms) => ({ "--d": `${ms}ms` });
const fs = (n) => ({ fontSize: `calc(${n}px * var(--ts, 1))` });

function SampleChip() {
  const tr = useT();
  return (
    <g className="msc-rise" style={D(1100)}>
      <rect x="18" y="212" width="74" height="16" rx="8" fill="var(--lp-surface)" stroke="var(--lp-line)" strokeWidth="1.4" />
      <text x="55" y="223.5" textAnchor="middle" style={fs(9.5)} fontWeight="800" fill="var(--lp-muted)">{tr("شكل توضيحي", "Illustration")}</text>
    </g>
  );
}

function ProgressArt({ ac }) {
  const tr = useT();
  const rows = [
    { y: 40, t: B("الوحدة الأولى", "Unit 1"), w: 120, d: 450 },
    { y: 78, t: B("الوحدة الثانية", "Unit 2"), w: 72, d: 600 },
    { y: 116, t: B("الوحدة الثالثة", "Unit 3"), w: 30, d: 750 },
  ];
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label={tr("لوحة الطالب: حلقة تقدّم، وتقدّم كل وحدة، وزر استكمال من حيث توقفت", "Student dashboard: a progress ring, progress for each unit, and a continue-where-you-left-off button")}>
      <g className="msc-pop" style={D(0)}>
        <rect x="14" y="12" width="372" height="148" rx="18" fill="var(--lp-surface)" stroke={ac} strokeWidth="2.5" />
      </g>
      <circle cx="84" cy="86" r="40" fill="none" stroke="var(--lp-line)" strokeWidth="11" />
      <path className="msc-draw" pathLength="1" d="M84 46 A40 40 0 1 1 47.75 102.9" fill="none" stroke={ac} strokeWidth="11" strokeLinecap="round" style={D(250)} />
      <g className="msc-pop" style={D(500)}>
        <text x="84" y="84" textAnchor="middle" style={fs(14)} fontWeight="900" fill="var(--lp-text)">{tr("تقدّمي", "My progress")}</text>
        <text x="84" y="101" textAnchor="middle" style={fs(10.5)} fontWeight="700" fill="var(--lp-muted)">{tr("في الفصل", "this term")}</text>
      </g>
      {rows.map((r) => (
        <g key={tr(r.t)} className="msc-rise" style={D(r.d)}>
          <text x="368" y={r.y} textAnchor="start" style={fs(12)} fontWeight="800" fill="var(--lp-text)">{tr(r.t)}</text>
          <rect x="176" y={r.y + 8} width="192" height="9" rx="4.5" fill="var(--lp-line)" />
          <rect x={368 - r.w} y={r.y + 8} width={r.w} height="9" rx="4.5" fill={ac} />
        </g>
      ))}
      <g className="msc-pop" style={D(900)}>
        <rect x="14" y="172" width="372" height="36" rx="18" fill={ac} />
        <circle cx="362" cy="190" r="12" fill="#fff" />
        <path d="M358.5 184.5l9 5.5-9 5.5z" fill={ac} />
        <text x="340" y="195" textAnchor="start" style={fs(13)} fontWeight="800" fill="#fff">{tr("استكمل من حيث توقفت", "Continue learning")}</text>
        <path d="M34 183l-7 7 7 7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <SampleChip />
    </svg>
  );
}

function DykArt({ ac }) {
  const tr = useT();
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label={tr("بطاقة هل تعلم؟ تعرض معلومة قصيرة جديدة في كل زيارة", "A “Did you know?” card showing a new short fact on every visit")}>
      <g className="msc-pop" style={D(0)}>
        <rect x="40" y="20" width="320" height="156" rx="22" fill="var(--lp-surface)" stroke={ac} strokeWidth="2.5" />
      </g>
      <circle className="msc-pulse" cx="324" cy="62" r="24" fill="none" stroke={ac} strokeWidth="2" />
      <g className="msc-pop" style={D(250)}>
        <circle cx="324" cy="62" r="24" fill={ac} opacity=".16" />
        <g transform="translate(310 48) scale(1.17)" fill="none" stroke={ac} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" />
        </g>
      </g>
      <text className="msc-rise" style={{ ...D(350), ...fs(20) }} x="288" y="70" textAnchor="start" fontWeight="900" fill="var(--lp-text)">{tr("هل تعلم؟", "Did you know?")}</text>
      {[{ y: 100, w: 264 }, { y: 120, w: 232 }, { y: 140, w: 160 }].map((l, i) => (
        <rect key={l.y} className="msc-rise" style={D(550 + i * 140)} x={336 - l.w} y={l.y} width={l.w} height="9" rx="4.5" fill="var(--lp-line)" />
      ))}
      <g className="msc-pop" style={D(1000)}>
        <rect x="104" y="188" width="192" height="30" rx="15" fill={ac} />
        <text x="200" y="207.5" textAnchor="middle" style={fs(12.5)} fontWeight="800" fill="#fff">{tr("معلومة جديدة في كل زيارة", "A new fact each visit")}</text>
      </g>
      <circle className="msc-pop" style={D(1150)} cx="56" cy="40" r="4.5" fill={ac} opacity=".55" />
      <circle className="msc-pop" style={D(1250)} cx="350" cy="196" r="4" fill={ac} opacity=".45" />
    </svg>
  );
}

function ScenesArt({ ac }) {
  const tr = useT();
  const rows = [
    { t: B("العنوان 1", "Section 1"), s: "done" },
    { t: B("العنوان 2", "Section 2"), s: "done" },
    { t: B("العنوان 3", "Section 3"), s: "current" },
    { t: B("العنوان 4", "Section 4"), s: "locked" },
    { t: B("العنوان 5", "Section 5"), s: "locked" },
  ];
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label={tr("قائمة عناوين الدرس: مكتمل وحالي ومقفل، مع شريط عدد العناوين المكتملة", "Lesson sections list: completed, current and locked, with a completed-sections bar")}>
      <g className="msc-pop" style={D(0)}>
        <rect x="14" y="12" width="216" height="192" rx="16" fill="var(--lp-surface)" stroke="var(--lp-line)" strokeWidth="2" />
        <rect x="104" y="30" width="110" height="12" rx="6" fill={ac} />
        {[{ y: 56, w: 176 }, { y: 74, w: 150 }, { y: 92, w: 168 }, { y: 110, w: 118 }].map((l) => (
          <rect key={l.y} x={214 - l.w} y={l.y} width={l.w} height="8" rx="4" fill="var(--lp-line)" />
        ))}
        <rect x="26" y="168" width="76" height="26" rx="13" fill={ac} />
        <text x="64" y="185" textAnchor="middle" style={fs(11.5)} fontWeight="800" fill="#fff">{tr("التالي", "Next")}</text>
        <rect x="130" y="168" width="84" height="26" rx="13" fill="var(--lp-surface)" stroke={ac} strokeWidth="1.8" />
        <text x="172" y="185" textAnchor="middle" style={fs(11.5)} fontWeight="800" fill="var(--lp-text)">{tr("السابق", "Previous")}</text>
      </g>

      <g className="msc-pop" style={D(150)}>
        <rect x="240" y="12" width="146" height="192" rx="16" fill="var(--lp-surface)" stroke={ac} strokeWidth="2.5" />
      </g>
      <text className="msc-rise" style={{ ...D(250), ...fs(11) }} x="313" y="34" textAnchor="middle" fontWeight="800" fill="var(--lp-muted)">{tr("عناوين الدرس", "Lesson sections")}</text>
      {rows.map((r, i) => {
        const y = 44 + i * 25;
        const cur = r.s === "current";
        const done = r.s === "done";
        return (
          <g key={tr(r.t)} className="msc-rise" style={D(350 + i * 110)}>
            <rect x="248" y={y} width="130" height="21" rx="10.5" fill={cur ? ac : done ? ac : "var(--lp-surface)"} fillOpacity={cur ? 1 : done ? 0.14 : 1} stroke={r.s === "locked" ? "var(--lp-line)" : "none"} strokeWidth="1.6" strokeDasharray={r.s === "locked" ? "3 3" : undefined} />
            <text x="368" y={y + 14.5} textAnchor="start" style={fs(11)} fontWeight="800" fill={cur ? "#fff" : "var(--lp-text)"} opacity={r.s === "locked" ? 0.55 : 1}>{tr(r.t)}</text>
            {done && (
              <g>
                <circle cx="260" cy={y + 10.5} r="7" fill={ac} />
                <path d={`M256.6 ${y + 10.6}l2.6 2.6 4.4-4.8`} fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
            {cur && (
              <g>
                <circle className="msc-pulse" cx="260" cy={y + 10.5} r="7" fill="none" stroke="#fff" strokeWidth="1.6" />
                <circle cx="260" cy={y + 10.5} r="3.4" fill="#fff" />
              </g>
            )}
            {r.s === "locked" && (
              <g opacity=".6" fill="none" stroke="var(--lp-text)" strokeWidth="1.7" strokeLinecap="round">
                <rect x="256" y={y + 9} width="9" height="7" rx="1.8" fill="var(--lp-text)" stroke="none" />
                <path d={`M258 ${y + 9}v-2a2.5 2.5 0 0 1 5 0v2`} />
              </g>
            )}
          </g>
        );
      })}
      <g className="msc-rise" style={D(1000)}>
        <text x="378" y="182" textAnchor="start" style={fs(10)} fontWeight="800" fill="var(--lp-muted)">{tr("عناوين مكتملة", "Sections done")}</text>
        <rect x="248" y="190" width="130" height="7" rx="3.5" fill="var(--lp-line)" />
        <rect x="318" y="190" width="60" height="7" rx="3.5" fill={ac} />
      </g>
      <SampleChip />
    </svg>
  );
}

function WordsArt({ ac }) {
  const tr = useT();
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label={tr("كلمة مظلّلة داخل الشرح تفتح نافذة بتعريف وصورة ورابط إلى المشهد المرتبط", "A highlighted word in the explanation opens a popup with a definition, a picture and a link to the related scene")}>
      <g className="msc-pop" style={D(0)}>
        <rect x="14" y="10" width="372" height="116" rx="16" fill="var(--lp-surface)" stroke="var(--lp-line)" strokeWidth="2" />
      </g>
      <rect className="msc-rise" style={D(150)} x="70" y="30" width="300" height="8" rx="4" fill="var(--lp-line)" />
      <rect className="msc-rise" style={D(250)} x="252" y="52" width="118" height="8" rx="4" fill="var(--lp-line)" />
      <rect className="msc-hl" x="166" y="46" width="80" height="20" rx="6" fill={ac} />
      <path d="M170 68h72" stroke={ac} strokeWidth="2" strokeLinecap="round" />
      <rect className="msc-rise" style={D(350)} x="40" y="52" width="118" height="8" rx="4" fill="var(--lp-line)" />
      <rect className="msc-rise" style={D(450)} x="110" y="76" width="260" height="8" rx="4" fill="var(--lp-line)" />
      <rect className="msc-rise" style={D(550)} x="180" y="98" width="190" height="8" rx="4" fill="var(--lp-line)" />

      <g className="msc-fadein">
        <rect x="100" y="88" width="270" height="130" rx="16" fill="var(--lp-surface)" stroke={ac} strokeWidth="2.5" />
        <rect x="294" y="100" width="64" height="10" rx="5" fill={ac} />
        <text x="116" y="109" textAnchor="end" style={fs(11)} fontWeight="800" fill="var(--lp-muted)">✕</text>
        <path d="M114 118H356" stroke="var(--lp-line)" strokeWidth="1.6" />
        <rect x="274" y="126" width="82" height="50" rx="10" fill="var(--msc-svg-soft)" />
        <circle cx="338" cy="138" r="5" fill={ac} opacity=".7" />
        <path d="M280 170l20-22 14 14 9-9 28 17z" fill={ac} opacity=".65" />
        <rect x="118" y="130" width="140" height="8" rx="4" fill="var(--lp-line)" />
        <rect x="138" y="148" width="120" height="8" rx="4" fill="var(--lp-line)" />
        <rect x="128" y="166" width="130" height="8" rx="4" fill="var(--lp-line)" />
        <rect x="114" y="184" width="242" height="24" rx="12" fill={ac} />
        <text x="235" y="200" textAnchor="middle" style={fs(11)} fontWeight="800" fill="#fff">{tr("الانتقال إلى المشهد المرتبط ↗", "Go to related scene ↗")}</text>
      </g>
    </svg>
  );
}

function VideoArt({ ac }) {
  const tr = useT();
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label={tr("مشغّل فيديو داخل صفحة الدرس، ثم الانتقال إلى الشرح والخرائط والأسئلة", "A video player inside the lesson page, then on to the explanation, maps and questions")}>
      <g className="msc-pop" style={D(0)}>
        <rect x="40" y="10" width="320" height="170" rx="18" fill="#263B35" stroke={ac} strokeWidth="2.5" />
      </g>
      <text className="msc-rise" style={{ ...D(250), ...fs(12) }} x="344" y="36" textAnchor="start" fontWeight="800" fill="#fff">{tr("🎥 شاهد فيديو الدرس", "🎥 Watch the lesson video")}</text>
      <circle className="msc-pulse" cx="200" cy="96" r="30" fill="none" stroke={ac} strokeWidth="2.4" />
      <g className="msc-pop" style={D(400)}>
        <circle cx="200" cy="96" r="30" fill={ac} />
        <path d="M192 82l24 14-24 14z" fill="#fff" />
      </g>
      <g className="msc-rise" style={D(650)}>
        <rect x="64" y="154" width="272" height="7" rx="3.5" fill="#fff" opacity=".25" />
        <rect className="msc-bar" x="64" y="154" width="272" height="7" rx="3.5" fill={ac} />
      </g>
      {[{ x: 276, t: B("الشرح المكتوب", "Written notes"), d: 800 }, { x: 156, t: B("الخرائط", "Maps"), d: 950 }, { x: 36, t: B("الأسئلة", "Questions"), d: 1100 }].map((c) => (
        <g key={tr(c.t)} className="msc-pop" style={D(c.d)}>
          <rect x={c.x} y="194" width="88" height="24" rx="12" fill="var(--lp-surface)" stroke={ac} strokeWidth="1.8" />
          <text x={c.x + 44} y="210" textAnchor="middle" style={fs(11)} fontWeight="800" fill="var(--lp-text)">{tr(c.t)}</text>
        </g>
      ))}
      <path className="msc-flow" d="M270 206h-16" stroke={ac} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path className="msc-flow" d="M150 206h-16" stroke={ac} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function MindArt({ ac }) {
  const tr = useT();
  const nodes = [
    { x: 39, y: 24, w: 86, t: B("الموقع", "Location"), e: "M170 96 Q140 52 125 41", d: 350 },
    { x: 275, y: 24, w: 86, t: B("المظاهر", "Features"), e: "M230 96 Q262 52 275 41", d: 480 },
    { x: 303, y: 100, w: 90, t: B("المناخ", "Climate"), e: "M238 115 Q272 115 303 115", d: 610 },
    { x: 275, y: 176, w: 86, t: B("السكان", "Population"), e: "M230 134 Q262 178 275 191", d: 740 },
    { x: 39, y: 176, w: 86, t: B("الموارد", "Resources"), e: "M170 134 Q140 178 125 191", d: 870 },
    { x: 3, y: 100, w: 106, t: B("السبب والنتيجة", "Cause & effect"), e: "M164 115 Q134 115 106 115", d: 1000 },
  ];
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label={tr("خريطة ذهنية: فكرة رئيسية تتفرع منها خمسة أفرع", "Mind map: a main idea with five branches")}>
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
        <text x="200" y="111" textAnchor="middle" style={fs(13)} fontWeight="800" fill="#fff">{tr("العالم", "New")}</text>
        <text x="200" y="128" textAnchor="middle" style={fs(13)} fontWeight="800" fill="#fff">{tr("الجديد", "World")}</text>
      </g>
      {nodes.map((n) => (
        <g key={tr(n.t)} className="msc-pop" style={D(n.d)}>
          <rect x={n.x} y={n.y} width={n.w} height="32" rx="16" fill="var(--lp-surface)" stroke={ac} strokeWidth="2.2" />
          <text x={n.x + n.w / 2} y={n.y + 20.5} textAnchor="middle" style={fs(12)} fontWeight="800" fill="var(--lp-text)">{tr(n.t)}</text>
        </g>
      ))}
      <circle className="msc-pop" style={D(1150)} cx="26" cy="64" r="5" fill={ac} opacity=".55" />
      <circle className="msc-pop" style={D(1250)} cx="378" cy="70" r="4" fill={ac} opacity=".45" />
      <circle className="msc-pop" style={D(1350)} cx="196" cy="214" r="4.5" fill={ac} opacity=".5" />
    </svg>
  );
}

function TimelineArt({ ac }) {
  const tr = useT();
  const ev = [
    { x: 330, up: true, y: "1492", t: B("وصول كولومبس", "Columbus arrives"), d: 300 },
    { x: 240, up: false, y: "1519", t: B("رحلة ماجلان", "Magellan’s voyage"), d: 500 },
    { x: 150, up: true, y: "1607", t: B("تأسيس جيمستاون", "Jamestown founded"), d: 700 },
    { x: 60, up: false, y: "1776", t: B("إعلان الاستقلال", "Independence"), d: 900 },
  ];
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label={tr("خط زمني بأربعة أحداث مرتبة", "A timeline of four events in order")}>
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
              <circle cx={e.x} cy="118" r="11" fill="var(--lp-surface)" stroke={ac} strokeWidth="3.2" />
              <circle cx={e.x} cy="118" r="4.2" fill={ac} />
            </g>
            <g className="msc-pop" style={D(e.d + 120)}>
              <rect x={e.x - 56} y={cy} width="112" height="54" rx="14" fill="var(--lp-surface)" stroke={ac} strokeWidth="2" />
              <text x={e.x} y={cy + 24} textAnchor="middle" style={fs(16)} fontWeight="900" fill={ac}>{e.y}</text>
              <text x={e.x} y={cy + 42} textAnchor="middle" style={fs(11)} fontWeight="800" fill="var(--lp-text)">{tr(e.t)}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function QuizArt({ ac }) {
  const tr = useT();
  const rows = [
    { y: 84, t: B("المحيط الأطلسي", "Atlantic"), cls: "msc-q-wrong" },
    { y: 126, t: B("المحيط الهادئ", "Pacific"), cls: "msc-q-right" },
    { y: 168, t: B("المحيط الهندي", "Indian"), cls: "" },
  ];
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label={tr("سؤال باختيارات والإجابة الصحيحة تُضيء", "A multiple-choice question with the correct answer lighting up")}>
      <g className="msc-pop" style={D(0)}>
        <rect x="24" y="12" width="352" height="54" rx="16" fill={ac} />
        <text x="200" y="35" textAnchor="middle" style={fs(11)} fontWeight="800" fill="#fff" opacity=".85">{tr("سؤال ١", "Question 1")}</text>
        <text x="200" y="54" textAnchor="middle" style={fs(13.5)} fontWeight="800" fill="#fff">{tr("أي المحيطات يقع غرب أمريكا الجنوبية؟", "Which ocean is west of South America?")}</text>
      </g>
      {rows.map((r, i) => (
        <g key={tr(r.t)} className="msc-rise" style={D(250 + i * 140)}>
          <rect className={r.cls} x="24" y={r.y} width="352" height="36" rx="12" fill="var(--lp-surface)" stroke="var(--lp-line)" strokeWidth="2" />
          <circle cx="352" cy={r.y + 18} r="9" fill="var(--lp-surface)" stroke={ac} strokeWidth="2" />
          <text x="332" y={r.y + 23} textAnchor="start" style={fs(13)} fontWeight="800" fill="var(--lp-text)">{tr(r.t)}</text>
          {r.cls === "msc-q-right" && (
            <g className="msc-q-check">
              <circle cx="352" cy={r.y + 18} r="9" fill={ac} />
              <path d={`M347.5 ${r.y + 18.5}l3.6 3.6 6-6.6`} stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          )}
          {r.cls === "msc-q-right" && (
            <g className="msc-q-chip">
              <rect x="30" y={r.y + 6} width="64" height="24" rx="12" fill={ac} />
              <text x="62" y={r.y + 22.5} textAnchor="middle" style={fs(11.5)} fontWeight="800" fill="#fff">{tr("أحسنت!", "Well done!")}</text>
            </g>
          )}
        </g>
      ))}
      <g className="msc-rise" style={D(900)}>
        <rect x="24" y="214" width="352" height="8" rx="4" fill="var(--lp-line)" />
        <rect className="msc-q-fill" x="24" y="214" width="352" height="8" rx="4" fill={ac} />
      </g>
    </svg>
  );
}

function RecallArt({ ac }) {
  const tr = useT();
  const rows = [
    { y: 46, t: B("تعريف من درس سابق", "Definition from a past lesson"), s: "shown", d: 250 },
    { y: 82, t: B("معلومة سبق أن درستها", "Something you’ve studied"), s: "shown", d: 380 },
    { y: 118, t: B("فكرة يبني عليها الدرس", "An idea the lesson builds on"), s: "reveal", d: 510 },
    { y: 154, t: "", s: "hidden", d: 640 },
  ];
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label={tr("تذكّر سريع قبل الدرس: نقاط من دروس سابقة، بعضها ظاهر وبعضها يظهر عند الضغط بعد التفكير", "Quick recall before the lesson: points from earlier lessons, some shown and some revealed on tap after thinking")}>
      <g className="msc-pop" style={D(0)}>
        <rect x="14" y="10" width="372" height="188" rx="16" fill="var(--lp-surface)" stroke={ac} strokeWidth="2.4" />
        <text x="372" y="33" textAnchor="start" style={fs(13)} fontWeight="900" fill={ac}>{tr("تذكّر سريع", "Quick recall")}</text>
        <rect x="28" y="19" width="84" height="20" rx="10" fill={ac} />
        <text x="70" y="33" textAnchor="middle" style={fs(10.5)} fontWeight="800" fill="#fff">{tr("قبل الدرس", "Before the lesson")}</text>
      </g>
      {rows.map((r, i) => (
        <g key={i} className="msc-rise" style={D(r.d)}>
          {r.s !== "hidden" && <rect x="28" y={r.y} width="344" height="28" rx="14" fill={ac} opacity=".1" />}
          {r.s !== "hidden" && <text x="358" y={r.y + 18} textAnchor="start" style={fs(11.5)} fontWeight="800" fill="var(--lp-text)">{tr(r.t)}</text>}
          {r.s === "reveal" && (
            <g className="msc-cover">
              <rect x="28" y={r.y} width="344" height="28" rx="14" fill="var(--lp-surface)" stroke={ac} strokeWidth="1.4" strokeDasharray="3 3" />
              <text x="200" y={r.y + 18} textAnchor="middle" style={fs(10)} fontWeight="800" fill="var(--lp-muted)">{tr("نقطة 3 — اضغط لإظهارها بعد ما تفكّر", "Point 3 — tap to reveal after you think")}</text>
            </g>
          )}
          {r.s === "hidden" && (
            <g>
              <rect x="28" y={r.y} width="344" height="28" rx="14" fill="var(--lp-surface)" stroke={ac} strokeWidth="1.4" strokeDasharray="3 3" />
              <text x="200" y={r.y + 18} textAnchor="middle" style={fs(10)} fontWeight="800" fill="var(--lp-muted)">{tr("نقطة 4 — اضغط لإظهارها بعد ما تفكّر", "Point 4 — tap to reveal after you think")}</text>
            </g>
          )}
        </g>
      ))}
      <SampleChip />
    </svg>
  );
}

const ARTS = { progress: ProgressArt, dyk: DykArt, scenes: ScenesArt, words: WordsArt, video: VideoArt, mind: MindArt, timeline: TimelineArt, quiz: QuizArt, recall: RecallArt };

const PHASES = [
  { id: "dash", title: "لوحتك", sub: "أول ما تفتح المنصة", ids: ["progress", "dyk"] },
  { id: "before", title: "قبل الدرس", sub: "استرجع ما سيُبنى عليه الدرس", ids: ["recall"] },
  { id: "lesson", title: "داخل الدرس", sub: "من الفيديو إلى الأسئلة والمراجعة", ids: ["video", "scenes", "words", "mind", "timeline", "quiz"] },
];

const FEATURES_EN = {
  progress: { title: "Track your progress", text: "See how many lessons you’ve finished and how many are left in the term, and continue where you stopped.", tag: "Track", points: ["Your progress percentage and completed lessons", "Progress for each unit separately", "Your progress is saved so you can continue from where you stopped"] },
  dyk: { title: "Did you know?", text: "A short fact on every visit that sticks in your memory effortlessly.", tag: "Lock it in", points: ["A new fact from your curriculum on every visit", "Tailored to your stage and grade"] },
  scenes: { title: "Lessons split into sections", text: "Every lesson is split into short sections; finish each one and track your progress inside the lesson.", tag: "Break down", points: ["A list of lesson sections beside the content", "A bar showing completed sections", "The next section unlocks after you finish the previous one"] },
  words: { title: "Interactive explanation words", text: "Key words in the explanation are highlighted: tap one to see what clarifies its meaning.", tag: "Understand", points: ["A definition or note that explains the word", "A picture that clarifies the word if it isn’t clear"] },
  video: { title: "Lesson explainer video", text: "Watch the lesson video inside the lesson page itself without leaving the platform.", tag: "Watch", points: ["Video inside the lesson page, no external link", "Press play to start watching", "Then continue with the explanation, maps and questions"] },
  mind: { title: "Mind maps", text: "Connect ideas together so you remember and understand them easily.", tag: "Connect", points: ["A main idea that branches into details", "Links that show how information relates", "Easier, faster recall"] },
  timeline: { title: "Timelines", text: "Follow events in their correct order through time.", tag: "Order", points: ["Events in the correct order", "Each event linked to what came before", "See the big picture at once"] },
  quiz: { title: "Questions & review", text: "Test your understanding as you go and review before moving on.", tag: "Review", points: ["Test your understanding step by step", "Review before moving on", "Lock in what you’ve learned"] },
  recall: { title: "Quick recall", text: "Before you start the lesson, recall what it builds on.", tag: "Recall", points: ["Definitions and concepts from earlier that the lesson builds on", "Old information you need to remember before starting", "Think about each point, then tap to check"] },
};
const PHASES_EN = {
  dash: { title: "Your dashboard", sub: "As soon as you open the platform" },
  before: { title: "Before the lesson", sub: "Recall what the lesson builds on" },
  lesson: { title: "Inside the lesson", sub: "From video to questions and review" },
};

function useSeen(ref) {
  const [seen, setSeen] = useState(false);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); setLive(true); return undefined; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { setLive(e.isIntersecting); if (e.isIntersecting) setSeen(true); }), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return [seen, live];
}

const RAIL_ICONS = {
  progress: ["M3 3v18h18", "M7 15l4-4 3 3 5-6"],
  dyk: ["M9 18h6", "M10 21h4", "M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"],
  recall: ["M3 12a9 9 0 0 1 15-6.7L21 8", "M21 3v5h-5", "M21 12a9 9 0 0 1-15 6.7L3 16", "M3 21v-5h5"],
  video: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  scenes: ["M4 6h16", "M4 12h16", "M4 18h10"],
  words: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  mind: "M11 4a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2V4zm-6 8a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1zm12 0a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1zM4 20h16",
  timeline: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  quiz: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
};

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const numL = (n, lang) => (lang === "ar" ? String(n).replace(/\d/g, (d) => AR_DIGITS[d]) : String(n));

function MadarJourney({ isDark }) {
  const lang = useContext(LangCtx);
  const tr = makeT(lang);
  const byId = Object.fromEntries(FEATURES.map((f) => [f.id, f]));
  const order = PHASES.flatMap((ph) => ph.ids);
  const phaseOf = {};
  PHASES.forEach((ph, pi) => ph.ids.forEach((id) => { phaseOf[id] = { ph, pi }; }));
  const listRef = useRef(null);
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(() => new Set([0]));

  // البطاقات تتراكم فوق بعضها أثناء التمرير: كل بطاقة تصغر قليلًا حين تغطيها التالية
  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    let raf = 0;
    const run = () => {
      raf = 0;
      const desk = window.matchMedia?.("(min-width: 900px)").matches;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const items = Array.from(list.children);
      // على الموبايل نفعّل التراكم فقط لو أطول كارت يتّسع في الشاشة، وإلا يبقى سكرول عادي
      let stack = desk;
      if (!desk) {
        const tallest = Math.max(0, ...items.map((el) => (el.firstElementChild ? el.firstElementChild.offsetHeight : 0)));
        stack = tallest > 0 && tallest + 170 <= window.innerHeight;
      }
      list.dataset.stack = stack ? "1" : "0";
      let act = 0;
      const seenNow = [];
      items.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) seenNow.push(i);
        let t = 0;
        if (stack) {
          const stickyTop = parseFloat(window.getComputedStyle(el).top) || 0;
          if (r.top <= stickyTop + 6) act = i;
          const nxt = items[i + 1];
          if (nxt && !reduce) {
            const d = nxt.getBoundingClientRect().top - stickyTop;
            t = Math.min(1, Math.max(0, 1 - d / el.offsetHeight));
          }
        } else if (r.top < window.innerHeight * 0.5) {
          act = i;
        }
        el.style.setProperty("--t", t.toFixed(3));
        el.dataset.covered = t > 0.55 ? "1" : "0";
      });
      setActive((prev) => (prev === act ? prev : act));
      setShown((prev) => {
        if (seenNow.every((i) => prev.has(i))) return prev;
        const next = new Set(prev);
        seenNow.forEach((i) => next.add(i));
        return next;
      });
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(run); };
    run();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const go = (i) => {
    const el = listRef.current?.children[i];
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <section id="services" className="lp-journey" aria-labelledby="lp-journey-title">
      <Reveal className="lp-journey-head">
        <span className="lp-badge"><span className="lp-badge-dot" />{tr("خدماتنا التعليمية", "Our learning services")}</span>
        <h2 id="lp-journey-title">{tr("رحلتك على مَدَار خطوة بخطوة", "Your Madar journey, step by step")}</h2>
        <p>{tr("هذه هي المنصة نفسها: كل خطوة هنا ترسم عنصرًا موجودًا فعلًا في واجهة الطالب، بالترتيب الذي ستمر به.", "This is the platform itself: every step here illustrates something that really exists in the student interface, in the order you’ll meet it.")}</p>
      </Reveal>

      <Reveal as="nav" className="lp-rail" aria-label={tr("مميزات التعلّم التسعة", "The nine learning features")}>
        <ol>
          {order.map((id, i) => {
            const f = byId[id];
            const fl = lang === "en" ? { ...f, ...FEATURES_EN[id] } : f;
            return (
              <li key={id}>
                <a href={`#feat-${id}`} className={i === active ? "is-active" : ""} onClick={(e) => { e.preventDefault(); go(i); }} style={{ "--ac": isDark ? f.darkAc : f.ac, "--soft": f.soft }}>
                  <span className="lp-rail-ico"><Ico d={RAIL_ICONS[id]} size={16} /></span>
                  <b>{fl.title}</b>
                  <span className="lp-rail-n">{numL(i + 1, lang)}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </Reveal>

      <span id="dashboard" className="lp-anchor" aria-hidden="true" />
      <ol className="lp-sk" ref={listRef}>
        {order.map((id, i) => {
          const base = byId[id];
          const f = lang === "en" ? { ...base, ...FEATURES_EN[id] } : base;
          const ac = isDark ? base.darkAc : base.ac;
          const Art = ARTS[id];
          const { ph, pi } = phaseOf[id];
          return (
            <li key={id} id={`feat-${id}`} className="lp-sk-slide" style={{ "--i": i }}>
              <article className="lp-sk-card" style={{ "--ac": ac, "--soft": base.soft }}>
                <span className="lp-sk-n" aria-hidden="true">{numL(i + 1, lang)}</span>
                <div className="lp-sk-copy">
                  <span className="lp-sk-phase"><i>{numL(pi + 1, lang)}</i>{tr(ph.title, PHASES_EN[ph.id].title)}</span>
                  <h4 className="msc-card is-on" style={{ "--ac": ac, "--soft": base.soft, "--ink": base.ink, "--fd": base.fd, "--dl": base.dl, "--rot": base.rot }}>
                    <span className="msc-card-bar" aria-hidden="true" />
                    <span className="msc-card-icon" aria-hidden="true">{base.icon}</span>
                    <span className="msc-card-body"><b>{f.title}</b><small>{f.text}</small></span>
                    <span className="msc-card-tag">{f.tag}</span>
                  </h4>
                  <ul className="lp-sk-points">{f.points.map((pt) => <li key={pt}><i aria-hidden="true">✓</i>{pt}</li>)}</ul>
                </div>
                <div className="lp-window lp-sk-art">
                  <div className="lp-window-bar" aria-hidden="true"><i /><i /><i /><span>{tr("واجهة الطالب", "Student interface")}</span></div>
                  <div className="lp-step-canvas">{shown.has(i) && <Art ac={ac} />}</div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ===== أقسام مدمجة من madar_educational_platform.html ===== */
function Ico({ d, size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {(Array.isArray(d) ? d : [d]).map((p) => <path key={p} d={p} />)}
    </svg>
  );
}
const ICON_PATHS = {"home": "M3 11l9-8 9 8M5 10v10h14V10", "info": ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 11v5M12 8h.01"], "spark": "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z", "phone": "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", "help": ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5M12 17h.01"], "chat": "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", "chevron": "M19 9l-7 7-7-7", "pin": ["M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z", "M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"], "wa": "M21 12a9 9 0 01-13.4 7.8L3 21l1.3-4.4A9 9 0 1121 12z", "mail": ["M3 5h18v14H3z", "M3 7l9 6 9-6"], "dash": ["M3 3v18h18", "M7 15l4-4 3 3 5-6"], "cap": ["M22 10 12 5 2 10l10 5 10-5z", "M6 12v5c3 2 9 2 12 0v-5"], "family": ["M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2", "M10 11a4 4 0 100-8 4 4 0 000 8z", "M21 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"], "board": ["M3 4h18v12H3z", "M12 16v4", "M8 20h8"]};
const NAV = [
  { id: "top", ar: "الرئيسية", en: "Home", icon: ICON_PATHS.home },
  { id: "about", ar: "عن المنصة", en: "About", icon: ICON_PATHS.info },
  { id: "services", ar: "خدماتنا التعليمية", en: "Our services", icon: ICON_PATHS.spark },
  { id: "dashboard", ar: "لوحتك", en: "Your dashboard", icon: ICON_PATHS.dash },
  { id: "contact", ar: "تواصل معنا", en: "Contact us", icon: ICON_PATHS.mail },
  { id: "faq", ar: "الأسئلة الشائعة", en: "FAQ", icon: ICON_PATHS.help },
];
const AUDIENCE = [
  { id: "students", icon: ICON_PATHS.cap, ar: { t: "الطلاب", d: "فهم ممتع لكل درس بدلًا من الحفظ المرهق." }, en: { t: "Students", d: "Enjoyable understanding of every lesson instead of exhausting memorization." } },
];
const FAQS = [{"ar": {"q": "ما هي المراحل الدراسية التي تستهدفها منصة مَدَار؟", "a": "تستهدف المنصة بصورة متخصصة طلاب المرحلة الإعدادية في جمهورية مصر العربية (الصف الأول، الثاني، والثالث الإعدادي)، كما تخدم أولياء الأمور الراغبين في متابعة أبنائهم، والمعلمين المهتمين بتطوير أساليب تدريس الدراسات الاجتماعية."}, "en": {"q": "Which grade levels does Madar target?", "a": "The platform specifically targets middle school students in Egypt (1st, 2nd and 3rd Prep), while also supporting parents tracking progress and teachers looking for updated social studies techniques."}}, {"ar": {"q": "كيف تساعد المنصة على الفهم بدلاً من الحفظ الجاف؟", "a": "تعتمد منصة مَدَار على أدوات وشروح مبتكرة تشمل الخرائط الذهنية التفاعلية لتلخيص الدروس، والخطوط الزمنية لترتيب الأحداث التاريخية، والخرائط الجغرافية التوضيحية لربط الأسباب بالنتائج بشكل بصري ممتع."}, "en": {"q": "How does Madar promote understanding over memorization?", "a": "Madar uses interactive mind maps to summarize concepts, timelines to put history in context, and visual maps to link causes with outcomes naturally."}}, {"ar": {"q": "هل المنهج المتاح يطابق المنهج المصري الرسمي؟", "a": "نعم، المحتوى التعليمي منظم تمامًا وفقًا للمناهج الدراسية المصرية الرسمية المعرفية لطلاب المرحلة الإعدادية، ويشمل التدريبات والمراجعات النهائية للعام الدراسي."}, "en": {"q": "Is the content aligned with the official Egyptian curriculum?", "a": "Yes. All educational content is organized according to the official Egyptian Ministry of Education middle school curriculum."}}, {"ar": {"q": "هل الخدمات متاحة في جميع محافظات مصر؟", "a": "نعم، منصة مَدَار هي منصة رقمية متاحة بالكامل عبر الإنترنت في جميع محافظات جمهورية مصر العربية، ويمكن للطلاب الوصول إليها في أي وقت ومن أي مكان عبر الرابط المخصص للطالب."}, "en": {"q": "Is Madar accessible from all Egyptian governorates?", "a": "Yes. Madar is a 100% online platform accessible any time from any governorate in Egypt through the student portal."}}];
const CONTACT_EMAIL = "aantounyouss@gmail.com";

function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || typeof IntersectionObserver === "undefined") { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`lp-reveal${shown ? " is-in" : ""} ${className}`.trim()} style={{ "--rv": `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

function SecHead({ id, badge, title, sub }) {
  return (
    <Reveal className="lp-sec-head">
      <span className="lp-sec-badge">{badge}</span>
      <h2 id={id} className="lp-sec-title">{title}</h2>
      {sub && <p className="lp-sec-sub">{sub}</p>}
    </Reveal>
  );
}

function AboutSection() {
  const tr = useT();
  const stu = tr(AUDIENCE[0]);
  const grades = [
    { n: tr("١", "1"), t: tr("الصف الأول الإعدادي", "1st Prep (Grade 7)") },
    { n: tr("٢", "2"), t: tr("الصف الثاني الإعدادي", "2nd Prep (Grade 8)") },
    { n: tr("٣", "3"), t: tr("الصف الثالث الإعدادي", "3rd Prep (Grade 9)") },
  ];
  return (
    <section id="about" className="lp-sec" aria-labelledby="lp-about-title">
      <Reveal className="lp-about">
        <div className="lp-about-copy">
          <span className="lp-sec-badge">{tr("عن المنصة", "About the platform")}</span>
          <h2 id="lp-about-title" className="lp-about-title">{tr("لمن صُنعت مَدَار؟", "Who is Madar built for?")}</h2>
          <div className="lp-about-student">
            <span className="lp-about-ico"><Ico d={AUDIENCE[0].icon} size={26} /></span>
            <div><h3>{stu.t}</h3><p>{stu.d}</p></div>
          </div>
          <p className="lp-about-stage">
            <b>{tr("مَدَار مخصّصة لطلاب المرحلة الإعدادية.", "Madar is built for middle-school students.")}</b>{" "}
            {tr("افتح المناهج، اختر صفك الدراسي، وتابع دروسك خطوة بخطوة داخل المنصة.", "Open the curricula, pick your grade, and follow your lessons step by step inside the platform.")}
          </p>
        </div>
        <ol id="curricula" className="lp-path" aria-label={tr("الصفوف الدراسية", "Grades")}>
          {grades.map((g, i) => (
            <li key={i} className={`lp-path-item lp-path-${i + 1}`} style={{ "--i": i }}>
              <span className="lp-path-n" aria-hidden="true">{g.n}</span>
              <b>{g.t}</b>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}

/* ===== فهم حقيقي لا حفظ: لوحة تتحوّل من معلومات مبعثرة إلى سلسلة أسباب ونتائج ===== */
const U_CHAIN = [
  { x: 72, y: 14, sx: 22, sy: 20, rot: -7, ar: "موقع متوسط بين القارات", en: "A central spot between continents" },
  { x: 57, y: 38, sx: 74, sy: 32, rot: 6, ar: "ممرات مائية مهمة", en: "Key waterways" },
  { x: 43, y: 62, sx: 30, sy: 60, rot: 4, ar: "مرور حركة التجارة", en: "Trade passes through" },
  { x: 28, y: 86, sx: 74, sy: 82, rot: -6, ar: "أهمية استراتيجية", en: "Strategic importance" },
];
const U_LINKS = [B("لذلك", "so"), B("وبالتالي", "which means"), B("ومن ثَمّ", "hence")];
const U_MIDS = [[64.5, 26.1], [50, 50], [35.5, 73.9]];
const uPath = (a, b) => {
  const x1 = a.x * 4, y1 = a.y * 3.2, x2 = b.x * 4, y2 = b.y * 3.2, my = (y1 + y2) / 2;
  return `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
};

function UnderstandSection() {
  const tr = useT();
  const [mode, setMode] = useState("memo");
  const [auto, setAuto] = useState(true);
  const ref = useRef(null);
  const [, live] = useSeen(ref);
  const get = mode === "get";
  useEffect(() => {
    if (!auto || !live) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = window.setTimeout(() => setMode((m) => (m === "memo" ? "get" : "memo")), mode === "memo" ? 2600 : 5600);
    return () => window.clearTimeout(id);
  }, [auto, live, mode]);
  const pick = (m) => { setAuto(false); setMode(m); };
  return (
    <Reveal as="section" id="understand" className="lp-und" aria-labelledby="lp-und-title">
      <div className="lp-und-panel">
        <div className="lp-und-copy">
          <span className="lp-und-badge"><i />{tr("فهم حقيقي لا حفظ", "Real understanding, not memorization")}</span>
          <h2 id="lp-und-title" className="lp-und-title">
            {tr("افهمها", "Understand it")}
            <span>{tr("واربط المعلومات ببعضها", "and connect the dots")}</span>
          </h2>
          <p className="lp-und-desc">
            {tr(
              "مَدَار تساعدك على فهم أحداث التاريخ وأسرار الجغرافيا بطريقة مبسّطة ومرئية، وتربط الأسباب بالنتائج؛ حتى تستوعب الدرس وتستطيع الإجابة عن سؤال: لماذا؟ لا مجرد حفظ الإجابة.",
              "Madar helps you understand historical events and the secrets of geography in a simple, visual way, linking causes to results — so you grasp the lesson and can answer “why?”, not just memorize the answer.",
            )}
          </p>
          <ul className="lp-und-list">
            <li><i>✓</i><span>{tr("افهم أسباب الأحداث التاريخية ونتائجها بدل حفظها دون ترابط.", "Understand the causes and results of historical events instead of memorizing them in isolation.")}</span></li>
            <li><i>✓</i><span>{tr("اربط المعلومات الجغرافية وافهم أهمية المواقع والموارد والممرات المائية.", "Connect geographic facts and understand why locations, resources and waterways matter.")}</span></li>
            <li><i>✓</i><span>{tr("راجع أفكار الدرس وعلاقاته من خلال الشرح المرئي والخرائط الذهنية والأسئلة، وفقًا للمحتوى المتاح فعلًا في المنصة.", "Review the lesson’s ideas and how they relate through visual explanations, mind maps and questions, based on the content actually available on the platform.")}</span></li>
          </ul>
        </div>

        <div className="lp-und-stage">
          <div className={`lp-und-switch${get ? " is-get" : ""}`} role="radiogroup" aria-label={tr("طريقة الدراسة", "Study style")}>
            <span className="lp-und-thumb" aria-hidden="true" />
            <button type="button" role="radio" aria-checked={!get} className={!get ? "is-on" : ""} onClick={() => pick("memo")}>{tr("حفظ", "Memorize")}</button>
            <button type="button" role="radio" aria-checked={get} className={get ? "is-on" : ""} onClick={() => pick("get")}>{tr("فهم", "Understand")}</button>
          </div>
          <div className={`lp-und-board${get ? " is-get" : ""}`} ref={ref} dir="rtl">
            <svg className="lp-und-lines" viewBox="0 0 400 320" aria-hidden="true">
              {U_CHAIN.slice(0, -1).map((c, i) => (
                <path key={i} d={uPath(c, U_CHAIN[i + 1])} pathLength="1" style={{ "--i": i }} />
              ))}
            </svg>
            {U_LINKS.map((l, i) => (
              <span key={i} className="lp-und-link" style={{ left: `${U_MIDS[i][0]}%`, top: `${U_MIDS[i][1]}%`, "--i": i }}>{tr(l)}</span>
            ))}
            {U_CHAIN.map((c, i) => (
              <span key={i} className="lp-und-chip" style={{ "--x": `${c.x}%`, "--y": `${c.y}%`, "--sx": `${c.sx}%`, "--sy": `${c.sy}%`, "--r": `${c.rot}deg`, "--i": i }}>
                <i>{tr(["١", "٢", "٣", "٤"][i], String(i + 1))}</i>{tr(c.ar, c.en)}
              </span>
            ))}
          </div>
          <p className="lp-und-cap" key={mode} aria-live="polite">
            {get
              ? tr("حين ترى السبب والنتيجة، تثبت المعلومة في ذهنك.", "When you see cause and effect, the fact sticks.")
              : tr("معلومات منفصلة… سهلة النسيان.", "Isolated facts… easy to forget.")}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function MailArt() {
  return (
    <svg className="lp-mail-art" viewBox="0 0 200 140" aria-hidden="true">
      <rect x="20" y="40" width="160" height="90" rx="12" fill="#0A3C34" stroke="rgba(255,255,255,.25)" strokeWidth="2" />
      <g className="lp-mail-letter">
        <rect x="42" y="50" width="116" height="76" rx="8" fill="#FFF6E3" />
        <rect x="58" y="66" width="60" height="7" rx="3.5" fill="#E3C08B" />
        <rect x="58" y="82" width="84" height="6" rx="3" fill="#C9D8D3" />
        <rect x="58" y="96" width="64" height="6" rx="3" fill="#C9D8D3" />
      </g>
      <path d="M20 56 L100 108 L180 56 V118 a12 12 0 0 1 -12 12 H32 a12 12 0 0 1 -12 -12 Z" fill="#147A6A" />
      <circle cx="100" cy="106" r="9" fill="#E3C08B" />
    </svg>
  );
}

const WA_NUMBER = "201055706539";
const WA_DISPLAY = "01055706539";

function ContactSection() {
  const tr = useT();
  const [who, setWho] = useState("prep");
  const whos = [
    { id: "primary", label: tr("طالب ابتدائي", "Primary student") },
    { id: "prep", label: tr("طالب إعدادي", "Middle school student") },
    { id: "secondary", label: tr("طالب ثانوي", "Secondary student") },
  ];
  const cur = whos.find((w) => w.id === who) || whos[1];
  const ar = tr.lang === "ar";
  const text = ar
    ? `السلام عليكم منصة مَدَار، أنا ${cur.label} وعندي سؤال: `
    : `Hello Madar, I am a ${cur.label} and I have a question: `;
  const wa = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  return (
    <section id="contact" className="lp-sec" aria-labelledby="lp-contact-title">
      <SecHead
        id="lp-contact-title"
        badge={tr("تواصل معنا", "Contact us")}
        title={tr("نحن هنا لدعم رحلتك التعليمية", "We’re here to support your journey")}
        sub={tr("يسعدنا الإجابة عن استفسارات الطلاب وأولياء الأمور والمعلمين من جميع محافظات مصر.", "We welcome inquiries from students, parents and teachers across all governorates of Egypt.")}
      />
      <div className="lp-ct-grid">
        <div className="lp-ct-info">
          <div>
            <h3>{tr("منصة مَدَار الرقمية", "Madar digital platform")}</h3>
            <p>{tr("خدمات إلكترونية مريحة ومتاحة أونلاين في كافة محافظات جمهورية مصر العربية.", "Convenient online services available across all governorates in Egypt.")}</p>
            <ul className="lp-ct-list">
              <li>
                <span className="lp-ct-ico"><Ico d={ICON_PATHS.phone} size={20} /></span>
                <div><small>{tr("واتساب", "WhatsApp")}</small><a href={`tel:+${WA_NUMBER}`} dir="ltr">{WA_DISPLAY}</a></div>
              </li>
              <li>
                <span className="lp-ct-ico"><Ico d={ICON_PATHS.mail} size={20} /></span>
                <div><small>{tr("البريد الإلكتروني", "Email")}</small><a href={`mailto:${CONTACT_EMAIL}`} dir="ltr">{CONTACT_EMAIL}</a></div>
              </li>
              <li>
                <span className="lp-ct-ico"><Ico d={ICON_PATHS.pin} size={20} /></span>
                <div><small>{tr("نطاق الخدمة", "Service coverage")}</small><span>{tr("جمهورية مصر العربية (أونلاين)", "Arab Republic of Egypt (online)")}</span></div>
              </li>
            </ul>
          </div>
          <MailArt />
        </div>

        <div className="lp-ct-form lp-wa">
          <span className="lp-wa-ico" aria-hidden="true"><Ico d={ICON_PATHS.wa} size={30} /></span>
          <h3>{tr("عندك سؤال؟ ابعتهولنا على واتساب", "Got a question? Message us on WhatsApp")}</h3>
          <p>{tr("أي حاجة تحتاجها أو نقطة مش فاهمها في أي مرحلة (ابتدائي، إعدادي، ثانوي)… ابعتها لنا وهنشرحهالك خطوة بخطوة.", "Anything you need or any point you don’t understand, at any stage (primary, middle, secondary)… send it and we’ll explain it step by step.")}</p>
          <div className="lp-wa-who" role="radiogroup" aria-label={tr("أنا", "I am")}>
            {whos.map((w) => (
              <button key={w.id} type="button" role="radio" aria-checked={who === w.id} className={who === w.id ? "is-on" : ""} onClick={() => setWho(w.id)}>{w.label}</button>
            ))}
          </div>
          <a className="lp-svc-btn lp-wa-btn" href={wa} target="_blank" rel="noopener noreferrer">
            <Ico d={ICON_PATHS.wa} size={22} />
            <span>{tr("ابعت سؤالك على واتساب", "Send your question on WhatsApp")}</span>
          </a>
          <small className="lp-wa-note">{tr("بنرد عليك في أقرب وقت", "We reply as soon as we can .")}</small>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const tr = useT();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="lp-sec" aria-labelledby="lp-faq-title">
      <div className="lp-faq-split">
        <Reveal className="lp-faq-side">
          <span className="lp-sec-badge">{tr("الأسئلة الشائعة", "Frequently asked questions")}</span>
          <h2 id="lp-faq-title" className="lp-faq-title">{tr("كل ما تريد معرفته عن منصة مَدَار", "Everything you need to know about Madar")}</h2>
          <p className="lp-sec-sub">{tr("إجابات دقيقة ومباشرة مستندة بالكامل إلى معلومات منصتنا.", "Clear, direct answers based strictly on our platform facts.")}</p>
          <span className="lp-faq-mark" aria-hidden="true">{tr("؟", "?")}</span>
        </Reveal>
        <div className="lp-faq">
          {FAQS.map((item, i) => {
            const f = tr(item);
            return (
              <div key={i} className={`lp-faq-item${open === i ? " is-open" : ""}`}>
                <button type="button" className="lp-faq-trigger" aria-expanded={open === i} aria-controls={`lp-faq-panel-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <Ico d={ICON_PATHS.chevron} size={20} />
                </button>
                <div id={`lp-faq-panel-${i}`} className="lp-faq-panel" role="region">
                  <div><p>{f.a}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="lp-faq-soon">
        <span className="lp-faq-soon-ico"><Ico d={ICON_PATHS.chat} size={28} /></span>
        <h3>{tr("شاركونا تجربتكم التعليمية قريبًا", "Share your feedback soon")}</h3>
        <p>{tr("نركّز حاليًا كل جهودنا على تقديم أعلى جودة تعليمية، وسيتم فتح قسم آراء الطلاب وأولياء الأمور بعد نتائج نهاية العام.", "We’re focusing all our efforts on delivering top educational quality. Student and parent reviews will open after the end-of-year results.")}</p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const session = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [dark, toggleDark] = useTheme();
  const [lang, chooseLang] = useLang();
  const tr = makeT(lang);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("top");
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (ev) => { if (ev.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // تمييز القسم الظاهر حاليًا + شريط تقدّم القراءة
  const barRef = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const probe = window.innerHeight * 0.32;
      let best = null;
      let bestTop = -Infinity;
      for (const item of NAV) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe && r.top > bestTop) { best = item.id; bestTop = r.top; }
      }
      if (best) setActive(best);
      const bar = barRef.current;
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      }
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  function startLearning() {
    navigate("/student");
  }

  const behavior = () => (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  function goTo(id) {
    setMenuOpen(false);
    setActive(id);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: behavior() });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: behavior(), block: "start" });
  }

  return (
    <LangCtx.Provider value={lang}>
    <div
      className={`lp-root${dark ? " is-dark" : ""}`}
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang}
      data-theme={dark ? "dark" : "light"}
    >
      {/* Dynamic Background Ambient Elements */}
      <div className="lp-ambient-bg" aria-hidden="true">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-grid-pattern" />
      </div>

      {menuOpen && (
        <button type="button" className="lp-menu-overlay" aria-label={tr("إغلاق القائمة", "Close menu")} onClick={() => setMenuOpen(false)} />
      )}

      <header className="lp-header">
        <div className="lp-scroll-bar" ref={barRef} aria-hidden="true" />
        <div className="lp-header-inner">
          <div className="lp-header-start">
            <button type="button" className="lp-logo" aria-label={tr("مَدَار — أعلى الصفحة", "Madar — back to top")} onClick={() => goTo("top")}>
              <div className="lp-logo-glow" />
              <img src="/photo/IevsR.png" alt={tr("مَدَار", "Madar")} className="lp-logo-img" />
            </button>

            <nav className="lp-nav-desk" aria-label={tr("روابط رئيسية", "Main links")}>
              {NAV.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  className={`lp-nav-link${active === n.id ? " is-active" : ""}`}
                  aria-current={active === n.id ? "true" : undefined}
                  onClick={(event) => { event.preventDefault(); goTo(n.id); }}
                >
                  {tr(n.ar, n.en)}
                </a>
              ))}
            </nav>
          </div>

          <div className="lp-header-end">
            <div className="lp-lang" role="radiogroup" aria-label="Language / اللغة">
              <button type="button" role="radio" aria-checked={lang === "ar"} lang="ar" className={`lp-lang-btn${lang === "ar" ? " is-active" : ""}`} onClick={() => chooseLang("ar")}>
                <span className="lp-lang-full">العربية</span><span className="lp-lang-short" aria-hidden="true">ع</span>
              </button>
              <button type="button" role="radio" aria-checked={lang === "en"} lang="en" className={`lp-lang-btn${lang === "en" ? " is-active" : ""}`} onClick={() => chooseLang("en")}>
                <span className="lp-lang-full">English</span><span className="lp-lang-short" aria-hidden="true">EN</span>
              </button>
            </div>

            <button
              type="button"
              className="lp-icon-btn"
              onClick={toggleDark}
              aria-label={dark ? tr("التبديل إلى الوضع الفاتح", "Switch to light mode") : tr("التبديل إلى الوضع الداكن", "Switch to dark mode")}
              title={dark ? tr("الوضع الفاتح", "Light mode") : tr("الوضع الداكن", "Dark mode")}
            >
              <ThemeIcon dark={dark} />
            </button>

            {!session && (
              <button type="button" className="lp-btn lp-btn-ghost" onClick={() => setAuthOpen(true)}>
                {tr("تسجيل الدخول", "Log in")}
              </button>
            )}

            <button
              type="button"
              className="lp-menu-btn"
              aria-label={menuOpen ? tr("إغلاق القائمة", "Close menu") : tr("فتح القائمة", "Open menu")}
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
          <div className="lp-menu-mobile" role="navigation" aria-label={tr("قائمة الموبايل", "Mobile menu")}>
            {NAV.map((n) => (
              <button key={n.id} type="button" className={`lp-menu-item${active === n.id ? " is-active" : ""}`} onClick={() => goTo(n.id)}>
                <span className="lp-menu-ico" aria-hidden="true"><Ico d={n.icon} size={20} /></span>
                <span className="lp-menu-txt"><b>{tr(n.ar, n.en)}</b></span>
                <Arrow size={16} className="lp-menu-arrow" aria-hidden="true" />
              </button>
            ))}
            <Link to="/student/privacy" className="lp-menu-item" onClick={() => setMenuOpen(false)}>
              <span className="lp-menu-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></svg></span>
              <span className="lp-menu-txt"><b>{tr("الخصوصية", "Privacy")}</b></span>
              <Arrow size={16} className="lp-menu-arrow" aria-hidden="true" />
            </Link>
          </div>
        )}
      </header>

      <main>
        <HeroSection theme={dark ? "dark" : "light"} onStart={startLearning} />

        <AboutSection />

        <UnderstandSection />

        <MadarJourney isDark={dark} />

        <ContactSection />

        <FaqSection />

        <Reveal as="section" className="lp-final-cta" aria-label={tr("دليل المنصة", "Platform guide")}>
          <div className="lp-final-card">
            <div className="lp-final-copy">
              <span className="lp-final-tag">{tr("أنا تونة دليلك علي المنصة . . . جاهز ؟", "I’m Tuna, your guide to the platform… ready?")}</span>
              <p className="lp-final-lead">
                {tr(
                  "اختار صفك وافتح أي درس. ولو احتجت مساعدة في أي لحظة، دوس عليا تحت على الجنب وهعرفك علي كل حاجة في الصفحة غير مفهومة .",
                  "Pick your grade and open any lesson. If you need help at any moment, tap me at the bottom of the screen and I’ll explain anything on the page that isn’t clear.",
                )}
              </p>
              <button type="button" onClick={startLearning} className="hero-btn hero-btn-primary lp-final-btn">
                <span>{tr("ابدأ التعلّم", "Start learning")}</span>
                <Arrow size={18} />
              </button>
            </div>
            <span className="lp-final-pic" aria-hidden="true">
              <img src={GUIDE_IMGS.cheer} alt="" />
            </span>
          </div>
        </Reveal>

      </main>

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <style>{HERO_CSS}</style>
      <style>{LP_CSS}</style>
    </div>
    </LangCtx.Provider>
  );
}

const LP_CSS = `
  .lp-root { --duo-green: #147A6A; --duo-green-ink: #0E5348; --duo-green-soft: #E2F3EE; --duo-line: #DED4BD; --duo-surface: #FFFFFF; --duo-bg: #FFFCF4; --duo-bg-alt: #FFF6E3; --duo-ink: #263B35; --duo-ink-soft: #40544D; --duo-muted: #5C6B66; --duo-font-display: inherit; }
  .lp-root.is-dark { --duo-green: #55B9A7; --duo-green-ink: #A3E0D3; --duo-green-soft: #183A34; --duo-line: #344943; --duo-surface: #192723; --duo-bg: #111B18; --duo-bg-alt: #17231F; --duo-ink: #E9F2EF; --duo-ink-soft: #D1E0DB; --duo-muted: #A4B8B0; }

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

  .lp-menu-overlay { position: fixed; inset: 0; z-index: 49; padding: 0; border: 0; background: rgba(8, 24, 20, .45); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); animation: lpFadeInUp .2s ease both; }
  .lp-menu-mobile {
    position: absolute; top: calc(100% + .5rem); inset-inline: .75rem; z-index: 2;
    display: flex; flex-direction: column; gap: .3rem; padding: .6rem;
    max-height: calc(100dvh - 5.5rem); overflow-y: auto;
    border-radius: 1.5rem; border: 1px solid var(--lp-line-strong); background: var(--lp-surface);
    box-shadow: 0 24px 48px -16px rgba(0, 0, 0, .35);
    animation: lpFadeInUp .25s ease forwards;
  }
  @media (min-width: 860px) { .lp-menu-mobile, .lp-menu-overlay { display: none !important; } }
  .lp-menu-item {
    display: flex; align-items: center; gap: .8rem; width: 100%; padding: .65rem .7rem;
    border-radius: 1rem; border: 0; background: transparent; color: var(--lp-text);
    font: inherit; text-align: start; text-decoration: none; cursor: pointer; transition: background .2s ease;
  }
  .lp-menu-ico { flex: none; display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: .85rem; background: var(--lp-soft-accent); color: var(--lp-teal); }
  .lp-menu-txt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: .1rem; }
  .lp-menu-txt b { font-size: .98rem; font-weight: 900; line-height: 1.4; }
  .lp-menu-txt small { font-size: .76rem; font-weight: 700; color: var(--lp-muted); }
  .lp-menu-arrow { flex: none; color: var(--lp-muted); }
  .lp-menu-start {
    display: flex; align-items: center; justify-content: center; gap: .5rem; width: 100%; min-height: 3rem; margin-top: .35rem;
    border: 0; border-radius: 1rem; color: #fff; font: inherit; font-weight: 900; font-size: 1rem; cursor: pointer;
    background: linear-gradient(145deg, #0E5348 0%, #147A6A 60%, #1A8F7C 100%);
  }
  .lp-nav-pill { margin-inline-start: .45rem; padding: .08rem .5rem; border-radius: 999px; font-size: .68rem; font-weight: 900; background: var(--lp-soft-accent); color: var(--lp-teal); }

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

  /* ---- توتو بيشرح الرحلة ---- */
  .lp-guide-says { display: flex; align-items: center; gap: clamp(.8rem, 2vw, 1.2rem); width: min(100%, 40rem); margin: 1.4rem auto 0; padding: .6rem 1.4rem .6rem .8rem; border-radius: 2rem; border: 1.5px solid var(--lp-line-strong); background: var(--lp-surface); text-align: right; box-shadow: 0 18px 34px -24px rgba(14, 83, 72, .6); }
  .lp-guide-says img { background: transparent; flex: none; display: block; height: clamp(5rem, 11vw, 6.6rem); width: auto; max-width: 7rem; object-fit: contain; }
  .lp-guide-says span { font-size: clamp(.95rem, 2.2vw, 1.08rem); line-height: 1.8; font-weight: 700; color: var(--lp-text); }
  .lp-guide-says b { color: var(--lp-teal); font-weight: 900; }
  @media (max-width: 640px) { .lp-guide-says { border-radius: 1.6rem; padding: .5rem 1rem .5rem .6rem; } }

  /* ---- رحلة الطالب ---- */
  .lp-journey { scroll-margin-top: 5rem; max-width: 1140px; margin: 0 auto; padding: .5rem 1.25rem 3.5rem; color: var(--lp-text); }
  .lp-journey-head { text-align: center; max-width: 44rem; margin: 0 auto 2.5rem; }
  .lp-journey-head h2 { margin: 1.1rem 0 .8rem; font-size: clamp(1.6rem, 3.8vw, 2.3rem); font-weight: 900; line-height: 1.45; text-wrap: balance; }
  .lp-journey-head p { margin: 0; font-size: 1.02rem; line-height: 1.9; color: var(--lp-muted); text-wrap: balance; }
  .lp-phase + .lp-phase { margin-top: 3rem; }
  .lp-phase-head { display: flex; align-items: baseline; gap: .8rem; flex-wrap: wrap; margin: 0 0 1.4rem; padding-bottom: .8rem; border-bottom: 1px solid var(--lp-line-strong); }
  .lp-phase-head h3 { margin: 0; font-size: 1.25rem; font-weight: 900; color: var(--lp-teal-deep); }
  .lp-phase-head span { font-size: .9rem; font-weight: 700; color: var(--lp-muted); }
  .lp-steps { list-style: none; margin: 0; padding: 0 3.3rem 0 0; display: grid; gap: 1.6rem; position: relative; }
  .lp-steps::before { content: ""; position: absolute; inset-block: 1.2rem; inset-inline-start: 1.05rem; width: 2px; border-radius: 2px; background: repeating-linear-gradient(180deg, var(--lp-line-strong) 0 6px, transparent 6px 12px); }
  .lp-step { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.4rem; align-items: center; padding: clamp(1.2rem, 3vw, 2rem); border-radius: 1.75rem; border: 1px solid var(--lp-line-strong); background: radial-gradient(circle at 100% 0%, var(--soft), transparent 55%), var(--lp-surface); box-shadow: var(--lp-card-shadow); --msc-svg-soft: var(--soft); }
  .lp-step-node { position: absolute; inset-inline-start: calc(-3.3rem + 0rem); top: 1.2rem; width: 2.1rem; height: 2.1rem; display: grid; place-items: center; border-radius: 50%; background: var(--ac); color: #fff; font-weight: 900; font-size: .95rem; box-shadow: 0 0 0 5px var(--lp-bg); }
  .lp-step-copy { min-width: 0; }
  .lp-step h4.msc-card { margin: 0; cursor: default; }
  .lp-step-copy ul { list-style: none; margin: 1.25rem 0 0; padding: 0; display: grid; gap: .55rem; }
  .lp-step-copy li { display: flex; gap: .6rem; align-items: flex-start; font-size: .93rem; font-weight: 700; line-height: 1.7; }
  .lp-step-copy li i { flex: none; display: grid; place-items: center; width: 1.3rem; height: 1.3rem; margin-top: .15rem; border-radius: 50%; background: var(--ac); color: #fff; font-size: .72rem; font-style: normal; }
  .lp-step-canvas { --ts: 1; display: grid; align-items: center; aspect-ratio: 400 / 230; width: 100%; padding: .5rem; border-radius: 1.25rem; border: 1px solid var(--lp-line-strong); background-color: color-mix(in srgb, var(--lp-surface) 92%, var(--lp-bg)); background-image: radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ac) 22%, transparent) 1px, transparent 1.4px); background-size: 18px 18px; }
  .msc-art { display: block; width: 100%; height: auto; font-family: inherit; direction: rtl; overflow: visible; }
  .lp-step:not(.is-live) .msc-card, .lp-step:not(.is-live) .msc-art * { animation-play-state: paused !important; }
  @media (min-width: 900px) {
    .lp-step { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2.5rem; }
    .lp-steps > .lp-step:nth-child(even) .lp-step-canvas { order: -1; }
  }
  @media (max-width: 520px) {
    .lp-journey { padding-inline: .85rem; }
    .lp-steps { padding-inline-end: 2.1rem; }
    .lp-step { padding: 1rem .85rem; gap: 1.1rem; border-radius: 1.4rem; }
    .lp-step-node { inset-inline-start: -2.1rem; width: 1.7rem; height: 1.7rem; font-size: .85rem; box-shadow: 0 0 0 4px var(--lp-bg); }
    .lp-steps::before { inset-inline-start: .75rem; }
    .lp-step-canvas { --ts: 1.2; padding: .3rem; border-radius: 1rem; }
    .lp-step h4.msc-card { gap: 10px; padding: 12px 12px; border-radius: 16px; align-items: flex-start; }
    .lp-step h4.msc-card .msc-card-icon { width: 38px; height: 38px; border-radius: 12px; }
    .lp-step h4.msc-card .msc-card-icon svg { width: 19px; height: 19px; }
    .lp-step h4.msc-card .msc-card-body { padding-inline-end: 0; }
    .lp-step h4.msc-card .msc-card-body b { font-size: .95rem; }
    .lp-step h4.msc-card .msc-card-body small { font-size: .78rem; line-height: 1.65; }
    .lp-step h4.msc-card .msc-card-tag { position: static; align-self: flex-start; padding: .15rem .6rem; border-radius: 999px; background: var(--soft); font-size: .68rem; }
  }

  /* حركة الرسومات التوضيحية (منقولة من MadarShowcase) */

  /* بطاقة العنوان: نفس شكل بطاقات MadarShowcase */
  .msc-card { 
    position: relative; display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px; border-radius: 20px; text-align: start; cursor: pointer; font: inherit; color: var(--lp-text);
    background: var(--lp-surface); border: 1px solid var(--lp-line); box-shadow: var(--lp-shadow);
    animation: msc-float var(--fd, 6s) ease-in-out var(--dl, 0s) infinite; will-change: transform;
    transition: border-color .35s, box-shadow .35s, background .35s; 
  }
  .msc-card:hover { border-color: var(--ac); }
  .msc-card:focus-visible { outline: 2px solid var(--ac); outline-offset: 2px; }
  .msc-card.is-on { background: var(--lp-surface); border-color: var(--ac); box-shadow: 0 4px 20px -8px color-mix(in srgb, var(--ac) 40%, transparent); }
  .msc-card-bar { position: absolute; inset-block: 12px; inset-inline-start: 0; width: 4px; border-radius: 0 4px 4px 0; background: var(--ac); transform: scaleY(0); transition: transform .4s ease; }
  .msc-card.is-on .msc-card-bar { transform: scaleY(1); }
  .msc-card-icon { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 14px; color: var(--lp-text); background: rgba(20, 122, 106, 0.08); border: 1px solid var(--lp-line); transition: background .35s, color .35s, transform .35s; }
  .msc-card-icon svg { width: 22px; height: 22px; }
  .msc-card.is-on .msc-card-icon { color: #fff; background: var(--ac); border-color: var(--ac); transform: rotate(-4deg) scale(1.05); }
  .msc-card-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1 1 auto; }
  .msc-card-body b { font-size: 0.98rem; font-weight: 900; color: var(--lp-text); line-height: 1.3; }
  .msc-card-body small { font-size: .8rem; line-height: 1.6; color: var(--lp-muted); }
  .msc-card-tag { position: absolute; top: 12px; inset-inline-end: 14px; font-size: .68rem; font-weight: 800; color: var(--ac); opacity: .9; }
  .msc-card-body { padding-inline-end: 34px; }
/* ---- drawing animations ---- */
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
  @keyframes msc-q-wrong { 0%, 14% { fill: var(--lp-surface); stroke: var(--lp-line); } 20%, 34% { fill: rgba(194, 86, 47, 0.15); stroke: #C2562F; } 42%, 100% { fill: var(--lp-surface); stroke: var(--lp-line); } }
  @keyframes msc-q-right { 0%, 40% { fill: var(--lp-surface); stroke: var(--lp-line); } 46%, 92% { fill: rgba(20, 122, 106, 0.15); stroke: var(--lp-teal); } 100% { fill: var(--lp-surface); stroke: var(--lp-line); } }
  @keyframes msc-q-pop { 0%, 42% { opacity: 0; transform: scale(.4); } 50%, 92% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(.4); } }
  @keyframes msc-q-fill { 0%, 40% { transform: scaleX(.34); } 50%, 92% { transform: scaleX(.67); } 100% { transform: scaleX(.34); } }
  
  @media (prefers-reduced-motion: reduce) {
    .lp-step .msc-art * { animation: none !important; transition: none !important; }
    .msc-art .msc-q-right { fill: rgba(20, 122, 106, 0.15); stroke: var(--lp-teal); }
    .msc-art .msc-q-fill { transform: scaleX(.67); }
    .msc-art .msc-bar { transform: scaleX(.6); }
  }
  
  /* ===== إضافات الرسومات الجديدة ===== */
  .msc-art .msc-hl { animation: msc-hl 2.6s ease-in-out infinite; }
  .msc-art .msc-fadein { animation: msc-fadein 9s ease-in-out infinite; }
  .msc-art .msc-cover { animation: msc-cover 9s ease-in-out infinite; }
  .msc-art .msc-ph-a { animation: msc-ph-a 10s ease-in-out infinite; }
  .msc-art .msc-ph-b { animation: msc-ph-b 10s ease-in-out infinite; }
  @keyframes msc-hl { 0%, 100% { opacity: .28; } 50% { opacity: .6; } }
  @keyframes msc-fadein { 0%, 10% { opacity: 0; transform: translateY(10px); } 22%, 86% { opacity: 1; transform: none; } 96%, 100% { opacity: 0; transform: translateY(10px); } }
  @keyframes msc-cover { 0%, 28% { opacity: 1; } 40%, 86% { opacity: 0; } 96%, 100% { opacity: 1; } }
  @keyframes msc-ph-a { 0%, 44% { opacity: 1; } 50%, 94% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes msc-ph-b { 0%, 44% { opacity: 0; } 50%, 94% { opacity: 1; } 100% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .msc-art .msc-hl { opacity: .5; }
    .msc-art .msc-fadein { opacity: 1; transform: none; }
    .msc-art .msc-cover { opacity: 0; }
    .msc-art .msc-ph-a { opacity: 1; }
    .msc-art .msc-ph-b { opacity: 0; }
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
  max-width: 1140px;
  margin: clamp(2.5rem, 6vw, 4rem) auto 3rem;
  padding: 0 1.25rem;
}
.lp-final-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: clamp(1rem, 4vw, 3rem);
  padding: clamp(1.75rem, 5vw, 3.25rem) clamp(1.25rem, 5vw, 3.25rem) 0;
  border-radius: 2.25rem;
  border: 1px solid var(--lp-line-strong);
  background:
    radial-gradient(circle at 100% 0%, rgba(227, 192, 139, 0.35), transparent 45%),
    linear-gradient(135deg, var(--lp-soft-accent), var(--lp-surface) 70%);
  box-shadow: 0 28px 56px -34px rgba(14, 83, 72, 0.5);
}
.lp-final-card::after {
  content: "";
  position: absolute;
  z-index: -1;
  inset-block: 0;
  inset-inline-start: 0;
  width: 0.55rem;
  background: linear-gradient(180deg, #E3C08B, #147A6A);
}
.lp-final-copy { align-self: center; padding-bottom: clamp(1.75rem, 5vw, 3.25rem); }
.lp-final-tag {
  display: inline-block;
  padding: 0.25rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 900;
  color: #fff;
  background: var(--lp-teal);
}
.lp-final-title {
  margin: 0.8rem 0 0.7rem;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 900;
  line-height: 1.45;
  color: var(--lp-text);
  text-wrap: balance;
}
.lp-final-lead {
  margin: 0;
  max-width: 34rem;
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--lp-muted);
}
.lp-final-pic { display: block; height: clamp(11rem, 24vw, 16rem); }
.lp-final-pic img { display: block; height: 100%; width: auto; max-width: 16rem; object-fit: contain; background: transparent; }
@media (max-width: 720px) {
  .lp-final-card { grid-template-columns: minmax(0, 1fr); justify-items: center; text-align: center; border-radius: 1.75rem; padding-bottom: 0; }
  .lp-final-card::after { inset-block: 0 auto; inset-inline: 0; width: auto; height: 0.45rem; }
  .lp-final-copy { padding-bottom: 0; }
  .lp-final-pic { height: 11rem; }
}
@media (max-width: 640px) {
  .lp-final-cta { padding-inline: 0.85rem; }
}


/* ===== اللغتان + التنقل + الأقسام المدمجة ===== */
.lp-root[dir="ltr"] { direction: ltr; }
.lp-root[dir="ltr"] .msc-art text { unicode-bidi: plaintext; }
.lp-root[dir="ltr"] .hero-badge-line { padding: 0.6rem 1.6rem 0.6rem 0.7rem; }
.lp-root[dir="ltr"] .hero-badge-text { order: 2; }
.lp-root[dir="ltr"] .lp-scatter-txt, .lp-root[dir="ltr"] .md-scatter-text { text-align: left; }
.lp-root[dir="ltr"] .lp-btn-arrow, .lp-root[dir="ltr"] .lp-btn-primary:hover .lp-btn-arrow { transform: none; }
.lp-root[dir="ltr"] .lp-btn-primary:hover .lp-btn-arrow { transform: translateX(4px); }
.lp-root[dir="ltr"] .lp-demo-wrap { direction: ltr; }
.lp-root[dir="ltr"] .lp-answer-row { flex-direction: row; }
.lp-root[dir="ltr"] .lp-faq-trigger, .lp-root[dir="ltr"] .lp-ct-label { text-align: left; }

.lp-root #top, .lp-root #features, .lp-sec { scroll-margin-top: 5rem; }

.lp-nav-link.is-active { color: var(--lp-teal); background: var(--lp-soft-accent); }
.lp-menu-item.is-active { background: var(--lp-soft-accent); }
.lp-nav-desk { gap: .15rem; }
.lp-nav-desk .lp-nav-link { white-space: nowrap; padding-inline: .7rem; }
.lp-menu-item { width: 100%; font: inherit; text-align: start; cursor: pointer; }
@media (min-width: 860px) and (max-width: 1179px) {
  .lp-nav-desk { display: none; }
  .lp-menu-btn { display: inline-flex; }
  .lp-menu-mobile { display: flex !important; }
  .lp-menu-overlay { display: block !important; }
}

.lp-lang { display: inline-flex; padding: 3px; gap: 2px; border-radius: 999px; background: var(--lp-soft-accent); border: 1.5px solid var(--lp-line-strong); }
.lp-lang-btn { font: inherit; font-size: .8rem; font-weight: 800; line-height: 1; padding: .42rem .75rem; border: 0; border-radius: 999px; cursor: pointer; color: var(--lp-muted); background: transparent; transition: background .2s ease, color .2s ease; }
.lp-lang-btn:hover { color: var(--lp-text); }
.lp-lang-btn.is-active { color: #fff; background: var(--lp-teal-deep); }
.lp-lang-btn:focus-visible { outline: 2px solid var(--lp-teal); outline-offset: 2px; }
.lp-lang-short { display: none; }
@media (max-width: 560px) {
  .lp-lang-full { display: none; }
  .lp-lang-short { display: inline; }
  .lp-lang-btn { padding: .42rem .6rem; }
}

.lp-sec { position: relative; z-index: 1; max-width: 1140px; margin: 0 auto; padding: clamp(2.5rem, 6vw, 4.5rem) 1.25rem 0; }
.lp-sec-head { text-align: center; max-width: 700px; margin: 0 auto 2.25rem; }
.lp-sec-badge { display: inline-flex; padding: .35rem .95rem; border-radius: 999px; font-size: .86rem; font-weight: 800; color: var(--lp-gold); background: rgba(185, 121, 31, .12); border: 1.5px solid rgba(185, 121, 31, .3); }
.lp-sec-title { margin: .6rem 0; font-size: clamp(1.5rem, 4vw, 2.3rem); font-weight: 900; line-height: 1.35; color: var(--lp-teal-deep); text-wrap: balance; }
.lp-sec-sub { margin: 0; font-size: 1.05rem; line-height: 1.8; color: var(--lp-muted); }
.lp-root.is-dark .lp-sec-title { color: var(--lp-text); }


.lp-svc-btn { display: inline-flex; align-items: center; justify-content: center; gap: .6rem; padding: .85rem 1.7rem; font: inherit; font-size: 1rem; font-weight: 900; color: #fff; cursor: pointer; border: 0; border-radius: 999px; background: var(--lp-teal-deep); box-shadow: 0 10px 22px -12px rgba(14, 83, 72, .8); transition: transform .2s ease, filter .2s ease; }
.lp-svc-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
.lp-svc-btn:focus-visible { outline: 3px solid var(--lp-gold); outline-offset: 3px; }

.lp-ct-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: stretch; }
.lp-ct-info { display: flex; flex-direction: column; justify-content: flex-start; gap: 1.5rem; padding: clamp(1.4rem, 4vw, 2.25rem); border-radius: 1.5rem; color: #fff; background: linear-gradient(135deg, #0E5348, #0A3C34); }
.lp-ct-info h3 { margin: 0 0 .5rem; font-size: 1.6rem; font-weight: 900; }
.lp-ct-info > div > p { margin: 0; color: rgba(255, 255, 255, .85); line-height: 1.8; }
.lp-ct-list { display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0 0; padding: 0; list-style: none; }
.lp-ct-list li { display: flex; align-items: center; gap: .9rem; }
.lp-ct-ico { flex: none; display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border-radius: .9rem; background: rgba(255, 255, 255, .14); }
.lp-ct-list small { display: block; font-size: .8rem; color: rgba(255, 255, 255, .7); }
.lp-ct-list a, .lp-ct-list span:not(.lp-ct-ico) { font-weight: 800; color: #fff; text-decoration: none; }
.lp-ct-list a:hover { text-decoration: underline; }

.lp-ct-form { display: flex; flex-direction: column; padding: clamp(1.4rem, 4vw, 2.25rem); border-radius: 1.5rem; background: var(--lp-surface); border: 2px solid var(--lp-line-strong); box-shadow: var(--lp-card-shadow); }
.lp-ct-form h3 { margin: 0 0 .4rem; font-size: 1.35rem; font-weight: 900; color: var(--lp-teal-deep); }
.lp-root.is-dark .lp-ct-form h3 { color: var(--lp-text); }
.lp-ct-form > p { margin: 0 0 1.1rem; font-size: .92rem; line-height: 1.7; color: var(--lp-muted); }
.lp-ct-label { margin: .8rem 0 .35rem; font-size: .9rem; font-weight: 800; color: var(--lp-text); }
.lp-ct-input { width: 100%; padding: .75rem .9rem; font: inherit; color: var(--lp-text); background: var(--lp-bg); border: 2px solid var(--lp-line-strong); border-radius: .85rem; }
.lp-ct-input:focus { outline: 3px solid color-mix(in srgb, var(--lp-teal) 35%, transparent); border-color: var(--lp-teal); }
textarea.lp-ct-input { resize: vertical; min-height: 6rem; }
.lp-ct-send { margin-top: 1.2rem; width: 100%; }

.lp-faq { display: flex; flex-direction: column; gap: .85rem; max-width: 800px; margin: 0 auto; }
.lp-faq-item { overflow: hidden; border-radius: 1rem; background: var(--lp-surface); border: 2px solid var(--lp-line-strong); transition: border-color .2s ease; }
.lp-faq-item.is-open { border-color: var(--lp-teal); }
.lp-faq-trigger { display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; padding: 1.1rem 1.35rem; font: inherit; font-size: 1.05rem; font-weight: 800; text-align: start; cursor: pointer; color: var(--lp-teal-deep); background: none; border: 0; }
.lp-root.is-dark .lp-faq-trigger { color: var(--lp-text); }
.lp-faq-trigger svg { flex: none; transition: transform .25s ease; }
.lp-faq-item.is-open .lp-faq-trigger svg { transform: rotate(180deg); }
.lp-faq-panel { display: grid; grid-template-rows: 0fr; padding: 0 1.35rem; transition: grid-template-rows .3s ease; }
.lp-faq-panel > div { overflow: hidden; }
.lp-faq-item.is-open .lp-faq-panel { grid-template-rows: 1fr; }
.lp-faq-panel p { margin: 0 0 1.15rem; line-height: 1.85; color: var(--lp-muted); }
.lp-faq-soon { max-width: 800px; margin: 2.25rem auto 0; padding: clamp(1.5rem, 4vw, 2.5rem); text-align: center; border-radius: 1.5rem; background: rgba(222, 212, 189, .3); border: 2px dashed var(--lp-line-strong); }
.lp-faq-soon-ico { display: inline-flex; align-items: center; justify-content: center; width: 3.75rem; height: 3.75rem; margin-bottom: 1rem; border-radius: 50%; color: #fff; background: var(--lp-gold); }
.lp-faq-soon h3 { margin: 0 0 .5rem; font-size: 1.25rem; font-weight: 900; color: var(--lp-teal-deep); }
.lp-root.is-dark .lp-faq-soon h3 { color: var(--lp-text); }
.lp-faq-soon p { max-width: 600px; margin: 0 auto; font-size: .95rem; line-height: 1.8; color: var(--lp-muted); }

@media (max-width: 900px) {
  .lp-ct-grid { grid-template-columns: 1fr; }
  .lp-aud { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .lp-sec { padding-inline: .85rem; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-faq-panel, .lp-faq-trigger svg, .lp-svc-btn { transition: none !important; }
}


/* ===== لمسات بصرية: Hero + كشف تدريجي + إطار واجهة الطالب + فهرس المميزات ===== */
.lp-root .md-hero { position: relative; isolation: isolate; }
.lp-root .md-hero-core { position: relative; z-index: 2; }
.lp-hero-glow { position: absolute; inset: -8% 0 auto; height: 78%; z-index: -1; pointer-events: none; filter: blur(14px); background: radial-gradient(38% 48% at 24% 32%, rgba(20, 122, 106, .2), transparent 70%), radial-gradient(34% 44% at 76% 26%, rgba(185, 121, 31, .2), transparent 70%); animation: lp-glow 16s ease-in-out infinite alternate; }
@keyframes lp-glow { from { transform: translate3d(-2%, 0, 0) scale(1); } to { transform: translate3d(2%, 3%, 0) scale(1.08); } }

.lp-root .hero-headline { white-space: normal; font-size: clamp(2rem, 6.2vw, 3.9rem); line-height: 1.3; letter-spacing: -.01em; text-wrap: balance; }
.lp-root .hero-headline-lead { display: block; margin-bottom: .1em; }
.lp-root .md-hero .hero-headline-accent { position: relative; display: inline-block; padding: 0 .06em .14em; border-radius: 0; box-shadow: none; background: linear-gradient(110deg, #B9791F 0%, #E6AE45 45%, #B9791F 90%); background-size: 220% auto; -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; animation: lp-gold-shift 7s linear infinite; }
@keyframes lp-gold-shift { to { background-position: 220% center; } }
.hero-underline { position: absolute; inset-inline: 0; bottom: -.06em; width: 100%; height: .3em; overflow: visible; }
.hero-underline path { fill: none; stroke: #B9791F; stroke-width: 5; stroke-linecap: round; vector-effect: non-scaling-stroke; stroke-dasharray: 340; stroke-dashoffset: 340; animation: lp-draw 1.1s .8s cubic-bezier(.22, 1, .36, 1) forwards; }
@keyframes lp-draw { to { stroke-dashoffset: 0; } }
.hero-hint { margin: 1.1rem 0 0; font-size: .95rem; font-weight: 700; color: var(--lp-muted); }
.lp-root .hero-actions { margin-top: .4rem; }
.lp-root .hero-btn-primary { font-size: 1.12rem; padding: 1rem 2.4rem; }
.lp-final-btn { margin-top: 1.25rem; }

.lp-scroll-bar { position: absolute; inset-inline: 0; bottom: -1px; height: 3px; z-index: 2; pointer-events: none; transform: scaleX(0); transform-origin: right; background: linear-gradient(90deg, var(--lp-teal), var(--lp-gold)); }
.lp-root[dir="ltr"] .lp-scroll-bar { transform-origin: left; }

.lp-reveal { opacity: 0; }
.lp-reveal.is-in { opacity: 1; animation: lp-rise .75s cubic-bezier(.22, 1, .36, 1) var(--rv, 0ms) backwards; }
@keyframes lp-rise { from { opacity: 0; transform: translate3d(0, 26px, 0); } to { opacity: 1; transform: none; } }

.lp-sec-badge::before { content: ""; display: inline-block; width: .45rem; height: .45rem; margin-inline-end: .5rem; align-self: center; border-radius: 50%; background: currentColor; }
.lp-sec-title::after { content: ""; display: block; width: 3.5rem; height: 4px; margin: .8rem auto 0; border-radius: 4px; background: linear-gradient(90deg, var(--lp-teal), var(--lp-gold)); }

.lp-aud { display: grid; grid-template-columns: minmax(0, 30rem); justify-content: center; gap: 1.1rem; }
.lp-aud-card { position: relative; overflow: hidden; padding: 1.8rem 1.5rem; border-radius: 1.6rem; background: var(--lp-surface); border: 2px solid var(--lp-line-strong); box-shadow: var(--lp-card-shadow); transition: transform .25s ease, border-color .25s ease; }
.lp-aud-card::after { content: ""; position: absolute; inset-inline-end: -2.2rem; top: -2.2rem; width: 8rem; height: 8rem; border-radius: 50%; background: radial-gradient(circle, rgba(185, 121, 31, .18), transparent 70%); pointer-events: none; }
.lp-aud-card:hover { transform: translateY(-4px); border-color: var(--lp-teal); }
.lp-aud-ico { display: inline-grid; place-items: center; width: 3.5rem; height: 3.5rem; margin-bottom: 1rem; border-radius: 1.15rem; color: #fff; background: linear-gradient(145deg, #0E5348, #147A6A); box-shadow: 0 14px 24px -14px rgba(14, 83, 72, .8); }
.lp-aud-card:nth-child(2) .lp-aud-ico { background: linear-gradient(145deg, #9E6517, #C98512); box-shadow: 0 14px 24px -14px rgba(158, 101, 23, .8); }
.lp-aud-card h3 { margin: 0 0 .4rem; font-size: 1.2rem; font-weight: 900; color: var(--lp-text); }
.lp-aud-card p { margin: 0; font-size: .96rem; line-height: 1.8; color: var(--lp-muted); }

.lp-rail { margin: 0 auto 2.75rem; max-width: 64rem; }
.lp-rail ol { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem; margin: 0; padding: 0; list-style: none; }
.lp-rail a { display: inline-flex; align-items: center; gap: .55rem; padding: .38rem .5rem .38rem .8rem; font-size: .86rem; color: var(--lp-text); text-decoration: none; border-radius: 999px; background: var(--lp-surface); border: 2px solid var(--lp-line-strong); transition: transform .2s ease, border-color .2s ease, background .2s ease; }
.lp-rail a:hover { transform: translateY(-2px); border-color: var(--ac); background: var(--soft); }
.lp-root.is-dark .lp-rail a:hover { background: var(--lp-surface); }
.lp-rail a:focus-visible { outline: 3px solid var(--ac); outline-offset: 2px; }
.lp-rail a b { font-weight: 800; white-space: nowrap; }
.lp-rail-ico { display: grid; place-items: center; width: 1.9rem; height: 1.9rem; border-radius: 50%; color: #fff; background: var(--ac); }
.lp-rail-n { font-size: .72rem; font-weight: 900; color: var(--ac); opacity: .85; }

.lp-phase { scroll-margin-top: 5.5rem; }
.lp-phase-head { align-items: center; }
.lp-phase-head .lp-phase-n { display: inline-grid; place-items: center; width: 2rem; height: 2rem; border-radius: 50%; font-size: .85rem; font-weight: 900; color: #fff; background: var(--lp-teal-deep); }
.lp-root.is-dark .lp-phase-head .lp-phase-n { background: #147A6A; color: #fff; }
.lp-steps { padding: 0; padding-inline-start: 3.3rem; }
@media (max-width: 640px) { .lp-steps { padding-inline-start: 2.1rem; padding-inline-end: 0; } }
.lp-step { scroll-margin-top: 6rem; }

.lp-window { min-width: 0; overflow: hidden; border-radius: 1.4rem; border: 1px solid var(--lp-line-strong); background: var(--lp-surface); box-shadow: 0 28px 50px -32px rgba(14, 83, 72, .5); }
.lp-window-bar { display: flex; align-items: center; gap: .4rem; padding: .55rem .9rem; border-bottom: 1px solid var(--lp-line-strong); background: var(--lp-soft-accent); }
.lp-window-bar i { width: .62rem; height: .62rem; border-radius: 50%; background: #E9B98C; }
.lp-window-bar i:nth-child(2) { background: #F0D98A; }
.lp-window-bar i:nth-child(3) { background: #8FD0AC; }
.lp-window-bar span { margin-inline-start: auto; font-size: .72rem; font-weight: 800; color: var(--lp-muted); }
.lp-window .lp-step-canvas { border: 0; border-radius: 0; }
@media (min-width: 900px) { .lp-steps > .lp-step:nth-child(even) .lp-window { order: -1; } }

@media (max-width: 700px) {
  .lp-rail ol { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; padding-bottom: .6rem; scroll-snap-type: x proximity; }
  .lp-rail li { flex: none; scroll-snap-align: start; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-reveal, .lp-reveal.is-in { opacity: 1; animation: none; }
  .lp-hero-glow, .lp-root .md-hero .hero-headline-accent { animation: none; }
  .hero-underline path { animation: none; stroke-dashoffset: 0; }
}


/* ============ About + grades path ============ */
.lp-about { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: clamp(1.5rem, 4vw, 3.5rem); align-items: center; padding: clamp(1.4rem, 4vw, 3rem); border-radius: 2.25rem; border: 1px solid var(--lp-line-strong); background: radial-gradient(60% 70% at 0% 0%, rgba(185, 121, 31, .13), transparent 60%), radial-gradient(60% 70% at 100% 100%, var(--lp-soft-accent), transparent 65%), var(--lp-surface); box-shadow: var(--lp-card-shadow); }
.lp-about-title { margin: .9rem 0 1.4rem; font-size: clamp(1.8rem, 4.2vw, 2.9rem); font-weight: 900; line-height: 1.3; color: var(--lp-teal-deep); text-wrap: balance; }
.lp-root.is-dark .lp-about-title { color: var(--lp-text); }
.lp-about-student { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.2rem; border-radius: 1.2rem; background: var(--lp-soft-accent); border: 1.5px solid color-mix(in srgb, var(--lp-teal) 28%, transparent); }
.lp-about-ico { flex: none; display: grid; place-items: center; width: 3.3rem; height: 3.3rem; border-radius: 1.05rem; color: #fff; background: linear-gradient(145deg, #0E5348, #1A8F7C); box-shadow: 0 12px 22px -12px rgba(14, 83, 72, .8); }
.lp-about-student h3 { margin: 0 0 .2rem; font-size: 1.15rem; font-weight: 900; color: var(--lp-text); }
.lp-about-student p { margin: 0; font-size: .98rem; line-height: 1.8; color: var(--lp-muted); }
.lp-about-stage { margin: 1.3rem 0 0; font-size: 1.02rem; line-height: 1.95; color: var(--lp-muted); }
.lp-about-stage b { color: var(--lp-text); font-weight: 900; }
.lp-path { position: relative; list-style: none; margin: 0; padding: 0; display: grid; gap: 1.1rem; }
.lp-path::before { content: ""; position: absolute; z-index: 0; inset-block: 2rem; inset-inline-start: calc(2px + 1.1rem + 1.75rem - 1px); border-inline-start: 2px dashed var(--lp-gold); }
.lp-path-item { position: relative; z-index: 1; display: flex; align-items: center; gap: 1rem; padding: .9rem 1.1rem; border-radius: 1.3rem; background: var(--lp-surface); border: 2px solid var(--lp-line-strong); box-shadow: var(--lp-card-shadow); }
.lp-path-item b { font-size: 1.1rem; font-weight: 900; line-height: 1.5; color: var(--lp-text); }
.lp-path-n { flex: none; display: grid; place-items: center; width: 3.5rem; height: 3.5rem; border-radius: 50%; font-size: 1.7rem; font-weight: 900; line-height: 1; }
.lp-path-1 .lp-path-n { color: var(--lp-teal-deep); background: var(--lp-soft-accent); border: 2px solid var(--lp-teal); }
.lp-root.is-dark .lp-path-1 .lp-path-n { color: var(--lp-text); }
.lp-path-2 .lp-path-n { color: #fff; background: linear-gradient(145deg, #1A8F7C, #147A6A); }
.lp-path-3 { border-color: var(--lp-gold); }
.lp-path-3 .lp-path-n { color: #fff; background: linear-gradient(145deg, #D69336, #B9791F); box-shadow: 0 0 0 5px rgba(185, 121, 31, .2); }
.lp-about.is-in .lp-path-item { animation: lp-rise .7s cubic-bezier(.22, 1, .36, 1) calc(var(--i) * 140ms + 250ms) backwards; }
@media (max-width: 860px) { .lp-about { grid-template-columns: minmax(0, 1fr); } }

/* ============ Understand (dark teal panel) ============ */
.lp-und { position: relative; z-index: 1; scroll-margin-top: 5rem; max-width: 1140px; margin: 0 auto; padding: clamp(2.5rem, 6vw, 4.5rem) 1.25rem 0; }
.lp-und-panel { position: relative; isolation: isolate; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: clamp(1.5rem, 4vw, 3rem); align-items: center; padding: clamp(1.4rem, 4.5vw, 3.5rem); border-radius: 2.5rem; color: #fff; background: radial-gradient(60% 80% at 100% 0%, rgba(227, 192, 139, .2), transparent 60%), radial-gradient(55% 65% at 0% 100%, rgba(26, 143, 124, .5), transparent 70%), linear-gradient(135deg, #0A3C34, #0E5348); box-shadow: 0 40px 80px -44px rgba(10, 60, 52, .9); }
.lp-root.is-dark .lp-und-panel { background: radial-gradient(60% 80% at 100% 0%, rgba(227, 192, 139, .12), transparent 60%), radial-gradient(55% 65% at 0% 100%, rgba(26, 143, 124, .35), transparent 70%), linear-gradient(135deg, #071F1B, #0B3029); }
.lp-und-panel::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; background-image: radial-gradient(rgba(255, 255, 255, .1) 1px, transparent 1.2px); background-size: 26px 26px; -webkit-mask-image: linear-gradient(180deg, #000, transparent 80%); mask-image: linear-gradient(180deg, #000, transparent 80%); }
.lp-und-badge { display: inline-flex; align-items: center; gap: .55rem; padding: .45rem 1rem; border-radius: 999px; font-size: .82rem; font-weight: 800; color: #F0D9AE; background: rgba(227, 192, 139, .14); border: 1px solid rgba(227, 192, 139, .4); }
.lp-und-badge i { width: .5rem; height: .5rem; border-radius: 50%; background: #E3C08B; box-shadow: 0 0 10px #E3C08B; }
.lp-und-title { margin: 1.1rem 0 1rem; font-size: clamp(1.9rem, 4vw, 2.9rem); font-weight: 900; line-height: 1.35; color: #fff; }
.lp-und-title span { display: block; color: #E3C08B; }
.lp-und-desc { margin: 0; font-size: 1.02rem; line-height: 1.95; color: rgba(255, 255, 255, .82); }
.lp-und-list { list-style: none; margin: 1.5rem 0 0; padding: 0; display: grid; gap: .8rem; }
.lp-und-list li { display: flex; gap: .8rem; align-items: flex-start; font-size: .93rem; font-weight: 700; line-height: 1.8; color: rgba(255, 255, 255, .92); }
.lp-und-list i { flex: none; display: grid; place-items: center; width: 1.45rem; height: 1.45rem; margin-top: .2rem; border-radius: 50%; font-style: normal; font-size: .75rem; font-weight: 900; color: #0A3C34; background: #E3C08B; }
.lp-und-stage { min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.lp-und-switch { position: relative; display: inline-grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 999px; background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .22); }
.lp-und-thumb { position: absolute; inset-block: 4px; inset-inline-start: 4px; width: calc(50% - 4px); border-radius: 999px; background: #E3C08B; box-shadow: 0 6px 16px -6px rgba(0, 0, 0, .5); transition: inset-inline-start .45s cubic-bezier(.34, 1.4, .5, 1); }
.lp-und-switch.is-get .lp-und-thumb { inset-inline-start: 50%; }
.lp-und-switch button { position: relative; z-index: 1; min-width: 6.5rem; padding: .55rem 1.4rem; font: inherit; font-size: .95rem; font-weight: 900; color: rgba(255, 255, 255, .75); background: none; border: 0; border-radius: 999px; cursor: pointer; transition: color .3s ease; }
.lp-und-switch button.is-on { color: #0A3C34; }
.lp-und-switch button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.lp-und-board { position: relative; width: 100%; max-width: 30rem; aspect-ratio: 5 / 4; border-radius: 1.6rem; background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .14); }
.lp-und-lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.lp-und-lines path { fill: none; stroke: #E3C08B; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .2s ease; }
.lp-und-board.is-get .lp-und-lines path { stroke-dashoffset: 0; transition: stroke-dashoffset .8s ease calc(var(--i) * 300ms + 700ms); }
.lp-und-chip { position: absolute; left: var(--sx); top: var(--sy); z-index: 2; display: flex; align-items: center; width: max-content; max-width: min(9.6rem, 36%); padding: .55rem .8rem; border-radius: .9rem; font-size: .84rem; font-weight: 800; line-height: 1.45; text-align: start; color: rgba(255, 255, 255, .62); background: rgba(255, 255, 255, .07); border: 1.5px dashed rgba(255, 255, 255, .34); transform: translate(-50%, -50%) rotate(var(--r)); transition: left .95s cubic-bezier(.34, 1.3, .5, 1) calc(var(--i) * 110ms), top .95s cubic-bezier(.34, 1.3, .5, 1) calc(var(--i) * 110ms), transform .95s cubic-bezier(.34, 1.3, .5, 1) calc(var(--i) * 110ms), background .5s ease, color .5s ease, border-color .5s ease, box-shadow .5s ease; }
.lp-und-chip i { flex: none; display: grid; place-items: center; width: 0; height: 1.4rem; margin: 0; overflow: hidden; opacity: 0; border-radius: 50%; font-style: normal; font-size: .75rem; font-weight: 900; color: #fff; background: #B9791F; transition: width .4s ease, margin .4s ease, opacity .4s ease; }
.lp-und-board.is-get .lp-und-chip { left: var(--x); top: var(--y); color: #0E5348; background: #FFF6E3; border: 1.5px solid #E3C08B; box-shadow: 0 12px 26px -12px rgba(0, 0, 0, .6); transform: translate(-50%, -50%) rotate(0deg); }
.lp-und-board.is-get .lp-und-chip i { width: 1.4rem; margin-inline-end: .5rem; opacity: 1; }
.lp-und-link { position: absolute; z-index: 3; padding: .12rem .6rem; border-radius: 999px; font-size: .7rem; font-weight: 900; color: #fff; background: #B9791F; opacity: 0; transform: translate(-50%, -50%) scale(.5); transition: opacity .3s ease, transform .3s ease; }
.lp-und-board.is-get .lp-und-link { opacity: 1; transform: translate(-50%, -50%) scale(1); transition: opacity .4s ease calc(var(--i) * 300ms + 1100ms), transform .5s cubic-bezier(.34, 1.56, .64, 1) calc(var(--i) * 300ms + 1100ms); }
.lp-und-cap { margin: 0; min-height: 1.7em; font-size: .98rem; font-weight: 800; text-align: center; color: #F0D9AE; animation: lp-cap-in .5s ease both; }
@keyframes lp-cap-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (max-width: 900px) { .lp-und-panel { grid-template-columns: minmax(0, 1fr); border-radius: 1.8rem; } }
@media (max-width: 520px) { .lp-und { padding-inline: .85rem; } .lp-und-chip { font-size: .74rem; padding: .45rem .6rem; } }

/* ============ FAQ split ============ */
.lp-faq-split { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.3fr); gap: clamp(1.5rem, 4vw, 3.5rem); align-items: start; }
.lp-faq-side { position: sticky; top: 6rem; text-align: start; }
.lp-faq-title { margin: .8rem 0; font-size: clamp(1.6rem, 3.4vw, 2.4rem); font-weight: 900; line-height: 1.4; color: var(--lp-teal-deep); text-wrap: balance; }
.lp-root.is-dark .lp-faq-title { color: var(--lp-text); }
.lp-faq-mark { display: block; margin-top: 1.2rem; font-size: clamp(7rem, 16vw, 11rem); font-weight: 900; line-height: .85; color: transparent; -webkit-text-stroke: 3px var(--lp-gold); opacity: .6; transform-origin: 30% 80%; animation: lp-mark-sway 6s ease-in-out infinite; }
@keyframes lp-mark-sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
.lp-faq-split .lp-faq { max-width: none; margin: 0; }
.lp-faq-item { border-inline-start: 6px solid var(--lp-line-strong); }
.lp-faq-item.is-open { border-inline-start-color: var(--lp-gold); }
@media (max-width: 860px) { .lp-faq-split { grid-template-columns: minmax(0, 1fr); } .lp-faq-side { position: static; } .lp-faq-mark { display: none; } }
@media (prefers-reduced-motion: reduce) { .lp-faq-mark { animation: none; } }

/* ============ Contact envelope ============ */
.lp-mail-art { width: min(100%, 13rem); margin: auto auto 0; padding-top: 1rem; overflow: visible; }
.lp-mail-letter { animation: lp-letter 5s ease-in-out infinite; }
@keyframes lp-letter { 0%, 18% { transform: translateY(0); } 42%, 72% { transform: translateY(-30px); } 92%, 100% { transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .lp-mail-letter { animation: none; } }

/* ============ Contact: send fallbacks ============ */
.lp-ct-sent { margin-top: 1rem; padding: 1rem 1.1rem; border-radius: 1rem; background: var(--lp-soft-accent); border: 1.5px solid color-mix(in srgb, var(--lp-teal) 35%, transparent); }
.lp-ct-sent b { display: block; font-size: 1rem; font-weight: 900; color: var(--lp-teal-deep); }
.lp-root.is-dark .lp-ct-sent b { color: var(--lp-text); }
.lp-ct-sent p { margin: .3rem 0 .8rem; font-size: .88rem; line-height: 1.7; color: var(--lp-muted); }
.lp-ct-alts { display: flex; flex-wrap: wrap; gap: .5rem; }
.lp-ct-alt { display: inline-flex; align-items: center; padding: .5rem 1rem; font: inherit; font-size: .85rem; font-weight: 800; text-decoration: none; cursor: pointer; color: var(--lp-teal-deep); background: var(--lp-surface); border: 1.5px solid var(--lp-line-strong); border-radius: 999px; transition: border-color .2s ease, transform .2s ease; }
.lp-root.is-dark .lp-ct-alt { color: var(--lp-text); }
.lp-ct-alt:hover { border-color: var(--lp-teal); transform: translateY(-1px); }
.lp-ct-sent small { display: block; margin-top: .7rem; font-weight: 700; color: var(--lp-muted); }

/* ============ Services: stacking deck ============ */
.lp-anchor { display: block; height: 0; scroll-margin-top: 6rem; }
.lp-rail a.is-active { border-color: var(--ac); background: color-mix(in srgb, var(--ac) 16%, var(--lp-surface)); }
.lp-sk { list-style: none; margin: 0; padding: 0 0 1rem; display: grid; gap: 1.2rem; }
.lp-sk-slide { --t: 0; position: relative; scroll-margin-top: 6rem; }
.lp-sk-card { position: relative; overflow: hidden; display: grid; gap: clamp(1rem, 3vw, 2.2rem); padding: clamp(1.1rem, 2.6vw, 2rem); border-radius: 2rem; border: 2px solid var(--lp-line-strong); border-top: 7px solid var(--ac); background: radial-gradient(70% 90% at 100% 0%, var(--soft), transparent 60%), var(--lp-surface); box-shadow: 0 30px 60px -34px rgba(14, 83, 72, .55); transform-origin: 50% 0; transform: scale(calc(1 - var(--t) * .06)); filter: brightness(calc(1 - var(--t) * .1)); will-change: transform; --msc-svg-soft: var(--soft); }
.lp-sk-n { position: absolute; z-index: 0; inset-block-end: -1.6rem; inset-inline-start: 1.2rem; font-size: clamp(6rem, 14vw, 10rem); font-weight: 900; line-height: 1; color: transparent; -webkit-text-stroke: 2px var(--ac); opacity: .22; pointer-events: none; }
.lp-sk-copy { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.lp-sk-art { position: relative; z-index: 1; align-self: center; min-width: 0; }
.lp-sk-phase { align-self: flex-start; display: inline-flex; align-items: center; gap: .5rem; padding: .25rem .8rem .25rem .3rem; border-radius: 999px; font-size: .78rem; font-weight: 800; color: var(--lp-muted); background: var(--lp-surface-soft); border: 1px solid var(--lp-line-strong); }
.lp-sk-phase i { display: grid; place-items: center; width: 1.4rem; height: 1.4rem; border-radius: 50%; font-style: normal; font-size: .72rem; font-weight: 900; color: #fff; background: var(--ac); }
.lp-sk-card h4.msc-card { margin: 0; cursor: default; }
.lp-sk-points { list-style: none; margin: 0; padding: 0; display: grid; gap: .55rem; }
.lp-sk-points li { display: flex; gap: .6rem; align-items: flex-start; font-size: .92rem; font-weight: 700; line-height: 1.7; }
.lp-sk-points li i { flex: none; display: grid; place-items: center; width: 1.3rem; height: 1.3rem; margin-top: .15rem; border-radius: 50%; background: var(--ac); color: #fff; font-size: .72rem; font-style: normal; }
.lp-sk-slide[data-covered="1"] .msc-art *, .lp-sk-slide[data-covered="1"] .msc-card { animation-play-state: paused !important; }
@media (min-width: 900px) {
  .lp-sk { display: block; padding-bottom: 2rem; }
  .lp-sk-slide { position: sticky; top: calc(5.5rem + var(--i) * .9rem); margin-bottom: clamp(2.5rem, 9vh, 5rem); scroll-margin-top: calc(5.5rem + var(--i) * .9rem); }
  .lp-sk-slide:last-child { margin-bottom: 0; }
  .lp-sk-card { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; }
  .lp-sk-slide:nth-child(even) .lp-sk-art { order: -1; }
}
@media (prefers-reduced-motion: reduce) { .lp-sk-card { transform: none; filter: none; } }

/* ============ Services: polish ============ */
.lp-journey { padding-top: clamp(4rem, 9vw, 7rem); position: relative; }
.lp-journey::before { content: ""; position: absolute; inset-inline: 0; top: 0; height: 26rem; z-index: -1; pointer-events: none; background: radial-gradient(50% 60% at 50% 0%, var(--lp-soft-accent), transparent 70%); }
.lp-journey-head { margin-bottom: clamp(2rem, 5vw, 3.2rem); }
.lp-journey-head h2 { font-size: clamp(1.8rem, 4.4vw, 2.8rem); color: var(--lp-teal-deep); }
.lp-root.is-dark .lp-journey-head h2 { color: var(--lp-text); }
.lp-journey-head h2::after { content: ""; display: block; width: 4rem; height: 4px; margin: .9rem auto 0; border-radius: 4px; background: linear-gradient(90deg, var(--lp-teal), var(--lp-gold)); }
.lp-rail a { box-shadow: 0 6px 16px -10px rgba(14, 83, 72, .35); }
.lp-rail a.is-active { transform: translateY(-2px) scale(1.04); box-shadow: 0 12px 22px -12px var(--ac); }
.lp-sk-card { border-radius: 2.2rem; box-shadow: 0 40px 70px -40px color-mix(in srgb, var(--ac) 60%, transparent), 0 2px 0 rgba(255, 255, 255, .55) inset, 0 -1px 0 color-mix(in srgb, var(--ac) 14%, transparent) inset; }
.lp-sk-card::before { content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none; background-image: radial-gradient(color-mix(in srgb, var(--ac) 22%, transparent) 1px, transparent 1.3px); background-size: 22px 22px; -webkit-mask-image: linear-gradient(200deg, #000, transparent 55%); mask-image: linear-gradient(200deg, #000, transparent 55%); opacity: .55; }
.lp-sk-card::after { content: ""; position: absolute; z-index: 0; inset-block-start: -30%; inset-inline-end: -12%; width: 55%; aspect-ratio: 1; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, color-mix(in srgb, var(--ac) 24%, transparent), transparent 68%); filter: blur(10px); }
.lp-sk-points li { padding: .45rem .7rem; border-radius: .9rem; background: color-mix(in srgb, var(--ac) 8%, var(--lp-surface)); border: 1px solid color-mix(in srgb, var(--ac) 18%, transparent); }
.lp-sk-points li i { margin-top: .2rem; }
.lp-sk-art .lp-window, .lp-sk-art.lp-window { box-shadow: 0 30px 50px -30px color-mix(in srgb, var(--ac) 55%, transparent), 0 0 0 5px color-mix(in srgb, var(--ac) 10%, transparent); }
@media (min-width: 900px) { .lp-sk-slide:nth-child(even) .lp-sk-card::after { inset-inline-end: auto; inset-inline-start: -12%; } }
@media (max-width: 899px) {
  .lp-journey-head p { font-size: .96rem; }
  .lp-sk-card { padding: 1rem; border-radius: 1.6rem; gap: .9rem; }
  .lp-sk-n { font-size: 5rem; inset-block-end: -1rem; }
  .lp-sk-points { gap: .4rem; }
  .lp-sk-points li { font-size: .84rem; line-height: 1.55; padding: .35rem .6rem; }
  .lp-sk[data-stack="1"] { display: block; padding-bottom: 1rem; }
  .lp-sk[data-stack="1"] .lp-sk-slide { position: sticky; top: calc(4.8rem + var(--i) * .5rem); margin-bottom: clamp(1.4rem, 6vh, 2.6rem); scroll-margin-top: calc(4.8rem + var(--i) * .5rem); }
  .lp-sk[data-stack="1"] .lp-sk-slide:last-child { margin-bottom: 0; }
}

/* ============ Contact: WhatsApp ============ */
.lp-wa { position: relative; overflow: hidden; justify-content: center; gap: .2rem; }
.lp-wa::after { content: ""; position: absolute; inset-block-start: -35%; inset-inline-end: -20%; width: 60%; aspect-ratio: 1; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, rgba(37, 211, 102, .16), transparent 68%); }
.lp-wa > * { position: relative; z-index: 1; }
.lp-wa-ico { display: grid; place-items: center; width: 3.6rem; height: 3.6rem; margin-bottom: .8rem; border-radius: 1.1rem; color: #fff; background: linear-gradient(135deg, #25D366, #128C7E); box-shadow: 0 14px 26px -12px rgba(18, 140, 126, .8); }
.lp-wa h3 { font-size: clamp(1.25rem, 2.6vw, 1.6rem); line-height: 1.5; }
.lp-wa-who { display: flex; flex-wrap: wrap; gap: .45rem; margin: .4rem 0 1.1rem; }
.lp-wa-who button { padding: .42rem .9rem; font: inherit; font-size: .84rem; font-weight: 800; cursor: pointer; color: var(--lp-text); background: var(--lp-bg); border: 1.5px solid var(--lp-line-strong); border-radius: 999px; transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease; }
.lp-wa-who button:hover { transform: translateY(-1px); border-color: #128C7E; }
.lp-wa-who button.is-on { color: #fff; background: #128C7E; border-color: #128C7E; }
.lp-wa-who button:focus-visible { outline: 3px solid color-mix(in srgb, #128C7E 40%, transparent); outline-offset: 2px; }
.lp-wa-btn { width: 100%; flex-wrap: wrap; text-decoration: none; background: linear-gradient(135deg, #25D366, #128C7E); box-shadow: 0 18px 30px -16px rgba(18, 140, 126, .85); }
.lp-wa-btn bdi { padding: .15rem .6rem; border-radius: 999px; font-size: .82rem; background: rgba(255, 255, 255, .22); }
.lp-wa-note { display: block; margin-top: .8rem; font-size: .84rem; font-weight: 700; text-align: center; color: var(--lp-muted); }

button.lp-logo { background: none; border: 0; padding: 0; font: inherit; cursor: pointer; }
`;