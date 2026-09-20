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
// مساحة الأدوات خارج الإطار (px). يجب أن تبقى كل عناصر التحكم (Toolbar / خروج / تسجيل)
// داخل هذه الهوامش هندسيًا حتى لا تدخل في Region Capture عند قص data-pt-box.
const GUTTER = { left: 124, right: 16, top: 96, bottom: 16 };

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

/* ════════════════════════════════════════════════════════════════════════
 * نظام تسجيل الفيديو (Recording Frame Recorder) — كل شيء داخل هذا الملف فقط.
 * لا مكتبات خارجية، لا ملفات إضافية، لا Backend/Supabase. Local Browser فقط.
 * ════════════════════════════════════════════════════════════════════════ */

// ---- إعدادات الجودة: أهداف "مطلوبة" (ideal) وليست مضمونة — القيم الفعلية تُقاس بعد بدء التسجيل ----
const REC_QUALITY_PRESETS = {
  economy: { key: "economy", label: "اقتصادية", width: 1280, height: 720, frameRate: 24, videoBitrate: 1_500_000, audioBitrate: 96_000 },
  high: { key: "high", label: "عالية", width: 1280, height: 720, frameRate: 30, videoBitrate: 3_000_000, audioBitrate: 128_000 },
  professional: { key: "professional", label: "احترافية", width: 1920, height: 1080, frameRate: 60, videoBitrate: 8_000_000, audioBitrate: 192_000 },
  ultra: { key: "ultra", label: "Ultra", width: 2560, height: 1440, frameRate: 60, videoBitrate: 16_000_000, audioBitrate: 256_000 },
  maximum: { key: "maximum", label: "Maximum", width: 3840, height: 2160, frameRate: 60, videoBitrate: 30_000_000, audioBitrate: 320_000 },
};
const REC_QUALITY_ORDER = ["economy", "high", "professional", "ultra", "maximum"];
const REC_DEFAULT_QUALITY = "professional";
const REC_MAX_SAFE_DPR = 2; // حد أقصى آمن لـdevicePixelRatio لتجنب RAM/GPU overload
const REC_CHUNK_TIMESLICE_MS = 3000; // كل كم يُطلب chunk جديد من MediaRecorder (autosave)

/**
 * أبعاد التسجيل المستهدفة حسب الجودة + نسبة إطار التصوير.
 * presets مخزّنة كـ landscape (عرض ≥ ارتفاع). عند نسبة رأسية/مربعة
 * نُعيد ترتيب الأبعاد بحيث يطابق الفيديو النهائي نسبة الإطار دون تشويه.
 * مثال professional:
 *   16:9 → 1920×1080 | 9:16 → 1080×1920 | 1:1 → 1080×1080 | 4:3 → 1440×1080
 * بدون إطار (ratioKey = "none"): نُبقي أبعاد الـpreset كما هي.
 */
function resolveRecordingDimensions(qualityKey, ratioKey) {
  const preset = REC_QUALITY_PRESETS[qualityKey] || REC_QUALITY_PRESETS[REC_DEFAULT_QUALITY];
  const shortSide = Math.min(preset.width, preset.height);
  const longSide = Math.max(preset.width, preset.height);
  const even = (n) => Math.max(2, Math.floor(n / 2) * 2);
  const a = RATIOS[ratioKey];
  if (!a) {
    return { width: even(preset.width), height: even(preset.height) };
  }
  let w;
  let h;
  if (a >= 1) {
    // أفقي أو مربع: الضلع الأقصر = الارتفاع
    h = shortSide;
    w = Math.round(h * a);
    if (w > longSide * 1.01 && a > 1) {
      // احتياط نادر: لا نتجاوز الضلع الأطول في الـpreset إلا لنسب أوسع قليلًا
      w = longSide;
      h = Math.round(w / a);
    }
  } else {
    // رأسي (مثل 9:16): الضلع الأقصر = العرض
    w = shortSide;
    h = Math.round(w / a);
  }
  return { width: even(w), height: even(h) };
}

// ---- اختيار أفضل codec متاح فعليًا (لا افتراض؛ فحص حقيقي عبر isTypeSupported) ----
const REC_MIME_CANDIDATES = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
function pickSupportedMimeType() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  for (const t of REC_MIME_CANDIDATES) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch (_) {}
  }
  return "";
}

