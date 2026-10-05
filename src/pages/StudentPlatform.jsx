import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublishedLessons, signOut, getStudentGradeMeta, saveStudentGradeMeta } from "../lib/db";
import { useAuth } from "../lib/hooks";
import Footer from "../components/Footer";
import AuthModal, { GuestWelcomeBanner, LetterAvatar } from "../components/AuthModal";
import { slugify } from "../lib/slugify";

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
      return { mark: "🔵", cta: "استكمال التعلم", hint: "متاح — استكمال التعلم" };
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


/* ============================================================================
   مَدَار — Student Platform (Global Premium Redesign)
   الهوية: فضاء هادئ + جغرافيا + استكشاف
   ألوان: Navy deep + Teal + Soft Gold + Sienna
   كل المنطق البرمجي محفوظ 100% — فقط الرؤية والحركة تغيّرت
============================================================================ */

const STEP_COLORS = [
  "var(--md-teal)",
  "var(--md-gold)",
  "var(--md-sienna)",
  "var(--md-teal-deep)",
];

/* ---------------------------------------------------------------------------
   Decorative Components
--------------------------------------------------------------------------- */

function CompassRose({ className = "" }) {
  const ticks = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * 360) / 16;
    const long = i % 4 === 0;
    const rOuter = 48;
    const rInner = long ? 34 : 42;
    const rad = (angle * Math.PI) / 180;
    return {
      x1: 50 + rOuter * Math.sin(rad),
      y1: 50 - rOuter * Math.cos(rad),
      x2: 50 + rInner * Math.sin(rad),
      y2: 50 - rInner * Math.cos(rad),
      long,
    };
  });

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="currentColor"
          strokeWidth={t.long ? 2.2 : 1.2}
          opacity={t.long ? 0.9 : 0.45}
        />
      ))}
      <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.85" />
      <circle cx="50" cy="50" r="2.5" fill="var(--md-bg)" />
    </svg>
  );
}

const STARS = [
  { top: "6%", left: "18%", size: 2.5, twinkle: true, delay: "0s" },
  { top: "12%", left: "72%", size: 1.8, twinkle: false },
  { top: "22%", left: "38%", size: 2, twinkle: false },
  { top: "9%", left: "52%", size: 2.8, twinkle: true, delay: "1.4s" },
  { top: "30%", left: "82%", size: 1.6, twinkle: false },
  { top: "34%", left: "12%", size: 2.2, twinkle: true, delay: "2.6s" },
  { top: "45%", left: "60%", size: 1.7, twinkle: false },
  { top: "17%", left: "90%", size: 1.9, twinkle: false },
  { top: "40%", left: "28%", size: 2.6, twinkle: true, delay: "0.8s" },
  { top: "50%", left: "45%", size: 1.5, twinkle: false },
  { top: "3%", left: "34%", size: 1.8, twinkle: false },
  { top: "25%", left: "6%", size: 2, twinkle: false },
  { top: "58%", left: "78%", size: 1.6, twinkle: true, delay: "3.1s" },
  { top: "68%", left: "15%", size: 2.1, twinkle: false },
];

