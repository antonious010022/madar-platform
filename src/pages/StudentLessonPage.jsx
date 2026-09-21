import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getLessonWithScenes, signOut, listCompletionTemplates } from "../lib/db";
import { useAuth } from "../lib/hooks";
import { StudentView, isLessonMembersOnly } from "../components/Viewer";
import Footer from "../components/Footer";
import AuthModal, { GuestWelcomeBanner, LetterAvatar } from "../components/AuthModal";
import { slugify } from "../lib/slugify";

const PROGRESS_KEY = "ts_student_progress_v2";
// Same origin already used for canonical links elsewhere in this project.
const SITE_ORIGIN = "https://madar-platform-five.vercel.app";

/** Resolves the slug to use in the lesson's URL: the teacher-controlled
 * seo_slug when set, otherwise one derived from the lesson title. Always
 * re-run through slugify() even when seo_slug is already set, so a slug
 * saved before validation existed (or edited directly in the DB) still
 * produces a safe URL segment. Cosmetic only — never used for lookup. */
function lessonSlug(lesson) {
  const raw = (lesson?.seoSlug && lesson.seoSlug.trim()) || lesson?.title || "";
  return slugify(raw);
}

/** Builds the SEO-friendly lesson path. lesson.id is always the real lookup key —
 * the slug is cosmetic only, so an empty/unslugifiable title still yields a valid path. */
function lessonPath(lesson) {
  const slug = lessonSlug(lesson);
  return slug ? `/lessons/${lesson.id}/${slug}` : `/lessons/${lesson.id}`;
}

/** Effective SEO title/description/language with the documented fallback chain:
 * seo_* field when set → lesson.title/description → a generated description
 * as a last resort (never invents facts, only wraps the existing title). */
