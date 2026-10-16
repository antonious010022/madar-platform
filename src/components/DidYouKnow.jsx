import { useEffect, useRef, useState } from "react";
import { pickFactForStudent } from "../lib/didYouKnow";
import { PickArt } from "../pages/student-platform/uiParts";

/* 💡 هل تعلم؟ — بطاقة مستقلة عن قصد، علشان المعلومة تثبت في ذهن الطالب.
   - نفس اللمبة (PickArt kind="bulb")، لكن بتبدأ مطفية، وأول ما البطاقة تظهر في الشاشة
     بتنوّر وتتأرجح وتطلع لها هالة، وبعدها المعلومة تظهر في فقاعة.
   - الشكل "ورقة ملاحظات مثبّتة" (شريط لاصق + حدود منقّطة + ظل بارز) عشان تلفت النظر.
   - معلومة واحدة لكل زيارة تبويب (sessionStorage) — المنطق كما هو.
   - الستايل داخل الملف نفسه (md-dyk-*) فلا يعتمد على duo-dyk القديم. */

const STORE_KEY = "madar_dyk_visit_v1";
const inflight = new Map();

function readStored(key) {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && p.key === key && p.fact && p.fact.body ? p.fact : null;
  } catch {
    return null;
  }
}

function writeStored(key, fact) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ key, fact }));
  } catch {
    /* ignore */
  }
}

