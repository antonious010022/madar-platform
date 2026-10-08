import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublishedLessons, signOut, getStudentGradeMeta, saveStudentGradeMeta, listMyProgress } from "../lib/db";
import { useAuth } from "../lib/hooks";
import Footer from "../components/Footer";
import AuthModal, { GuestWelcomeBanner, LetterAvatar } from "../components/AuthModal";
import { slugify } from "../lib/slugify";
import { arabicLessonOrdinal, lessonPath, isLessonComingSoon, lessonDisplayNumber, sortLessonsForSequence, buildLessonLockStates, lessonLockUi, readGuestGradeLocal, writeGuestGradeLocal } from "./student-platform/helpers";
import { CompassRose, Galaxy, ContinentsAtlas, usePointerParallax, HistoryFrieze, CompassSpinner, ComingSoonAssistantBubble } from "./student-platform/decor";
import { MADAR_FEATURES, gradeNumber, gradeArtKind, stageArtKind, PickArt } from "./student-platform/uiParts";
import { PLATFORM_CSS } from "./student-platform/platformStyles";

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
  // Rows of the logged-in student's progress (Supabase). null = not loaded yet. Guests always get [].
  const [myProgress, setMyProgress] = useState(null);

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

  // Personal progress is a logged-in-only feature. `session === undefined` (still loading) counts as
  // "not logged in" so progress never flashes for a guest.
  const isLoggedIn = !!session;
  const userId = session?.user?.id || null;

  // Student progress comes from Supabase (student_lesson_progress), for the logged-in account only.
  // Guests never have any: myProgress = [] and nothing is fetched.
  useEffect(() => {
    let cancelled = false;
    if (session === undefined) return undefined; // auth still loading
    if (!session) {
      setMyProgress([]);
      return undefined;
    }
    setMyProgress(null);
    listMyProgress()
      .then((rows) => {
        if (!cancelled) setMyProgress(rows);
      })
      .catch((err) => {
        console.warn("listMyProgress:", err);
        if (!cancelled) setMyProgress([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);
  const progressReady = !isLoggedIn || myProgress !== null;

  // Completed lesson ids — drive the lock logic (logged-in only) and the progress UI below.
  const completedLessonIds = useMemo(() => {
    if (!isLoggedIn || !myProgress) return new Set();
    return new Set(myProgress.filter((r) => r.lessonCompleted).map((r) => String(r.lessonId)));
  }, [isLoggedIn, myProgress]);

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

  // Most recently updated lesson of the student's grade (rows arrive newest first). Guests never get it.
  const continueLesson = useMemo(() => {
    // Prefer current term; fall back to any lesson in the grade
    const pool = termScopedLessons.length ? termScopedLessons : gradeScopedLessons;
    if (!isLoggedIn || !pool.length || !myProgress || !myProgress.length) return null;
    for (const row of myProgress) {
      const lesson = pool.find((l) => String(l.id) === String(row.lessonId));
      if (!lesson || isLessonComingSoon(lesson)) continue;
      const sceneIdx = typeof row.currentScene === "number" ? row.currentScene : 0;
      return { lesson, sceneIdx, done: !!row.lessonCompleted };
    }
    return null;
  }, [isLoggedIn, termScopedLessons, gradeScopedLessons, myProgress]);

  // Learning path in order (unit by unit, lesson by lesson) → one segment per lesson
  const progressPath = useMemo(() => {
    if (!isLoggedIn) return { segments: [], current: null, completed: 0, total: 0, pct: 0 };
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
  }, [isLoggedIn, availableSubjects, lessonsBySubject, completedLessonIds, continueLesson]);

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

  // Per-unit progress (unit-card bars). Logged-in students only; uses the same completed-lesson ids
  // that drive the lesson-card states, so the numbers always match what the student sees.
  const progressView = useMemo(() => {
    if (!isLoggedIn || !selectedGrade || !selectedTerm || !termScopedLessons.length) return [];
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
  }, [isLoggedIn, selectedGrade, selectedTerm, termScopedLessons, completedLessonIds, availableSubjects]);

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
        {lessons && lessons.length > 0 && gradeMetaReady && selectedGrade && !pickingGrade && isLoggedIn && continueLesson && (
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
              className="md-account-btn flex items-center gap-2 rounded-full py-1 px-2 bg-white/90" style={{ border: "2px solid var(--duo-line)" }}>
              <LetterAvatar name={studentName} email={session.user?.email} size={28} />
              <span className="text-xs font-bold hidden sm:inline" style={{ color: "var(--duo-ink)" }}>{studentName}</span>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white py-2 z-50 dir-rtl text-right" style={{ border: "2px solid var(--duo-line)" }}>
                <button type="button" className="w-full text-right px-4 py-2 text-xs font-bold" style={{ color: "var(--duo-green-ink)" }}
                  onClick={openChangeGrade}>تغيير الصف الدراسي</button>
                {selectedGrade ? (
                  <p className="px-4 pb-2 text-[11px]" style={{ color: "var(--duo-muted)" }}>
                    الحالي: {selectedStage ? selectedStage + " · " : ""}{selectedGrade}
                  </p>
                ) : null}
                <button type="button" className="w-full text-right px-4 py-2 text-xs" style={{ color: "var(--duo-red-d)" }}
                  onClick={async () => { setMenuOpen(false); try { await signOut(); } catch (_) {} }}>تسجيل الخروج</button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" onClick={() => setAuthOpen(true)}
            className="md-login-btn text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: "var(--duo-green)" }}>تسجيل الدخول</button>
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

        {/* اختيار المرحلة والصف (أول مرة أو تغيير الصف) */}
        {lessons && lessons.length > 0 && gradeMetaReady && pickingGrade && (
          <section className="md-dashboard mb-6" aria-label="اختيار الصف الدراسي">
            <div className="md-panel rounded-2xl p-5 bg-white" style={{ border: "2px solid var(--duo-line)" }}>
              <h2 className="font-black text-base mb-1" style={{ color: "var(--duo-green-ink)" }}>اختر صفك الدراسي</h2>
              <p className="text-xs mb-4" style={{ color: "var(--duo-muted)" }}>
                سنعرض لك الدروس الخاصة بصفك فقط. يمكنك تغيير الصف لاحقًا من قائمة الحساب.
              </p>
              {availableStages.length > 1 && (
                <div className="mb-4">
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--duo-ink-soft)" }}>المرحلة الدراسية</p>
                  <div className="md-pick-grid">
                    {availableStages.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`md-pick-card${selectedStage === st ? " selected" : ""}`}
                        aria-pressed={selectedStage === st}
                        disabled={gradeSaving}
                        onClick={() => {
                          setSelectedStage(st);
                          setSelectedGrade("");
                        }}
                      >
                        <span className="md-pick-art"><PickArt kind={stageArtKind(st)} /></span>
                        <span className="md-pick-title">{st}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(selectedStage || availableStages.length <= 1) && (
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--duo-ink-soft)" }}>الصف الدراسي</p>
                  {availableGrades.length === 0 ? (
                    <p className="md-empty">لا توجد صفوف منشورة لهذه المرحلة حالياً.</p>
                  ) : (
                    <div className="md-pick-grid">
                      {availableGrades.map((g) => (
                        <button
                          key={g}
                          type="button"
                          className={`md-pick-card${selectedGrade === g ? " selected" : ""}`}
                          aria-pressed={selectedGrade === g}
                          disabled={gradeSaving}
                          onClick={() => persistGradeChoice(selectedStage || (availableStages.length === 1 ? availableStages[0] : ""), g)}
                        >
                          {gradeNumber(g) ? <span className="md-pick-num" aria-hidden="true">{gradeNumber(g)}</span> : null}
                          <span className="md-pick-art"><PickArt kind={gradeArtKind(g)} /></span>
                          <span className="md-pick-title">الصف {g}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {gradeSaveError && (
                <p className="text-xs mt-3" style={{ color: "var(--duo-red-d)" }}>{gradeSaveError}</p>
              )}
              {gradeSaving && (
                <p className="text-xs mt-3" style={{ color: "var(--duo-muted)" }}>جاري الحفظ...</p>
              )}
              {selectedGrade && (
                <button
                  type="button"
                  className="mt-4 text-xs font-bold"
                  style={{ color: "var(--duo-muted)" }}
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
            {isLoggedIn && progressPath.total > 0 && (
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
                        data-accent={Math.max(0, availableSubjects.indexOf(seg.unit)) % 6}
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
                <p className="md-section-label text-xs font-bold mb-2" style={{ color: "var(--duo-muted)" }}>أحدث الدروس </p>
                <div className="md-recent-row flex flex-wrap gap-2">
                  {recentLessons.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => navigate(lessonPath(l))}
                      className="md-recent-chip text-xs font-bold px-3 py-2 rounded-xl bg-white"
                      style={{ border: "2px solid var(--duo-line)", color: "var(--duo-ink)" }}
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
              style={{ background: "var(--duo-green)", color: "#fff" }}
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
            <p className="text-sm mt-3 font-medium" style={{ color: "var(--duo-muted)" }}>جاري تجهيز مسارك التعليمي...</p>
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
                        <div key={sub} className="md-unit-row" data-accent={availableSubjects.indexOf(sub) % 6}>
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
                            {isLoggedIn && (
                              <span
                                className="md-unit-card-progress"
                                aria-hidden="true"
                                title={unitProg ? `${unitProg.completed} / ${unitProg.total}` : undefined}
                              >
                                <i style={{ width: unitPct + "%" }} />
                              </span>
                            )}
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
              <section key={selectedSubject} ref={lessonsSectionRef} className="md-lessons" data-accent={Math.max(0, availableSubjects.indexOf(selectedSubject)) % 6}>
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

                {isLoggedIn && !progressReady ? (
                  <div className="md-loading"><CompassSpinner /></div>
                ) : filteredLessons.length === 0 ? (
                  <p className="md-empty">لا توجد دروس منشورة حالياً في هذه المادة.</p>
                ) : (
                  <div className="md-lessons-grid">
                    {sequentialLessons.map(({ lesson: l, kind }, lessonIdx) => {
                      const ui = lessonLockUi(kind, !isLoggedIn);
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
                              ? { cursor: "pointer", borderColor: "var(--duo-orange)" }
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
                          <div className="md-lesson-cta" style={lockedSeq ? { color: "var(--duo-muted)" } : lockedAccess ? { color: "var(--duo-orange-ink)" } : undefined}>
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
            <h2>كل ما تحتاجه لتفهم الدرس</h2>
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
      <style>{PLATFORM_CSS}</style>
    </div>
  );
}