import { useCallback, useEffect, useRef, useState } from "react";
import { uid } from "../lib/constants";

// ألوان بسيطة للقلم/الـHighlighter — لا نحتاج نظام ألوان معقد
const PEN_COLORS = ["#E53E3E", "#3B82F6", "#22C55E", "#FFFFFF", "#F6D34D"];

// طبقات وضع التصوير — مصدر واحد لكل z-index الخاص بهذا الملف.
//  stage       : محتوى الدرس (Viewer) + طبقة الرسم؛ يُعزل بـ isolation فلا يتجاوز أي z-index داخل المحتوى حدوده
//  annotations : طبقة الرسم/Laser/Spotlight فوق المحتوى مباشرة (داخل الـstage)
//  tools       : Toolbar + زر الخروج، دائمًا فوق الـstage بالكامل
//  menu        : قائمة الإعدادات المفتوحة من الـToolbar
const Z = { stage: 0, board: 5, annotations: 10, tools: 50, menu: 60 };
// ترتيب داخلي داخل طبقة الرسم نفسها
const ZL = { spotlight: 1, draw: 2, effects: 3 };

// ---- أدوات التصوير (الترتيب هنا = ترتيب الأزرار في الـToolbar، عمودان) ----
const TOOLS = [
  { id: "interaction", digit: "1", icon: "🖱️", label: "تفاعل" },
  { id: "laser", digit: "2", icon: "🔴", label: "Laser" },
  { id: "pen", digit: "3", icon: "✏️", label: "قلم" },
  { id: "temp", digit: "6", icon: "💨", label: "قلم مؤقت (يختفي بعد ثوانٍ)" },
  { id: "highlighter", digit: "4", icon: "🟡", label: "Highlighter" },
  { id: "spotlight", digit: "5", icon: "⭕", label: "تحديد / Spotlight" },
  { id: "arrow", digit: "7", icon: "↗️", label: "سهم" },
  { id: "rect", digit: "8", icon: "⬜", label: "مستطيل" },
  { id: "ellipse", digit: "9", icon: "◯", label: "دائرة / بيضاوي" },
  { id: "eraser", digit: "0", icon: "🧽", label: "ممحاة" },
];
const TOOL_BY_DIGIT = Object.fromEntries(TOOLS.map((t) => [t.digit, t.id]));
// الأدوات التي تلتقط الماوس فوق المحتوى (باقي الأدوات: تفاعل/Laser تترك الماوس للمحتوى)
const CAPTURE_TOOLS = ["pen", "highlighter", "spotlight", "temp", "arrow", "rect", "ellipse", "eraser"];
// الأدوات التي تستخدم لوحة ألوان/حجم القلم
const PEN_STYLE_TOOLS = ["pen", "temp", "arrow", "rect", "ellipse"];

const TEMP_TTL = 3000; // مدة بقاء خط القلم المؤقت (ms)
const TEMP_FADE = 700; // مدة التلاشي الأخيرة (ms)
const ERASE_R = 14; // نصف قطر الممحاة (px)

// ---- إطار التصوير: نسب وأحجام (الضلع الأقصر بالـCSS px، تطابق أحجام يوتيوب 720p/900/1080p) ----
const RATIOS = { none: null, "16:9": 16 / 9, "9:16": 9 / 16, "4:3": 4 / 3, "1:1": 1 };
const RATIO_LABELS = { none: "بدون إطار", "16:9": "16:9 يوتيوب", "9:16": "9:16 Shorts", "4:3": "4:3", "1:1": "1:1" };
const SIZES = [720, 900, 1080];
// مساحة الأدوات خارج الإطار (px). left = عرض الـToolbar + هامش.
const GUTTER = { left: 124, right: 16, top: 56, bottom: 16 };

const PREFS_KEY = "madar_capture_prefs_v1";
const DEFAULT_PREFS = { ratio: "none", size: "fit", outline: true, halo: false, ghost: false };

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") || {};
    return {
      ratio: Object.prototype.hasOwnProperty.call(RATIOS, p.ratio) ? p.ratio : DEFAULT_PREFS.ratio,
      size: p.size === "fit" || SIZES.includes(p.size) ? p.size : DEFAULT_PREFS.size,
      outline: p.outline !== false,
      halo: !!p.halo,
      ghost: !!p.ghost,
    };
  } catch (_) {
    return DEFAULT_PREFS;
  }
}

