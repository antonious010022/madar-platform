import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ============================================================================
   دليل مَدَار — شخصية المنصة تمشي مع الطالب خطوة بخطوة
   ----------------------------------------------------------------------------
   - MadarGuide      : الدليل نفسه (تظليل العنصر + كارت الشخصية + أزرار)
   - GuideHelpButton : كورة صغيرة مدوّرة تحت على الجنب لإعادة تشغيل الدليل في أي وقت
   - useMadarGuide   : يحفظ «شاف الدليل قبل كده» في المتصفح ويشغّله أول مرة
   - PLATFORM_STEPS  : خطوات صفحة الطالب (الصف ← هل تعلم ← الترم ← الوحدة ← الدرس)
   - LESSON_STEPS    : خطوات جوّه الدرس (اسم الدرس، العناوين، الكلمات التفاعلية، الأدوات، الأسئلة)

   الخطوة اللي عنصرها مش موجود على الصفحة (مثلًا الدرس من غير خط زمني) بتتخطّى لوحدها.
   ========================================================================== */

/* ---------------------------------------------------------------- storage */
const STORE = { platform: "madar_guide_platform_v1", lesson: "madar_guide_lesson_v1" };
function wasSeen(key) {
  try { return localStorage.getItem(STORE[key]) === "1"; } catch { return false; }
}
function markSeen(key) {
  try { localStorage.setItem(STORE[key], "1"); } catch { /* ignore */ }
}

/**
 * key: "platform" | "lesson"
 * autoStart: شرط تشغيل أول مرة (مثلًا الصف اتحمّل). بيشتغل مرة واحدة بس.
 */
export function useMadarGuide(key, { autoStart = false, delay = 1100 } = {}) {
  const [open, setOpen] = useState(false);
  const triedRef = useRef(false);
  useEffect(() => {
    if (!autoStart || triedRef.current) return undefined;
    if (wasSeen(key)) { triedRef.current = true; return undefined; }
    const t = setTimeout(() => { triedRef.current = true; setOpen(true); }, delay);
    return () => clearTimeout(t);
  }, [autoStart, key, delay]);
  const start = useCallback(() => setOpen(true), []);
  const close = useCallback(() => { markSeen(key); setOpen(false); }, [key]);
  return { open, start, close };
}

/* ------------------------------------------------------- شخصية المنصة */
// صورة الشخصية (public/photo/5554.png). بتظهر زي ما هي بنسبتها الأصلية من غير قص ولا إطار.
export const GUIDE_AVATAR_SRC = "/photo/5554.png";
export const GUIDE_NAME = "تونة";

