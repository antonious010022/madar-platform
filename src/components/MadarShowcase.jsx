import { useEffect, useLayoutEffect, useRef, useState } from "react";

const INK = "var(--lp-text)";
const TEAL = "var(--lp-teal)";

const FEATURES = [
  {
    id: "visual",
    title: "شرح مرئي مبسّط",
    text: "فيديو وصور وشرح واضح يرافق كل فكرة في الدرس.",
    tag: "افهم",
    ac: "#147A6A", darkAc: "#3E9A8A", soft: "rgba(20, 122, 106, 0.12)", ink: "var(--lp-text)",
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
];

const D = (ms) => ({ "--d": `${ms}ms` });
const fs = (n) => ({ fontSize: `calc(${n}px * var(--ts, 1))` });

function VisualArt({ ac }) {
  return (
    <svg className="msc-art" viewBox="0 0 400 230" role="img" aria-label="شرح مرئي: صورة وفيديو ثم سبب وحدث ونتيجة">
      <defs>
        <linearGradient id="msc-v-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--lp-surface)" />
          <stop offset="1" stopColor="var(--msc-canvas-bg)" />
        </linearGradient>
      </defs>
      <g className="msc-pop" style={D(0)}>
        <rect x="22" y="14" width="230" height="146" rx="18" fill="url(#msc-v-sky)" stroke={ac} strokeWidth="2.5" />
        <circle cx="62" cy="40" r="9" fill="#FFD27A" />
        <g className="msc-spin" style={{ transformOrigin: "137px 82px" }}>
          <ellipse cx="137" cy="82" rx="74" ry="20" fill="none" stroke={ac} strokeWidth="1.6" strokeDasharray="3 6" opacity=".55" transform="rotate(-18 137 82)" />
          <circle cx="205" cy="64" r="5" fill={ac} />
        </g>
        <circle cx="137" cy="82" r="44" fill="var(--msc-svg-soft)" stroke={ac} strokeWidth="2.2" />
        <path d="M108 70c8-10 20-9 26-3 5 5 1 12-6 13-6 1-8 8-15 6-7-3-10-10-5-16z" fill={ac} opacity=".85" />
        <path d="M146 92c8-4 18-1 20 6 3 8-4 14-11 13-8-1-14-12-9-19z" fill={ac} opacity=".7" />
        <ellipse cx="137" cy="82" rx="19" ry="44" fill="none" stroke="var(--lp-surface)" strokeWidth="1.4" opacity=".6" />
        <path d="M95 82h84" stroke="var(--lp-surface)" strokeWidth="1.4" opacity=".6" />
        <circle className="msc-pulse" cx="52" cy="136" r="15" fill="none" stroke={ac} strokeWidth="2" />
        <circle cx="52" cy="136" r="15" fill={ac} />
        <path d="M48 129l12 7-12 7z" fill="#fff" />
        <rect x="78" y="133" width="158" height="7" rx="3.5" fill="var(--lp-surface)" opacity=".9" />
        <rect className="msc-bar" x="78" y="133" width="158" height="7" rx="3.5" fill={ac} />
      </g>
      <g className="msc-rise" style={D(300)}>
        <rect x="22" y="176" width="70" height="26" rx="13" fill="var(--lp-surface)" stroke={ac} strokeWidth="1.8" />
        <text x="57" y="193.5" textAnchor="middle" style={fs(11.5)} fontWeight="800" fill="var(--lp-text)">فيديو</text>
        <rect x="100" y="176" width="70" height="26" rx="13" fill="var(--lp-surface)" stroke={ac} strokeWidth="1.8" />
        <text x="135" y="193.5" textAnchor="middle" style={fs(11.5)} fontWeight="800" fill="var(--lp-text)">صور</text>
        <rect x="178" y="176" width="74" height="26" rx="13" fill="var(--lp-surface)" stroke={ac} strokeWidth="1.8" />
        <text x="215" y="193.5" textAnchor="middle" style={fs(11.5)} fontWeight="800" fill="var(--lp-text)">شرح</text>
      </g>
      {[
        { y: 12, tag: "السبب", t: "طرق تجارة جديدة", d: 450 },
        { y: 92, tag: "الحدث", t: "رحلات الاستكشاف", d: 650 },
        { y: 172, tag: "النتيجة", t: "خرائط جديدة", d: 850 },
      ].map((n) => (
        <g key={n.tag} className="msc-pop" style={D(n.d)}>
          <rect x="268" y={n.y} width="124" height="46" rx="14" fill="var(--lp-surface)" stroke={ac} strokeWidth="2" />
          <text x="330" y={n.y + 18} textAnchor="middle" style={fs(10.5)} fontWeight="800" fill={ac}>{n.tag}</text>
          <text x="330" y={n.y + 35} textAnchor="middle" style={fs(11.5)} fontWeight="800" fill="var(--lp-text)">{n.t}</text>
        </g>
      ))}
      <path className="msc-flow" d="M330 58v34" stroke={ac} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M324 86l6 7 6-7" stroke={ac} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path className="msc-flow" d="M330 138v34" stroke={ac} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M324 166l6 7 6-7" stroke={ac} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

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
          <rect x={n.x} y={n.y} width={n.w} height="32" rx="16" fill="var(--lp-surface)" stroke={ac} strokeWidth="2.2" />
          <text x={n.x + n.w / 2} y={n.y + 20.5} textAnchor="middle" style={fs(12)} fontWeight="800" fill="var(--lp-text)">{n.t}</text>
        </g>
      ))}
      <circle className="msc-pop" style={D(1150)} cx="26" cy="64" r="5" fill={ac} opacity=".55" />
      <circle className="msc-pop" style={D(1250)} cx="378" cy="70" r="4" fill={ac} opacity=".45" />
      <circle className="msc-pop" style={D(1350)} cx="196" cy="214" r="4.5" fill={ac} opacity=".5" />
    </svg>
  );
}

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
              <circle cx={e.x} cy="118" r="11" fill="var(--lp-surface)" stroke={ac} strokeWidth="3.2" />
              <circle cx={e.x} cy="118" r="4.2" fill={ac} />
            </g>
            <g className="msc-pop" style={D(e.d + 120)}>
              <rect x={e.x - 56} y={cy} width="112" height="54" rx="14" fill="var(--lp-surface)" stroke={ac} strokeWidth="2" />
              <text x={e.x} y={cy + 24} textAnchor="middle" style={fs(16)} fontWeight="900" fill={ac}>{e.y}</text>
              <text x={e.x} y={cy + 42} textAnchor="middle" style={fs(11)} fontWeight="800" fill="var(--lp-text)">{e.t}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

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
          <rect className={r.cls} x="24" y={r.y} width="352" height="36" rx="12" fill="var(--lp-surface)" stroke="var(--lp-line)" strokeWidth="2" />
          <circle cx="352" cy={r.y + 18} r="9" fill="var(--lp-surface)" stroke={ac} strokeWidth="2" />
          <text x="332" y={r.y + 23} textAnchor="start" style={fs(13)} fontWeight="800" fill="var(--lp-text)">{r.t}</text>
          {r.cls === "msc-q-right" && (
            <g className="msc-q-check">
              <circle cx="352" cy={r.y + 18} r="9" fill={ac} />
              <path d={`M347.5 ${r.y + 18.5}l3.6 3.6 6-6.6`} stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          )}
          {r.cls === "msc-q-right" && (
            <g className="msc-q-chip">
              <rect x="30" y={r.y + 6} width="64" height="24" rx="12" fill={ac} />
              <text x="62" y={r.y + 22.5} textAnchor="middle" style={fs(11.5)} fontWeight="800" fill="#fff">أحسنت!</text>
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

const ARTS = { visual: VisualArt, mind: MindArt, timeline: TimelineArt, quiz: QuizArt };

function Decor() {
  return (
    <div className="msc-decor" aria-hidden="true">
      <div className="msc-gridbg" />
      <div className="msc-glow msc-glow-a" />
      <div className="msc-glow msc-glow-b" />
      <div className="msc-topline" />
      <svg className="msc-orbit" viewBox="0 0 220 220">
        <g className="msc-spin-slow" style={{ transformOrigin: "110px 110px" }}>
          <circle cx="110" cy="110" r="96" fill="none" stroke="var(--lp-teal)" strokeWidth="1.4" strokeDasharray="3 9" opacity=".35" />
          <circle cx="206" cy="110" r="6" fill="var(--lp-teal)" opacity=".5" />
        </g>
        <g className="msc-spin-rev" style={{ transformOrigin: "110px 110px" }}>
          <circle cx="110" cy="110" r="64" fill="none" stroke="#C98512" strokeWidth="1.4" strokeDasharray="2 8" opacity=".4" />
          <circle cx="110" cy="46" r="4.5" fill="#C98512" opacity=".6" />
        </g>
        <circle cx="110" cy="110" r="10" fill="var(--lp-teal)" opacity=".18" />
      </svg>
      <svg className="msc-compass" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#C98512" strokeWidth="1.6" opacity=".35" />
        <circle cx="60" cy="60" r="38" fill="none" stroke="#C98512" strokeWidth="1" strokeDasharray="2 5" opacity=".35" />
        <path d="M60 14v10M60 96v10M14 60h10M96 60h10" stroke="#C98512" strokeWidth="2" strokeLinecap="round" opacity=".45" />
        <g className="msc-sway" style={{ transformOrigin: "60px 60px" }}>
          <path d="M60 28l7 32H53z" fill="#C2562F" opacity=".5" />
          <path d="M60 92l7-32H53z" fill="var(--lp-text)" opacity=".25" />
        </g>
      </svg>
      <span className="msc-spark msc-spark-1" />
      <span className="msc-spark msc-spark-2" />
      <span className="msc-spark msc-spark-3" />
      <span className="msc-spark msc-spark-4" />
    </div>
  );
}

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

export default function MadarShowcase({ isDark = false }) {
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
  const activeColor = isDark ? f.darkAc : f.ac;
  const Art = ARTS[f.id];

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

  useEffect(() => {
    if (!auto || reduced || !inView || hover) return undefined;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % FEATURES.length), 7000);
    return () => window.clearTimeout(t);
  }, [auto, reduced, inView, hover, active]);

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

  const vars = { "--ac": activeColor, "--soft": f.soft, "--ink": f.ink };

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
                const c = isDark ? FEATURES[i].darkAc : FEATURES[i].ac;
                return (
                  <g key={FEATURES[i].id}>
                    <path d={p.d} fill="none" stroke={on ? c : "var(--lp-text)"} strokeOpacity={on ? 0.35 : 0.14} strokeWidth={on ? 3 : 2} strokeDasharray={on ? undefined : "4 7"} className="msc-wire" />
                    {on && <path d={p.d} fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" className="msc-flow-wire" style={{ filter: `drop-shadow(0 0 6px ${c}99)` }} />}
                    <circle cx={p.x2} cy={p.y2} r={on ? 6 : 4} fill="var(--lp-surface)" stroke={on ? c : "var(--lp-line)"} strokeWidth="2.4" className="msc-wire-node" />
                  </g>
                );
              })}
              <circle cx={geo.x1} cy={geo.y1} r="7" fill="var(--lp-surface)" stroke={activeColor} strokeWidth="3" className="msc-wire-node" />
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
                <Art ac={activeColor} />
              </div>
            </div>
          </article>

          <div className="msc-vline" aria-hidden="true"><i /></div>

          <div className="msc-cards" role="group" aria-label="اختر أداة">
            {FEATURES.map((x, i) => {
              const on = i === active;
              const cardAc = isDark ? x.darkAc : x.ac;
              return (
                <div key={x.id} ref={(el) => { slotRefs.current[i] = el; }} className="msc-slot msc-rv" style={{ "--i": 4 + i }}>
                  <button
                    type="button"
                    className={`msc-card${on ? " is-on" : ""}`}
                    style={{ "--ac": cardAc, "--soft": x.soft, "--ink": x.ink, "--fd": x.fd, "--dl": x.dl, "--rot": x.rot }}
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

export const SHOWCASE_CSS = `
.msc { 
  --ac: var(--lp-teal); 
  --soft: rgba(20,122,106,.08); 
  --ink: var(--lp-text);
  --msc-canvas-bg: color-mix(in srgb, var(--lp-surface) 92%, var(--lp-bg));
  --msc-svg-soft: rgba(20,122,106,.15);
  position: relative; 
  isolation: isolate; 
  overflow: hidden; 
  margin: 32px 0 8px; 
  padding: 40px 0 36px;
  border-radius: 32px; 
  border: 1px solid var(--lp-line); 
  color: var(--lp-text);
  background: color-mix(in srgb, var(--lp-surface) 60%, transparent);
  text-align: start; 
  box-shadow: var(--lp-shadow);
}
.msc *, .msc *::before, .msc *::after { box-sizing: border-box; }
.msc-wrap { position: relative; z-index: 2; width: 100%; max-width: 1120px; margin: 0 auto; padding: 0 20px; }

/* ---- decoration ---- */
.msc-decor { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.msc-gridbg { position: absolute; inset: 0; opacity: .5;
  background-image: linear-gradient(rgba(20,122,106,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20,122,106,.08) 1px, transparent 1px);
  background-size: 38px 38px;
  -webkit-mask-image: radial-gradient(ellipse 75% 70% at 50% 45%, #000 20%, transparent 78%);
  mask-image: radial-gradient(ellipse 75% 70% at 50% 45%, #000 20%, transparent 78%); }
.msc-glow { position: absolute; border-radius: 50%; filter: blur(60px); transition: background .8s ease; }
.msc-glow-a { width: 340px; height: 340px; top: -90px; inset-inline-start: -60px; background: rgba(20,122,106,.1); }
.msc-glow-b { width: 360px; height: 360px; bottom: -120px; inset-inline-end: -70px; background: var(--ac); opacity: .15; }
.msc-topline { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--lp-line), transparent); }
.msc-orbit { position: absolute; width: 220px; height: 220px; top: 18px; inset-inline-end: 22px; opacity: .6; }
.msc-compass { position: absolute; width: 120px; height: 120px; bottom: 22px; inset-inline-end: 26px; }
.msc-spark { position: absolute; width: 9px; height: 9px; border-radius: 3px; background: #C98512; opacity: .4; transform: rotate(45deg); animation: msc-twinkle 4.8s ease-in-out infinite; }
.msc-spark-1 { top: 120px; inset-inline-start: 7%; }
.msc-spark-2 { top: 64px; inset-inline-start: 38%; background: var(--lp-teal); animation-delay: -1.6s; }
.msc-spark-3 { bottom: 90px; inset-inline-end: 9%; background: #C2562F; animation-delay: -3s; }
.msc-spark-4 { bottom: 40px; inset-inline-end: 40%; animation-delay: -2.2s; }

/* ---- heading ---- */
.msc-head { text-align: center; max-width: 720px; margin: 0 auto 36px; }
.msc-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px; font-size: .8rem; font-weight: 800;
  color: var(--lp-teal-deep); background: rgba(20,122,106,.1); border: 1px solid var(--lp-line); }
.msc-badge svg { animation: msc-pulse-soft 2.4s ease-in-out infinite; }
.msc .msc-head h2 { margin: 14px 0 8px; font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 900; line-height: 1.25; color: var(--lp-text); }
.msc .msc-head p { margin: 0; font-size: 0.98rem; line-height: 1.8; color: var(--lp-muted); }

/* ---- stage layout ---- */
.msc-stage { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; }
.msc-wires { position: absolute; left: 0; top: 0; z-index: 6; pointer-events: none; overflow: visible; display: none; }
.msc-vline { display: flex; justify-content: center; order: 2; height: 26px; }
.msc-vline i { width: 4px; height: 100%; border-radius: 4px; background: linear-gradient(180deg, transparent, var(--ac), transparent); background-size: 100% 220%; animation: msc-vflow 1.8s linear infinite; transition: background .5s; }
.msc-cards { order: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.msc-main { order: 3; }

@media (min-width: 1024px) {
  .msc-stage { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); column-gap: 72px; align-items: stretch; }
  .msc-wires { display: block; }
  .msc-vline { display: none; }
  .msc-main { order: 1; }
  .msc-cards { order: 2; grid-template-columns: minmax(0, 1fr); gap: 14px; align-content: center; }
}

/* ---- main card ---- */
.msc-main { 
  position: relative; z-index: 3; overflow: hidden; padding: 22px 20px 20px; border-radius: 26px; 
  background: var(--lp-surface);
  border: 1px solid var(--lp-line); 
  box-shadow: var(--lp-shadow);
  transition: border-color .5s ease, box-shadow .5s ease; 
}
.msc-sheen { position: absolute; inset: 0; pointer-events: none; opacity: .4;
  background: radial-gradient(520px 220px at 85% -10%, color-mix(in srgb, var(--ac) 20%, transparent), transparent 70%); transition: background .6s ease; }
.msc-main-top { position: relative; display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; margin-bottom: 14px; border-bottom: 1px solid var(--lp-line); }
.msc-live { display: inline-flex; align-items: center; gap: 9px; font-size: .86rem; font-weight: 800; color: var(--lp-muted); }
.msc-live i { position: relative; width: 10px; height: 10px; border-radius: 50%; background: var(--ac); transition: background .5s; }
.msc-live i::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--ac); animation: msc-ping 1.9s ease-out infinite; }
.msc-count { padding: 3px 11px; border-radius: 999px; font-size: .78rem; font-weight: 800; color: var(--lp-text); background: rgba(20, 122, 106, 0.1); border: 1px solid var(--lp-line); transition: background .5s, color .5s; }
.msc-copy { position: relative; animation: msc-swap .5s ease both; }
.msc-tag { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: .76rem; font-weight: 900; color: #fff; background: var(--ac); transition: background .5s; }
.msc .msc-copy h3 { margin: 10px 0 6px; font-size: clamp(1.3rem, 3vw, 1.7rem); font-weight: 900; line-height: 1.3; color: var(--lp-text); transition: color .5s; }
.msc .msc-copy p { margin: 0; font-size: 0.96rem; line-height: 1.8; color: var(--lp-muted); }
.msc-points { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.msc-points li { display: inline-flex; align-items: center; gap: 8px; padding: 6px 13px; border-radius: 999px; font-size: .84rem; font-weight: 700; color: var(--lp-text); background: rgba(20, 122, 106, 0.08); border: 1px solid var(--lp-line);
  animation: msc-rise-in .5s ease both; animation-delay: calc(var(--k) * 90ms + 120ms); transition: background .5s, color .5s; }
.msc-points li i { width: 7px; height: 7px; border-radius: 50%; background: var(--ac); flex: none; }

.msc-canvas { 
  position: relative; margin-top: 18px; border-radius: 20px; padding: 10px; 
  background: var(--msc-canvas-bg); 
  border: 1px solid var(--lp-line); transition: background .5s, border-color .5s;
  background-image: radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ac) 20%, transparent) 1px, transparent 1.4px); 
  background-size: 18px 18px;
}
.msc-canvas-in { animation: msc-swap .55s ease both; }
.msc-canvas { --ts: 1; }
.msc-art { display: block; width: 100%; height: auto; font-family: inherit; direction: rtl; overflow: visible; }

/* ---- tool cards ---- */
.msc-slot { position: relative; }
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

@media (max-width: 1023px) {
  .msc { margin-top: 24px; padding: 32px 0 28px; border-radius: 24px; }
  .msc-card { flex-direction: column; align-items: flex-start; gap: 10px; padding: 14px 14px 13px; border-radius: 18px; animation-duration: calc(var(--fd, 6s) * 1.2); }
  .msc-card-icon { width: 42px; height: 42px; border-radius: 12px; }
  .msc-card-icon svg { width: 20px; height: 20px; }
  .msc-card-body { padding-inline-end: 0; }
  .msc-card-body small { display: none; }
  .msc-card-body b { font-size: .92rem; }
  .msc-card-bar { display: none; }
  .msc-orbit { width: 150px; height: 150px; top: 8px; opacity: .4; }
  .msc-compass { display: none; }
}
@media (max-width: 520px) {
  .msc-canvas { --ts: 1.2; }
  .msc-wrap { padding: 0 12px; }
  .msc-main { padding: 16px 12px 12px; border-radius: 20px; }
  .msc-canvas { padding: 6px; border-radius: 16px; }
  .msc-points li { font-size: .78rem; }
}

.msc-foot { margin: 28px 0 0; text-align: center; font-size: .88rem; font-weight: 800; color: var(--lp-muted); }

/* ---- reveal on scroll ---- */
.msc .msc-rv { opacity: 0; transform: translateY(18px); }
.msc.is-in .msc-rv { animation: msc-rise-in .65s cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i, 0) * 90ms); }

/* ---- wires ---- */
.msc-flow-wire { stroke-dasharray: 12 16; animation: msc-dash 1.1s linear infinite; }
.msc-wire, .msc-wire-node { transition: stroke .5s, stroke-opacity .5s; }

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
  .msc *, .msc *::before, .msc *::after { animation: none !important; transition: none !important; }
  .msc .msc-rv { opacity: 1; transform: none; }
  .msc-art .msc-q-right { fill: rgba(20, 122, 106, 0.15); stroke: var(--lp-teal); }
  .msc-art .msc-q-fill { transform: scaleX(.67); }
  .msc-art .msc-bar { transform: scaleX(.6); }
}
`;