// مكان/حجم الإطار داخل منطقة العرض. null = بدون إطار (المحتوى يملأ المنطقة كما كان).
function computeBox(area, ratioKey, size) {
  const a = RATIOS[ratioKey];
  if (!a || !area.w || !area.h) return null;
  const availW = Math.max(area.w - GUTTER.left - GUTTER.right, 0);
  const availH = Math.max(area.h - GUTTER.top - GUTTER.bottom, 0);
  const even = (n) => Math.max(2, Math.floor(n / 2) * 2); // أبعاد زوجية (أفضل لبرامج الفيديو)
  const fitW = Math.min(availW, availH * a);
  let w = fitW;
  let h = fitW / a;
  let fixed = false;
  if (size !== "fit") {
    const pw = a >= 1 ? size * a : size;
    const ph = a >= 1 ? size : size / a;
    if (pw <= availW + 0.5 && ph <= availH + 0.5) {
      w = pw;
      h = ph;
      fixed = true;
    }
  }
  w = even(w);
  h = even(h);
  return {
    left: Math.round(GUTTER.left + (availW - w) / 2),
    top: Math.round(GUTTER.top + (availH - h) / 2),
    width: w,
    height: h,
    fixed,
  };
}

// ---- هندسة الرسومات (للتلوين وللممحاة) ----
function shapeFromDrag(type, d) {
  if (type === "arrow") return { type, x0: d.x0, y0: d.y0, x1: d.x, y1: d.y };
  if (type === "rect") return { type, x: Math.min(d.x0, d.x), y: Math.min(d.y0, d.y), w: Math.abs(d.x - d.x0), h: Math.abs(d.y - d.y0) };
  return { type, cx: (d.x0 + d.x) / 2, cy: (d.y0 + d.y) / 2, rx: Math.abs(d.x - d.x0) / 2, ry: Math.abs(d.y - d.y0) / 2 };
}
function rectPoints(x, y, w, h) {
  return [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }, { x, y }];
}
function strokePoints(s) {
  switch (s.type) {
    case "arrow": return [{ x: s.x0, y: s.y0 }, { x: s.x1, y: s.y1 }];
    case "rect": return rectPoints(s.x, s.y, s.w, s.h);
    case "spotlight": return rectPoints(s.rect.x, s.rect.y, s.rect.w, s.rect.h);
    case "ellipse": {
      const pts = [];
      for (let i = 0; i <= 36; i++) {
        const t = (i / 36) * Math.PI * 2;
        pts.push({ x: s.cx + s.rx * Math.cos(t), y: s.cy + s.ry * Math.sin(t) });
      }
      return pts;
    }
    default: return s.points || [];
  }
}
function distToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
function strokeHit(s, p, r) {
  const pts = strokePoints(s);
  const tol = r + (s.size || 6) / 2;
  if (pts.length === 1) return Math.hypot(p.x - pts[0].x, p.y - pts[0].y) <= tol;
  for (let i = 0; i < pts.length - 1; i++) if (distToSegment(p, pts[i], pts[i + 1]) <= tol) return true;
  return false;
}

function isTypingTarget(el) {
  if (!el || !el.tagName) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") return !["range", "checkbox", "radio", "button", "submit"].includes((el.type || "").toLowerCase());
  return false;
}

function formatClock(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// رسم عنصر واحد داخل الـsvg (قلم/Highlighter/مؤقت = polyline، وأشكال)
function StrokeView({ s, opacity }) {
  const op = opacity ?? (s.type === "highlighter" ? 0.35 : 0.95);
  const common = { fill: "none", stroke: s.color, strokeWidth: s.size, strokeLinecap: "round", strokeLinejoin: "round", opacity: op };
  if (s.type === "rect") return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={4} {...common} />;
  if (s.type === "ellipse") return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...common} />;
  if (s.type === "arrow") {
    const dx = s.x1 - s.x0;
    const dy = s.y1 - s.y0;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const hl = Math.min(len * 0.6, Math.max(12, s.size * 4)); // طول رأس السهم
    const hw = hl * 0.55;
    const bx = s.x1 - ux * hl;
    const by = s.y1 - uy * hl;
    return (
      <g opacity={op}>
        <line x1={s.x0} y1={s.y0} x2={bx} y2={by} stroke={s.color} strokeWidth={s.size} strokeLinecap="round" />
        <polygon points={`${s.x1},${s.y1} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`} fill={s.color} />
      </g>
    );
  }
  return <polyline points={s.points.map((p) => `${p.x},${p.y}`).join(" ")} {...common} />;
}