/* ------------------------------------------------------------ copy: steps */
// target: selector أو مصفوفة selectors (أول واحد ظاهر هو اللي بيتظلّل). من غير target = كارت في النص.
// all: true → يظلّل كل العناصر المطابقة مع بعض.
// waitFor(ctx): الخطوة بتستنى الطالب يعمل حاجة (يختار صف مثلًا) وبعدين تكمّل لوحدها.
// when(ctx): الخطوة بتظهر بس لو الشرط صح.
export const PLATFORM_STEPS = [
  {
    id: "welcome", mood: "hi",
    title: `أهلًا بيك في مَدَار! أنا ${GUIDE_NAME}`,
    body: "همشي معاك خطوة خطوة لحد ما تفتح أول درس. مش هتاخد أكتر من دقيقتين، وتقدر تقفلني في أي وقت.",
    nextLabel: "يلا نبدأ",
  },
  {
    id: "grade", mood: "think", target: ".md-gp", when: (c) => c.picking,
    title: "الخطوة الأولى: اختار صفك",
    body: "دي كل الصفوف. اضغط على كارت صفك الدراسي وأنا مستنيك. لو لقيت أكتر من مرحلة، اختار المرحلة الأول وبعدها الصف. هنعرضلك دروس صفك بس، وتقدر تغيّره بعدين.",
    waitFor: (c) => !c.picking,
    waitHint: "اضغط على كارت صفك عشان نكمّل",
    skipLabel: "كمّل من غير ما أختار",
  },
  {
    id: "grade-ok", mood: "hi", target: [".md-hero2-meta", ".md-ctx-grade"], when: (c) => !c.picking && !!c.grade,
    title: "ده صفك",
    body: "اتأكد إن الصف مكتوب صح. لو مش صفك، اضغط «تغيير الصف» وهترجع تختار من جديد.",
    nextLabel: "تمام، ده صفي",
  },
  {
    id: "dyk", mood: "hi", target: '[data-guide="dyk"]', when: (c) => !c.picking,
    title: "هل تعلم؟ 💡",
    body: "هنا هتلاقي معلومة جديدة من منهجك كل ما تدخل ابقي بص عليها علشان احنا مش ضايفينها كدا وخلاص لا انا عايزين نثبتلك المعلومات دي في مخك 😉.",
  },
  {
    id: "progress", mood: "hi", target: ".md-dash-progress", when: (c) => !c.picking,
    title: "رحلتي في التعلّم",
    body: (c) => c.guest
      ? "هنا بتشوف خلّصت كام درس وإنت واقف عند أنهي درس دلوقتي. كل ما تخلّص درس الدايرة بتتملي. لو انت مش مسجل دخول تقدمك بيتحفظ على الجهاز ده بس."
      : "هنا بتشوف خلّصت كام درس وإنت واقف عند أنهي درس دلوقتي. كل ما تخلّص درس الدايرة بتتملي.",
  },
  {
    id: "term", mood: "think", target: ".md-ctx-terms", when: (c) => !c.picking,
    title: "اتأكد من الترم",
    body: (c) => `الصف بيتقسّم لترمين. الترم المنوّر هو اللي معروض دلوقتي${c.term ? `: «${c.term}»` : ""}. لو ده مش ترمك، اضغط على الترم التاني والوحدات اللي تحته هتتغيّر.`,
    nextLabel: "أيوه، ده ترمي ✓",
  },
  {
    id: "units", mood: "think", target: ".md-units-rail", when: (c) => !c.picking && !!c.term,
    title: "بعد الترم: الوحدة",
    body: "كل ترم فيه وحدات دوس على اي وحدة عشان تظهر دروسها.",
    waitFor: (c) => !!c.subject,
    waitHint: "اضغط على وحدة عشان نكمّل",
    skipLabel: "كمّل من غير ما أختار",
  },
  {
    id: "lessons", mood: "hi", target: ".md-lessons", when: (c) => !c.picking && !!c.subject,
    title: "الدروس بالترتيب",
    body: "ابدأ من الدرس الأول وامشي ورا بعض. العلامة اللي جنب اسم كل درس بتقولك حالته: مقفول لحد ما تخلّص اللي قبله، أو محتاج تسجيل دخول ، أو «قريبًا» لسه هنزلة. وتحت الاسم وصف صغير عن الدرس.",
  },
  {
    id: "menu", mood: "hi", target: ".md-org-trigger",
    title: "دروسي المحفوظة ☰",
    body: "دوس على الثلاث شرط دول (☰) وهتلاقي «دروسي المحفوظة»: كل درس حفظته بيظهر هنا وتفتحه مباشرة. وفي نفس القائمة تغيير الصف وتنقّل سريع بين الترمات والوحدات.",
  },
  {
    id: "done", mood: "cheer",
    title: "جاهز؟ افتح أول درس",
    body: "اضغط على كارت الدرس وأنا هقابلك جوّه وأوريك أدواته. ولو احتجتني تاني، دوس عليا براحة انا اللي تحت على الجنب. بالتوفيق يا وحش!",
    nextLabel: "تمام",
  },
];