function resolveSeo(lesson) {
  const title = (lesson.seoTitle && lesson.seoTitle.trim()) || lesson.title || "";
  const description =
    (lesson.seoDescription && lesson.seoDescription.trim()) ||
    (lesson.description && lesson.description.trim()) ||
    (lesson.title ? `تعلّم درس "${lesson.title}" على منصة مَدَار التعليمية.` : "");
  const language = lesson.seoLanguage || "ar";
  return { title, description: description || null, language };
}

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
  const { id, slug: slugParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  // URL freshening: lesson.id is always the real lookup key — the slug segment
  // is cosmetic — so an outdated or missing slug never breaks access; it's just
  // silently corrected in the address bar (replace, no history entry).
  useEffect(() => {
    if (!lesson || !id) return;

    // Legacy URL: /student/lesson/:id → /lessons/:id/:slug
    if (location.pathname.startsWith("/student/lesson/")) {
      navigate(lessonPath(lesson), { replace: true });
      return;
    }

    // Slug drifted (e.g. seo_slug or title changed since a link was shared/indexed):
    // the lesson still loaded fine by id — just freshen the visible slug segment.
    const canonicalSlug = lessonSlug(lesson);
    if (location.pathname.startsWith("/lessons/") && slugParam !== undefined && slugParam !== canonicalSlug) {
      navigate(lessonPath(lesson), { replace: true });
    }
  }, [lesson, id, slugParam, location.pathname, navigate]);

  // SEO: dynamic <title>, <meta name="description">، canonical، Open Graph،
  // Twitter Card، robots (noindex للدروس غير المنشورة) و JSON-LD (LearningResource).
  // يعمل فقط عند توفر بيانات درس فعلية (lesson !== null && lesson !== false).
  // يُعيد كل قيمة إلى حالتها السابقة عند المغادرة أو تغيير الدرس (cleanup).
  useEffect(() => {
    if (!lesson) return;

    const seo = resolveSeo(lesson);

    const prevTitle = document.title;
    if (seo.title) {
      document.title = `${seo.title} | مَدَار`;
    }

    // SEO-only language signal for this page (crawlers/screen readers).
    // Does NOT touch the platform's own UI language/RTL layout.
    const prevLang = document.documentElement.getAttribute("lang");
    document.documentElement.setAttribute("lang", seo.language);

    // Generic helper: create-or-update a <meta> tag identified by attrName="value",
    // returning enough info to restore/remove it on cleanup.
    function upsertMeta(attrName, attrValue, content) {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      const created = !el;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      const prevContent = el.getAttribute("content");
      if (content !== null && content !== undefined) {
        el.setAttribute("content", content);
      }
      return { el, created, prevContent };
    }

    const descriptionText = seo.description;

    const metaDescriptionState = upsertMeta("name", "description", descriptionText);

    const canonicalPath = lessonPath(lesson);
    const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    const createdCanonical = !canonicalLink;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    const prevCanonicalHref = canonicalLink.getAttribute("href");
    if (id) {
      canonicalLink.setAttribute("href", canonicalUrl);
    }

    // Open Graph
    const ogTitleState = upsertMeta("property", "og:title", seo.title || null);
    const ogDescriptionState = upsertMeta("property", "og:description", descriptionText);
    const ogTypeState = upsertMeta("property", "og:type", "article");
    const ogUrlState = upsertMeta("property", "og:url", canonicalUrl);

    // Twitter Card
    const twitterCardState = upsertMeta("name", "twitter:card", "summary");
    const twitterTitleState = upsertMeta("name", "twitter:title", seo.title || null);
    const twitterDescriptionState = upsertMeta("name", "twitter:description", descriptionText);

    // Robots: noindex الدروس غير المنشورة (لا تغيّر صلاحيات الوصول، فقط الفهرسة).
    let robotsState = null;
    if (lesson.status !== "Published") {
      robotsState = upsertMeta("name", "robots", "noindex,nofollow");
    } else {
      robotsState = upsertMeta("name", "robots", "index,follow");
    }

    // Structured Data: LearningResource JSON-LD — بيانات الدرس المتوفرة فعلًا فقط.
    const ldJson = {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: seo.title || undefined,
      description: descriptionText || undefined,
      inLanguage: seo.language,
      isAccessibleForFree: !isLessonMembersOnly(lesson),
      url: canonicalUrl,
    };
    const ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.setAttribute("data-lesson-jsonld", "true");
    ldScript.text = JSON.stringify(ldJson);
    document.head.appendChild(ldScript);

    return () => {
      document.title = prevTitle;

      if (prevLang !== null) {
        document.documentElement.setAttribute("lang", prevLang);
      } else {
        document.documentElement.removeAttribute("lang");
      }

      function restoreMeta(state) {
        if (!state) return;
        const { el, created, prevContent } = state;
        if (created) {
          el.remove();
        } else if (prevContent !== null) {
          el.setAttribute("content", prevContent);
        } else {
          el.removeAttribute("content");
        }
      }

      restoreMeta(metaDescriptionState);
      restoreMeta(ogTitleState);
      restoreMeta(ogDescriptionState);
      restoreMeta(ogTypeState);
      restoreMeta(ogUrlState);
      restoreMeta(twitterCardState);
      restoreMeta(twitterTitleState);
      restoreMeta(twitterDescriptionState);
      restoreMeta(robotsState);

      if (createdCanonical) {
        canonicalLink.remove();
      } else if (prevCanonicalHref !== null) {
        canonicalLink.setAttribute("href", prevCanonicalHref);
      } else {
        canonicalLink.removeAttribute("href");
      }

      ldScript.remove();
    };
  }, [lesson, id]);

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
        : `العنوان ${Math.min(progress.currentScene + 1, sceneCount)} من ${sceneCount}`;

  // Lesson-level Access Lock: exclusive lesson + guest → login required (not sequence message)
  const lessonAccessLocked =
    !!lesson &&
    isLessonMembersOnly(lesson) &&
    session === null; // explicit guest (undefined = still loading auth)

  if (lessonAccessLocked) {
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
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
            style={{ background: "#10665A" }}
          >
            تسجيل الدخول
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl p-8 text-center bg-white shadow-sm dir-rtl" style={{ border: "1px solid #DED4BD" }}>
            <p className="text-4xl mb-3">🔐</p>
            <p className="font-black text-lg mb-2" style={{ color: "#10665A" }}>تسجيل الدخول مطلوب</p>
            <p className="text-sm mb-6" style={{ color: "#5C5A4A" }}>
              هذا الدرس حصري للمستخدمين المسجّلين. سجّل دخولك للوصول إليه.
            </p>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="w-full px-5 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: "#10665A" }}
            >
              تسجيل الدخول / إنشاء حساب
            </button>
            <button
              type="button"
              onClick={() => navigate("/student")}
              className="w-full mt-2 px-5 py-2 rounded-2xl text-xs font-bold"
              style={{ color: "#8A8570" }}
            >
              ← العودة لقائمة الدروس
            </button>
          </div>
        </div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

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
          التقدّم : {progressLabel}
          {sceneCount > 0 && !progress.lessonCompleted ? ` · عناوين مكتملة ${doneCount}/${sceneCount}` : ""}
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