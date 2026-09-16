import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLessonWithScenes, signOut, listCompletionTemplates } from "../lib/db";
import { useAuth } from "../lib/hooks";
import { StudentView } from "../components/Viewer";
import Footer from "../components/Footer";
import AuthModal, { GuestWelcomeBanner, LetterAvatar } from "../components/AuthModal";

const PROGRESS_KEY = "ts_student_progress_v2";

function defaultProgress() {
  return {
    currentScene: 0,
    completedScenes: [],
    unlockedScenes: [0],
    finalReviewUnlocked: false,
    finalReviewCompleted: false,
    lessonCompleted: false,
    view: "scene", // "scene" | "final" | "done"
  };
}

function loadProgress(lessonId, sceneCount) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.lessonId !== lessonId) return defaultProgress();
    const p = { ...defaultProgress(), ...parsed };
    // migrate from v1 shape
    if (typeof parsed.sceneIndex === "number" && !Array.isArray(parsed.completedScenes)) {
      p.currentScene = Math.min(Math.max(0, parsed.sceneIndex), Math.max(0, sceneCount - 1));
      p.unlockedScenes = Array.from({ length: p.currentScene + 1 }, (_, i) => i);
      p.completedScenes = [];
    }
    p.unlockedScenes = Array.from(new Set([0, ...(p.unlockedScenes || [])])).filter(
      (i) => i >= 0 && i < sceneCount
    );
    p.completedScenes = (p.completedScenes || []).filter((i) => i >= 0 && i < sceneCount);
    if (p.completedScenes.length >= sceneCount && sceneCount > 0) {
      p.finalReviewUnlocked = true;
    }
    return p;
  } catch {
    return defaultProgress();
  }
}

function saveProgress(lessonId, progress) {
  try {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ lessonId, ...progress, savedAt: Date.now() })
    );
  } catch (_) {}
}

function displayName(session) {
  if (!session?.user) return "";
  const u = session.user;
  return (
    u.user_metadata?.full_name ||
    u.user_metadata?.name ||
    u.email?.split("@")[0] ||
    "طالب"
  );
}

