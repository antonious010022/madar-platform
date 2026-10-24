import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { extractYouTubeId } from "../lib/db";
import AuthModal, { RegistrationGate } from "./AuthModal";
import { MindMapViewerNode } from "./MindMap";
import TimelineView from "./TimelineView";

// الخريطة الذهنية في ملف مستقل (MindMap.jsx). نعيد تصديرها من هنا لأن ملفات أخرى (مثل Studio) تستوردها من Viewer.
export { MindMapViewerNode };

// ---------------------------------------------------------------------------
// Pill Tag Component
// ---------------------------------------------------------------------------
export function Pill({ children, tone = "teal" }) {
  const tones = {
    teal: { bg: "#E0F1EC", color: "#0E5348" },
    plum: { bg: "#EFE8F4", color: "#5A4175" },
    ochre: { bg: "#F8EFD8", color: "#86600F" },
  };
  const t = tones[tone] || tones.teal;

  return (
    <span
      style={{ background: t.bg, color: t.color }}
      className="md-lv-pill px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap inline-block"
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Image Upload Field Component
// ---------------------------------------------------------------------------
export function ImageUploadField({ value, onChange, label, uploadFn }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const prevObjectUrlRef = useRef(null);

  // تنظيف الروابط المؤقتة لمنع تسريب الذاكرة (Memory Leaks)
  const handleCleanupUrl = useCallback(() => {
    if (prevObjectUrlRef.current && prevObjectUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(prevObjectUrlRef.current);
      prevObjectUrlRef.current = null;
    }
  }, []);

  const handleRemoveImage = () => {
    handleCleanupUrl();
    onChange("");
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      if (typeof uploadFn === "function") {
        const url = await uploadFn(file);
        handleCleanupUrl();
        onChange(url);
      } else {
        handleCleanupUrl();
        const localUrl = URL.createObjectURL(file);
        prevObjectUrlRef.current = localUrl;
        onChange(localUrl);
      }
    } catch (e) {
      setError("تعذر رفع الصورة، حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => handleCleanupUrl();
  }, [handleCleanupUrl]);

  return (
    <div className="mb-2 text-right dir-rtl">
      {label && (
        <span className="block text-xs mb-1" style={{ color: "#3F4E49" }}>
          {label}
        </span>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-opacity disabled:opacity-50 cursor-pointer"
          style={{ background: "#E0F1EC", color: "#0E5348" }}
        >
          {uploading ? "جاري الرفع..." : "📁 اختيار صورة من الجهاز"}
        </button>
        {value && !uploading && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRemoveImage}
            className="text-xs px-2 py-1 rounded font-bold cursor-pointer"
            style={{ color: "#D6334B" }}
          >
            إزالة الصورة
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: "#D6334B" }}>
          {error}
        </p>
      )}
      {value && (
        <img
          src={value}
          alt="المعاينة"
          className="mt-2 rounded-xl max-h-32 object-cover block"
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unified Hotword Text & Popup Renderer
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Unified Hotword Text & Popup Renderer (Background Highlight Version)
// ---------------------------------------------------------------------------
export function HotwordRenderer({ text, hotwords = [], onJumpToScene }) {
  const [activeHot, setActiveHot] = useState(null);
  const [popPos, setPopPos] = useState({ top: 0, right: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveHot(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const processedHtml = useMemo(() => {
    let result = text || "";
    if (Array.isArray(hotwords) && hotwords.length > 0) {
      hotwords.forEach((hw) => {
        if (!hw || !hw.text) return;
        const escaped = hw.text.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (!escaped) return;
        const regex = new RegExp(`(?<!<[^>]*)${escaped}(?![^<]*>)`, "gi");
        result = result.replace(
          regex,
          `<span class="ts-hotword-highlight" data-hwid="${hw.id}">${hw.text}</span>`
        );
      });
    }
    return result;
  }, [text, hotwords]);

  const handleInteraction = useCallback(
    (targetEl, hwId) => {
      if (!hwId || !hotwords) return;
      const found = hotwords.find((h) => String(h.id) === String(hwId));
      if (found && containerRef.current) {
        const rect = targetEl.getBoundingClientRect();
        const parentRect = containerRef.current.getBoundingClientRect();

        const popW = Math.min(384, parentRect.width); // = max-w-sm
        setPopPos({
          top: rect.bottom - parentRect.top + 8,
          right: Math.min(Math.max(0, parentRect.right - rect.right), Math.max(0, parentRect.width - popW)),
        });
        setActiveHot(found);
      }
    },
    [hotwords]
  );

  return (
    <div ref={containerRef} className="relative text-right dir-rtl">
      <style>{`
        .ts-richtext-content {
          line-height: 1.8;
          color: #263B35;
        }
        /* كلمة تفاعلية: نص بتدرّج لوني بألوان المنصة + نجمة صغيرة، بدون خلفية أو خطوط */
        .ts-richtext-content .ts-hotword-highlight {
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: 800 !important;
          color: var(--duo-blue-ink, #3F7FA3) !important;
          background: none !important;
          padding: 0 !important;
          margin: 0 1px !important;
          border: none !important;
          border-radius: 0 !important;
          text-decoration: none !important;
          text-shadow: none !important;
          box-shadow: none !important;
          cursor: pointer !important;
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
          transition: background-position 0.5s ease, filter 0.25s ease !important;
        }
        @supports ((-webkit-background-clip: text) or (background-clip: text)) {
          .ts-richtext-content .ts-hotword-highlight {
            background-image: linear-gradient(100deg, #0E5348 0%, #147A6A 45%, #3F7FA3 100%) !important;
            background-size: 200% 100% !important;
            background-position: 0% 50% !important;
            -webkit-background-clip: text !important;
            background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
          }
        }
        .ts-richtext-content .ts-hotword-highlight::after {
          content: "\\2726";
          display: inline-block;
          margin-inline-start: 3px;
          font-size: 0.55em;
          font-weight: 400;
          vertical-align: super;
          line-height: 1;
          color: #3F7FA3;
          -webkit-text-fill-color: #3F7FA3;
          opacity: 0.85;
          transition: transform 0.35s ease, opacity 0.25s ease;
        }
        .ts-richtext-content .ts-hotword-highlight:hover {
          background-position: 100% 50% !important;
          filter: brightness(1.08);
        }
        .ts-richtext-content .ts-hotword-highlight:hover::after {
          transform: rotate(90deg) scale(1.25);
          opacity: 1;
        }
        .ts-richtext-content img {
          display: block !important;
          max-width: 100% !important;
          height: auto !important;
          margin: 16px auto !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
        }
      `}</style>

      <div
        className="ts-richtext-content ts-richtext"
        onClick={(e) => {
          const target = e.target.closest(".ts-hotword-highlight");
          if (target) {
            e.stopPropagation();
            handleInteraction(target, target.getAttribute("data-hwid"));
          }
        }}
        onMouseOver={(e) => {
          const target = e.target.closest(".ts-hotword-highlight");
          if (target) {
            handleInteraction(target, target.getAttribute("data-hwid"));
          }
        }}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />

      {/* النافذة المنبثقة للتفاعل مع الكلمات المفتاحية */}
      {activeHot && (
        <div
          className="ts-fade md-hw-pop absolute z-50 rounded-2xl p-4 shadow-2xl max-w-sm w-full text-right"
          style={{
            background: "#FAF6ED",
            border: "2px solid #147A6A",
            top: `${popPos.top}px`,
            right: `${popPos.right}px`,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => setActiveHot(null)}
        >
          <div
            className="md-hw-head flex justify-between items-center mb-2 border-b pb-1"
            style={{ borderColor: "#DED4BD" }}
          >
            <span className="md-hw-name font-bold text-base" style={{ color: "#147A6A" }}>
              {activeHot.text}
            </span>
            <button
              type="button"
              onClick={() => setActiveHot(null)}
              aria-label="إغلاق"
              className="md-hw-close font-bold px-2 py-0.5 rounded cursor-pointer"
              style={{ color: "#697A73" }}
            >
              ✕
            </button>
          </div>

          {activeHot.image && (
            <img
              src={activeHot.image}
              alt={activeHot.text}
              className="md-hw-img rounded-xl mb-2 w-full object-contain block border"
              style={{ maxHeight: "280px", borderColor: "#DED4BD" }}
            />
          )}

          {activeHot.note && (
            <p className="md-hw-note text-sm mb-2" style={{ color: "#263B35" }}>
              {activeHot.note}
            </p>
          )}

          {activeHot.linkSceneId && onJumpToScene && (
            <button
              type="button"
              onClick={() => {
                onJumpToScene(activeHot.linkSceneId);
                setActiveHot(null);
              }}
              className="md-hw-jump text-xs px-3 py-1.5 rounded-xl text-white font-bold w-full cursor-pointer mt-1"
              style={{ background: "#147A6A" }}
            >
              الانتقال إلى المشهد المرتبط ↗
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Question Item Component
// ---------------------------------------------------------------------------
export function QuestionItem({ q }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userEssay, setUserEssay] = useState("");

  // إعادة إسناد الإجابات المحددة عند الانتقال بين الأسئلة المختلفة
  useEffect(() => {
    setSelectedOption(null);
    setShowAnswer(false);
    setUserEssay("");
  }, [q?.id, q?.prompt]);

  if (!q) return null;

  if (q.type === "mcq") {
    return (
      <div
        className="md-lv-q p-4 rounded-2xl border text-right dir-rtl"
        style={{ background: "#FAF6ED", borderColor: "#DED4BD" }}
      >
        <p className="font-bold mb-3" style={{ color: "#263B35" }}>
          {q.prompt}
        </p>
        <div className="flex flex-col gap-2">
          {q.options?.map((opt, i) => {
            const isCorrect = showAnswer && i === q.correctIndex;
            const isWrong =
              showAnswer && selectedOption === i && i !== q.correctIndex;
            return (
              <button
                type="button"
                key={`mcq-opt-${i}`}
                onClick={() => !showAnswer && setSelectedOption(i)}
                className="md-lv-opt text-right px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: isCorrect
                    ? "#E0F1EC"
                    : isWrong
                    ? "#FBE7DE"
                    : selectedOption === i
                    ? "#F8EFD8"
                    : "#FFFFFF",
                  borderColor: isCorrect
                    ? "#147A6A"
                    : isWrong
                    ? "#D6334B"
                    : selectedOption === i
                    ? "#B8832A"
                    : "#DED4BD",
                  color: "#263B35",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {!showAnswer ? (
          <button
            type="button"
            disabled={selectedOption === null}
            onClick={() => setShowAnswer(true)}
            className="md-lv-btn-sm mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity disabled:opacity-50 cursor-pointer"
            style={{
              background: selectedOption === null ? "#DED4BD" : "#147A6A",
            }}
          >
            تحقق من الإجابة
          </button>
        ) : (
          <div className="mt-3 ts-fade text-sm">
            <p
              className="font-bold mb-1"
              style={{
                color:
                  selectedOption === q.correctIndex ? "#147A6A" : "#D6334B",
              }}
            >
              {selectedOption === q.correctIndex
                ? "إجابة صحيحة بارك الله فيك!"
                : `إجابة غير دقيقة. الإجابة الصحيحة هي: ${
                    q.options?.[q.correctIndex] ?? ""
                  }`}
            </p>
            {q.explanation && (
              <p className="text-xs" style={{ color: "#3F4E49" }}>
                💡 {q.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="md-lv-q p-4 rounded-2xl border text-right dir-rtl"
      style={{ background: "#FAF6ED", borderColor: "#DED4BD" }}
    >
      <p className="font-bold mb-3" style={{ color: "#263B35" }}>
        {q.prompt}
      </p>
      <textarea
        value={userEssay}
        onChange={(e) => setUserEssay(e.target.value)}
        rows={3}
        placeholder="اكتب إجابتك هنا..."
        className="ts-input text-sm mb-2 w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-600"
        style={{ borderColor: "#DED4BD" }}
      />
      {!showAnswer ? (
        <button
          type="button"
          onClick={() => setShowAnswer(true)}
          className="md-lv-btn-sm px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
          style={{ background: "#147A6A" }}
        >
          عرض الإجابة النموذجية
        </button>
      ) : (
        <div
          className="ts-fade mt-3 p-3 rounded-xl text-sm"
          style={{ background: "#E0F1EC", border: "1px solid #147A6A" }}
        >
          <p className="font-bold mb-1" style={{ color: "#0E5348" }}>
            الإجابة النموذجية:
          </p>
          <p style={{ color: "#263B35" }}>{q.modelAnswer}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Info tip (ⓘ)
// ---------------------------------------------------------------------------
function InfoTip({ text, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <span className="relative inline-flex" ref={ref}>
      <button type="button" className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
        style={{ background: "#E0F1EC", color: "#0E5348" }} aria-label={label || "معلومة"} aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>ⓘ</button>
      {open && (
        <span role="tooltip" className="absolute z-20 top-full mt-1 right-0 w-56 sm:w-64 p-3 rounded-xl text-xs shadow-md"
          style={{ background: "#263B35", color: "#FAF6ED" }}>{text}</span>
      )}
    </span>
  );
}

function YouTubePlayer({ videoId }) {
  const [show, setShow] = useState(false);
  if (!videoId) return null;
  return (
    <div className="md-lv-video mb-6 rounded-3xl overflow-hidden bg-black shadow-sm" style={{ border: "1px solid #DED4BD" }}>
      {!show ? (
        <button type="button" onClick={() => setShow(true)}
          className="relative w-full flex items-center justify-center cursor-pointer"
          style={{ aspectRatio: "16 / 9", background: "#263B35" }} aria-label="تشغيل فيديو الدرس">
          <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" loading="lazy" />
          <span className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
            style={{ background: "rgba(75, 47, 209, 0.92)" }}>▶</span>
        </button>
      ) : (
        <div className="w-full" style={{ aspectRatio: "16 / 9" }}>
          <iframe title="فيديو الدرس" src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
            className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen loading="lazy" style={{ border: 0 }} />
        </div>
      )}
    </div>
  );
}

function buildFullMindMap(scenes, lessonTitle) {
  if (!Array.isArray(scenes) || scenes.length === 0) return null;
  const children = [];
  for (const s of scenes) {
    const mm = s.mindmap;
    if (mm && mm.label) children.push({ ...mm, id: mm.id || `scene-mm-${s.id}`, label: mm.label || s.title, children: mm.children || [] });
  }
  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  return { id: "full-mm-root", label: lessonTitle || "الخريطة الذهنية الكاملة", description: "أهم أفكار جميع أجزاء الدرس", children };
}

function buildFullTimeline(scenes) {
  if (!Array.isArray(scenes)) return [];
  const items = []; const seen = new Set();
  for (const s of scenes) {
    for (const t of s.timeline || []) {
      const key = `${t.date || ""}|${t.title || ""}|${t.id || ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ ...t, _sceneTitle: s.title });
    }
  }
  return items;
}


function resolveSceneType(scene) {
  if (!scene) return "EXPLANATION";
  if (scene.sceneType) return scene.sceneType;
  if (scene.scene_type) return scene.scene_type;
  // Old published scenes without type: composite / legacy
  return "LEGACY";
}

/** Scene locked for guest if marked members-only. Feature-level gates still apply inside public scenes. */
function isSceneMembersOnly(scene) {
  return !!(scene && (scene.isMembersOnly || scene.is_members_only));
}

function isSceneLockedForGuest(scene, { requireAuthForTools, session, isTeacherView }) {
  if (!requireAuthForTools || session || isTeacherView) return false;
  return isSceneMembersOnly(scene);
}

/** Lesson-level Access Lock (registered users only). */
export function isLessonMembersOnly(lesson) {
  if (!lesson) return false;
  if (lesson.isMembersOnly) return true;
  const cfg = lesson.journeyConfig || lesson.journey_config || {};
  return !!(cfg.isMembersOnly || cfg.exclusive || cfg.is_members_only);
}

/**
 * Journey / sequence lock — independent from Members-Only (auth) lock.
 * A scene is open when it is the first one, is itself completed, or the
 * PREVIOUS scene is inside journey.completedScenes. `completedScenes` is the
 * single source of truth (unlockedScenes is no longer consulted), so a scene
 * can never stay locked after its predecessor was completed.
 */
export function isSceneSequenceUnlocked(journey, index) {
  if (index <= 0) return true;
  const done = Array.isArray(journey?.completedScenes) ? journey.completedScenes : [];
  return done.includes(index) || done.includes(index - 1);
}

/**
 * Resolve lock kind for a scene index.
 * Priority: COMPLETED → ACCESS_LOCK → SEQUENCE_LOCK → AVAILABLE
 */
export function getSceneLockKind(scene, index, opts) {
  const {
    session = null,
    isTeacherView = false,
    requireAuthForTools = false,
    hasJourney = false,
    journey = null,
  } = opts || {};

  if (isTeacherView) return "AVAILABLE";

  const completed = hasJourney && Array.isArray(journey?.completedScenes) && journey.completedScenes.includes(index);
  if (completed) return "COMPLETED";

  // Access Lock first (guest + members-only scene)
  if (requireAuthForTools && !session && isSceneMembersOnly(scene)) {
    return "ACCESS_LOCK";
  }

  // Sequence Lock (previous scene must be inside completedScenes)
  if (hasJourney && journey) {
    if (!isSceneSequenceUnlocked(journey, index)) return "SEQUENCE_LOCK";
  }

  return "AVAILABLE";
}

export function sceneLockLabel(kind) {
  switch (kind) {
    case "COMPLETED":
      return { mark: "✓", message: "مكتمل", short: "✓ " };
    case "ACCESS_LOCK":
      return { mark: "🔐", message: "تسجيل الدخول مطلوب", short: "🔐 " };
    case "SEQUENCE_LOCK":
      return { mark: "🔒", message: "أكمل العنوان السابق أولًا", short: "🔒 " };
    case "AVAILABLE":
    default:
      return { mark: "🔵", message: "متاح", short: "○ " };
  }
}

function buildFullQuestions(scenes) {
  if (!Array.isArray(scenes)) return [];
  const items = []; const seen = new Set();
  for (const s of scenes) {
    for (const q of s.questions || []) {
      const key = q.id || `${q.prompt}|${q.type}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(q);
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Journey layout (student lesson page only — يتفعّل فقط عند وجود journey)
// معاينة المعلم ووضع التصوير لا يمرّان من هنا إطلاقًا.
// ---------------------------------------------------------------------------
const JR_CSS = `
.md-jr {
  --jr-bg: #FAF6ED; --jr-surface: #FFFFFF; --jr-soft: #F4EFE2; --jr-text: #1C2D28; --jr-muted: #596D66;
  --jr-teal: #147A6A; --jr-teal-deep: #0E5348; --jr-teal-soft: rgba(20, 122, 106, 0.09);
  --jr-btn: #147A6A; --jr-btn-deep: #0E5348;
  --jr-line: #DED4BD; --jr-gold: #B8832A; --jr-gold-soft: #F8EFD8; --jr-ok-soft: #E0F1EC; --jr-bad: #C2562F; --jr-bad-soft: #FBE7DE;
  --jr-shadow: 0 16px 36px -26px rgba(14, 83, 72, 0.38), 0 1px 3px rgba(0, 0, 0, 0.04);
  --jr-font: "Cairo", "Segoe UI", "Noto Sans Arabic", system-ui, sans-serif;
  --jr-pad: clamp(0.9rem, 3vw, 1.5rem);
  --jr-top: 0px;
  direction: rtl; text-align: right; flex: 1 0 auto;
  background: var(--jr-bg); color: var(--jr-text); font-family: var(--jr-font);
}
html[data-theme="dark"] .md-jr {
  --jr-bg: #0C1412; --jr-surface: #14211D; --jr-soft: #1A2C27; --jr-text: #ECF4F0; --jr-muted: #9BB0A7;
  --jr-teal: #3A9C89; --jr-teal-deep: #8CE0CE; --jr-teal-soft: rgba(58, 156, 137, 0.14);
  --jr-btn: #2A7A6B; --jr-btn-deep: #1F6A5C;
  --jr-line: #2C3E37; --jr-gold: #D69336; --jr-gold-soft: #2B2418; --jr-ok-soft: #1B2E28; --jr-bad: #E58A67; --jr-bad-soft: #2E1F1A;
  --jr-shadow: 0 18px 40px -26px rgba(0, 0, 0, 0.7);
}
.md-jr *, .md-jr *::before, .md-jr *::after { box-sizing: border-box; }
.md-jr button { font-family: var(--jr-font); cursor: pointer; }
.md-jr .md-jr-wrap { max-width: 1120px; margin: 0 auto; padding: clamp(0.8rem, 3vw, 1.5rem) var(--jr-pad) 2rem; }

/* ---- hero ---- */
.md-jr .md-jr-hero {
  position: relative; text-align: center; color: #fff; border-radius: 1.5rem; padding: clamp(1.2rem, 3.5vw, 1.9rem);
  background: linear-gradient(125deg, #0A3F36 0%, #0E5348 40%, #147A6A 100%); box-shadow: var(--jr-shadow);
}
html[data-theme="dark"] .md-jr .md-jr-hero { background: linear-gradient(125deg, #062A24 0%, #0A3F36 45%, #0E5348 100%); }
.md-jr .md-jr-pill { display: inline-block; padding: 0.3rem 0.85rem; border-radius: 999px; font-size: 0.8rem; font-weight: 800; background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.28); color: #F3DDB6; }
.md-jr .md-jr-h1 { margin: 0.7rem 0 0; font-family: var(--jr-font); font-size: clamp(1.45rem, 4.4vw, 2.1rem); font-weight: 900; line-height: 1.5; color: #fff; }
.md-jr .md-jr-desc { margin: 0.45rem auto 0; max-width: 40rem; font-size: 0.95rem; line-height: 1.9; font-weight: 600; color: rgba(255, 255, 255, 0.92); }
.md-jr .md-jr-hero-actions { margin-top: 0.9rem; display: flex; justify-content: center; }

/* ---- lesson video (intro) ---- */
.md-jr .md-jr-video { margin-top: 1rem; background: var(--jr-surface); border: 1px solid var(--jr-line); border-radius: 1.3rem; box-shadow: var(--jr-shadow); }
.md-jr .md-jr-video-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.7rem 1rem; }
.md-jr .md-jr-video-title { margin: 0; font-size: 0.98rem; font-weight: 900; color: var(--jr-teal-deep); }
.md-jr .md-jr-video-note { margin: 0.15rem 0 0; font-size: 0.82rem; line-height: 1.85; font-weight: 600; color: var(--jr-muted); }
.md-jr .md-jr-video-body { padding: 0 1rem 1rem; }
.md-jr .md-jr-frame { position: relative; aspect-ratio: 16 / 9; border-radius: 1rem; overflow: hidden; background: #0E1F1B; border: 1px solid var(--jr-line); }
.md-jr .md-jr-frame iframe, .md-jr .md-jr-frame img { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.md-jr .md-jr-frame img { object-fit: cover; opacity: 0.72; }
.md-jr .md-jr-playbtn { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; border: 0; background: transparent; }
.md-jr .md-jr-playbtn span { display: inline-flex; align-items: center; justify-content: center; width: 4rem; height: 4rem; border-radius: 999px; background: var(--jr-btn); color: #fff; box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.6); }
.md-jr .md-jr-playbtn svg { width: 1.6rem; height: 1.6rem; margin-inline-end: -0.15rem; }

/* ---- sticky navigation ---- */
.md-jr .md-jr-nav {
  position: sticky; top: var(--jr-top, 0px); z-index: 30; margin-top: 0.75rem; padding: 0.3rem 0 0.35rem; transition: top 0.28s ease;
  background: color-mix(in srgb, var(--jr-bg) 93%, transparent); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--jr-line);
}
.md-jr .md-jr-navrow { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; font-size: 0.72rem; font-weight: 800; line-height: 1.3; color: var(--jr-teal-deep); }
.md-jr .md-jr-navrow small { font-size: 0.7rem; font-weight: 700; color: var(--jr-muted); }
.md-jr .md-jr-track { height: 3px; margin-top: 0.25rem; border-radius: 999px; background: var(--jr-line); overflow: hidden; }
.md-jr .md-jr-fill { height: 100%; border-radius: 999px; background: var(--jr-teal); transition: width 0.4s ease; }
.md-jr .md-jr-chips { display: flex; gap: 0.35rem; margin: 0.3rem 0 0; padding: 0.1rem 0.1rem 0.15rem; list-style: none; overflow-x: auto; scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.md-jr .md-jr-chips::-webkit-scrollbar { display: none; }
.md-jr .md-jr-chips li { flex: none; scroll-snap-align: center; }
.md-jr .md-jr-chip {
  display: inline-flex; align-items: center; gap: 0.35rem; min-height: 32px; padding: 0.2rem 0.7rem 0.2rem 0.6rem; border-radius: 999px; white-space: nowrap;
  font-size: 0.76rem; font-weight: 800; line-height: 1.2; color: var(--jr-text); background: var(--jr-surface); border: 1.5px solid var(--jr-line);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.md-jr .md-jr-chip-mark { flex: none; display: inline-grid; place-items: center; min-width: 1.05rem; height: 1.05rem; border-radius: 999px; font-size: 0.66rem; font-weight: 900; background: color-mix(in srgb, currentColor 14%, transparent); }
.md-jr .md-jr-chip[data-state="current"] { background: var(--jr-btn); border-color: var(--jr-btn); color: #fff; }
.md-jr .md-jr-chip[data-state="done"] { background: var(--jr-ok-soft); border-color: var(--jr-teal); color: var(--jr-teal-deep); }
.md-jr .md-jr-chip[data-state="done"][aria-current="step"] { background: var(--jr-btn); border-color: var(--jr-btn); color: #fff; }
.md-jr .md-jr-chip[data-state="access"] { background: var(--jr-gold-soft); border-color: var(--jr-gold); }
.md-jr .md-jr-chip[data-state="sequence"] { background: var(--jr-soft); border-style: dashed; color: var(--jr-muted); }
.md-jr .md-jr-chip[aria-disabled="true"] { cursor: not-allowed; }
.md-jr .md-jr-chip:hover:not([aria-disabled="true"]):not([data-state="current"]):not([aria-current="step"]) { border-color: var(--jr-teal); }
.md-jr .md-jr-curtitle { display: none; }
/* زر + قائمة منسدلة بدل الشريط الأفقي (الموبايل) */
.md-jr .md-jr-navtoggle {
  width: 100%; margin-top: 0.35rem; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;
  padding: 0.35rem 0.8rem; border-radius: 0.9rem; text-align: right; cursor: pointer;
  background: var(--jr-surface); border: 1.5px solid var(--jr-teal); color: var(--jr-text); font-size: 0.85rem; font-weight: 800; line-height: 1.4;
}
.md-jr .md-jr-navtoggle-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.md-jr .md-jr-navtoggle-cta { flex: none; display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.6rem; border-radius: 999px; background: var(--jr-btn); color: #fff; font-size: 0.74rem; font-weight: 900; }
.md-jr .md-jr-navpanel {
  position: absolute; inset-inline: 0; top: 100%; z-index: 40; padding: 0.5rem; background: var(--jr-surface);
  border: 1px solid var(--jr-line); border-top: 0; border-radius: 0 0 1.1rem 1.1rem; box-shadow: 0 18px 30px -18px rgba(0, 0, 0, 0.45);
}
.md-jr .md-jr-list--panel { max-height: min(60vh, 26rem); }
.md-jr .md-jr-list--panel .md-jr-item { font-size: 0.86rem; }

/* ---- layout ---- */
.md-jr .md-jr-grid { display: block; margin-top: 1rem; }
.md-jr .md-jr-side { display: none; }
.md-jr .md-jr-main { min-width: 0; }
.md-jr .md-jr-main > *:not(.md-jr-bar) { max-width: 46rem; margin-inline: auto; }
@media (min-width: 1024px) {
  .md-jr .md-jr-grid { display: grid; grid-template-columns: 17.5rem minmax(0, 1fr); gap: 1.6rem; align-items: start; }
  .md-jr .md-jr-side { display: block; position: sticky; top: calc(var(--jr-top, 0px) + 4.6rem); }
  .md-jr .md-jr-chips, .md-jr .md-jr-curtitle, .md-jr .md-jr-navtoggle, .md-jr .md-jr-navpanel { display: none; }
}
.md-jr .md-jr-sidecard { background: var(--jr-surface); border: 1px solid var(--jr-line); border-radius: 1.3rem; box-shadow: var(--jr-shadow); padding: 0.9rem; }
.md-jr .md-jr-sidehead { margin: 0 0 0.6rem; padding-inline: 0.35rem; font-size: 0.82rem; font-weight: 900; color: var(--jr-muted); }
.md-jr .md-jr-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.3rem; max-height: calc(100vh - var(--jr-top, 0px) - 10rem); overflow-y: auto; }
.md-jr .md-jr-item {
  width: 100%; min-height: 44px; display: flex; align-items: center; gap: 0.6rem; padding: 0.45rem 0.6rem; border-radius: 0.9rem; text-align: right;
  background: transparent; border: 1px solid transparent; color: var(--jr-text); font-size: 0.9rem; font-weight: 700; line-height: 1.5;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.md-jr .md-jr-item:hover:not([aria-disabled="true"]) { background: var(--jr-teal-soft); }
.md-jr .md-jr-item[data-state="current"] { background: var(--jr-teal-soft); border-color: var(--jr-teal); color: var(--jr-teal-deep); font-weight: 900; }
.md-jr .md-jr-item[data-state="sequence"] { color: var(--jr-muted); }
.md-jr .md-jr-item[aria-disabled="true"] { cursor: not-allowed; }
.md-jr .md-jr-dot {
  flex: none; display: inline-flex; align-items: center; justify-content: center; width: 1.9rem; height: 1.9rem; border-radius: 999px;
  font-size: 0.8rem; font-weight: 900; background: var(--jr-surface); border: 1.5px solid var(--jr-line); color: var(--jr-text);
}
.md-jr .md-jr-item[data-state="current"] .md-jr-dot { background: var(--jr-btn); border-color: var(--jr-btn); color: #fff; }
.md-jr .md-jr-item[data-state="done"] .md-jr-dot { background: var(--jr-ok-soft); border-color: var(--jr-teal); color: var(--jr-teal-deep); }
.md-jr .md-jr-item[data-state="sequence"] .md-jr-dot { border-style: dashed; }
.md-jr .md-jr-legend { margin: 0.7rem 0 0; padding-inline: 0.35rem; font-size: 0.72rem; line-height: 1.9; font-weight: 600; color: var(--jr-muted); }
/* ---- العنوان الحالي واضح في القائمة الجانبية وفي الشريط (حتى لو العنوان مكتمل) ---- */
.md-jr .md-jr-item[aria-current="step"] { background: var(--jr-btn); border-color: var(--jr-btn); color: #fff; font-weight: 900; box-shadow: 0 10px 22px -14px rgba(20, 122, 106, 0.8); }
.md-jr .md-jr-item[aria-current="step"] .md-jr-dot { background: #fff; border-color: #fff; color: var(--jr-teal-deep); }
.md-jr .md-jr-item[aria-current="step"]::after { content: "أنت هنا"; flex: none; margin-inline-start: auto; padding: 0.1rem 0.55rem; border-radius: 999px; background: rgba(255, 255, 255, 0.22); font-size: 0.68rem; font-weight: 900; }
.md-jr .md-jr-list--panel .md-jr-item[aria-current="step"]::after { content: "أنت هنا"; }
/* ---- الشريط الأفقي للعناوين (تابلت وموبايل): كلهم جنب بعض + الحالي مميّز ---- */
.md-jr .md-jr-chips { margin-top: 0.4rem; padding: 0.2rem 0.15rem 0.3rem; gap: 0.4rem; }
.md-jr .md-jr-chip { min-height: 40px; padding: 0.2rem 0.8rem 0.2rem 0.65rem; font-size: 0.8rem; }
.md-jr .md-jr-chip-title { display: block; max-width: 9rem; overflow: hidden; text-overflow: ellipsis; }
.md-jr .md-jr-chip[aria-current="step"] { background: var(--jr-btn); border-color: var(--jr-btn); color: #fff; box-shadow: 0 0 0 3px var(--jr-teal-soft), 0 8px 16px -10px rgba(20, 122, 106, 0.8); }
.md-jr .md-jr-chip[aria-current="step"] .md-jr-chip-title { max-width: 15rem; }
.md-jr .md-jr-chip[aria-current="step"] .md-jr-chip-mark { background: rgba(255, 255, 255, 0.25); }

/* ---- cards & sections ---- */
.md-jr .md-jr-card { background: var(--jr-surface); border: 1px solid var(--jr-line); border-radius: 1.3rem; box-shadow: var(--jr-shadow); padding: clamp(1rem, 3.4vw, 1.7rem); margin-bottom: 1rem; overflow: visible; }
.md-jr .md-jr-head { margin-bottom: 1rem; }
.md-jr .md-jr-scene-no { margin: 0; font-size: 0.8rem; font-weight: 800; color: var(--jr-muted); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.md-jr .md-jr-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.12rem 0.6rem; border-radius: 999px; font-size: 0.74rem; font-weight: 800; background: var(--jr-ok-soft); color: var(--jr-teal-deep); border: 1px solid var(--jr-teal); }
.md-jr .md-jr-title { margin: 0.25rem 0 0; font-size: clamp(1.35rem, 4.2vw, 1.8rem); font-weight: 900; line-height: 1.6; color: var(--jr-text); }
.md-jr .md-jr-eyebrow { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.7rem; font-family: var(--jr-font); font-size: 0.8rem; font-weight: 900; color: var(--jr-teal-deep); }
.md-jr .md-jr-eyebrow::before { content: ""; width: 0.5rem; height: 0.5rem; border-radius: 999px; background: var(--jr-gold); }
.md-jr .md-jr-card .ts-richtext-content { font-size: 1.14rem; line-height: 2.05; color: var(--jr-text); }
.md-jr .md-jr-card .ts-richtext-content p { margin: 0 0 0.9em; }
html[data-theme="dark"] .md-jr .md-jr-card .ts-richtext-content { color: var(--jr-text); }
.md-jr .md-jr-notice { text-align: center; }
.md-jr .md-jr-notice h3 { margin: 0.2rem 0 0.4rem; font-size: 1.15rem; font-weight: 900; color: var(--jr-teal-deep); }
.md-jr .md-jr-notice p { margin: 0 0 1rem; font-size: 0.92rem; line-height: 1.9; color: var(--jr-muted); font-weight: 600; }
.md-jr .md-jr-notice .md-jr-emoji { font-size: 2rem; display: block; margin-bottom: 0.3rem; }
.md-jr .md-jr-lock { border-style: dashed; border-color: var(--jr-gold); background: var(--jr-gold-soft); }
.md-jr .md-jr-muted { color: var(--jr-muted); font-size: 0.85rem; font-weight: 600; line-height: 1.9; }

/* ---- recall (phase A: basic list; upgraded in phase B) ---- */
.md-jr .md-jr-recall ol { margin: 0; padding-inline-start: 1.3rem; font-size: 0.98rem; line-height: 2; }

/* ---- tools ---- */
.md-jr .md-jr-tools { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.md-jr .md-jr-tool {
  min-height: 44px; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.1rem; border-radius: 999px;
  font-size: 0.92rem; font-weight: 800; color: var(--jr-teal-deep); background: var(--jr-surface); border: 1.5px solid var(--jr-line);
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.md-jr .md-jr-tool:hover { border-color: var(--jr-teal); }
.md-jr .md-jr-tool[aria-expanded="true"] { background: var(--jr-teal-soft); border-color: var(--jr-teal); }
.md-jr .md-jr-tool svg { width: 1rem; height: 1rem; transition: transform 0.2s ease; }
.md-jr .md-jr-tool[aria-expanded="true"] svg { transform: rotate(180deg); }
.md-jr .md-jr-panel { margin-top: 0.9rem; padding-top: 0.9rem; border-top: 1px solid var(--jr-line); }
.md-jr .md-jr-detail { margin-top: 0.9rem; padding: 0.9rem 1rem; border-radius: 1rem; background: var(--jr-gold-soft); border: 1px solid var(--jr-gold); }
.md-jr .md-jr-detail p { margin: 0; font-size: 0.9rem; line-height: 1.9; color: var(--jr-text); }
.md-jr .md-jr-detail p + p { margin-top: 0.3rem; }
.md-jr .md-jr-tl { display: flex; flex-direction: column; gap: 0.7rem; margin: 0; padding: 0; list-style: none; }
.md-jr .md-jr-tl li { display: flex; gap: 0.8rem; padding: 0.8rem; border-radius: 1rem; background: var(--jr-bg); border: 1px solid var(--jr-line); }
.md-jr .md-jr-tl-date { align-self: flex-start; padding: 0.3rem 0.7rem; border-radius: 0.7rem; font-size: 0.82rem; font-weight: 900; white-space: nowrap; background: var(--jr-btn); color: #fff; }
.md-jr .md-jr-tl h4 { margin: 0 0 0.2rem; font-size: 1rem; font-weight: 800; }
.md-jr .md-jr-tl p { margin: 0; font-size: 0.9rem; line-height: 1.85; color: var(--jr-muted); font-weight: 600; }
.md-jr .md-jr-tl img { margin-top: 0.5rem; width: 100%; max-height: 10rem; object-fit: cover; border-radius: 0.8rem; }
@media (max-width: 520px) { .md-jr .md-jr-tl li { flex-direction: column; } }

/* ---- LessonActions (من ملف خارجي): تباين ثابت في الفاتح والداكن ---- */
.md-jr .md-lv-act { color: #0E5348; box-shadow: 0 3px 0 rgba(0, 0, 0, 0.22); }
.md-jr .md-lv-act.is-saved { background: #F3DDB6; color: #3F2E08; }

/* ---- recall ---- */
.md-jr .md-jr-recall-head { width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0; background: transparent; border: 0; color: var(--jr-text); text-align: right; }
.md-jr .md-jr-recall-head strong { display: block; font-size: 0.98rem; font-weight: 900; color: var(--jr-teal-deep); }
.md-jr .md-jr-recall-head span.md-jr-hint { display: block; font-size: 0.8rem; font-weight: 600; color: var(--jr-muted); line-height: 1.8; }
.md-jr .md-jr-recall-head svg { width: 1.1rem; height: 1.1rem; flex: none; color: var(--jr-teal-deep); transition: transform 0.2s ease; }
.md-jr .md-jr-recall-head[aria-expanded="true"] svg { transform: rotate(180deg); }
.md-jr .md-jr-recall-list { margin: 0.8rem 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.md-jr .md-jr-recall-item { width: 100%; min-height: 48px; display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.8rem; border-radius: 1rem; text-align: right; font-size: 1rem; line-height: 1.9; font-weight: 600; color: var(--jr-text); background: var(--jr-bg); border: 1.5px dashed var(--jr-line); }
.md-jr .md-jr-recall-item:hover { border-color: var(--jr-teal); }
.md-jr .md-jr-recall-item[aria-expanded="true"] { background: var(--jr-ok-soft); border: 1px solid var(--jr-teal); cursor: default; }
.md-jr .md-jr-recall-item .md-jr-n { flex: none; width: 1.8rem; height: 1.8rem; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; font-size: 0.8rem; font-weight: 900; background: var(--jr-surface); border: 1.5px solid var(--jr-line); }
.md-jr .md-jr-recall-item .md-jr-cover { color: var(--jr-muted); font-weight: 700; font-size: 0.9rem; }
.md-jr .md-jr-linkbtn { margin-top: 0.6rem; min-height: 44px; padding: 0 0.4rem; background: transparent; border: 0; font-size: 0.85rem; font-weight: 800; color: var(--jr-teal-deep); text-decoration: underline; text-underline-offset: 3px; }

/* ---- quiz ---- */
.md-jr .md-jr-quizhead { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.7rem; }
.md-jr .md-jr-quizhead .md-jr-eyebrow { margin: 0; }
.md-jr .md-jr-count { font-size: 0.8rem; font-weight: 800; color: var(--jr-muted); }
.md-jr .md-jr-q { padding: 1rem; border-radius: 1.1rem; background: var(--jr-bg); border: 1px solid var(--jr-line); }
.md-jr .md-jr-q + .md-jr-q { margin-top: 0.9rem; }
.md-jr .md-jr-qtop { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.7rem; margin-bottom: 0.7rem; }
.md-jr .md-jr-qprompt { margin: 0; font-size: 1.02rem; font-weight: 800; line-height: 1.9; color: var(--jr-text); }
.md-jr .md-jr-qtag { flex: none; padding: 0.15rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; white-space: nowrap; background: var(--jr-gold-soft); color: var(--jr-gold); border: 1px solid var(--jr-gold); }
.md-jr .md-jr-qtag[data-done="true"] { background: var(--jr-ok-soft); color: var(--jr-teal-deep); border-color: var(--jr-teal); }
.md-jr .md-jr-opts { display: flex; flex-direction: column; gap: 0.5rem; }
.md-jr .md-jr-opt { width: 100%; min-height: 48px; padding: 0.6rem 0.9rem; border-radius: 0.95rem; text-align: right; font-size: 0.96rem; font-weight: 700; line-height: 1.8; color: var(--jr-text); background: var(--jr-surface); border: 1.5px solid var(--jr-line); transition: border-color 0.15s ease, background-color 0.15s ease; }
.md-jr .md-jr-opt:hover:not(:disabled) { border-color: var(--jr-teal); background: var(--jr-teal-soft); }
.md-jr .md-jr-opt:disabled { cursor: default; }
.md-jr .md-jr-opt[data-res="correct"] { background: var(--jr-ok-soft); border-color: var(--jr-teal); }
.md-jr .md-jr-opt[data-res="wrong"] { background: var(--jr-bad-soft); border-color: var(--jr-bad); }
.md-jr .md-jr-feedback { margin: 0.8rem 0 0; font-size: 0.9rem; line-height: 1.9; font-weight: 700; }
.md-jr .md-jr-feedback[data-ok="true"] { color: var(--jr-teal-deep); }
.md-jr .md-jr-feedback[data-ok="false"] { color: var(--jr-bad); }
.md-jr .md-jr-feedback small { display: block; font-size: 0.84rem; font-weight: 600; color: var(--jr-muted); margin-top: 0.2rem; }
.md-jr .md-jr-essay { width: 100%; padding: 0.7rem 0.8rem; border-radius: 0.95rem; border: 1.5px solid var(--jr-line); background: var(--jr-surface); color: var(--jr-text); font-family: var(--jr-font); font-size: 0.95rem; line-height: 1.8; resize: vertical; }
.md-jr .md-jr-model { margin-top: 0.7rem; padding: 0.8rem 0.9rem; border-radius: 0.95rem; background: var(--jr-ok-soft); border: 1px solid var(--jr-teal); font-size: 0.92rem; line-height: 1.9; }
.md-jr .md-jr-model strong { color: var(--jr-teal-deep); }

/* ---- الخريطة الذهنية (ألوانها inline في المكوّن، فنفرض ألوان الثيم هنا) ---- */
.md-lesson-page .md-jr .md-mm-row { min-height: 44px; padding-block: 0.3rem; background: var(--jr-surface) !important; border-color: var(--jr-line) !important; border-radius: 0.9rem !important; box-shadow: none; transform: none !important; }
.md-lesson-page .md-jr .md-mm-row:hover { background: var(--jr-teal-soft) !important; border-color: var(--jr-teal) !important; transform: none !important; box-shadow: none; }
.md-lesson-page .md-jr .md-mm-row[data-selected="true"] { background: var(--jr-gold-soft) !important; border-color: var(--jr-gold) !important; }
.md-jr .md-mm-label { color: var(--jr-text) !important; line-height: 1.7; }
.md-jr .md-mm-dot[data-root="true"] { background: var(--jr-teal) !important; }
.md-jr .md-mm-dot[data-root="false"] { background: var(--jr-gold) !important; }
.md-jr .md-mm-toggle { width: 44px !important; height: 44px !important; margin-block: -0.3rem; background: transparent !important; color: var(--jr-teal-deep) !important; font-size: 16px !important; border-radius: 999px !important; }
.md-jr .md-mm-toggle:hover { background: var(--jr-teal-soft) !important; }
.md-jr .md-mm-toggle[aria-expanded="true"] { transform: rotate(-90deg) !important; } /* ◂ مفتوحة = تشير لأسفل في RTL */
.md-jr .md-mm-kids { border-color: var(--jr-line) !important; }

/* ---- نافذة الكلمة التفاعلية ---- */
.md-jr .md-hw-pop { background: var(--jr-surface) !important; border: 1.5px solid var(--jr-teal) !important; color: var(--jr-text); box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.5) !important; }
.md-jr .md-hw-head { border-color: var(--jr-line) !important; }
.md-jr .md-hw-name { color: var(--jr-teal-deep) !important; }
.md-jr .md-hw-close { color: var(--jr-muted) !important; min-width: 44px; min-height: 44px; font-size: 1rem; }
.md-jr .md-hw-img { border-color: var(--jr-line) !important; background: var(--jr-bg); }
.md-jr .md-hw-note { color: var(--jr-text) !important; line-height: 1.9; font-size: 0.92rem; }
.md-jr .md-hw-jump { background: var(--jr-btn) !important; min-height: 44px; font-size: 0.88rem; }

/* ---- نص الشرح: ألوان المحرّر الافتراضية (بنفسجي/غامق) تتبع ثيم المنصة ---- */
.md-jr .ts-richtext h1, .md-jr .ts-richtext h2, .md-jr .ts-richtext h3 { color: var(--jr-text); }
.md-jr .ts-richtext blockquote { border-right-color: var(--jr-teal); color: var(--jr-muted); }
.md-jr .ts-richtext a { color: var(--jr-teal); }
.md-jr .ts-richtext th { background: var(--jr-btn); color: #fff; }
.md-jr .ts-richtext tr:nth-child(even) td { background: var(--jr-soft); }
.md-jr .ts-richtext td, .md-jr .ts-richtext th { border-color: var(--jr-line); }
html[data-theme="dark"] .md-jr .ts-richtext-content .ts-hotword-highlight { background-image: linear-gradient(100deg, #8CE0CE 0%, #7CCFBD 45%, #8FC3E0 100%) !important; }
html[data-theme="dark"] .md-jr .ts-richtext-content .ts-hotword-highlight::after { color: #8FC3E0; -webkit-text-fill-color: #8FC3E0; }

/* ---- action bar ---- */
.md-jr .md-jr-bar { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: 0.9rem; max-width: 46rem; margin-inline: auto; pointer-events: none; }
.md-jr .md-jr-bar .md-jr-btn { pointer-events: auto; flex: 0 0 auto; min-height: 36px; min-width: 0; padding: 0.3rem 0.85rem; border-radius: 999px; font-size: 0.82rem; box-shadow: 0 6px 14px -8px rgba(0, 0, 0, 0.45); }
.md-jr .md-jr-bar .md-jr-btn--ghost { background: color-mix(in srgb, var(--jr-surface) 90%, transparent); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.md-jr .md-jr-bar .md-jr-btn--primary { min-height: 36px; font-size: 0.82rem; }
.md-jr .md-jr-bar .md-jr-btn svg { width: 0.9rem; height: 0.9rem; }
@media (max-width: 1023.98px) {
  .md-jr .md-jr-bar { position: sticky; bottom: 0; z-index: 25; max-width: none; margin-inline: 0; padding: 0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom, 0px)); background: transparent; border: 0; }
}
.md-jr .md-jr-btn {
  min-height: 48px; min-width: 44px; padding: 0.55rem 1.1rem; border-radius: 1rem; font-size: 0.98rem; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; border: 1px solid var(--jr-line);
  background: var(--jr-surface); color: var(--jr-teal-deep); transition: transform 0.12s ease, background-color 0.15s ease, border-color 0.15s ease;
}
.md-jr .md-jr-btn svg { width: 1.05rem; height: 1.05rem; flex: none; }
.md-jr .md-jr-btn--ghost { flex: 1 1 0; }
.md-jr .md-jr-btn--ghost:hover:not(:disabled) { border-color: var(--jr-teal); background: var(--jr-teal-soft); }
.md-jr .md-jr-btn--primary { flex: 2 1 0; min-height: 52px; font-size: 1.05rem; background: var(--jr-btn); border-color: var(--jr-btn); color: #fff; }
.md-jr .md-jr-btn--primary:hover:not(:disabled) { background: var(--jr-btn-deep); }
.md-jr .md-jr-btn--done { background: var(--jr-btn-deep); border-color: var(--jr-btn-deep); }
.md-jr .md-jr-btn:active:not(:disabled) { transform: translateY(1px); }
.md-jr .md-jr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.md-jr .md-jr-btn--block { width: 100%; flex: none; }
.md-jr button:focus-visible, .md-jr a:focus-visible, .md-jr [tabindex="-1"]:focus-visible { outline: 2px solid var(--jr-gold); outline-offset: 3px; }
.md-jr .md-jr-main:focus { outline: none; }
/* ---- quiz: gate + score + final quiz ---- */
.md-jr .md-jr-quizcard, .md-jr .md-jr-finalquiz, .md-jr .md-jr-score { scroll-margin-top: 9.5rem; }
.md-jr .md-jr-quizcard[data-nudge="true"] { border-color: var(--jr-gold); box-shadow: 0 0 0 4px var(--jr-gold-soft), var(--jr-shadow); animation: md-jr-nudge 0.55s ease; }
.md-jr .md-jr-finalquiz[data-nudge="true"] { border-radius: 1.2rem; box-shadow: 0 0 0 4px var(--jr-gold-soft); animation: md-jr-nudge 0.55s ease; }
@keyframes md-jr-nudge { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
@keyframes md-jr-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes md-jr-ringfill { from { stroke-dashoffset: var(--c); } }
.md-jr .md-jr-quizhint { margin: 0 0 0.9rem; padding: 0.6rem 0.85rem; border-radius: 0.95rem; font-size: 0.86rem; font-weight: 700; line-height: 1.9; color: var(--jr-text); background: var(--jr-gold-soft); border: 1px dashed var(--jr-gold); }
.md-jr .md-jr-quizhint[data-ok="true"] { background: var(--jr-ok-soft); border: 1px solid var(--jr-teal); color: var(--jr-teal-deep); }
.md-jr .md-jr-best { display: inline-flex; align-items: center; gap: 0.3rem; margin-inline-start: 0.5rem; padding: 0.1rem 0.6rem; border-radius: 999px; font-size: 0.74rem; font-weight: 800; background: var(--jr-gold-soft); color: var(--jr-text); border: 1px solid var(--jr-gold); }
.md-jr .md-jr-qnote { display: block; margin: -0.35rem 0 0.7rem; font-size: 0.78rem; font-weight: 700; color: var(--jr-muted); }
.md-jr .md-jr-gate { display: flex; align-items: flex-start; gap: 0.8rem; margin-top: 0.9rem; padding: 0.9rem 1rem; border-radius: 1.1rem; background: var(--jr-gold-soft); border: 1.5px solid var(--jr-gold); animation: md-jr-rise 0.3s ease both; }
.md-jr .md-jr-gate-ico { flex: none; font-size: 1.6rem; line-height: 1.4; }
.md-jr .md-jr-gate strong { display: block; font-size: 0.98rem; font-weight: 900; color: var(--jr-text); }
.md-jr .md-jr-gate p { margin: 0.15rem 0 0; font-size: 0.88rem; line-height: 1.95; font-weight: 600; color: var(--jr-text); }
.md-jr .md-jr-gate .md-jr-linkbtn { margin-top: 0.1rem; min-height: 40px; padding-inline: 0; }
.md-jr .md-jr-btn[aria-disabled="true"] { opacity: 0.78; }
.md-jr .md-jr-finish { margin-top: 1rem; }
.md-jr .md-jr-finish-note { margin: 0.5rem 0 0; text-align: center; }
.md-jr .md-jr-score { margin-top: 1.1rem; padding: 1.2rem 1rem 1.1rem; border-radius: 1.3rem; text-align: center; background: var(--jr-ok-soft); border: 1.5px solid var(--jr-teal); animation: md-jr-rise 0.45s ease both; }
.md-jr .md-jr-score[data-tier="mid"], .md-jr .md-jr-score[data-tier="low"] { background: var(--jr-gold-soft); border-color: var(--jr-gold); }
.md-jr .md-jr-score:focus { outline: none; }
.md-jr .md-jr-score-kicker { margin: 0; font-size: 0.82rem; font-weight: 900; color: var(--jr-muted); }
.md-jr .md-jr-ringwrap { position: relative; width: 8.2rem; height: 8.2rem; margin: 0.6rem auto 0.3rem; }
.md-jr .md-jr-ring { display: block; width: 100%; height: 100%; }
.md-jr .md-jr-ring-bg { fill: none; stroke: var(--jr-line); stroke-width: 10; }
.md-jr .md-jr-ring-fg { fill: none; stroke: var(--jr-teal); stroke-width: 10; stroke-linecap: round; animation: md-jr-ringfill 0.9s ease-out both; }
.md-jr .md-jr-score[data-tier="mid"] .md-jr-ring-fg, .md-jr .md-jr-score[data-tier="low"] .md-jr-ring-fg { stroke: var(--jr-gold); }
.md-jr .md-jr-ring-pct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.9rem; font-weight: 900; color: var(--jr-text); direction: ltr; unicode-bidi: isolate; }
.md-jr .md-jr-score-title { margin: 0.2rem 0 0; font-size: 1.25rem; font-weight: 900; color: var(--jr-text); }
.md-jr .md-jr-score-msg { margin: 0.3rem auto 0; max-width: 30rem; font-size: 0.92rem; line-height: 1.95; font-weight: 600; color: var(--jr-muted); }
.md-jr .md-jr-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 0.85rem; }
.md-jr .md-jr-stat { padding: 0.3rem 0.85rem; border-radius: 999px; font-size: 0.82rem; font-weight: 800; background: var(--jr-surface); border: 1px solid var(--jr-line); color: var(--jr-text); }
.md-jr .md-jr-stat b { margin-inline-end: 0.3rem; font-size: 1rem; font-weight: 900; }
.md-jr .md-jr-stat[data-kind="ok"] { border-color: var(--jr-teal); color: var(--jr-teal-deep); }
.md-jr .md-jr-stat[data-kind="bad"] { border-color: var(--jr-bad); color: var(--jr-bad); }
.md-jr .md-jr-score-best { margin: 0.8rem 0 0; font-size: 0.84rem; font-weight: 700; color: var(--jr-muted); }
.md-jr .md-jr-score-best b { color: var(--jr-text); }
.md-jr .md-jr-score-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem; margin-top: 1rem; }
.md-jr .md-jr-score-actions .md-jr-btn { flex: none; }
.md-jr .md-jr-bd-head { margin: 1.1rem 0 0.5rem; font-size: 0.82rem; font-weight: 900; color: var(--jr-muted); text-align: right; }
.md-jr .md-jr-bd { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.5rem; text-align: right; }
.md-jr .md-jr-bd li { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0.25rem 0.7rem; padding: 0.6rem 0.8rem; border-radius: 0.95rem; background: var(--jr-surface); border: 1px solid var(--jr-line); }
.md-jr .md-jr-bd li[data-low="true"] { border-color: var(--jr-gold); }
.md-jr .md-jr-bd-title { min-width: 0; font-size: 0.88rem; font-weight: 800; line-height: 1.7; color: var(--jr-text); }
.md-jr .md-jr-bd-pct { font-size: 0.8rem; font-weight: 900; color: var(--jr-teal-deep); white-space: nowrap; }
.md-jr .md-jr-bd-bar { grid-column: 1 / -1; height: 6px; border-radius: 999px; background: var(--jr-line); overflow: hidden; }
.md-jr .md-jr-bd-bar i { display: block; height: 100%; border-radius: 999px; background: var(--jr-teal); }
.md-jr .md-jr-bd li[data-low="true"] .md-jr-bd-bar i { background: var(--jr-gold); }
.md-jr .md-jr-bd .md-jr-linkbtn { grid-column: 1 / -1; justify-self: start; margin-top: 0; min-height: 36px; padding: 0; font-size: 0.8rem; }
.md-jr .md-jr-donescore { margin: -0.4rem 0 1rem; font-size: 0.9rem; font-weight: 800; color: var(--jr-text); }
.md-jr .md-jr-donescore b { color: var(--jr-teal-deep); }
/* ---- ترتيب وتنسيق الدرس: هيرو مضغوط + فيديو مرتب + خطوات واضحة + شريط إجراءات ثابت ---- */
.md-jr .md-jr-hero { padding: clamp(0.9rem, 3vw, 1.35rem); border-radius: 1.3rem; }
.md-jr .md-jr-h1 { margin-top: 0.5rem; font-size: clamp(1.25rem, 3.8vw, 1.75rem); line-height: 1.5; }
.md-jr .md-jr-desc { margin-top: 0.35rem; font-size: 0.88rem; line-height: 1.8; }
.md-jr .md-jr-hero-actions .md-lv-actions { margin-top: 0.7rem; gap: 8px; }
.md-jr .md-jr-hero-actions .md-lv-act { min-height: 0; padding: 0.4rem 1rem; font-size: 0.84rem; }
.md-jr .md-jr-hero-actions .md-lv-act svg { width: 17px; height: 17px; }
.md-jr .md-jr-video-head { padding: 0.65rem 1rem 0.5rem; }
.md-jr .md-jr-video-title { font-size: 0.95rem; }
.md-jr .md-jr-video-head .md-jr-tool { min-height: 38px; padding: 0.25rem 0.8rem; font-size: 0.8rem; flex: none; }
.md-jr .md-jr-video-note { margin: 0; padding: 0 1rem 0.6rem; font-size: 0.82rem; line-height: 1.85; font-weight: 600; color: var(--jr-muted); }
.md-jr .md-jr-video-body .md-jr-frame { max-width: 38rem; margin-inline: auto; }
.md-jr .md-jr-stepno { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 1.45rem; height: 1.45rem; border-radius: 999px; background: var(--jr-teal-soft); color: var(--jr-teal-deep); border: 1px solid var(--jr-teal); font-size: 0.74rem; font-weight: 900; line-height: 1; }
.md-jr .md-jr-eyebrow--n::before { display: none; }
.md-jr .md-jr-steps { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: -0.2rem 0 0.9rem; }
.md-jr .md-jr-step { flex: none; display: inline-flex; align-items: center; gap: 0.4rem; min-height: 36px; padding: 0.15rem 0.75rem 0.15rem 0.6rem; border-radius: 999px; border: 1px solid var(--jr-line); background: var(--jr-surface); color: var(--jr-teal-deep); font-size: 0.8rem; font-weight: 800; transition: border-color 0.15s ease, background-color 0.15s ease; }
.md-jr .md-jr-step:hover { border-color: var(--jr-teal); background: var(--jr-teal-soft); }
.md-jr [id^="md-jr-sec-"] { scroll-margin-top: 9.5rem; }
.md-jr .md-jr-recall-head strong { display: inline-flex; align-items: center; gap: 0.5rem; }
@media (max-width: 1023.98px) {
  .md-jr .md-jr-bar { margin-inline: calc(var(--jr-pad) * -1); padding: 0.55rem var(--jr-pad) calc(0.55rem + env(safe-area-inset-bottom, 0px)); background: color-mix(in srgb, var(--jr-bg) 94%, transparent); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border-top: 1px solid var(--jr-line); pointer-events: auto; }
  .md-jr .md-jr-bar .md-jr-btn { min-height: 44px; font-size: 0.92rem; box-shadow: none; }
  .md-jr .md-jr-bar .md-jr-btn--primary { flex: 1 1 auto; }
  .md-jr .md-jr-bar .md-jr-btn--ghost { flex: 0 0 auto; background: var(--jr-surface); }
}
@media (prefers-reduced-motion: reduce) {
  .md-jr *, .md-jr *::before, .md-jr *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
}
`;

function JrIcon({ name }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" };
  if (name === "prev") return <svg {...common}><path d="M9 6l6 6-6 6" /></svg>; // يمين = السابق في RTL
  if (name === "next") return <svg {...common}><path d="M15 6l-6 6 6 6" /></svg>; // يسار = التالي في RTL
  if (name === "check") return <svg {...common}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
  if (name === "down") return <svg {...common}><path d="M6 9l6 6 6-6" /></svg>;
  if (name === "play") return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" /></svg>;
  return null;
}

function JrVideo({ videoId, lessonId }) {
  const storageKey = `madar_lesson_video_seen_v1:${lessonId || ""}`;
  const [seen, setSeen] = useState(() => {
    try { return localStorage.getItem(storageKey) === "1"; } catch { return false; }
  });
  const [open, setOpen] = useState(!seen); // مفتوح أول مرة، مطوي بعد المشاهدة
  const [playing, setPlaying] = useState(false);
  if (!videoId) return null;
  const bodyId = `md-jr-video-body-${videoId}`;
  const start = () => {
    setPlaying(true);
    setSeen(true);
    try { localStorage.setItem(storageKey, "1"); } catch { /* التخزين غير متاح */ }
  };
  return (
    <section className="md-jr-video" aria-label="فيديو الشرح العام">
      <div className="md-jr-video-head">
        <h2 className="md-jr-video-title">🎥 شاهد فيديو الدرس</h2>
        <button
          type="button"
          className="md-jr-tool"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => { setOpen((v) => !v); if (open) setPlaying(false); }}
        >
          {open ? "طيّ الفيديو" : seen ? "إعادة المشاهدة" : "عرض الفيديو"}
          <JrIcon name="down" />
        </button>
      </div>
      {open ? <p className="md-jr-video-note">تابع الشرح خطوة بخطوة وركّز في ترتيب الأفكار والأمثلة. خُد وقتك في الفهم قبل الانتقال للجزء التالي، لأن الفيديو هو بداية رحلتك لفهم الدرس بشكل كامل.</p> : null}
      {open ? (
        <div className="md-jr-video-body" id={bodyId}>
          <div className="md-jr-frame">
            {!playing ? (
              <>
                <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading="lazy" />
                <button type="button" className="md-jr-playbtn" onClick={start} aria-label="تشغيل فيديو الدرس">
                  <span><JrIcon name="play" /></span>
                </button>
              </>
            ) : (
              <iframe
                title="فيديو الدرس"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** تذكّر سريع: بطاقة مطوية، كل نقطة تنكشف بالضغط بعد ما الطالب يفكّر. */
/** عنوان قسم داخل العنوان الحالي، برقم الخطوة لو في أكتر من قسم. */
function JrEyebrow({ no = 0, as: Tag = "h3", children }) {
  return (
    <Tag className={`md-jr-eyebrow${no ? " md-jr-eyebrow--n" : ""}`}>
      {no ? <span className="md-jr-stepno" aria-hidden="true">{no}</span> : null}
      {children}
    </Tag>
  );
}

function JrRecall({ items, id, no = 0 }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState({});
  const allShown = items.length > 0 && items.every((_, i) => shown[i]);
  return (
    <section className="md-jr-card md-jr-recall quick-recall-hidden" aria-label="تذكّر سريع" id={id}>
      <button type="button" className="md-jr-recall-head" aria-expanded={open} aria-controls="md-jr-recall-body" onClick={() => setOpen((v) => !v)}>
        <span>
          <strong>{no ? <span className="md-jr-stepno" aria-hidden="true">{no}</span> : null}🧠 تذكّر سريع ({items.length})</strong>
          <span className="md-jr-hint">فكّر الأول في كل نقطة، وبعدها اضغط عليها عشان تتأكد.</span>
        </span>
        <JrIcon name="down" />
      </button>
      {open && (
        <div id="md-jr-recall-body">
          <ol className="md-jr-recall-list">
            {items.map((item, i) => (
              <li key={`jr-recall-${i}`}>
                <button type="button" className="md-jr-recall-item" aria-expanded={!!shown[i]} onClick={() => setShown((m) => ({ ...m, [i]: true }))}>
                  <span className="md-jr-n" aria-hidden="true">{i + 1}</span>
                  {shown[i] ? <span>{item}</span> : <span className="md-jr-cover">نقطة {i + 1} — اضغط لإظهارها بعد ما تفكّر</span>}
                </button>
              </li>
            ))}
          </ol>
          {!allShown && (
            <button type="button" className="md-jr-linkbtn" onClick={() => setShown(Object.fromEntries(items.map((_, i) => [i, true])))}>
              إظهار الكل
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/** سؤال داخل العنوان: تغذية راجعة فورية عند اختيار الإجابة + إبلاغ الأب بأنه أُجيب. */
// ---------------------------------------------------------------------------
// Quiz helpers — الدرجات والنسب (واجهة الطالب فقط)
// ---------------------------------------------------------------------------
/** أقل عدد أسئلة لازم الطالب يجاوبها في العنوان قبل ما يقدر يضغط «أكمل العنوان». */
const JR_MIN_ANSWERS = 1;

/** سؤال يُحتسب في الدرجة = اختيار من متعدد له إجابة صحيحة محددة. الأسئلة المقالية للتدريب فقط. */
const jrIsGraded = (q) =>
  !!q && q.type === "mcq" && Number.isInteger(q.correctIndex) && Array.isArray(q.options) && q.options.length > 0;

function jrTier(pct) {
  if (pct >= 90) return { tier: "high", emoji: "🏆", title: "ممتاز", msg: "أنت متمكّن من هذا الجزء. استمر على نفس المستوى!" };
  if (pct >= 75) return { tier: "high", emoji: "🌟", title: "جيد جدًا", msg: "نتيجة رائعة! راجع ما أخطأت فيه لتصل إلى الدرجة الكاملة." };
  if (pct >= 50) return { tier: "mid", emoji: "👍", title: "جيد", msg: "أنت في الطريق الصحيح. راجع الشرح ثم أعد المحاولة لتثبّت المعلومات أكثر." };
  return { tier: "low", emoji: "📚", title: "تحتاج إلى مراجعة", msg: "لا بأس! ارجع إلى الشرح ثم أعد المحاولة — التكرار هو ما يصنع الفهم." };
}

function jrRemaining(n) {
  if (n === 1) return "تبقّى سؤال واحد";
  if (n === 2) return "تبقّى سؤالان";
  if (n >= 3 && n <= 10) return `تبقّى ${n} أسئلة`;
  return `تبقّى ${n} سؤالًا`;
}

function jrScrollTo(el, block = "center") {
  if (!el || typeof el.scrollIntoView !== "function") return;
  const reduce = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block });
}

/** بطاقة النتيجة: دائرة النسبة + الصحيح/الخطأ + أفضل نتيجة + (اختياري) تفصيل كل عنوان + إعادة المحاولة. */
function JrScoreCard({ variant = "scene", correct, total, best, attempts, onRetry, breakdown, onReviewTitle, cardRef }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const info = jrTier(pct);
  const wrong = Math.max(0, total - correct);
  const R = 52;
  const C = 2 * Math.PI * R;
  const bestPct = best && Number.isFinite(best.pct) ? best.pct : null;
  const showBest = bestPct !== null && Number(attempts) > 1;
  return (
    <div className="md-jr-score" data-tier={info.tier} data-variant={variant} ref={cardRef} role="status" aria-live="polite" tabIndex={-1}>
      <p className="md-jr-score-kicker">{variant === "final" ? "نتيجة الاختبار النهائي" : "نتيجتك في هذا العنوان"}</p>
      <div className="md-jr-ringwrap">
        <svg viewBox="0 0 120 120" className="md-jr-ring" aria-hidden="true" focusable="false">
          <circle className="md-jr-ring-bg" cx="60" cy="60" r={R} />
          <circle
            className="md-jr-ring-fg" cx="60" cy="60" r={R} transform="rotate(-90 60 60)"
            style={{ strokeDasharray: C, strokeDashoffset: C * (1 - pct / 100), "--c": C }}
          />
        </svg>
        <span className="md-jr-ring-pct">{pct}%</span>
      </div>
      <h4 className="md-jr-score-title"><span aria-hidden="true">{info.emoji}</span> {info.title}</h4>
      <p className="md-jr-score-msg">{info.msg}</p>
      <div className="md-jr-stats">
        <span className="md-jr-stat" data-kind="ok"><b>{correct}</b>صحيحة</span>
        <span className="md-jr-stat" data-kind="bad"><b>{wrong}</b>خاطئة</span>
        <span className="md-jr-stat"><b>{total}</b>إجمالي الأسئلة</span>
      </div>
      {showBest ? <p className="md-jr-score-best">أفضل نتيجة لك: <b><bdi>{bestPct}%</bdi></b> · المحاولة رقم <bdi>{attempts}</bdi></p> : null}
      {breakdown && breakdown.length > 1 ? (
        <>
          <p className="md-jr-bd-head">نتيجتك في كل عنوان</p>
          <ul className="md-jr-bd">
            {breakdown.map((b) => (
              <li key={b.key} data-low={b.pct < 60 ? "true" : undefined}>
                <span className="md-jr-bd-title">{b.title}</span>
                <span className="md-jr-bd-pct"><bdi>{b.correct}/{b.total}</bdi> · <bdi>{b.pct}%</bdi></span>
                <span className="md-jr-bd-bar" aria-hidden="true"><i style={{ width: `${b.pct}%` }} /></span>
                {b.pct < 100 && onReviewTitle ? (
                  <button type="button" className="md-jr-linkbtn" onClick={() => onReviewTitle(b.idx)}>راجع هذا العنوان ↗</button>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <div className="md-jr-score-actions">
        <button type="button" className={`md-jr-btn ${pct < 100 ? "md-jr-btn--primary" : "md-jr-btn--ghost"}`} onClick={onRetry}>
          🔄 إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

/** رسالة التنبيه اللطيفة لما الطالب يحاول يكمل من غير ما يحل الأسئلة. */
function JrGate({ kind, onGo }) {
  const isFinal = kind === "final";
  return (
    <div className="md-jr-gate" role="alert">
      <span className="md-jr-gate-ico" aria-hidden="true">{isFinal ? "🏁" : "📝"}</span>
      <div>
        <strong>{isFinal ? "أنهِ الاختبار النهائي أولًا" : "راجع الأسئلة الموجودة في هذا العنوان أولًا"}</strong>
        <p>
          {isFinal
            ? "أجب عن الأسئلة ثم اضغط «أنهِ الاختبار واعرض نتيجتي» لتكمل الدرس."
            : "حلّ ولو سؤالًا واحدًا على الأقل قبل الانتقال للجزء التالي — فحلّ الأسئلة هو ما يثبّت المعلومة في ذاكرتك أكثر."}
        </p>
        <button type="button" className="md-jr-linkbtn" onClick={onGo}>انتقل إلى الأسئلة ↓</button>
      </div>
    </div>
  );
}

/** ملخص الدرجات في إشعار إكمال الدرس: مجموع أفضل نتائج العناوين + أفضل نتيجة في الاختبار النهائي. */
function JrDoneScore({ quiz }) {
  let c = 0;
  let t = 0;
  for (const x of Object.values((quiz && quiz.scenes) || {})) {
    if (x && x.best && x.best.total > 0) { c += x.best.correct; t += x.best.total; }
  }
  const f = quiz && quiz.final;
  const finalPct = f && f.best && Number.isFinite(f.best.pct) ? f.best.pct : null;
  if (t === 0 && finalPct === null) return null;
  return (
    <>
      {t > 0 ? (
        <p className="md-jr-donescore">📊 أفضل نتائجك في أسئلة العناوين: <b><bdi>{c} من {t}</bdi></b> (<bdi>{Math.round((c / t) * 100)}%</bdi>)</p>
      ) : null}
      {finalPct !== null ? (
        <p className="md-jr-donescore">🏅 أفضل نتيجة لك في الاختبار النهائي: <b><bdi>{finalPct}%</bdi></b></p>
      ) : null}
    </>
  );
}

function JrQuestion({ q, onAnswered, scored = false }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [essay, setEssay] = useState("");
  const isMcq = q.type === "mcq";
  const graded = jrIsGraded(q);
  const answered = isMcq ? picked !== null : revealed;
  const pick = (i) => { if (picked !== null) return; setPicked(i); onAnswered?.({ graded, correct: graded && i === q.correctIndex }); };
  const reveal = () => { if (revealed) return; setRevealed(true); onAnswered?.({ graded: false, correct: false }); };
  return (
    <div className="md-jr-q">
      <div className="md-jr-qtop">
        <p className="md-jr-qprompt">{q.prompt}</p>
        <span className="md-jr-qtag" data-done={answered ? "true" : "false"}>{answered ? "تمت الإجابة" : "لم تُجب بعد"}</span>
      </div>
      {scored && !graded ? <span className="md-jr-qnote">سؤال تدريبي — لا يدخل في الدرجة</span> : null}
      {isMcq ? (
        <>
          <div className="md-jr-opts" role="group" aria-label="الاختيارات">
            {q.options?.map((opt, i) => {
              const res = picked === null ? undefined : i === q.correctIndex ? "correct" : i === picked ? "wrong" : undefined;
              return (
                <button type="button" key={`jr-opt-${i}`} className="md-jr-opt" data-res={res} disabled={picked !== null} aria-pressed={picked === i} onClick={() => pick(i)}>
                  {opt}{res === "correct" ? " ✓" : ""}
                </button>
              );
            })}
          </div>
          <div aria-live="polite">
            {picked !== null && (
              <p className="md-jr-feedback" data-ok={picked === q.correctIndex ? "true" : "false"}>
                {picked === q.correctIndex ? "إجابة صحيحة بارك الله فيك!" : `إجابة غير دقيقة. الإجابة الصحيحة هي: ${q.options?.[q.correctIndex] ?? ""}`}
                {q.explanation ? <small>💡 {q.explanation}</small> : null}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <textarea className="md-jr-essay" rows={3} value={essay} onChange={(e) => setEssay(e.target.value)} placeholder="اكتب إجابتك هنا..." aria-label="إجابتك" />
          {!revealed ? (
            <button type="button" className="md-jr-btn md-jr-btn--primary" style={{ flex: "none", minHeight: 44, marginTop: "0.6rem", fontSize: "0.9rem" }} onClick={reveal}>
              عرض الإجابة النموذجية
            </button>
          ) : (
            <div className="md-jr-model" aria-live="polite"><strong>الإجابة النموذجية:</strong><div>{q.modelAnswer}</div></div>
          )}
        </>
      )}
    </div>
  );
}

/** المراجعة النهائية المجمّعة — نفس المحتوى القديم (خريطة + خط زمني + أسئلة) بشكل متسق. */
function JrAggregatedReview({ fullMindMap, fullTimeline, fullQuestions, selectedMindNode, setSelectedMindNode, quiz }) {
  const hasMap = !!(fullMindMap && fullMindMap.label);
  const hasTl = Array.isArray(fullTimeline) && fullTimeline.length > 0;
  const hasQs = Array.isArray(fullQuestions) && fullQuestions.length > 0;
  const q = quiz || null;
  const scored = !!(q && q.scored);
  return (
    <div data-kind="review" className="md-jr-card">
      <h3 className="md-jr-eyebrow">المراجعة النهائية</h3>
      <p className="md-jr-muted" style={{ margin: "0 0 1rem" }}>ملخص من كل مشاهد الدرس: خريطة ذهنية وخط زمني وأسئلة.</p>
      {hasMap && (
        <div style={{ marginBottom: "1.4rem" }}>
          <p className="md-jr-eyebrow">🗺️ الخريطة الذهنية الكاملة</p>
          <MindMapViewerNode node={fullMindMap} onSelectNode={(node) => setSelectedMindNode(node)} selectedNodeId={selectedMindNode?.id} />
        </div>
      )}
      {hasTl && (
        <div style={{ marginBottom: "1.4rem" }}>
          <p className="md-jr-eyebrow">🕒 الخط الزمني الكامل</p>
          <TimelineView items={fullTimeline} showSceneTitle />
        </div>
      )}
      {hasQs && (
        <div className="md-jr-finalquiz" ref={q ? q.quizRef : undefined} data-nudge={q && q.nudge ? "true" : undefined}>
          <div className="md-jr-quizhead">
            <p className="md-jr-eyebrow">❓ {scored ? "الاختبار النهائي" : "أسئلة المراجعة"}</p>
            {q ? <span className="md-jr-count" aria-live="polite">أجبت عن {q.answeredCount} من {fullQuestions.length}</span> : null}
          </div>
          {scored && !q.showResult ? (
            <p className="md-jr-quizhint">أجب عن الأسئلة ثم اضغط «أنهِ الاختبار» لتعرف نتيجتك ونسبتك المئوية.</p>
          ) : null}
          <div>
            {fullQuestions.map((qq, idx) => (
              <JrQuestion
                key={`${q ? q.keyOf(qq) : `jr-fq-${idx}`}:${q ? q.run : 0}`}
                q={qq}
                scored={scored}
                onAnswered={(info) => q?.onAnswered(qq, info)}
              />
            ))}
          </div>
          {scored ? (
            q.showResult ? (
              <JrScoreCard
                variant="final"
                correct={q.correct}
                total={q.gradedTotal}
                best={q.saved?.best}
                attempts={q.saved?.attempts}
                breakdown={q.breakdown}
                onReviewTitle={q.onReviewTitle}
                onRetry={q.onRetry}
                cardRef={q.scoreRef}
              />
            ) : (
              <div className="md-jr-finish">
                <button type="button" className="md-jr-btn md-jr-btn--primary md-jr-btn--block" disabled={!q.allGradedDone} onClick={q.onFinish}>
                  🏁 أنهِ الاختبار واعرض نتيجتي
                </button>
                {!q.allGradedDone ? (
                  <p className="md-jr-muted md-jr-finish-note">{jrRemaining(q.gradedTotal - q.gradedDone)} من الاختيار من متعدد لتعرض نتيجتك.</p>
                ) : null}
              </div>
            )
          ) : null}
        </div>
      )}
      {!hasMap && !hasTl && !hasQs && (
        <p className="md-jr-muted">لا توجد عناصر مراجعة مجمّعة بعد — أضف محتوى في المشاهد من الاستوديو.</p>
      )}
    </div>
  );
}

function JourneyLesson({ ctx }) {
  const {
    lesson, journey, scene, sceneIndex, sceneCount, isFinalReview, isCompletionStep, isLessonDone, isFinalReviewScene,
    sceneContentLocked, showAggregatedReviewFlow, youtubeId, quickRecallItems, isQuickRecallVisible,
    fullMindMap, fullTimeline, fullQuestions, selectedMindNode, setSelectedMindNode,
    tryOpenScene, isSceneCompleted, isSceneUnlocked, setActiveIndex, setAuthOpen, authOpts, heroExtra,
  } = ctx;

  const rootRef = useRef(null);
  const navRef = useRef(null);
  const chipsRef = useRef(null);
  const sideListRef = useRef(null);
  const mainRef = useRef(null);
  const [tool, setTool] = useState(null); // null | "mindmap" | "timeline"
  const [answered, setAnswered] = useState({}); // { "<sceneKey>|<qk>": { graded, correct } } — إجابات العنوان الحالي
  const [qRun, setQRun] = useState(0); // رقم المحاولة (إعادة المحاولة تعيد بناء الأسئلة)
  const [fAnswers, setFAnswers] = useState({}); // إجابات الاختبار النهائي
  const [fRun, setFRun] = useState(0);
  const [fShow, setFShow] = useState(false); // نتيجة الاختبار النهائي ظاهرة
  const [gate, setGate] = useState(null); // null | "scene" | "final" — رسالة «راجع الأسئلة أولًا»
  const [nudge, setNudge] = useState(false);
  const quizRef = useRef(null);
  const fQuizRef = useRef(null);
  const sceneScoreRef = useRef(null);
  const finalScoreRef = useRef(null);
  const recordedRef = useRef(new Set());
  const nudgeTimer = useRef(null);
  const [navOpen, setNavOpen] = useState(false); // قائمة العناوين المنسدلة (موبايل)

  const completedList = Array.isArray(journey.completedScenes) ? journey.completedScenes : [];
  const doneCount = completedList.length;
  const pct = sceneCount > 0 ? Math.round((doneCount / sceneCount) * 100) : 0;
  const finalOpenable = !!journey.finalReviewUnlocked || doneCount >= sceneCount;

  // ارتفاع الهيدر العلوي (لاصق) → المتغير --jr-top حتى يلصق شريط العناوين تحته مباشرة
  useEffect(() => {
    const bar = document.querySelector(".md-lv-topbar");
    const root = rootRef.current;
    if (!bar || !root) return undefined;
    const set = () => root.style.setProperty("--jr-top", `${bar.offsetHeight}px`);
    set();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
    ro?.observe(bar);
    window.addEventListener("resize", set);
    return () => { ro?.disconnect(); window.removeEventListener("resize", set); };
  }, []);

  // عند تغيير العنوان: نصفّر الأدوات ونرجع لأول المحتوى (بدون حركة لو الطالب مقلّل الحركة)
  const firstRun = useRef(true);
  useEffect(() => {
    setTool(null);
    setAnswered({});
    setFAnswers({});
    setFShow(false);
    setGate(null);
    recordedRef.current = new Set();
    if (firstRun.current) { firstRun.current = false; return; }
    const el = mainRef.current;
    if (!el) return;
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offset = (parseFloat(rootRef.current?.style.getPropertyValue("--jr-top")) || 0) + (navRef.current?.offsetHeight || 0) + 8;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  }, [sceneIndex, isFinalReview, journey.view, lesson?.id]);

  const kindOf = (s, i) => getSceneLockKind(s, i, { ...authOpts, isTeacherView: false, hasJourney: true, journey });
  const stateOf = (kind, current) =>
    kind === "COMPLETED" ? "done" : current ? "current" : kind === "ACCESS_LOCK" ? "access" : kind === "SEQUENCE_LOCK" ? "sequence" : "available";

  const items = lesson.scenes.map((s, i) => {
    const kind = kindOf(s, i);
    const current = !isFinalReview && !isCompletionStep && i === sceneIndex && kind !== "SEQUENCE_LOCK" && kind !== "ACCESS_LOCK";
    const info = sceneLockLabel(kind);
    const state = stateOf(kind, current);
    const mark = kind === "COMPLETED" ? "✓" : kind === "ACCESS_LOCK" ? "🔐" : kind === "SEQUENCE_LOCK" ? "🔒" : String(i + 1);
    return { s, i, kind, current, state, mark, disabled: kind === "SEQUENCE_LOCK", label: `العنوان ${i + 1}: ${s.title || ""} — ${current ? "الحالي" : info.message}` };
  });
  const reviewItem = showAggregatedReviewFlow
    ? { i: sceneCount, current: isFinalReview, state: isFinalReview ? "current" : finalOpenable ? "available" : "sequence", mark: finalOpenable ? "🧠" : "🔒", disabled: !finalOpenable, label: finalOpenable ? "المراجعة النهائية" : "المراجعة النهائية — أكمل كل العناوين أولًا" }
    : null;

  const navLabel = isLessonDone ? "🎉 تم إكمال الدرس" : isFinalReview ? "المراجعة النهائية" : isCompletionStep ? "أحسنت!" : `العنوان ${sceneIndex + 1} من ${sceneCount}`;

  // ---- scene content flags ----
  const hasText = !!(scene && scene.text && String(scene.text).replace(/<[^>]+>/g, "").trim());
  const hasMind = !!(scene && !isFinalReviewScene && scene.mindmap && scene.mindmap.label);
  const hasTimeline = !!(scene && !isFinalReviewScene && Array.isArray(scene.timeline) && scene.timeline.length > 0);
  const hasQuestions = !!(scene && !isFinalReviewScene && Array.isArray(scene.questions) && scene.questions.length > 0);
  const showRecall = !!(scene && isQuickRecallVisible && quickRecallItems.length > 0);
  const completed = scene ? isSceneCompleted(sceneIndex) : false;

  // ---- أسئلة العنوان الحالي: إجابات، درجة، وشرط الانتقال ----
  const sceneKey = scene ? String(scene.id ?? sceneIndex) : `idx-${sceneIndex}`;
  const sceneQs = hasQuestions ? scene.questions : [];
  const sceneInfos = sceneQs.map((q, idx) => {
    const key = `${sceneKey}|${q.id || `jr-q-${idx}`}`;
    return { q, idx, key, info: answered[key] };
  });
  const answeredCount = sceneInfos.filter((x) => x.info).length;
  const gradedTotal = sceneQs.filter(jrIsGraded).length;
  const gradedDone = sceneInfos.filter((x) => x.info && x.info.graded).length;
  const gradedCorrect = sceneInfos.filter((x) => x.info && x.info.graded && x.info.correct).length;
  const sceneResultReady = gradedTotal > 0 && gradedDone === gradedTotal;
  const minNeeded = Math.min(JR_MIN_ANSWERS, sceneQs.length);
  const sceneGateBlocked = hasQuestions && !completed && answeredCount < minNeeded;
  const savedScene = scene && scene.id != null ? journey.quiz?.scenes?.[String(scene.id)] || null : null;

  // ---- الاختبار النهائي (أسئلة كل العناوين) ----
  const fQs = Array.isArray(fullQuestions) ? fullQuestions : [];
  const fKey = (q) => `final|${q.id || `${q.prompt}|${q.type}`}`;
  const fInfos = fQs.map((q) => ({ q, key: fKey(q), info: fAnswers[fKey(q)] }));
  const fAnsweredCount = fInfos.filter((x) => x.info).length;
  const fGradedTotal = fQs.filter(jrIsGraded).length;
  const fGradedDone = fInfos.filter((x) => x.info && x.info.graded).length;
  const fCorrect = fInfos.filter((x) => x.info && x.info.graded && x.info.correct).length;
  const fAllGradedDone = fGradedTotal > 0 && fGradedDone === fGradedTotal;
  const savedFinal = journey.quiz?.final || null;
  const finalSubmitted = fShow || !!savedFinal; // أنهى الاختبار الآن أو في جلسة سابقة
  const finalGateBlocked = fGradedTotal > 0 && !finalSubmitted;
  const fBreakdown = fShow
    ? lesson.scenes
        .map((sc, idx) => {
          let c = 0;
          let t = 0;
          for (const q of sc.questions || []) {
            if (!jrIsGraded(q)) continue;
            const inf = fAnswers[fKey(q)];
            if (!inf) continue;
            t += 1;
            if (inf.correct) c += 1;
          }
          if (!t) return null;
          return { key: sc.id || `bd-${idx}`, idx, title: sc.title || `العنوان ${idx + 1}`, correct: c, total: t, pct: Math.round((c / t) * 100) };
        })
        .filter(Boolean)
    : [];

  // ---- تسجيل درجة العنوان مرة واحدة لكل محاولة ----
  const recordSceneScore = journey.recordSceneScore;
  useEffect(() => {
    if (!sceneResultReady || !scene || scene.id == null) return;
    const k = `${sceneKey}:${qRun}`;
    if (recordedRef.current.has(k)) return;
    recordedRef.current.add(k);
    recordSceneScore?.(scene.id, { correct: gradedCorrect, total: gradedTotal });
  }, [sceneResultReady, gradedCorrect, gradedTotal, sceneKey, qRun, scene, recordSceneScore]);

  // لما تظهر النتيجة نتأكد إنها داخل الشاشة
  useEffect(() => { if (sceneResultReady) jrScrollTo(sceneScoreRef.current, "nearest"); }, [sceneResultReady, qRun]);
  useEffect(() => { if (fShow) jrScrollTo(finalScoreRef.current, "start"); }, [fShow, fRun]);

  // الرسالة تختفي أول ما الشرط يتحقق
  useEffect(() => {
    if (gate === "scene" && !sceneGateBlocked) setGate(null);
    if (gate === "final" && !finalGateBlocked) setGate(null);
  }, [gate, sceneGateBlocked, finalGateBlocked]);
  useEffect(() => () => { if (nudgeTimer.current) clearTimeout(nudgeTimer.current); }, []);

  const pulseQuiz = () => {
    setNudge(true);
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => setNudge(false), 1100);
  };
  const blockWith = (kind) => {
    setGate(kind);
    pulseQuiz();
    jrScrollTo(kind === "final" ? fQuizRef.current : quizRef.current, "start");
  };

  const retryScene = () => {
    setAnswered((m) => {
      const n = { ...m };
      for (const x of sceneInfos) delete n[x.key];
      return n;
    });
    setQRun((r) => r + 1);
    jrScrollTo(quizRef.current, "start");
  };
  const retryFinal = () => {
    setFAnswers({});
    setFShow(false);
    setFRun((r) => r + 1);
    jrScrollTo(fQuizRef.current, "start");
  };

  const finalQuiz = {
    questions: fQs,
    scored: fGradedTotal > 0,
    keyOf: fKey,
    run: fRun,
    nudge,
    quizRef: fQuizRef,
    scoreRef: finalScoreRef,
    answeredCount: fAnsweredCount,
    gradedTotal: fGradedTotal,
    gradedDone: fGradedDone,
    allGradedDone: fAllGradedDone,
    correct: fCorrect,
    showResult: fShow,
    saved: savedFinal,
    breakdown: fBreakdown,
    onAnswered: (q, info) => setFAnswers((m) => { const k = fKey(q); return m[k] ? m : { ...m, [k]: info }; }),
    onFinish: () => {
      if (!fAllGradedDone) return;
      setFShow(true);
      setGate(null);
      journey.recordFinalScore?.({ correct: fCorrect, total: fGradedTotal });
    },
    onRetry: retryFinal,
    onReviewTitle: (idx) => tryOpenScene(idx),
  };

  // ---- action bar handlers (نفس منطق الأزرار القديمة بالحرف) ----
  const onComplete = () => {
    if (completed) {
      if (sceneIndex + 1 < sceneCount) tryOpenScene(sceneIndex + 1);
      else if (showAggregatedReviewFlow) tryOpenScene(sceneCount);
      return;
    }
    // لازم يحلّ ولو سؤال لو في أسئلة على العنوان
    if (sceneGateBlocked) { blockWith("scene"); return; }
    // مشهد «المراجعة النهائية»: لازم ينهي الاختبار ويشوف نتيجته
    if (isFinalReviewScene && finalGateBlocked) { blockWith("final"); return; }
    journey.completeScene?.(sceneIndex);
  };
  const onFinishLesson = () => {
    if (finalGateBlocked) { blockWith("final"); return; }
    journey.completeFinalReview?.();
  };
  const completeBlocked = !completed && (sceneGateBlocked || (isFinalReviewScene && finalGateBlocked));
  // خطوات العنوان الحالي (للأرقام وقائمة «في هذا العنوان»)
  const steps = [
    showRecall && { id: "recall", label: "تذكّر سريع" },
    hasText && { id: "text", label: "الشرح" },
    (hasMind || hasTimeline) && { id: "tools", label: "أدوات الفهم" },
    hasQuestions && { id: "quiz", label: "اختبر نفسك" },
  ].filter(Boolean);
  const stepNo = (id) => (steps.length >= 2 ? steps.findIndex((x) => x.id === id) + 1 : 0);
  const nextOpen = sceneIndex + 1 < sceneCount ? isSceneUnlocked(sceneIndex + 1) : showAggregatedReviewFlow && finalOpenable;
  const onSkipNext = () => {
    if (sceneIndex + 1 >= sceneCount) { if (showAggregatedReviewFlow) tryOpenScene(sceneCount); return; }
    if (!isSceneUnlocked(sceneIndex + 1)) return;
    tryOpenScene(sceneIndex + 1);
  };
  const completeLabel = completed
    ? sceneIndex + 1 < sceneCount ? "مكتمل — التالي" : showAggregatedReviewFlow ? "مكتمل — المراجعة النهائية" : "مكتمل"
    : "أكمل العنوان";

  const renderNavButton = (it, variant) => (
    <button
      type="button"
      key={it.s ? (it.s.id || `jr-${variant}-${it.i}`) : `jr-${variant}-review`}
      className={variant === "chip" ? `md-jr-chip${it.s ? "" : " md-jr-chip--wide"}` : "md-jr-item"}
      data-state={it.state}
      aria-current={it.current ? "step" : undefined}
      aria-disabled={it.disabled ? "true" : undefined}
      aria-label={it.label}
      title={it.label}
      onClick={() => { if (!it.disabled) { tryOpenScene(it.i); setNavOpen(false); } }}
    >
      {variant === "chip" ? (
        <>
          <span className="md-jr-chip-mark" aria-hidden="true">{it.mark}</span>
          <span className="md-jr-chip-title">{it.s ? it.s.title || `العنوان ${it.i + 1}` : "المراجعة النهائية"}</span>
        </>
      ) : (
        <>
          <span className="md-jr-dot" aria-hidden="true">{it.mark}</span>
          <span>{it.s ? it.s.title || `العنوان ${it.i + 1}` : "المراجعة النهائية"}</span>
        </>
      )}
    </button>
  );

  // اقفل القائمة المنسدلة عند تغيير العنوان أو الضغط على Esc
  useEffect(() => { setNavOpen(false); }, [sceneIndex]);
  // العنوان الحالي دايمًا باين: نوسّطه في الشريط الأفقي وفي القائمة الجانبية لما يتغيّر
  useEffect(() => {
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const center = (box, axis) => {
      const cur = box && box.querySelector('[aria-current="step"]');
      if (!cur || !box.clientWidth) return;
      const a = cur.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      const behavior = reduce ? "auto" : "smooth";
      if (axis === "x") box.scrollBy({ left: (a.left + a.width / 2) - (b.left + b.width / 2), behavior });
      else box.scrollBy({ top: (a.top + a.height / 2) - (b.top + b.height / 2), behavior });
    };
    const t = setTimeout(() => { center(chipsRef.current, "x"); center(sideListRef.current, "y"); }, 60);
    return () => clearTimeout(t);
  }, [sceneIndex, isFinalReview, isCompletionStep, sceneCount]);

  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setNavOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <div className="md-jr" ref={rootRef} dir="rtl">
      <style>{JR_CSS}</style>
      <div className="md-jr-wrap">
        {/* 1) مدخل الدرس */}
        <header className="md-jr-hero">
          <span className="md-jr-pill">
            {[lesson.stage, lesson.grade, lesson.term, lesson.subject].filter(Boolean).join(" · ")}
          </span>
          <h1 className="md-jr-h1">{lesson.title}</h1>
          {lesson.description ? <p className="md-jr-desc">{lesson.description}</p> : null}
          {heroExtra ? <div className="md-jr-hero-actions">{heroExtra}</div> : null}
        </header>

        {youtubeId && !sceneContentLocked ? <JrVideo key={lesson.id || youtubeId} videoId={youtubeId} lessonId={lesson.id} /> : null}

        {/* شريط تنقل العناوين + التقدم (لاصق) */}
        <nav className="md-jr-nav" ref={navRef} aria-label="عناوين الدرس">
          <div className="md-jr-navrow">
            <span>{navLabel}</span>
            <small>عناوين مكتملة {doneCount}/{sceneCount}</small>
          </div>
          <div className="md-jr-track" role="progressbar" aria-label="تقدّم الدرس" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className="md-jr-fill" style={{ width: `${pct}%` }} />
          </div>
          <ol className="md-jr-chips" aria-label="عناوين الدرس" ref={chipsRef}>
            {items.map((it) => <li key={it.s.id || `jr-chip-${it.i}`}>{renderNavButton(it, "chip")}</li>)}
            {reviewItem ? <li>{renderNavButton(reviewItem, "chip")}</li> : null}
          </ol>
        </nav>

        <div className="md-jr-grid">
          <aside className="md-jr-side" aria-label="قائمة عناوين الدرس">
            <div className="md-jr-sidecard">
              <p className="md-jr-sidehead">عناوين الدرس</p>
              <ol className="md-jr-list" ref={sideListRef}>
                {items.map((it) => <li key={it.s.id || `jr-side-${it.i}`}>{renderNavButton(it, "item")}</li>)}
                {reviewItem ? <li>{renderNavButton(reviewItem, "item")}</li> : null}
              </ol>
              <p className="md-jr-legend">✓ مكتمل · 🔒 أكمل العنوان السابق · 🔐 تسجيل الدخول مطلوب</p>
            </div>
          </aside>

          <main className="md-jr-main" ref={mainRef} tabIndex={-1} id="md-jr-content" aria-label="محتوى العنوان">
            {/* 4) إتمام (قالب الإتمام الحالي) */}
            {isCompletionStep && (
              <section className="md-jr-card md-jr-notice">
                <span className="md-jr-emoji" aria-hidden="true">🎉</span>
                <h3>{journey.completionTitle || "تم إكمال هذا الجزء"}</h3>
                <p>{journey.completionBody || "أحسنت — يمكنك المتابعة للخطوة التالية."}</p>
                <button type="button" className="md-jr-btn md-jr-btn--primary md-jr-btn--block" onClick={() => journey.dismissCompletion?.()}>
                  التالي <JrIcon name="next" />
                </button>
              </section>
            )}

            {sceneContentLocked && (
              <section className="md-jr-card md-jr-notice md-jr-lock">
                <span className="md-jr-emoji" aria-hidden="true">🔐</span>
                <h3>تسجيل الدخول مطلوب</h3>
                <p>هذا العنوان حصري للمستخدمين المسجّلين. سجّل دخولك للوصول إليه — وليس بسبب ترتيب المشاهد.</p>
                <button type="button" className="md-jr-btn md-jr-btn--primary md-jr-btn--block" onClick={() => setAuthOpen(true)}>
                  تسجيل الدخول / إنشاء حساب
                </button>
              </section>
            )}

            {/* 2) العنوان الحالي فقط */}
            {!isFinalReview && !isCompletionStep && scene && !sceneContentLocked && (
              <div key={scene.id || sceneIndex}>
                {isLessonDone && journey.view === "done" && (
                  <section className="md-jr-card md-jr-notice">
                    <span className="md-jr-emoji" aria-hidden="true">🎉</span>
                    <h3>تم إكمال الدرس</h3>
                    <p>أحسنت — أنهيت رحلة هذا الدرس على مَدَار.</p>
                    <JrDoneScore quiz={journey.quiz} />
                  </section>
                )}

                <div className="md-jr-head">
                  {completed ? (
                    <p className="md-jr-scene-no"><span className="md-jr-badge"><JrIcon name="check" /> مكتمل</span></p>
                  ) : null}
                  <h2 className="md-jr-title" style={{ fontFamily: scene.titleFont || undefined }}>{scene.title}</h2>
                </div>

                {steps.length >= 2 ? (
                  <nav className="md-jr-steps" aria-label="محتوى هذا العنوان">
                    {steps.map((st, i) => (
                      <button
                        key={st.id}
                        type="button"
                        className="md-jr-step"
                        onClick={() => jrScrollTo(document.getElementById(`md-jr-sec-${st.id}`), "start")}
                      >
                        <span className="md-jr-stepno" aria-hidden="true">{i + 1}</span>
                        {st.label}
                      </button>
                    ))}
                  </nav>
                ) : null}

                {/* أ) تذكّر سريع */}
                {showRecall && (
                  <JrRecall items={quickRecallItems} id="md-jr-sec-recall" no={stepNo("recall")} />
                )}

                {/* ب) الشرح */}
                {hasText && (
                  <section className="md-jr-card" data-kind="text" aria-label="الشرح" id="md-jr-sec-text">
                    <JrEyebrow no={stepNo("text")}>الشرح</JrEyebrow>
                    <HotwordRenderer
                      text={scene.text}
                      hotwords={scene.hotwords}
                      onJumpToScene={(targetSceneId) => {
                        const targetIdx = lesson.scenes.findIndex((s) => String(s.id) === String(targetSceneId));
                        if (targetIdx !== -1) setActiveIndex(targetIdx);
                      }}
                    />
                  </section>
                )}

                {/* المراجعة النهائية كمشهد حقيقي (FINAL_REVIEW) */}
                {isFinalReviewScene && (
                  <JrAggregatedReview
                    fullMindMap={fullMindMap} fullTimeline={fullTimeline} fullQuestions={fullQuestions}
                    selectedMindNode={selectedMindNode} setSelectedMindNode={setSelectedMindNode} quiz={finalQuiz}
                  />
                )}

                {/* ج) أدوات الفهم */}
                {(hasMind || hasTimeline) && (
                  <section className="md-jr-card" aria-label="أدوات الفهم" id="md-jr-sec-tools">
                    <JrEyebrow no={stepNo("tools")}>أدوات الفهم</JrEyebrow>
                    <div className="md-jr-tools">
                      {hasMind && (
                        <button type="button" className="md-jr-tool" aria-expanded={tool === "mindmap"} aria-controls="md-jr-panel-mindmap"
                          onClick={() => setTool((t) => (t === "mindmap" ? null : "mindmap"))}>
                          🧠 الخريطة الذهنية <JrIcon name="down" />
                        </button>
                      )}
                      {hasTimeline && (
                        <button type="button" className="md-jr-tool" aria-expanded={tool === "timeline"} aria-controls="md-jr-panel-timeline"
                          onClick={() => setTool((t) => (t === "timeline" ? null : "timeline"))}>
                          🕒 الخط الزمني <JrIcon name="down" />
                        </button>
                      )}
                    </div>
                    {tool === "mindmap" && hasMind && (
                      <div className="md-jr-panel" id="md-jr-panel-mindmap" role="region" aria-label="الخريطة الذهنية">
                        <MindMapViewerNode node={scene.mindmap} onSelectNode={(node) => setSelectedMindNode(node)} selectedNodeId={selectedMindNode?.id} />
                        {selectedMindNode && (
                          <div className="md-jr-detail">
                            <p style={{ fontWeight: 800 }}>تفاصيل العنصر: {selectedMindNode.label}</p>
                            <p>{selectedMindNode.description || "لا توجد تفاصيل إضافية."}</p>
                            {selectedMindNode.sceneId && (
                              <button
                                type="button"
                                className="md-jr-btn md-jr-btn--primary"
                                style={{ flex: "none", minHeight: 44, marginTop: "0.6rem", fontSize: "0.88rem" }}
                                onClick={() => {
                                  const idx = lesson.scenes.findIndex((s) => String(s.id) === String(selectedMindNode.sceneId));
                                  if (idx !== -1) setActiveIndex(idx);
                                }}
                              >
                                الانتقال للمشهد المرتبط ↗
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {tool === "timeline" && hasTimeline && (
                      <div className="md-jr-panel" id="md-jr-panel-timeline" role="region" aria-label="الخط الزمني">
                        <TimelineView items={scene.timeline} />
                      </div>
                    )}
                  </section>
                )}

                {/* د) اختبر نفسك */}
                {hasQuestions && (
                  <section
                    className="md-jr-card md-jr-quizcard" data-kind="questions" aria-label="اختبر نفسك"
                    ref={quizRef} id="md-jr-sec-quiz" data-nudge={nudge && gate === "scene" ? "true" : undefined}
                  >
                    <div className="md-jr-quizhead">
                      <JrEyebrow no={stepNo("quiz")}>❓ اختبر نفسك</JrEyebrow>
                      <span className="md-jr-count" aria-live="polite">
                        أجبت عن {answeredCount} من {sceneQs.length}
                        {savedScene && savedScene.best ? <span className="md-jr-best">🏅 أفضل نتيجة <bdi>{savedScene.best.pct}%</bdi></span> : null}
                      </span>
                    </div>
                    {!completed ? (
                      <p id="md-jr-quizhint" className="md-jr-quizhint" data-ok={sceneGateBlocked ? undefined : "true"}>
                        {sceneGateBlocked
                          ? "حلّ ولو سؤالًا واحدًا على الأقل لتنتقل للجزء التالي — حلّ الأسئلة هو ما يثبّت المعلومة."
                          : "👏 أحسنت! يمكنك الآن إكمال العنوان، أو أكمل بقية الأسئلة لتعرف نتيجتك."}
                      </p>
                    ) : null}
                    <div>
                      {sceneInfos.map(({ q, idx, key }) => (
                        <JrQuestion
                          key={`${key}:${qRun}`}
                          q={q}
                          scored={gradedTotal > 0}
                          onAnswered={(info) => setAnswered((m) => (m[key] ? m : { ...m, [key]: info }))}
                        />
                      ))}
                    </div>
                    {sceneResultReady ? (
                      <JrScoreCard
                        variant="scene"
                        correct={gradedCorrect}
                        total={gradedTotal}
                        best={savedScene && savedScene.best}
                        attempts={savedScene && savedScene.attempts}
                        onRetry={retryScene}
                        cardRef={sceneScoreRef}
                      />
                    ) : null}
                  </section>
                )}
              </div>
            )}

            {/* 3) المراجعة النهائية (الخطوة الافتراضية القديمة) */}
            {isFinalReview && !sceneContentLocked && (
              <div>
                {isLessonDone && (
                  <section className="md-jr-card md-jr-notice">
                    <span className="md-jr-emoji" aria-hidden="true">🎉</span>
                    <h3>تم إكمال الدرس</h3>
                    <p>أحسنت — أنهيت رحلة هذا الدرس على مَدَار.</p>
                    <JrDoneScore quiz={journey.quiz} />
                  </section>
                )}
                <JrAggregatedReview
                  fullMindMap={fullMindMap} fullTimeline={fullTimeline} fullQuestions={fullQuestions}
                  selectedMindNode={selectedMindNode} setSelectedMindNode={setSelectedMindNode} quiz={finalQuiz}
                />
              </div>
            )}

            {/* رسالة «راجع الأسئلة أولًا» */}
            {gate && !sceneContentLocked && !isCompletionStep && !isLessonDone && (
              <JrGate kind={gate} onGo={() => jrScrollTo(gate === "final" ? fQuizRef.current : quizRef.current, "start")} />
            )}

            {/* شريط الإجراءات */}
            {!isFinalReview && !isCompletionStep && scene && !sceneContentLocked && (
              <div className="md-jr-bar" role="group" aria-label="التنقل بين العناوين">
                <button type="button" className="md-jr-btn md-jr-btn--ghost" onClick={() => tryOpenScene(sceneIndex - 1)} disabled={sceneIndex <= 0}>
                  <JrIcon name="prev" /> السابق
                </button>
                {!completed && nextOpen && (
                  <button type="button" className="md-jr-btn md-jr-btn--ghost" onClick={onSkipNext}>
                    التالي <JrIcon name="next" />
                  </button>
                )}
                <button
                  type="button"
                  className={`md-jr-btn md-jr-btn--primary${completed ? " md-jr-btn--done" : ""}`}
                  onClick={onComplete}
                  aria-disabled={completeBlocked ? "true" : undefined}
                  aria-describedby={completeBlocked && hasQuestions ? "md-jr-quizhint" : undefined}
                >
                  {completed ? <JrIcon name="check" /> : null}
                  {completeLabel}
                  {!completed ? (completeBlocked ? <span aria-hidden="true">🔒</span> : <JrIcon name="check" />) : null}
                </button>
              </div>
            )}
            {isFinalReview && !sceneContentLocked && (
              <div className="md-jr-bar" role="group" aria-label="إجراءات المراجعة النهائية">
                <button type="button" className="md-jr-btn md-jr-btn--ghost" onClick={() => tryOpenScene(Math.max(0, sceneCount - 1))}>
                  <JrIcon name="prev" /> آخر عنوان
                </button>
                {!isLessonDone && (
                  <button type="button" className="md-jr-btn md-jr-btn--primary" onClick={onFinishLesson} aria-disabled={finalGateBlocked ? "true" : undefined}>
                    إنهاء المراجعة وإكمال الدرس {finalGateBlocked ? <span aria-hidden="true">🔒</span> : <JrIcon name="check" />}
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Student View Unified Component
// ---------------------------------------------------------------------------
export function StudentView({
  lesson,
  embedded = false,
  controlled,
  isTeacherView = false,
  requireAuthForTools = false,
  session = null,
  onAuthSuccess,
  recordingMode = false,
  journey = null,
  heroExtra = null,
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const hasJourney = !!journey && !isTeacherView;
  const activeIndex = hasJourney
    ? (journey.view === "final" || journey.view === "done" ? (journey.sceneCount || 0) : (journey.currentScene ?? 0))
    : controlled
      ? controlled.index
      : internalIndex;
  const setActiveIndex = hasJourney
    ? (i) => {
        if (typeof i === "number" && i >= 0 && i < (journey.sceneCount || 0)) {
          journey.setCurrentScene?.(i);
        }
      }
    : controlled
      ? controlled.setIndex
      : setInternalIndex;

  const [showMap, setShowMap] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [selectedMindNode, setSelectedMindNode] = useState(null);
  const [showFullMap, setShowFullMap] = useState(true);
  const [showFullTimeline, setShowFullTimeline] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateFeature, setGateFeature] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingFeature, setPendingFeature] = useState(null);

  const sceneCount = Array.isArray(lesson?.scenes) ? lesson.scenes.length : 0;
  const isCompletionStep = hasJourney && journey.view === "completion";
  const isFinalReview = hasJourney
    ? journey.view === "final"
    : false;
  const isLessonDone = hasJourney && (!!journey.lessonCompleted || journey.view === "done");

  const youtubeId = useMemo(
    () => extractYouTubeId(lesson?.youtubeUrl || lesson?.youtube_url || ""),
    [lesson?.youtubeUrl, lesson?.youtube_url]
  );
  const fullMindMap = useMemo(() => buildFullMindMap(lesson?.scenes, lesson?.title), [lesson?.scenes, lesson?.title]);
  const fullTimeline = useMemo(() => buildFullTimeline(lesson?.scenes), [lesson?.scenes]);
  const fullQuestions = useMemo(() => buildFullQuestions(lesson?.scenes), [lesson?.scenes]);

  useEffect(() => {
    setSelectedMindNode(null);
  }, [activeIndex, lesson?.id]);

  useEffect(() => {
    if (session && pendingFeature) {
      const pf = pendingFeature;
      setPendingFeature(null); setGateOpen(false); setAuthOpen(false);
      if (typeof pf === "string" && pf.startsWith("scene-")) {
        const idx = parseInt(pf.replace("scene-", ""), 10);
        if (!Number.isNaN(idx)) setActiveIndex(idx);
      }
    }
  }, [session, pendingFeature, lesson?.scenes?.length, setActiveIndex]);

  const requestTool = useCallback((featureKey, featureLabel) => {
    if (!requireAuthForTools || session || isTeacherView) return true;
    setGateFeature(featureLabel); setPendingFeature(featureKey); setGateOpen(true);
    return false;
  }, [requireAuthForTools, session, isTeacherView]);

  const authOpts = { requireAuthForTools, session, isTeacherView };
  const isSceneUnlocked = useCallback((i) => {
    if (isTeacherView || !hasJourney) return true;
    return isSceneSequenceUnlocked(journey, i);
  }, [isTeacherView, hasJourney, journey]);

  const isSceneCompleted = useCallback((i) => {
    if (!hasJourney) return false;
    return (journey.completedScenes || []).includes(i);
  }, [hasJourney, journey]);

  const tryOpenScene = useCallback((i) => {
    // Final review virtual step
    if (hasJourney && i >= sceneCount) {
      if (isTeacherView || journey.finalReviewUnlocked || (journey.completedScenes || []).length >= sceneCount) {
        journey.openFinalReview?.();
      }
      return;
    }
    const max = Math.max(0, sceneCount - 1);
    const idx = Math.max(0, Math.min(i, max));
    const s = lesson?.scenes?.[idx];
    const kind = getSceneLockKind(s, idx, {
      session,
      isTeacherView,
      requireAuthForTools,
      hasJourney,
      journey,
    });
    // Access Lock first — show login, never "complete previous"
    if (kind === "ACCESS_LOCK") {
      setGateFeature(s?.title || "هذا المشهد");
      setPendingFeature(`scene-${idx}`);
      setGateOpen(true);
      return;
    }
    if (kind === "SEQUENCE_LOCK") {
      return; // sequence locked — button already shows message
    }
    setActiveIndex(idx);
  }, [lesson?.scenes, requireAuthForTools, session, isTeacherView, setActiveIndex, hasJourney, journey, sceneCount]);

  if (!lesson || !Array.isArray(lesson.scenes) || lesson.scenes.length === 0) {
    return (
      <div className="p-8 text-center text-right dir-rtl" style={{ color: "#697A73" }}>
        لا توجد مشاهد متاحة في هذا الدرس.
      </div>
    );
  }

  const sceneIndex = isFinalReview
    ? sceneCount
    : sceneCount > 0
      ? Math.min(Math.max(0, activeIndex), sceneCount - 1)
      : 0;
  const scene = !isFinalReview && !isCompletionStep && lesson?.scenes ? lesson.scenes[sceneIndex] : null;

  if (!isFinalReview && !isCompletionStep && !scene) {
    return (
      <div className="p-8 text-center text-right dir-rtl" style={{ color: "#697A73" }}>
        المشهد غير موجود.
      </div>
    );
  }

  const quickRecallItems = scene
    ? (scene.quickRecall || []).filter((item) => item && typeof item === "string" && item.trim() !== "")
    : [];

  const isQuickRecallVisible =
    scene && scene.quickRecallShow !== false && scene.quickRecallShow !== "false";

  const sceneContentLocked =
    !!scene && isSceneLockedForGuest(scene, { requireAuthForTools, session, isTeacherView });
  const finalLocked = false;

  // "📚 المراجعة النهائية" — a real Scene (scene_type = FINAL_REVIEW) that renders the
  // same aggregated mind map / timeline / questions data used by the legacy virtual
  // final-review step below, but as an ordinary scene in the lesson's scene sequence.
  const isFinalReviewScene =
    !!scene && (scene.sceneType || scene.scene_type) === "FINAL_REVIEW";
  // Legacy "aggregated review" virtual step, opt-in only via journeyConfig.includeAggregatedReview.
  // Kept for lessons that already rely on it; never triggered automatically otherwise.
  const showAggregatedReviewFlow = hasJourney && !!journey.journeyConfig?.includeAggregatedReview;

    
  // تجربة الطالب الجديدة (رحلة العناوين) — فقط عند وجود journey. معاينة المعلم/التصوير تكمل للمسار القديم أدناه.
  if (hasJourney) {
    return (
      <>
        <JourneyLesson
          ctx={{
            lesson, journey, scene, sceneIndex, sceneCount, isFinalReview, isCompletionStep, isLessonDone,
            isFinalReviewScene, sceneContentLocked, showAggregatedReviewFlow, youtubeId,
            quickRecallItems, isQuickRecallVisible: !!isQuickRecallVisible,
            fullMindMap, fullTimeline, fullQuestions, selectedMindNode, setSelectedMindNode,
            tryOpenScene, isSceneCompleted, isSceneUnlocked, setActiveIndex, setAuthOpen, authOpts, heroExtra,
          }}
        />
        <RegistrationGate open={gateOpen} featureLabel={gateFeature}
          onClose={() => { setGateOpen(false); setPendingFeature(null); }}
          onRequestAuth={() => { setGateOpen(false); setAuthOpen(true); }} />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)}
          onSuccess={(s) => { onAuthSuccess?.(s); setAuthOpen(false); }}
          title="🔒 هذا المحتوى متاح للأعضاء فقط"
          subtitle="سجّل دخولك واستمتع بكل مميزات مَدَار مجانًا بالكامل." />
      </>
    );
  }

  return (
    <div
      className="ts-root ts-scrollbar dir-rtl text-right md-lv"
      style={{
        minHeight: embedded ? "100%" : undefined,
        background: "#FAF6ED",
        overflowY: "auto",
      }}
    >
      <style>{`
        @media print {
          .quick-recall-hidden {
            display: none !important;
          }
        }
      `}</style>
      <div className={embedded ? "px-4 py-4" : "max-w-3xl mx-auto px-5 py-8"}>
        <div className="md-lv-hero">
        <div className="text-center mb-3">
          <Pill tone="teal">
            {[lesson.stage, lesson.grade, lesson.term, lesson.subject]
              .filter(Boolean)
              .join(" · ")}
          </Pill>
        </div>

        <div className="text-center mb-6">
          <h1
            className="ts-display font-black md-lv-h1"
            style={{ color: "#263B35", fontSize: embedded ? 24 : 32 }}
          >
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="md-lv-desc text-sm mt-1" style={{ color: "#3F4E49" }}>
              {lesson.description}
            </p>
          )}
          {heroExtra ? <div className="md-lv-hero-actions">{heroExtra}</div> : null}
        </div>
        </div>


        {/* فيديو الدرس — ثابت أعلى الرحلة (مستوى الدرس) */}
        {youtubeId && !recordingMode && !sceneContentLocked && (
          <div className="mb-6">
            <p className="md-lv-video-note text-xs font-bold mb-2 text-center" style={{ color: "#697A73" }}>🎥 شاهد فيديو الدرس

تابع الشرح خطوة بخطوة وركّز في ترتيب الأفكار والأمثلة. خُد وقتك في الفهم قبل الانتقال للجزء التالي، لأن الفيديو هو بداية رحلتك لفهم الدرس بشكل كامل.
</p>
            <YouTubePlayer videoId={youtubeId} />
          </div>
        )}

        {/* رحلة الدرس */}
        <div className="mb-6 md-lv-journey">
          {sceneCount > 0 && !recordingMode && (
            <div className="text-center mb-3">
              <p className="text-xs font-bold" style={{ color: "#697A73" }}>
                {isLessonDone
                  ? "🎉 تم إكمال الدرس"
                  : isFinalReview
                    ? "المراجعة النهائية"
                    : `التقدّم  ·  ${sceneIndex + 1} من ${sceneCount}`}
              </p>
              {hasJourney && sceneCount > 0 && (
                <p className="text-[11px] mt-1" style={{ color: "#697A73" }}>
                  عناوين مكتملة {(journey.completedScenes || []).length}/{sceneCount}
                </p>
              )}
            </div>
          )}
          {hasJourney && sceneCount > 0 && (
            <div className="md-lv-track" aria-hidden="true">
              <div
                className="md-lv-fill"
                style={{ width: `${Math.round((((journey.completedScenes || []).length) / sceneCount) * 100)}%` }}
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2 justify-center md-lv-steps">
          {lesson.scenes.map((s, i) => {
            const kind = getSceneLockKind(s, i, {
              session,
              isTeacherView,
              requireAuthForTools,
              hasJourney,
              journey,
            });
            const labels = sceneLockLabel(kind);
            const current = !isFinalReview && i === sceneIndex && kind !== "SEQUENCE_LOCK" && kind !== "ACCESS_LOCK";
            const done = kind === "COMPLETED";
            const canOpen = isTeacherView || kind === "AVAILABLE" || kind === "COMPLETED" || kind === "ACCESS_LOCK";
            // ACCESS_LOCK is clickable (opens login gate); SEQUENCE_LOCK is not
            const disabled = kind === "SEQUENCE_LOCK" && !isTeacherView;
            const mark =
              done ? "✓ " :
              current ? "● " :
              kind === "ACCESS_LOCK" ? "🔐 " :
              kind === "SEQUENCE_LOCK" ? "🔒 " :
              "○ ";
            const titleHint =
              kind === "ACCESS_LOCK" ? "تسجيل الدخول مطلوب" :
              kind === "SEQUENCE_LOCK" ? "أكمل العنوان السابق أولًا" :
              done ? "مكتمل" :
              current ? "الحالي" : "متاح";
            return (
            <button
              type="button"
              key={s.id || `scene-btn-${i}`}
              onClick={() => tryOpenScene(i)}
              disabled={disabled}
              title={titleHint}
              data-state={done ? "done" : current ? "current" : kind === "ACCESS_LOCK" ? "access" : kind === "SEQUENCE_LOCK" ? "sequence" : "available"}
              className="md-lv-step px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm"
              style={{
                background: current ? "#147A6A" : done ? "#E0F1EC" : "#FFFFFF",
                color: current ? "#FAF6ED" : "#263B35",
                border: "1px solid " + (
                  current ? "#147A6A" :
                  done ? "#147A6A" :
                  kind === "ACCESS_LOCK" ? "#86600F" :
                  kind === "SEQUENCE_LOCK" ? "#DED4BD" :
                  "#DED4BD"
                ),
                opacity: disabled ? 0.55 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {mark}{i + 1}. {s.title}
            </button>
            );
          })}
          {hasJourney && journey.journeyConfig?.includeAggregatedReview && (
            <button
              type="button"
              onClick={() => tryOpenScene(sceneCount)}
              disabled={!isTeacherView && !journey.finalReviewUnlocked && (journey.completedScenes || []).length < sceneCount}
              data-state={isFinalReview ? "current" : (journey.finalReviewUnlocked || (journey.completedScenes || []).length >= sceneCount || isTeacherView) ? "available" : "sequence"}
              className="md-lv-step px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm"
              style={{
                background: isFinalReview ? "#147A6A" : "#FFFFFF",
                color: isFinalReview ? "#FAF6ED" : "#263B35",
                border: "1px solid " + (isFinalReview ? "#147A6A" : "#DED4BD"),
                opacity: (journey.finalReviewUnlocked || (journey.completedScenes || []).length >= sceneCount || isTeacherView) ? 1 : 0.55,
                cursor: (journey.finalReviewUnlocked || (journey.completedScenes || []).length >= sceneCount || isTeacherView) ? "pointer" : "not-allowed",
              }}
            >
              {(journey.finalReviewUnlocked || (journey.completedScenes || []).length >= sceneCount || isTeacherView) ? "🧠 " : "🔒 "}المراجعة النهائية
            </button>
          )}
          </div>
          {!recordingMode && (
            <p className="md-lv-legend text-center text-[11px] mt-2" style={{ color: "#697A73" }}>
              ✓ مكتمل · ● الحالي · ○ متاح · 🔒 أكمل العنوان السابق · 🔐 تسجيل الدخول مطلوب
            </p>
          )}
        </div>

        {isCompletionStep && hasJourney && (
          <div className="md-lv-notice rounded-3xl p-8 mb-6 text-center bg-white shadow-sm" style={{ border: "1px solid #147A6A" }}>
            <p className="text-3xl mb-3">🎉</p>
            <p className="font-black text-lg mb-2" style={{ color: "#147A6A" }}>
              {(journey.completionTitle) || "تم إكمال هذا الجزء"}
            </p>
            <p className="text-sm mb-6" style={{ color: "#3F4E49" }}>
              {(journey.completionBody) || "أحسنت — يمكنك المتابعة للخطوة التالية."}
            </p>
            <button
              type="button"
              onClick={() => journey.dismissCompletion?.()}
              className="md-lv-btn md-lv-btn-primary px-6 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: "#147A6A" }}
            >
              التالي →
            </button>
          </div>
        )}


        {sceneContentLocked && (
          <div className="md-lv-lock rounded-3xl p-8 mb-6 text-center shadow-sm bg-white" style={{ border: "1px solid #DED4BD" }}>
            <p className="text-3xl mb-2">🔐</p>
            <p className="font-black text-lg mb-2" style={{ color: "#147A6A" }}>تسجيل الدخول مطلوب</p>
            <p className="text-sm mb-4" style={{ color: "#3F4E49" }}>
              هذا العنوان حصري للمستخدمين المسجّلين. سجّل دخولك للوصول إليه — وليس بسبب ترتيب المشاهد.
            </p>
            <button type="button" onClick={() => setAuthOpen(true)}
              className="md-lv-btn md-lv-btn-primary px-5 py-2.5 rounded-2xl text-sm font-bold text-white" style={{ background: "#147A6A" }}>
              تسجيل الدخول / إنشاء حساب
            </button>
          </div>
        )}


        {!sceneContentLocked && scene && isTeacherView && scene.presenterNotes && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: "#FAF6ED", border: "1px solid #B8832A" }}
          >
            <p className="font-bold text-xs mb-1" style={{ color: "#86600F" }}>
              📌 ملاحظات المُقدّم (خاص بك):
            </p>
            <p className="text-sm" style={{ color: "#7A5A1E" }}>
              {scene.presenterNotes}
            </p>
          </div>
        )}

        {/* التذكر السريع */}
        {!sceneContentLocked && scene && isQuickRecallVisible && quickRecallItems.length > 0 && (
          <div
            className="md-lv-recall rounded-2xl p-4 mb-5 quick-recall-hidden"
            style={{ background: "#E0F1EC", border: "1px solid #147A6A" }}
          >
            <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>
              🧠 تذكّر سريع:
            </p>
            <ol
              className="list-decimal list-inside text-sm space-y-1"
              style={{ color: "#263B35" }}
            >
              {quickRecallItems.map((item, idx) => (
                <li key={`quick-recall-${idx}`}>{item}</li>
              ))}
            </ol>
          </div>
        )}

        {/* محتوى المشهد الرئيسي */}
        {!sceneContentLocked && scene && scene.text && String(scene.text).replace(/<[^>]+>/g, "").trim() && (
        <div
          key={scene.id || activeIndex}
          data-kind="text"
          className="md-lv-card md-lv-card--accent ts-fade rounded-3xl p-6 sm:p-8 mb-6 shadow-sm bg-white"
          style={{ border: "1px solid #DED4BD" }}
        >
          <h2
            className="md-lv-scene-title text-xl font-bold mb-4 pb-2 border-b"
            style={{
              color: "#147A6A",
              borderColor: "#DED4BD",
              fontFamily: scene.titleFont || "Amiri, serif",
            }}
          >
            {scene.title}
          </h2>
          <HotwordRenderer
            text={scene.text}
            hotwords={scene.hotwords}
            onJumpToScene={(targetSceneId) => {
              const targetIdx = lesson.scenes.findIndex(
                (s) => String(s.id) === String(targetSceneId)
              );
              if (targetIdx !== -1) setActiveIndex(targetIdx);
            }}
          />
        </div>
        )}

        {/* 📚 المراجعة النهائية — محتوى مجمّع من كل مشاهد الدرس (خريطة ذهنية + خط زمني + أسئلة) */}
        {!sceneContentLocked && scene && isFinalReviewScene && (
          <div
            data-kind="review"
            className="md-lv-card md-lv-card--accent rounded-3xl p-5 mb-6 shadow-sm bg-white"
            style={{ border: "1px solid #DED4BD" }}
          >
            <h3 className="md-lv-card-title font-bold text-lg mb-1" style={{ color: "#147A6A" }}>📚 المراجعة النهائية</h3>
            <p className="text-xs mb-4" style={{ color: "#697A73" }}>ملخص من كل مشاهد الدرس: خريطة ذهنية وخط زمني وأسئلة.</p>
            {fullMindMap && fullMindMap.label && (
              <div className="mb-6">
                <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>🗺️ الخريطة الذهنية الكاملة</p>
                <MindMapViewerNode
                  node={fullMindMap}
                  onSelectNode={(node) => setSelectedMindNode(node)}
                  selectedNodeId={selectedMindNode?.id}
                />
              </div>
            )}
            {Array.isArray(fullTimeline) && fullTimeline.length > 0 && (
              <div className="mb-6">
                <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>🕒 الخط الزمني الكامل</p>
                <TimelineView items={fullTimeline} showSceneTitle />
              </div>
            )}
            {Array.isArray(fullQuestions) && fullQuestions.length > 0 && (
              <div className="mb-4">
                <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>❓ أسئلة المراجعة</p>
                <div className="flex flex-col gap-3">
                  {fullQuestions.map((q, idx) => (
                    <QuestionItem key={q.id || `fr-fq-${idx}`} q={q} />
                  ))}
                </div>
              </div>
            )}
            {!fullMindMap?.label && !(fullTimeline || []).length && !(fullQuestions || []).length && (
              <p className="text-sm" style={{ color: "#697A73" }}>لا توجد عناصر مراجعة مجمّعة بعد — أضف محتوى في المشاهد من الاستوديو.</p>
            )}
          </div>
        )}

        {/* الخريطة الذهنية */}
        {!sceneContentLocked && scene && !isFinalReviewScene && scene.mindmap && scene.mindmap.label && (
          <div
            data-kind="mindmap"
            className="md-lv-card rounded-3xl p-6 mb-6 shadow-sm bg-white"
            style={{ border: "1px solid #DED4BD" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="md-lv-card-title font-bold text-lg" style={{ color: "#147A6A" }}>
                🧠 الخريطة الذهنية للدرس
              </h3>
              <button
                type="button"
                onClick={() => setShowMap((prev) => !prev)}
                className="md-lv-toggle text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                style={{ background: "#E0F1EC", color: "#0E5348" }}
              >
                {showMap ? "إخفاء" : "إظهار"}
              </button>
            </div>
            {showMap && (
              <div>
                <MindMapViewerNode
                  node={scene.mindmap}
                  onSelectNode={(node) => setSelectedMindNode(node)}
                  selectedNodeId={selectedMindNode?.id}
                />
                {selectedMindNode && (
                  <div
                    className="md-lv-detail ts-fade mt-4 p-4 rounded-2xl"
                    style={{
                      background: "#F8EFD8",
                      border: "1px solid #B8832A",
                    }}
                  >
                    <p
                      className="font-bold text-sm mb-1"
                      style={{ color: "#86600F" }}
                    >
                      تفاصيل العنصر: {selectedMindNode.label}
                    </p>
                    <p className="text-sm" style={{ color: "#7A5A1E" }}>
                      {selectedMindNode.description ||
                        "لا توجد تفاصيل إضافية."}
                    </p>
                    {selectedMindNode.sceneId && (
                      <button
                        type="button"
                        onClick={() => {
                          const idx = lesson.scenes.findIndex(
                            (s) => String(s.id) === String(selectedMindNode.sceneId)
                          );
                          if (idx !== -1) setActiveIndex(idx);
                        }}
                        className="mt-2 text-xs px-3 py-1 rounded-lg text-white font-bold cursor-pointer"
                        style={{ background: "#147A6A" }}
                      >
                        الانتقال للمشهد المرتبط ↗
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* الشريط الزمني */}
        {!sceneContentLocked && scene && !isFinalReviewScene && Array.isArray(scene.timeline) && scene.timeline.length > 0 && (
          <div
            data-kind="timeline"
            className="md-lv-card rounded-3xl p-6 mb-6 shadow-sm bg-white"
            style={{ border: "1px solid #DED4BD" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="md-lv-card-title font-bold text-lg" style={{ color: "#147A6A" }}>
                🕒 الخط الزمني والأحداث
              </h3>
              <button
                type="button"
                onClick={() => setShowTimeline((prev) => !prev)}
                className="md-lv-toggle text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                style={{ background: "#E0F1EC", color: "#0E5348" }}
              >
                {showTimeline ? "إخفاء" : "إظهار"}
              </button>
            </div>
            {showTimeline && (
              <TimelineView items={scene.timeline} />
            )}
          </div>
        )}

        {/* قسم الأسئلة والتحقق من الفهم */}
        {!sceneContentLocked && scene && !isFinalReviewScene && Array.isArray(scene.questions) && scene.questions.length > 0 && (
          <div
            data-kind="questions"
            className="md-lv-card rounded-3xl p-6 mb-6 shadow-sm bg-white"
            style={{ border: "1px solid #DED4BD" }}
          >
            <h3 className="md-lv-card-title font-bold text-lg mb-4" style={{ color: "#147A6A" }}>
              ❓ تحقق من فهمك
            </h3>
            <div className="flex flex-col gap-4">
              {scene.questions.map((q, idx) => (
                <QuestionItem key={q.id || `question-item-${idx}`} q={q} />
              ))}
            </div>
          </div>
        )}

        {/* أزرار التنقل + إكمال المشهد */}
        {!isFinalReview && scene && !sceneContentLocked && (
          <div className="flex flex-col gap-3 mb-4">
            {hasJourney && !isTeacherView && (
              <button
                type="button"
                onClick={() => {
                  if (isSceneCompleted(sceneIndex)) {
                    // already done — advance if next unlocked
                    if (sceneIndex + 1 < sceneCount) tryOpenScene(sceneIndex + 1);
                    else if (showAggregatedReviewFlow) tryOpenScene(sceneCount);
                    return;
                  }
                  // Record THIS scene in completedScenes first (and open the next one
                  // in the same state update) — index is passed explicitly.
                  journey.completeScene?.(sceneIndex);
                }}
                className={`md-lv-btn md-lv-btn-primary${isSceneCompleted(sceneIndex) ? " md-lv-btn-done" : ""} w-full px-5 py-3 rounded-2xl text-sm font-bold text-white`}
                style={{ background: isSceneCompleted(sceneIndex) ? "#0E5348" : "#147A6A" }}
              >
                {isSceneCompleted(sceneIndex)
                  ? (sceneIndex + 1 < sceneCount
                      ? "✓ مكتمل — الانتقال للتالي"
                      : showAggregatedReviewFlow
                        ? "✓ مكتمل — المراجعة النهائية"
                        : "✓ مكتمل")
                  : "✓ أكمل المشهد"}
              </button>
            )}
            <div className="md-lv-navrow flex justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => tryOpenScene(sceneIndex - 1)}
                disabled={sceneIndex <= 0}
                className="md-lv-btn md-lv-btn-ghost px-5 py-2.5 rounded-2xl text-sm font-bold disabled:opacity-40"
                style={{ background: "#E0F1EC", color: "#0E5348" }}
              >
                ← السابق
              </button>
              <button
                type="button"
                onClick={() => {
                  if (hasJourney && !isTeacherView) {
                    if (!isSceneUnlocked(sceneIndex + 1) && sceneIndex + 1 < sceneCount) return;
                    if (sceneIndex + 1 >= sceneCount) {
                      if (showAggregatedReviewFlow) tryOpenScene(sceneCount);
                      return;
                    }
                  }
                  tryOpenScene(sceneIndex + 1);
                }}
                disabled={
                  hasJourney && !isTeacherView
                    ? sceneIndex + 1 < sceneCount
                      ? !isSceneUnlocked(sceneIndex + 1)
                      : !showAggregatedReviewFlow || !(journey.finalReviewUnlocked || (journey.completedScenes || []).length >= sceneCount)
                    : sceneIndex >= sceneCount - 1
                }
                className="md-lv-btn md-lv-btn-primary px-5 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: "#147A6A" }}
              >
                {sceneIndex + 1 >= sceneCount && showAggregatedReviewFlow ? "المراجعة النهائية →" : "التالي →"}
              </button>
            </div>
          </div>
        )}

        {/* المراجعة النهائية */}
        {isFinalReview && !sceneContentLocked && (
          <div className="space-y-6 mb-6">
            {isLessonDone && (
              <div className="md-lv-notice rounded-3xl p-6 text-center bg-white shadow-sm" style={{ border: "1px solid #147A6A" }}>
                <p className="text-3xl mb-2">🎉</p>
                <p className="font-black text-lg" style={{ color: "#147A6A" }}>تم إكمال الدرس</p>
                <p className="text-sm mt-1" style={{ color: "#3F4E49" }}>أحسنت — أنهيت رحلة هذا الدرس على مَدَار.</p>
              </div>
            )}
            <div data-kind="review" className="md-lv-card md-lv-card--accent rounded-3xl p-5 bg-white shadow-sm" style={{ border: "1px solid #DED4BD" }}>
              <h3 className="md-lv-card-title font-bold text-lg mb-3" style={{ color: "#147A6A" }}>🧠 المراجعة النهائية</h3>
              <p className="text-xs mb-4" style={{ color: "#697A73" }}>ملخص من كل مشاهد الدرس: خريطة ذهنية وخط زمني وأسئلة.</p>
              {fullMindMap && fullMindMap.label && (
                <div className="mb-6">
                  <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>الخريطة الذهنية الكاملة</p>
                  <MindMapViewerNode
                    node={fullMindMap}
                    onSelectNode={(node) => setSelectedMindNode(node)}
                    selectedNodeId={selectedMindNode?.id}
                  />
                </div>
              )}
              {Array.isArray(fullTimeline) && fullTimeline.length > 0 && (
                <div className="mb-6">
                  <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>الخط الزمني الكامل</p>
                  <TimelineView items={fullTimeline} showSceneTitle />
                </div>
              )}
              {Array.isArray(fullQuestions) && fullQuestions.length > 0 && (
                <div className="mb-4">
                  <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>أسئلة المراجعة</p>
                  <div className="flex flex-col gap-3">
                    {fullQuestions.map((q, idx) => (
                      <QuestionItem key={q.id || `fq-${idx}`} q={q} />
                    ))}
                  </div>
                </div>
              )}
              {!fullMindMap?.label && !(fullTimeline || []).length && !(fullQuestions || []).length && (
                <p className="text-sm" style={{ color: "#697A73" }}>لا توجد عناصر مراجعة مجمّعة بعد — أضف محتوى في المشاهد من الاستوديو.</p>
              )}
            </div>
            {hasJourney && !isTeacherView && !isLessonDone && (
              <button
                type="button"
                onClick={() => journey.completeFinalReview?.()}
                className="md-lv-btn md-lv-btn-primary w-full px-5 py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: "#147A6A" }}
              >
                ✓ إنهاء المراجعة وإكمال الدرس
              </button>
            )}
            <button
              type="button"
              onClick={() => tryOpenScene(Math.max(0, sceneCount - 1))}
              className="md-lv-btn md-lv-btn-ghost w-full px-5 py-2.5 rounded-2xl text-sm font-bold"
              style={{ background: "#E0F1EC", color: "#0E5348" }}
            >
              ← العودة لآخر مشهد
            </button>
          </div>
        )}
      </div>

      <RegistrationGate open={gateOpen} featureLabel={gateFeature}
        onClose={() => { setGateOpen(false); setPendingFeature(null); }}
        onRequestAuth={() => { setGateOpen(false); setAuthOpen(true); }} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)}
        onSuccess={(s) => { onAuthSuccess?.(s); setAuthOpen(false); }}
        title="🔒 هذا المحتوى متاح للأعضاء فقط"
        subtitle="سجّل دخولك واستمتع بكل مميزات مَدَار مجانًا بالكامل." />
    </div>
  );
}