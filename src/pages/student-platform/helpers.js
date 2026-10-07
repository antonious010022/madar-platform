// Pure helpers for the student home page (progress, ordering, lock states).
// Moved verbatim from StudentPlatform.jsx — logic unchanged.
import { slugify } from "../../lib/slugify";

/** Builds the SEO-friendly lesson path (mirrors StudentLessonPage's helper).
 * Prefers the teacher-controlled seo_slug over one derived from the title;
 * lesson.id is always the real lookup key — the slug is cosmetic only. */
const ARABIC_ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
function arabicLessonOrdinal(index) {
  // index is 0-based. Falls back to a plain number beyond the 10th lesson.
  return ARABIC_ORDINALS[index] || `رقم ${index + 1}`;
}

function lessonPath(lesson) {
  const raw = (lesson?.seoSlug && lesson.seoSlug.trim()) || lesson?.title || "";
  const slug = slugify(raw);
  return slug ? `/lessons/${lesson.id}/${slug}` : `/lessons/${lesson.id}`;
}

const PROGRESS_KEY = "ts_student_progress_v2";
const GUEST_GRADE_KEY = "madar_guest_stage_grade_v1";
/** Accumulator of completed lesson IDs (StudentPlatform only). Does not change v2 progress shape. */
const COMPLETED_LESSON_IDS_KEY = "madar_completed_lesson_ids_v1";

function readLocalProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.lessonId) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Merge single-lesson v2 completion into a multi-lesson id set for sequential UI. */
function readCompletedLessonIds() {
  let ids = [];
  try {
    const raw = localStorage.getItem(COMPLETED_LESSON_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) ids = parsed.map(String);
    }
  } catch {
    /* ignore */
  }
  try {
    const p = readLocalProgress();
    if (p?.lessonCompleted && p.lessonId) {
      const lid = String(p.lessonId);
      if (!ids.includes(lid)) {
        ids.push(lid);
        try {
          localStorage.setItem(COMPLETED_LESSON_IDS_KEY, JSON.stringify(ids));
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* ignore */
  }
  return new Set(ids);
}

function isLessonComingSoon(lesson) {
  if (!lesson) return false;
  if (lesson.comingSoon) return true;
  const cfg = lesson.journeyConfig || lesson.journey_config || {};
  return !!cfg.comingSoon;
}

function isLessonExclusive(lesson) {
  if (!lesson) return false;
  if (lesson.isMembersOnly) return true;
  const cfg = lesson.journeyConfig || lesson.journey_config || {};
  return !!(cfg.isMembersOnly || cfg.exclusive || cfg.is_members_only);
}

/** Number shown for a lesson: the teacher's number if set, else its position (1-based). */
function lessonDisplayNumber(lesson, index) {
  const n = lesson?.sortOrder ?? lesson?.sort_order ?? 0;
  return n > 0 ? n : index + 1;
}

/** Stable order within stage+grade+term+subject for sequence. */
function sortLessonsForSequence(list) {
  return [...list].sort((a, b) => {
    // sortOrder > 0 = number set by the teacher (shown as-is); 0 = automatic → after numbered ones
    const na = a.sortOrder ?? a.sort_order ?? 0;
    const nb = b.sortOrder ?? b.sort_order ?? 0;
    const sa = na > 0 ? na : Number.MAX_SAFE_INTEGER;
    const sb = nb > 0 ? nb : Number.MAX_SAFE_INTEGER;
    if (sa !== sb) return sa - sb;
    // Tie-break by CREATION time (oldest first = order of adding), not updatedAt:
    // editing a lesson must never move it, and a newly added lesson goes last.
    const ta = String(a.createdAt || a.created_at || a.updatedAt || a.updated_at || "");
    const tb = String(b.createdAt || b.created_at || b.updatedAt || b.updated_at || "");
    if (ta !== tb) return ta.localeCompare(tb);
    return String(a.title || "").localeCompare(String(b.title || ""), "ar");
  });
}

/**
 * Lock kinds for lessons in one subject context.
 * Priority per lesson: COMING_SOON → COMPLETED → ACCESS_LOCK (guest+exclusive) → SEQUENCE → CURRENT
 * A "coming soon" lesson never blocks the lessons after it (it can't be completed yet).
 * Exclusive+guest does not block sequence of later public lessons.
 */
function buildLessonLockStates(lessons, completedSet, isGuest) {
  const ordered = sortLessonsForSequence(lessons || []);
  let blockingIncomplete = false;
  return ordered.map((lesson) => {
    const id = String(lesson.id);
    if (isLessonComingSoon(lesson)) {
      return { lesson, kind: "COMING_SOON" };
    }
    if (completedSet.has(id)) {
      return { lesson, kind: "COMPLETED" };
    }
    if (isGuest && isLessonExclusive(lesson)) {
      return { lesson, kind: "ACCESS_LOCK" };
    }
    if (blockingIncomplete) {
      return { lesson, kind: "SEQUENCE_LOCK" };
    }
    blockingIncomplete = true;
    return { lesson, kind: "CURRENT" };
  });
}

function lessonLockUi(kind) {
  switch (kind) {
    case "COMING_SOON":
      return { mark: "⏳", cta: "قريبًا", hint: "هذا الدرس سيتوفر قريبًا" };
    case "COMPLETED":
      return { mark: "✓", cta: "مكتمل", hint: "مكتمل" };
    case "ACCESS_LOCK":
      return { mark: "🔐", cta: "تسجيل الدخول مطلوب", hint: "تسجيل الدخول مطلوب" };
    case "SEQUENCE_LOCK":
      return { mark: "🔒", cta: "أكمل الدرس السابق أولًا", hint: "أكمل الدرس السابق أولًا" };
    case "CURRENT":
    default:
      return { mark: "⭐", cta: "استكمال التعلم", hint: "متاح — استكمال التعلم" };
  }
}

function readGuestGradeLocal() {
  try {
    const raw = localStorage.getItem(GUEST_GRADE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const stage = typeof parsed.stage === "string" && parsed.stage.trim() ? parsed.stage.trim() : null;
    const grade = typeof parsed.grade === "string" && parsed.grade.trim() ? parsed.grade.trim() : null;
    if (!grade) return null;
    return { stage, grade };
  } catch {
    return null;
  }
}

function writeGuestGradeLocal(stage, grade) {
  try {
    if (!grade) {
      localStorage.removeItem(GUEST_GRADE_KEY);
      return;
    }
    localStorage.setItem(
      GUEST_GRADE_KEY,
      JSON.stringify({
        stage: stage && String(stage).trim() ? String(stage).trim() : null,
        grade: String(grade).trim(),
      })
    );
  } catch {
    /* ignore */
  }
}

export { ARABIC_ORDINALS, arabicLessonOrdinal, lessonPath, PROGRESS_KEY, GUEST_GRADE_KEY, COMPLETED_LESSON_IDS_KEY, readLocalProgress, readCompletedLessonIds, isLessonComingSoon, isLessonExclusive, lessonDisplayNumber, sortLessonsForSequence, buildLessonLockStates, lessonLockUi, readGuestGradeLocal, writeGuestGradeLocal };