// أزرار «حفظ / مشاركة» جوّه الدرس (من LessonActions): نلاقي الزرار بنصه، ولو مالقيناهوش نظلّل الشريط كله
const heroAction = (words) => () => {
  const root = document.querySelector(".md-jr-hero-actions");
  if (!root) return [];
  const hit = Array.from(root.querySelectorAll("button, a")).filter((b) => {
    const t = `${b.textContent || ""} ${b.getAttribute("aria-label") || ""} ${b.getAttribute("title") || ""}`;
    return words.some((w) => t.includes(w));
  });
  return hit.length ? hit : [root];
};
export const LESSON_STEPS = [
  {
    id: "welcome", mood: "cheer",
    title: "وصلنا جوّه الدرس! 🎉",
    body: "الدرس متقسّم لعناوين صغيرة، وفي كل عنوان شرح وأدوات تساعدك تفهم. هعدّي معاك على كل حاجة بسرعة.",
    nextLabel: "وريني",
  },
  {
    id: "hero", mood: "hi", target: ".md-jr-hero",
    title: "ده اسم الدرس",
    body: "فوق الاسم سطر صغير بيقولك إنت فين: المرحلة · الصف · الترم · الوحدة. وتحته وصف مختصر عن الدرس.",
  },
  {
    id: "save", mood: "cheer", targetFn: heroAction(["حفظ", "احفظ", "المحفوظ"]),
    title: "احفظ الدرس 🔖",
    body: "لو الدرس عجبك أو عايز ترجعله بسرعة، اضغط «حفظ». مش لازم تسجّل حساب، الدرس بيتحفظ على تليفونك أنت وبيتضاف لـ«دروسي المحفوظة».",
  },
  {
    id: "saved-list", mood: "think", target: ".md-lv-back",
    title: "فين دروسي المحفوظة؟",
    body: "بعد ما تحفظ، اضغط «العودة لقائمة الدروس» عشان ترجع للصفحة الرئيسية. هناك دوس على الثلاث شرط (☰) فوق، وادخل «دروسي المحفوظة» وهتلاقي كل دروسك.",
    nextLabel: "فهمت",
  },
  {
    id: "share", mood: "cheer", targetFn: heroAction(["شارك", "مشارك"]),
    title: "شارك الدرس مع صحابك 🤝",
    body: "اضغط «مشاركة» وابعت لينك الدرس لصحابك على واتساب أو أي تطبيق. ذاكروا سوا وكل واحد فيكم يفتح الدرس من اللينك.",
  },
  {
    id: "video", mood: "hi", target: ".md-jr-video",
    title: "فيديو الدرس 🎥",
    body: "الدرس ده ليه فيديو شرح عام. اضغط زرار التشغيل وشوفه قبل ما تبدأ العناوين، فتاخد فكرة كاملة عن الدرس. وتقدر تطويه وتعيد مشاهدته أي وقت.",
  },
  {
    id: "nav", mood: "hi", target: ".md-jr-nav",
    title: "عناوين الدرس وتقدّمك",
    body: "الدرس مقسوم لعناوين، وإنت بتخلّصهم واحد ورا التاني. هنا بتشوف كل العناوين جنب بعض، والعنوان اللي إنت فيه ملوّن بلون غامق. اسحب الشريط يمين وشمال تشوف الباقي، واضغط على أي عنوان تنتقل له. وتحتهم شريط تقدّمك.",
  },
  {
    id: "side", mood: "hi", target: ".md-jr-side",
    title: "قائمة العناوين",
    body: "كل عنوان ليه رقم، والعنوان اللي إنت فيه ملوّن بلون غامق ومكتوب عليه «أنت هنا». ✓ يعني خلّصته، 🔒 يعني لازم تخلّص اللي قبله، 🔐 يعني محتاج تسجّل دخول. تقدر ترجع لأي عنوان خلّصته.",
  },
  {
    id: "recall", mood: "think", target: ".md-jr-recall",
    title: "تذكّر سريع 🧠",
    body: "نقط من اللي فات. فكّر الأول في إجابتك، وبعدين اضغط على النقطة تتأكد.",
  },
  {
    id: "text", mood: "hi", target: ".md-jr-main .ts-richtext-content",
    title: "الشرح",
    body: "ده شرح العنوان و كل عنوان بيبقي ليه الشرح بتاعة.",
  },
  {
    id: "hotword", mood: "cheer", target: ".md-jr-main .ts-hotword-highlight",
    title: "الكلمات التفاعلية ✦",
    body: "الكلمة الملوّنة اللي جنبها نجمة دي كلمة تفاعلية. اضغط عليها (أو حط الماوس عليها) وهتطلعلك نافذة صغيرة بمعناها أو بصورة. جرّبها دلوقتي!",
    nextLabel: "جرّبتها",
  },
  {
    id: "mindmap", mood: "hi", target: '[aria-controls="md-jr-panel-mindmap"]',
    title: "الخريطة الذهنية 🧠",
    body: "بتلخّص العنوان في شكل شجرة: الفكرة الأساسية في النص، وتتفرّع منها التفاصيل. اضغط على الزرار تفتحها، واضغط على أي فرع تقرا شرحه.",
  },
  {
    id: "timeline", mood: "hi", target: '[aria-controls="md-jr-panel-timeline"]',
    title: "الخط الزمني 🕒",
    body: "بيرتّب الأحداث بالتاريخ، فتفهم إيه حصل قبل إيه وإيه جه بعده.",
  },
  {
    id: "quiz", mood: "think", target: "#md-jr-sec-quiz",
    title: "اختبر نفسك ❓",
    body: "جاوب على الأسئلة وهتعرف صح ولا غلط على طول. لازم تجاوب على سؤال واحد على الأقل عشان تكمّل للعنوان اللي بعده، ولو غلطت تقدر تعيد المحاولة.",
  },
  {
    id: "complete", mood: "hi", target: ".md-jr-bar .md-jr-btn--primary",
    title: "خلّصت العنوان؟",
    body: "اضغط «أكمل العنوان» والعنوان اللي بعده هيتفتح. «السابق» و«التالي» بيرجّعوك وبيقدّموك براحتك.",
  },
  {
    id: "done", mood: "cheer",
    title: "كده إنت جاهز 👏",
    body: "بعد آخر عنوان هتلاقي «المراجعة النهائية»: خريطة وخط زمني كاملين للدرس واختبار أخير. لو احتجتني تاني، دوس على الكورة الصغيرة اللي تحت على الجنب.",
    nextLabel: "ابدأ الدرس",
  },
];

