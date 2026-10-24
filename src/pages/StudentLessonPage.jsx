import { PageLoader } from "../components/DuoFx";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getLessonWithScenes, listCompletionTemplates, getMyLessonProgress, saveMyLessonProgress } from "../lib/db";
import { useAuth } from "../lib/hooks";
import { StudentView, isLessonMembersOnly } from "../components/Viewer";
import Footer from "../components/Footer";
import AuthModal, { GuestWelcomeBanner } from "../components/AuthModal";
import StudentAccountMenu from "../components/StudentAccountMenu";
import LessonActions from "../components/LessonActions";
import { slugify } from "../lib/slugify";
import MadarGuide, { GuideHelpButton, useMadarGuide, LESSON_STEPS } from "../components/MadarGuide";

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

/**
 * شريط علوي ذكي: يختفي لما الطالب ينزل بالسكرول (عشان المذاكرة)، ويظهر أول ما يطلع لفوق
 * أو يوصل لأول الصفحة. يرجع true لو لازم الشريط يكون مخفي.
 */
function useAutoHideTopbar() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY || 0;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const y = Math.max(0, window.scrollY || 0);
        const dy = y - lastY;
        if (y < 80) {
          setHidden(false);
          lastY = y;
        } else if (dy > 10) {
          setHidden(true);
          lastY = y;
        } else if (dy < -10) {
          setHidden(false);
          lastY = y;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return [hidden, setHidden];
}

/** الدرجات: { scenes: { [sceneId]: Score }, final: Score | null } حيث Score = { last, best, attempts, at } */
function emptyQuiz() {
  return { scenes: {}, final: null };
}

function cleanScore(x) {
  if (!x || typeof x !== "object") return null;
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
  const one = (r) => {
    if (!r || typeof r !== "object") return null;
    const correct = num(r.correct);
    const total = num(r.total);
    const pct = num(r.pct);
    if (correct === null || total === null || pct === null) return null;
    return { correct, total, pct };
  };
  const last = one(x.last);
  const best = one(x.best) || last;
  if (!last || !best) return null;
  return { last, best, attempts: Math.max(1, Number(x.attempts) || 1), at: Number(x.at) || 0 };
}

/** يضمن شكل سليم للدرجات المحفوظة (حتى لو التقدم القديم ما فيهوش درجات). */
function normalizeQuiz(raw) {
  const q = emptyQuiz();
  if (!raw || typeof raw !== "object") return q;
  if (raw.scenes && typeof raw.scenes === "object") {
    for (const [k, v] of Object.entries(raw.scenes)) {
      const c = cleanScore(v);
      if (c) q.scenes[k] = c;
    }
  }
  q.final = cleanScore(raw.final);
  return q;
}

/** يدمج محاولة جديدة مع المحفوظ: last = الأخيرة، best = الأعلى نسبة، attempts = عدد المحاولات. */
function mergeScore(old, { correct, total }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const cur = { correct, total, pct };
  const best = old && old.best && Number(old.best.pct) >= pct ? old.best : cur;
  return { last: cur, best, attempts: (Number(old && old.attempts) || 0) + 1, at: Date.now() };
}

function defaultProgress() {
  return {
    quiz: emptyQuiz(),
    currentScene: 0,
    completedScenes: [],
    unlockedScenes: [0],
    finalReviewUnlocked: false,
    finalReviewCompleted: false,
    lessonCompleted: false,
    view: "scene", // "scene" | "final" | "done"
  };
}