// ---- فحص دعم المتصفح للـAPIs المطلوبة (بدون افتراض) ----
function getRecorderSupportInfo() {
  const hasMediaRecorder = typeof MediaRecorder !== "undefined";
  const hasDisplayMedia = !!(typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  const hasUserMedia = !!(typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const hasCropTarget = typeof window !== "undefined" && "CropTarget" in window && typeof window.CropTarget.fromElement === "function";
  const hasIndexedDB = typeof indexedDB !== "undefined";
  const mimeType = hasMediaRecorder ? pickSupportedMimeType() : "";
  return {
    hasMediaRecorder,
    hasDisplayMedia,
    hasUserMedia,
    hasCropTarget, // إن توفر: نقتصر على تصوير Recording Frame فقط دون بقية الصفحة/الشاشة
    hasIndexedDB,
    mimeType,
    canRecord: hasMediaRecorder && hasDisplayMedia && !!mimeType,
  };
}

// ---- رسائل عربية واضحة بدل أخطاء المتصفح الخام ----
function arabicRecorderError(err) {
  const name = (err && err.name) || "";
  const map = {
    NotAllowedError: "لم يتم السماح بالوصول إلى مصدر التسجيل أو الميكروفون.",
    NotFoundError: "تعذر العثور على جهاز الميكروفون أو مصدر التسجيل.",
    AbortError: "تم إلغاء عملية التسجيل قبل اكتمالها.",
    NotReadableError: "تعذر قراءة بيانات الميكروفون أو الشاشة (قد يكون الجهاز مستخدَمًا من تطبيق آخر).",
    SecurityError: "تم رفض الوصول لأسباب أمنية في المتصفح.",
    OverconstrainedError: "إعدادات الجودة المطلوبة غير مدعومة من الجهاز الحالي.",
    InvalidStateError: "حدثت مشكلة في حالة التسجيل الحالية. حاول مرة أخرى.",
  };
  return map[name] || "حدثت مشكلة أثناء التسجيل. حاول مرة أخرى.";
}

// ---- IndexedDB: تخزين تدريجي لـchunks + metadata، منفصلين لتفادي إعادة كتابة مصفوفة متضخمة ----
const REC_DB_NAME = "madar_recorder_db_v1";
const REC_DB_VERSION = 1;
const REC_STORE_META = "recordings_meta";
const REC_STORE_CHUNKS = "recordings_chunks";

function openRecordingDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("IndexedDB غير مدعوم")); return; }
    const req = indexedDB.open(REC_DB_NAME, REC_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(REC_STORE_META)) {
        db.createObjectStore(REC_STORE_META, { keyPath: "recordingId" });
      }
      if (!db.objectStoreNames.contains(REC_STORE_CHUNKS)) {
        const store = db.createObjectStore(REC_STORE_CHUNKS, { keyPath: "id", autoIncrement: true });
        store.createIndex("byRecording", "recordingId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function idbRun(db, storeName, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;
    try {
      result = fn(store);
    } catch (e) {
      reject(e);
      return;
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
async function createRecordingMeta(meta) {
  const db = await openRecordingDB();
  return idbRun(db, REC_STORE_META, "readwrite", (store) => store.put(meta));
}
async function updateRecordingMeta(recordingId, patch) {
  const db = await openRecordingDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(REC_STORE_META, "readwrite");
    const store = tx.objectStore(REC_STORE_META);
    const getReq = store.get(recordingId);
    getReq.onsuccess = () => {
      const current = getReq.result;
      if (!current) { resolve(null); return; }
      store.put({ ...current, ...patch, updatedAt: Date.now() });
    };
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
async function getRecordingMeta(recordingId) {
  const db = await openRecordingDB();
  return idbRun(db, REC_STORE_META, "readonly", (store) => store.get(recordingId));
}
async function findIncompleteRecording() {
  const db = await openRecordingDB();
  const all = await idbRun(db, REC_STORE_META, "readonly", (store) => store.getAll());
  const list = await new Promise((resolve) => {
    // getAll() على IDBObjectStore يعيد IDBRequest، وليس Promise؛ idbRun تُعيد النتيجة عبر tx.oncomplete
    resolve(all);
  });
  const arr = Array.isArray(list) ? list : [];
  return arr.find((m) => m && (m.status === "recording" || m.status === "paused" || m.status === "draft")) || null;
}
async function saveRecordingChunk(recordingId, seq, blob) {
  const db = await openRecordingDB();
  return idbRun(db, REC_STORE_CHUNKS, "readwrite", (store) => store.add({ recordingId, seq, blob }));
}
async function getRecordingChunks(recordingId) {
  const db = await openRecordingDB();
  const all = await idbRun(db, REC_STORE_CHUNKS, "readonly", (store) => store.getAll());
  const arr = Array.isArray(all) ? all : [];
  return arr.filter((c) => c.recordingId === recordingId).sort((a, b) => a.seq - b.seq);
}
async function rebuildRecordingBlob(recordingId, mimeType) {
  const chunks = await getRecordingChunks(recordingId);
  return new Blob(chunks.map((c) => c.blob), { type: mimeType || "video/webm" });
}
async function deleteRecordingFully(recordingId) {
  const db = await openRecordingDB();
  const chunks = await idbRun(db, REC_STORE_CHUNKS, "readonly", (store) => {
    const idx = store.index("byRecording");
    return idx.getAllKeys(recordingId);
  });
  await idbRun(db, REC_STORE_CHUNKS, "readwrite", (store) => {
    (chunks || []).forEach((key) => store.delete(key));
  });
  await idbRun(db, REC_STORE_META, "readwrite", (store) => store.delete(recordingId));
}
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function genRecordingId() {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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

  // ---- حالة نظام تسجيل الفيديو (Recording Frame فقط) ----
  const [recPanelOpen, setRecPanelOpen] = useState(false);
  const [recStatus, setRecStatus] = useState("IDLE"); // IDLE | READY | RECORDING | PAUSED | STOPPING | COMPLETED | RECOVERABLE_DRAFT | ERROR
  const [recQuality, setRecQuality] = useState(REC_DEFAULT_QUALITY);
  const [recWantMic, setRecWantMic] = useState(true);
  const [recWantSystemAudio, setRecWantSystemAudio] = useState(true);
  const [recElapsedSec, setRecElapsedSec] = useState(0);
  const [recError, setRecError] = useState("");
  const [recFallbackNotice, setRecFallbackNotice] = useState(""); // إشعار خفض جودة/عدم دعم قص الإطار
  const [recSupport] = useState(getRecorderSupportInfo);
  const [recActual, setRecActual] = useState(null); // { width, height, frameRate, sampleRate, mimeType }
  const [recPreview, setRecPreview] = useState(null); // { url, blob, duration, size, quality, width, height, fps, hasMic, hasSystemAudio }
  const [recDraft, setRecDraft] = useState(null); // metadata للتسجيل غير المكتمل المكتشف عند الفتح
  const [recCancelConfirm, setRecCancelConfirm] = useState(false);

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

  // ---- مراجع نظام التسجيل (لا نضع الـchunks أو الـstreams في React state) ----
  const recordFrameRef = useRef(null); // العنصر الذي يمثل "Recording Frame" فعليًا = data-pt-box (المحتوى + الرسومات، بدون أي أداة)
  const mediaRecorderRef = useRef(null);
  const displayStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const combinedStreamRef = useRef(null);
  const chunkListRef = useRef([]); // Blob parts في الذاكرة أثناء التسجيل الحالي فقط (ref، ليست state)
  const chunkSeqRef = useRef(0);
  const recordingIdRef = useRef(null);
  const persistQueueRef = useRef(Promise.resolve()); // طابور تسلسلي لحفظ الـchunks في IndexedDB
  const recStatusRef = useRef("IDLE");
  const recTimerBaseRef = useRef(0); // مجموع الثواني المتراكمة قبل آخر استئناف
  const recTimerStartRef = useRef(0); // وقت بدء/استئناف التسجيل الحالي (performance.now)
  const stopRequestedRef = useRef(false);
  const cancelRequestedRef = useRef(false);
  const currentQualityRef = useRef(null); // نسخة من إعدادات الجودة والصوت المستخدمة فعليًا في الجلسة الحالية
  const recPreviewUrlRef = useRef(null); // آخر object URL لمعاينة الفيديو (لتنظيفه بأمان عند unmount)
  // قص برمجي عبر Canvas عندما لا يتوفر CropTarget أو يفشل — يرسم منطقة recordFrameRef فقط
  const softCropRafRef = useRef(null);
  const softCropVideoRef = useRef(null);
  const softCropCanvasRef = useRef(null);
  recStatusRef.current = recStatus;

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

  /* ══════════════════════════════════════════════════════════════════════
   * نظام تسجيل الفيديو — المنطق الكامل. لا يمسّ أيًا من متغيرات/دوال الرسم أعلاه.
   * الهدف المسجَّل الوحيد هو data-pt-box (recordFrameRef) عبر Region/Element Capture
   * عند توفره، وإلا يُعرض تنبيه واضح بدل الادّعاء بأن القص تم.
   * ══════════════════════════════════════════════════════════════════════ */

  const stopSoftCropLoop = () => {
    if (softCropRafRef.current != null) {
      try { cancelAnimationFrame(softCropRafRef.current); } catch (_) {}
      softCropRafRef.current = null;
    }
    if (softCropVideoRef.current) {
      try {
        softCropVideoRef.current.pause();
        softCropVideoRef.current.srcObject = null;
      } catch (_) {}
      softCropVideoRef.current = null;
    }
    softCropCanvasRef.current = null;
  };

  const stopAllRecordingTracks = () => {
    stopSoftCropLoop();
    try { displayStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch (_) {}
    try { micStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch (_) {}
    try { combinedStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch (_) {}
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }
    displayStreamRef.current = null;
    micStreamRef.current = null;
    combinedStreamRef.current = null;
  };

  const cleanupRecordingResources = () => {
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
      } catch (_) {}
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.onerror = null;
      mediaRecorderRef.current = null;
    }
    stopAllRecordingTracks();
    chunkListRef.current = [];
  };

  const persistChunk = (recordingId, seq, blob) => {
    persistQueueRef.current = persistQueueRef.current
      .then(() => saveRecordingChunk(recordingId, seq, blob))
      .catch(() => {});
    return persistQueueRef.current;
  };

  const buildRecordingConstraints = (qualityKey, ratioKey) => {
    const preset = REC_QUALITY_PRESETS[qualityKey] || REC_QUALITY_PRESETS[REC_DEFAULT_QUALITY];
    const dims = resolveRecordingDimensions(qualityKey, ratioKey);
    const rawDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const safeDpr = Math.min(rawDpr, REC_MAX_SAFE_DPR);
    return { preset, dims, safeDpr, ratioKey: ratioKey || "none" };
  };

  const setRecStatusSafe = (s) => {
    recStatusRef.current = s;
    setRecStatus(s);
  };

  // بناء الـBlob النهائي من الأجزاء المحفوظة في الذاكرة (chunkListRef) بعد التأكد من اكتمال كل عمليات الحفظ في IndexedDB
  const finalizeRecording = async () => {
    try {
      await persistQueueRef.current; // لا نبني الـBlob النهائي قبل التأكد من حفظ آخر chunk (تفادي Race Condition)
      const mimeType = currentQualityRef.current?.mimeType || "video/webm";
      const parts = chunkListRef.current;
      if (cancelRequestedRef.current) return; // تم الإلغاء أثناء الانتظار؛ لا شيء لعمله هنا
      if (!parts.length) {
        setRecError("لم يتم تسجيل أي بيانات فيديو.");
        setRecStatusSafe("ERROR");
        stopAllRecordingTracks();
        return;
      }
      const blob = new Blob(parts, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const q = currentQualityRef.current || {};
      const durationSec = recTimerBaseRef.current;
      await updateRecordingMeta(recordingIdRef.current, { status: "completed", duration: durationSec, size: blob.size });
      setRecPreview({
        url,
        blob,
        duration: durationSec,
        size: blob.size,
        qualityLabel: REC_QUALITY_PRESETS[q.qualityKey]?.label || "",
        width: q.actualWidth,
        height: q.actualHeight,
        fps: q.actualFrameRate,
        sampleRate: q.actualSampleRate,
        hasMic: !!q.hasMic,
        hasSystemAudio: !!q.hasSystemAudio,
        cropped: !!q.cropped,
      });
      chunkListRef.current = [];
      stopAllRecordingTracks();
      setRecStatusSafe("COMPLETED");
      setRecPanelOpen(true); // إظهار المعاينة/التنزيل بعد انتهاء التسجيل (اللوحة خارج الإطار)
    } catch (_) {
      setRecError("حدثت مشكلة أثناء إنهاء التسجيل، لكن قد تكون البيانات محفوظة في المسودة.");
      setRecStatusSafe("ERROR");
      setRecPanelOpen(true);
    }
  };

  // توقف مصدر التسجيل من تلقاء نفسه (المستخدم أوقف مشاركة الشاشة/التبويب من واجهة المتصفح)
  const handleSourceEnded = () => {
    if (recStatusRef.current !== "RECORDING" && recStatusRef.current !== "PAUSED") return;
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
      }
    } catch (_) {}
    setRecStatusSafe("STOPPING");
    setRecFallbackNotice("تم إيقاف مصدر التسجيل. تم حفظ التسجيل الحالي.");
  };

  /**
   * قص برمجي: يقرأ بث الشاشة/التبويب ويرسم فقط مستطيل recordFrameRef على Canvas
   * ثم يُرجع MediaStream من الـCanvas — هذا يضمن أن الفيديو النهائي = إطار التصوير فقط
   * حتى لو فشل CropTarget (أو غير مدعوم)، بشرط أن يكون المصدر هو التبويب الحالي.
   */
  const startSoftCropStream = async (displayStream, frameEl, targetW, targetH, fps) => {
    const srcTrack = displayStream.getVideoTracks()[0];
    if (!srcTrack || !frameEl) throw new Error("soft-crop: missing track or element");

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = new MediaStream([srcTrack]);
    softCropVideoRef.current = video;

    await video.play();
    // انتظار أول إطار بأبعاد معروفة
    await new Promise((resolve) => {
      if (video.videoWidth > 0) {
        resolve();
        return;
      }
      const onMeta = () => {
        video.removeEventListener("loadeddata", onMeta);
        resolve();
      };
      video.addEventListener("loadeddata", onMeta);
      setTimeout(resolve, 1500);
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(2, targetW);
    canvas.height = Math.max(2, targetH);
    softCropCanvasRef.current = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });

    const draw = () => {
      if (!softCropVideoRef.current || !softCropCanvasRef.current) return;
      const el = recordFrameRef.current || frameEl;
      const rect = el.getBoundingClientRect();
      const vw = video.videoWidth || 1;
      const vh = video.videoHeight || 1;
      // عند مشاركة التبويب الحالي: إطار الفيديو ≈ نافذة المتصفح (viewport)
      const scaleX = vw / Math.max(1, window.innerWidth);
      const scaleY = vh / Math.max(1, window.innerHeight);
      const sx = Math.max(0, rect.left * scaleX);
      const sy = Math.max(0, rect.top * scaleY);
      const sw = Math.max(1, rect.width * scaleX);
      const sh = Math.max(1, rect.height * scaleY);
      try {
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      } catch (_) {}
      softCropRafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const outFps = Math.min(Math.max(1, fps || 30), 60);
    const canvasStream = canvas.captureStream(outFps);
    const outTrack = canvasStream.getVideoTracks()[0];
    return outTrack;
  };

  // بدء التسجيل: قص Recording Frame فقط (CropTarget أو Canvas) + ميكروفون + صوت النظام + MediaRecorder + IndexedDB
  const startRecording = async () => {
    setRecError("");
    setRecFallbackNotice("");
    if (!recSupport.hasMediaRecorder || !recSupport.mimeType || !recSupport.hasDisplayMedia) {
      setRecError("تسجيل الفيديو غير مدعوم في هذا المتصفح.");
      setRecStatusSafe("ERROR");
      return;
    }
    if (!recordFrameRef.current) {
      setRecError("تعذر العثور على إطار التصوير. أعد فتح وضع التصوير وحاول مرة أخرى.");
      setRecStatusSafe("ERROR");
      return;
    }
    // Snapshot لنسبة الإطار والجودة لحظة البدء — لا تتأثر بأي تغيير لاحق في الواجهة أثناء التسجيل
    const lockedRatio = prefs.ratio;
    const lockedQuality = recQuality;
    const { preset, dims, safeDpr, ratioKey } = buildRecordingConstraints(lockedQuality, lockedRatio);
    let displayStream;
    try {
      // preferCurrentTab يجب أن يكون على مستوى خيارات getDisplayMedia (وليس داخل video)
      // حتى يفضّل المتصفح «هذا التبويب» — CropTarget لا يعمل مع «الشاشة كاملة».
      const displayOpts = {
        video: {
          frameRate: { ideal: preset.frameRate },
          width: { ideal: Math.round(dims.width * safeDpr) },
          height: { ideal: Math.round(dims.height * safeDpr) },
        },
        audio: !!recWantSystemAudio,
        preferCurrentTab: true,
        selfBrowserSurface: "include",
        surfaceSwitching: "exclude",
        systemAudio: recWantSystemAudio ? "include" : "exclude",
      };
      displayStream = await navigator.mediaDevices.getDisplayMedia(displayOpts);
    } catch (e) {
      setRecError(arabicRecorderError(e));
      setRecStatusSafe("ERROR");
      return;
    }
    const rawVideoTrack = displayStream.getVideoTracks()[0];
    if (!rawVideoTrack) {
      setRecError("تعذر الحصول على مسار الفيديو من مصدر التسجيل.");
      try { displayStream.getTracks().forEach((t) => t.stop()); } catch (_) {}
      setRecStatusSafe("ERROR");
      return;
    }

    // رفض تسجيل الشاشة الكاملة صراحةً — القص الدقيق يحتاج تبويب المتصفح
    const surface = (rawVideoTrack.getSettings && rawVideoTrack.getSettings().displaySurface) || "";
    if (surface === "monitor") {
      try { displayStream.getTracks().forEach((t) => t.stop()); } catch (_) {}
      setRecError(
        'تم اختيار الشاشة كاملة. لإطار التصوير فقط اختر «هذا التبويب / This Tab» وليس الشاشة أو نافذة أخرى.'
      );
      setRecStatusSafe("ERROR");
      return;
    }

    let videoTrack = rawVideoTrack;
    let cropped = false;
    let cropMode = "none"; // "cropTarget" | "soft" | "none"

    // 1) Region Capture الرسمي على data-pt-box
    if (recSupport.hasCropTarget && recordFrameRef.current && typeof rawVideoTrack.cropTo === "function") {
      try {
        const cropTarget = await window.CropTarget.fromElement(recordFrameRef.current);
        await rawVideoTrack.cropTo(cropTarget);
        cropped = true;
        cropMode = "cropTarget";
        videoTrack = rawVideoTrack;
      } catch (_) {
        cropped = false;
      }
    }

    // 2) إن فشل CropTarget: قص برمجي عبر Canvas لمنطقة إطار التصوير فقط
    if (!cropped && recordFrameRef.current) {
      try {
        const softTrack = await startSoftCropStream(
          displayStream,
          recordFrameRef.current,
          dims.width,
          dims.height,
          preset.frameRate
        );
        videoTrack = softTrack;
        cropped = true;
        cropMode = "soft";
        setRecFallbackNotice(
          surface && surface !== "browser"
            ? "تم قص التسجيل برمجيًا على إطار التصوير. لنتائج أدق اختر «هذا التبويب / This Tab»."
            : "تم قصر التسجيل على إطار التصوير (قص برمجي)."
        );
      } catch (_) {
        cropped = false;
      }
    }

    // 3) لا نكمل أبدًا بتسجيل غير مقصوص (شاشة/تبويب كامل)
    if (!cropped) {
      try { displayStream.getTracks().forEach((t) => t.stop()); } catch (_) {}
      stopSoftCropLoop();
      setRecError(
        'تعذر قصر التسجيل على إطار التصوير. أعد المحاولة واختر «هذا التبويب / This Tab» فقط (وليس الشاشة كاملة).'
      );
      setRecStatusSafe("ERROR");
      return;
    }

    try {
      await videoTrack.applyConstraints({
        frameRate: { ideal: preset.frameRate },
        width: { ideal: dims.width },
        height: { ideal: dims.height },
      });
    } catch (_) {}

    rawVideoTrack.onended = () => handleSourceEnded();
    if (videoTrack !== rawVideoTrack) {
      try {
        videoTrack.onended = () => handleSourceEnded();
      } catch (_) {}
    }

    let micStream = null;
    if (recWantMic) {
      if (!recSupport.hasUserMedia) {
        setRecFallbackNotice((s) => s || "الميكروفون غير مدعوم في هذا المتصفح؛ سيتم التسجيل بدون صوت الميكروفون.");
      } else {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: { ideal: 48000 } },
          });
        } catch (e) {
          setRecFallbackNotice((s) => s || `${arabicRecorderError(e)} سيتم المتابعة بدون الميكروفون.`);
          micStream = null;
        }
      }
    }

    const systemAudioTrack = displayStream.getAudioTracks()[0] || null;
    const micAudioTrack = micStream ? micStream.getAudioTracks()[0] : null;
    let finalAudioTrack = null;
    if (micAudioTrack && systemAudioTrack) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioCtx.createMediaStreamDestination();
        audioCtx.createMediaStreamSource(new MediaStream([micAudioTrack])).connect(destination);
        audioCtx.createMediaStreamSource(new MediaStream([systemAudioTrack])).connect(destination);
        finalAudioTrack = destination.stream.getAudioTracks()[0];
        audioContextRef.current = audioCtx;
      } catch (_) {
        finalAudioTrack = micAudioTrack;
      }
    } else {
      finalAudioTrack = micAudioTrack || systemAudioTrack || null;
    }

    const combinedTracks = [videoTrack];
    if (finalAudioTrack) combinedTracks.push(finalAudioTrack);
    const combinedStream = new MediaStream(combinedTracks);

    displayStreamRef.current = displayStream;
    micStreamRef.current = micStream;
    combinedStreamRef.current = combinedStream;

    let recorder;
    try {
      recorder = new MediaRecorder(combinedStream, {
        mimeType: recSupport.mimeType,
        videoBitsPerSecond: preset.videoBitrate,
        audioBitsPerSecond: preset.audioBitrate,
      });
    } catch (e) {
      setRecError(arabicRecorderError(e));
      setRecStatusSafe("ERROR");
      stopAllRecordingTracks();
      return;
    }

    const recordingId = genRecordingId();
    recordingIdRef.current = recordingId;
    chunkSeqRef.current = 0;
    chunkListRef.current = [];
    stopRequestedRef.current = false;
    cancelRequestedRef.current = false;
    persistQueueRef.current = Promise.resolve();

    const vSettings = videoTrack.getSettings ? videoTrack.getSettings() : {};
    const aSettings = finalAudioTrack && finalAudioTrack.getSettings ? finalAudioTrack.getSettings() : {};
    currentQualityRef.current = {
      qualityKey: lockedQuality,
      ratioKey,
      targetWidth: dims.width,
      targetHeight: dims.height,
      mimeType: recSupport.mimeType,
      cropped,
      cropMode,
      hasMic: !!micAudioTrack,
      hasSystemAudio: !!systemAudioTrack,
      actualWidth: vSettings.width,
      actualHeight: vSettings.height,
      actualFrameRate: vSettings.frameRate,
      actualSampleRate: aSettings.sampleRate,
    };
    setRecActual({
      width: vSettings.width,
      height: vSettings.height,
      frameRate: vSettings.frameRate ? Math.round(vSettings.frameRate) : undefined,
      sampleRate: aSettings.sampleRate,
      mimeType: recSupport.mimeType,
      targetWidth: dims.width,
      targetHeight: dims.height,
      ratioKey,
    });

    try {
      await createRecordingMeta({
        recordingId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "recording",
        mimeType: recSupport.mimeType,
        quality: lockedQuality,
        ratio: ratioKey,
        targetWidth: dims.width,
        targetHeight: dims.height,
        width: vSettings.width,
        height: vSettings.height,
        fps: vSettings.frameRate,
        audioSettings: { hasMic: !!micAudioTrack, hasSystemAudio: !!systemAudioTrack, sampleRate: aSettings.sampleRate },
        duration: 0,
      });
    } catch (_) {}

    recorder.ondataavailable = (e) => {
      if (!e.data || e.data.size === 0) return;
      chunkListRef.current.push(e.data);
      const seq = chunkSeqRef.current++;
      persistChunk(recordingId, seq, e.data);
    };
    recorder.onerror = (e) => {
      setRecError(arabicRecorderError(e?.error));
      setRecStatusSafe("ERROR");
    };
    recorder.onstop = () => {
      finalizeRecording();
    };

    mediaRecorderRef.current = recorder;
    recTimerBaseRef.current = 0;
    recTimerStartRef.current = performance.now();
    setRecElapsedSec(0);
    // إغلاق اللوحة الكبيرة أثناء التسجيل حتى لا تغطي أي جزء من Recording Frame على الشاشة
    setRecPanelOpen(false);
    recorder.start(REC_CHUNK_TIMESLICE_MS);
    setRecStatusSafe("RECORDING");
  };

  const pauseRecording = () => {
    const r = mediaRecorderRef.current;
    if (!r || r.state !== "recording") return;
    try {
      r.requestData();
      r.pause();
      recTimerBaseRef.current += Math.floor((performance.now() - recTimerStartRef.current) / 1000);
      setRecStatusSafe("PAUSED");
      updateRecordingMeta(recordingIdRef.current, { status: "paused", duration: recTimerBaseRef.current });
    } catch (_) {}
  };

  const resumeRecording = () => {
    const r = mediaRecorderRef.current;
    if (!r || r.state !== "paused") return;
    try {
      r.resume();
      recTimerStartRef.current = performance.now();
      setRecStatusSafe("RECORDING");
      updateRecordingMeta(recordingIdRef.current, { status: "recording" });
    } catch (_) {}
  };

  const stopRecording = () => {
    const r = mediaRecorderRef.current;
    if (!r || r.state === "inactive") return;
    stopRequestedRef.current = true;
    if (r.state === "recording") {
      recTimerBaseRef.current += Math.floor((performance.now() - recTimerStartRef.current) / 1000);
    }
    setRecStatusSafe("STOPPING");
    try {
      r.requestData();
      r.stop();
    } catch (_) {
      finalizeRecording();
    }
  };

  const requestCancelRecording = () => {
    if (recStatus === "RECORDING" || recStatus === "PAUSED") setRecCancelConfirm(true);
    else setRecPanelOpen(false);
  };

  const confirmCancel = async () => {
    cancelRequestedRef.current = true;
    const id = recordingIdRef.current;
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
    } catch (_) {}
    cleanupRecordingResources();
    if (id) {
      try { await deleteRecordingFully(id); } catch (_) {}
    }
    recordingIdRef.current = null;
    setRecCancelConfirm(false);
    setRecElapsedSec(0);
    setRecFallbackNotice("");
    setRecError("");
    setRecStatusSafe("IDLE");
  };

  const dismissCancel = () => setRecCancelConfirm(false);

  const recordAgain = () => {
    if (recPreview?.url) {
      try { URL.revokeObjectURL(recPreview.url); } catch (_) {}
    }
    setRecPreview(null);
    setRecFallbackNotice("");
    setRecError("");
    setRecStatusSafe("IDLE");
  };

  const checkForDraft = async () => {
    if (!recSupport.hasIndexedDB) return;
    try {
      const found = await findIncompleteRecording();
      if (found) {
        setRecDraft(found);
        setRecStatusSafe("RECOVERABLE_DRAFT");
        setRecPanelOpen(true);
      }
    } catch (_) {}
  };

  const restoreDraft = async () => {
    if (!recDraft) return;
    try {
      const blob = await rebuildRecordingBlob(recDraft.recordingId, recDraft.mimeType);
      if (!blob || blob.size === 0) {
        setRecError("تعذر استعادة التسجيل؛ لا توجد بيانات كافية.");
        setRecDraft(null);
        setRecStatusSafe("ERROR");
        return;
      }
      const url = URL.createObjectURL(blob);
      setRecPreview({
        url,
        blob,
        duration: recDraft.duration || 0,
        size: blob.size,
        qualityLabel: REC_QUALITY_PRESETS[recDraft.quality]?.label || "",
        width: recDraft.width,
        height: recDraft.height,
        fps: recDraft.fps,
        sampleRate: recDraft.audioSettings?.sampleRate,
        hasMic: !!recDraft.audioSettings?.hasMic,
        hasSystemAudio: !!recDraft.audioSettings?.hasSystemAudio,
        restored: true,
      });
      await updateRecordingMeta(recDraft.recordingId, { status: "completed" });
      setRecDraft(null);
      setRecStatusSafe("COMPLETED");
    } catch (_) {
      setRecError("تعذر استعادة التسجيل السابق.");
      setRecStatusSafe("ERROR");
    }
  };

  const discardDraft = async () => {
    if (!recDraft) return;
    try { await deleteRecordingFully(recDraft.recordingId); } catch (_) {}
    setRecDraft(null);
    setRecStatusSafe("IDLE");
  };

  const dismissRecError = () => {
    setRecError("");
    if (recStatus === "ERROR") setRecStatusSafe(chunkListRef.current.length || recPreview ? "COMPLETED" : "IDLE");
  };

  // فحص وجود تسجيل غير مكتمل من جلسة سابقة (refresh/crash) عند فتح أداة التصوير
  useEffect(() => {
    checkForDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // عداد وقت التسجيل: يتوقف أثناء PAUSE ويستكمل من نفس الرقم عند RESUME
  useEffect(() => {
    if (recStatus !== "RECORDING") return;
    const id = setInterval(() => {
      setRecElapsedSec(recTimerBaseRef.current + Math.floor((performance.now() - recTimerStartRef.current) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [recStatus]);

  // حفظ آخر بيانات ممكنة قبل إغلاق/تحديث الصفحة — إجراء احتياطي إضافي فقط؛ الحفظ الأساسي يتم أثناء التسجيل نفسه (timeslice)
  useEffect(() => {
    const flushBeforeUnload = () => {
      const r = mediaRecorderRef.current;
      if (r && r.state === "recording") {
        try { r.requestData(); } catch (_) {}
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushBeforeUnload();
    };
    window.addEventListener("beforeunload", flushBeforeUnload);
    window.addEventListener("pagehide", flushBeforeUnload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", flushBeforeUnload);
      window.removeEventListener("pagehide", flushBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // تتبّع آخر object URL لمعاينة الفيديو حتى يمكن تنظيفه بأمان عند فك التركيب
  useEffect(() => {
    recPreviewUrlRef.current = recPreview?.url || null;
  }, [recPreview]);

  // تنظيف كامل عند فك تركيب المكوّن: إيقاف التسجيل، كل الـtracks، وrevoke أي object URL متبقٍّ
  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
      } catch (_) {}
      stopAllRecordingTracks();
      if (recPreviewUrlRef.current) {
        try { URL.revokeObjectURL(recPreviewUrlRef.current); } catch (_) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = Date.now();
  const spotlightStrokes = strokes.filter((s) => s.type === "spotlight");
  const drawStrokes = strokes.filter((s) => s.type !== "spotlight");
  const overlayCapturesPointer = CAPTURE_TOOLS.includes(teachingTool);
  const showPenStyle = PEN_STYLE_TOOLS.includes(teachingTool);
  const showPalette = showPenStyle || teachingTool === "highlighter";
  const activeColor = teachingTool === "highlighter" ? hlColor : penColor;
  const activeSize = teachingTool === "highlighter" ? hlSize : penSize;
  const framed = !!box;
  // أثناء التسجيل/الإيقاف المؤقت: لا نسمح بتغيير نسبة الإطار (مثبّتة snapshot عند البدء)
  const isRecActive = recStatus === "RECORDING" || recStatus === "PAUSED" || recStatus === "STOPPING";
  // أبعاد التسجيل المستهدفة المعروضة في لوحة الجودة (حسب الجودة + نسبة الإطار الحالية)
  const recTargetDims = resolveRecordingDimensions(recQuality, prefs.ratio);

  // موضع لوحة التسجيل (تُعرض فقط خارج أوقات RECORDING/PAUSED): خارج مستطيل الإطار إن وُجد
  const recPanelStyle = (() => {
    const base = {
      width: 300,
      maxHeight: "calc(100vh - 90px)",
      overflowY: "auto",
      background: "rgba(20,26,20,0.97)",
      color: "#FAF6ED",
      zIndex: Z.menu,
      pointerEvents: "auto",
      direction: "rtl",
      textAlign: "right",
    };
    // بدون إطار: بجانب أزرار التحكم العلوية اليسرى (خارج منطقة المحتوى قدر الإمكان)
    if (!framed || !box || !area.w) {
      return { ...base, top: 12, left: GUTTER.left + 8, right: "auto" };
    }
    const panelW = 300;
    const panelH = 320;
    const gap = 12;
    const spaceRight = area.w - (box.left + box.width);
    const spaceBelow = area.h - (box.top + box.height);
    const spaceLeft = box.left;
    if (spaceRight >= panelW + gap) {
      return { ...base, top: Math.max(8, box.top), left: box.left + box.width + gap, right: "auto" };
    }
    if (spaceBelow >= Math.min(panelH, 180) + gap) {
      return {
        ...base,
        top: box.top + box.height + gap,
        left: Math.max(8, Math.min(box.left + (box.width - panelW) / 2, area.w - panelW - 8)),
        right: "auto",
      };
    }
    if (spaceLeft >= panelW + gap) {
      return { ...base, top: Math.max(8, box.top), left: Math.max(8, box.left - panelW - gap), right: "auto" };
    }
    // احتياطي: بجانب شريط الأدوات الأيسر فوق/بجانب الإطار دون الاعتماد على يمين الشاشة
    return { ...base, top: 12, left: GUTTER.left + 8, right: "auto" };
  })();

  const boxStyle = framed
    ? { left: box.left, top: box.top, width: box.width, height: box.height, overflow: "hidden", contain: "layout paint" }
    : { left: 0, top: 0, right: 0, bottom: 0 };

  const sizeOptions = [
    { value: "fit", label: "أقصى حجم" },
    ...SIZES.map((s) => ({ value: s, label: String(s), disabled: !computeBox(area, prefs.ratio, s)?.fixed || isRecActive })),
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

        {/* الصندوق: بدون إطار = يملأ المساحة كما كان. مع إطار = مقاس ثابت؛ contain يحبس أي عنصر fixed (popup/modal) داخل الصندوق.
            هذا العنصر بالذات هو "Recording Frame": المرجع recordFrameRef يُستخدم لقص تسجيل الفيديو عليه فقط (انظر نظام التسجيل أدناه). */}
        <div
          ref={recordFrameRef}
          data-pt-box
          data-recording-frame
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

      {/* إشعار "تسجيل غير مكتمل من جلسة سابقة" — يظهر دائمًا (حتى مع إخفاء الأدوات) حتى لا يُفقَد تسجيل بصمت */}
      {recStatus === "RECOVERABLE_DRAFT" && recDraft && (
        <div
          className="fixed rounded-2xl p-3 shadow-lg"
          style={{
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 320,
            background: "rgba(20,26,20,0.97)",
            color: "#FAF6ED",
            zIndex: Z.menu,
            pointerEvents: "auto",
            direction: "rtl",
            textAlign: "right",
          }}
        >
          <p className="text-[13px] mb-2">⚠️ تم العثور على تسجيل غير مكتمل من جلسة سابقة.</p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-lg px-3 py-1.5 text-[12px]"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              حذف التسجيل
            </button>
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-lg px-3 py-1.5 text-[12px]"
              style={{ background: "#10665A" }}
            >
              استعادة التسجيل
            </button>
          </div>
        </div>
      )}

      {/* الأدوات: خارج الصندوق دائمًا مع الإطار، وفوق الـstage (Z.tools). عند الإخفاء بالاختصار لا يُرسم أي شيء بديل — لا Toast ولا Tooltip ولا Overlay. */}
      {!toolsHidden && (
        <>
          {/* أزرار الخروج والتسجيل في الهامش الأيسر/العلوي فقط — خارج مستطيل Recording Frame هندسيًا */}
          <div
            className="fixed flex flex-col gap-2"
            style={{ top: 12, left: 12, zIndex: Z.tools, pointerEvents: "auto", maxWidth: GUTTER.left - 20 }}
          >
            <button
              onClick={exit}
              className="px-3 py-2 rounded-xl text-xs shadow-lg"
              style={{ background: "rgba(255,255,255,0.2)", color: "#FAF6ED" }}
            >
              خروج من التصوير (Esc)
            </button>
            <button
              type="button"
              onClick={() => setRecPanelOpen((v) => !v)}
              className="px-3 py-2 rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5"
              style={{
                background: recStatus === "RECORDING" ? "#B91C1C" : recStatus === "PAUSED" ? "#92400E" : "rgba(255,255,255,0.2)",
                color: "#FAF6ED",
              }}
            >
              {recStatus === "RECORDING" && <span>🔴 {formatClock(recElapsedSec)}</span>}
              {recStatus === "PAUSED" && <span>⏸️ {formatClock(recElapsedSec)}</span>}
              {recStatus !== "RECORDING" && recStatus !== "PAUSED" && <span>🎥 تسجيل الفيديو</span>}
            </button>
            {/* عناصر تحكم مضغوطة أثناء التسجيل — داخل هامش الأدوات فقط، لا تغطي الإطار */}
            {isRecActive && (
              <div className="flex flex-col gap-1.5 p-1.5 rounded-xl" style={{ background: "rgba(20,26,20,0.92)" }}>
                {recStatus === "RECORDING" && (
                  <button type="button" onClick={pauseRecording} className="rounded-lg px-2 py-1 text-[11px]" style={{ background: "rgba(255,255,255,0.12)", color: "#FAF6ED" }}>
                    إيقاف مؤقت
                  </button>
                )}
                {recStatus === "PAUSED" && (
                  <button type="button" onClick={resumeRecording} className="rounded-lg px-2 py-1 text-[11px]" style={{ background: "#10665A", color: "#FAF6ED" }}>
                    استئناف
                  </button>
                )}
                {recStatus !== "STOPPING" && (
                  <button type="button" onClick={stopRecording} className="rounded-lg px-2 py-1 text-[11px]" style={{ background: "#B91C1C", color: "#FAF6ED" }}>
                    إيقاف نهائي
                  </button>
                )}
              </div>
            )}
          </div>

          {/* لوحة التسجيل الكاملة: تُعرض فقط عندما لا يكون التسجيل جاريًا، أو تُوضع خارج مستطيل الإطار */}
          {recPanelOpen && !isRecActive && (
            <div
              data-pt-record-panel
              className="fixed rounded-2xl p-3 shadow-lg flex flex-col gap-3"
              style={recPanelStyle}
            >
              {recFallbackNotice && (
                <p className="text-[11px] rounded-lg p-2" style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24" }}>
                  {recFallbackNotice}
                </p>
              )}
              {recError && (
                <div className="text-[11px] rounded-lg p-2 flex flex-col gap-1.5" style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5" }}>
                  <span>{recError}</span>
                  <button type="button" onClick={dismissRecError} className="self-start rounded px-2 py-0.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                    إغلاق
                  </button>
                </div>
              )}

              {!recSupport.canRecord && recStatus === "IDLE" && (
                <p className="text-[12px]" style={{ opacity: 0.85 }}>تسجيل الفيديو غير مدعوم في هذا المتصفح.</p>
              )}

              {(recStatus === "IDLE" || recStatus === "READY") && recSupport.canRecord && (
                <>
                  <div>
                    <p className="text-[11px] mb-1" style={{ opacity: 0.7 }}>جودة التسجيل</p>
                    <Seg
                      value={recQuality}
                      onChange={setRecQuality}
                      options={REC_QUALITY_ORDER.map((k) => ({ value: k, label: REC_QUALITY_PRESETS[k].label }))}
                    />
                    <div className="text-[11px] mt-2 leading-5" style={{ opacity: 0.85, direction: "ltr", textAlign: "right" }}>
                      <div>
                        الدقة المستهدفة: {recTargetDims.width} × {recTargetDims.height}
                        {prefs.ratio !== "none" ? ` (${RATIO_LABELS[prefs.ratio] || prefs.ratio})` : ""}
                      </div>
                      <div>FPS المستهدف: {REC_QUALITY_PRESETS[recQuality].frameRate}</div>
                      <div>Video Bitrate: ~{(REC_QUALITY_PRESETS[recQuality].videoBitrate / 1_000_000).toFixed(1)} Mbps</div>
                      <div>Audio: 48 kHz / ~{Math.round(REC_QUALITY_PRESETS[recQuality].audioBitrate / 1000)} kbps</div>
                      <div>Codec: {recSupport.mimeType || "—"}</div>
                    </div>
                    <p className="text-[10px] mt-1" style={{ opacity: 0.55 }}>
                      الأبعاد تتبع نسبة إطار التصوير المختار. القيم أعلاه هدف مطلوب؛ الفعلية تُقاس بعد بدء التسجيل حسب قدرات جهازك.
                    </p>
                  </div>
                  <Check checked={recWantMic} onChange={setRecWantMic}>تسجيل الميكروفون</Check>
                  <Check checked={recWantSystemAudio} onChange={setRecWantSystemAudio}>تسجيل صوت النظام (إن سمح المتصفح)</Check>
                  {!recSupport.hasCropTarget && (
                    <p className="text-[10px]" style={{ opacity: 0.6 }}>
                      ملاحظة: متصفحك لا يدعم قص التسجيل تلقائيًا على منطقة العرض فقط؛ عند البدء اختر "هذا التبويب" يدويًا.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={startRecording}
                    className="rounded-lg px-3 py-2 text-[12px] font-medium"
                    style={{ background: "#10665A" }}
                  >
                    ابدأ التسجيل
                  </button>
                </>
              )}

              {(recStatus === "RECORDING" || recStatus === "PAUSED" || recStatus === "STOPPING") && (
                <>
                  <div className="text-[13px] flex items-center gap-2">
                    <span>{recStatus === "RECORDING" ? "🔴 التسجيل جارٍ" : recStatus === "PAUSED" ? "⏸️ متوقف مؤقتًا" : "⏳ جارٍ الإنهاء..."}</span>
                    <span style={{ direction: "ltr", fontFamily: "monospace" }}>{formatClock(recElapsedSec)}</span>
                  </div>
                  {recActual && (
                    <div className="text-[10px] leading-5" style={{ opacity: 0.7, direction: "ltr", textAlign: "right" }}>
                      {recActual.width && recActual.height ? `${recActual.width} × ${recActual.height}` : ""}
                      {recActual.targetWidth && recActual.targetHeight && (recActual.width !== recActual.targetWidth || recActual.height !== recActual.targetHeight)
                        ? ` (هدف: ${recActual.targetWidth}×${recActual.targetHeight})`
                        : ""}
                      {recActual.ratioKey && recActual.ratioKey !== "none" ? ` · ${RATIO_LABELS[recActual.ratioKey] || recActual.ratioKey}` : ""}
                      {recActual.frameRate ? ` · ${recActual.frameRate} FPS` : ""}
                      {recActual.sampleRate ? ` · ${recActual.sampleRate} Hz` : ""}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {recStatus === "RECORDING" && (
                      <button type="button" onClick={pauseRecording} className="rounded-lg px-3 py-1.5 text-[12px]" style={{ background: "rgba(255,255,255,0.12)" }}>
                        إيقاف مؤقت
                      </button>
                    )}
                    {recStatus === "PAUSED" && (
                      <button type="button" onClick={resumeRecording} className="rounded-lg px-3 py-1.5 text-[12px]" style={{ background: "#10665A" }}>
                        استئناف
                      </button>
                    )}
                    {recStatus !== "STOPPING" && (
                      <button type="button" onClick={stopRecording} className="rounded-lg px-3 py-1.5 text-[12px]" style={{ background: "#B91C1C" }}>
                        إيقاف نهائي
                      </button>
                    )}
                    {recStatus !== "STOPPING" && (
                      <button type="button" onClick={requestCancelRecording} className="rounded-lg px-3 py-1.5 text-[12px]" style={{ background: "rgba(255,255,255,0.12)" }}>
                        إلغاء
                      </button>
                    )}
                  </div>
                  {recCancelConfirm && (
                    <div className="rounded-lg p-2 text-[11px] flex flex-col gap-1.5" style={{ background: "rgba(239,68,68,0.15)" }}>
                      <span>هل تريد إلغاء التسجيل؟ سيتم حذف التسجيل الحالي.</span>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={dismissCancel} className="rounded px-2 py-1" style={{ background: "rgba(255,255,255,0.12)" }}>
                          تراجع
                        </button>
                        <button type="button" onClick={confirmCancel} className="rounded px-2 py-1" style={{ background: "#B91C1C" }}>
                          تأكيد الإلغاء
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {recStatus === "COMPLETED" && recPreview && (
                <>
                  <video src={recPreview.url} controls className="w-full rounded-lg" style={{ maxHeight: 200, background: "#000" }} />
                  <div className="text-[11px] leading-5" style={{ opacity: 0.85, direction: "ltr", textAlign: "right" }}>
                    <div>المدة: {formatClock(recPreview.duration || 0)}</div>
                    <div>الحجم: {formatBytes(recPreview.size)}</div>
                    {recPreview.qualityLabel && <div>الجودة: {recPreview.qualityLabel}</div>}
                    {recPreview.width && recPreview.height && <div>الدقة: {recPreview.width} × {recPreview.height}</div>}
                    {recPreview.fps && <div>FPS: {Math.round(recPreview.fps)}</div>}
                    {recPreview.sampleRate && <div>Audio: {recPreview.sampleRate} Hz</div>}
                    <div>الصوت: {[recPreview.hasMic && "ميكروفون", recPreview.hasSystemAudio && "صوت النظام"].filter(Boolean).join(" + ") || "بدون صوت"}</div>
                    {recPreview.restored && <div>تمت الاستعادة من جلسة سابقة.</div>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={recPreview.url}
                      download={`recording-${Date.now()}.webm`}
                      className="rounded-lg px-3 py-1.5 text-[12px]"
                      style={{ background: "#10665A", color: "#FAF6ED", textDecoration: "none" }}
                    >
                      تنزيل الفيديو
                    </a>
                    <button type="button" onClick={recordAgain} className="rounded-lg px-3 py-1.5 text-[12px]" style={{ background: "rgba(255,255,255,0.12)" }}>
                      تسجيل مرة أخرى
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

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
                <p className="text-[11px] mb-1" style={{ opacity: 0.7 }}>
                  إطار التصوير (المحتوى داخله والأدوات خارجه)
                  {isRecActive ? " — مثبت أثناء التسجيل" : ""}
                </p>
                <Seg
                  value={prefs.ratio}
                  onChange={(v) => {
                    if (isRecActive) return;
                    setPref("ratio", v);
                  }}
                  options={Object.keys(RATIOS).map((k) => ({
                    value: k,
                    label: RATIO_LABELS[k],
                    disabled: isRecActive,
                  }))}
                />
              </div>
              {framed && (
                <div>
                  <p className="text-[11px] mb-1" style={{ opacity: 0.7 }}>الحجم (الضلع الأقصر بالبكسل)</p>
                  <Seg
                    value={prefs.size}
                    onChange={(v) => {
                      if (isRecActive) return;
                      setPref("size", v);
                    }}
                    options={sizeOptions}
                  />
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