// زر صغير موحّد الشكل لشريط أدوات وضع التصوير
function ToolBtn({ active, title, onClick, children, disabled, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="flex items-center justify-center rounded-xl"
      style={{
        width: 34,
        height: 34,
        fontSize: 16,
        background: active ? "#10665A" : "rgba(255,255,255,0.08)",
        color: "#FAF6ED",
        transition: "background 0.15s ease",
        opacity: disabled ? 0.35 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// أزرار اختيار داخل قائمة الإعدادات
function Seg({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          type="button"
          key={String(o.value)}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className="rounded-lg px-2 py-1 text-[11px]"
          style={{
            background: value === o.value ? "#10665A" : "rgba(255,255,255,0.08)",
            color: "#FAF6ED",
            opacity: o.disabled ? 0.35 : 1,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Check({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2 text-[12px] cursor-pointer" style={{ color: "#FAF6ED" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

/**
 * PresentationTools
 * ------------------
 * كل منطق وواجهة "وضع التصوير / Presentation Mode":
 * Toolbar + Laser + قلم + قلم مؤقت + Highlighter + Spotlight + أسهم/أشكال + ممحاة
 * + سبورة + هالة المؤشر + مؤقت + إطار تصوير بنسب يوتيوب + Undo/Clear
 * + mouse/keyboard listeners الخاصة بهذه الأدوات فقط.
 * مؤشر الماوس الحقيقي (system cursor) لا يُخفى أبدًا في هذا الملف، فوق أي محتوى وبأي أداة.
 *
 * كل شيء هنا overlay مؤقت 100% في state محلي داخل هذا المكوّن — لا يمسّ
 * lesson/scene ولا Supabase، ولا يُحفظ أي annotation في أي مكان.
 * الاستثناء الوحيد: تفضيلات الإطار/الهالة/الشفافية تُحفظ في localStorage (مفتاح واحد) لراحة المستخدم.
 *
 * Props:
 *  - onExit(): تُستدعى للخروج الكامل من وضع التصوير (الأب هو من يقفل recording)
 *  - children: محتوى العرض الفعلي (StudentView) الذي يُعرض داخل نفس الـstage
 *
 * فكرة إطار التصوير: عند اختيار نسبة (مثلًا 16:9) يوضع محتوى الدرس داخل صندوق بمقاس ثابت،
 * وكل الأدوات (Toolbar/القائمة/زر الخروج) خارج الصندوق، فيمكن تصوير منطقة الصندوق فقط.
 */
export default function PresentationTools({ onExit, children }) {
  const [teachingTool, setTeachingTool] = useState("interaction");
  const [penColor, setPenColor] = useState("#E53E3E");
  const [penSize, setPenSize] = useState(4);
  const [hlColor, setHlColor] = useState("#F6D34D");
  const [hlSize, setHlSize] = useState(22);
  const [strokes, setStrokes] = useState([]); // {id, type, color?, size?, points? | shape geometry | rect, expiresAt?}
  const [currentStroke, setCurrentStroke] = useState(null);
  const [currentSpotlight, setCurrentSpotlight] = useState(null);
  const [currentShape, setCurrentShape] = useState(null); // {id,type,color,size,x0,y0,x,y}
  const [mousePos, setMousePos] = useState(null);
  const [laserPulse, setLaserPulse] = useState(null);
  const [clickRipple, setClickRipple] = useState(null);
  const [toolbarMinimized, setToolbarMinimized] = useState(false);
  // إخفاء/إظهار الـToolbar وزر الخروج بالاختصار Ctrl+Shift+H — صامت تمامًا (لا Toast ولا أي عنصر بديل)
  const [toolsHidden, setToolsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [board, setBoard] = useState("none"); // none | white | black
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [, setTick] = useState(0); // لإعادة الرسم أثناء تلاشي القلم المؤقت
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [dpr, setDpr] = useState(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  // مستطيل طبقة الرسم = منطقة المحتوى المرئية للـscroller (بدون scrollbar)
  const [frameBox, setFrameBox] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const areaRef = useRef(null); // كل المساحة المتاحة لوضع التصوير
  const scrollRef = useRef(null); // العنصر الذي يحوي children ويتمرّر
  const frameRef = useRef(null); // طبقة الرسم: ثابتة على الشاشة ولا تتمرّر مع المحتوى
  const laserPulseTimerRef = useRef(null);
  const rippleTimerRef = useRef(null);
  const erasingRef = useRef(false);
  const toolRef = useRef(teachingTool);
  const menuOpenRef = useRef(menuOpen);
  toolRef.current = teachingTool;
  menuOpenRef.current = menuOpen;

  const box = computeBox(area, prefs.ratio, prefs.size);
  const setPref = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));

  const getStagePoint = (e) => {
    // إحداثيات نسبةً لطبقة الرسم الثابتة (وليس للـscroller) حتى تبقى صحيحة مهما كان تمرير المحتوى
    const el = frameRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: Math.min(Math.max(e.clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(e.clientY - rect.top, 0), rect.height),
    };
  };

  const resetAnnotations = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    setCurrentSpotlight(null);
    setCurrentShape(null);
    setMousePos(null);
    setLaserPulse(null);
    setClickRipple(null);
    erasingRef.current = false;
  }, []);

  // الخروج الكامل: يمسح كل الرسومات/الحالة المحلية ثم يخبر الأب بإغلاق وضع التصوير
  const exit = useCallback(() => {
    resetAnnotations();
    setTeachingTool("interaction");
    onExit && onExit();
  }, [onExit, resetAnnotations]);

  // اختصارات لوحة المفاتيح الخاصة بوضع التصوير فقط: 1-9/0 للأدوات، B للسبورة، Ctrl+Shift+H لإخفاء الأدوات، Esc.
  // مُسجَّلة طوال بقاء هذا المكوّن مركّبًا، وتُزال تلقائيًا عند فك التركيب (الخروج)
  useEffect(() => {
    const onKeyDown = (e) => {
      // Ctrl+Shift+H: إخفاء/إظهار الأدوات. e.code (وليس e.key) ليعمل مع أي تخطيط كيبورد (عربي/إنجليزي).
      // ملاحظة: Ctrl+Shift+T محجوز في المتصفحات (إعادة فتح تبويب) ولا يمكن اعتراضه.
      if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && e.code === "KeyH") {
        e.preventDefault();
        if (!e.repeat) setToolsHidden((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        // Esc بالترتيب: يغلق قائمة الإعدادات إن كانت مفتوحة ← ثم يلغي الأداة الحالية ← ثم يخرج من وضع التصوير.
        if (menuOpenRef.current) setMenuOpen(false);
        else if (toolRef.current !== "interaction") setTeachingTool("interaction");
        else exit();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      // e.code يعمل مع الكيبورد العربي (الذي قد يُنتج أرقامًا هندية في e.key)
      const m = /^(?:Digit|Numpad)([0-9])$/.exec(e.code || "");
      const digit = m ? m[1] : /^[0-9]$/.test(e.key) ? e.key : null;
      if (digit !== null) {
        if (TOOL_BY_DIGIT[digit]) setTeachingTool(TOOL_BY_DIGIT[digit]);
        return;
      }
      if (e.code === "KeyB" && !e.repeat) setBoard((b) => (b === "none" ? "white" : b === "white" ? "black" : "none"));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [exit]);

  // قياس منطقة المحتوى المرئية للـscroller (clientLeft يشمل الـscrollbar في RTL) ليغطي الرسم المحتوى فقط ولا يغطي الـscrollbar
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () =>
      setFrameBox((prev) => {
        const next = { left: el.clientLeft, top: el.clientTop, width: el.clientWidth, height: el.clientHeight };
        return prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.height === next.height
          ? prev
          : next;
      });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // قياس المساحة الكلية المتاحة (لحساب مقاس الإطار) + devicePixelRatio (لعرض المقاس الفعلي بالبكسل)
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const measure = () => {
      setArea((prev) => (prev.w === el.clientWidth && prev.h === el.clientHeight ? prev : { w: el.clientWidth, h: el.clientHeight }));
      setDpr(window.devicePixelRatio || 1);
    };
    measure();
    window.addEventListener("resize", measure);
    if (typeof ResizeObserver === "undefined") return () => window.removeEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // حفظ تفضيلات الإطار/الهالة/الشفافية (لا تُحفظ أي رسومات)
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (_) {}
  }, [prefs]);

  // المؤقت
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // القلم المؤقت: إزالة الخطوط المنتهية + إعادة الرسم أثناء التلاشي
  const hasTemp = strokes.some((s) => s.type === "temp");
  useEffect(() => {
    if (!hasTemp) return;
    const id = setInterval(() => {
      setStrokes((prev) => {
        const now = Date.now();
        const next = prev.filter((s) => s.type !== "temp" || s.expiresAt > now);
        return next.length === prev.length ? prev : next;
      });
      setTick((t) => t + 1);
    }, 100);
    return () => clearInterval(id);
  }, [hasTemp]);

  // تنظيف أي timers معلّقة عند فك التركيب، حتى لا يبقى أي listener/timer خاص بوضع التصوير
  useEffect(() => {
    return () => {
      if (laserPulseTimerRef.current) clearTimeout(laserPulseTimerRef.current);
      if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    };
  }, []);

  const eraseAt = (p) =>
    setStrokes((s) => {
      const next = s.filter((st) => !strokeHit(st, p, ERASE_R));
      return next.length === s.length ? s : next;
    });

  const handleStageMouseMove = (e) => {
    const p = getStagePoint(e);
    setMousePos(p);
    if (currentStroke) {
      setCurrentStroke((cs) => (cs ? { ...cs, points: [...cs.points, p] } : cs));
    } else if (currentSpotlight) {
      setCurrentSpotlight((cs) => (cs ? { ...cs, x: p.x, y: p.y } : cs));
    } else if (currentShape) {
      setCurrentShape((cs) => (cs ? { ...cs, x: p.x, y: p.y } : cs));
    } else if (erasingRef.current) {
      eraseAt(p);
    }
  };

  const handleStageMouseDown = (e) => {
    // أدوات الرسم تعمل فقط على طبقة الرسم؛ ضغطة على الـscrollbar لا تبدأ رسمًا
    if (overlayCapturesPointer && !frameRef.current?.contains(e.target)) return;
    const p = getStagePoint(e);
    if (teachingTool === "pen" || teachingTool === "highlighter" || teachingTool === "temp") {
      setCurrentStroke({
        id: uid("ann"),
        type: teachingTool,
        color: teachingTool === "highlighter" ? hlColor : penColor,
        size: teachingTool === "highlighter" ? hlSize : penSize,
        points: [p],
      });
    } else if (teachingTool === "arrow" || teachingTool === "rect" || teachingTool === "ellipse") {
      setCurrentShape({ id: uid("ann"), type: teachingTool, color: penColor, size: penSize, x0: p.x, y0: p.y, x: p.x, y: p.y });
    } else if (teachingTool === "eraser") {
      erasingRef.current = true;
      eraseAt(p);
    } else if (teachingTool === "spotlight") {
      setCurrentSpotlight({ x0: p.x, y0: p.y, x: p.x, y: p.y });
    } else if (teachingTool === "laser") {
      if (laserPulseTimerRef.current) clearTimeout(laserPulseTimerRef.current);
      setLaserPulse({ x: p.x, y: p.y, id: uid("pulse") });
      laserPulseTimerRef.current = setTimeout(() => setLaserPulse(null), 550);
    } else {
      // Interaction Mode: مجرد تأثير بصري بدون أي منع لوصول الضغط الحقيقي للعنصر تحت الماوس
      if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
      setClickRipple({ x: p.x, y: p.y, id: uid("ripple") });
      rippleTimerRef.current = setTimeout(() => setClickRipple(null), 450);
    }
  };

  const commitShape = (cs) => {
    const moved = Math.hypot(cs.x - cs.x0, cs.y - cs.y0);
    if (moved > 6) setStrokes((s) => [...s, { id: cs.id, color: cs.color, size: cs.size, ...shapeFromDrag(cs.type, cs) }]);
  };
  const commitStroke = (cs) =>
    setStrokes((s) => [...s, cs.type === "temp" ? { ...cs, expiresAt: Date.now() + TEMP_TTL } : cs]);

  const handleStageMouseUp = () => {
    erasingRef.current = false;
    if (currentStroke) {
      commitStroke(currentStroke);
      setCurrentStroke(null);
    } else if (currentShape) {
      commitShape(currentShape);
      setCurrentShape(null);
    } else if (currentSpotlight) {
      const x = Math.min(currentSpotlight.x0, currentSpotlight.x);
      const y = Math.min(currentSpotlight.y0, currentSpotlight.y);
      const w = Math.abs(currentSpotlight.x - currentSpotlight.x0);
      const h = Math.abs(currentSpotlight.y - currentSpotlight.y0);
      if (w > 4 && h > 4) {
        setStrokes((s) => [...s, { id: uid("ann"), type: "spotlight", rect: { x, y, w, h } }]);
      }
      setCurrentSpotlight(null);
    }
  };

  const handleStageMouseLeave = () => {
    setMousePos(null);
    erasingRef.current = false;
    if (currentStroke) {
      commitStroke(currentStroke);
      setCurrentStroke(null);
    }
    if (currentShape) commitShape(currentShape);
    setCurrentShape(null);
    if (currentSpotlight) setCurrentSpotlight(null);
  };

  // عندما تلتقط طبقة الرسم الماوس لا تصل عجلة الماوس للـscroller تلقائيًا، فنمرّرها له
  const forwardWheel = (e) => {
    const k = e.deltaMode === 1 ? 16 : 1;
    scrollRef.current?.scrollBy({ top: e.deltaY * k, left: e.deltaX * k });
  };

  const undoAnnotation = () => setStrokes((s) => s.slice(0, -1));
  const clearAnnotations = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setCurrentSpotlight(null);
    setCurrentShape(null);
  };

  const now = Date.now();
  const spotlightStrokes = strokes.filter((s) => s.type === "spotlight");
  const drawStrokes = strokes.filter((s) => s.type !== "spotlight");
  const overlayCapturesPointer = CAPTURE_TOOLS.includes(teachingTool);
  const showPenStyle = PEN_STYLE_TOOLS.includes(teachingTool);
  const showPalette = showPenStyle || teachingTool === "highlighter";
  const activeColor = teachingTool === "highlighter" ? hlColor : penColor;
  const activeSize = teachingTool === "highlighter" ? hlSize : penSize;
  const framed = !!box;

  const boxStyle = framed
    ? { left: box.left, top: box.top, width: box.width, height: box.height, overflow: "hidden", contain: "layout paint" }
    : { left: 0, top: 0, right: 0, bottom: 0 };

  const sizeOptions = [
    { value: "fit", label: "أقصى حجم" },
    ...SIZES.map((s) => ({ value: s, label: String(s), disabled: !computeBox(area, prefs.ratio, s)?.fixed })),
  ];

  return (
    <>
      {/* مؤشر النظام الحقيقي ظاهر وقابل للاستخدام فوق كل المحتوى في كل الأدوات (لا نُخفيه ولا نستبدله). */}
      <style>{`
        @keyframes ts-pulse-anim { from { transform: scale(0.4); opacity: 0.9; } to { transform: scale(1.6); opacity: 0; } }
        .pt-ghost { transition: opacity 0.2s ease; }
        .pt-ghost:not(:hover):not(:focus-within) { opacity: 0.3; }
      `}</style>

      {/* المساحة الكلية: تحوي الإطار (أو المحتوى كاملًا). أي z-index داخل محتوى الدرس يبقى داخلها ولا يصل للـToolbar. */}
      <div ref={areaRef} className="w-full h-full relative" style={{ zIndex: Z.stage, isolation: "isolate" }}>
        {framed && prefs.outline && (
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              boxShadow: "0 0 0 3px rgba(250,246,237,0.35)", // خارج الإطار تمامًا فلا يدخل في منطقة التصوير
            }}
          />
        )}

        {/* الصندوق: بدون إطار = يملأ المساحة كما كان. مع إطار = مقاس ثابت؛ contain يحبس أي عنصر fixed (popup/modal) داخل الصندوق. */}
        <div
          data-pt-box
          className="absolute"
          style={{ zIndex: 0, ...boxStyle }}
          onMouseMove={handleStageMouseMove}
          onMouseDown={handleStageMouseDown}
          onMouseUp={handleStageMouseUp}
          onMouseLeave={handleStageMouseLeave}
        >
          {/* المحتوى الفعلي (children): هو الوحيد الذي يتمرّر. isolation يحبس z-index عناصره تحت طبقة الرسم. */}
          <div ref={scrollRef} className="ts-fade w-full h-full overflow-y-auto relative" style={{ isolation: "isolate" }}>
            {children}
          </div>

          {/* سبورة: تغطي المحتوى (لا تحذفه) ويُرسم فوقها بنفس الأدوات */}
          {board !== "none" && (
            <div
              data-pt-board
              className="absolute"
              style={{ left: 0, top: 0, right: 0, bottom: 0, zIndex: Z.board, background: board === "white" ? "#FFFFFF" : "#111827" }}
            />
          )}

          {/* طبقة الرسم/المؤثرات: ثابتة على الشاشة (لا تتمرّر مع المحتوى) فتبقى الإحداثيات صحيحة فوق الخط الزمني والأسئلة في أسفل الصفحة.
              الطبقة نفسها pointer-events:none؛ فقط لوح الرسم (svg) يلتقط الماوس، وفقط عند تفعيل أداة رسم. */}
          <div
            ref={frameRef}
            data-pt-frame
            className="absolute overflow-hidden"
            style={{
              left: frameBox.left,
              top: frameBox.top,
              width: frameBox.width,
              height: frameBox.height,
              zIndex: Z.annotations,
              pointerEvents: "none",
            }}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              style={{
                zIndex: ZL.draw,
                pointerEvents: overlayCapturesPointer ? "auto" : "none",
                cursor: overlayCapturesPointer ? "crosshair" : undefined,
              }}
              onWheel={overlayCapturesPointer ? forwardWheel : undefined}
            >
              {drawStrokes.map((s) => (
                <StrokeView
                  key={s.id}
                  s={s}
                  opacity={s.type === "temp" ? Math.min(1, Math.max(0, (s.expiresAt - now) / TEMP_FADE)) * 0.95 : undefined}
                />
              ))}
              {currentStroke && <StrokeView s={currentStroke} />}
              {currentShape && <StrokeView s={{ color: currentShape.color, size: currentShape.size, ...shapeFromDrag(currentShape.type, currentShape) }} />}
            </svg>

            {/* Spotlight: إبراز منطقة عبر تعتيم خفيف لباقي الشاشة (أبسط تنفيذ ممكن) */}
            {spotlightStrokes.map((s) => (
              <div
                key={s.id}
                className="absolute pointer-events-none"
                style={{
                  zIndex: ZL.spotlight,
                  left: s.rect.x,
                  top: s.rect.y,
                  width: s.rect.w,
                  height: s.rect.h,
                  borderRadius: 10,
                  border: "2px solid #FBBF24",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                }}
              />
            ))}
            {currentSpotlight && (
              <div
                className="absolute pointer-events-none"
                style={{
                  zIndex: ZL.spotlight,
                  left: Math.min(currentSpotlight.x0, currentSpotlight.x),
                  top: Math.min(currentSpotlight.y0, currentSpotlight.y),
                  width: Math.abs(currentSpotlight.x - currentSpotlight.x0),
                  height: Math.abs(currentSpotlight.y - currentSpotlight.y0),
                  borderRadius: 10,
                  border: "2px dashed #FBBF24",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
                }}
              />
            )}

            {/* هالة حول المؤشر (اختيارية): مؤثر بصري فقط، مؤشر النظام يبقى ظاهرًا */}
            {prefs.halo && mousePos && (
              <div
                data-pt-halo
                className="absolute pointer-events-none"
                style={{
                  zIndex: ZL.effects,
                  left: mousePos.x - 22,
                  top: mousePos.y - 22,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(255,214,0,0.28)",
                  border: "2px solid rgba(255,214,0,0.65)",
                }}
              />
            )}

            {/* حلقة الممحاة */}
            {teachingTool === "eraser" && mousePos && (
              <div
                className="absolute pointer-events-none"
                style={{
                  zIndex: ZL.effects,
                  left: mousePos.x - ERASE_R,
                  top: mousePos.y - ERASE_R,
                  width: ERASE_R * 2,
                  height: ERASE_R * 2,
                  borderRadius: "50%",
                  border: "2px dashed #FAF6ED",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
                }}
              />
            )}

            {/* Laser Pointer (مؤثر بصري فقط — مؤشر النظام يبقى ظاهرًا تحته) */}
            {teachingTool === "laser" && mousePos && (
              <div
                className="absolute pointer-events-none"
                style={{
                  zIndex: ZL.effects,
                  left: mousePos.x - 7,
                  top: mousePos.y - 7,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #FF3B30 0%, #FF3B30 55%, rgba(255,59,48,0) 75%)",
                  boxShadow: "0 0 12px 4px rgba(255,59,48,0.55)",
                }}
              />
            )}
            {laserPulse && (
              <div
                className="absolute pointer-events-none"
                style={{
                  zIndex: ZL.effects,
                  left: laserPulse.x - 18,
                  top: laserPulse.y - 18,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "2px solid #FF3B30",
                  animation: "ts-pulse-anim 0.55s ease-out",
                }}
              />
            )}
            {clickRipple && (
              <div
                className="absolute pointer-events-none"
                style={{
                  zIndex: ZL.effects,
                  left: clickRipple.x - 16,
                  top: clickRipple.y - 16,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "2px solid #FAF6ED",
                  animation: "ts-pulse-anim 0.45s ease-out",
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* الأدوات: خارج الصندوق دائمًا مع الإطار، وفوق الـstage (Z.tools). عند الإخفاء بالاختصار لا يُرسم أي شيء بديل — لا Toast ولا Tooltip ولا Overlay. */}
      {!toolsHidden && (
        <>
          <button
            onClick={exit}
            className="fixed top-14 left-5 px-4 py-2 rounded-xl text-xs shadow-lg"
            style={{ background: "rgba(255,255,255,0.2)", color: "#FAF6ED", zIndex: Z.tools, pointerEvents: "auto" }}
          >
            خروج من التصوير (Esc)
          </button>

          {/* Toolbar عائمة — لا يوجد زر تشغيل/إيقاف؛ اختيار أي أداة يفعّلها فورًا */}
          <div
            data-pt-toolbar
            className={"fixed flex flex-col items-center gap-1.5 p-2 rounded-2xl shadow-lg" + (prefs.ghost ? " pt-ghost" : "")}
            style={{
              top: "50%",
              left: 16,
              transform: "translateY(-50%)",
              maxHeight: "calc(100vh - 200px)", // لا تخرج من الشاشة على الارتفاعات الصغيرة، ولا تلامس زر الخروج
              overflowY: "auto",
              background: "rgba(20,26,20,0.9)",
              backdropFilter: "blur(4px)",
              zIndex: Z.tools,
              pointerEvents: "auto",
            }}
          >
            <button
              type="button"
              onClick={() => setToolbarMinimized((v) => !v)}
              title={toolbarMinimized ? "إظهار الأدوات" : "إخفاء الأدوات"}
              className="text-[11px] mb-1"
              style={{ color: "#FAF6ED", opacity: 0.75 }}
            >
              {toolbarMinimized ? "⤢" : "⤡"}
            </button>
            {!toolbarMinimized && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 34px)", gap: 6 }}>
                  {TOOLS.map((t) => (
                    <ToolBtn key={t.id} active={teachingTool === t.id} title={`${t.label} (${t.digit})`} onClick={() => setTeachingTool(t.id)}>
                      {t.icon}
                    </ToolBtn>
                  ))}
                </div>

                {showPalette && (
                  <>
                    <div className="w-full h-px my-1" style={{ background: "rgba(255,255,255,0.15)" }} />
                    <div className="flex flex-col items-center gap-1 py-0.5" style={{ width: 74 }}>
                      <div className="flex flex-wrap justify-center gap-1">
                        {PEN_COLORS.map((c) => (
                          <button
                            type="button"
                            key={c}
                            title={c}
                            onClick={() => (teachingTool === "highlighter" ? setHlColor(c) : setPenColor(c))}
                            className="rounded-full"
                            style={{
                              width: 16,
                              height: 16,
                              background: c,
                              border: activeColor === c ? "2px solid #FAF6ED" : "1px solid rgba(255,255,255,0.4)",
                            }}
                          />
                        ))}
                      </div>
                      <input
                        type="range"
                        min={teachingTool === "highlighter" ? 10 : 2}
                        max={teachingTool === "highlighter" ? 40 : 12}
                        value={activeSize}
                        onChange={(e) => (teachingTool === "highlighter" ? setHlSize(+e.target.value) : setPenSize(+e.target.value))}
                        style={{ width: 60, marginTop: 4 }}
                        title="الحجم"
                      />
                    </div>
                  </>
                )}

                <div className="w-full h-px my-1" style={{ background: "rgba(255,255,255,0.15)" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 34px)", gap: 6 }}>
                  <ToolBtn title="تراجع" onClick={undoAnnotation}>↩️</ToolBtn>
                  <ToolBtn title="مسح الكل" onClick={clearAnnotations}>🗑️</ToolBtn>
                  <ToolBtn
                    active={board !== "none"}
                    title="سبورة (B): بيضاء ← سوداء ← إغلاق"
                    onClick={() => setBoard((b) => (b === "none" ? "white" : b === "white" ? "black" : "none"))}
                  >
                    {board === "black" ? "⬛" : "🗒️"}
                  </ToolBtn>
                  <ToolBtn active={prefs.halo} title="هالة حول المؤشر" onClick={() => setPref("halo", !prefs.halo)}>◎</ToolBtn>
                  <ToolBtn active={menuOpen} title="إعدادات الإطار والأدوات" onClick={() => setMenuOpen((v) => !v)}>⚙️</ToolBtn>
                  <ToolBtn active={timerRunning} title={timerRunning ? "إيقاف المؤقت مؤقتًا" : "بدء المؤقت"} onClick={() => setTimerRunning((v) => !v)}>⏱️</ToolBtn>
                </div>
                <div
                  data-pt-timer
                  className="text-[12px] font-mono"
                  style={{ color: timerRunning ? "#FAF6ED" : "rgba(250,246,237,0.6)", direction: "ltr" }}
                >
                  {formatClock(timerSec)}
                </div>
              </>
            )}
          </div>

          {menuOpen && (
            <div
              data-pt-menu
              className="fixed rounded-2xl p-3 shadow-lg flex flex-col gap-3"
              style={{
                top: 96,
                left: 128,
                width: 250,
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto",
                background: "rgba(20,26,20,0.96)",
                color: "#FAF6ED",
                zIndex: Z.menu,
                pointerEvents: "auto",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              <div>
                <p className="text-[11px] mb-1" style={{ opacity: 0.7 }}>إطار التصوير (المحتوى داخله والأدوات خارجه)</p>
                <Seg
                  value={prefs.ratio}
                  onChange={(v) => setPref("ratio", v)}
                  options={Object.keys(RATIOS).map((k) => ({ value: k, label: RATIO_LABELS[k] }))}
                />
              </div>
              {framed && (
                <div>
                  <p className="text-[11px] mb-1" style={{ opacity: 0.7 }}>الحجم (الضلع الأقصر بالبكسل)</p>
                  <Seg value={prefs.size} onChange={(v) => setPref("size", v)} options={sizeOptions} />
                  <p className="text-[11px] mt-1.5" style={{ opacity: 0.85, direction: "ltr", textAlign: "right" }} data-pt-size-label>
                    {box.width}×{box.height}
                    {dpr !== 1 ? ` (≈ ${Math.round(box.width * dpr)}×${Math.round(box.height * dpr)} فعليًا)` : ""}
                  </p>
                </div>
              )}
              {framed && <Check checked={prefs.outline} onChange={(v) => setPref("outline", v)}>إظهار حدود الإطار (خارجه)</Check>}
              <Check checked={prefs.halo} onChange={(v) => setPref("halo", v)}>هالة حول المؤشر</Check>
              <Check checked={prefs.ghost} onChange={(v) => setPref("ghost", v)}>الأدوات شفافة عند عدم الاستخدام</Check>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSec(0);
                }}
                className="rounded-lg px-2 py-1 text-[11px] self-start"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                تصفير المؤقت
              </button>
              <p className="text-[10px]" style={{ opacity: 0.6 }}>
                1-9 و 0 للأدوات · B سبورة · Ctrl+Shift+H إخفاء/إظهار الأدوات بصمت · Esc رجوع
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}