const DYK_CSS = `
.md-dyk { position: relative; margin: 0.9rem 0 1.5rem; direction: rtl; }
.md-dyk-inner {
  position: relative; display: flex; align-items: center; gap: clamp(0.9rem, 3vw, 1.7rem);
  padding: clamp(1.1rem, 2.8vw, 1.5rem) clamp(1rem, 3vw, 1.8rem);
  border-radius: 1.7rem; background: linear-gradient(135deg, #FFF9DF 0%, #FFEEB4 100%);
  border: 2px dashed #E3B93C; box-shadow: 0 6px 0 #E3B93C, 0 26px 42px -26px rgba(184, 131, 42, 0.6);
  transform: rotate(-0.6deg); transition: transform 0.3s ease;
}
.md-dyk:hover .md-dyk-inner { transform: rotate(0deg) translateY(-2px); }
/* شريط لاصق يثبّت الورقة */
.md-dyk-inner::before {
  content: ""; position: absolute; top: -0.7rem; left: 50%; width: 5.2rem; height: 1.4rem;
  background: rgba(227, 185, 60, 0.6); border-radius: 0.25rem; transform: translateX(-50%) rotate(2deg);
  box-shadow: 0 2px 4px rgba(120, 90, 10, 0.18);
}

.md-dyk-bulb { position: relative; flex: none; width: clamp(4.6rem, 13vw, 6.6rem); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }
.md-dyk-halo {
  position: absolute; inset: -42%; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(255, 213, 61, 0.85) 0%, rgba(255, 213, 61, 0.28) 38%, rgba(255, 213, 61, 0) 68%);
  opacity: 0; transform: scale(0.5); transition: opacity 0.5s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.md-dyk-art {
  position: relative; z-index: 1; width: 100%; height: 100%; transform-origin: 50% 8%;
  filter: grayscale(1) brightness(0.82) opacity(0.75); transition: filter 0.45s ease;
}
.md-dyk-art > * { width: 100%; height: 100%; }
.md-dyk-spark { position: absolute; z-index: 2; font-size: 1rem; color: #E3A912; opacity: 0; pointer-events: none; }
.md-dyk-spark--a { top: -6%; inset-inline-end: -8%; }
.md-dyk-spark--b { top: 22%; inset-inline-start: -14%; font-size: 0.8rem; }
.md-dyk-spark--c { bottom: 4%; inset-inline-end: -12%; font-size: 0.85rem; }

.md-dyk.is-lit .md-dyk-halo { opacity: 1; transform: scale(1); animation: md-dyk-glow 2.8s ease-in-out 0.7s infinite; }
.md-dyk.is-lit .md-dyk-art { filter: none; animation: md-dyk-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both, md-dyk-sway 3.6s ease-in-out 0.8s infinite; }
.md-dyk.is-lit .md-dyk-spark { animation: md-dyk-twinkle 2.2s ease-in-out infinite; }
.md-dyk.is-lit .md-dyk-spark--b { animation-delay: 0.7s; }
.md-dyk.is-lit .md-dyk-spark--c { animation-delay: 1.3s; }
@keyframes md-dyk-pop { 0% { transform: scale(0.85); } 55% { transform: scale(1.22); } 100% { transform: scale(1); } }
@keyframes md-dyk-sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes md-dyk-glow { 0%, 100% { opacity: 0.85; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.08); } }
@keyframes md-dyk-twinkle { 0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); } 50% { opacity: 1; transform: scale(1.1) rotate(30deg); } }

.md-dyk-bubble {
  position: relative; flex: 1; min-width: 0; padding: 1rem 1.2rem 0.9rem; border-radius: 1.35rem;
  background: #fff; border: 2px solid #F0D48A; box-shadow: 0 4px 0 #F0D48A;
}
/* ذيل الفقاعة ناحية اللمبة */
.md-dyk-bubble::before {
  content: ""; position: absolute; top: 1.5rem; inset-inline-start: -0.55rem; width: 1rem; height: 1rem;
  background: #fff; border: solid #F0D48A; border-width: 2px 2px 0 0; transform: rotate(45deg);
}
.md-dyk-tag {
  display: inline-flex; align-items: center; gap: 0.35rem; margin-bottom: 0.55rem; padding: 0.22rem 0.8rem;
  border-radius: 999px; background: #0E5348; color: #FFE08A; font-size: 0.78rem; font-weight: 900;
  transform: rotate(-2deg); box-shadow: 0 3px 0 #0A3F36;
}
.md-dyk-text { margin: 0; font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 800; line-height: 1.9; color: #3B2F0B; }
.md-dyk-text--fact { opacity: 0; transform: translateY(10px); transition: opacity 0.55s ease 0.35s, transform 0.55s ease 0.35s; }
.md-dyk.is-lit .md-dyk-text--fact { opacity: 1; transform: none; }
.md-dyk-text--plain { font-size: 0.92rem; font-weight: 700; opacity: 0.8; }
.md-dyk-foot { margin: 0.7rem 0 0; font-size: 0.74rem; font-weight: 800; color: #B8832A; opacity: 0; transition: opacity 0.5s ease 0.9s; }
.md-dyk.is-lit .md-dyk-foot { opacity: 1; }

@media (max-width: 520px) {
  .md-dyk-inner { flex-direction: column; text-align: center; }
  .md-dyk-bubble { width: 100%; text-align: right; }
  .md-dyk-bubble::before { top: -0.55rem; inset-inline-start: 50%; margin-inline-start: -0.5rem; border-width: 2px 0 0 2px; }
}

html[data-theme="dark"] .md-dyk-inner { background: linear-gradient(135deg, #2B2512 0%, #201C0E 100%); border-color: #8A6D1C; box-shadow: 0 6px 0 #6B5413, 0 26px 42px -26px rgba(0, 0, 0, 0.7); }
html[data-theme="dark"] .md-dyk-bubble { background: #192723; border-color: #5C4A14; box-shadow: 0 4px 0 #5C4A14; }
html[data-theme="dark"] .md-dyk-bubble::before { background: #192723; border-color: #5C4A14; }
html[data-theme="dark"] .md-dyk-text { color: #F6E7B4; }
html[data-theme="dark"] .md-dyk-foot { color: #D9BB6A; }

@media (prefers-reduced-motion: reduce) {
  .md-dyk-inner, .md-dyk-halo, .md-dyk-art, .md-dyk-text--fact, .md-dyk-foot { transition: none !important; }
  .md-dyk.is-lit .md-dyk-halo, .md-dyk.is-lit .md-dyk-art, .md-dyk.is-lit .md-dyk-spark { animation: none !important; }
  .md-dyk.is-lit .md-dyk-spark { opacity: 0.9; }
}
`;