/** Turns saved progress (from Supabase) into a safe progress object for this lesson. null → fresh start. */
function normalizeProgress(saved, sceneCount) {
  if (!saved) return defaultProgress();
  try {
    const parsed = saved;
    const p = { ...defaultProgress(), ...parsed };
    // migrate from v1 shape
    if (typeof parsed.sceneIndex === "number" && !Array.isArray(parsed.completedScenes)) {
      p.currentScene = Math.min(Math.max(0, parsed.sceneIndex), Math.max(0, sceneCount - 1));
      p.unlockedScenes = Array.from({ length: p.currentScene + 1 }, (_, i) => i);
      // v1 had no completion list: scenes before the reached one count as passed
      p.completedScenes = Array.from({ length: p.currentScene }, (_, i) => i);
    }
    p.quiz = normalizeQuiz(p.quiz);
    p.completedScenes = (p.completedScenes || []).filter((i) => i >= 0 && i < sceneCount);
    // unlockedScenes is kept only as a mirror of completedScenes (+ next scene)
    p.unlockedScenes = Array.from(
      new Set([0, ...(p.unlockedScenes || []), ...p.completedScenes, ...p.completedScenes.map((i) => i + 1)])
    ).filter((i) => i >= 0 && i < sceneCount);
    if (p.completedScenes.length >= sceneCount && sceneCount > 0) {
      p.finalReviewUnlocked = true;
    }
    return p;
  } catch {
    return defaultProgress();
  }
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
  const [topbarHidden, setTopbarHidden] = useAutoHideTopbar();
  const [progress, setProgress] = useState(defaultProgress);
  // progressOwner: user id | null (guest) | undefined (auth loading). Save/load via db.js (Supabase or guestStorage).
  const progressOwner = session === undefined ? undefined : session?.user?.id || null;
  const [progressLoadedKey, setProgressLoadedKey] = useState("");
  const skipNextSaveRef = useRef(false); // the first state after a load is not a change → don't write it back
  const saveBlockedRef = useRef(false); // loading failed → never overwrite what is stored with a blank state
  const pendingSaveRef = useRef(null); // { lessonId, progress } waiting for the debounce
  const saveTimerRef = useRef(null);
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
      })
      .catch(() => mounted && setLesson(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  // Load progress once lesson + auth are known.
  // Account → Supabase; guest → localStorage (getMyLessonProgress routes both).
  useEffect(() => {
    if (!lesson || !id || progressOwner === undefined) return undefined;
    const sc = lesson.scenes?.length || 0;
    const key = `${progressOwner || "guest"}:${id}`;
    skipNextSaveRef.current = true;
    let cancelled = false;
    saveBlockedRef.current = false;
    getMyLessonProgress(id)
      .then((saved) => {
        if (!cancelled) setProgress(normalizeProgress(saved, sc));
      })
      .catch((err) => {
        console.warn("getMyLessonProgress:", err);
        // Guest local read failure should not block future saves with a blank overwrite.
        if (progressOwner) saveBlockedRef.current = true;
        if (!cancelled) setProgress(defaultProgress());
      })
      .finally(() => {
        if (!cancelled) setProgressLoadedKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [lesson, id, progressOwner]);

  // Write the pending progress to Supabase right now (also used when leaving the page).
  const flushProgressSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const pending = pendingSaveRef.current;
    if (!pending) return;
    pendingSaveRef.current = null;
    if (saveBlockedRef.current) return;
    saveMyLessonProgress(pending.lessonId, pending.progress).catch((err) =>
      console.warn("saveMyLessonProgress:", err)
    );
  }, []);

  // Save (debounced) for account (Supabase) and guest (localStorage) after load finished.
  useEffect(() => {
    if (!lesson || !id || progressOwner === undefined) return;
    const key = `${progressOwner || "guest"}:${id}`;
    if (progressLoadedKey !== key) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (pendingSaveRef.current && pendingSaveRef.current.lessonId !== id) flushProgressSave();
    pendingSaveRef.current = { lessonId: id, progress };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flushProgressSave, 800);
  }, [id, lesson, progress, progressOwner, progressLoadedKey, flushProgressSave]);

  // Never lose the last step: flush when leaving the page / hiding the tab.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flushProgressSave();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flushProgressSave);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flushProgressSave);
      flushProgressSave();
    };
  }, [flushProgressSave]);

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

  const completeScene = useCallback((sceneIdx) => {
    setProgress((prev) => {
      // Explicit index (the scene the student is viewing) wins over stored currentScene
      const i = Number.isInteger(sceneIdx) ? sceneIdx : prev.currentScene;
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
        if (next < sceneCount) unlocked.push(next);
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

  // درجة عنوان واحد (تتسجل أول ما الطالب يخلّص أسئلة العنوان)
  const recordSceneScore = useCallback((sceneId, { correct, total }) => {
    if (sceneId === undefined || sceneId === null || !(total > 0)) return;
    const key = String(sceneId);
    setProgress((prev) => {
      const q = normalizeQuiz(prev.quiz);
      return { ...prev, quiz: { ...q, scenes: { ...q.scenes, [key]: mergeScore(q.scenes[key], { correct, total }) } } };
    });
  }, []);
  // درجة الاختبار النهائي (بعد «أنهِ الاختبار»)
  const recordFinalScore = useCallback(({ correct, total }) => {
    if (!(total > 0)) return;
    setProgress((prev) => {
      const q = normalizeQuiz(prev.quiz);
      return { ...prev, quiz: { ...q, final: mergeScore(q.final, { correct, total }) } };
    });
  }, []);
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
      recordSceneScore,
      recordFinalScore,
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
    [progress, sceneCount, setCurrentScene, completeScene, openFinalReview, completeFinalReview, recordSceneScore, recordFinalScore]
  );

  // Wait for progress load (account or guest) so the lesson never flashes a blank/locked state.
  const progressLoading =
    !!lesson &&
    (progressOwner === undefined ||
      progressLoadedKey !== `${progressOwner || "guest"}:${id}`);

  // دليل الدرس: أول درس يفتحه الطالب بس، وزرار «؟ دليل» يعيده (لازم قبل أي return مبكّر)
  const guideReady =
    !!lesson &&
    !progressLoading &&
    !(lesson.comingSoon || lesson.journeyConfig?.comingSoon) &&
    !(isLessonMembersOnly(lesson) && session === null);
  const guide = useMadarGuide("lesson", { autoStart: guideReady });

  if (lesson === null || progressLoading) {
    // نفس ارتفاع/بنية الهيدر الموجود في العرض النهائي (سطر lesson.title لاحقًا) حتى لا تقفز
    // الصفحة (Layout Shift) لحظة انتهاء التحميل — Visual/Layout فقط، لا تأثير على تحميل الدرس.
    return (
      <div className="min-h-screen flex flex-col md-lesson-page" style={{ background: "#FFFFFF" }}>
        <div
          className="md-lv-topbar bg-white px-4 sm:px-6 py-3 border-b flex justify-between items-center gap-2 flex-wrap"
          style={{ borderColor: "var(--duo-line)" }}
        >
          <span className="text-sm font-bold" style={{ color: "var(--duo-green-ink)" }}>مَدَار</span>
          <span className="md-lv-topbar-title text-xs font-medium truncate max-w-[40%]" style={{ color: "var(--duo-muted)" }}>
            جاري التحميل...
          </span>
          <span className="text-xs" style={{ color: "var(--duo-muted)", opacity: 0 }} aria-hidden="true">
            تسجيل الدخول
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center dir-rtl"><PageLoader compact label="جاري تحميل الدرس…" /></div>
      </div>
    );
  }
  if (lesson === false) {
    return (
      <div className="md-lesson-page min-h-screen p-10 text-center dir-rtl">
        <p className="font-bold mb-2" style={{ color: "var(--duo-red-d)" }}>تعذّر عرض هذا الدرس</p>
        <p className="text-sm mb-4" style={{ color: "var(--duo-muted)" }}>
          قد يكون غير منشور أو غير موجود. يمكنك العودة واختيار درس آخر.
        </p>
        <button
          onClick={() => navigate("/student")}
          className="md-lv-btn md-lv-btn-primary mt-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "var(--duo-green)" }}
        >
          ← العودة لمنصة الطالب
        </button>
      </div>
    );
  }

  const name = displayName(session);
  // Lesson-level Access Lock: exclusive lesson + guest → login required (not sequence message)
  const lessonAccessLocked =
    !!lesson &&
    isLessonMembersOnly(lesson) &&
    session === null; // explicit guest (undefined = still loading auth)

  // "Coming soon" lesson opened via direct link: show a friendly notice instead of the content
  const lessonComingSoon = !!lesson && !!(lesson.comingSoon || lesson.journeyConfig?.comingSoon);

  if (lessonComingSoon) {
    return (
      <div className="min-h-screen flex flex-col md-lesson-page" style={{ background: "#FFFFFF" }}>
        <div
          className="md-lv-topbar bg-white px-4 sm:px-6 py-3 border-b flex justify-between items-center gap-2 flex-wrap"
          style={{ borderColor: "var(--duo-line)" }}
        >
          <button onClick={() => navigate("/student")} className="md-lv-back text-sm font-bold" style={{ color: "var(--duo-green-ink)" }}>
            ← العودة لقائمة الدروس
          </button>
          <span className="md-lv-topbar-title text-xs font-medium truncate max-w-[40%]" style={{ color: "var(--duo-muted)" }}>
            {lesson?.title || "منصة الطالب التعليمية"}
          </span>
          <span />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="md-lv-lock max-w-md w-full rounded-3xl p-8 text-center bg-white dir-rtl" style={{ border: "2px solid var(--duo-line)" }}>
            <p className="text-4xl mb-3">⏳</p>
            <p className="font-black text-lg mb-2" style={{ color: "var(--duo-green-ink)" }}>قريبًا</p>
            <p className="text-sm mb-6" style={{ color: "var(--duo-ink-soft)" }}>
              هذا الدرس سيتوفر قريبًا. تابعنا لاحقًا.
            </p>
            <button
              type="button"
              onClick={() => navigate("/student")}
              className="md-lv-btn md-lv-btn-primary w-full px-5 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: "var(--duo-green)" }}
            >
              ← العودة لقائمة الدروس
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (lessonAccessLocked) {
    return (
      <div className="min-h-screen flex flex-col md-lesson-page" style={{ background: "#FFFFFF" }}>
        <div
          className="md-lv-topbar bg-white px-4 sm:px-6 py-3 border-b flex justify-between items-center gap-2 flex-wrap"
          style={{ borderColor: "var(--duo-line)" }}
        >
          <button onClick={() => navigate("/student")} className="md-lv-back text-sm font-bold" style={{ color: "var(--duo-green-ink)" }}>
            ← العودة لقائمة الدروس
          </button>
          <span className="md-lv-topbar-title text-xs font-medium truncate max-w-[40%]" style={{ color: "var(--duo-muted)" }}>
            {lesson?.title || "منصة الطالب التعليمية"}
          </span>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="md-lv-login text-xs font-bold px-3 py-1.5 rounded-xl text-white"
            style={{ background: "var(--duo-green)" }}
          >
            تسجيل الدخول
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="md-lv-lock max-w-md w-full rounded-3xl p-8 text-center bg-white dir-rtl" style={{ border: "2px solid var(--duo-line)" }}>
            <p className="text-4xl mb-3">🔐</p>
            <p className="font-black text-lg mb-2" style={{ color: "var(--duo-green-ink)" }}>تسجيل الدخول مطلوب</p>
            <p className="text-sm mb-6" style={{ color: "var(--duo-ink-soft)" }}>
              هذا الدرس حصري للمستخدمين المسجّلين. سجّل دخولك للوصول إليه.
            </p>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="md-lv-btn md-lv-btn-primary w-full px-5 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: "var(--duo-green)" }}
            >
              تسجيل الدخول / إنشاء حساب
            </button>
            <button
              type="button"
              onClick={() => navigate("/student")}
              className="md-lv-btn md-lv-btn-text w-full mt-2 px-5 py-2 rounded-2xl text-xs font-bold"
              style={{ color: "var(--duo-muted)" }}
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
    <div className="min-h-screen flex flex-col md-lesson-page" style={{ background: "#FFFFFF" }} data-topbar={topbarHidden ? "hidden" : "shown"}>
      <div
        className="md-lv-topbar bg-white px-4 sm:px-6 py-3 border-b flex justify-between items-center gap-2 flex-wrap"
        style={{ borderColor: "var(--duo-line)" }}
        onFocusCapture={() => setTopbarHidden(false)}
      >
        <button onClick={() => navigate("/student")} className="md-lv-back text-sm font-bold" style={{ color: "var(--duo-green-ink)" }}>
          ← العودة لقائمة الدروس
        </button>
        <span className="md-lv-topbar-title text-xs font-medium truncate max-w-[40%]" style={{ color: "var(--duo-muted)" }}>
          {lesson?.title || "منصة الطالب التعليمية"}
        </span>
        <div className="flex items-center gap-2">
        <div className="relative">
          {session === undefined ? (
            <span className="text-xs" style={{ color: "var(--duo-muted)" }}>...</span>
          ) : session ? (
            <StudentAccountMenu session={session} name={name} />
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="md-lv-login text-xs font-bold px-3 py-1.5 rounded-xl text-white"
              style={{ background: "var(--duo-green)" }}
            >
              تسجيل الدخول
            </button>
          )}
        </div>
        </div>
      </div>

      <StudentView
        lesson={lesson}
        requireAuthForTools
        session={session}
        journey={journey}
        heroExtra={
          <LessonActions lesson={lesson} session={session} shareOrigin={SITE_ORIGIN} onRequireLogin={() => setAuthOpen(true)} />
        }
      />

      <GuideHelpButton onClick={guide.start} hidden={guide.open} />
      <MadarGuide open={guide.open} steps={LESSON_STEPS} onClose={guide.close} topSafe={150} />
      <Footer />
      <GuestWelcomeBanner session={session} lift />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}