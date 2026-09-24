import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { extractYouTubeId } from "../lib/db";
import AuthModal, { RegistrationGate } from "./AuthModal";

// ---------------------------------------------------------------------------
// Pill Tag Component
// ---------------------------------------------------------------------------
export function Pill({ children, tone = "teal" }) {
  const tones = {
    teal: { bg: "#E4F0EC", color: "#0E5348" },
    plum: { bg: "#EAE6F1", color: "#4C3F63" },
    ochre: { bg: "#F6E9D3", color: "#8A5A15" },
  };
  const t = tones[tone] || tones.teal;

  return (
    <span
      style={{ background: t.bg, color: t.color }}
      className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap inline-block"
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
        <span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>
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
          style={{ background: "#EAE6F1", color: "#4C3F63" }}
        >
          {uploading ? "جاري الرفع..." : "📁 اختيار صورة من الجهاز"}
        </button>
        {value && !uploading && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRemoveImage}
            className="text-xs px-2 py-1 rounded font-bold cursor-pointer"
            style={{ color: "#C53030" }}
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
        <p className="text-xs mt-1" style={{ color: "#C53030" }}>
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

        setPopPos({
          top: rect.bottom - parentRect.top + 8,
          right: Math.max(0, parentRect.right - rect.right),
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
          color: #22291F;
        }
        /* تصميم متوهج فخم بدلاً من المستطيل الملوّن */
        .ts-richtext-content .ts-hotword-highlight {
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: 700 !important;
          color: #B9791F !important;
          background: none !important;
          padding: 0 1px !important;
          margin: 0 1px !important;
          border-radius: 0 !important;
          border-bottom: 1.5px dotted rgba(185,121,31,0.55) !important;
          text-decoration: none !important;
          cursor: pointer !important;
          transition: color 0.25s ease, text-shadow 0.25s ease, border-color 0.25s ease !important;
          text-shadow: 0 0 6px rgba(185,121,31,0.45), 0 0 14px rgba(185,121,31,0.2) !important;
          animation: ts-hotword-glow 2.6s ease-in-out infinite;
        }
        .ts-richtext-content .ts-hotword-highlight:hover {
          color: #E0A83E !important;
          border-bottom-color: rgba(224,168,62,0.9) !important;
          text-shadow: 0 0 10px rgba(224,168,62,0.85), 0 0 22px rgba(224,168,62,0.45) !important;
          animation-play-state: paused;
        }
        @keyframes ts-hotword-glow {
          0%, 100% { text-shadow: 0 0 6px rgba(185,121,31,0.4), 0 0 14px rgba(185,121,31,0.18); }
          50% { text-shadow: 0 0 10px rgba(185,121,31,0.75), 0 0 20px rgba(185,121,31,0.4); }
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
          className="ts-fade absolute z-50 rounded-2xl p-4 shadow-2xl max-w-sm w-full text-right"
          style={{
            background: "#FAF6ED",
            border: "2px solid #10665A",
            top: `${popPos.top}px`,
            right: `${popPos.right}px`,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => setActiveHot(null)}
        >
          <div
            className="flex justify-between items-center mb-2 border-b pb-1"
            style={{ borderColor: "#DED4BD" }}
          >
            <span className="font-bold text-base" style={{ color: "#10665A" }}>
              {activeHot.text}
            </span>
            <button
              type="button"
              onClick={() => setActiveHot(null)}
              className="font-bold px-2 py-0.5 rounded cursor-pointer"
              style={{ color: "#8A8570" }}
            >
              ✕
            </button>
          </div>

          {activeHot.image && (
            <img
              src={activeHot.image}
              alt={activeHot.text}
              className="rounded-xl mb-2 w-full object-contain block border"
              style={{ maxHeight: "280px", borderColor: "#DED4BD" }}
            />
          )}

          {activeHot.note && (
            <p className="text-sm mb-2" style={{ color: "#22291F" }}>
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
              className="text-xs px-3 py-1.5 rounded-xl text-white font-bold w-full cursor-pointer mt-1"
              style={{ background: "#10665A" }}
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
// Mind Map Component
// ---------------------------------------------------------------------------
export function MindMapViewerNode({
  node,
  depth = 0,
  onSelectNode,
  selectedNodeId,
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = Array.isArray(node?.children) && node.children.length > 0;
  const isSelected = selectedNodeId === node?.id;

  if (!node) return null;

  return (
    <div style={{ marginInlineStart: depth === 0 ? 0 : 20 }} className="my-1 text-right">
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectNode) onSelectNode(node);
        }}
        className="flex items-center gap-2 py-1.5 px-3 rounded-xl cursor-pointer transition-all border"
        style={{
          background: isSelected ? "#F6E9D3" : "#FFFFFF",
          borderColor: isSelected ? "#B9791F" : "#DED4BD",
        }}
      >
        <span
          style={{
            width: depth === 0 ? 12 : 8,
            height: depth === 0 ? 12 : 8,
            borderRadius: 999,
            background: depth === 0 ? "#10665A" : "#B9791F",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontWeight: depth === 0 ? 800 : 600,
            color: "#22291F",
            fontSize: depth === 0 ? 16 : 14,
          }}
        >
          {node.label}
        </span>
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            aria-label={open ? "طي" : "توسيع"}
            className="mr-auto w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer"
            style={{
              background: "#EAE6F1",
              color: "#4C3F63",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform .15s ease",
              fontSize: 12,
              lineHeight: 1,
            }}
          >
            ◂
          </button>
        )}
      </div>
      {hasChildren && open && (
        <div
          style={{
            borderInlineStart: "2px dashed #DED4BD",
            paddingInlineStart: 12,
            marginTop: 4,
          }}
          className="ts-fade"
        >
          {node.children.map((c, idx) => (
            <MindMapViewerNode
              key={c.id || `mindmap-node-${idx}`}
              node={c}
              depth={depth + 1}
              onSelectNode={onSelectNode}
              selectedNodeId={selectedNodeId}
            />
          ))}
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
        className="p-4 rounded-2xl border text-right dir-rtl"
        style={{ background: "#FAF6ED", borderColor: "#DED4BD" }}
      >
        <p className="font-bold mb-3" style={{ color: "#22291F" }}>
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
                className="text-right px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: isCorrect
                    ? "#E4F0EC"
                    : isWrong
                    ? "#FBEAEB"
                    : selectedOption === i
                    ? "#F6E9D3"
                    : "#FFFFFF",
                  borderColor: isCorrect
                    ? "#10665A"
                    : isWrong
                    ? "#C53030"
                    : selectedOption === i
                    ? "#B9791F"
                    : "#DED4BD",
                  color: "#22291F",
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
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity disabled:opacity-50 cursor-pointer"
            style={{
              background: selectedOption === null ? "#DED4BD" : "#10665A",
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
                  selectedOption === q.correctIndex ? "#10665A" : "#C53030",
              }}
            >
              {selectedOption === q.correctIndex
                ? "إجابة صحيحة بارك الله فيك!"
                : `إجابة غير دقيقة. الإجابة الصحيحة هي: ${
                    q.options?.[q.correctIndex] ?? ""
                  }`}
            </p>
            {q.explanation && (
              <p className="text-xs" style={{ color: "#5C5A4A" }}>
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
      className="p-4 rounded-2xl border text-right dir-rtl"
      style={{ background: "#FAF6ED", borderColor: "#DED4BD" }}
    >
      <p className="font-bold mb-3" style={{ color: "#22291F" }}>
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
          className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
          style={{ background: "#10665A" }}
        >
          عرض الإجابة النموذجية
        </button>
      ) : (
        <div
          className="ts-fade mt-3 p-3 rounded-xl text-sm"
          style={{ background: "#E4F0EC", border: "1px solid #10665A" }}
        >
          <p className="font-bold mb-1" style={{ color: "#0E5348" }}>
            الإجابة النموذجية:
          </p>
          <p style={{ color: "#22291F" }}>{q.modelAnswer}</p>
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
        style={{ background: "#EAE6F1", color: "#4C3F63" }} aria-label={label || "معلومة"} aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>ⓘ</button>
      {open && (
        <span role="tooltip" className="absolute z-20 top-full mt-1 right-0 w-56 sm:w-64 p-3 rounded-xl text-xs shadow-md"
          style={{ background: "#22291F", color: "#FAF6ED" }}>{text}</span>
      )}
    </span>
  );
}

function YouTubePlayer({ videoId }) {
  const [show, setShow] = useState(false);
  if (!videoId) return null;
  return (
    <div className="mb-6 rounded-3xl overflow-hidden bg-black shadow-sm" style={{ border: "1px solid #DED4BD" }}>
      {!show ? (
        <button type="button" onClick={() => setShow(true)}
          className="relative w-full flex items-center justify-center cursor-pointer"
          style={{ aspectRatio: "16 / 9", background: "#0E1712" }} aria-label="تشغيل فيديو الدرس">
          <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" loading="lazy" />
          <span className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
            style={{ background: "rgba(16, 102, 90, 0.92)" }}>▶</span>
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

function buildFullMindMap(scenes) {
  if (!Array.isArray(scenes) || scenes.length === 0) return null;
  const children = [];
  for (const s of scenes) {
    const mm = s.mindmap;
    if (mm && mm.label) children.push({ ...mm, id: mm.id || `scene-mm-${s.id}`, label: mm.label || s.title, children: mm.children || [] });
  }
  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  return { id: "full-mm-root", label: "الخريطة الذهنية الكاملة", description: "أهم أفكار جميع أجزاء الدرس", children };
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

  // Sequence Lock (must complete previous / be in unlockedScenes)
  if (hasJourney && journey) {
    const unlocked = journey.unlockedScenes || [0];
    if (!unlocked.includes(index)) return "SEQUENCE_LOCK";
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
  const fullMindMap = useMemo(() => buildFullMindMap(lesson?.scenes), [lesson?.scenes]);
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
    const unlocked = journey.unlockedScenes || [0];
    return unlocked.includes(i);
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
      <div className="p-8 text-center text-right dir-rtl" style={{ color: "#8A8570" }}>
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
      <div className="p-8 text-center text-right dir-rtl" style={{ color: "#8A8570" }}>
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

    
  return (
    <div
      className="ts-root ts-scrollbar dir-rtl text-right"
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
        <div className="text-center mb-3">
          <Pill tone="teal">
            {[lesson.stage, lesson.grade, lesson.term, lesson.subject]
              .filter(Boolean)
              .join(" · ")}
          </Pill>
        </div>

        <div className="text-center mb-6">
          <h1
            className="ts-display font-black"
            style={{ color: "#22291F", fontSize: embedded ? 24 : 32 }}
          >
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-sm mt-1" style={{ color: "#5C5A4A" }}>
              {lesson.description}
            </p>
          )}
        </div>


        {/* فيديو الدرس — ثابت أعلى الرحلة (مستوى الدرس) */}
        {youtubeId && !recordingMode && !sceneContentLocked && (
          <div className="mb-6">
            <p className="text-xs font-bold mb-2 text-center" style={{ color: "#8A8570" }}>🎥 شاهد فيديو الدرس

تابع الشرح خطوة بخطوة وركّز في ترتيب الأفكار والأمثلة. خُد وقتك في الفهم قبل الانتقال للجزء التالي، لأن الفيديو هو بداية رحلتك لفهم الدرس بشكل كامل.
</p>
            <YouTubePlayer videoId={youtubeId} />
          </div>
        )}

        {/* رحلة الدرس */}
        <div className="mb-6">
          {sceneCount > 0 && (
            <div className="text-center mb-3">
              <p className="text-xs font-bold" style={{ color: "#8A8570" }}>
                {isLessonDone
                  ? "🎉 تم إكمال الدرس"
                  : isFinalReview
                    ? "المراجعة النهائية"
                    : `التقدّم  ·  ${sceneIndex + 1} من ${sceneCount}`}
              </p>
              {hasJourney && sceneCount > 0 && (
                <p className="text-[11px] mt-1" style={{ color: "#8A8570" }}>
                  عناوين مكتملة {(journey.completedScenes || []).length}/{sceneCount}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2 justify-center">
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
              className="px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm"
              style={{
                background: current ? "#10665A" : done ? "#E4F0EC" : "#FFFFFF",
                color: current ? "#FAF6ED" : "#22291F",
                border: "1px solid " + (
                  current ? "#10665A" :
                  done ? "#10665A" :
                  kind === "ACCESS_LOCK" ? "#8A5A15" :
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
              className="px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm"
              style={{
                background: isFinalReview ? "#10665A" : "#FFFFFF",
                color: isFinalReview ? "#FAF6ED" : "#22291F",
                border: "1px solid " + (isFinalReview ? "#10665A" : "#DED4BD"),
                opacity: (journey.finalReviewUnlocked || (journey.completedScenes || []).length >= sceneCount || isTeacherView) ? 1 : 0.55,
                cursor: (journey.finalReviewUnlocked || (journey.completedScenes || []).length >= sceneCount || isTeacherView) ? "pointer" : "not-allowed",
              }}
            >
              {(journey.finalReviewUnlocked || (journey.completedScenes || []).length >= sceneCount || isTeacherView) ? "🧠 " : "🔒 "}المراجعة النهائية
            </button>
          )}
          </div>
          <p className="text-center text-[11px] mt-2" style={{ color: "#8A8570" }}>
            ✓ مكتمل · ● الحالي · ○ متاح · 🔒 أكمل العنوان السابق · 🔐 تسجيل الدخول مطلوب
          </p>
        </div>

        {isCompletionStep && hasJourney && (
          <div className="rounded-3xl p-8 mb-6 text-center bg-white shadow-sm" style={{ border: "1px solid #10665A" }}>
            <p className="text-3xl mb-3">🎉</p>
            <p className="font-black text-lg mb-2" style={{ color: "#10665A" }}>
              {(journey.completionTitle) || "تم إكمال هذا الجزء"}
            </p>
            <p className="text-sm mb-6" style={{ color: "#5C5A4A" }}>
              {(journey.completionBody) || "أحسنت — يمكنك المتابعة للخطوة التالية."}
            </p>
            <button
              type="button"
              onClick={() => journey.dismissCompletion?.()}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: "#10665A" }}
            >
              التالي →
            </button>
          </div>
        )}


        {sceneContentLocked && (
          <div className="rounded-3xl p-8 mb-6 text-center shadow-sm bg-white" style={{ border: "1px solid #DED4BD" }}>
            <p className="text-3xl mb-2">🔐</p>
            <p className="font-black text-lg mb-2" style={{ color: "#10665A" }}>تسجيل الدخول مطلوب</p>
            <p className="text-sm mb-4" style={{ color: "#5C5A4A" }}>
              هذا العنوان حصري للمستخدمين المسجّلين. سجّل دخولك للوصول إليه — وليس بسبب ترتيب المشاهد.
            </p>
            <button type="button" onClick={() => setAuthOpen(true)}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white" style={{ background: "#10665A" }}>
              تسجيل الدخول / إنشاء حساب
            </button>
          </div>
        )}


        {!sceneContentLocked && scene && isTeacherView && scene.presenterNotes && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: "#FDF9EE", border: "1px solid #B9791F" }}
          >
            <p className="font-bold text-xs mb-1" style={{ color: "#8A5A15" }}>
              📌 ملاحظات المُقدّم (خاص بك):
            </p>
            <p className="text-sm" style={{ color: "#5F4416" }}>
              {scene.presenterNotes}
            </p>
          </div>
        )}

        {/* التذكر السريع */}
        {!sceneContentLocked && scene && isQuickRecallVisible && quickRecallItems.length > 0 && (
          <div
            className="rounded-2xl p-4 mb-5 quick-recall-hidden"
            style={{ background: "#E4F0EC", border: "1px solid #10665A" }}
          >
            <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>
              🧠 تذكّر سريع:
            </p>
            <ol
              className="list-decimal list-inside text-sm space-y-1"
              style={{ color: "#22291F" }}
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
          className="ts-fade rounded-3xl p-6 sm:p-8 mb-6 shadow-sm bg-white"
          style={{ border: "1px solid #DED4BD" }}
        >
          <h2
            className="text-xl font-bold mb-4 pb-2 border-b"
            style={{
              color: "#10665A",
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
            className="rounded-3xl p-5 mb-6 shadow-sm bg-white"
            style={{ border: "1px solid #DED4BD" }}
          >
            <h3 className="font-bold text-lg mb-1" style={{ color: "#10665A" }}>📚 المراجعة النهائية</h3>
            <p className="text-xs mb-4" style={{ color: "#8A8570" }}>ملخص من كل مشاهد الدرس: خريطة ذهنية وخط زمني وأسئلة.</p>
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
                <div className="flex flex-col gap-3">
                  {fullTimeline.map((item, idx) => (
                    <div key={item.id || `fr-ft-${idx}`} className="p-3 rounded-xl" style={{ background: "#FAF6ED", border: "1px solid #DED4BD" }}>
                      <p className="font-bold text-xs" style={{ color: "#10665A" }}>{item.date}</p>
                      <p className="text-sm font-bold" style={{ color: "#22291F" }}>{item.title}</p>
                      {item.description && <p className="text-xs mt-1" style={{ color: "#5C5A4A" }}>{item.description}</p>}
                    </div>
                  ))}
                </div>
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
              <p className="text-sm" style={{ color: "#8A8570" }}>لا توجد عناصر مراجعة مجمّعة بعد — أضف محتوى في المشاهد من الاستوديو.</p>
            )}
          </div>
        )}

        {/* الخريطة الذهنية */}
        {!sceneContentLocked && scene && !isFinalReviewScene && scene.mindmap && scene.mindmap.label && (
          <div
            className="rounded-3xl p-6 mb-6 shadow-sm bg-white"
            style={{ border: "1px solid #DED4BD" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg" style={{ color: "#10665A" }}>
                🧠 الخريطة الذهنية للدرس
              </h3>
              <button
                type="button"
                onClick={() => setShowMap((prev) => !prev)}
                className="text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                style={{ background: "#EAE6F1", color: "#4C3F63" }}
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
                    className="ts-fade mt-4 p-4 rounded-2xl"
                    style={{
                      background: "#F6E9D3",
                      border: "1px solid #B9791F",
                    }}
                  >
                    <p
                      className="font-bold text-sm mb-1"
                      style={{ color: "#8A5A15" }}
                    >
                      تفاصيل العنصر: {selectedMindNode.label}
                    </p>
                    <p className="text-sm" style={{ color: "#5F4416" }}>
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
                        style={{ background: "#10665A" }}
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
            className="rounded-3xl p-6 mb-6 shadow-sm bg-white"
            style={{ border: "1px solid #DED4BD" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg" style={{ color: "#10665A" }}>
                🕒 الخط الزمني والأحداث
              </h3>
              <button
                type="button"
                onClick={() => setShowTimeline((prev) => !prev)}
                className="text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                style={{ background: "#EAE6F1", color: "#4C3F63" }}
              >
                {showTimeline ? "إخفاء" : "إظهار"}
              </button>
            </div>
            {showTimeline && (
              <div className="flex flex-col gap-4">
                {scene.timeline.map((item, idx) => (
                  <div
                    key={item.id || `timeline-item-${idx}`}
                    className="flex gap-4 p-4 rounded-2xl border"
                    style={{ background: "#FAF6ED", borderColor: "#DED4BD" }}
                  >
                    <div
                      className="font-black px-3 py-2 rounded-xl h-fit text-sm whitespace-nowrap"
                      style={{ background: "#10665A", color: "#FAF6ED" }}
                    >
                      {item.date}
                    </div>
                    <div className="flex-1">
                      <h4
                        className="font-bold text-base mb-1"
                        style={{ color: "#22291F" }}
                      >
                        {item.title}
                      </h4>
                      <p className="text-sm mb-2" style={{ color: "#5C5A4A" }}>
                        {item.description}
                      </p>
                      {item.location && (
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "#B9791F" }}
                        >
                          📍 الموقع: {item.location}
                        </p>
                      )}
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title || "حدث"}
                          className="mt-2 rounded-xl max-h-40 object-cover w-full block"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* قسم الأسئلة والتحقق من الفهم */}
        {!sceneContentLocked && scene && !isFinalReviewScene && Array.isArray(scene.questions) && scene.questions.length > 0 && (
          <div
            className="rounded-3xl p-6 mb-6 shadow-sm bg-white"
            style={{ border: "1px solid #DED4BD" }}
          >
            <h3 className="font-bold text-lg mb-4" style={{ color: "#10665A" }}>
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
                  journey.completeScene?.();
                }}
                className="w-full px-5 py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: isSceneCompleted(sceneIndex) ? "#0E5348" : "#10665A" }}
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
            <div className="flex justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => tryOpenScene(sceneIndex - 1)}
                disabled={sceneIndex <= 0}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold disabled:opacity-40"
                style={{ background: "#EAE6F1", color: "#4C3F63" }}
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
                className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: "#10665A" }}
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
              <div className="rounded-3xl p-6 text-center bg-white shadow-sm" style={{ border: "1px solid #10665A" }}>
                <p className="text-3xl mb-2">🎉</p>
                <p className="font-black text-lg" style={{ color: "#10665A" }}>تم إكمال الدرس</p>
                <p className="text-sm mt-1" style={{ color: "#5C5A4A" }}>أحسنت — أنهيت رحلة هذا الدرس على مَدَار.</p>
              </div>
            )}
            <div className="rounded-3xl p-5 bg-white shadow-sm" style={{ border: "1px solid #DED4BD" }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: "#10665A" }}>🧠 المراجعة النهائية</h3>
              <p className="text-xs mb-4" style={{ color: "#8A8570" }}>ملخص من كل مشاهد الدرس: خريطة ذهنية وخط زمني وأسئلة.</p>
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
                  <div className="flex flex-col gap-3">
                    {fullTimeline.map((item, idx) => (
                      <div key={item.id || `ft-${idx}`} className="p-3 rounded-xl" style={{ background: "#FAF6ED", border: "1px solid #DED4BD" }}>
                        <p className="font-bold text-xs" style={{ color: "#10665A" }}>{item.date}</p>
                        <p className="text-sm font-bold" style={{ color: "#22291F" }}>{item.title}</p>
                        {item.description && <p className="text-xs mt-1" style={{ color: "#5C5A4A" }}>{item.description}</p>}
                      </div>
                    ))}
                  </div>
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
                <p className="text-sm" style={{ color: "#8A8570" }}>لا توجد عناصر مراجعة مجمّعة بعد — أضف محتوى في المشاهد من الاستوديو.</p>
              )}
            </div>
            {hasJourney && !isTeacherView && !isLessonDone && (
              <button
                type="button"
                onClick={() => journey.completeFinalReview?.()}
                className="w-full px-5 py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: "#10665A" }}
              >
                ✓ إنهاء المراجعة وإكمال الدرس
              </button>
            )}
            <button
              type="button"
              onClick={() => tryOpenScene(Math.max(0, sceneCount - 1))}
              className="w-full px-5 py-2.5 rounded-2xl text-sm font-bold"
              style={{ background: "#EAE6F1", color: "#4C3F63" }}
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