function Shell({ children, showFact = false }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  // تنوّر اللمبة لما البطاقة تظهر فعلاً في الشاشة (مش وهي تحت)
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return undefined;
    }
    let t;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          t = setTimeout(() => setSeen(true), 350);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, []);

  const lit = seen && showFact;

  return (
    <aside ref={ref} className={`md-dyk${lit ? " is-lit" : ""}`} aria-label="هل تعلم؟" dir="rtl">
      <style>{DYK_CSS}</style>
      <div className="md-dyk-inner">
        <div className="md-dyk-bulb" aria-hidden="true">
          <span className="md-dyk-halo" />
          <div className="md-dyk-art">
            <PickArt kind="bulb" />
          </div>
          <span className="md-dyk-spark md-dyk-spark--a">✦</span>
          <span className="md-dyk-spark md-dyk-spark--b">✦</span>
          <span className="md-dyk-spark md-dyk-spark--c">✦</span>
        </div>
        <div className="md-dyk-bubble">{children}</div>
      </div>
    </aside>
  );
}

export function DidYouKnowCard({ session, stage, grade, ready = true, onRequireLogin }) {
  const userId = session?.user?.id || null;
  const lastSignIn = session?.user?.last_sign_in_at || "";
  const [fact, setFact] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | empty | error
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    setFact(null);
    setErrMsg("");
    if (session === undefined || !ready) {
      setStatus("idle");
      return undefined;
    }

    const identity = userId || "guest";
    const key = `${identity}:${lastSignIn}:${stage || ""}|${grade || ""}`;
    const stored = readStored(key);
    if (stored) {
      setFact(stored);
      setStatus("ready");
      return undefined;
    }

    setStatus("loading");
    let cancelled = false;
    let p = inflight.get(key);
    if (!p) {
      p = pickFactForStudent(userId, stage, grade).finally(() =>
        setTimeout(() => inflight.delete(key), 1500)
      );
      inflight.set(key, p);
    }

    p.then((f) => {
      if (cancelled) return;
      if (f) {
        writeStored(key, f);
        setFact(f);
        setStatus("ready");
      } else {
        setFact(null);
        setStatus("empty");
      }
    }).catch((e) => {
      if (cancelled) return;
      console.warn("DidYouKnow pick:", e);
      setFact(null);
      setStatus("error");
      const msg = String(e?.message || e || "");
      if (/permission|policy|RLS|42501/i.test(msg)) {
        setErrMsg("الصلاحيات تمنع قراءة المعلومات. طبّق migration الـ SQL في Supabase.");
      } else if (/relation|does not exist|42P01/i.test(msg)) {
        setErrMsg("جدول المعلومات غير موجود. شغّل migration_did_you_know.sql في Supabase.");
      } else {
        setErrMsg("تعذر تحميل المعلومة الآن.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, lastSignIn, stage, grade, ready, session]);

  if (session === undefined || !ready) return null;

  if (status === "loading" || status === "idle") {
    return (
      <Shell>
        <span className="md-dyk-tag">💡 هل تعلم؟</span>
        <p className="md-dyk-text md-dyk-text--plain">جاري اختيار معلومة…</p>
      </Shell>
    );
  }

  if (status === "error") {
    return (
      <Shell>
        <span className="md-dyk-tag">💡 هل تعلم؟</span>
        <p className="md-dyk-text md-dyk-text--plain">{errMsg || "تعذر تحميل المعلومة الآن."}</p>
      </Shell>
    );
  }

  if (status === "empty" || !fact) {
    return (
      <Shell>
        <span className="md-dyk-tag">💡 هل تعلم؟</span>
        <p className="md-dyk-text md-dyk-text--plain">
          لا توجد معلومات متاحة لصفك حاليًا. أضف معلومة نشطة من لوحة المعلم.
        </p>
      </Shell>
    );
  }

  return (
    <Shell showFact>
      <span className="md-dyk-tag">💡 هل تعلم؟</span>
      <p className="md-dyk-text md-dyk-text--fact">{fact.body}</p>
      <p className="md-dyk-foot">📌 معلومة اليوم — ثبّتها في ذهنك</p>
    </Shell>
  );
}

export const DYK_AUTH_COPY = {
  title: "سجّل دخولك لتكتشف معلومات جديدة",
  subtitle: "في كل زيارة تظهر لك معلومة مختلفة في «هل تعلم؟».",
};

export default DidYouKnowCard;