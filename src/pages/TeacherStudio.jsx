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
import { STATUSES, statusMeta, uid } from "../lib/constants";
import { slugify } from "../lib/slugify";
import {
  getLessonWithScenes,
  updateLessonMeta,
  updateScene,
  createScene,
  deleteScene,
  uploadLessonImage,
  extractYouTubeId,
  SCENE_TYPES,
  listCurriculumNodes,
  listCompletionTemplates,
  updateLessonJourney,
  setLessonMembersOnly,
} from "../lib/db";
import PresentationTools from "../components/PresentationTools";

const AUTOSAVE_DELAY = 800;

const SEO_TITLE_LIMIT = 60;
const SEO_DESCRIPTION_LIMIT = 160;

// SEO fallback-chain helpers used only for the live TeacherStudio preview.
// Mirror the same fallback chain applied on the actual student-facing page
// (src/pages/StudentLessonPage.jsx) — this is a preview render, not a second
// implementation of the slug algorithm (slugify() itself stays single-source).
function seoEffectiveTitle(lesson) {
  return (lesson.seoTitle && lesson.seoTitle.trim()) || lesson.title || "";
}
function seoEffectiveDescription(lesson) {
  return (
    (lesson.seoDescription && lesson.seoDescription.trim()) ||
    (lesson.description && lesson.description.trim()) ||
    (lesson.title ? `تعلّم درس "${lesson.title}" على منصة مَدَار التعليمية.` : "")
  );
}
function seoEffectiveSlug(lesson) {
  const raw = (lesson.seoSlug && lesson.seoSlug.trim()) || lesson.title || "";
  return slugify(raw);
}

/**
 * Collapsible "🔎 إعدادات محركات البحث" card inside TeacherStudio's lesson
 * sidebar. Purely a UI layer: all persistence goes through the same
 * patchLesson()/updateLessonMeta() pipeline already used for title, subject,
 * YouTube URL, etc. — no second save system. Never touches journey_config,
 * scenes, or lesson.title/description themselves.
 */
