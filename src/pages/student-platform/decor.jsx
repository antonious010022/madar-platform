// Decorative / ambient components for the student home page (background, frieze, loaders).
// Moved verbatim from StudentPlatform.jsx — logic unchanged.
import { useEffect, useState } from "react";

/* ============================================================================
   مَدَار — Student Platform (Duolingo-style playful skin)
   ألوان: Green + Blue + Purple + Orange + Yellow
   كل المنطق البرمجي محفوظ 100% — فقط الرؤية والحركة تغيّرت
============================================================================ */

const STEP_COLORS = [
  "var(--md-teal)",
  "var(--md-gold)",
  "var(--md-sienna)",
  "var(--md-teal-deep)",
];

/* ---------------------------------------------------------------------------
   Decorative Components
--------------------------------------------------------------------------- */

function CompassRose({ className = "" }) {
  const ticks = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * 360) / 16;
    const long = i % 4 === 0;
    const rOuter = 48;
    const rInner = long ? 34 : 42;
    const rad = (angle * Math.PI) / 180;
    return {
      x1: 50 + rOuter * Math.sin(rad),
      y1: 50 - rOuter * Math.cos(rad),
      x2: 50 + rInner * Math.sin(rad),
      y2: 50 - rInner * Math.cos(rad),
      long,
    };
  });

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="currentColor"
          strokeWidth={t.long ? 2.2 : 1.2}
          opacity={t.long ? 0.9 : 0.45}
        />
      ))}
      <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.85" />
      <circle cx="50" cy="50" r="2.5" fill="var(--md-bg)" />
    </svg>
  );
}

const STARS = [
  { top: "6%", left: "18%", size: 2.5, twinkle: true, delay: "0s" },
  { top: "12%", left: "72%", size: 1.8, twinkle: false },
  { top: "22%", left: "38%", size: 2, twinkle: false },
  { top: "9%", left: "52%", size: 2.8, twinkle: true, delay: "1.4s" },
  { top: "30%", left: "82%", size: 1.6, twinkle: false },
  { top: "34%", left: "12%", size: 2.2, twinkle: true, delay: "2.6s" },
  { top: "45%", left: "60%", size: 1.7, twinkle: false },
  { top: "17%", left: "90%", size: 1.9, twinkle: false },
  { top: "40%", left: "28%", size: 2.6, twinkle: true, delay: "0.8s" },
  { top: "50%", left: "45%", size: 1.5, twinkle: false },
  { top: "3%", left: "34%", size: 1.8, twinkle: false },
  { top: "25%", left: "6%", size: 2, twinkle: false },
  { top: "58%", left: "78%", size: 1.6, twinkle: true, delay: "3.1s" },
  { top: "68%", left: "15%", size: 2.1, twinkle: false },
];

function Galaxy({ progress }) {
  return (
    <div className="md-galaxy" aria-hidden="true">
      {/* Soft nebula */}
      <div className="md-nebula" />

      {/* Stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className={`md-star ${s.twinkle ? "twinkle" : ""}`}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay || "0s",
          }}
        />
      ))}

      {/* Orbits that react to progress */}
      {progress.map((done, i) => {
        const size = 110 + i * 55;
        return (
          <div
            key={i}
            className={`md-orbit ${done ? "active" : ""}`}
            style={{
              width: size,
              height: size,
              borderColor: STEP_COLORS[i],
              animationDuration: `${28 + i * 9}s`,
            }}
          >
            <span
              className="md-planet"
              style={{
                background: STEP_COLORS[i],
                boxShadow: done ? `0 0 18px ${STEP_COLORS[i]}` : "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function ContinentsAtlas({ progress }) {
  const [stageDone, gradeDone, termDone] = progress;

  return (
    <div className="md-atlas" aria-hidden="true">
      <svg viewBox="0 0 600 320" className="md-atlas-svg">
        {/* Grid */}
        {[70, 140, 210, 280].map((ry, i) => (
          <ellipse
            key={`lat-${i}`}
            cx="300"
            cy="160"
            rx="280"
            ry={ry}
            fill="none"
            stroke="rgba(0,0,0,0.10)"
            strokeWidth="1"
          />
        ))}
        {[-220, -110, 0, 110, 220].map((dx, i) => (
          <path
            key={`lon-${i}`}
            d={`M ${300 + dx} 20 Q 300 160 ${300 + dx} 300`}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Simplified continents (decorative) */}
        <path
          d="M140 90 C170 70 220 75 250 95 C280 120 270 160 240 175 C200 195 150 180 130 150 C115 125 120 105 140 90Z"
          fill="rgba(28, 176, 246, 0.16)"
          stroke="rgba(28, 176, 246, 0.45)"
          strokeWidth="1.2"
        />
        <path
          d="M310 70 C360 55 420 70 450 100 C480 140 470 190 430 210 C390 230 340 215 320 180 C300 145 290 100 310 70Z"
          fill="rgba(255, 200, 0, 0.18)"
          stroke="rgba(255, 200, 0, 0.5)"
          strokeWidth="1.2"
        />
        <path
          d="M180 210 C220 195 270 205 290 235 C310 270 280 295 240 290 C200 285 165 255 180 210Z"
          fill="rgba(255, 150, 0, 0.16)"
          stroke="rgba(255, 150, 0, 0.45)"
          strokeWidth="1.2"
        />

        {/* Journey points */}
        <circle cx="180" cy="130" r={stageDone ? 6 : 3.5} fill={stageDone ? "var(--md-teal)" : "rgba(0,0,0,0.22)"} />
        <circle cx="320" cy="110" r={gradeDone ? 6 : 3.5} fill={gradeDone ? "var(--md-gold)" : "rgba(0,0,0,0.22)"} />
        <circle cx="420" cy="160" r={termDone ? 6 : 3.5} fill={termDone ? "var(--md-sienna)" : "rgba(0,0,0,0.22)"} />

        {/* Connecting path */}
        <path
          d="M180 130 Q250 90 320 110 T420 160"
          fill="none"
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </svg>
    </div>
  );
}

function usePointerParallax() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasFinePointer || reduceMotion) return;

    let frame = null;
    const handleMove = (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setPointer({
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5,
        });
        frame = null;
      });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return pointer;
}

function HistoryFrieze() {
  return (
    <div className="md-frieze" aria-hidden="true">
      <div className="md-frieze-inner">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="md-column">
            <div className="md-column-capital" />
            <div className="md-column-shaft" />
            <div className="md-column-base" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CompassSpinner() {
  return (
    <div className="md-spinner">
      <CompassRose className="md-spinner-rose" />
      <span className="md-spinner-text">جاري التحميل...</span>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Coming-soon smart assistant bubble — floating, bottom-right, non-functional
   placeholder for now. Purely presentational; no data or backend involved.
--------------------------------------------------------------------------- */
function ComingSoonAssistantBubble() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md-assistant-wrap">
      {open && (
        <div className="md-assistant-tooltip" role="status">
          <p className="md-assistant-tooltip-title">المساعد الذكي</p>
          <p className="md-assistant-tooltip-body">قريبًا هيبقى متاح، تابعنا!</p>
        </div>
      )}
      <button
        type="button"
        className="md-assistant-bubble"
        onClick={() => setOpen((v) => !v)}
        aria-label="المساعد الذكي - قريبًا يكون متاح"
      >
        <img src="/photo/IevsR.png" alt="" aria-hidden="true" className="md-assistant-bubble-logo" />
      </button>
    </div>
  );
}

export { STEP_COLORS, CompassRose, STARS, Galaxy, ContinentsAtlas, usePointerParallax, HistoryFrieze, CompassSpinner, ComingSoonAssistantBubble };