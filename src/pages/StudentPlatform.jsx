import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublishedLessons, signOut } from "../lib/db";
import { useAuth } from "../lib/hooks";
import Footer from "../components/Footer";
import AuthModal, { GuestWelcomeBanner, LetterAvatar } from "../components/AuthModal";

const PROGRESS_KEY = "ts_student_progress_v2";

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
   Step Row
--------------------------------------------------------------------------- */
function StepRow({ number, done, active, label, children }) {
  return (
    <div className={`md-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
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

  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    listPublishedLessons()
      .then(setLessons)
      .catch(() => setError("تعذر تحميل الدروس المنشورة."));
  }, []);

  const availableStages = useMemo(() => {
    if (!lessons) return [];
    return Array.from(new Set(lessons.map((l) => l.stage)));
  }, [lessons]);

  const availableGrades = useMemo(() => {
    if (!lessons || !selectedStage) return [];
    const list = lessons.filter((l) => l.stage === selectedStage);
    return Array.from(new Set(list.map((l) => l.grade)));
  }, [lessons, selectedStage]);

  const availableTerms = useMemo(() => {
    if (!lessons || !selectedStage || !selectedGrade) return [];
    const list = lessons.filter((l) => l.stage === selectedStage && l.grade === selectedGrade);
    return Array.from(new Set(list.map((l) => l.term)));
  }, [lessons, selectedStage, selectedGrade]);

  const availableSubjects = useMemo(() => {
    if (!lessons) return [];
    let list = lessons;
    if (selectedStage) list = list.filter((l) => l.stage === selectedStage);
    if (selectedGrade) list = list.filter((l) => l.grade === selectedGrade);
    if (selectedTerm) list = list.filter((l) => l.term === selectedTerm);
    return Array.from(new Set(list.map((l) => l.subject)));
  }, [lessons, selectedStage, selectedGrade, selectedTerm]);

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    let list = lessons;
    if (selectedStage) list = list.filter((l) => l.stage === selectedStage);
    if (selectedGrade) list = list.filter((l) => l.grade === selectedGrade);
    if (selectedTerm) list = list.filter((l) => l.term === selectedTerm);
    if (selectedSubject) list = list.filter((l) => l.subject === selectedSubject);
    return list;
  }, [lessons, selectedStage, selectedGrade, selectedTerm, selectedSubject]);

  const progress = [
    !!selectedStage,
    !!selectedGrade,
    !!selectedTerm,
    !!selectedSubject,
  ];

  const localProgress = useMemo(() => readLocalProgress(), [lessons]);
  const continueLesson = useMemo(() => {
    if (!lessons || !localProgress?.lessonId) return null;
    const lesson = lessons.find((l) => String(l.id) === String(localProgress.lessonId));
    if (!lesson) return null;
    const sceneIdx =
      typeof localProgress.currentScene === "number"
        ? localProgress.currentScene
        : typeof localProgress.sceneIndex === "number"
          ? localProgress.sceneIndex
          : 0;
    const done = !!localProgress.lessonCompleted;
    return { lesson, sceneIdx, done };
  }, [lessons, localProgress]);
  const progressBySubject = useMemo(() => {
    if (!lessons || !lessons.length) return [];
    // group published lessons by subject (within optional filters)
    const base = filteredLessons.length ? filteredLessons : lessons;
    const map = {};
    for (const l of base) {
      const sub = l.subject || "أخرى";
      map[sub] = map[sub] || { subject: sub, total: 0, completed: 0 };
      map[sub].total += 1;
    }
    // completed from local progress only for current continue lesson if marked done
    // and scan v2 storage for lessonCompleted when same lessonId matches
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
  }, [lessons, filteredLessons]);

  const recentLessons = useMemo(() => {
    if (!lessons || !lessons.length) return [];
    const sorted = [...lessons].sort((a, b) => {
      const ta = a.updatedAt || a.updated_at || "";
      const tb = b.updatedAt || b.updated_at || "";
      return String(tb).localeCompare(String(ta));
    });
    return sorted.slice(0, 4);
  }, [lessons]);

  const studentName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email?.split("@")[0] ||
    "طالب";

  return (
    <div className="md-platform">
      <div className="flex justify-end items-center px-4 sm:px-6 py-2 relative z-20" style={{ background: "transparent" }}>
        {session === undefined ? null : session ? (
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full py-1 px-2 bg-white/90 shadow-sm" style={{ border: "1px solid #DED4BD" }}>
              <LetterAvatar name={studentName} email={session.user?.email} size={28} />
              <span className="text-xs font-bold hidden sm:inline" style={{ color: "#22291F" }}>{studentName}</span>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-white shadow-lg py-2 z-50 dir-rtl text-right" style={{ border: "1px solid #DED4BD" }}>
                <button type="button" className="w-full text-right px-4 py-2 text-xs" style={{ color: "#C53030" }}
                  onClick={async () => { setMenuOpen(false); try { await signOut(); } catch (_) {} }}>تسجيل الخروج</button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" onClick={() => setAuthOpen(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl text-white shadow-sm" style={{ background: "#10665A" }}>تسجيل الدخول</button>
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
  <div className="md-badge">منصة تعليمية</div>
  <h1>مَدَار — تعلّم بوضوح</h1>
  <p>رحلة تعليمية منظمة: فهم المحتوى، ربط الأفكار، المراجعة، ثم التحقق من فهمك — بأسلوب تفاعلي ومرئي.</p>
</header>

        {/* لوحة متابعة بسيطة من البيانات المحلية + الدروس المنشورة */}
        {lessons && lessons.length > 0 && (
          <section className="md-dashboard mb-6" aria-label="متابعة التعلم">
            {continueLesson && (
              <div
                className="rounded-2xl p-4 mb-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                style={{ border: "1px solid #DED4BD" }}
              >
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "#8A8570" }}>متابعة التعلم</p>
                  <p className="font-black text-sm" style={{ color: "#10665A" }}>{continueLesson.lesson.title}</p>
                  <p className="text-xs mt-1" style={{ color: "#5C5A4A" }}>
                    {continueLesson.done
                      ? "مكتمل ✓"
                      : `آخر موضع: المشهد ${continueLesson.sceneIdx + 1}`}
                    {continueLesson.lesson.subject ? ` · ${continueLesson.lesson.subject}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/student/lesson/${continueLesson.lesson.id}`)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shrink-0"
                  style={{ background: "#10665A" }}
                >
                  متابعة الدرس ←
                </button>
              </div>
            )}
            {recentLessons.length > 0 && (
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: "#8A8570" }}>أحدث الدروس المنشورة</p>
                <div className="flex flex-wrap gap-2">
                  {recentLessons.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => navigate(`/student/lesson/${l.id}`)}
                      className="text-xs font-bold px-3 py-2 rounded-xl bg-white"
                      style={{ border: "1px solid #DED4BD", color: "#22291F" }}
                    >
                      {l.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          
            {progressBySubject.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold mb-2" style={{ color: "#8A8570" }}>تقدّم الأقسام (من الدروس المنشورة)</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {progressBySubject.map((row) => {
                    const pct = row.total ? Math.round((row.completed / row.total) * 100) : 0;
                    return (
                      <div key={row.subject} className="rounded-xl p-3 bg-white text-xs" style={{ border: "1px solid #DED4BD" }}>
                        <p className="font-bold" style={{ color: "#10665A" }}>{row.subject}</p>
                        <p style={{ color: "#5C5A4A" }}>{row.completed} / {row.total} دروس مكتملة · متبقي {Math.max(0, row.total - row.completed)}</p>
                        <div className="mt-2 h-1.5 rounded-full" style={{ background: "#E4F0EC" }}>
                          <div className="h-full rounded-full" style={{ width: pct + "%", background: "#10665A" }} />
                        </div>
                      </div>
                    );
                  })}
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

        {lessons !== null && (
          <div className="md-journey">
            {/* Step 1 */}
            <StepRow
              number={1}
              done={!!selectedStage}
              active={!selectedStage}
              label="المرحلة الدراسية"
            >
              {availableStages.length === 0 ? (
                <p className="md-empty">لا توجد دروس منشورة حالياً. عد لاحقاً أو جرّب تصفية أخرى.</p>
              ) : (
                <div className="md-chips">
                  {availableStages.map((st) => (
                    <button
                      key={st}
                      className={`md-chip ${selectedStage === st ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedStage(st);
                        setSelectedGrade("");
                        setSelectedTerm("");
                        setSelectedSubject("");
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </StepRow>

            {/* Step 2 */}
            {selectedStage && (
              <StepRow
                number={2}
                done={!!selectedGrade}
                active={!selectedGrade}
                label="الصف الدراسي"
              >
                {availableGrades.length === 0 ? (
                  <p className="md-empty">لا توجد صفوف متاحة لهذه المرحلة حالياً.</p>
                ) : (
                  <div className="md-chips">
                    {availableGrades.map((g) => (
                      <button
                        key={g}
                        className={`md-chip ${selectedGrade === g ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedGrade(g);
                          setSelectedTerm("");
                          setSelectedSubject("");
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </StepRow>
            )}

            {/* Step 3 */}
            {selectedGrade && (
              <StepRow
                number={3}
                done={!!selectedTerm}
                active={!selectedTerm}
                label="الفصل الدراسي"
              >
                {availableTerms.length === 0 ? (
                  <p className="md-empty">لا توجد فصول دراسية منشورة لهذا الصف حالياً.</p>
                ) : (
                  <div className="md-chips">
                    {availableTerms.map((t) => (
                      <button
                        key={t}
                        className={`md-chip ${selectedTerm === t ? "selected" : ""}`}
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
              </StepRow>
            )}

            {/* Step 4 */}
            {selectedTerm && (
              <StepRow
                number={4}
                done={!!selectedSubject}
                active={!selectedSubject}
                label="المادة الدراسية"
              >
                {availableSubjects.length === 0 ? (
                  <p className="md-empty">لا توجد مواد دراسية منشورة لهذه المرحلة حالياً.</p>
                ) : (
                  <div className="md-chips">
                    {availableSubjects.map((sub) => (
                      <button
                        key={sub}
                        className={`md-chip ${selectedSubject === sub ? "selected" : ""}`}
                        onClick={() => setSelectedSubject(sub)}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </StepRow>
            )}

            {/* Lessons */}
            {selectedSubject && (
              <section className="md-lessons">
                <div className="md-lessons-header">
                  <h2>الدروس المتاحة</h2>
                  <span className="md-count">{filteredLessons.length} درس</span>
                </div>

                {filteredLessons.length === 0 ? (
                  <p className="md-empty">لا توجد دروس منشورة حالياً في هذه المادة.</p>
                ) : (
                  <div className="md-lessons-grid">
                    {filteredLessons.map((l) => (
                      <article
                        key={l.id}
                        className="md-lesson-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/student/lesson/${l.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(`/student/lesson/${l.id}`);
                          }
                        }}
                      >
                        <div className="md-lesson-glow" />
                        <div className="md-lesson-body">
                          <h3>{l.title}</h3>
                          <p>{l.description || "درس تعليمي شامل مع خريطة ذهنية وأسئلة تفاعلية."}</p>
                          <div className="md-lesson-cta">
                            ابدأ الدرس
                            <span>→</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      <HistoryFrieze />
      <Footer />
      <GuestWelcomeBanner session={session} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

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
    margin-bottom: 20px;
    position: relative;
  }

  .md-hero-logo-wrap::before {
    content: "";
    position: absolute;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(17, 122, 107, 0.12),
      rgba(17, 122, 107, 0.04) 45%,
      transparent 70%
    );
    filter: blur(6px);
    z-index: -1;
  }

  .md-hero-logo {
    height: 58px;
    width: auto;
    object-fit: contain;
    filter:
      drop-shadow(0 6px 12px rgba(6, 59, 52, 0.12))
      drop-shadow(0 0 24px rgba(17, 122, 107, 0.10));
    transition:
      transform 0.35s ease,
      filter 0.35s ease;
  }

  .md-hero-logo:hover {
    transform: translateY(-2px) scale(1.02);
    filter:
      drop-shadow(0 10px 18px rgba(6, 59, 52, 0.16))
      drop-shadow(0 0 28px rgba(17, 122, 107, 0.14));
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
    direction: rtl;
  }

  .md-main {
    flex: 1;
    position: relative;
    z-index: 2;
    max-width: 920px;
    margin: 0 auto;
    padding: 48px 20px 48px;
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
  .md-hero {
    text-align: center;
    margin-bottom: 48px;
  }

  .md-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 7px 16px;
    border-radius: 999px;
    background: var(--md-teal-soft);
    color: var(--md-teal-deep);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    margin-bottom: 17px;
    border: 1px solid rgba(17, 122, 107, 0.18);
    box-shadow:
      0 4px 14px rgba(6, 59, 52, 0.06);
  }

  .md-hero h1 {
    font-size: clamp(1.8rem, 5vw, 2.65rem);
    font-weight: 800;
    margin: 0 0 12px;
    background:
      linear-gradient(
        135deg,
        var(--md-teal-dark) 10%,
        var(--md-teal-deep) 40%,
        var(--md-teal) 75%,
        var(--md-teal-mid) 100%
      );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .md-hero p {
    color: var(--md-muted);
    font-size: 1.05rem;
    margin: 0;
    line-height: 1.8;
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
  .md-journey {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .md-step {
    display: flex;
    gap: 18px;
    padding: 8px 0;
  }

  .md-step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 42px;
    flex-shrink: 0;
  }

  .md-step-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    background: #FFFFFF;
    border: 2px solid var(--md-border);
    color: var(--md-muted);
    box-shadow:
      0 3px 10px rgba(6, 59, 52, 0.05);
    transition: all 0.3s ease;
  }

  .md-step.done .md-step-number {
    background:
      linear-gradient(
        135deg,
        var(--md-teal),
        var(--md-teal-deep)
      );
    border-color: var(--md-teal);
    color: #FFFFFF;
    box-shadow:
      0 5px 16px rgba(6, 59, 52, 0.20);
  }

  .md-step.active .md-step-number {
    border-color: var(--md-gold);
    color: var(--md-gold-deep);
    background: var(--md-gold-soft);
    box-shadow:
      0 0 0 5px rgba(183, 122, 32, 0.10),
      0 6px 16px rgba(183, 122, 32, 0.12);
  }

  .md-step-line {
    width: 2px;
    flex: 1;
    background:
      linear-gradient(
        180deg,
        var(--md-border-strong),
        var(--md-border)
      );
    margin-top: 6px;
    min-height: 24px;
  }

  .md-step:last-child .md-step-line {
    display: none;
  }

  .md-step-content {
    flex: 1;
    padding-bottom: 20px;
    min-width: 0; /* عشان النص ميتقطعش */
  }

  /* ===== تحسين عرض العناوين (المرحلة / الصف / الفصل / المادة) ===== */
  .md-step-label {
    font-size: 1rem;
    color: var(--md-text-soft);
    margin-bottom: 14px;
    font-weight: 700;
    letter-spacing: 0.01em;
    display: block;
    width: 100%;
    line-height: 1.5;
  }

  .md-step.active .md-step-label {
    color: var(--md-gold);
  }

  .md-step.done .md-step-label {
    color: var(--md-teal);
  }

  /* =========================
     CHIPS
     ========================= */
  .md-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .md-chip {
    padding: 10px 18px;
    border-radius: 999px;
    background: #FFFFFF;
    border: 1px solid rgba(17, 122, 107, 0.22);
    color: var(--md-text-soft);
    font-size: 0.95rem;
    cursor: pointer;
    transition:
      transform 0.22s ease,
      border-color 0.22s ease,
      background 0.22s ease,
      box-shadow 0.22s ease,
      color 0.22s ease;
    box-shadow:
      0 2px 8px rgba(6, 59, 52, 0.04);
  }

  .md-chip:hover {
    border-color: rgba(17, 122, 107, 0.45);
    background: var(--md-teal-soft);
    transform: translateY(-2px);
    box-shadow:
      0 6px 18px rgba(6, 59, 52, 0.09);
  }

  .md-chip.selected {
    background:
      linear-gradient(
        135deg,
        var(--md-teal),
        var(--md-teal-deep)
      );
    border-color: var(--md-teal-deep);
    color: #FFFFFF;
    box-shadow:
      0 8px 22px rgba(6, 59, 52, 0.22),
      0 0 0 3px rgba(17, 122, 107, 0.12);
  }

  .md-empty {
    color: var(--md-muted);
    font-size: 0.95rem;
    margin: 0;
  }

  /* =========================
     LESSONS
     ========================= */
  .md-lessons {
    margin-top: 32px;
    padding-top: 28px;
    border-top: 1px solid var(--md-border);
  }

  .md-lessons-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .md-lessons-header h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--md-text);
  }

  .md-count {
    font-size: 0.9rem;
    color: var(--md-teal-deep);
    background: var(--md-teal-soft);
    padding: 6px 13px;
    border-radius: 999px;
    border: 1px solid rgba(17, 122, 107, 0.16);
  }

  .md-lessons-grid {
    display: grid;
    grid-template-columns:
      repeat(
        auto-fill,
        minmax(260px, 1fr)
      );
    gap: 18px;
  }

  /* =========================
     LESSON CARD
     ========================= */
  .md-lesson-card {
    position: relative;
    border-radius: var(--md-radius);
    background:
      linear-gradient(
        180deg,
        #FFFFFF 0%,
        var(--md-surface-2) 100%
      );
    border: 1px solid var(--md-border);
    overflow: hidden;
    cursor: pointer;
    transition:
      transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.28s ease,
      box-shadow 0.28s ease;
    box-shadow:
      0 4px 16px rgba(6, 59, 52, 0.05);
  }

  .md-lesson-card::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 3px;
    background:
      linear-gradient(
        90deg,
        transparent,
        var(--md-teal),
        var(--md-gold),
        transparent
      );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .md-lesson-card:hover {
    transform: translateY(-6px);
    border-color: rgba(17, 122, 107, 0.32);
    box-shadow:
      0 18px 42px rgba(6, 59, 52, 0.12),
      0 4px 12px rgba(6, 59, 52, 0.06);
  }

  .md-lesson-card:hover::before {
    opacity: 1;
  }

  .md-lesson-glow {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        500px circle at
        var(--x, 50%)
        var(--y, 0%),
        rgba(17, 122, 107, 0.09),
        transparent 42%
      );
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .md-lesson-card:hover .md-lesson-glow {
    opacity: 1;
  }

  .md-lesson-body {
    padding: 22px;
    position: relative;
  }

  .md-lesson-body h3 {
    margin: 0 0 10px;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.5;
    color: var(--md-text);
  }

  .md-lesson-body p {
    margin: 0 0 18px;
    color: var(--md-muted);
    font-size: 0.9rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .md-lesson-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--md-teal);
  }

  .md-lesson-card:hover .md-lesson-cta span {
    transform: translateX(-5px);
  }

  .md-lesson-cta span {
    transition: transform 0.2s;
    display: inline-block;
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
  @media (max-width: 768px) {
    .md-hero-logo {
      height: 50px;
    }

    .md-main {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px 130px;
    }

    .md-hero {
      margin-bottom: 36px;
    }

    .md-hero h1 {
      font-size: 2rem;
    }

    .md-hero p {
      font-size: 0.95rem;
    }

    .md-lessons-header {
      gap: 12px;
    }

    .md-lessons-header h2 {
      font-size: 1.2rem;
    }

    .md-corner-compass {
      width: 44px;
      height: 44px;
      top: 16px;
      left: 16px;
    }

    .md-step-label {
      font-size: 0.95rem;
    }

    .md-footer {
      padding: 12px 16px;
    }

    .md-footer-desc {
      font-size: 0.78rem;
    }
  }

  @media (max-width: 640px) {
    .md-main {
      padding: 32px 16px 140px;
    }

    .md-corner-compass {
      width: 40px;
      height: 40px;
      top: 14px;
      left: 14px;
    }

    .md-step {
      gap: 12px;
    }

    .md-lessons-grid {
      grid-template-columns: 1fr;
    }

    .md-lesson-body {
      padding: 20px;
    }

    .md-footer-inner {
      gap: 4px;
    }
  }

  /* =========================
     ACCESSIBILITY
     ========================= */
  @media (prefers-reduced-motion: reduce) {
    .md-orbit,
    .md-star.twinkle,
    .md-spinner-rose,
    .md-hero-logo {
      animation: none !important;
      transition: none !important;
    }
  }
`}</style>
    </div>
  );
}