/* ---------------------------------------------------------------- avatar */
// صورة الشخصية زي ما هي (من غير قص). لو الصورة مش موجودة بيظهر حرف «م» بدالها.
export function GuideAvatar({ size = 64 }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="mg-avatar" style={{ height: size, minWidth: broken ? size : undefined }} aria-hidden="true">
      {broken ? <b>م</b> : <img src={GUIDE_AVATAR_SRC} alt="" style={{ height: size }} onError={() => setBroken(true)} />}
    </span>
  );
}

/* --------------------------------------------------------------- help btn */
export function GuideHelpButton({ onClick, hidden = false }) {
  const [broken, setBroken] = useState(false);
  if (hidden || typeof document === "undefined") return null;
  return createPortal(
    <>
      <style>{GUIDE_CSS}</style>
      <button type="button" className="mg-ball" onClick={onClick} aria-label="افتح دليل المنصة" title="دليل المنصة">
        <span className="mg-ball-pic">
          {broken ? <span className="mg-ball-fb" aria-hidden="true">م</span> : <img src={GUIDE_AVATAR_SRC} alt="" onError={() => setBroken(true)} />}
          <span className="mg-ball-q" aria-hidden="true">؟</span>
        </span>
      </button>
    </>,
    document.body
  );
}

/* ---------------------------------------------------------------- helpers */
function visible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}
function findTargets(step) {
  if (!step) return [];
  if (step.targetFn) {
    let nodes = [];
    try { nodes = step.targetFn() || []; } catch { nodes = []; }
    nodes = nodes.filter(visible);
    if (nodes.length) return nodes;
  }
  if (!step.target) return [];
  const list = Array.isArray(step.target) ? step.target : [step.target];
  for (const sel of list) {
    let nodes = [];
    try { nodes = step.all ? Array.from(document.querySelectorAll(sel)) : [document.querySelector(sel)]; } catch { nodes = []; }
    nodes = nodes.filter(visible);
    if (nodes.length) return nodes;
  }
  return [];
}
function unionRect(nodes) {
  let t = Infinity, l = Infinity, b = -Infinity, r = -Infinity;
  for (const n of nodes) {
    const q = n.getBoundingClientRect();
    t = Math.min(t, q.top); l = Math.min(l, q.left); b = Math.max(b, q.bottom); r = Math.max(r, q.right);
  }
  return { top: t, left: l, width: r - l, height: b - t };
}
const reduceMotion = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ------------------------------------------------------------------ guide */
export default function MadarGuide({ open, steps, ctx = {}, onClose, topSafe = 76 }) {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState(null);       // مستطيل العنصر المظلَّل (أو null = كارت في النص)
  const [eligible, setEligible] = useState([]); // أرقام الخطوات اللي هتظهر فعلًا دلوقتي
  const [cardH, setCardH] = useState(220);
  const [vp, setVp] = useState({ w: 1024, h: 768 });
  const cardRef = useRef(null);
  const primaryRef = useRef(null);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const isEligible = useCallback((s) => {
    if (s.when && !s.when(ctxRef.current)) return false;
    if ((s.target || s.targetFn) && findTargets(s).length === 0) return false;
    return true;
  }, []);

  // ابدأ من الأول كل ما الدليل يتفتح
  useEffect(() => { if (open) { setIdx(0); setRect(null); } }, [open]);

  const step = steps[idx];

  // قياس العنصر + الشاشة (بيتكرر لأن الصفحة بتتحرك وبتتحمّل صور)
  const measure = useCallback(() => {
    if (!open) return;
    setVp((p) => (p.w === window.innerWidth && p.h === window.innerHeight ? p : { w: window.innerWidth, h: window.innerHeight }));
    const s = steps[idx];
    const nodes = s ? findTargets(s) : [];
    const next = nodes.length ? unionRect(nodes) : null;
    setRect((p) => {
      if (!next && !p) return p;
      if (next && p && Math.abs(next.top - p.top) < 0.5 && Math.abs(next.left - p.left) < 0.5 && Math.abs(next.width - p.width) < 0.5 && Math.abs(next.height - p.height) < 0.5) return p;
      return next;
    });
    if (cardRef.current) {
      const h = cardRef.current.offsetHeight;
      setCardH((p) => (Math.abs(p - h) < 1 ? p : h));
    }
    setEligible(steps.map((x, i) => (isEligible(x) ? i : -1)).filter((i) => i >= 0));
  }, [open, steps, idx, isEligible]);

  useLayoutEffect(() => { measure(); }, [measure, ctx.picking, ctx.term, ctx.subject, ctx.grade]);
  useEffect(() => {
    if (!open) return undefined;
    const on = () => requestAnimationFrame(measure);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    const iv = setInterval(measure, 350);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); clearInterval(iv); };
  }, [open, measure]);

  const isMobile = vp.w < 640;

  // لو الخطوة الحالية مبقتش مناسبة (مثلًا الطالب اختار الصف) → روح للّي بعدها
  const goNext = useCallback(() => {
    for (let j = idx + 1; j < steps.length; j += 1) {
      if (isEligible(steps[j])) { setIdx(j); return; }
    }
    onClose?.("done");
  }, [idx, steps, isEligible, onClose]);
  const goPrev = useCallback(() => {
    for (let j = idx - 1; j >= 0; j -= 1) {
      if (isEligible(steps[j])) { setIdx(j); return; }
    }
  }, [idx, steps, isEligible]);

  // لو أول خطوة ماتنفعش (when = false) نتخطّاها
  useEffect(() => {
    if (!open || !step) return;
    if (step.when && !step.when(ctx)) {
      // الشرط مبقاش صح: لو الخطوة كانت منتظرة الطالب، كمّل
      const t = setTimeout(goNext, 450);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, step, ctx, goNext]);

  // العنصر اختفى (مثلًا الطالب قفل الوحدة) → ماتفضلش واقف عليه
  const targetGone = !!(open && step && (step.target || step.targetFn) && rect === null && !(step.when && !step.when(ctx)));
  useEffect(() => {
    if (!targetGone) return undefined;
    const t = setTimeout(goNext, 1400);
    return () => clearTimeout(t);
  }, [targetGone, goNext]);

  // خطوة منتظرة الطالب: أول ما يعمل المطلوب كمّل لوحدك بعد لحظة
  const waiting = !!(step && step.waitFor && !step.waitFor(ctx));
  const satisfied = !!(step && step.waitFor && step.waitFor(ctx));
  useEffect(() => {
    if (!open || !satisfied) return undefined;
    const t = setTimeout(goNext, 800);
    return () => clearTimeout(t);
  }, [open, satisfied, goNext]);

  // مرّر الصفحة لحد ما العنصر يبان فوق الكارت
  useEffect(() => {
    if (!open || !step || !(step.target || step.targetFn)) return;
    const nodes = findTargets(step);
    if (!nodes.length) return;
    const r = unionRect(nodes);
    const vh = window.innerHeight;
    const bottomSafe = isMobile ? (cardRef.current?.offsetHeight || 240) + 24 : 28;
    const availTop = topSafe + 8;
    const availBottom = vh - bottomSafe;
    const fits = r.top >= availTop && r.top + r.height <= availBottom;
    if (fits) return;
    const desired = r.height > availBottom - availTop ? availTop : availTop + (availBottom - availTop - r.height) / 2;
    window.scrollBy({ top: r.top - desired, behavior: reduceMotion() ? "auto" : "smooth" });
  }, [open, idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ركّز على الزرار الرئيسي، واقفل بـ Esc
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => primaryRef.current?.focus({ preventScroll: true }), 60);
    return () => clearTimeout(t);
  }, [open, idx]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose?.("skip"); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !step || typeof document === "undefined") return null;
  if (step.when && !step.when(ctx)) return null; // الخطوة اتخطّت لوحدها
  if ((step.target || step.targetFn) && !rect) return null;          // استنى العنصر يظهر

  /* ---- مكان الكارت ---- */
  const pad = 8;
  const hole = rect ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 } : null;
  const cw = Math.min(360, vp.w - 24);
  let cardStyle;
  if (!hole) {
    cardStyle = isMobile ? { left: 12, right: 12, bottom: 12 } : { left: (vp.w - cw) / 2, top: Math.max(24, (vp.h - cardH) / 2), width: cw };
  } else if (isMobile) {
    cardStyle = { left: 12, right: 12, bottom: 12 };
  } else {
    const below = vp.h - (hole.top + hole.height);
    const above = hole.top;
    const rightSpace = vp.w - (hole.left + hole.width);
    const leftSpace = hole.left;
    const cx = clamp(hole.left + hole.width / 2 - cw / 2, 12, vp.w - cw - 12);
    if (below >= cardH + 24) cardStyle = { left: cx, top: hole.top + hole.height + 14, width: cw };
    else if (above >= cardH + 24) cardStyle = { left: cx, top: hole.top - cardH - 14, width: cw };
    else if (leftSpace >= cw + 28 || rightSpace >= cw + 28) {
      const placeLeft = leftSpace >= rightSpace;
      cardStyle = { left: placeLeft ? hole.left - cw - 14 : hole.left + hole.width + 14, top: clamp(hole.top, 12, vp.h - cardH - 12), width: cw };
    } else cardStyle = { left: vp.w - cw - 16, top: vp.h - cardH - 16, width: cw };
  }

  const total = Math.max(eligible.length, 1);
  const pos = Math.max(eligible.indexOf(idx), 0) + 1;
  const lastEligible = eligible.length > 0 && idx === eligible[eligible.length - 1];
  const firstEligible = eligible.length > 0 && idx === eligible[0];
  const bodyText = typeof step.body === "function" ? step.body(ctx) : step.body;
  const primaryLabel = lastEligible ? (step.nextLabel || "تمام") : (step.nextLabel || "التالي");

  return createPortal(
    <div className="mg-root" dir="rtl">
      <style>{GUIDE_CSS}</style>
      {hole ? (
        <div className="mg-hole" style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }} aria-hidden="true" />
      ) : (
        <div className="mg-dim" aria-hidden="true" />
      )}
      <div
        ref={cardRef}
        className="mg-card"
        style={cardStyle}
        role="dialog"
        aria-modal="false"
        aria-labelledby="mg-title"
        aria-describedby="mg-body"
        key={step.id}
      >
        <div className="mg-head">
          <GuideAvatar size={isMobile ? 64 : 80} />
          <div className="mg-headtext">
            <p className="mg-who">{GUIDE_NAME} · دليلك في مَدَار</p>
            <h2 id="mg-title" className="mg-title">{typeof step.title === "function" ? step.title(ctx) : step.title}</h2>
          </div>
          <button type="button" className="mg-x" onClick={() => onClose?.("skip")} aria-label="إغلاق الدليل">×</button>
        </div>

        <p id="mg-body" className="mg-body" aria-live="polite">{bodyText}</p>

        {waiting && <p className="mg-wait"><i className="mg-wait-dot" aria-hidden="true" />{step.waitHint || "جرّب الخطوة وأنا مستنيك"}</p>}

        <div className="mg-foot">
          <div className="mg-dots" aria-label={`الخطوة ${pos} من ${total}`}>
            {Array.from({ length: total }).map((_, i) => (
              <i key={i} className={i + 1 === pos ? "is-on" : i + 1 < pos ? "is-past" : ""} />
            ))}
          </div>
          <div className="mg-actions">
            {!firstEligible && (
              <button type="button" className="mg-btn mg-btn--ghost" onClick={goPrev}>السابق</button>
            )}
            {waiting ? (
              <button type="button" className="mg-btn mg-btn--ghost" ref={primaryRef} onClick={goNext}>{step.skipLabel || "تخطّي"}</button>
            ) : (
              <button type="button" className="mg-btn mg-btn--primary" ref={primaryRef} onClick={() => (lastEligible ? onClose?.("done") : goNext())}>{primaryLabel}</button>
            )}
          </div>
        </div>
        {!lastEligible && <button type="button" className="mg-skip" onClick={() => onClose?.("skip")}>تخطّي الدليل</button>}
      </div>
    </div>,
    document.body
  );
}