function SeoSettingsSection({ lesson, patchLesson, open, setOpen, slugConflict, setSlugConflict }) {
  const seoTitleLen = (lesson.seoTitle || "").length;
  const seoDescLen = (lesson.seoDescription || "").length;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const previewTitle = seoEffectiveTitle(lesson);
  const previewDescription = seoEffectiveDescription(lesson);
  const previewSlug = seoEffectiveSlug(lesson);
  const finalUrl = `${origin}/lessons/${lesson.id}/${previewSlug}`;

  return (
    <div className="mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid #DED4BD" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold"
        style={{ background: "#FAF6ED", color: "#10665A" }}
      >
        <span>🔎 إعدادات محركات البحث</span>
        <span style={{ color: "#8A8570" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-3 bg-white">
          <p className="text-[11px] mb-3" style={{ color: "#8A8570" }}>
            هذه البيانات تتحكم في طريقة ظهور الدرس لمحركات البحث والمشاركة على المنصات الاجتماعية. لا تغيّر محتوى الدرس نفسه.
          </p>

          {/* لغة SEO */}
          <label className="block mb-3">
            <span className="block text-xs mb-1 font-bold" style={{ color: "#8A8570" }}>لغة SEO</span>
            <select
              className="ts-input text-xs w-full"
              value={lesson.seoLanguage || "ar"}
              onChange={(e) => patchLesson({ seoLanguage: e.target.value }, { immediate: true })}
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </label>

          {/* عنوان SEO */}
          <label className="block mb-3">
            <span className="flex items-center justify-between text-xs mb-1 font-bold" style={{ color: "#8A8570" }}>
              <span>عنوان SEO</span>
              <span style={{ color: seoTitleLen > SEO_TITLE_LIMIT ? "#C53030" : "#8A8570" }}>
                {seoTitleLen} / {SEO_TITLE_LIMIT}
              </span>
            </span>
            <input
              className="ts-input text-xs w-full"
              placeholder={lesson.title}
              value={lesson.seoTitle || ""}
              onChange={(e) => patchLesson({ seoTitle: e.target.value })}
              onBlur={(e) => patchLesson({ seoTitle: e.target.value.trim() }, { immediate: true })}
            />
            {seoTitleLen > SEO_TITLE_LIMIT && (
              <p className="text-[11px] mt-1" style={{ color: "#C53030" }}>العنوان طويل — قد يظهر مقطوعًا في نتائج البحث.</p>
            )}
            {!lesson.seoTitle && (
              <p className="text-[11px] mt-1" style={{ color: "#8A8570" }}>بدون تعبئة، سيُستخدم عنوان الدرس تلقائيًا: «{lesson.title}»</p>
            )}
          </label>

          {/* وصف SEO */}
          <label className="block mb-3">
            <span className="flex items-center justify-between text-xs mb-1 font-bold" style={{ color: "#8A8570" }}>
              <span>وصف SEO</span>
              <span style={{ color: seoDescLen > SEO_DESCRIPTION_LIMIT ? "#C53030" : "#8A8570" }}>
                {seoDescLen} / {SEO_DESCRIPTION_LIMIT}
              </span>
            </span>
            <textarea
              className="ts-input text-xs w-full"
              rows={3}
              placeholder={lesson.description || previewDescription}
              value={lesson.seoDescription || ""}
              onChange={(e) => patchLesson({ seoDescription: e.target.value })}
              onBlur={(e) => patchLesson({ seoDescription: e.target.value.trim() }, { immediate: true })}
            />
            {seoDescLen > SEO_DESCRIPTION_LIMIT && (
              <p className="text-[11px] mt-1" style={{ color: "#C53030" }}>الوصف طويل — قد يُختصر في نتائج البحث.</p>
            )}
            {!lesson.seoDescription && (
              <p className="text-[11px] mt-1" style={{ color: "#8A8570" }}>بدون تعبئة، سيُستخدم وصف بديل تلقائيًا.</p>
            )}
          </label>

          {/* الرابط / Slug */}
          <label className="block mb-3">
            <span className="block text-xs mb-1 font-bold" style={{ color: "#8A8570" }}>الرابط / Slug</span>
            <input
              className="ts-input text-xs w-full"
              dir="ltr"
              placeholder={previewSlug}
              value={lesson.seoSlug || ""}
              onChange={(e) => {
                setSlugConflict("");
                patchLesson({ seoSlug: e.target.value });
              }}
              onBlur={(e) => patchLesson({ seoSlug: slugify(e.target.value || "") }, { immediate: true })}
            />
            {slugConflict && (
              <p className="text-[11px] mt-1" style={{ color: "#C53030" }}>{slugConflict}</p>
            )}
            {!lesson.seoSlug && !slugConflict && (
              <p className="text-[11px] mt-1" style={{ color: "#8A8570" }}>بدون تعبئة، سيُشتق تلقائيًا من عنوان الدرس: «{previewSlug}»</p>
            )}
          </label>

          {/* معاينة الرابط النهائي */}
          <div
            className="mb-4 p-2.5 rounded-lg text-[11px]"
            style={{ background: "#FAF6ED", border: "1px solid #DED4BD", direction: "ltr", textAlign: "left", wordBreak: "break-all" }}
          >
            <p className="font-bold mb-1" style={{ color: "#8A8570" }}>الرابط النهائي:</p>
            <p style={{ color: "#10665A" }}>{finalUrl}</p>
          </div>

          {/* معاينة نتيجة البحث (Google-style, تقريبية) */}
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: "#8A8570" }}>معاينة نتيجة البحث</p>
            <div className="p-3 rounded-lg" style={{ background: "#fff", border: "1px solid #DED4BD" }}>
              <p style={{ color: "#1a0dab", fontSize: "16px", lineHeight: "1.3", marginBottom: "2px", fontFamily: "arial, sans-serif" }}>
                {previewTitle || "عنوان الدرس"}
              </p>
              <p style={{ color: "#006621", fontSize: "12px", direction: "ltr", textAlign: "left" }}>
                {origin.replace(/^https?:\/\//, "")} › lessons › ...
              </p>
              <p style={{ color: "#545454", fontSize: "12px", lineHeight: "1.4" }}>
                {previewDescription || "لا يوجد وصف بعد."}
              </p>
            </div>
            <p className="text-[10px] mt-1" style={{ color: "#8A8570" }}>
              معاينة تقريبية — قد تعرض Google نصًا مختلفًا حسب عبارة البحث.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null); // null = loading, false = not found
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [addSceneError, setAddSceneError] = useState("");
  const [recording, setRecording] = useState(false);
  const [recIndex, setRecIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [saveStatus, setSaveStatus] = useState("saved"); // saving | saved | error
  const [curriculumNodes, setCurriculumNodes] = useState([]);
  const [completionTemplates, setCompletionTemplates] = useState([]);
  const [seoSectionOpen, setSeoSectionOpen] = useState(false);
  const [seoSlugConflict, setSeoSlugConflict] = useState("");

  const lessonTimerRef = useRef(null);
  const sceneTimersRef = useRef({});

  useEffect(() => {
    let mounted = true;
    Promise.all([getLessonWithScenes(id), listCurriculumNodes().catch(() => []), listCompletionTemplates().catch(() => [])])
      .then(([data, nodes, tpls]) => {
        if (!mounted) return;
        setLesson(data);
        setSelectedSceneId(data.scenes[0]?.id || null);
        setCurriculumNodes(nodes || []);
        setCompletionTemplates(tpls || []);
      })
      .catch(() => mounted && setLesson(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const uploadFn = useCallback((file) => uploadLessonImage(file, id), [id]);

  // ---- Debounced autosave: lesson metadata ---------------------------------
  // Accumulates lesson-meta patches so a later title save does not drop youtubeUrl, etc.
  const pendingLessonPatchRef = useRef({});

  const flushLessonSave = useCallback(async () => {
    const patch = pendingLessonPatchRef.current;
    if (!patch || Object.keys(patch).length === 0) return;
    pendingLessonPatchRef.current = {};
    setSaveStatus("saving");
    try {
      await updateLessonMeta(id, patch);
      setSaveStatus("saved");
      setSeoSlugConflict("");
    } catch (e) {
      console.error("Lesson Save Error:", e);
      // put back so retry can work
      pendingLessonPatchRef.current = { ...patch, ...pendingLessonPatchRef.current };
      setSaveStatus("error");
      // Friendly inline message for the SEO-slug uniqueness conflict (see updateLessonMeta in db.js)
      if (typeof e?.message === "string" && e.message.includes("الرابط (Slug)")) {
        setSeoSlugConflict(e.message);
      }
    }
  }, [id]);

  const scheduleLessonSave = useCallback(
    (patch) => {
      pendingLessonPatchRef.current = { ...pendingLessonPatchRef.current, ...patch };
      setSaveStatus("saving");
      if (lessonTimerRef.current) clearTimeout(lessonTimerRef.current);
      lessonTimerRef.current = setTimeout(() => {
        flushLessonSave();
      }, AUTOSAVE_DELAY);
    },
    [flushLessonSave]
  );

  const patchLesson = (patch, { immediate } = {}) => {
    setLesson((prev) => ({ ...prev, ...patch }));
    if (immediate) {
      // merge into pending then flush now so concurrent fields are not lost
      pendingLessonPatchRef.current = { ...pendingLessonPatchRef.current, ...patch };
      if (lessonTimerRef.current) {
        clearTimeout(lessonTimerRef.current);
        lessonTimerRef.current = null;
      }
      flushLessonSave();
    } else {
      scheduleLessonSave(patch);
    }
  };

  // Flush pending lesson meta (e.g. youtubeUrl) on unmount / navigation away
  useEffect(() => {
    return () => {
      if (lessonTimerRef.current) clearTimeout(lessonTimerRef.current);
      const patch = pendingLessonPatchRef.current;
      if (patch && Object.keys(patch).length > 0) {
        // fire-and-forget; component is unmounting
        updateLessonMeta(id, patch).catch(() => {});
        pendingLessonPatchRef.current = {};
      }
    };
  }, [id]);


  // ---- Debounced autosave: per-scene content --------------------------------
  const scheduleSceneSave = useCallback((sceneId, fullSceneState) => {
    setSaveStatus("saving");
    const timers = sceneTimersRef.current;
    if (timers[sceneId]) clearTimeout(timers[sceneId]);
    timers[sceneId] = setTimeout(async () => {
      try {
        // تنقية البيانات وإرسال الأعمدة المتوافقة فقط مع جدول Supabase
        const payloadToDB = {
          title: fullSceneState.title || "",
          text: fullSceneState.text || "",
          order_index: fullSceneState.order_index ?? fullSceneState.orderIndex ?? 0,
          quick_recall: fullSceneState.quickRecall || [],
          hotwords: fullSceneState.hotwords || [],
          mindmap: fullSceneState.mindmap || null,
          timeline: fullSceneState.timeline || [],
          questions: fullSceneState.questions || [],
          presenter_notes: fullSceneState.presenterNotes || fullSceneState.presenter_notes || "",
          sceneType: fullSceneState.sceneType || fullSceneState.scene_type || "EXPLANATION",
          titleFont: fullSceneState.titleFont || fullSceneState.title_font || null,
          quickRecallShow: fullSceneState.quickRecallShow,
          isMembersOnly: !!(fullSceneState.isMembersOnly || fullSceneState.is_members_only),
        };

        await updateScene(sceneId, payloadToDB);
        setSaveStatus("saved");
      } catch (e) {
        console.error("Scene Save Error Details:", e);
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

  const addScene = async (sceneType = "EXPLANATION") => {
    setAddSceneError("");
    setShowTypePicker(false);
    try {
      const orderIndex = lesson.scenes.length;
      const newScene = await createScene(id, orderIndex, undefined, sceneType);
      setLesson((prev) => ({ ...prev, scenes: [...prev.scenes, newScene] }));
      setSelectedSceneId(newScene.id);
    } catch (e) {
      console.error("addScene failed:", e);
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("scene_type") || msg.includes("migration")) {
        setAddSceneError("تعذر إضافة المشهد. نفّذ migration_scene_types.sql في Supabase ثم أعد المحاولة.");
      } else {
        setAddSceneError("تعذر إضافة المشهد. تحقق من الاتصال وحاول مرة أخرى.");
      }
      setSaveStatus("error");
    }
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

  // تنقّل المشاهد أثناء التصوير فقط (Escape واختصارات الأدوات أصبحت داخل PresentationTools)
  const onKey = useCallback(
    (e) => {
      if (!recording || !lesson) return;
      if (e.key === "ArrowLeft") setRecIndex((i) => Math.min(i + 1, lesson.scenes.length - 1));
      if (e.key === "ArrowRight") setRecIndex((i) => Math.max(i - 1, 0));
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

  // إعداد "رحلة الدرس" الخاص بهذا المشهد فقط — مستقل عن أي مشهد آخر
  const sceneJourney =
    (scene && lesson.journeyConfig?.sceneCompletions?.[scene.id]) ||
    { enabled: false, completionTemplateKey: "none" };

  const saveLabel =
    saveStatus === "saving" ? "جاري الحفظ..." : saveStatus === "error" ? "تعذر الحفظ — إعادة المحاولة" : "تم الحفظ ✓";
  const saveColor = saveStatus === "error" ? "#C53030" : saveStatus === "saving" ? "#8A5A15" : "#0E5348";

  // المسار (Cascading) — كل مستوى يُفلتَر بـ parentId الحقيقي التابع للمستوى الأب المختار فعليًا.
  // إذا كانت القيمة المحفوظة لا تطابق أي node بنفس parentId الصحيح، تُعامل كغير صالحة (لا تُخمَّن).
  const stageNode = curriculumNodes.find((n) => n.kind === "stage" && n.name === lesson.stage) || null;
  const gradeNode =
    (stageNode &&
      curriculumNodes.find((n) => n.kind === "grade" && n.name === lesson.grade && n.parentId === stageNode.id)) ||
    null;
  const termNode =
    (gradeNode &&
      curriculumNodes.find((n) => n.kind === "term" && n.name === lesson.term && n.parentId === gradeNode.id)) ||
    null;
  const stageOptions = curriculumNodes.filter((n) => n.kind === "stage");
  const gradeOptions = stageNode ? curriculumNodes.filter((n) => n.kind === "grade" && n.parentId === stageNode.id) : [];
  const termOptions = gradeNode ? curriculumNodes.filter((n) => n.kind === "term" && n.parentId === gradeNode.id) : [];
  const subjectOptions = termNode ? curriculumNodes.filter((n) => n.kind === "subject" && n.parentId === termNode.id) : [];

  if (recording) {
    return (
      <div className="ts-root flex items-center justify-center" style={{ height: "calc(100vh - 41px)", background: "#0E1712", overflow: "hidden" }}>
        <PresentationTools onExit={() => setRecording(false)}>
          <StudentView lesson={lesson} embedded controlled={{ index: recIndex, setIndex: setRecIndex }} isTeacherView recordingMode />
        </PresentationTools>
      </div>
    );
  }

  return (
    <div className="ts-root" style={{ minHeight: "calc(100vh - 41px)", background: "#FAF6ED" }}>
      {/* Header Bar */}
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
            <input className="ts-input text-xs w-full" value={lesson.title} onChange={(e) => patchLesson({ title: e.target.value })} />
          </label>
          <p className="text-[11px] mb-2 font-bold" style={{ color: "#8A8570" }}>
            المسار: {[lesson.stage, lesson.grade, lesson.term, lesson.subject].filter(Boolean).join(" / ") || "—"}
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <select
              className="ts-input text-xs"
              value={lesson.stage || ""}
              onChange={(e) => {
                const newStage = e.target.value;
                const newStageNode = curriculumNodes.find((n) => n.kind === "stage" && n.name === newStage) || null;
                const gradeValid =
                  newStageNode &&
                  curriculumNodes.some((n) => n.kind === "grade" && n.name === lesson.grade && n.parentId === newStageNode.id);
                const patch = { stage: newStage };
                if (!gradeValid) {
                  patch.grade = "";
                  patch.term = "";
                  patch.subject = "";
                }
                patchLesson(patch, { immediate: true });
              }}
            >
              <option value="">المرحلة</option>
              {stageOptions.map((n) => <option key={n.id} value={n.name}>{n.name}</option>)}
              {lesson.stage && !stageOptions.some((n) => n.name === lesson.stage) && (
                <option value={lesson.stage}>{lesson.stage}</option>
              )}
            </select>
            <select
              className="ts-input text-xs"
              value={lesson.grade || ""}
              onChange={(e) => {
                const newGrade = e.target.value;
                const newGradeNode =
                  stageNode && curriculumNodes.find((n) => n.kind === "grade" && n.name === newGrade && n.parentId === stageNode.id);
                const termValid =
                  newGradeNode &&
                  curriculumNodes.some((n) => n.kind === "term" && n.name === lesson.term && n.parentId === newGradeNode.id);
                const patch = { grade: newGrade };
                if (!termValid) {
                  patch.term = "";
                  patch.subject = "";
                }
                patchLesson(patch, { immediate: true });
              }}
            >
              <option value="">الصف</option>
              {gradeOptions.map((n) => <option key={n.id} value={n.name}>{n.name}</option>)}
              {lesson.grade && !gradeOptions.some((n) => n.name === lesson.grade) && (
                <option value={lesson.grade}>{lesson.grade}</option>
              )}
            </select>
            <select
              className="ts-input text-xs"
              value={lesson.term || ""}
              onChange={(e) => {
                const newTerm = e.target.value;
                const newTermNode =
                  gradeNode && curriculumNodes.find((n) => n.kind === "term" && n.name === newTerm && n.parentId === gradeNode.id);
                const subjectValid =
                  newTermNode &&
                  curriculumNodes.some((n) => n.kind === "subject" && n.name === lesson.subject && n.parentId === newTermNode.id);
                const patch = { term: newTerm };
                if (!subjectValid) {
                  patch.subject = "";
                }
                patchLesson(patch, { immediate: true });
              }}
            >
              <option value="">الترم</option>
              {termOptions.map((n) => <option key={n.id} value={n.name}>{n.name}</option>)}
              {lesson.term && !termOptions.some((n) => n.name === lesson.term) && (
                <option value={lesson.term}>{lesson.term}</option>
              )}
            </select>
            <select className="ts-input text-xs" value={lesson.subject || ""} onChange={(e) => patchLesson({ subject: e.target.value }, { immediate: true })}>
              <option value="">القسم / المادة</option>
              {subjectOptions.map((n) => <option key={n.id} value={n.name}>{n.name}</option>)}
              {lesson.subject && !subjectOptions.some((n) => n.name === lesson.subject) && (
                <option value={lesson.subject}>{lesson.subject}</option>
              )}
            </select>
          </div>

          {/* وصول الدرس — Access Lock على مستوى الدرس (journey_config.isMembersOnly) */}
          <div className="mb-4 p-3 rounded-xl" style={{ background: "#FAF6ED", border: "1px solid #DED4BD" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#10665A" }}>الوصول إلى الدرس</p>
            <label className="text-xs flex items-center gap-2 cursor-pointer mb-1">
              <input
                type="radio"
                name="lesson-access"
                checked={!(lesson.isMembersOnly || lesson.journeyConfig?.isMembersOnly)}
                onChange={async () => {
                  try {
                    const cfg = await setLessonMembersOnly(lesson.id, false, lesson.journeyConfig || {});
                    setLesson((prev) => ({ ...prev, journeyConfig: cfg, isMembersOnly: false }));
                    setSaveStatus("saved");
                  } catch {
                    setSaveStatus("error");
                  }
                }}
              />
              🌍 متاح للجميع
            </label>
            <label className="text-xs flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="lesson-access"
                checked={!!(lesson.isMembersOnly || lesson.journeyConfig?.isMembersOnly)}
                onChange={async () => {
                  try {
                    const cfg = await setLessonMembersOnly(lesson.id, true, lesson.journeyConfig || {});
                    setLesson((prev) => ({ ...prev, journeyConfig: cfg, isMembersOnly: true }));
                    setSaveStatus("saved");
                  } catch {
                    setSaveStatus("error");
                  }
                }}
              />
              🔐 للمستخدمين المسجّلين فقط
            </label>
            <p className="text-[11px] mt-2" style={{ color: "#8A8570" }}>
              عند التفعيل، الزائر (Guest) يرى قفل تسجيل الدخول وليس «أكمل الدرس السابق».
            </p>
          </div>

          <label className="block mb-4">
            <span className="block text-xs mb-1 font-bold" style={{ color: "#8A8570" }}>فيديو الدرس (YouTube — اختياري)</span>
            <input className="ts-input text-xs w-full" type="url" placeholder="https://www.youtube.com/watch?v=..."
              value={lesson.youtubeUrl || ""}
              onChange={(e) => patchLesson({ youtubeUrl: e.target.value })}
              onBlur={(e) => patchLesson({ youtubeUrl: (e.target.value || "").trim() }, { immediate: true })}
            />
            {lesson.youtubeUrl && !extractYouTubeId(lesson.youtubeUrl) && (
              <p className="text-[11px] mt-1" style={{ color: "#C53030" }}>أدخل رابط YouTube صحيحًا.</p>
            )}
            {lesson.youtubeUrl && extractYouTubeId(lesson.youtubeUrl) && (
              <p className="text-[11px] mt-1" style={{ color: "#0E5348" }}>✓ سيتم عرض الفيديو للطالب</p>
            )}
          </label>

          <SeoSettingsSection lesson={lesson} patchLesson={patchLesson} open={seoSectionOpen} setOpen={setSeoSectionOpen} slugConflict={seoSlugConflict} />

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
              <span className="truncate">
                {(s.isMembersOnly || s.is_members_only) ? "🔐 " : ""}
                {(SCENE_TYPES.find((x) => x.key === (s.sceneType || s.scene_type)) || {}).icon || ""} {s.title}
              </span>
              {lesson.scenes.length > 1 && (
                <button type="button" onClick={(e) => { e.stopPropagation(); removeScene(s.id); }} style={{ color: "#C53030" }}>×</button>
              )}
            </div>
          ))}
          {addSceneError && (
            <p className="text-[11px] mb-2" style={{ color: "#C53030" }}>{addSceneError}</p>
          )}
          {!showTypePicker ? (
            <button type="button" onClick={() => setShowTypePicker(true)} className="w-full mt-2 py-2 rounded-xl text-xs font-bold" style={{ background: "#EAE6F1", color: "#4C3F63" }}>+ إضافة مشهد جديد</button>
          ) : (
            <div className="mt-2 p-2 rounded-xl border" style={{ borderColor: "#DED4BD", background: "#FAF6ED" }}>
              <p className="text-[11px] font-bold mb-2" style={{ color: "#5C5A4A" }}>نوع المشهد:</p>
              <div className="flex flex-col gap-1.5">
                {SCENE_TYPES.map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => addScene(st.key)}
                    className="w-full text-right px-2.5 py-2 rounded-lg text-xs font-bold"
                    style={{ background: "#FFFFFF", border: "1px solid #DED4BD", color: "#22291F" }}
                  >
                    {st.icon} {st.label}
                  </button>
                ))}
                <button type="button" onClick={() => setShowTypePicker(false)} className="text-[11px] mt-1" style={{ color: "#8A8570" }}>إلغاء</button>
              </div>
            </div>
          )}
        </div>

        {/* Scene Editor Content */}
        {scene && (
          <div key={scene.id} className="p-6 ts-scrollbar" style={{ overflowY: "auto" }}>
            <div className="max-w-2xl mx-auto">
              
              {/* عنوان المشهد */}
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1" style={{ color: "#5C5A4A" }}>عنوان المشهد</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="ts-input text-xs flex-1"
                    style={{ width: "100%", padding: "8px 12px" }}
                    value={scene.title || ""}
                    onChange={(e) => patchScene(scene.id, { title: e.target.value })}
                    placeholder="اكتب عنوان المشهد هنا..."
                  />
                  <select
                    className="ts-input text-xs"
                    style={{ width: "110px", flexShrink: 0 }}
                    value={scene.titleFont || "Amiri"}
                    onChange={(e) => patchScene(scene.id, { titleFont: e.target.value })}
                  >
                    <option value="Amiri">Amiri</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Tajawal">Tajawal</option>
                    <option value="Almarai">Almarai</option>
                  </select>
                </div>
              </div>

              {/* رحلة الدرس — إعداد إشعار الإكمال الخاص بهذا المشهد فقط */}
              <div className="mb-4 p-3 rounded-xl" style={{ background: "#FAF6ED", border: "1px solid #DED4BD" }}>
                <p className="text-xs font-bold mb-2" style={{ color: "#10665A" }}>رحلة الدرس (لهذا المشهد)</p>
                <label className="block text-[11px] mb-1" style={{ color: "#8A8570" }}>إشعار الإكمال بعد هذا المشهد</label>
                <select
                  className="ts-input text-xs w-full mb-2"
                  value={sceneJourney.enabled ? "yes" : "no"}
                  onChange={async (e) => {
                    const enabled = e.target.value === "yes";
                    const prevEntry =
                      lesson.journeyConfig?.sceneCompletions?.[scene.id] ||
                      { enabled: false, completionTemplateKey: "none" };
                    const cfg = {
                      ...(lesson.journeyConfig || {}),
                      sceneCompletions: {
                        ...(lesson.journeyConfig?.sceneCompletions || {}),
                        [scene.id]: {
                          ...prevEntry,
                          enabled,
                          completionTemplateKey:
                            prevEntry.completionTemplateKey && prevEntry.completionTemplateKey !== "none"
                              ? prevEntry.completionTemplateKey
                              : "lesson_done",
                        },
                      },
                    };
                    setLesson((prev) => ({ ...prev, journeyConfig: cfg }));
                    try {
                      await updateLessonJourney(lesson.id, cfg);
                      setSaveStatus("saved");
                    } catch (e) {
                      console.error("Scene Journey Save Error:", e);
                      setSaveStatus("error");
                    }
                  }}
                >
                  <option value="no">بدون إشعار</option>
                  <option value="yes">إظهار إشعار إكمال بعد هذا المشهد</option>
                </select>
                <label className="block text-[11px] mb-1" style={{ color: "#8A8570" }}>نوع الرسالة</label>
                <select
                  className="ts-input text-xs w-full"
                  value={sceneJourney.completionTemplateKey || "none"}
                  disabled={!sceneJourney.enabled}
                  onChange={async (e) => {
                    const prevEntry =
                      lesson.journeyConfig?.sceneCompletions?.[scene.id] ||
                      { enabled: false, completionTemplateKey: "none" };
                    const cfg = {
                      ...(lesson.journeyConfig || {}),
                      sceneCompletions: {
                        ...(lesson.journeyConfig?.sceneCompletions || {}),
                        [scene.id]: {
                          ...prevEntry,
                          completionTemplateKey: e.target.value,
                        },
                      },
                    };
                    setLesson((prev) => ({ ...prev, journeyConfig: cfg }));
                    try {
                      await updateLessonJourney(lesson.id, cfg);
                      setSaveStatus("saved");
                    } catch (e) {
                      console.error("Scene Journey Save Error:", e);
                      setSaveStatus("error");
                    }
                  }}
                >
                  {(completionTemplates.length
                    ? completionTemplates
                    : [
                        { key: "none", label: "بدون إشعار" },
                        { key: "lesson_done", label: "تم إكمال الدرس" },
                        { key: "review_done", label: "تم إكمال المراجعة" },
                        { key: "quiz_done", label: "تم إكمال الاختبار" },
                      ]
                  ).map((tpl) => (
                    <option key={tpl.key} value={tpl.key}>{tpl.label || tpl.key}</option>
                  ))}
                </select>
              </div>

              {/* النوع الأساسي + صلاحية الوصول */}
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "#8A8570" }}>النوع الأساسي:</span>
                  <select
                    className="ts-input text-xs"
                    style={{ width: "auto" }}
                    value={scene.sceneType || scene.scene_type || "EXPLANATION"}
                    onChange={(e) => patchScene(scene.id, { sceneType: e.target.value })}
                  >
                    {SCENE_TYPES.map((st) => (
                      <option key={st.key} value={st.key}>{st.icon} {st.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold" style={{ color: "#8A8570" }}>المحتوى:</span>
                  <label className="text-xs flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`access-${scene.id}`}
                      checked={!(scene.isMembersOnly || scene.is_members_only)}
                      onChange={() => patchScene(scene.id, { isMembersOnly: false })}
                    />
                    🌍 متاح للجميع
                  </label>
                  <label className="text-xs flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`access-${scene.id}`}
                      checked={!!(scene.isMembersOnly || scene.is_members_only)}
                      onChange={() => patchScene(scene.id, { isMembersOnly: true })}
                    />
                    🔒 حصري للأعضاء
                  </label>
                </div>
              </div>

              {(() => {
                const st = scene.sceneType || scene.scene_type || "EXPLANATION";
                const isFull = st === "EXPLANATION";
                const showExpl = isFull;
                const showQR = isFull || st === "QUICK_RECALL";
                const showMM = isFull || st === "MIND_MAP";
                const showTL = isFull || st === "TIMELINE";
                const showQ = isFull || st === "QUESTIONS";
                const isFinalReviewType = st === "FINAL_REVIEW";
                return (
                  <>
              {isFinalReviewType && (
                <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: "#E4F0EC", border: "1px solid #10665A", color: "#0E5348" }}>
                  📚 هذا المشهد يعرض تلقائيًا المراجعة المجمّعة للدرس (الخريطة الذهنية الكاملة، الخط الزمني الكامل، وأسئلة المراجعة) بالاعتماد على محتوى بقية المشاهد — لا حاجة لإضافة محتوى هنا يدويًا.
                </div>
              )}
              {showExpl && (
              <>
              <label className="block mb-4">
                <span className="block text-xs font-bold mb-1" style={{ color: "#5C5A4A" }}>📝 محتوى الشرح (Rich Text)</span>
                <RichTextEditor
                  value={scene.text}
                  onChange={(html) => patchScene(scene.id, { text: html })}
                  uploadFn={uploadFn}
                  onHotwordDetected={(hw) => {
                    const existing = scene.hotwords || [];
                    if (existing.some((h) => h.id === hw.id || h.text === hw.text)) return;
                    patchScene(scene.id, {
                      hotwords: [
                        ...existing,
                        { id: hw.id, text: hw.text, note: "", image: "", linkSceneId: "" },
                      ],
                    });
                  }}
                />
              </label>
              <StudioHotwords
                hotwords={scene.hotwords || []}
                uploadFn={uploadFn}
                onAdd={(hw) => {
                  const existing = scene.hotwords || [];
                  if (existing.some((h) => h.text === hw.text)) return;
                  patchScene(scene.id, { hotwords: [...existing, hw] });
                }}
                onRemove={(hwId) =>
                  patchScene(scene.id, {
                    hotwords: (scene.hotwords || []).filter((h) => h.id !== hwId),
                  })
                }
                onUpdate={(hwId, data) =>
                  patchScene(scene.id, {
                    hotwords: (scene.hotwords || []).map((h) =>
                      h.id === hwId ? { ...h, ...data } : h
                    ),
                  })
                }
              />
              <label className="block mb-4">
                <span className="block text-xs font-bold mb-1" style={{ color: "#5C5A4A" }}>
                  ملاحظات المُقدّم (خاصة بك أثناء التصوير)
                </span>
                <textarea
                  value={scene.presenterNotes || scene.presenter_notes || ""}
                  onChange={(e) => patchScene(scene.id, { presenterNotes: e.target.value })}
                  rows={2}
                  className="ts-input text-xs w-full"
                  style={{ background: "#FDF9EE" }}
                />
              </label>
              </>
              )}

              {showQR && (
              <div className="mb-4 p-4 rounded-2xl bg-white border" style={{ borderColor: "#DED4BD" }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm" style={{ color: "#10665A" }}>🧠 تذكّر سريع</span>
                  <label className="text-xs flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={scene.quickRecallShow !== false}
                      onChange={(e) => patchScene(scene.id, { quickRecallShow: e.target.checked })}
                    />
                    إظهار للطالب
                  </label>
                </div>
                <p className="text-xs mb-2" style={{ color: "#8A8570" }}>
                  اكتب كل نقطة في سطر مستقل. اتركه فارغًا إن لم تحتاجه.
                </p>
                <textarea
                  className="ts-input text-xs mb-2 w-full"
                  placeholder={"مثال:\nنقطة 1\nنقطة 2"}
                  rows={4}
                  value={(scene.quickRecall || []).join("\n")}
                  onChange={(e) => patchScene(scene.id, { quickRecall: e.target.value.split("\n") })}
                  onBlur={(e) => patchScene(scene.id, { quickRecall: e.target.value.split("\n").map((x) => x.trimEnd()) })}
                />
              </div>
              )}

              {showMM && (
              <MindMapStudioBuilder
                mindmap={scene.mindmap || { id: uid("mm"), label: "", description: "", children: [] }}
                scenes={lesson.scenes}
                onChange={(map) => patchScene(scene.id, { mindmap: map })}
              />
              )}

              {showTL && (
              <TimelineStudioEditor
                items={scene.timeline || []}
                uploadFn={uploadFn}
                onAdd={(item) => patchScene(scene.id, { timeline: [...(scene.timeline || []), item] })}
                onEdit={(itemId, data) =>
                  patchScene(scene.id, {
                    timeline: (scene.timeline || []).map((t) => (t.id === itemId ? { ...t, ...data } : t)),
                  })
                }
                onDelete={(itemId) =>
                  patchScene(scene.id, {
                    timeline: (scene.timeline || []).filter((t) => t.id !== itemId),
                  })
                }
              />
              )}

              {showQ && (
              <QuestionStudioEditor
                questions={scene.questions || []}
                onAdd={(q) => patchScene(scene.id, { questions: [...(scene.questions || []), q] })}
                onUpdate={(qId, data) =>
                  patchScene(scene.id, {
                    questions: (scene.questions || []).map((q) => (q.id === qId ? { ...q, ...data } : q)),
                  })
                }
                onDelete={(qId) =>
                  patchScene(scene.id, {
                    questions: (scene.questions || []).filter((q) => q.id !== qId),
                  })
                }
              />
              )}
                  </>
                );
              })()}

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