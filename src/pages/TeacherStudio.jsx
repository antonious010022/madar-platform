import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pill, StudentView } from "../components/Viewer";
import {
  RichTextEditor,
  StudioHotwords,
  MindMapStudioBuilder,
  TimelineStudioEditor,
  QuestionStudioEditor,
} from "../components/Studio";
import { STAGES, GRADES, TERMS, STATUSES, statusMeta, uid } from "../lib/constants";
import { getLessonWithScenes, updateLessonMeta, updateScene, createScene, deleteScene, uploadLessonImage } from "../lib/db";

const AUTOSAVE_DELAY = 800;

export default function TeacherStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null); // null = loading, false = not found
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recIndex, setRecIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [saveStatus, setSaveStatus] = useState("saved"); // saving | saved | error

  const lessonTimerRef = useRef(null);
  const sceneTimersRef = useRef({});

  useEffect(() => {
    let mounted = true;
    getLessonWithScenes(id)
      .then((data) => {
        if (!mounted) return;
        setLesson(data);
        setSelectedSceneId(data.scenes[0]?.id || null);
      })
      .catch(() => mounted && setLesson(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const uploadFn = useCallback((file) => uploadLessonImage(file, id), [id]);

  // ---- Debounced autosave: lesson metadata ---------------------------------
  const scheduleLessonSave = useCallback(
    (patch) => {
      setSaveStatus("saving");
      if (lessonTimerRef.current) clearTimeout(lessonTimerRef.current);
      lessonTimerRef.current = setTimeout(async () => {
        try {
          await updateLessonMeta(id, patch);
          setSaveStatus("saved");
        } catch (e) {
          setSaveStatus("error");
        }
      }, AUTOSAVE_DELAY);
    },
    [id]
  );

  const patchLesson = (patch, { immediate } = {}) => {
    setLesson((prev) => ({ ...prev, ...patch }));
    if (immediate) {
      setSaveStatus("saving");
      updateLessonMeta(id, patch)
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
    } else {
      scheduleLessonSave(patch);
    }
  };

  // ---- Debounced autosave: per-scene content --------------------------------
  const scheduleSceneSave = useCallback((sceneId, fullSceneState) => {
    setSaveStatus("saving");
    const timers = sceneTimersRef.current;
    if (timers[sceneId]) clearTimeout(timers[sceneId]);
    timers[sceneId] = setTimeout(async () => {
      try {
        await updateScene(sceneId, fullSceneState);
        setSaveStatus("saved");
      } catch (e) {
        setSaveStatus("error");
      }
    }, AUTOSAVE_DELAY);
  }, []);

  const patchScene = (sceneId, patch) => {
    setLesson((prev) => {
      const nextScenes = prev.scenes.map((s) => (s.id === sceneId ? { ...s, ...patch } : s));
      const updated = nextScenes.find((s) => s.id === sceneId);
      scheduleSceneSave(sceneId, updated);
      return { ...prev, scenes: nextScenes };
    });
  };

  useEffect(() => {
    return () => {
      if (lessonTimerRef.current) clearTimeout(lessonTimerRef.current);
      Object.values(sceneTimersRef.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  const addScene = async () => {
    const orderIndex = lesson.scenes.length;
    const newScene = await createScene(id, orderIndex, "مشهد جديد");
    setLesson((prev) => ({ ...prev, scenes: [...prev.scenes, newScene] }));
    setSelectedSceneId(newScene.id);
  };

  const removeScene = async (sceneId) => {
    if (lesson.scenes.length <= 1) return;
    await deleteScene(sceneId);
    setLesson((prev) => {
      const nextScenes = prev.scenes.filter((s) => s.id !== sceneId);
      if (selectedSceneId === sceneId) setSelectedSceneId(nextScenes[0]?.id || null);
      return { ...prev, scenes: nextScenes };
    });
  };

  const onKey = useCallback(
    (e) => {
      if (!recording || !lesson) return;
      if (e.key === "ArrowLeft") setRecIndex((i) => Math.min(i + 1, lesson.scenes.length - 1));
      if (e.key === "ArrowRight") setRecIndex((i) => Math.max(i - 1, 0));
      if (e.key === "Escape") setRecording(false);
    },
    [recording, lesson]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (lesson === null) {
    return <div className="p-10 text-center" style={{ color: "#8A8570" }}>جاري تحميل الدرس...</div>;
  }
  if (lesson === false) {
    return <div className="p-10 text-center" style={{ color: "#C53030" }}>لم يتم العثور على هذا الدرس.</div>;
  }

  const scene = lesson.scenes.find((s) => s.id === selectedSceneId) || lesson.scenes[0];

  const saveLabel =
    saveStatus === "saving" ? "جاري الحفظ..." : saveStatus === "error" ? "تعذر الحفظ — إعادة المحاولة" : "تم الحفظ ✓";
  const saveColor = saveStatus === "error" ? "#C53030" : saveStatus === "saving" ? "#8A5A15" : "#0E5348";

  if (recording) {
    return (
      <div className="ts-root flex items-center justify-center" style={{ height: "calc(100vh - 41px)", background: "#0E1712", overflow: "hidden" }}>
        <button onClick={() => setRecording(false)} className="fixed top-14 left-5 px-4 py-2 rounded-xl text-xs z-50 shadow-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#FAF6ED" }}>خروج من التصوير (Esc)</button>
        <div className="ts-fade w-full h-full overflow-y-auto">
          <StudentView lesson={lesson} embedded controlled={{ index: recIndex, setIndex: setRecIndex }} isTeacherView />
        </div>
      </div>
    );
  }

  return (
    <div className="ts-root" style={{ minHeight: "calc(100vh - 41px)", background: "#FAF6ED" }}>
      <div className="flex items-center justify-between px-6 py-3 bg-white shadow-sm border-b flex-wrap gap-2" style={{ borderColor: "#DED4BD" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate("/teacher")} className="text-xs font-bold" style={{ color: "#8A8570" }}>← مكتبة الدروس</button>
          <h1 className="font-black text-base" style={{ color: "#10665A" }}>{lesson.title}</h1>
          <Pill tone={statusMeta(lesson.status).tone}>{statusMeta(lesson.status).label}</Pill>
          <span className="text-xs font-semibold" style={{ color: saveColor }}>{saveLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={lesson.status}
            onChange={(e) => patchLesson({ status: e.target.value }, { immediate: true })}
            className="rounded-xl px-3 py-1.5 text-xs border"
            style={{ borderColor: "#DED4BD" }}
          >
            {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowPreview(!showPreview)} className="px-3.5 py-1.5 rounded-xl text-xs font-bold" style={{ background: "#EAE6F1", color: "#4C3F63" }}>{showPreview ? "إخفاء المعاينة" : "إظهار المعاينة"}</button>
          <button onClick={() => setRecording(true)} className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm" style={{ background: "#10665A" }}>🎥 وضع التصوير</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: showPreview ? "280px 1fr 380px" : "280px 1fr", minHeight: "calc(100vh - 98px)" }}>
        {/* Scenes Sidebar */}
        <div className="p-4 ts-scrollbar bg-white border-l" style={{ borderColor: "#DED4BD", overflowY: "auto" }}>
          <label className="block mb-3">
            <span className="block text-xs mb-1" style={{ color: "#8A8570" }}>عنوان الدرس</span>
            <input className="ts-input text-xs" value={lesson.title} onChange={(e) => patchLesson({ title: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <select className="ts-input text-xs" value={lesson.stage} onChange={(e) => patchLesson({ stage: e.target.value }, { immediate: true })}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
            <select className="ts-input text-xs" value={lesson.grade} onChange={(e) => patchLesson({ grade: e.target.value }, { immediate: true })}>{GRADES.map((s) => <option key={s}>{s}</option>)}</select>
            <select className="ts-input text-xs" value={lesson.term} onChange={(e) => patchLesson({ term: e.target.value }, { immediate: true })}>{TERMS.map((s) => <option key={s}>{s}</option>)}</select>
            <input className="ts-input text-xs" value={lesson.subject} onChange={(e) => patchLesson({ subject: e.target.value })} placeholder="المادة" />
          </div>

          <p className="text-xs font-bold mb-2" style={{ color: "#8A8570" }}>مشاهد الدرس (Scenes)</p>
          {lesson.scenes.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSceneId(s.id)}
              className="rounded-xl px-3 py-2.5 mb-2 cursor-pointer text-xs font-bold shadow-sm flex items-center justify-between"
              style={{
                background: s.id === scene?.id ? "#E4F0EC" : "#FAF6ED",
                border: "1px solid " + (s.id === scene?.id ? "#10665A" : "#DED4BD"),
                color: "#22291F",
              }}
            >
              <span className="truncate">{s.title}</span>
              {lesson.scenes.length > 1 && (
                <button type="button" onClick={(e) => { e.stopPropagation(); removeScene(s.id); }} style={{ color: "#C53030" }}>×</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addScene} className="w-full mt-2 py-2 rounded-xl text-xs font-bold" style={{ background: "#EAE6F1", color: "#4C3F63" }}>+ إضافة مشهد جديد</button>
        </div>

        {/* Scene Editor Content */}
        {scene && (
          <div key={scene.id} className="p-6 ts-scrollbar" style={{ overflowY: "auto" }}>
            <div className="max-w-2xl mx-auto">
              <label className="block mb-4">
                <span className="block text-xs font-bold mb-1" style={{ color: "#5C5A4A" }}>عنوان المشهد</span>
                <input value={scene.title} onChange={(e) => patchScene(scene.id, { title: e.target.value })} className="ts-input text-sm font-bold" />
              </label>

              <label className="block mb-4">
                <span className="block text-xs font-bold mb-1" style={{ color: "#5C5A4A" }}>محتوى الشرح (Rich Text Editor)</span>
                <RichTextEditor value={scene.text} onChange={(html) => patchScene(scene.id, { text: html })} uploadFn={uploadFn} />
              </label>

              <div className="mb-4 p-4 rounded-2xl bg-white border" style={{ borderColor: "#DED4BD" }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm" style={{ color: "#10665A" }}>🧠 تذكّر سريع (Quick Recall)</span>
                  <label className="text-xs flex items-center gap-1">
                    <input type="checkbox" checked={scene.quickRecallShow !== false} onChange={(e) => patchScene(scene.id, { quickRecallShow: e.target.checked })} />
                    إظهار للطالب
                  </label>
                </div>
                <p className="text-xs mb-2" style={{ color: "#8A8570" }}>اكتب كل نقطة في سطر مستقل (اضغط Enter للانتقال لسطر جديد)، وستظهر مرقّمة تلقائياً 1، 2، 3...</p>
                <textarea
                  className="ts-input text-xs mb-2"
                  placeholder={"مثال:\nالتنافس الاستعماري بين إنجلترا وفرنسا\nموقع مصر الجغرافي الاستراتيجي"}
                  rows={5}
                  value={(scene.quickRecall || []).join("\n")}
                  onChange={(e) => patchScene(scene.id, { quickRecall: e.target.value.split("\n") })}
                  onBlur={(e) => patchScene(scene.id, { quickRecall: e.target.value.split("\n").map((x) => x.trimEnd()) })}
                />
              </div>

              <StudioHotwords
                hotwords={scene.hotwords || []}
                uploadFn={uploadFn}
                onAdd={(hw) => patchScene(scene.id, { hotwords: [...(scene.hotwords || []), hw] })}
                onRemove={(hwId) => patchScene(scene.id, { hotwords: (scene.hotwords || []).filter((h) => h.id !== hwId) })}
              />

              <MindMapStudioBuilder
                mindmap={scene.mindmap || { id: uid("mm"), label: "العنوان الرئيسي", description: "", children: [] }}
                scenes={lesson.scenes}
                onChange={(map) => patchScene(scene.id, { mindmap: map })}
              />

              <TimelineStudioEditor
                items={scene.timeline || []}
                uploadFn={uploadFn}
                onAdd={(item) => patchScene(scene.id, { timeline: [...(scene.timeline || []), item] })}
                onEdit={(itemId, data) => patchScene(scene.id, { timeline: (scene.timeline || []).map((t) => (t.id === itemId ? { ...t, ...data } : t)) })}
                onDelete={(itemId) => patchScene(scene.id, { timeline: (scene.timeline || []).filter((t) => t.id !== itemId) })}
              />

              <QuestionStudioEditor
                questions={scene.questions || []}
                onAdd={(q) => patchScene(scene.id, { questions: [...(scene.questions || []), q] })}
                onDelete={(qId) => patchScene(scene.id, { questions: (scene.questions || []).filter((q) => q.id !== qId) })}
              />

              <label className="block mb-4">
                <span className="block text-xs font-bold mb-1" style={{ color: "#5C5A4A" }}>ملاحظات المُقدّم (خاصة بك أثناء التصوير)</span>
                <textarea value={scene.presenterNotes || ""} onChange={(e) => patchScene(scene.id, { presenterNotes: e.target.value })} rows={2} className="ts-input text-xs" style={{ background: "#FDF9EE" }} />
              </label>
            </div>
          </div>
        )}

        {showPreview && (
          <div className="ts-scrollbar border-r bg-white" style={{ borderColor: "#DED4BD", overflowY: "auto" }}>
            <div className="px-4 py-2.5 bg-[#22291F] text-white text-xs font-bold text-center">معاينة حية (Live Preview)</div>
            <StudentView lesson={lesson} embedded isTeacherView />
          </div>
        )}
      </div>
    </div>
  );
}
