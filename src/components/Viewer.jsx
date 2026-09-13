import { useEffect, useRef, useState } from "react";

export function Pill({ children, tone = "teal" }) {
  const tones = {
    teal: { bg: "#E4F0EC", color: "#0E5348" },
    plum: { bg: "#EAE6F1", color: "#4C3F63" },
    ochre: { bg: "#F6E9D3", color: "#8A5A15" },
  };
  const t = tones[tone] || tones.teal;
  return (
    <span style={{ background: t.bg, color: t.color }} className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Image upload field
// ---------------------------------------------------------------------------
export function ImageUploadField({ value, onChange, label, uploadFn }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadFn(file);
      onChange(url);
    } catch (e) {
      setError("تعذر رفع الصورة، حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-2">
      {label && <span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>{label}</span>}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => inputRef.current && inputRef.current.click()}
          disabled={uploading}
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#EAE6F1", color: "#4C3F63" }}
        >
          {uploading ? "جاري الرفع..." : "📁 اختيار صورة من الجهاز"}
        </button>
        {value && !uploading && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange("")}
            className="text-xs px-2 py-1 rounded font-bold"
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
            handleFile(e.target.files && e.target.files[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#C53030" }}>{error}</p>}
      {value && <img src={value} alt="" className="mt-2 rounded-xl max-h-32 object-cover block" />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unified Hotword Text & Popup Renderer (نص متوهج طبيعي بدون مربع)
// ---------------------------------------------------------------------------
export function HotwordRenderer({ text, hotwords, onJumpToScene }) {
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

  let processedHtml = text || "";

  if (hotwords && hotwords.length > 0) {
    hotwords.forEach((hw) => {
      if (!hw || !hw.text) return;
      const escaped = hw.text.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      if (!escaped) return;
      const regex = new RegExp(`(?<!<[^>]*)${escaped}(?![^<]*>)`, "gi");
      processedHtml = processedHtml.replace(
        regex,
        `<span class="ts-hotword-glow" data-hwid="${hw.id}">${hw.text}</span>`
      );
    });
  }

  const handleInteraction = (e, hwId) => {
    if (!hwId || !hotwords) return;
    const found = hotwords.find((h) => String(h.id) === String(hwId));
    if (found) {
      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();
      
      // حساب موقع ظهور البوكس بدقة بالنسبة للكلمة
      setPopPos({
        top: rect.bottom - parentRect.top + 8,
        right: parentRect.right - rect.right,
      });
      setActiveHot(found);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* تنسيق الكلمات التفاعلية بوهج ولون بدون مربعات أو خلفيات */}
      <style>{`
        .ts-richtext-content {
          line-height: 1.8;
          color: #22291F;
        }
        .ts-richtext-content .ts-hotword-glow {
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          color: #00796B !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          text-decoration: underline !important;
          text-decoration-style: dotted !important;
          text-underline-offset: 4px !important;
          cursor: pointer !important;
          transition: all 0.2s ease-in-out !important;
          text-shadow: 0 0 8px rgba(0, 150, 136, 0.35) !important;
        }
        .ts-richtext-content .ts-hotword-glow:hover {
          color: #004D40 !important;
          text-shadow: 0 0 12px rgba(0, 150, 136, 0.75) !important;
          text-decoration-style: solid !important;
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
        className="ts-richtext-content text-right"
        onClick={(e) => {
          const target = e.target.closest(".ts-hotword-glow");
          if (target) {
            e.stopPropagation();
            handleInteraction(e, target.getAttribute("data-hwid"));
          }
        }}
        onMouseOver={(e) => {
          const target = e.target.closest(".ts-hotword-glow");
          if (target) handleInteraction(e, target.getAttribute("data-hwid"));
        }}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />

      {/* نافذة المنبثقة للصور والملاحظات عند التفاعل */}
      {activeHot && (
        <div
          className="ts-fade absolute z-50 rounded-2xl p-4 shadow-2xl max-w-sm w-full"
          style={{
            background: "#FAF6ED",
            border: "2px solid #10665A",
            top: `${popPos.top}px`,
            right: `${Math.max(0, popPos.right)}px`,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => setActiveHot(null)}
        >
          <div className="flex justify-between items-center mb-2 border-b pb-1" style={{ borderColor: "#DED4BD" }}>
            <span className="font-bold text-base" style={{ color: "#10665A" }}>{activeHot.text}</span>
            <button
              type="button"
              onClick={() => setActiveHot(null)}
              className="font-bold px-2 py-0.5 rounded"
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
            <p className="text-sm mb-2" style={{ color: "#22291F" }}>{activeHot.note}</p>
          )}

          {activeHot.linkSceneId && onJumpToScene && (
            <button
              type="button"
              onClick={() => {
                onJumpToScene(activeHot.linkSceneId);
                setActiveHot(null);
              }}
              className="text-xs px-3 py-1.5 rounded-xl text-white font-bold w-full"
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
export function MindMapViewerNode({ node, depth = 0, onSelectNode, selectedNodeId }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  return (
    <div style={{ marginInlineStart: depth === 0 ? 0 : 20 }} className="my-1">
      <div
        onClick={(e) => { e.stopPropagation(); onSelectNode(node); }}
        className="flex items-center gap-2 py-1.5 px-3 rounded-xl cursor-pointer transition-all border"
        style={{
          background: isSelected ? "#F6E9D3" : "#FFFFFF",
          borderColor: isSelected ? "#B9791F" : "#DED4BD",
        }}
      >
        <span style={{ width: depth === 0 ? 12 : 8, height: depth === 0 ? 12 : 8, borderRadius: 999, background: depth === 0 ? "#10665A" : "#B9791F", display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontWeight: depth === 0 ? 800 : 600, color: "#22291F", fontSize: depth === 0 ? 16 : 14 }}>{node.label}</span>
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            aria-label={open ? "طي" : "توسيع"}
            className="mr-auto w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0"
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
        <div style={{ borderInlineStart: "2px dashed #DED4BD", paddingInlineStart: 12, marginTop: 4 }} className="ts-fade">
          {node.children.map((c) => (
            <MindMapViewerNode key={c.id} node={c} depth={depth + 1} onSelectNode={onSelectNode} selectedNodeId={selectedNodeId} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Student View Unified Component
// ---------------------------------------------------------------------------
export function StudentView({ lesson, embedded, controlled, isTeacherView = false }) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlled ? controlled.index : internalIndex;
  const setActiveIndex = controlled ? controlled.setIndex : setInternalIndex;

  const [showMap, setShowMap] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [selectedMindNode, setSelectedMindNode] = useState(null);

  useEffect(() => {
    setSelectedMindNode(null);
  }, [activeIndex, lesson.id]);

  const scene = lesson.scenes[Math.min(activeIndex, lesson.scenes.length - 1)];
  if (!scene) return <div className="p-8 text-center" style={{ color: "#8A8570" }}>لا توجد مشاهد متاحة في هذا الدرس.</div>;

  const quickRecallItems = (scene.quickRecall || []).filter((item) => item && item.trim());

  return (
    <div className="ts-root ts-scrollbar" style={{ minHeight: embedded ? "100%" : "100vh", background: "#FAF6ED", overflowY: "auto" }}>
      <div className={embedded ? "px-4 py-4" : "max-w-3xl mx-auto px-5 py-8"}>
        <div className="text-center mb-3">
          <Pill tone="teal">{lesson.stage} · {lesson.grade} · {lesson.term} · {lesson.subject}</Pill>
        </div>
        <div className="text-center mb-6">
          <h1 className="ts-display font-black" style={{ color: "#22291F", fontSize: embedded ? 24 : 32 }}>{lesson.title}</h1>
          {lesson.description && <p className="text-sm mt-1" style={{ color: "#5C5A4A" }}>{lesson.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {lesson.scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIndex(i)}
              className="px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm"
              style={{
                background: i === activeIndex ? "#10665A" : "#FFFFFF",
                color: i === activeIndex ? "#FAF6ED" : "#22291F",
                border: "1px solid " + (i === activeIndex ? "#10665A" : "#DED4BD"),
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {isTeacherView && scene.presenterNotes && (
          <div className="rounded-2xl p-4 mb-4" style={{ background: "#FDF9EE", border: "1px solid #B9791F" }}>
            <p className="font-bold text-xs mb-1" style={{ color: "#8A5A15" }}>📌 ملاحظات المُقدّم (خاص بك):</p>
            <p className="text-sm" style={{ color: "#5F4416" }}>{scene.presenterNotes}</p>
          </div>
        )}

        {scene.quickRecallShow !== false && quickRecallItems.length > 0 && (
          <div className="rounded-2xl p-4 mb-5" style={{ background: "#E4F0EC", border: "1px solid #10665A" }}>
            <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>🧠 تذكّر سريع:</p>
            <ol className="list-decimal list-inside text-sm space-y-1" style={{ color: "#22291F" }}>
              {quickRecallItems.map((item, idx) => <li key={idx}>{item}</li>)}
            </ol>
          </div>
        )}

        <div key={scene.id} className="ts-fade rounded-3xl p-6 sm:p-8 mb-6 shadow-sm bg-white" style={{ border: "1px solid #DED4BD" }}>
          <h2
            className="text-xl font-bold mb-4 pb-2 border-b"
            style={{ color: "#10665A", borderColor: "#DED4BD", fontFamily: scene.titleFont || "Amiri" }}
          >
            {scene.title}
          </h2>
          <HotwordRenderer
            text={scene.text}
            hotwords={scene.hotwords}
            onJumpToScene={(targetSceneId) => {
              const targetIdx = lesson.scenes.findIndex((s) => s.id === targetSceneId);
              if (targetIdx !== -1) setActiveIndex(targetIdx);
            }}
          />
        </div>

        {scene.mindmap && scene.mindmap.label && (
          <div className="rounded-3xl p-6 mb-6 shadow-sm bg-white" style={{ border: "1px solid #DED4BD" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg" style={{ color: "#10665A" }}>🧠 الخريطة الذهنية للدرس</h3>
              <button onClick={() => setShowMap(!showMap)} className="text-xs px-3 py-1.5 rounded-xl font-bold" style={{ background: "#EAE6F1", color: "#4C3F63" }}>
                {showMap ? "إخفاء" : "إظهار"}
              </button>
            </div>
            {showMap && (
              <div>
                <MindMapViewerNode node={scene.mindmap} onSelectNode={(node) => setSelectedMindNode(node)} selectedNodeId={selectedMindNode?.id} />
                {selectedMindNode && (
                  <div className="ts-fade mt-4 p-4 rounded-2xl" style={{ background: "#F6E9D3", border: "1px solid #B9791F" }}>
                    <p className="font-bold text-sm mb-1" style={{ color: "#8A5A15" }}>تفاصيل العنصر: {selectedMindNode.label}</p>
                    <p className="text-sm" style={{ color: "#5F4416" }}>{selectedMindNode.description || "لا توجد تفاصيل إضافية."}</p>
                    {selectedMindNode.sceneId && (
                      <button
                        onClick={() => {
                          const idx = lesson.scenes.findIndex((s) => s.id === selectedMindNode.sceneId);
                          if (idx !== -1) setActiveIndex(idx);
                        }}
                        className="mt-2 text-xs px-3 py-1 rounded-lg text-white font-bold"
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

        {scene.timeline && scene.timeline.length > 0 && (
          <div className="rounded-3xl p-6 mb-6 shadow-sm bg-white" style={{ border: "1px solid #DED4BD" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg" style={{ color: "#10665A" }}>🕒 الخط الزمني والأحداث</h3>
              <button onClick={() => setShowTimeline(!showTimeline)} className="text-xs px-3 py-1.5 rounded-xl font-bold" style={{ background: "#EAE6F1", color: "#4C3F63" }}>
                {showTimeline ? "إخفاء" : "إظهار"}
              </button>
            </div>
            {showTimeline && (
              <div className="flex flex-col gap-4">
                {scene.timeline.map((item, idx) => (
                  <div key={item.id || idx} className="flex gap-4 p-4 rounded-2xl border" style={{ background: "#FAF6ED", borderColor: "#DED4BD" }}>
                    <div className="font-black px-3 py-2 rounded-xl h-fit text-sm" style={{ background: "#10665A", color: "#FAF6ED" }}>{item.date}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base mb-1" style={{ color: "#22291F" }}>{item.title}</h4>
                      <p className="text-sm mb-2" style={{ color: "#5C5A4A" }}>{item.description}</p>
                      {item.location && <p className="text-xs font-semibold" style={{ color: "#B9791F" }}>📍 الموقع: {item.location}</p>}
                      {item.image && <img src={item.image} alt={item.title} className="mt-2 rounded-xl max-h-40 object-cover w-full block" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {scene.questions && scene.questions.length > 0 && (
          <div className="rounded-3xl p-6 mb-6 shadow-sm bg-white" style={{ border: "1px solid #DED4BD" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "#10665A" }}>❓ تحقق من فهمك</h3>
            <div className="flex flex-col gap-4">
              {scene.questions.map((q, idx) => (
                <QuestionItem key={q.id || idx} q={q} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuestionItem({ q }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userEssay, setUserEssay] = useState("");

  if (q.type === "mcq") {
    return (
      <div className="p-4 rounded-2xl border" style={{ background: "#FAF6ED", borderColor: "#DED4BD" }}>
        <p className="font-bold mb-3" style={{ color: "#22291F" }}>{q.prompt}</p>
        <div className="flex flex-col gap-2">
          {q.options?.map((opt, i) => {
            const isCorrect = showAnswer && i === q.correctIndex;
            const isWrong = showAnswer && selectedOption === i && i !== q.correctIndex;
            return (
              <button
                key={i}
                onClick={() => !showAnswer && setSelectedOption(i)}
                className="text-right px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
                style={{
                  background: isCorrect ? "#E4F0EC" : isWrong ? "#FBEAEB" : selectedOption === i ? "#F6E9D3" : "#FFFFFF",
                  borderColor: isCorrect ? "#10665A" : isWrong ? "#C53030" : selectedOption === i ? "#B9791F" : "#DED4BD",
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
            disabled={selectedOption === null}
            onClick={() => setShowAnswer(true)}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: selectedOption === null ? "#DED4BD" : "#10665A" }}
          >
            تحقق من الإجابة
          </button>
        ) : (
          <div className="mt-3 ts-fade text-sm">
            <p className="font-bold mb-1" style={{ color: selectedOption === q.correctIndex ? "#10665A" : "#C53030" }}>
              {selectedOption === q.correctIndex ? "إجابة صحيحة بارك الله فيك!" : `إجابة غير دقيقة. الإجابة الصحيحة هي: ${q.options[q.correctIndex]}`}
            </p>
            {q.explanation && <p className="text-xs" style={{ color: "#5C5A4A" }}>💡 {q.explanation}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl border" style={{ background: "#FAF6ED", borderColor: "#DED4BD" }}>
      <p className="font-bold mb-3" style={{ color: "#22291F" }}>{q.prompt}</p>
      <textarea
        value={userEssay}
        onChange={(e) => setUserEssay(e.target.value)}
        rows={2}
        placeholder="اكتب إجابتك هنا..."
        className="ts-input text-sm mb-2"
      />
      {!showAnswer ? (
        <button onClick={() => setShowAnswer(true)} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "#10665A" }}>
          عرض الإجابة النموذجية
        </button>
      ) : (
        <div className="ts-fade mt-3 p-3 rounded-xl text-sm" style={{ background: "#E4F0EC", border: "1px solid #10665A" }}>
          <p className="font-bold mb-1" style={{ color: "#0E5348" }}>الإجابة النموذجية:</p>
          <p style={{ color: "#22291F" }}>{q.modelAnswer}</p>
        </div>
      )}
    </div>
  );
}