function Galaxy({ progress }) {
  return (
    <div className="md-galaxy" aria-hidden="true">
      {/* Soft nebula */}
      <div className="md-nebula" />

      {/* Stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className={`md-star ${s.twinkle ? "twinkle" : ""}`}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay || "0s",
          }}
        />
      ))}

      {/* Orbits that react to progress */}
      {progress.map((done, i) => {
        const size = 110 + i * 55;
        return (
          <div
            key={i}
            className={`md-orbit ${done ? "active" : ""}`}
            style={{
              width: size,
              height: size,
              borderColor: STEP_COLORS[i],
              animationDuration: `${28 + i * 9}s`,
            }}
          >
            <span
              className="md-planet"
              style={{
                background: STEP_COLORS[i],
                boxShadow: done ? `0 0 18px ${STEP_COLORS[i]}` : "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function ContinentsAtlas({ progress }) {
  const [stageDone, gradeDone, termDone] = progress;

  return (
    <div className="md-atlas" aria-hidden="true">
      <svg viewBox="0 0 600 320" className="md-atlas-svg">
        {/* Grid */}
        {[70, 140, 210, 280].map((ry, i) => (
          <ellipse
            key={`lat-${i}`}
            cx="300"
            cy="160"
            rx="280"
            ry={ry}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        {[-220, -110, 0, 110, 220].map((dx, i) => (
          <path
            key={`lon-${i}`}
            d={`M ${300 + dx} 20 Q 300 160 ${300 + dx} 300`}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Simplified continents (decorative) */}
        <path
          d="M140 90 C170 70 220 75 250 95 C280 120 270 160 240 175 C200 195 150 180 130 150 C115 125 120 105 140 90Z"
          fill="rgba(94, 180, 170, 0.12)"
          stroke="rgba(94, 180, 170, 0.25)"
          strokeWidth="1.2"
        />
        <path
          d="M310 70 C360 55 420 70 450 100 C480 140 470 190 430 210 C390 230 340 215 320 180 C300 145 290 100 310 70Z"
          fill="rgba(212, 175, 100, 0.1)"
          stroke="rgba(212, 175, 100, 0.22)"
          strokeWidth="1.2"
        />
        <path
          d="M180 210 C220 195 270 205 290 235 C310 270 280 295 240 290 C200 285 165 255 180 210Z"
          fill="rgba(180, 120, 90, 0.1)"
          stroke="rgba(180, 120, 90, 0.2)"
          strokeWidth="1.2"
        />

        {/* Journey points */}
        <circle cx="180" cy="130" r={stageDone ? 6 : 3.5} fill={stageDone ? "var(--md-teal)" : "rgba(255,255,255,0.3)"} />
        <circle cx="320" cy="110" r={gradeDone ? 6 : 3.5} fill={gradeDone ? "var(--md-gold)" : "rgba(255,255,255,0.3)"} />
        <circle cx="420" cy="160" r={termDone ? 6 : 3.5} fill={termDone ? "var(--md-sienna)" : "rgba(255,255,255,0.3)"} />

        {/* Connecting path */}
        <path
          d="M180 130 Q250 90 320 110 T420 160"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </svg>
    </div>
  );
}

function usePointerParallax() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasFinePointer || reduceMotion) return;

    let frame = null;
    const handleMove = (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setPointer({
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5,
        });
        frame = null;
      });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return pointer;
}

function HistoryFrieze() {
  return (
    <div className="md-frieze" aria-hidden="true">
      <div className="md-frieze-inner">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="md-column">
            <div className="md-column-capital" />
            <div className="md-column-shaft" />
            <div className="md-column-base" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CompassSpinner() {
  return (
    <div className="md-spinner">
      <CompassRose className="md-spinner-rose" />
      <span className="md-spinner-text">جاري التحميل...</span>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Coming-soon smart assistant bubble — floating, bottom-right, non-functional
   placeholder for now. Purely presentational; no data or backend involved.
--------------------------------------------------------------------------- */
function ComingSoonAssistantBubble() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md-assistant-wrap">
      {open && (
        <div className="md-assistant-tooltip" role="status">
          <p className="md-assistant-tooltip-title">المساعد الذكي</p>
          <p className="md-assistant-tooltip-body">قريبًا هيبقى متاح، تابعنا!</p>
        </div>
      )}
      <button
        type="button"
        className="md-assistant-bubble"
        onClick={() => setOpen((v) => !v)}
        aria-label="المساعد الذكي - قريبًا يكون متاح"
      >
        <img src="/photo/IevsR.png" alt="" aria-hidden="true" className="md-assistant-bubble-logo" />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Step Row
--------------------------------------------------------------------------- */
const FEATURE_SVG = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* Feature boxes at the bottom of the home page (presentation only) */
const MADAR_FEATURES = [
  {
    title: "شرح مرئي مبسّط",
    text: "فيديو وصور وشرح واضح يرافق كل فكرة في الدرس.",
    icon: (
      <svg {...FEATURE_SVG}>
        <rect x="2.5" y="6" width="13" height="12" rx="3" />
        <path d="M15.5 10.5l6-3.5v10l-6-3.5z" />
      </svg>
    ),
  },
  {
    title: "خرائط ذهنية",
    text: "تربط الأفكار ببعضها لتتذكّرها وتفهمها بسهولة.",
    icon: (
      <svg {...FEATURE_SVG}>
        <circle cx="12" cy="12" r="3" />
        <circle cx="4.5" cy="5.5" r="2" />
        <circle cx="19.5" cy="5.5" r="2" />
        <circle cx="12" cy="20" r="2" />
        <path d="M10 10L6 7M14 10l4-3M12 15v3" />
      </svg>
    ),
  },
  {
    title: "خطوط زمنية",
    text: "تتبّع الأحداث بترتيبها الصحيح عبر الزمن.",
    icon: (
      <svg {...FEATURE_SVG}>
        <path d="M3 12h18" />
        <circle cx="6" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="18" cy="12" r="1.6" />
        <path d="M6 6v3M12 15v3M18 6v3" />
      </svg>
    ),
  },
  {
    title: "أسئلة ومراجعة",
    text: "اختبر فهمك أولًا بأول وراجع قبل أن تنتقل للتالي.",
    icon: (
      <svg {...FEATURE_SVG}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.7 2.7L16 9.5" />
      </svg>
    ),
  },
];

function StepRow({ number, done, active, label, children }) {
  return (
    <div className={`md-step ${done ? "done" : ""} ${active ? "active" : ""}`} data-step={number}>
      <div className="md-step-indicator">
        <div className="md-step-number">{done ? "✓" : number}</div>
        <div className="md-step-line" />
      </div>
      <div className="md-step-content">
        <div className="md-step-label">{label}</div>
        <div className="md-step-body">{children}</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Main Component — Logic 100% preserved
--------------------------------------------------------------------------- */
export default function StudentPlatform() {
  const navigate = useNavigate();
  const session = useAuth();
  const pointer = usePointerParallax();
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // UX only: after the student taps a unit, bring the lessons list into view
  const lessonsSectionRef = useRef(null);
  const scrollToLessonsRef = useRef(false);

  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [gradeMetaReady, setGradeMetaReady] = useState(false);
  const [pickingGrade, setPickingGrade] = useState(false);
  const [gradeSaveError, setGradeSaveError] = useState("");
  const [gradeSaving, setGradeSaving] = useState(false);

  useEffect(() => {
    listPublishedLessons()
      .then(setLessons)
      .catch(() => setError("تعذر تحميل الدروس ."));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadGrade() {
      setGradeMetaReady(false);
      if (session === undefined) return;
      if (session) {
        try {
          const meta = await getStudentGradeMeta();
          if (cancelled) return;
          if (meta.grade) {
            setSelectedStage(meta.stage || "");
            setSelectedGrade(meta.grade);
            setPickingGrade(false);
          } else {
            setSelectedStage("");
            setSelectedGrade("");
            setPickingGrade(true);
          }
        } catch {
          if (!cancelled) {
            setSelectedStage("");
            setSelectedGrade("");
            setPickingGrade(true);
          }
        } finally {
          if (!cancelled) setGradeMetaReady(true);
        }
      } else {
        const local = readGuestGradeLocal();
        if (local?.grade) {
          setSelectedStage(local.stage || "");
          setSelectedGrade(local.grade);
          setPickingGrade(false);
        } else {
          setSelectedStage("");
          setSelectedGrade("");
          setPickingGrade(true);
        }
        setGradeMetaReady(true);
      }
    }
    loadGrade();
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!pickingGrade || !lessons || !lessons.length) return;
    if (selectedStage) return;
    const stages = Array.from(new Set(lessons.map((l) => l.stage).filter(Boolean)));
    if (stages.length === 1) {
      setSelectedStage(stages[0]);
    }
  }, [pickingGrade, lessons, selectedStage]);

  const gradeScopedLessons = useMemo(() => {
    if (!lessons || !selectedGrade) return [];
    let list = lessons.filter((l) => l.grade === selectedGrade);
    if (selectedStage) list = list.filter((l) => l.stage === selectedStage);
    return list;
  }, [lessons, selectedStage, selectedGrade]);

  const availableStages = useMemo(() => {
    if (!lessons) return [];
    return Array.from(new Set(lessons.map((l) => l.stage).filter(Boolean)));
  }, [lessons]);

  const availableGrades = useMemo(() => {
    if (!lessons) return [];
    let list = lessons;
    if (selectedStage) list = list.filter((l) => l.stage === selectedStage);
    return Array.from(new Set(list.map((l) => l.grade).filter(Boolean)));
  }, [lessons, selectedStage]);

  const availableTerms = useMemo(() => {
    if (!gradeScopedLessons.length) return [];
    return Array.from(new Set(gradeScopedLessons.map((l) => l.term).filter(Boolean)));
  }, [gradeScopedLessons]);

  // Auto-select first available term for the current grade (field: lesson.term)
  useEffect(() => {
    if (pickingGrade || !selectedGrade) return;
    if (!availableTerms.length) {
      if (selectedTerm) setSelectedTerm("");
      return;
    }
    if (selectedTerm && availableTerms.includes(selectedTerm)) return;
    setSelectedTerm(availableTerms[0]);
    setSelectedSubject("");
  }, [pickingGrade, selectedGrade, availableTerms, selectedTerm]);

  // Lessons for stage + grade + term only (term is the existing `term` column)
  const termScopedLessons = useMemo(() => {
    if (!gradeScopedLessons.length || !selectedTerm) return [];
    return gradeScopedLessons.filter((l) => l.term === selectedTerm);
  }, [gradeScopedLessons, selectedTerm]);

  const availableSubjects = useMemo(() => {
    if (!termScopedLessons.length) return [];
    // Units keep the order they were added in (earliest lesson creation per unit),
    // instead of the "recently updated first" order the lessons list arrives in.
    const firstSeen = new Map();
    for (const l of termScopedLessons) {
      if (!l.subject) continue;
      const created = String(l.createdAt || l.created_at || l.updatedAt || l.updated_at || "");
      const cur = firstSeen.get(l.subject);
      if (!cur) firstSeen.set(l.subject, { created });
      else if (created && (!cur.created || created < cur.created)) cur.created = created;
    }
    return Array.from(firstSeen.keys()).sort((a, b) => {
      const A = firstSeen.get(a);
      const B = firstSeen.get(b);
      if (A.created !== B.created) return A.created.localeCompare(B.created);
      return a.localeCompare(b, "ar");
    });
  }, [termScopedLessons]);

  // Per-unit ("subject") lesson list — used for the plain-text preview shown
  // next to a unit card before the student opens it. Sorted with the same
  // sortLessonsForSequence() used for the actual lesson-cards grid, so the
  // preview numbering always matches what the student sees after opening
  // the unit (driven by the "ترتيب الدرس داخل الوحدة" field in Teacher Studio).
  const lessonsBySubject = useMemo(() => {
    if (!termScopedLessons.length) return {};
    const map = {};
    for (const l of termScopedLessons) {
      const sub = l.subject || "أخرى";
      map[sub] = map[sub] || [];
      map[sub].push(l);
    }
    for (const sub of Object.keys(map)) {
      map[sub] = sortLessonsForSequence(map[sub]);
    }
    return map;
  }, [termScopedLessons]);

  const filteredLessons = useMemo(() => {
    if (!termScopedLessons.length) return [];
    let list = termScopedLessons;
    if (selectedSubject) list = list.filter((l) => l.subject === selectedSubject);
    return list;
  }, [termScopedLessons, selectedSubject]);

  const completedLessonIds = useMemo(() => readCompletedLessonIds(), [lessons, filteredLessons]);

  const sequentialLessons = useMemo(() => {
    if (!selectedSubject || !filteredLessons.length) return [];
    const isGuest = !session;
    return buildLessonLockStates(filteredLessons, completedLessonIds, isGuest);
  }, [filteredLessons, selectedSubject, completedLessonIds, session]);

  const progress = [
    !!selectedStage,
    !!selectedGrade,
    !!selectedTerm,
    !!selectedSubject,
  ];

  const localProgress = useMemo(() => readLocalProgress(), [lessons]);
  const continueLesson = useMemo(() => {
    // Prefer current term; fall back to any lesson in the grade
    const pool = termScopedLessons.length ? termScopedLessons : gradeScopedLessons;
    if (!pool.length || !localProgress?.lessonId) return null;
    const lesson = pool.find((l) => String(l.id) === String(localProgress.lessonId));
    if (!lesson || isLessonComingSoon(lesson)) return null;
    const sceneIdx =
      typeof localProgress.currentScene === "number"
        ? localProgress.currentScene
        : typeof localProgress.sceneIndex === "number"
          ? localProgress.sceneIndex
          : 0;
    const done = !!localProgress.lessonCompleted;
    return { lesson, sceneIdx, done };
  }, [termScopedLessons, gradeScopedLessons, localProgress]);

  // Learning path in order (unit by unit, lesson by lesson) → one segment per lesson
  const progressPath = useMemo(() => {
    const done = completedLessonIds instanceof Set ? completedLessonIds : new Set(completedLessonIds || []);
    const segments = [];
    for (const sub of availableSubjects) {
      let first = true;
      for (const l of lessonsBySubject[sub] || []) {
        if (isLessonComingSoon(l)) continue;
        segments.push({ id: String(l.id), unit: sub, title: l.title, done: done.has(String(l.id)), unitStart: first });
        first = false;
      }
    }
    const resumeId = continueLesson && !continueLesson.done ? String(continueLesson.lesson.id) : null;
    const current =
      (resumeId && segments.find((x) => x.id === resumeId && !x.done)) || segments.find((x) => !x.done) || null;
    const completed = segments.filter((x) => x.done).length;
    return {
      segments,
      current,
      completed,
      total: segments.length,
      pct: segments.length ? Math.round((completed / segments.length) * 100) : 0,
    };
  }, [availableSubjects, lessonsBySubject, completedLessonIds, continueLesson]);

  const isLoggedIn = !!session;
  // Progress counters are per selected term only — same subject name in another term is separate
  const progressBySubject = useMemo(() => {
    if (!isLoggedIn || !selectedGrade || !selectedTerm || !termScopedLessons.length) return [];
    const base = termScopedLessons;
    const map = {};
    for (const l of base) {
      const sub = l.subject || "أخرى";
      map[sub] = map[sub] || { subject: sub, total: 0, completed: 0 };
      map[sub].total += 1;
    }
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.lessonCompleted && parsed.lessonId) {
          const L = base.find((x) => String(x.id) === String(parsed.lessonId));
          if (L) {
            const sub = L.subject || "أخرى";
            if (map[sub]) map[sub].completed = Math.min(map[sub].total, (map[sub].completed || 0) + 1);
          }
        }
      }
    } catch (_) {}
    return Object.values(map).sort((a, b) => a.subject.localeCompare(b.subject, "ar"));
  }, [isLoggedIn, selectedGrade, selectedTerm, termScopedLessons]);

  const recentLessons = useMemo(() => {
    // Latest 3 lessons (by creation time) of the grade the student selected
    if (!gradeScopedLessons.length) return [];
    const sorted = gradeScopedLessons.filter((l) => !isLessonComingSoon(l)).sort((a, b) => {
      const ta = a.createdAt || a.created_at || a.updatedAt || a.updated_at || "";
      const tb = b.createdAt || b.created_at || b.updatedAt || b.updated_at || "";
      return String(tb).localeCompare(String(ta));
    });
    return sorted.slice(0, 3);
  }, [gradeScopedLessons]);

  // Progress shown in the top bar. Uses the same completed-lesson ids that drive the ✓ marks on
  // the lesson cards, so the numbers always match what the student sees (guests included).
  const progressView = useMemo(() => {
    if (!selectedGrade || !selectedTerm || !termScopedLessons.length) return [];
    const done = completedLessonIds instanceof Set ? completedLessonIds : new Set(completedLessonIds || []);
    const map = {};
    for (const l of termScopedLessons) {
      if (isLessonComingSoon(l)) continue; // can't be completed yet
      const sub = l.subject || "أخرى";
      map[sub] = map[sub] || { subject: sub, total: 0, completed: 0 };
      map[sub].total += 1;
      if (done.has(String(l.id))) map[sub].completed += 1;
    }
    const order = availableSubjects.filter((x) => map[x]);
    const rest = Object.keys(map).filter((x) => !order.includes(x));
    return [...order, ...rest].map((x) => map[x]);
  }, [selectedGrade, selectedTerm, termScopedLessons, completedLessonIds, availableSubjects]);

  const progressTotals = useMemo(() => {
    const total = progressView.reduce((n, r) => n + (r.total || 0), 0);
    const completed = progressView.reduce((n, r) => n + (r.completed || 0), 0);
    return { total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
  }, [progressView]);

  const studentName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email?.split("@")[0] ||
    "طالب";

  async function persistGradeChoice(stage, grade) {
    setGradeSaveError("");
    setGradeSaving(true);
    try {
      if (session) {
        await saveStudentGradeMeta(stage || null, grade);
      } else {
        writeGuestGradeLocal(stage || null, grade);
      }
      setSelectedStage(stage || "");
      setSelectedGrade(grade);
      setSelectedTerm("");
      setSelectedSubject("");
      setPickingGrade(false);
    } catch (err) {
      setGradeSaveError("تعذر حفظ الصف. حاول مرة أخرى.");
      console.warn("persistGradeChoice:", err);
    } finally {
      setGradeSaving(false);
    }
  }

  useEffect(() => {
    if (!selectedSubject || !scrollToLessonsRef.current) return;
    scrollToLessonsRef.current = false;
    const id = window.requestAnimationFrame(() => {
      const el = lessonsSectionRef.current;
      if (!el) return;
      if (el.getBoundingClientRect().top < window.innerHeight - 160) return; // already visible (side-by-side / just below the units)
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [selectedSubject]);

  function openChangeGrade() {
    setMenuOpen(false);
    setPickingGrade(true);
    setGradeSaveError("");
  }

  async function cancelGradePick() {
    setGradeSaveError("");
    if (session) {
      try {
        const meta = await getStudentGradeMeta();
        setSelectedStage(meta.stage || "");
        setSelectedGrade(meta.grade || "");
        setPickingGrade(!meta.grade);
      } catch {
        setPickingGrade(false);
      }
    } else {
      const local = readGuestGradeLocal();
      if (local?.grade) {
        setSelectedStage(local.stage || "");
        setSelectedGrade(local.grade);
        setPickingGrade(false);
      } else {
        setPickingGrade(true);
      }
    }
  }


  return (
    <div className="md-platform">
      <div className="md-topbar flex justify-end items-center gap-2 px-4 sm:px-6 py-2 relative z-20" style={{ background: "transparent" }}>
        {lessons && lessons.length > 0 && gradeMetaReady && selectedGrade && !pickingGrade && continueLesson && (
          <button
            type="button"
            className="md-continue-chip"
            onClick={() => navigate(lessonPath(continueLesson.lesson))}
            title={`متابعة التعلم: ${continueLesson.lesson.title}`}
            aria-label={`متابعة التعلم: ${continueLesson.lesson.title}`}
          >
            <span className="md-continue-chip-icon" aria-hidden="true">▶</span>
            <span className="md-continue-chip-label">استكمل التعلم</span>
            <span className="md-continue-chip-text">
              <b>{continueLesson.lesson.title}</b>
              <small>
                {continueLesson.done ? "مكتمل ✓" : `آخر موضع: المشهد ${continueLesson.sceneIdx + 1}`}
              </small>
            </span>
          </button>
        )}
        {session === undefined ? null : session ? (
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((v) => !v)}
              className="md-account-btn flex items-center gap-2 rounded-full py-1 px-2 bg-white/90 shadow-sm" style={{ border: "1px solid #DED4BD" }}>
              <LetterAvatar name={studentName} email={session.user?.email} size={28} />
              <span className="text-xs font-bold hidden sm:inline" style={{ color: "#22291F" }}>{studentName}</span>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white shadow-lg py-2 z-50 dir-rtl text-right" style={{ border: "1px solid #DED4BD" }}>
                <button type="button" className="w-full text-right px-4 py-2 text-xs font-bold" style={{ color: "#10665A" }}
                  onClick={openChangeGrade}>تغيير الصف الدراسي</button>
                {selectedGrade ? (
                  <p className="px-4 pb-2 text-[11px]" style={{ color: "#8A8570" }}>
                    الحالي: {selectedStage ? selectedStage + " · " : ""}{selectedGrade}
                  </p>
                ) : null}
                <button type="button" className="w-full text-right px-4 py-2 text-xs" style={{ color: "#C53030" }}
                  onClick={async () => { setMenuOpen(false); try { await signOut(); } catch (_) {} }}>تسجيل الخروج</button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" onClick={() => setAuthOpen(true)}
            className="md-login-btn text-xs font-bold px-3 py-1.5 rounded-xl text-white shadow-sm" style={{ background: "#10665A" }}>تسجيل الدخول</button>
        )}
      </div>
      {/* Background layers */}
      <div
        className="md-bg-layer"
        style={{
          transform: `translate(${pointer.x * 12}px, ${pointer.y * 8}px)`,
        }}
      >
        <ContinentsAtlas progress={progress} />
        <Galaxy progress={progress} />
      </div>

      {/* Corner compass */}
      <div className="md-corner-compass">
        <CompassRose />
      </div>

      <main className="md-main">
        {/* Hero */}
        <header className="md-hero">
  <div className="md-hero-logo-wrap">
    <img 
      src="/photo/IevsR.png" 
      alt="مَدَار" 
      className="md-hero-logo"
    />
  </div>
  <div className="md-badge">منصة مَدَار لتعلم الدرسات الاجتماعيه</div>
  <h1>منصة مَدَار التعليمية</h1>
  <p>للتعلم بأسلوب تفاعلي ومرئ</p>
</header>

        {/* اختيار المرحلة والصف (أول مرة أو تغيير الصف) */}
        {lessons && lessons.length > 0 && gradeMetaReady && pickingGrade && (
          <section className="md-dashboard mb-6" aria-label="اختيار الصف الدراسي">
            <div className="md-panel rounded-2xl p-5 bg-white shadow-sm" style={{ border: "1px solid #DED4BD" }}>
              <h2 className="font-black text-base mb-1" style={{ color: "#10665A" }}>اختر صفك الدراسي</h2>
              <p className="text-xs mb-4" style={{ color: "#8A8570" }}>
                سنعرض لك الدروس الخاصة بصفك . يمكنك تغيير الصف لاحقًا من قائمة الحساب.
              </p>
              {availableStages.length > 1 && (
                <div className="mb-4">
                  <p className="text-xs font-bold mb-2" style={{ color: "#5C5A4A" }}>المرحلة الدراسية</p>
                  <div className="md-chips">
                    {availableStages.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`md-chip ${selectedStage === st ? "selected" : ""}`}
                        disabled={gradeSaving}
                        onClick={() => {
                          setSelectedStage(st);
                          setSelectedGrade("");
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(selectedStage || availableStages.length <= 1) && (
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: "#5C5A4A" }}>الصف الدراسي</p>
                  {availableGrades.length === 0 ? (
                    <p className="md-empty">لا توجد صفوف منشورة لهذه المرحلة حالياً.</p>
                  ) : (
                    <div className="md-chips">
                      {availableGrades.map((g) => (
                        <button
                          key={g}
                          type="button"
                          className={`md-chip ${selectedGrade === g ? "selected" : ""}`}
                          disabled={gradeSaving}
                          onClick={() => persistGradeChoice(selectedStage || (availableStages.length === 1 ? availableStages[0] : ""), g)}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {gradeSaveError && (
                <p className="text-xs mt-3" style={{ color: "#C53030" }}>{gradeSaveError}</p>
              )}
              {gradeSaving && (
                <p className="text-xs mt-3" style={{ color: "#8A8570" }}>جاري الحفظ...</p>
              )}
              {selectedGrade && (
                <button
                  type="button"
                  className="mt-4 text-xs font-bold"
                  style={{ color: "#8A8570" }}
                  disabled={gradeSaving}
                  onClick={cancelGradePick}
                >
                  إلغاء والبقاء على الصف الحالي
                </button>
              )}
            </div>
          </section>
        )}

        {/* لوحة متابعة — فقط بعد تحديد الصف، ومحتوى الصف فقط */}
        {lessons && lessons.length > 0 && selectedGrade && !pickingGrade && (
          <section className="md-dashboard mb-6" aria-label="متابعة التعلم">
            {progressPath.total > 0 && (
              <div
                className="md-jp"
                role="progressbar"
                aria-label="تقدّمك في المسار"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPath.pct}
              >
                <p className="md-jp-where">
                  {progressPath.current ? (
                    <>
                      <span>أنت الآن في</span>
                      <b>{progressPath.current.unit}</b>
                      <span className="md-jp-sep">›</span>
                      <b>{progressPath.current.title}</b>
                    </>
                  ) : (
                    <span>أحسنت! أنهيت كل دروس هذا الفصل</span>
                  )}
                </p>
                <div className="md-jp-row">
                  <div className="md-jp-bar" aria-hidden="true">
                    {progressPath.segments.map((seg) => (
                      <i
                        key={seg.id}
                        title={seg.title}
                        className={`md-jp-seg${seg.done ? " done" : ""}${progressPath.current && progressPath.current.id === seg.id ? " current" : ""}${seg.unitStart ? " unit-start" : ""}`}
                      />
                    ))}
                  </div>
                  <span className="md-jp-pct">{progressPath.pct}%</span>
                </div>
              </div>
            )}
            {recentLessons.length > 0 && (
              <div>
                <p className="md-section-label text-xs font-bold mb-2" style={{ color: "#8A8570" }}>أحدث الدروس </p>
                <div className="flex flex-wrap gap-2">
                  {recentLessons.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => navigate(lessonPath(l))}
                      className="md-recent-chip text-xs font-bold px-3 py-2 rounded-xl bg-white"
                      style={{ border: "1px solid #DED4BD", color: "#22291F" }}
                    >
                      {l.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </section>
        )}

        {error && (
          <div className="md-alert error flex flex-wrap items-center justify-between gap-3">
            <span><span>⚠</span> {error}</span>
            <button
              type="button"
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: "#10665A", color: "#fff" }}
              onClick={() => {
                setError("");
                setLessons(null);
                listPublishedLessons()
                  .then(setLessons)
                  .catch(() => setError("تعذر تحميل الدروس. تحقق من الاتصال وحاول مرة أخرى."));
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {lessons === null && !error && (
          <div className="md-loading">
            <CompassSpinner />
            <p className="text-sm mt-3 font-medium" style={{ color: "#8A8570" }}>جاري تجهيز مسارك التعليمي...</p>
          </div>
        )}

        {lessons !== null && selectedGrade && !pickingGrade && (
          <div className="md-journey">
            <div className="md-context">
              <button
                type="button"
                className="md-ctx-grade"
                onClick={() => setPickingGrade(true)}
                title="تغيير الصف"
                aria-label={`تغيير الصف: ${selectedGrade}`}
              >
                <span className="md-ctx-grade-text">
                  {selectedStage ? selectedStage + " · " : ""}{selectedGrade}
                </span>
                <span className="md-ctx-caret" aria-hidden="true">▾</span>
              </button>
              {availableTerms.length > 0 && (
                <div className="md-ctx-terms" role="group" aria-label="الفصل الدراسي">
                  {availableTerms.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`md-chip ${selectedTerm === t ? "selected" : ""}`}
                      aria-pressed={selectedTerm === t}
                      onClick={() => {
                        setSelectedTerm(t);
                        setSelectedSubject("");
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {availableTerms.length === 0 && (
              <p className="md-empty">لا توجد فصول دراسية منشورة لهذا الصف حالياً.</p>
            )}

            {selectedTerm && (
              <div className="md-split">
                <aside className="md-units-rail" aria-label="الوحدات">
                <p className="md-rail-label">الوحدات</p>
                {availableSubjects.length === 0 ? (
                  <p className="md-empty">لا توجد مواد دراسية منشورة لهذا الصف حالياً.</p>
                ) : (
                  <div className="md-units-grid">
                    {availableSubjects.map((sub) => {
                      const subLessons = lessonsBySubject[sub] || [];
                      const isOpen = selectedSubject === sub;
                      const unitProg = progressView.find((r) => r.subject === sub);
                      const unitPct = unitProg && unitProg.total ? Math.round((unitProg.completed / unitProg.total) * 100) : 0;
                      return (
                        <div key={sub} className="md-unit-row">
                          <button
                            type="button"
                            className={`md-unit-card ${isOpen ? "selected" : ""}`}
                            onClick={() => {
                              scrollToLessonsRef.current = !isOpen;
                              setSelectedSubject(isOpen ? "" : sub);
                            }}
                          >
                            <span className="md-unit-card-title">{sub}</span>
                            <span className="md-unit-card-count">{subLessons.length} درس</span>
                            <span
                              className="md-unit-card-progress"
                              aria-hidden="true"
                              title={unitProg ? `${unitProg.completed} / ${unitProg.total}` : undefined}
                            >
                              <i style={{ width: unitPct + "%" }} />
                            </span>
                          </button>
                          {!isOpen && subLessons.length > 0 && (
                            <ul className="md-unit-preview">
                              {subLessons.map((l, i) => (
                                <li key={l.id}>
                                  <span className="md-unit-preview-num">الدرس {arabicLessonOrdinal(lessonDisplayNumber(l, i) - 1)}:</span> {l.title}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                </aside>

                <div className="md-split-main">
            {selectedSubject ? (
              <section key={selectedSubject} ref={lessonsSectionRef} className="md-lessons">
                <div className="md-lessons-header">
                  <h2 className="md-lessons-title">
                    <span>{selectedGrade}</span>
                    <i aria-hidden="true">·</i>
                    <span>{selectedTerm}</span>
                    <i aria-hidden="true">·</i>
                    <b>{selectedSubject}</b>
                  </h2>
                  <span className="md-count">{filteredLessons.length} درس</span>
                </div>

                {filteredLessons.length === 0 ? (
                  <p className="md-empty">لا توجد دروس منشورة حالياً.</p>
                ) : (
                  <div className="md-lessons-grid">
                    {sequentialLessons.map(({ lesson: l, kind }, lessonIdx) => {
                      const ui = lessonLockUi(kind);
                      const comingSoon = kind === "COMING_SOON";
                      const lockedSeq = kind === "SEQUENCE_LOCK" || comingSoon;
                      const lockedAccess = kind === "ACCESS_LOCK";
                      const openLesson = () => {
                        if (lockedSeq) return;
                        if (lockedAccess) {
                          setAuthOpen(true);
                          return;
                        }
                        navigate(lessonPath(l));
                      };
                      return (
                      <article
                        key={l.id}
                        data-num={String(lessonDisplayNumber(l, lessonIdx)).padStart(2, "0")}
                        data-kind={kind}
                        className={`md-lesson-card${lockedSeq ? " md-lesson-locked" : ""}${comingSoon ? " md-lesson-soon" : ""}`}
                        role="button"
                        tabIndex={lockedSeq ? -1 : 0}
                        title={ui.hint}
                        aria-disabled={lockedSeq}
                        onClick={openLesson}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openLesson();
                          }
                        }}
                        style={
                          lockedSeq
                            ? { opacity: 0.72, cursor: "not-allowed" }
                            : lockedAccess
                              ? { cursor: "pointer", borderColor: "rgba(183, 122, 32, 0.45)" }
                              : undefined
                        }
                      >
                        <div className="md-lesson-glow" />
                        <div className="md-lesson-body">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm" aria-hidden="true">{ui.mark}</span>
                            <h3 style={{ margin: 0 }}>{l.title}</h3>
                            {comingSoon ? <span className="md-soon-badge">قريبًا</span> : null}
                          </div>
                          <p>{l.description || "درس تعليمي شامل مع خريطة ذهنية وأسئلة تفاعلية."}</p>
                          <div className="md-lesson-cta" style={lockedSeq ? { color: "#8A8570" } : lockedAccess ? { color: "#B77A20" } : undefined}>
                            {ui.cta}
                            {!lockedSeq ? <span>→</span> : null}
                          </div>
                        </div>
                      </article>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : (
              <div className="md-split-empty">
                <span className="md-split-empty-icon" aria-hidden="true">←</span>
                <p>اختر وحدة لتظهر دروسها هنا</p>
              </div>
            )}
                </div>
              </div>
            )}
          </div>
        )}

        <section className="md-features" aria-label="ماذا ستجد في مَدَار">
          <div className="md-features-head">
            <h2>كل ما تحتاجه لتفهم الدرسات الاجتماعية</h2>
            <p>أدوات بسيطة تساعدك على الفهم والمراجعة في مكان واحد</p>
          </div>
          <div className="md-features-grid">
            {MADAR_FEATURES.map((f) => (
              <div key={f.title} className="md-feature">
                <span className="md-feature-icon" aria-hidden="true">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <HistoryFrieze />
      <Footer />
      <GuestWelcomeBanner session={session} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <ComingSoonAssistantBubble />

      {/* Global Styles for this page */}
      <style>{`
  :root {
    /* =========================
       MADAR — EDUCATIONAL PREMIUM
       White + Deep Petrol + Calm Teal + Heritage Gold
       ========================= */
    --md-bg: #FFFFFF;
    --md-surface: #FFFFFF;
    --md-surface-2: #F7FAF9;
    --md-surface-3: #EEF5F3;

    --md-teal: #117A6B;
    --md-teal-deep: #0B5147;
    --md-teal-dark: #063B34;
    --md-teal-mid: #249786;
    --md-teal-light: #58B5A5;
    --md-teal-soft: #E5F3F0;

    --md-gold: #B77A20;
    --md-gold-deep: #8F5D14;
    --md-gold-light: #D5A04A;
    --md-gold-soft: #FBF3E4;

    --md-text: #14231F;
    --md-text-soft: #30453F;
    --md-muted: #687B75;
    --md-muted-light: #91A09B;

    --md-border: #DDE9E5;
    --md-border-strong: #C5D8D2;

    --md-shadow-sm:
      0 2px 8px rgba(6, 59, 52, 0.06);
    --md-shadow-md:
      0 10px 28px rgba(6, 59, 52, 0.10);
    --md-shadow-lg:
      0 20px 50px rgba(6, 59, 52, 0.14);

    --md-radius: 18px;
    --md-radius-lg: 24px;
  }

  /* =========================
     HERO LOGO
     ========================= */
  .md-hero-logo-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 26px;
    position: relative;
  }

  .md-hero-logo-wrap::before {
    content: "";
    position: absolute;
    width: 170px;
    height: 170px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.20), rgba(255, 255, 255, 0.05) 50%, transparent 72%);
    z-index: -1;
  }

  .md-hero-logo {
    height: 58px;
    width: auto;
    object-fit: contain;
    box-sizing: content-box;
    padding: 14px 26px;
    border-radius: 26px;
    background: #FFFFFF;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22), 0 0 0 6px rgba(255, 255, 255, 0.10);
    transition: transform 0.35s ease, box-shadow 0.35s ease;
  }

  .md-hero-logo:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.28), 0 0 0 8px rgba(255, 255, 255, 0.12);
  }

  /* =========================
     PLATFORM
     ========================= */
  .md-platform {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(
        circle at 50% -8%,
        rgba(17, 122, 107, 0.045),
        transparent 40%
      ),
      radial-gradient(
        circle at 92% 18%,
        rgba(17, 122, 107, 0.03),
        transparent 42%
      ),
      radial-gradient(
        circle at 8% 78%,
        rgba(183, 122, 32, 0.025),
        transparent 38%
      ),
      #FFFFFF;
    color: var(--md-text);
    font-family:
      "Segoe UI",
      "Cairo",
      "Noto Sans Arabic",
      system-ui,
      sans-serif;
    position: relative;
    overflow-x: hidden;
    overflow-x: clip;
    direction: rtl;
  }

  .md-main {
    flex: 1;
    position: relative;
    z-index: 2;
    --md-main-pb: 72px;
    max-width: 1040px;
    margin: 0 auto;
    padding: 0 20px var(--md-main-pb);
  }

  /* =========================
     BACKGROUND
     ========================= */
  .md-bg-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
    transition: transform 0.4s ease-out;
  }

  .md-galaxy {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .md-nebula {
    position: absolute;
    width: 80vmin;
    height: 80vmin;
    border-radius: 50%;
    background:
      radial-gradient(
        circle,
        rgba(17, 122, 107, 0.06) 0%,
        rgba(17, 122, 107, 0.028) 35%,
        transparent 68%
      );
    filter: blur(38px);
  }

  .md-bg-layer::before,
  .md-bg-layer::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .md-bg-layer::before {
    width: 440px;
    height: 440px;
    top: -230px;
    right: -190px;
    background:
      radial-gradient(
        circle,
        rgba(17, 122, 107, 0.08),
        transparent 70%
      );
  }

  .md-bg-layer::after {
    width: 340px;
    height: 340px;
    bottom: -170px;
    left: -150px;
    background:
      radial-gradient(
        circle,
        rgba(183, 122, 32, 0.05),
        transparent 70%
      );
  }

  /* =========================
     STARS
     ========================= */
  .md-star {
    position: absolute;
    border-radius: 50%;
    background: var(--md-teal);
    opacity: 0.22;
    box-shadow: 0 0 6px rgba(17, 122, 107, 0.25);
  }

  .md-star.twinkle {
    animation: twinkle 4.5s ease-in-out infinite;
  }

  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.12;
      transform: scale(1);
    }
    50% {
      opacity: 0.38;
      transform: scale(1.28);
    }
  }

  /* =========================
     ORBITS
     ========================= */
  .md-orbit {
    position: absolute;
    border: 1px solid rgba(17, 122, 107, 0.14);
    border-radius: 50%;
    opacity: 0.28;
    animation: spin linear infinite;
    transition:
      opacity 0.45s ease,
      border-color 0.45s ease,
      box-shadow 0.45s ease;
  }

  .md-orbit.active {
    opacity: 0.95;
    border-color: rgba(183, 122, 32, 0.78);
    box-shadow:
      0 0 20px rgba(183, 122, 32, 0.14),
      inset 0 0 16px rgba(183, 122, 32, 0.04);
  }

  .md-planet {
    position: absolute;
    top: -5px;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform: translateX(-50%);
    background:
      radial-gradient(
        circle at 35% 30%,
        var(--md-gold-light),
        var(--md-gold) 55%,
        var(--md-gold-deep)
      );
    box-shadow:
      0 0 0 3px rgba(183, 122, 32, 0.08),
      0 0 10px rgba(183, 122, 32, 0.14);
    opacity: 0.55;
    transition:
      box-shadow 0.4s ease,
      opacity 0.4s ease;
  }

  .md-orbit.active .md-planet {
    opacity: 1;
    box-shadow:
      0 0 0 4px rgba(183, 122, 32, 0.18),
      0 0 18px rgba(183, 122, 32, 0.32),
      0 0 28px rgba(183, 122, 32, 0.12);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* =========================
     ATLAS
     ========================= */
  .md-atlas {
    position: absolute;
    bottom: 8%;
    left: 50%;
    transform: translateX(-50%);
    width: min(680px, 92vw);
    opacity: 0.04;
    filter:
      grayscale(1)
      sepia(0.12);
  }

  .md-atlas-svg {
    width: 100%;
    height: auto;
  }

  /* =========================
     COMPASS
     ========================= */
  .md-corner-compass {
    position: fixed;
    top: 28px;
    left: 28px;
    width: 64px;
    height: 64px;
    color: var(--md-gold);
    opacity: 0.24;
    z-index: 5;
    pointer-events: none;
    filter:
      drop-shadow(0 4px 10px rgba(183, 122, 32, 0.12));
  }

  /* =========================
     HERO
     ========================= */
  /* Full-bleed "orbit" hero: deep teal band with concentric rings */
  .md-hero {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100vw;
    margin: 0 calc(50% - 50vw);
    padding: clamp(44px, 7vw, 84px) 20px clamp(96px, 12vw, 128px);
    text-align: center;
    background:
      radial-gradient(circle at 82% 8%, rgba(213, 160, 74, 0.20), transparent 38%),
      linear-gradient(160deg, var(--md-teal-dark) 0%, var(--md-teal-deep) 55%, var(--md-teal) 130%);
    border-radius: 0 0 clamp(32px, 6vw, 72px) clamp(32px, 6vw, 72px);
    box-shadow: 0 24px 60px rgba(6, 59, 52, 0.22);
  }

  .md-hero > * {
    position: relative;
    z-index: 1;
    animation: md-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .md-hero > *:nth-child(2) { animation-delay: 0.06s; }
  .md-hero > *:nth-child(3) { animation-delay: 0.12s; }
  .md-hero > *:nth-child(4) { animation-delay: 0.18s; }

  .md-hero::before,
  .md-hero::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 46%;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  .md-hero::before {
    width: min(820px, 150vw);
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    border: 1px solid rgba(255, 255, 255, 0.10);
    box-shadow:
      0 0 0 clamp(48px, 8vw, 90px) rgba(255, 255, 255, 0.025),
      0 0 0 clamp(96px, 16vw, 180px) rgba(255, 255, 255, 0.018);
  }

  .md-hero::after {
    width: min(520px, 110vw);
    aspect-ratio: 1;
    border: 1px dashed rgba(213, 160, 74, 0.38);
    transform: translate(-50%, -50%);
    animation: md-orbit-turn 120s linear infinite;
  }

  @keyframes md-orbit-turn {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes md-rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .md-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 7px 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: var(--md-gold-light);
    font-size: 0.85rem;
    font-weight: 700;
    margin-bottom: 20px;
    border: 1px solid rgba(213, 160, 74, 0.45);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .md-badge::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--md-gold-light);
    box-shadow: 0 0 0 3px rgba(213, 160, 74, 0.22);
  }

  .md-hero h1 {
    font-size: clamp(2.2rem, 6.5vw, 3.8rem);
    font-weight: 900;
    line-height: 1.25;
    margin: 0 auto 18px;
    max-width: 16em;
    color: #FFFFFF;
    background: none;
    -webkit-text-fill-color: #FFFFFF;
    text-wrap: balance;
  }

  .md-hero p {
    color: rgba(255, 255, 255, 0.82);
    font-size: clamp(1rem, 2.4vw, 1.18rem);
    line-height: 2;
    margin: 0 auto;
    max-width: 36em;
    text-wrap: balance;
  }

  /* =========================
     ALERT
     ========================= */
  .md-alert {
    padding: 14px 18px;
    border-radius: 14px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
    box-shadow: var(--md-shadow-sm);
  }

  .md-alert.error {
    background: #FFF7F7;
    border: 1px solid #F3D0D0;
    color: #B83232;
  }

  /* =========================
     LOADING
     ========================= */
  .md-loading {
    display: flex;
    justify-content: center;
    padding: 60px 0;
  }

  .md-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .md-spinner-rose {
    width: 56px;
    height: 56px;
    color: var(--md-teal);
    animation: spin 4s linear infinite;
  }

  .md-spinner-text {
    color: var(--md-muted);
    font-size: 0.9rem;
  }

  /* =========================
     JOURNEY
     ========================= */
  /* Journey = an open vertical timeline (no boxes) */
  .md-journey {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 44px;
    animation: md-rise 0.6s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .md-journey-meta {
    width: fit-content;
    max-width: 100%;
    gap: 10px;
    padding: 8px 8px 8px 18px;
    margin-bottom: 30px !important;
    border-radius: 999px;
    background: var(--md-teal-soft);
    border: 1px solid rgba(17, 122, 107, 0.16);
    font-size: 0.85rem !important;
  }

  .md-link-btn {
    padding: 4px 14px;
    border-radius: 999px;
    background: #FFFFFF;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .md-link-btn:hover {
    background: var(--md-teal);
    color: #FFFFFF !important;
    text-decoration: none;
  }

  .md-step {
    display: flex;
    gap: clamp(16px, 3vw, 28px);
    padding: 4px 0;
  }

  .md-step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 44px;
    flex-shrink: 0;
  }

  .md-step-number {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.05rem;
    background: #FFFFFF;
    border: 2px solid var(--md-border-strong);
    color: var(--md-muted);
    transition: all 0.3s ease;
  }

  .md-step.done .md-step-number {
    background: linear-gradient(135deg, var(--md-teal), var(--md-teal-deep));
    border-color: var(--md-teal-deep);
    color: #FFFFFF;
    box-shadow: 0 8px 20px rgba(6, 59, 52, 0.22);
  }

  .md-step.active .md-step-number {
    border-color: var(--md-gold);
    color: var(--md-gold-deep);
    background: var(--md-gold-soft);
    box-shadow: 0 0 0 6px rgba(183, 122, 32, 0.12);
  }

  .md-step-line {
    width: 2px;
    flex: 1;
    margin-top: 8px;
    min-height: 32px;
    border-radius: 2px;
    background: repeating-linear-gradient(180deg, var(--md-border-strong) 0 6px, transparent 6px 12px);
  }

  .md-step:last-child .md-step-line {
    display: none;
  }

  .md-step-content {
    flex: 1;
    min-width: 0; /* عشان النص ميتقطعش */
    padding-bottom: 36px;
  }

  .md-step-label {
    display: block;
    width: 100%;
    margin-bottom: 16px;
    font-size: 1.25rem;
    font-weight: 900;
    line-height: 44px;
    color: var(--md-text-soft);
  }

  .md-step.active .md-step-label { color: var(--md-gold-deep); }
  .md-step.done .md-step-label { color: var(--md-teal-deep); }

  /* =========================
     CHIPS
     ========================= */
  .md-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .md-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 46px;
    padding: 10px 22px;
    border-radius: 999px;
    background: #FFFFFF;
    border: 1.5px solid var(--md-border-strong);
    color: var(--md-text-soft);
    font-size: 0.98rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  }

  .md-chip:hover {
    border-color: var(--md-teal);
    background: var(--md-teal-soft);
    transform: translateY(-2px);
  }

  .md-chip.selected {
    background: var(--md-teal-deep);
    border-color: var(--md-teal-deep);
    color: #FFFFFF;
    box-shadow: 0 10px 24px rgba(6, 59, 52, 0.24);
  }

  .md-chip.selected::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--md-gold-light);
  }

  .md-chip:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .md-chip:focus-visible,
  .md-unit-card:focus-visible,
  .md-lesson-card:focus-visible,
  .md-continue-btn:focus-visible,
  .md-recent-chip:focus-visible {
    outline: 3px solid rgba(213, 160, 74, 0.6);
    outline-offset: 3px;
  }

  .md-empty {
    color: var(--md-muted);
    font-size: 0.95rem;
    margin: 0;
    padding: 16px 20px;
    border-radius: 16px;
    background: var(--md-surface-2);
    border: 1px dashed var(--md-border-strong);
  }

  /* =========================
     TOP BAR
     ========================= */
  .md-topbar {
    position: sticky;
    top: 0;
    z-index: 40 !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    background: rgba(255, 255, 255, 0.82) !important;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--md-border);
  }

  .md-account-btn { min-height: 44px; transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .md-account-btn:hover { box-shadow: var(--md-shadow-md); transform: translateY(-1px); }

  .md-topbar .md-login-btn {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 22px;
    border-radius: 999px;
    font-size: 0.82rem;
    box-shadow: 0 6px 16px rgba(6, 59, 52, 0.20);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  }

  .md-topbar .md-login-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
    box-shadow: 0 10px 22px rgba(6, 59, 52, 0.26);
  }

  /* =========================
     DASHBOARD — floating cards over the hero, then open sections
     ========================= */
  .md-dashboard {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 34px;
    margin-top: 40px;
    margin-bottom: 0 !important;
  }

  .md-hero + .md-dashboard:has(> .md-continue),
  .md-hero + .md-dashboard:has(> .md-panel) {
    margin-top: calc(-1 * clamp(56px, 8vw, 76px));
  }

  .md-dashboard > .md-continue { margin-bottom: 0 !important; }
  .md-dashboard > div.mt-4 { margin-top: 0 !important; }

  .md-panel {
    position: relative;
    overflow: hidden;
    border-radius: 28px !important;
    padding: clamp(24px, 4vw, 40px) !important;
    border-color: transparent !important;
    background: #FFFFFF !important;
    box-shadow: 0 24px 60px rgba(6, 59, 52, 0.16), 0 2px 8px rgba(6, 59, 52, 0.06) !important;
  }

  .md-panel::before,
  .md-continue::before {
    content: "";
    position: absolute;
    inset-inline: 0;
    top: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--md-teal), var(--md-gold));
  }

  .md-panel h2 {
    font-size: 1.5rem;
    font-weight: 900;
    margin-bottom: 6px;
  }

  .md-continue {
    position: relative;
    overflow: hidden;
    border-radius: 28px !important;
    padding: clamp(22px, 3.5vw, 32px) clamp(22px, 4vw, 40px) !important;
    background: #FFFFFF !important;
    border-color: transparent !important;
    box-shadow: 0 24px 60px rgba(6, 59, 52, 0.16), 0 2px 8px rgba(6, 59, 52, 0.06) !important;
  }

  .md-continue .font-black {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    line-height: 1.5;
    color: var(--md-teal-deep) !important;
  }

  .md-continue .md-continue-btn {
    padding: 14px 28px;
    border-radius: 999px;
    font-size: 0.95rem;
    box-shadow: 0 10px 24px rgba(6, 59, 52, 0.26);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }

  .md-continue .md-continue-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(6, 59, 52, 0.32);
  }

  .md-dashboard .md-section-label {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 0.82rem;
    font-weight: 800;
    margin-bottom: 16px !important;
    color: var(--md-teal-deep) !important;
  }

  .md-dashboard .md-section-label::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--md-border);
  }

  .md-dashboard .md-recent-chip {
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 0.85rem;
    background: var(--md-surface-2);
    border-color: var(--md-border) !important;
    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  }

  .md-dashboard .md-recent-chip:hover {
    background: var(--md-teal-soft);
    border-color: var(--md-teal) !important;
    transform: translateY(-2px);
  }

  /* progress: open rows with hairlines, not boxes */
  .md-dashboard .md-progress-grid {
    gap: 8px clamp(28px, 5vw, 56px);
  }

  .md-progress-row {
    padding: 4px 0 18px !important;
    border: 0 !important;
    border-bottom: 1px solid var(--md-border) !important;
    border-radius: 0 !important;
    background: transparent !important;
    font-size: 0.86rem;
    line-height: 1.8;
  }

  .md-progress-row p:first-child {
    font-size: 1.05rem;
    font-weight: 900;
  }

  .md-progress-row .md-progress-track {
    height: 6px !important;
    margin-top: 12px !important;
    overflow: hidden;
    border-radius: 999px;
  }

  .md-progress-fill {
    background-image: linear-gradient(90deg, var(--md-teal), var(--md-gold)) !important;
    transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* =========================
     COMING-SOON ASSISTANT BUBBLE
     ========================= */
  .md-assistant-wrap {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .md-assistant-bubble {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 1.5px solid rgba(17, 122, 107, 0.25);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFFFFF;
    box-shadow: 0 8px 22px rgba(6, 59, 52, 0.28);
    animation: md-assistant-float 2.6s ease-in-out infinite;
  }

  .md-assistant-bubble:hover {
    box-shadow: 0 10px 26px rgba(6, 59, 52, 0.34);
  }

  .md-assistant-bubble-logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
    pointer-events: none;
  }

  @keyframes md-assistant-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .md-assistant-bubble { animation: none; }
  }

  .md-assistant-tooltip {
    max-width: 200px;
    background: #FFFFFF;
    border: 1px solid var(--md-border);
    border-radius: 14px;
    padding: 10px 14px;
    text-align: right;
    box-shadow: 0 8px 20px rgba(6, 59, 52, 0.14);
  }

  .md-assistant-tooltip-title {
    margin: 0 0 2px;
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--md-teal-deep);
  }

  .md-assistant-tooltip-body {
    margin: 0;
    font-size: 0.78rem;
    color: var(--md-muted);
  }

  /* =========================
     UNIT CARDS + LESSON PREVIEW
     ========================= */
  /* Units = numbered editorial list, hairline separated */
  .md-units-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 clamp(28px, 5vw, 56px);
    counter-reset: unit;
    align-items: start;
  }

  .md-unit-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 6px 0 16px;
    border-bottom: 1px solid var(--md-border);
    counter-increment: unit;
  }

  .md-unit-card {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 68px;
    padding: 12px 16px;
    border-radius: 18px;
    /* visible button surface so students recognise it as clickable */
    background: #FFFFFF;
    border: 1.5px solid var(--md-border-strong);
    box-shadow: 0 4px 12px rgba(6, 59, 52, 0.08);
    cursor: pointer;
    text-align: right;
    transition: background 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }

  /* arrow affordance (points forward in RTL, turns down when the unit is open) */
  .md-unit-card::after {
    content: "‹";
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--md-teal-soft);
    color: var(--md-teal-deep);
    font-size: 1.4rem;
    font-weight: 900;
    line-height: 1;
    padding-bottom: 3px;
    transition: transform 0.22s ease, background 0.22s ease, color 0.22s ease;
  }

  .md-unit-card::before {
    content: counter(unit, decimal-leading-zero);
    flex-shrink: 0;
    font-size: 1.9rem;
    font-weight: 900;
    line-height: 1;
    color: var(--md-gold-light);
    opacity: 0.85;
    font-variant-numeric: tabular-nums;
  }

  .md-unit-card:hover {
    background: var(--md-teal-soft);
    border-color: var(--md-teal);
    box-shadow: 0 10px 24px rgba(6, 59, 52, 0.14);
    transform: translateX(-4px);
  }

  .md-unit-card:hover::after {
    background: var(--md-teal);
    color: #FFFFFF;
  }

  .md-unit-card.selected {
    background: linear-gradient(135deg, var(--md-teal-deep), var(--md-teal-dark));
    border-color: var(--md-teal-deep);
    box-shadow: 0 14px 30px rgba(6, 59, 52, 0.26);
    transform: none;
  }

  .md-unit-card.selected::after {
    background: rgba(255, 255, 255, 0.16);
    color: #FFFFFF;
    transform: rotate(-90deg);
  }

  .md-unit-card.selected::before { color: var(--md-gold-light); opacity: 1; }

  .md-unit-card-title {
    flex: 1;
    font-weight: 800;
    font-size: 1.08rem;
    line-height: 1.5;
    color: var(--md-text);
  }

  .md-unit-card.selected .md-unit-card-title { color: #FFFFFF; }

  .md-unit-card-count {
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--md-teal-deep);
    background: var(--md-teal-soft);
    padding: 5px 12px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .md-unit-card.selected .md-unit-card-count {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.16);
  }

  .md-unit-preview {
    list-style: none;
    margin: 0 30px 0 0;
    padding: 0 16px 0 0;
    border-inline-start: 2px solid var(--md-gold-light);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .md-unit-preview li {
    font-size: 0.86rem;
    color: var(--md-text-soft);
    line-height: 1.7;
  }

  .md-unit-preview-num {
    color: var(--md-teal-deep);
    font-weight: 800;
  }

  /* =========================
     LESSONS
     ========================= */
  /* Lessons = full-bleed tinted band; the only place real cards appear */
  .md-lessons {
    margin: 48px calc(50% - 50vw) calc(-1 * var(--md-main-pb));
    padding: clamp(40px, 6vw, 68px) calc(50vw - 50%);
    background: linear-gradient(180deg, var(--md-surface-2), var(--md-teal-soft));
    border-block: 1px solid var(--md-border);
  }

  .md-lessons-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: clamp(24px, 4vw, 36px);
  }

  .md-lessons-header h2 {
    position: relative;
    margin: 0;
    padding-bottom: 14px;
    font-size: clamp(1.5rem, 4vw, 2.1rem);
    font-weight: 900;
    color: var(--md-teal-dark);
  }

  .md-lessons-header h2::after {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    bottom: 0;
    width: 48px;
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--md-gold), var(--md-gold-light));
  }

  .md-count {
    font-size: 0.85rem;
    font-weight: 800;
    color: #FFFFFF;
    background: var(--md-teal-deep);
    padding: 7px 16px;
    border-radius: 999px;
  }

  .md-lessons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 22px;
    counter-reset: lesson;
  }

  /* =========================
     LESSON CARD
     ========================= */
  .md-lesson-card {
    position: relative;
    display: flex;
    flex-direction: column;
    counter-increment: lesson;
    border-radius: 24px;
    background: #FFFFFF;
    border: 1px solid var(--md-border);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s ease, box-shadow 0.28s ease;
    box-shadow: 0 2px 10px rgba(6, 59, 52, 0.05);
  }

  .md-lesson-card::after {
    content: attr(data-num);
    position: absolute;
    top: 12px;
    inset-inline-end: 20px;
    font-size: 3rem;
    font-weight: 900;
    line-height: 1;
    color: var(--md-teal);
    opacity: 0.09;
    pointer-events: none;
    font-variant-numeric: tabular-nums;
  }

  .md-lesson-card::before {
    content: "";
    position: absolute;
    inset-inline: 0;
    top: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--md-teal), var(--md-gold));
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.35s ease;
  }

  .md-lesson-card:hover {
    transform: translateY(-5px);
    border-color: rgba(17, 122, 107, 0.35);
    box-shadow: 0 22px 46px rgba(6, 59, 52, 0.14);
  }

  .md-lesson-card:hover::before { transform: scaleX(1); }

  .md-lesson-locked {
    background: var(--md-surface-3);
    border-style: dashed;
    box-shadow: none;
  }

  /* "Coming soon" lesson — card stays visible, clearly not openable */
  .md-lesson-soon {
    background: var(--md-gold-soft);
    border-color: rgba(183, 122, 32, 0.45);
  }

  .md-soon-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 12px;
    border-radius: 999px;
    background: var(--md-gold-soft);
    border: 1px solid var(--md-gold-light);
    color: var(--md-gold-deep);
    font-size: 0.72rem;
    font-weight: 800;
    line-height: 1.4;
  }

  .md-lesson-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(500px circle at var(--x, 50%) var(--y, 0%), rgba(17, 122, 107, 0.08), transparent 42%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .md-lesson-card:hover .md-lesson-glow { opacity: 1; }

  .md-lesson-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 26px 26px 22px;
    position: relative;
  }

  .md-lesson-body h3 {
    margin: 0 0 10px;
    font-size: 1.15rem;
    font-weight: 900;
    line-height: 1.5;
    color: var(--md-teal-dark);
  }

  .md-lesson-body p {
    margin: 0 0 22px;
    color: var(--md-muted);
    font-size: 0.9rem;
    line-height: 1.8;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .md-lesson-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--md-border);
    font-size: 0.92rem;
    font-weight: 800;
    color: var(--md-teal);
  }

  .md-lesson-cta span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--md-teal-soft);
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
  }

  .md-lesson-card:hover .md-lesson-cta span {
    transform: translateX(-4px);
    background: var(--md-teal);
    color: #FFFFFF;
  }

  /* =========================
     HISTORICAL FRIEZE
     ========================= */
  .md-frieze {
    position: relative;
    z-index: 2;
    margin-top: 40px;
    padding: 28px 0 10px;
    border-top: 1px solid var(--md-border);
    overflow: hidden;
  }

  .md-frieze-inner {
    display: flex;
    justify-content: center;
    gap: 28px;
    opacity: 0.2;
  }

  .md-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 22px;
  }

  .md-column-capital {
    width: 22px;
    height: 8px;
    background:
      linear-gradient(
        90deg,
        transparent,
        var(--md-gold),
        transparent
      );
    border-radius: 2px;
  }

  .md-column-shaft {
    width: 8px;
    height: 36px;
    background:
      linear-gradient(
        180deg,
        rgba(183, 122, 32, 0.42),
        rgba(183, 122, 32, 0.10)
      );
  }

  .md-column-base {
    width: 18px;
    height: 6px;
    background:
      rgba(183, 122, 32, 0.22);
    border-radius: 1px;
  }

  /* =========================
     FOOTER — ثابت من تحت
     ========================= */
  .md-footer {
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--md-border);
    padding: 14px 20px;
    text-align: center;
    box-shadow: 0 -4px 20px rgba(6, 59, 52, 0.06);
  }

  .md-footer-inner {
    max-width: 920px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
  }

  .md-footer-brand {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--md-teal-deep);
  }

  .md-footer-desc {
    font-size: 0.82rem;
    color: var(--md-muted);
    line-height: 1.6;
    max-width: 640px;
  }

  .md-footer-contact {
    font-size: 0.82rem;
    color: var(--md-text-soft);
  }

  .md-footer-contact a {
    color: var(--md-teal);
    text-decoration: none;
    font-weight: 600;
  }

  .md-footer-contact a:hover {
    text-decoration: underline;
  }

  .md-footer-copy {
    font-size: 0.78rem;
    color: var(--md-muted-light);
    margin-top: 2px;
  }

  /* =========================
     RESPONSIVE
     ========================= */
  @media (max-width: 1024px) {
    .md-main { max-width: 860px; }
    .md-lessons-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  }

  @media (max-width: 768px) {
    .md-hero-logo { height: 50px; padding: 12px 20px; border-radius: 22px; }
    .md-main { padding: 0 16px var(--md-main-pb); }
    .md-corner-compass { width: 44px; height: 44px; top: 16px; left: 16px; }
    .md-units-grid { grid-template-columns: 1fr; }
    .md-step-label { font-size: 1.1rem; }
    .md-footer { padding: 12px 16px; }
    .md-footer-desc { font-size: 0.78rem; }
  }

  @media (max-width: 640px) {
    .md-main { --md-main-pb: 56px; padding: 0 16px var(--md-main-pb); }
    .md-corner-compass { width: 40px; height: 40px; top: 14px; left: 14px; }
    .md-hero h1 { max-width: 12em; }
    .md-journey { margin-top: 32px; }
    .md-step { gap: 14px; }
    .md-step-indicator { width: 36px; }
    .md-step-number { width: 36px; height: 36px; font-size: 0.92rem; }
    .md-step-label { line-height: 36px; font-size: 1.05rem; }
    .md-chip { min-height: 44px; padding: 9px 18px; font-size: 0.92rem; }
    .md-lessons-grid { grid-template-columns: 1fr; gap: 16px; }
    .md-lesson-body { padding: 22px 20px 18px; }
    .md-lesson-card::after { font-size: 2.4rem; }
    .md-unit-card::before { font-size: 1.5rem; }
    .md-unit-preview { margin-right: 22px; }
    .md-continue .md-continue-btn { width: 100%; }
    .md-assistant-wrap { bottom: 14px; right: 14px; }
    .md-footer-inner { gap: 4px; }
  }

  /* =========================
     ACCESSIBILITY
     ========================= */
  @media (prefers-reduced-motion: reduce) {
    .md-orbit,
    .md-star.twinkle,
    .md-spinner-rose,
    .md-hero-logo,
    .md-hero > *,
    .md-hero::after,
    .md-journey,
    .md-chip,
    .md-unit-card,
    .md-lesson-card,
    .md-continue-btn,
    .md-recent-chip {
      animation: none !important;
      transition: none !important;
    }
  }

  /* =========================================================================
     MADAR HOME v2 — style layer (no logic changes)
     One clear path: Continue → Term → Unit → Lesson path.
     Same identity: petrol + heritage gold, soft shadows, rounded cards.
     ========================================================================= */

  /* Calmer background so content leads */
  .md-bg-layer { opacity: 0.38; }
  .md-corner-compass { opacity: 0.12; }

  /* ---------- Top bar ---------- */
  .md-topbar { padding-top: 8px !important; padding-bottom: 8px !important; }

  /* ---------- Progress strip (where "continue" used to be) ---------- */
  .md-jp {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 12px 16px 13px;
    border-radius: 18px;
    background: #FFFFFF;
    border: 1px solid var(--md-border);
    box-shadow: 0 10px 24px rgba(6, 59, 52, 0.11), 0 1px 3px rgba(6, 59, 52, 0.05);
  }
  .md-jp-where {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.6;
    color: var(--md-muted);
  }
  .md-jp-where b { font-weight: 900; color: var(--md-teal-deep); }
  .md-jp-sep { color: var(--md-gold); font-weight: 900; }
  .md-jp-row { display: flex; align-items: center; gap: 10px; }
  .md-jp-bar { flex: 1; display: flex; gap: 3px; height: 9px; min-width: 0; }
  .md-jp-seg {
    flex: 1 1 0;
    min-width: 3px;
    border-radius: 999px;
    background: var(--md-surface-3);
    box-shadow: inset 0 0 0 1px rgba(197, 216, 210, 0.45);
    transition: background 0.5s ease, box-shadow 0.5s ease;
  }
  .md-jp-seg.unit-start:not(:first-child) { margin-inline-start: 5px; }
  .md-jp-seg.done { background: var(--md-teal); box-shadow: none; }
  .md-jp-seg.current {
    background: var(--md-gold-light);
    box-shadow: 0 0 0 3px rgba(213, 160, 74, 0.25);
    animation: md-jp-pulse 2.2s ease-in-out infinite;
  }
  @keyframes md-jp-pulse {
    0%, 100% { box-shadow: 0 0 0 2px rgba(213, 160, 74, 0.22); }
    50% { box-shadow: 0 0 0 5px rgba(213, 160, 74, 0.12); }
  }
  .md-jp-pct { flex: 0 0 auto; min-width: 2.6em; text-align: left; font-size: 0.76rem; font-weight: 800; color: var(--md-teal-deep); font-variant-numeric: tabular-nums; }

  /* ---------- Hero: compact, still the petrol "orbit" band ---------- */
  .md-hero {
    padding: clamp(22px, 3.5vw, 34px) 20px clamp(40px, 5.5vw, 52px);
    border-radius: 0 0 clamp(26px, 4vw, 44px) clamp(26px, 4vw, 44px);
    box-shadow: 0 14px 36px rgba(6, 59, 52, 0.18);
  }
  .md-hero-logo-wrap { margin-bottom: 12px; }
  .md-hero-logo-wrap::before { width: 120px; height: 120px; }
  .md-hero-logo { height: 36px; padding: 8px 20px; border-radius: 18px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(255, 255, 255, 0.1); }
  .md-hero .md-badge { font-size: 0.74rem; padding: 4px 14px; margin-bottom: 8px; }
  .md-hero h1 { font-size: clamp(1.5rem, 4.4vw, 2.2rem); margin-bottom: 6px; line-height: 1.35; }
  .md-hero p { font-size: clamp(0.88rem, 2vw, 1rem); line-height: 1.8; max-width: 34em; }

  /* ---------- Dashboard: continue = the primary action ---------- */
  .md-dashboard { gap: 14px; margin-top: 20px; }
  .md-hero + .md-dashboard:has(> .md-jp),
  .md-hero + .md-dashboard:has(> .md-continue),
  .md-hero + .md-dashboard:has(> .md-panel) { margin-top: calc(-1 * clamp(26px, 4vw, 32px)); }

  .md-panel {
    border-radius: 22px !important;
    padding: clamp(18px, 3vw, 26px) !important;
    box-shadow: 0 12px 30px rgba(6, 59, 52, 0.12), 0 1px 4px rgba(6, 59, 52, 0.05) !important;
  }
  .md-panel h2 { font-size: 1.2rem; }
  .md-panel .md-chips { gap: 10px; }
  .md-panel .md-chip { min-height: 50px; padding: 10px 24px; font-size: 1rem; }

  /* Continue-learning lives in the top bar now (compact chip) */
  .md-continue-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: min(260px, 46vw);
    min-height: 40px;
    padding: 4px 14px 4px 6px;
    border-radius: 999px;
    border: 1px solid var(--md-gold-light);
    background: linear-gradient(135deg, #FFFFFF, var(--md-gold-soft));
    color: var(--md-teal-deep);
    cursor: pointer;
    text-align: right;
    box-shadow: var(--md-shadow-sm);
    transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  }
  .md-continue-chip:hover { box-shadow: var(--md-shadow-md); border-color: var(--md-gold); transform: translateY(-1px); }
  .md-continue-chip:focus-visible { outline: 3px solid rgba(213, 160, 74, 0.6); outline-offset: 3px; }
  .md-continue-chip-icon {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding-inline-end: 2px;
    border-radius: 50%;
    background: var(--md-teal-deep);
    color: #FFFFFF;
    font-size: 0.62rem;
  }
  .md-continue-chip-label { display: none; }
  .md-continue-chip-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
  .md-continue-chip-text b { font-size: 0.78rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .md-continue-chip-text small { font-size: 0.64rem; font-weight: 700; color: var(--md-gold-deep); }

  .md-dashboard .md-section-label { font-size: 0.78rem; margin-bottom: 8px !important; }
  .md-dashboard .md-recent-chip {
    padding: 8px 16px;
    font-size: 0.82rem;
    max-width: 100%;
    text-align: right;
    background: #FFFFFF;
    box-shadow: var(--md-shadow-sm);
  }

  /* ---------- Journey meta + steps ---------- */
  .md-journey { margin-top: 22px; }
  .md-journey-meta { margin-bottom: 16px !important; padding: 5px 6px 5px 14px; font-size: 0.8rem !important; }

  .md-step { padding: 0; gap: 0; }
  .md-step-indicator { display: none; }
  .md-step-content { padding-bottom: 20px; }
  .md-step-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 0.98rem;
    line-height: 1.5;
    color: var(--md-teal-deep) !important;
  }
  .md-step-label::before {
    content: "";
    width: 4px;
    height: 18px;
    border-radius: 4px;
    background: linear-gradient(180deg, var(--md-teal), var(--md-gold));
  }

  /* Term = segmented control */
  .md-step[data-step="1"] .md-chips {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: var(--md-surface-3);
    border: 1px solid var(--md-border);
  }
  .md-step[data-step="1"] .md-chip {
    min-height: 40px;
    padding: 6px 22px;
    border: 0;
    background: transparent;
    font-size: 0.92rem;
    box-shadow: none;
    transform: none;
  }
  .md-step[data-step="1"] .md-chip:hover { background: rgba(255, 255, 255, 0.7); }
  .md-step[data-step="1"] .md-chip.selected {
    background: var(--md-teal-deep);
    color: #FFFFFF;
    box-shadow: 0 6px 16px rgba(6, 59, 52, 0.22);
  }
  .md-step[data-step="1"] .md-chip.selected::before { display: none; }

  /* ---------- Units: clear cards with a mini progress bar ---------- */
  .md-units-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
    align-items: start;
  }
  .md-unit-row { padding: 0; border-bottom: 0; gap: 8px; }
  .md-unit-card {
    flex-wrap: wrap;
    row-gap: 10px;
    min-height: 64px;
    padding: 14px 16px;
    border-radius: 20px;
    border: 1px solid var(--md-border);
    box-shadow: 0 2px 10px rgba(6, 59, 52, 0.06);
  }
  .md-unit-card::before { font-size: 1.15rem; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 14px; background: var(--md-gold-soft); color: var(--md-gold-deep); opacity: 1; }
  .md-unit-card.selected::before { background: rgba(255, 255, 255, 0.14); color: var(--md-gold-light); }
  .md-unit-card-title { font-size: 1.02rem; }
  .md-unit-card:hover { transform: translateY(-2px); }
  .md-unit-card-progress {
    order: 99;
    flex: 1 0 100%;
    height: 5px;
    border-radius: 999px;
    overflow: hidden;
    background: var(--md-surface-3);
  }
  .md-unit-card-progress i {
    display: block;
    height: 100%;
    border-radius: 999px;
    background-image: linear-gradient(90deg, var(--md-teal), var(--md-gold));
    transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .md-unit-card.selected .md-unit-card-progress { background: rgba(255, 255, 255, 0.18); }
  .md-unit-preview { margin: 0 14px 0 0; padding: 0 14px 0 0; gap: 4px; }
  .md-unit-preview li { font-size: 0.78rem; line-height: 1.7; }
  .md-unit-preview li:nth-child(n+4) { display: none; }

  /* ---------- Lessons: a connected learning path ---------- */
  .md-lessons {
    margin-top: 28px;
    padding: clamp(26px, 4vw, 40px) calc(50vw - 50%);
    background: linear-gradient(180deg, var(--md-surface-2), #FFFFFF 70%);
  }
  .md-lessons { scroll-margin-top: 64px; animation: md-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .md-lessons .md-lessons-header,
  .md-lessons .md-lessons-grid,
  .md-lessons > .md-empty { max-width: 860px; margin-inline: auto; }
  .md-lessons-header { margin-bottom: 20px; }
  .md-lessons-header h2 { font-size: clamp(1.25rem, 3.4vw, 1.6rem); padding-bottom: 10px; }
  .md-lessons-header h2.md-lessons-title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 2px 10px;
    font-size: clamp(1rem, 3vw, 1.3rem);
    line-height: 1.6;
  }
  .md-lessons-title span { font-weight: 700; color: var(--md-text-soft); }
  .md-lessons-title i { font-style: normal; font-weight: 900; color: var(--md-gold); }
  .md-lessons-title b { font-weight: 900; color: var(--md-teal-deep); font-size: 1.12em; }
  .md-count { font-size: 0.78rem; padding: 5px 14px; }

  .md-lessons .md-lessons-grid {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .md-lessons .md-lessons-grid::before {
    content: "";
    position: absolute;
    inset-block: 28px;
    inset-inline-start: 36px;
    width: 0;
    border-inline-start: 2px dashed var(--md-border-strong);
    z-index: 0;
  }

  .md-lesson-card {
    z-index: 1;
    flex-direction: row;
    align-items: center;
    border-radius: 22px;
    padding-inline-start: 78px;
    box-shadow: 0 2px 10px rgba(6, 59, 52, 0.06);
  }
  .md-lesson-card:hover { transform: translateY(-3px); box-shadow: 0 16px 34px rgba(6, 59, 52, 0.12); }
  .md-lesson-card::before { display: none; }
  .md-lesson-glow { display: none; }

  /* number node */
  .md-lesson-card::after {
    content: attr(data-num);
    position: absolute;
    top: 50%;
    inset-inline-start: 14px;
    inset-inline-end: auto;
    transform: translateY(-50%);
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--md-teal-soft);
    border: 2px solid rgba(17, 122, 107, 0.28);
    color: var(--md-teal-deep);
    font-size: 1rem;
    font-weight: 900;
    opacity: 1;
  }
  .md-lesson-card[data-kind="COMPLETED"]::after {
    content: "✓";
    background: var(--md-teal);
    border-color: var(--md-teal);
    color: #FFFFFF;
    font-size: 1.2rem;
  }
  .md-lesson-card[data-kind="CURRENT"] {
    border-color: var(--md-gold-light);
    box-shadow: 0 14px 32px rgba(183, 122, 32, 0.16);
  }
  .md-lesson-card[data-kind="CURRENT"]::after {
    background: var(--md-gold-soft);
    border-color: var(--md-gold);
    color: var(--md-gold-deep);
    box-shadow: 0 0 0 5px rgba(213, 160, 74, 0.2);
  }
  .md-lesson-card[data-kind="SEQUENCE_LOCK"]::after,
  .md-lesson-card[data-kind="COMING_SOON"]::after {
    background: var(--md-surface-3);
    border: 2px dashed var(--md-border-strong);
    color: var(--md-muted);
  }
  .md-lesson-card[data-kind="ACCESS_LOCK"]::after {
    background: var(--md-gold-soft);
    border-color: var(--md-gold-light);
    color: var(--md-gold-deep);
  }

  .md-lesson-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 14px;
    row-gap: 2px;
    align-items: center;
    padding: 16px 18px 16px 16px;
  }
  .md-lesson-body > div:first-child { grid-column: 1; }
  .md-lesson-body h3 { font-size: 1.02rem; margin: 0; }
  .md-lesson-body p { grid-column: 1; margin: 0; font-size: 0.82rem; line-height: 1.7; }
  .md-lesson-body .md-lesson-cta {
    grid-column: 2;
    grid-row: 1 / span 2;
    margin: 0;
    padding: 0;
    border-top: 0;
    font-size: 0.85rem;
    white-space: nowrap;
  }
  .md-lesson-body .md-lesson-cta span { width: 34px; height: 34px; }
  .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta {
    padding: 5px 5px 5px 16px;
    border-radius: 999px;
    background: var(--md-teal-deep);
    color: #FFFFFF !important;
    box-shadow: 0 8px 18px rgba(6, 59, 52, 0.22);
  }
  .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta span { background: rgba(255, 255, 255, 0.18); }

  /* ---------- Feature boxes (bottom) ---------- */
  .md-features {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    margin: 56px calc(50% - 50vw) calc(-1 * var(--md-main-pb));
    padding: clamp(36px, 6vw, 60px) calc(50vw - 50%);
    background:
      radial-gradient(circle at 12% 0%, rgba(213, 160, 74, 0.16), transparent 40%),
      linear-gradient(160deg, var(--md-teal-dark) 0%, var(--md-teal-deep) 60%, var(--md-teal) 140%);
    border-radius: clamp(26px, 4vw, 44px) clamp(26px, 4vw, 44px) 0 0;
  }
  .md-lessons + .md-features { margin-top: 0; }
  .md-features::before {
    content: "";
    position: absolute;
    z-index: 0;
    width: 520px;
    height: 520px;
    top: -300px;
    inset-inline-end: -140px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.07);
    box-shadow: 0 0 0 54px rgba(255, 255, 255, 0.02), 0 0 0 108px rgba(255, 255, 255, 0.012);
    pointer-events: none;
  }
  .md-features-head, .md-features-grid { position: relative; z-index: 1; max-width: 1040px; margin-inline: auto; }
  .md-features-head { text-align: center; margin-bottom: clamp(22px, 4vw, 34px); }
  .md-features-head h2 { margin: 0 0 6px; font-size: clamp(1.25rem, 3.6vw, 1.7rem); font-weight: 900; color: #FFFFFF; }
  .md-features-head p { margin: 0; font-size: 0.9rem; color: rgba(255, 255, 255, 0.72); }
  .md-features-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .md-feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    padding: 24px 16px 22px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  }
  .md-feature:hover { transform: translateY(-4px); background: rgba(255, 255, 255, 0.1); border-color: rgba(213, 160, 74, 0.5); }
  .md-feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    border-radius: 18px;
    color: var(--md-gold-light);
    background: rgba(213, 160, 74, 0.12);
    border: 1px solid rgba(213, 160, 74, 0.35);
    box-shadow: 0 0 22px rgba(213, 160, 74, 0.18);
  }
  .md-feature:nth-child(even) .md-feature-icon {
    color: #8FE0D1;
    background: rgba(88, 181, 165, 0.14);
    border-color: rgba(88, 181, 165, 0.4);
    box-shadow: 0 0 22px rgba(88, 181, 165, 0.2);
  }
  .md-feature-icon svg { width: 28px; height: 28px; }
  .md-feature h3 { margin: 0; font-size: 1.02rem; font-weight: 900; color: #FFFFFF; }
  .md-feature p { margin: 0; font-size: 0.8rem; line-height: 1.8; color: rgba(255, 255, 255, 0.7); }

  .md-frieze { opacity: 0.55; }

  @media (max-width: 900px) {
    .md-features-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 640px) {
    .md-hero p { font-size: 0.84rem; line-height: 1.7; margin-top: 2px; }
    .md-hero { padding-bottom: 50px; }
    .md-corner-compass { opacity: 0.1; }
    .md-bg-layer { opacity: 0.26; }
    .md-dashboard { margin-top: 14px; }
    .md-dashboard .md-recent-chip { flex: 1 1 100%; border-radius: 16px; }
    .md-continue-chip { padding: 3px 12px 3px 4px; gap: 6px; max-width: none; flex-shrink: 0; }
    .md-continue-chip-text { display: none; }
    .md-continue-chip-label { display: inline; font-size: 0.74rem; font-weight: 800; white-space: nowrap; color: var(--md-teal-deep); }
    .md-continue-chip-icon { width: 30px; height: 30px; }
    .md-topbar { gap: 6px !important; padding-inline: 10px !important; }
    .md-jp { padding: 11px 13px 12px; border-radius: 16px; }
    .md-jp-where { font-size: 0.8rem; }
    .md-journey { margin-top: 14px; }
    .md-step[data-step="1"] .md-chips { display: flex; width: 100%; }
    .md-step[data-step="1"] .md-chip { flex: 1 1 auto; justify-content: center; padding: 6px 12px; }
    .md-units-grid { grid-template-columns: 1fr; gap: 12px; }
    .md-unit-card { min-height: 60px; }
    .md-unit-preview li { font-size: 0.74rem; }
    .md-lessons { padding-top: 22px; }
    .md-lessons .md-lessons-grid { gap: 12px; }
    .md-lessons .md-lessons-grid::before { inset-inline-start: 30px; }
    .md-lesson-card { padding-inline-start: 64px; border-radius: 20px; }
    .md-lesson-card::after { width: 40px; height: 40px; inset-inline-start: 11px; font-size: 0.92rem; }
    .md-lesson-body { padding: 13px 14px 13px 12px; column-gap: 10px; }
    .md-lesson-body h3 { font-size: 0.96rem; }
    .md-lesson-body .md-lesson-cta { font-size: 0; }
    .md-lesson-body .md-lesson-cta span { font-size: 1rem; width: 34px; height: 34px; }
    .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta { padding: 0; background: transparent; box-shadow: none; }
    .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta span { background: var(--md-teal-deep); color: #FFFFFF; }
    .md-features { margin-top: 40px; }
    .md-features-grid { gap: 12px; }
    .md-feature { padding: 18px 12px 16px; border-radius: 20px; }
    .md-feature-icon { width: 50px; height: 50px; border-radius: 16px; }
    .md-feature h3 { font-size: 0.94rem; }
    .md-feature p { font-size: 0.74rem; }
  }

  /* =========================================================================
     SPLIT LAYOUT — context bar + units rail + lessons column (style only)
     ========================================================================= */
  .md-main { max-width: 1120px; }

  .md-context {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 12px;
    margin-bottom: 18px;
    padding: 10px 12px;
    border-radius: 20px;
    background: #FFFFFF;
    border: 1px solid var(--md-border);
    box-shadow: var(--md-shadow-sm);
  }
  .md-ctx-grade {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    max-width: 100%;
    padding: 6px 16px;
    border-radius: 999px;
    border: 1.5px solid var(--md-border-strong);
    background: var(--md-surface-2);
    color: var(--md-teal-deep);
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }
  .md-ctx-grade:hover { border-color: var(--md-teal); background: var(--md-teal-soft); transform: translateY(-1px); }
  .md-ctx-grade:focus-visible, .md-ctx-terms .md-chip:focus-visible { outline: 3px solid rgba(213, 160, 74, 0.6); outline-offset: 2px; }
  .md-ctx-grade-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .md-ctx-caret { color: var(--md-gold); font-size: 0.8rem; }

  .md-ctx-terms {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: var(--md-surface-3);
    border: 1px solid var(--md-border);
  }
  .md-ctx-terms .md-chip {
    min-height: 38px;
    padding: 6px 20px;
    border: 0;
    background: transparent;
    font-size: 0.88rem;
    box-shadow: none;
    transform: none;
  }
  .md-ctx-terms .md-chip:hover { background: rgba(255, 255, 255, 0.75); }
  .md-ctx-terms .md-chip.selected { background: var(--md-teal-deep); color: #FFFFFF; box-shadow: 0 6px 16px rgba(6, 59, 52, 0.22); }
  .md-ctx-terms .md-chip.selected::before { display: none; }

  .md-split {
    display: grid;
    grid-template-columns: minmax(250px, 300px) minmax(0, 1fr);
    gap: clamp(18px, 3vw, 32px);
    align-items: start;
  }
  .md-units-rail { position: sticky; top: 16px; min-width: 0; }
  .md-rail-label { margin: 0 0 10px; font-size: 0.8rem; font-weight: 800; color: var(--md-muted); }
  .md-units-rail .md-units-grid { display: flex; flex-direction: column; gap: 10px; }
  .md-units-rail .md-unit-row { gap: 0; }
  .md-units-rail .md-unit-preview { display: none; }
  .md-units-rail .md-unit-card { width: 100%; min-height: 62px; padding: 12px 14px; }
  .md-split-main { min-width: 0; }

  /* lessons now live in the column (no full-bleed band) */
  .md-split .md-lessons {
    margin: 0;
    padding: 0;
    background: none;
    border: 0;
    scroll-margin-top: 16px;
  }
  .md-split .md-lessons .md-lessons-header,
  .md-split .md-lessons .md-lessons-grid,
  .md-split .md-lessons > .md-empty { max-width: none; margin-inline: 0; }
  .md-split .md-lessons .md-lessons-header { margin-bottom: 16px; }
  .md-split .md-lessons .md-lessons-grid { grid-template-columns: none; }

  .md-split-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 220px;
    padding: 24px;
    border-radius: 24px;
    border: 1.5px dashed var(--md-border-strong);
    background: var(--md-surface-2);
    color: var(--md-muted);
    text-align: center;
  }
  .md-split-empty p { margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--md-text-soft); }
  .md-split-empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--md-teal-soft);
    color: var(--md-teal-deep);
    font-size: 1.3rem;
    font-weight: 900;
  }

  /* ---- phones & small tablets: units become a swipeable strip above the lessons ---- */
  @media (max-width: 860px) {
    .md-split { grid-template-columns: minmax(0, 1fr); gap: 14px; }
    .md-units-rail { position: static; }
    .md-rail-label { margin-bottom: 8px; }
    .md-units-rail .md-units-grid {
      flex-direction: row;
      gap: 10px;
      overflow-x: auto;
      padding: 2px 2px 10px;
      margin-inline: -2px;
      scroll-snap-type: x proximity;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    .md-units-rail .md-unit-row { flex: 0 0 auto; scroll-snap-align: start; }
    .md-units-rail .md-unit-card { width: 168px; min-height: 76px; padding: 10px 12px; row-gap: 8px; }
    .md-units-rail .md-unit-card::before,
    .md-units-rail .md-unit-card::after { display: none; }
    .md-units-rail .md-unit-card-title { font-size: 0.92rem; flex: 1 1 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .md-split-empty { min-height: 120px; padding: 18px; }
    .md-split-empty-icon { transform: rotate(90deg); }
  }

  @media (max-width: 640px) {
    .md-context { padding: 8px; gap: 8px; border-radius: 18px; }
    .md-ctx-grade { width: 100%; justify-content: space-between; }
    .md-ctx-terms { width: 100%; display: flex; }
    .md-ctx-terms .md-chip { flex: 1 1 0; justify-content: center; padding: 6px 10px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .md-feature, .md-unit-card-progress i, .md-lesson-card, .md-jp-seg, .md-lessons { animation: none !important; transition: none !important; }
  }
`}</style>
    </div>
  );
}