export default function StudentLessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = useAuth();
  const [lesson, setLesson] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(defaultProgress);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([getLessonWithScenes(id), listCompletionTemplates().catch(() => [])])
      .then(([data, tpls]) => {
        if (!mounted) return;
        if (!data || data.status !== "Published") {
          setLesson(false);
          return;
        }
        setLesson(data);
        setTemplates(tpls || []);
        const sc = data.scenes?.length || 0;
        setProgress(loadProgress(id, sc));
      })
      .catch(() => mounted && setLesson(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (lesson && id) saveProgress(id, progress);
  }, [id, lesson, progress]);

  const sceneCount = lesson?.scenes?.length || 0;

  const setCurrentScene = useCallback((i) => {
    setProgress((prev) => ({
      ...prev,
      currentScene: i,
      view: "scene",
    }));
  }, []);

  const completeScene = useCallback(() => {
    setProgress((prev) => {
      const i = prev.currentScene;
      const completed = Array.from(new Set([...(prev.completedScenes || []), i]));
      const unlocked = Array.from(new Set([...(prev.unlockedScenes || []), i]));
      const next = i + 1;
      const cfg = lesson?.journeyConfig || {};
      const after = cfg.completionAfterSceneIndex;
      const tpl = cfg.completionTemplateKey || "none";
      const shouldCompletion =
        after !== null &&
        after !== undefined &&
        Number(after) === i &&
        tpl &&
        tpl !== "none" &&
        !(prev.completionDismissedFor || []).includes(i);

      if (shouldCompletion) {
        return {
          ...prev,
          completedScenes: completed,
          unlockedScenes: Array.from(new Set(unlocked)).sort((a, b) => a - b),
          view: "completion",
        };
      }
      if (next < sceneCount) {
        unlocked.push(next);
        return {
          ...prev,
          completedScenes: completed,
          unlockedScenes: Array.from(new Set(unlocked)).sort((a, b) => a - b),
          currentScene: next,
          view: "scene",
        };
      }
      return {
        ...prev,
        completedScenes: completed,
        unlockedScenes: Array.from(new Set(unlocked)).sort((a, b) => a - b),
        view: "done",
        lessonCompleted: true,
      };
    });
  }, [sceneCount, lesson?.journeyConfig]);

  const openFinalReview = useCallback(() => {
    setProgress((prev) => {
      if (!prev.finalReviewUnlocked && (prev.completedScenes || []).length < sceneCount) {
        return prev;
      }
      return { ...prev, view: "final", finalReviewUnlocked: true };
    });
  }, [sceneCount]);

  const completeFinalReview = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      finalReviewCompleted: true,
      lessonCompleted: true,
      view: "done",
    }));
  }, []);

  const journeyConfig = lesson?.journeyConfig || {};
  const journey = useMemo(
    () => ({
      ...progress,
      sceneCount,
      journeyConfig,
      completionTitle: (templates.find((x) => x.key === (journeyConfig.completionTemplateKey || "")) || {}).title,
      completionBody: (templates.find((x) => x.key === (journeyConfig.completionTemplateKey || "")) || {}).body,
      setCurrentScene,
      completeScene,
      openFinalReview,
      completeFinalReview,
      dismissCompletion: () =>
        setProgress((prev) => {
          const nextIdx = (prev.currentScene ?? 0) + 1;
          if (nextIdx < sceneCount) {
            return {
              ...prev,
              view: "scene",
              currentScene: nextIdx,
              unlockedScenes: Array.from(new Set([...(prev.unlockedScenes || []), nextIdx])),
              completionDismissedFor: Array.from(
                new Set([...(prev.completionDismissedFor || []), prev.currentScene])
              ),
            };
          }
          return {
            ...prev,
            view: "done",
            lessonCompleted: true,
            finalReviewCompleted: true,
            completionDismissedFor: Array.from(
              new Set([...(prev.completionDismissedFor || []), prev.currentScene])
            ),
          };
        }),
    }),
    [progress, sceneCount, setCurrentScene, completeScene, openFinalReview, completeFinalReview]
  );

  if (lesson === null) {
    return (
      <div className="p-10 text-center dir-rtl" style={{ color: "#8A8570" }}>
        <p className="font-bold text-sm mb-1" style={{ color: "#10665A" }}>مَدَار</p>
        <p>جاري تحميل الدرس...</p>
      </div>
    );
  }
  if (lesson === false) {
    return (
      <div className="p-10 text-center dir-rtl">
        <p className="font-bold mb-2" style={{ color: "#C53030" }}>تعذّر عرض هذا الدرس</p>
        <p className="text-sm mb-4" style={{ color: "#8A8570" }}>
          قد يكون غير منشور أو غير موجود. يمكنك العودة واختيار درس آخر.
        </p>
        <button
          onClick={() => navigate("/student")}
          className="mt-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "#10665A" }}
        >
          ← العودة لمنصة الطالب
        </button>
      </div>
    );
  }

  const name = displayName(session);
  const doneCount = (progress.completedScenes || []).length;
  const progressLabel =
    progress.lessonCompleted
      ? "مكتمل"
      : progress.view === "final"
        ? "المراجعة النهائية"
        : `المشهد ${Math.min(progress.currentScene + 1, sceneCount)} من ${sceneCount}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF6ED" }}>
      <div
        className="bg-white px-4 sm:px-6 py-3 border-b flex justify-between items-center gap-2 flex-wrap"
        style={{ borderColor: "#DED4BD" }}
      >
        <button onClick={() => navigate("/student")} className="text-sm font-bold" style={{ color: "#10665A" }}>
          ← العودة لقائمة الدروس
        </button>
        <span className="text-xs font-medium truncate max-w-[40%]" style={{ color: "#8A8570" }}>
          {lesson?.title || "منصة الطالب التعليمية"}
        </span>
        <div className="relative">
          {session === undefined ? (
            <span className="text-xs" style={{ color: "#8A8570" }}>...</span>
          ) : session ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full py-1 px-2"
                aria-expanded={menuOpen}
              >
                <LetterAvatar name={name} email={session.user?.email} size={28} />
                <span className="text-xs font-bold hidden sm:inline" style={{ color: "#22291F" }}>
                  {name}
                </span>
              </button>
              {menuOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 rounded-2xl bg-white shadow-lg py-2 z-50 dir-rtl text-right"
                  style={{ border: "1px solid #DED4BD" }}
                >
                  <p className="px-4 py-1 text-xs font-bold" style={{ color: "#10665A" }}>
                    {name}
                  </p>
                  <button
                    type="button"
                    className="w-full text-right px-4 py-2 text-xs"
                    style={{ color: "#5C5A4A" }}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/student");
                    }}
                  >
                    لوحة الطالب
                  </button>
                  <button
                    type="button"
                    className="w-full text-right px-4 py-2 text-xs"
                    style={{ color: "#C53030" }}
                    onClick={async () => {
                      setMenuOpen(false);
                      try {
                        await signOut();
                      } catch (_) {}
                    }}
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
              style={{ background: "#10665A" }}
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>

      {sceneCount > 0 && (
        <div className="px-4 py-2 text-center text-xs font-bold" style={{ background: "#E4F0EC", color: "#0E5348" }}>
          تقدّم الرحلة: {progressLabel}
          {sceneCount > 0 && !progress.lessonCompleted ? ` · مشاهد مكتملة ${doneCount}/${sceneCount}` : ""}
        </div>
      )}

      <StudentView
        lesson={lesson}
        requireAuthForTools
        session={session}
        journey={journey}
      />

      <Footer />
      <GuestWelcomeBanner session={session} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
