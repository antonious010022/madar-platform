import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

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
        /* تصميم التمييز عبر خلفية النص بدلاً من الخط السفلي */
        .ts-richtext-content .ts-hotword-highlight {
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: 600 !important;
          color: #004D40 !important;
          background-color: #C8E6C9 !important; /* لون خلفية مميز (أخضر فاتح هادئ) */
          padding: 2px 6px !important;
          margin: 0 2px !important;
          border-radius: 6px !important;
          text-decoration: none !important;
          cursor: pointer !important;
          transition: all 0.2s ease-in-out !important;
          box-shadow: inset 0 -1px 0 rgba(0,0,0,0.05);
        }
        .ts-richtext-content .ts-hotword-highlight:hover {
          background-color: #A5D6A7 !important; /* درجة أغمق قليلاً عند المرور */
          color: #00251A !important;
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
// Student View Unified Component
// ---------------------------------------------------------------------------
export function StudentView({
  lesson,
  embedded = false,
  controlled,
  isTeacherView = false,
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlled ? controlled.index : internalIndex;
  const setActiveIndex = controlled ? controlled.setIndex : setInternalIndex;

  const [showMap, setShowMap] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [selectedMindNode, setSelectedMindNode] = useState(null);

  useEffect(() => {
    setSelectedMindNode(null);
  }, [activeIndex, lesson?.id]);

  if (!lesson || !Array.isArray(lesson.scenes) || lesson.scenes.length === 0) {
    return (
      <div className="p-8 text-center text-right dir-rtl" style={{ color: "#8A8570" }}>
        لا توجد مشاهد متاحة في هذا الدرس.
      </div>
    );
  }

  const sceneIndex = Math.min(activeIndex, lesson.scenes.length - 1);
  const scene = lesson.scenes[sceneIndex];

  if (!scene) {
    return (
      <div className="p-8 text-center text-right dir-rtl" style={{ color: "#8A8570" }}>
        المشهد غير موجود.
      </div>
    );
  }

  const quickRecallItems = (scene.quickRecall || []).filter(
    (item) => item && typeof item === "string" && item.trim() !== ""
  );

  const isQuickRecallVisible = 
    scene.quickRecallShow !== false && 
    scene.quickRecallShow !== "false";
    
  return (
    <div
      className="ts-root ts-scrollbar dir-rtl text-right"
      style={{
        minHeight: embedded ? "100%" : "100vh",
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

        {/* أزرار التنقل بين المشاهد */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {lesson.scenes.map((s, i) => (
            <button
              type="button"
              key={s.id || `scene-btn-${i}`}
              onClick={() => setActiveIndex(i)}
              className="px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm cursor-pointer"
              style={{
                background: i === activeIndex ? "#10665A" : "#FFFFFF",
                color: i === activeIndex ? "#FAF6ED" : "#22291F",
                border:
                  "1px solid " + (i === activeIndex ? "#10665A" : "#DED4BD"),
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* ملاحظات المعلم/المقدم */}
        {isTeacherView && scene.presenterNotes && (
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
        {isQuickRecallVisible && quickRecallItems.length > 0 && (
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

        {/* الخريطة الذهنية */}
        {scene.mindmap && scene.mindmap.label && (
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
        {Array.isArray(scene.timeline) && scene.timeline.length > 0 && (
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
        {Array.isArray(scene.questions) && scene.questions.length > 0 && (
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
      </div>
    </div>
  );
}