/* -------------------------------------------------------------------- css */
const GUIDE_CSS = `
.mg-root { --mg-teal: var(--duo-green, #147A6A); --mg-deep: var(--duo-green-ink, #0E5348); --mg-ink: var(--duo-ink, #263B35); --mg-muted: var(--duo-muted, #697A73); --mg-line: var(--duo-line, #DED4BD); --mg-soft: var(--duo-green-s, #E0F1EC); --mg-card: var(--md-surface, #FFFFFF);
  font-family: var(--duo-font-body, "Segoe UI", "Cairo", system-ui, sans-serif); }
.mg-dim { position: fixed; inset: 0; z-index: 95; background: rgba(20, 40, 35, 0.58); }
.mg-hole { position: fixed; z-index: 95; pointer-events: none; border-radius: 18px;
  box-shadow: 0 0 0 3px var(--mg-teal), 0 0 0 9999px rgba(20, 40, 35, 0.58);
  transition: top .28s ease, left .28s ease, width .28s ease, height .28s ease; }
.mg-card { position: fixed; z-index: 96; box-sizing: border-box; max-width: calc(100vw - 24px); background: var(--mg-card); color: var(--mg-ink);
  border: 2px solid var(--mg-line); border-radius: 24px; padding: 14px 16px 12px; box-shadow: 0 22px 60px -22px rgba(14, 83, 72, .55);
  animation: mg-in .22s ease both; text-align: right; }
.mg-head { display: flex; align-items: center; gap: 10px; }
.mg-toto { flex: none; }
.mg-headtext { flex: 1; min-width: 0; }
.mg-who { margin: 0 0 2px; font-size: .72rem; font-weight: 700; color: var(--mg-muted); }
.mg-title { margin: 0; font-family: var(--duo-font-display, inherit); font-size: 1.08rem; font-weight: 900; line-height: 1.35; color: var(--mg-deep); }
.mg-x { flex: none; align-self: flex-start; width: 32px; height: 32px; border-radius: 10px; border: 0; background: transparent; color: var(--mg-muted); font-size: 1.5rem; line-height: 1; cursor: pointer; }
.mg-x:hover { background: var(--mg-soft); color: var(--mg-deep); }
.mg-body { margin: 10px 0 0; font-size: .95rem; line-height: 1.85; color: var(--duo-ink-soft, #3F4E49); max-width: 62ch; }
.mg-wait { display: flex; align-items: center; gap: 8px; margin: 10px 0 0; padding: 8px 12px; border-radius: 14px; background: var(--mg-soft); color: var(--mg-deep); font-size: .85rem; font-weight: 800; }
.mg-wait-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--mg-teal); flex: none; animation: mg-pulse 1.3s ease-in-out infinite; }
.mg-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.mg-dots { display: flex; gap: 5px; align-items: center; }
.mg-dots i { width: 7px; height: 7px; border-radius: 999px; background: var(--mg-line); transition: width .2s ease, background-color .2s ease; }
.mg-dots i.is-past { background: var(--duo-green-s, #A9D6CB); }
.mg-dots i.is-on { width: 20px; background: var(--mg-teal); }
.mg-actions { display: flex; gap: 8px; margin-inline-start: auto; }
.mg-btn { min-height: 40px; padding: 8px 18px; border-radius: 14px; font-family: inherit; font-size: .92rem; font-weight: 800; cursor: pointer; border: 2px solid transparent; }
.mg-btn--primary { background: var(--mg-teal); color: #fff; box-shadow: 0 10px 22px -14px rgba(20, 122, 106, .8); }
.mg-btn--primary:hover { filter: brightness(1.07); }
.mg-btn--ghost { background: transparent; color: var(--mg-deep); border-color: var(--mg-line); }
.mg-btn--ghost:hover { background: var(--mg-soft); }
.mg-skip { display: block; margin: 8px auto 0; padding: 4px 8px; border: 0; background: transparent; color: var(--mg-muted); font-family: inherit; font-size: .78rem; font-weight: 700; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.mg-skip:hover { color: var(--mg-deep); }
.mg-btn:focus-visible, .mg-x:focus-visible, .mg-skip:focus-visible { outline: 3px solid var(--mg-teal); outline-offset: 2px; }

.mg-avatar { flex: none; display: inline-flex; align-items: center; justify-content: center; }
.mg-avatar img { width: auto; max-width: 110px; object-fit: contain; display: block; }
.mg-avatar b { font-size: 1.4rem; color: var(--mg-deep); font-weight: 900; }
.mg-ball { position: fixed; left: 16px; bottom: 16px; z-index: 85; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 0; border: 0; background: transparent; cursor: pointer; font-family: inherit; text-align: right; transition: transform .15s ease; }
.mg-ball:hover { transform: translateY(-2px); }
.mg-ball:focus-visible { outline: 3px solid var(--duo-green, #147A6A); outline-offset: 4px; border-radius: 14px; }
.mg-ball-pic { position: relative; display: block; height: 68px; min-width: 52px; margin-inline-start: 6px; filter: drop-shadow(0 8px 10px rgba(14, 83, 72, .35)); }
.mg-ball-pic img { height: 100%; width: auto; max-width: 90px; object-fit: contain; display: block; }
.mg-ball-fb { display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 50%; background: var(--duo-green-s, #E0F1EC); border: 3px solid var(--duo-green, #147A6A); font-weight: 900; font-size: 1.3rem; color: var(--duo-green-ink, #0E5348); }
.mg-ball-q { position: absolute; top: -2px; right: -4px; width: 22px; height: 22px; border-radius: 50%; background: var(--duo-green, #147A6A); color: #fff; border: 2px solid #fff; font-size: .8rem; font-weight: 900; display: flex; align-items: center; justify-content: center; line-height: 1; }

@keyframes mg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes mg-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: .45; } }
@media (max-width: 639px) {
  .mg-body { font-size: .9rem; line-height: 1.75; }
  .mg-ball { left: 12px; bottom: 76px; }
  .mg-ball-pic { height: 58px; }
  }
@media (prefers-reduced-motion: reduce) {
  .mg-card { animation: none; }
  .mg-hole { transition: none; }
  .mg-wait-dot { animation: none; }
}
`;