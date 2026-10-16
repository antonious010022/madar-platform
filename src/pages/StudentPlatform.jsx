import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { listPublishedLessons, listMyProgress, getStudentGradeMeta, saveStudentGradeMeta, getGradeCovers} from "../lib/db";
import { useAuth } from "../lib/hooks";
import Footer from "../components/Footer";
import AuthModal, { GuestWelcomeBanner } from "../components/AuthModal";
import StudentAccountMenu from "../components/StudentAccountMenu";
import { DidYouKnowCard, DYK_AUTH_COPY } from "../components/DidYouKnow";
import { slugify } from "../lib/slugify";
import { arabicLessonOrdinal, lessonPath, isLessonComingSoon, lessonDisplayNumber, sortLessonsForSequence, buildLessonLockStates, lessonLockUi, readGuestGradeLocal, writeGuestGradeLocal } from "./student-platform/helpers";import { CompassRose, Galaxy, ContinentsAtlas, usePointerParallax, HistoryFrieze, CompassSpinner } from "./student-platform/decor";
import { gradeNumber, gradeArtKind, stageArtKind, PickArt } from "./student-platform/uiParts";
import { PLATFORM_CSS } from "./student-platform/platformStyles";

/* ---------------------------------------------------------------------------
   Floating scatter cards — positions use left/top % of parent (not translate %),
   so cards actually spread around the hero instead of stacking.
--------------------------------------------------------------------------- */
const SCATTER_CARDS = [
  { key: "quiz", title: "أسئلة تفاعلية", sub: "تحقق من فهمك", tone: "rose", xD: -42, yD: -28, xM: -38, yM: -22, rot: "-4deg", dur: "3.2s", delay: "0s", hideMobile: false,
    icon: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M11 18h2v-2h-2v2zm1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2 2 2 0 0 1 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4z" /></svg>) },
  { key: "mindmap", title: "خريطة ذهنية", sub: "ربط الأفكار", tone: "sky", xD: 40, yD: -26, xM: 36, yM: -20, rot: "3deg", dur: "4s", delay: "0.2s", hideMobile: false,
    icon: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2a3 3 0 0 1 3 3c0 .9-.4 1.7-1 2.2V9h2a3 3 0 1 1 0 6h-2v1.8c.6.5 1 1.3 1 2.2a3 3 0 1 1-6 0c0-.9.4-1.7 1-2.2V15H8a3 3 0 1 1 0-6h2V7.2C9.4 6.7 9 5.9 9 5a3 3 0 0 1 3-3z" /></svg>) },
  { key: "timeline", title: "خط زمني", sub: "ترتيب الأحداث", tone: "amber", xD: -46, yD: 6, xM: -40, yM: 18, rot: "3deg", dur: "4.6s", delay: "0.35s", hideMobile: false,
    icon: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4 11h16v2H4v-2zm3 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>) },
  { key: "explain", title: "شرح مرئي", sub: "محتوى واضح", tone: "teal", xD: 44, yD: 8, xM: 38, yM: 20, rot: "-3deg", dur: "3.5s", delay: "0.5s", hideMobile: false,
    icon: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 3V5a1 1 0 0 1 1-1zm2 3v2h8V7H6zm0 4v2h12v-2H6z" /></svg>) },
  { key: "recall", title: "تذكّر سريع", sub: "نقاط أساسية", tone: "emerald", xD: -34, yD: 32, xM: -28, yM: 42, rot: "-2deg", dur: "4.2s", delay: "0.7s", hideMobile: false,
    icon: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 3a7 7 0 0 1 7 7c0 3.5-2.5 5.5-4.5 7.2-.6.5-1 1.1-1.2 1.8h-2.6c-.2-.7-.6-1.3-1.2-1.8C7.5 15.5 5 13.5 5 10a7 7 0 0 1 7-7zm-2 18h4v1h-4v-1z" /></svg>) },
  { key: "review", title: "مراجعة نهائية", sub: "تلخيص الدرس", tone: "violet", xD: 32, yD: 34, xM: 26, yM: 44, rot: "4deg", dur: "5s", delay: "0.9s", hideMobile: true,
    icon: (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6 2h11l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm10 1.5V8h4.5L16 3.5zM8 11h8v2H8v-2zm0 4h6v2H8v-2z" /></svg>) },
];
const TONE_BG = { rose: "#F5E6EC", sky: "#E6EEF3", amber: "#F8EFD8", teal: "#E0F1EC", emerald: "#E4EFE3", violet: "#EFE8F4" };
const TONE_INK = { rose: "#8A4560", sky: "#2F5870", amber: "#86600F", teal: "#0E5348", emerald: "#3F6B3A", violet: "#5A4175" };

function FloatingScatterCards() {
  return (
    <div className="md-scatter-layer" aria-hidden="true">
      {SCATTER_CARDS.map((c) => (
        <div
          key={c.key}
          className={`md-scatter-card${c.hideMobile ? " md-scatter-card--desktop-only" : ""}`}
          style={{
            "--card-x-d": c.xD,
            "--card-y-d": c.yD,
            "--card-x-m": c.xM,
            "--card-y-m": c.yM,
            "--card-rot": c.rot,
            "--card-anim-dur": c.dur,
            "--card-anim-delay": c.delay,
          }}
        >
          <div className="md-scatter-inner">
            <span className="md-scatter-icon" style={{ background: TONE_BG[c.tone], color: TONE_INK[c.tone] }}>{c.icon}</span>
            <div className="md-scatter-text">
              <span className="md-scatter-title">{c.title}</span>
              <span className="md-scatter-sub">{c.sub}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ORG_NAV_GROUPS = [
  { title: "التعلّم", items: [{ to: "/student", label: "الرئيسية", end: true }, { to: "/student/saved", label: "دروسي المحفوظة" }] },
  { title: "المنصة", items: [{ to: "/about", label: "عن مَدَار" }, { to: "/student/privacy", label: "الخصوصية" }, { to: "/student/terms", label: "الشروط" }] },
];

function StudentOrganizedNav({ open, onClose, session, onLogin, ctx }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (!open) return null;
  const c = ctx || {};
  function go(to) { navigate(to); onClose(); }
  function isActive(item) {
    if (item.end) return pathname === item.to || pathname === "/";
    return pathname === item.to || pathname.startsWith(item.to + "/");
  }
  const hasGrade = !!c.grade;
  return (
    <>
      <button type="button" className="md-org-backdrop" aria-label="إغلاق القائمة" onClick={onClose} />
      <aside className="md-org-panel" role="dialog" aria-modal="true" aria-label="قائمة المنصة">
        <div className="md-org-panel-head">
          <Link to="/about" className="md-org-brand" onClick={onClose} aria-label="مَدَار — صفحة التعريف" style={{ textDecoration: "none" }}>مَدَار</Link>
          <button type="button" className="md-org-close" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>

        <div className="md-org-scroll">
          {/* who / which grade — with a way to change it */}
          <div className="md-org-account">
            <span className="md-org-avatar" aria-hidden="true">{session ? String(c.name || "ط").trim().charAt(0) : "؟"}</span>
            <div className="md-org-account-text">
              <b>{session ? c.name || "طالب" : "زائر"}</b>
              <small>{hasGrade ? `${c.stage ? c.stage + " · " : ""}${c.grade}` : "لم تحدد صفك بعد"}</small>
            </div>
          </div>
          <div className="md-org-actions">
            <button type="button" className="md-org-btn" onClick={() => { onClose(); c.onChangeGrade && c.onChangeGrade(); }}>
              {hasGrade ? "تغيير الصف الدراسي" : "اختيار الصف الدراسي"}
            </button>
            {c.continueLesson ? (
              <button type="button" className="md-org-btn md-org-btn--solid" onClick={() => { onClose(); c.onContinue && c.onContinue(); }}>
                ▶ استكمل: {c.continueLesson.lesson.title}
              </button>
            ) : null}
          </div>

          {/* browse controls: term + unit */}

          <nav className="md-org-nav" aria-label="روابط المنصة">
            {ORG_NAV_GROUPS.map((g) => (
              <div key={g.title} className="md-org-group">
                <p className="md-org-heading">{g.title}</p>
                {g.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <button key={item.to} type="button" className={`md-org-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined} onClick={() => go(item.to)}>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* display preference */}
          <div className="md-org-group">
            <p className="md-org-heading">العرض</p>
            <button type="button" className="md-org-switch" role="switch" aria-checked={!!c.dark} onClick={() => c.onToggleDark && c.onToggleDark()}>
              <span className="md-org-switch-text">
                <b>الوضع الداكن</b>
                <small>مظهر ليلي هادئ للمنصة</small>
              </span>
              <span className={`md-org-knob${c.dark ? " is-on" : ""}`} aria-hidden="true"><i /></span>
            </button>
            <button type="button" className="md-org-switch" role="switch" aria-checked={!!c.calm} onClick={() => c.onToggleCalm && c.onToggleCalm()}>
              <span className="md-org-switch-text">
                <b>وضع هادئ</b>
                <small>إيقاف الحركات والتأثيرات المتحركة</small>
              </span>
              <span className={`md-org-knob${c.calm ? " is-on" : ""}`} aria-hidden="true"><i /></span>
            </button>
          </div>
        </div>

        <div className="md-org-auth">
          {session ? (
            <p className="md-org-auth-note">أنت مسجّل الدخول — استخدم قائمة الحساب أعلى الصفحة.</p>
          ) : (
            <button type="button" className="md-org-login" onClick={() => { onClose(); onLogin(); }}>تسجيل الدخول</button>
          )}
        </div>
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Main Component — Logic 100% preserved
--------------------------------------------------------------------------- */
const GRADE_PHOTO_CSS = ".md-pick-card--photo{position:relative;overflow:hidden;min-height:7.5rem;display:flex;align-items:flex-end;padding:0!important;border-radius:1.15rem;border:1.5px solid var(--duo-line,#DED4BD);background:linear-gradient(145deg,#F3F8F6,#E5EFEC);text-align:right}.md-pick-card--photo .md-pick-cover{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.42;transform:scale(1.02);transition:opacity .25s ease,transform .35s ease}.md-pick-card--photo.has-cover .md-pick-cover{opacity:.48}.md-pick-card--photo .md-pick-cover-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(14,83,72,.12) 45%,rgba(14,83,72,.55));pointer-events:none}.md-pick-card--photo .md-pick-photo-body{position:relative;z-index:1;width:100%;padding:.85rem 1rem .95rem;display:flex;flex-direction:column;gap:.2rem}.md-pick-card--photo .md-pick-title{color:#fff!important;font-weight:850;font-size:.95rem;text-shadow:0 1px 8px rgba(0,0,0,.25)}.md-pick-card--photo .md-pick-num{color:rgba(255,255,255,.9)!important;font-weight:800;font-size:.75rem}.md-pick-card--photo:hover .md-pick-cover,.md-pick-card--photo.selected .md-pick-cover{opacity:.58;transform:scale(1.05)}.md-pick-card--photo.selected{border-color:#147A6A;box-shadow:0 0 0 2px rgba(20,122,106,.35),0 12px 28px -14px rgba(14,83,72,.4)}.md-pick-card--photo:not(.has-cover) .md-pick-title{color:#0E5348!important;text-shadow:none}.md-pick-card--photo:not(.has-cover) .md-pick-num{color:#147A6A!important}.md-pick-card--photo:not(.has-cover) .md-pick-cover-scrim{background:linear-gradient(160deg,rgba(20,122,106,.06),rgba(14,83,72,.14))}html[data-theme='dark'] .md-pick-card--photo{background:linear-gradient(145deg,#1a2420,#15201c);border-color:#30423B}html[data-theme='dark'] .md-pick-card--photo:not(.has-cover) .md-pick-title{color:#EAF1ED!important}";

export default function StudentPlatform() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuth();
  const pointer = usePointerParallax();
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState("");
  const [myProgress, setMyProgress] = useState([]); // student_lesson_progress rows (Supabase); [] for guests
  const [authOpen, setAuthOpen] = useState(false);
  const [authCtx, setAuthCtx] = useState(null); // optional {title, subtitle} for the sign-in modal
  const [orgNavOpen, setOrgNavOpen] = useState(false);
  // "وضع هادئ": stops the decorative motion on this page (kept in this browser only)
  const [calm, setCalm] = useState(() => {
    try { return localStorage.getItem("madar_calm_v1") === "1"; } catch { return false; }
  });
  function toggleCalm() {
    setCalm((v) => {
      const next = !v;
      try { localStorage.setItem("madar_calm_v1", next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("madar_theme_v1") === "dark"; } catch { return false; }
  });
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } catch { /* ignore */ }
  }, [isDark]);
  function toggleDark() {
    setIsDark((v) => {
      const next = !v;
      try { localStorage.setItem("madar_theme_v1", next ? "dark" : "light"); } catch { /* ignore */ }
      return next;
    });
  }
  function openAuthFor(ctx) {
    setAuthCtx(ctx || null);
    setAuthOpen(true);
  }
  // UX only: after the student taps a unit, bring the lessons list into view
  const lessonsSectionRef = useRef(null);
  const scrollToLessonsRef = useRef(false);

  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [gradeMetaReady, setGradeMetaReady] = useState(false);
  const [pickingGrade, setPickingGrade] = useState(false);
  const [gradeCovers, setGradeCovers] = useState({});
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
    let cancelled = false;
    getGradeCovers()
      .then((c) => {
        if (!cancelled && c && typeof c === "object") setGradeCovers(c);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);


  // Arrived from another page's account menu ("تغيير الصف الدراسي"): open the same grade picker, once.
  useEffect(() => {
    if (!gradeMetaReady || !session || !location.state?.changeGrade) return;
    setPickingGrade(true);
    setGradeSaveError("");
    navigate(location.pathname, { replace: true, state: null });
  }, [gradeMetaReady, session, location.state]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Progress: account → Supabase; guest → localStorage via listMyProgress.
  useEffect(() => {
    if (session === undefined) return undefined;
    let cancelled = false;
    function load() {
      listMyProgress()
        .then((rows) => {
          if (!cancelled) setMyProgress(Array.isArray(rows) ? rows : []);
        })
        .catch(() => {
          if (!cancelled) setMyProgress([]);
        });
    }
    load();
    function onFocus() { load(); }
    function onVis() {
      if (document.visibilityState === "visible") load();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [session === undefined, session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const completedLessonIds = useMemo(
    () => {
      const set = new Set();
      for (const p of myProgress || []) {
        if (p.lessonCompleted || p.finalReviewCompleted) set.add(String(p.lessonId));
      }
      return set;
    },
    [myProgress]
  );

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

  const localProgress = useMemo(() => (myProgress.length ? myProgress[0] : null), [myProgress]);
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
    for (const l of base) {
      if (completedLessonIds.has(String(l.id))) {
        const sub = l.subject || "أخرى";
        if (map[sub]) map[sub].completed = Math.min(map[sub].total, (map[sub].completed || 0) + 1);
      }
    }
    return Object.values(map).sort((a, b) => a.subject.localeCompare(b.subject, "ar"));
  }, [isLoggedIn, selectedGrade, selectedTerm, termScopedLessons, completedLessonIds]);

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
    <div className={`md-platform${isDark ? " is-dark" : ""}`} data-calm={calm ? "1" : undefined}>
      <div className="md-topbar flex justify-between items-center gap-2 px-4 sm:px-6 py-2 relative z-20" style={{ background: "transparent" }}>
        <button type="button" className="md-org-trigger" aria-label="فتح قائمة المنصة" aria-expanded={orgNavOpen} onClick={() => setOrgNavOpen(true)}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
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
            <StudentAccountMenu session={session} name={studentName} stage={selectedStage} grade={selectedGrade} onChangeGrade={openChangeGrade} />
          ) : (
            <button type="button" onClick={() => setAuthOpen(true)}
              className="md-login-btn text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: "var(--duo-green)" }}>تسجيل الدخول</button>
          )}
        </div>
      </div>
      <StudentOrganizedNav
        open={orgNavOpen}
        onClose={() => setOrgNavOpen(false)}
        session={session}
        onLogin={() => setAuthOpen(true)}
        ctx={{
          name: studentName,
          stage: selectedStage,
          grade: selectedGrade,
          onChangeGrade: openChangeGrade,
          continueLesson,
          onContinue: () => continueLesson && navigate(lessonPath(continueLesson.lesson)),
          terms: availableTerms,
          selectedTerm,
          onPickTerm: (t) => { setSelectedTerm(t); setSelectedSubject(""); },
          subjects: availableSubjects,
          selectedSubject,
          onPickSubject: (sub) => { scrollToLessonsRef.current = true; setSelectedSubject(sub); },
          calm,
          onToggleCalm: toggleCalm,
          dark: isDark,
          onToggleDark: toggleDark,
        }}
      />
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
        {/* Personal welcome banner — student dashboard header */}
        <section className="md-welcome" aria-label="ترحيب">
          <div className="md-welcome-bg" aria-hidden="true">
            <span className="md-welcome-orb md-welcome-orb--a" />
            <span className="md-welcome-orb md-welcome-orb--b" />
            <span className="md-welcome-grid" />
          </div>
          <div className="md-welcome-body">
            <div className="md-welcome-copy">
              {session ? (
                <>
                  <p className="md-welcome-kicker">لوحة التعلّم</p>
                  <h1 className="md-welcome-title">
                    أهلًا بعودتك{studentName ? `، ${studentName}` : ""} 👋
                  </h1>
                  <p className="md-welcome-sub">
                    {selectedGrade && !pickingGrade
                      ? "مستعد تكمّل رحلتك في التعلّم؟ تابع من حيث توقفت، أو استكشف دروس صفك."
                      : "حدّد صفك الدراسي لنجهّز لك المسار المناسب."}
                  </p>
                </>
              ) : (
                <>
                  <p className="md-welcome-kicker">مَدَار</p>
                  <h1 className="md-welcome-title">أهلًا بك في مَدَار 👋</h1>
                  <p className="md-welcome-sub">
                    ابدأ باختيار صفك الدراسي، وجهّز مسارك للتعلّم. يمكنك التسجيل لاحقًا لحفظ تقدّمك.
                  </p>
                </>
              )}
            </div>
            {lessons && lessons.length > 0 && gradeMetaReady && selectedGrade && !pickingGrade && continueLesson ? (
              <button
                type="button"
                className="md-welcome-cta"
                onClick={() => navigate(lessonPath(continueLesson.lesson))}
              >
                <span className="md-welcome-cta-ico" aria-hidden="true">▶</span>
                <span className="md-welcome-cta-text">
                  <b>استكمل التعلّم</b>
                  <small>{continueLesson.lesson.title}</small>
                </span>
              </button>
            ) : null}
          </div>
        </section>

        <style id="md-grade-photo-css" dangerouslySetInnerHTML={{ __html: GRADE_PHOTO_CSS }} />

        {/* اختيار المرحلة والصف (أول مرة أو تغيير الصف) */}
        {lessons && lessons.length > 0 && gradeMetaReady && pickingGrade && (
          <section className="md-dashboard mb-6" aria-label="اختيار الصف الدراسي">
            <div className="md-panel rounded-2xl p-5 bg-white" style={{ border: "1.5px solid var(--duo-line)" }}>
              <div className="md-pick-head">
                <span className="md-pick-head-icon" aria-hidden="true">🎓</span>
                <div>
                  <h2 className="font-black text-base mb-1" style={{ color: "var(--duo-green-ink)" }}>ابدأ رحلتك من هنا</h2>
                  <p className="text-xs" style={{ color: "var(--duo-muted)" }}>
                    اختر صفك الدراسي لنعرض لك الدروس المناسبة. يمكنك تغيير الصف لاحقًا من قائمة الحساب.
                  </p>
                </div>
              </div>
              {availableStages.length > 1 && (
                <div className="mb-4">
                  <p className="md-pick-label text-xs font-bold mb-2">المرحلة الدراسية</p>
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
                  <p className="md-pick-label text-xs font-bold mb-2">الصف الدراسي</p>
                  {availableGrades.length === 0 ? (
                    <p className="md-empty">لا توجد صفوف منشورة لهذه المرحلة حالياً.</p>
                  ) : (
                    <div className="md-pick-grid">
                      {availableGrades.map((g) => {
                        const cover = gradeCovers[g] || gradeCovers[`الصف ${g}`] || "";
                        return (
                          <button
                            key={g}
                            type="button"
                            className={`md-pick-card md-pick-card--photo${selectedGrade === g ? " selected" : ""}${cover ? " has-cover" : ""}`}
                            aria-pressed={selectedGrade === g}
                            disabled={gradeSaving}
                            onClick={() => persistGradeChoice(selectedStage || (availableStages.length === 1 ? availableStages[0] : ""), g)}
                          >
                            <span
                              className="md-pick-cover"
                              aria-hidden="true"
                              style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                            />
                            <span className="md-pick-cover-scrim" aria-hidden="true" />
                            <span className="md-pick-photo-body">
                              {gradeNumber(g) ? <span className="md-pick-num" aria-hidden="true">{gradeNumber(g)}</span> : null}
                              <span className="md-pick-title">{String(g).startsWith("الصف") ? g : `الصف ${g}`}</span>
                            </span>
                          </button>
                        );
                      })}
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
                  className="duo-btn duo-btn-ghost mt-4 px-5 py-2 text-xs"
                  disabled={gradeSaving}
                  onClick={cancelGradePick}
                >
                  إلغاء والبقاء على الصف الحالي
                </button>
              )}
            </div>
          </section>
        )}

        {/* لوحة متابعة — فقط بعد تحديد الصف، ومحتوى الصف فقط (تحت الجزء الأخضر مباشرة) */}
        {lessons && lessons.length > 0 && selectedGrade && !pickingGrade && (
          <section className="md-dashboard mb-6" aria-label="لوحة الطالب">
            <div className="md-dash-row">
              {/* Progress — visual right in RTL */}
              <article className="md-dash-card md-dash-progress">
                <div className="md-dash-card-head">
                  <span className="md-dash-card-ico" aria-hidden="true">📈</span>
                  <h2 className="md-dash-card-title">تقدّمي في التعلّم</h2>
                </div>
                {progressTotals.total > 0 ? (
                    <>
                      <div className="md-dash-stats">
                        <div className="md-dash-pct">
                          <b>{progressTotals.pct}%</b>
                          <span>من مسار صفك</span>
                        </div>
                        <p className="md-dash-count">
                          <strong>{progressTotals.completed}</strong>
                          {" من "}
                          <strong>{progressTotals.total}</strong>
                          {" درس مكتمل"}
                        </p>
                      </div>
                      <div
                        className="md-dash-bar"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progressTotals.pct}
                        aria-label="نسبة التقدّم"
                      >
                        <i style={{ width: `${progressTotals.pct}%` }} />
                      </div>
                      {progressPath.total > 0 && (
                        <div className="md-jp md-jp--compact" aria-hidden="true">
                          <div className="md-jp-row">
                            <div className="md-jp-bar">
                              {progressPath.segments.map((seg) => (
                                <i
                                  key={seg.id}
                                  title={seg.title}
                                  data-accent={Math.max(0, availableSubjects.indexOf(seg.unit)) % 6}
                                  className={`md-jp-seg${seg.done ? " done" : ""}${progressPath.current && progressPath.current.id === seg.id ? " current" : ""}${seg.unitStart ? " unit-start" : ""}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {progressPath.current ? (
                        <p className="md-dash-now">
                          <span>أنت الآن في</span>
                          <b>{progressPath.current.unit}</b>
                          <span className="md-jp-sep">›</span>
                          <b>{progressPath.current.title}</b>
                        </p>
                      ) : progressTotals.completed >= progressTotals.total && progressTotals.total > 0 ? (
                        <p className="md-dash-now">أحسنت! أنهيت دروس هذا الفصل المتاحة.</p>
                      ) : (
                        <p className="md-dash-now"> ابدأ أي درس من وحداتك، وسيُحدَّث التقدّم هنا.</p>
                      )}
                      {continueLesson ? (
                        <button
                          type="button"
                          className="md-dash-continue"
                          onClick={() => navigate(lessonPath(continueLesson.lesson))}
                        >
                          ▶ استكمل: {continueLesson.lesson.title}
                        </button>
                      ) : null}
                      {!session ? (
                        <p className="md-dash-now" style={{ marginTop: "0.75rem" }}>
                          التقدّم محفوظ على هذا الجهاز.
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <div className="md-dash-guest">
                      <p className="md-dash-empty">
                        ابدأ أول درس في صفك، وسيظهر تقدّمك هنا تلقائيًا.
                      </p>
                    </div>
                  )}
              </article>

              {/* Did you know — visual left in RTL */}
              <article className="md-dash-card md-dash-dyk">
                <div className="md-dash-card-head">
                  <span className="md-dash-card-ico" aria-hidden="true">💡</span>
                  <h2 className="md-dash-card-title">هل تعلم؟</h2>
                </div>
                <DidYouKnowCard
                  session={session}
                  stage={selectedStage}
                  grade={selectedGrade}
                  ready={gradeMetaReady}
                  onRequireLogin={() => openAuthFor(DYK_AUTH_COPY)}
                />
              </article>
            </div>

            {recentLessons.length > 0 && (
              <div className="md-dash-recent">
                <p className="md-section-label text-xs font-bold mb-2" style={{ color: "var(--duo-muted)" }}>أحدث الدروس</p>
                <div className="md-recent-row flex flex-wrap gap-2">
                  {recentLessons.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => navigate(lessonPath(l))}
                      className="md-recent-chip text-xs font-bold px-3 py-2 rounded-xl bg-white"
                      style={{ border: "1.5px solid var(--duo-line)", color: "var(--duo-ink)" }}
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
              <div className="md-ctx-grade" role="group" aria-label={`الصف الحالي: ${selectedGrade}`}>
                <span className="md-ctx-grade-text">
                  {selectedStage ? selectedStage + " · " : ""}{selectedGrade}
                </span>
              </div>
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

                {filteredLessons.length === 0 ? (
                  <p className="md-empty">لا توجد دروس منشورة حالياً في هذه المادة.</p>
                ) : (
                  <div className="md-lessons-grid">
                    {sequentialLessons.map(({ lesson: l, kind }, lessonIdx) => {
                      const ui = lessonLockUi(kind, !session);
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

      </main>

      <HistoryFrieze />
      <Footer />
      <GuestWelcomeBanner session={session} />
      <AuthModal open={authOpen} onClose={() => { setAuthOpen(false); setAuthCtx(null); }} title={authCtx?.title} subtitle={authCtx?.subtitle} />

      {/* Global Styles for this page */}
      <style>{PLATFORM_CSS}</style>
      <style>{`
        /* —— Floating scatter: left/top % relative to PARENT, not translate% of self —— */
        .md-hero--scatter {
          position: relative;
          overflow: visible;
          isolation: isolate;
          min-height: 16rem;
        }
        .md-hero-core {
          position: relative;
          z-index: 2;
        }
        .md-scatter-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: visible;
        }
        /* Position via left/top so % is of the layer, then center the card on that point */
        .md-scatter-card {
          position: absolute;
          left: calc(50% + var(--card-x-m) * 1%);
          top: calc(50% + var(--card-y-m) * 1%);
          transform: translate(-50%, -50%) rotate(var(--card-rot));
          animation: md-scatter-float var(--card-anim-dur) ease-in-out var(--card-anim-delay) infinite alternate;
          will-change: transform;
        }
        @media (min-width: 768px) {
          .md-scatter-card {
            left: calc(50% + var(--card-x-d) * 1%);
            top: calc(50% + var(--card-y-d) * 1%);
          }
        }
        .md-scatter-card--desktop-only { display: none; }
        @media (min-width: 768px) {
          .md-scatter-card--desktop-only { display: block; }
        }
        .md-scatter-inner {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.55rem 0.8rem;
          border-radius: 1rem;
          border: 1.5px solid rgba(20, 122, 106, 0.12);
          background: #fff;
          box-shadow: 0 10px 28px -12px rgba(14, 83, 72, 0.22);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
        }
        .md-scatter-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 0.75rem;
          flex: none;
        }
        .md-scatter-text {
          display: flex;
          flex-direction: column;
          gap: 0.12rem;
          line-height: 1.2;
        }
        .md-scatter-title {
          font-size: 11px;
          font-weight: 700;
          color: #0E5348;
          font-family: var(--duo-font-display, inherit);
        }
        .md-scatter-sub {
          font-size: 9px;
          color: #6B7280;
        }
        @media (min-width: 1024px) {
          .md-scatter-title { font-size: 13px; }
          .md-scatter-sub { font-size: 10px; }
        }
        /* Float only moves Y; keep rotate from base transform via separate keyframes */
        @keyframes md-scatter-float {
          from { transform: translate(-50%, -50%) rotate(var(--card-rot)) translateY(0); }
          to   { transform: translate(-50%, -50%) rotate(var(--card-rot)) translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .md-scatter-card { animation: none !important; }
        }
        @media (max-width: 479px) {
          .md-scatter-inner { padding: 0.4rem 0.55rem; gap: 0.4rem; }
          .md-scatter-icon { width: 1.6rem; height: 1.6rem; }
          .md-scatter-title { font-size: 9px; }
          .md-scatter-sub { font-size: 8px; }
        }

        /* —— Organized nav drawer —— */
        .md-org-trigger {
          display: inline-flex; align-items: center; justify-content: center;
          width: 2.5rem; height: 2.5rem; border-radius: 999px;
          border: 1.5px solid var(--duo-line, #E5E7EB); background: #fff; color: #0E5348;
          box-shadow: 0 2px 0 var(--duo-line, #E5E7EB); cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .md-org-trigger:hover { background: #E8F5F1; color: #147A6A; }
        .md-org-trigger:focus-visible { outline: 1.5px solid #147A6A; outline-offset: 2px; }
        .md-org-backdrop {
          position: fixed; inset: 0; z-index: 80;
          background: rgba(14, 83, 72, 0.28); border: 0; cursor: pointer;
          animation: md-org-fade 0.2s ease;
        }
        .md-org-panel {
          position: fixed; top: 0; right: 0; z-index: 90;
          width: min(18.5rem, 88vw); height: 100%;
          background: #fff; border-left: 1.5px solid var(--duo-line, #E5E7EB);
          box-shadow: -8px 0 32px -12px rgba(14, 83, 72, 0.25);
          display: flex; flex-direction: column; padding: 1rem; gap: 0.75rem;
          animation: md-org-slide 0.22s ease; direction: rtl;
        }
        .md-org-panel-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.5rem; }
        .md-org-brand { font-weight: 900; font-size: 1.05rem; color: #147A6A; font-family: var(--duo-font-display, inherit); }
        .md-org-close { width: 2rem; height: 2rem; border-radius: 999px; border: 0; background: #F3F4F6; color: #0E5348; cursor: pointer; }
        .md-org-close:hover { background: #E8F5F1; }
        .md-org-nav {
          display: flex; flex-direction: column; gap: 0.35rem;
          border-top: 1px solid var(--duo-line, #E5E7EB); padding-top: 0.75rem;
          flex: 1; overflow-y: auto;
        }
        .md-org-heading {
          margin: 0.55rem 0 0.2rem; padding: 0 0.65rem;
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.04em;
          text-transform: uppercase; color: #9CA3AF;
        }
        .md-org-link {
          display: block; width: 100%; text-align: right;
          padding: 0.55rem 0.75rem; border-radius: 0.65rem; border: 0;
          background: transparent; font-size: 0.9rem; font-weight: 600;
          color: #374151; cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .md-org-link:hover { background: rgba(20, 122, 106, 0.1); color: #0E5348; }
        .md-org-link.is-active { background: rgba(20, 122, 106, 0.14); color: #147A6A; font-weight: 800; }
        .md-org-auth { border-top: 1px solid var(--duo-line, #E5E7EB); padding-top: 0.85rem; }
        .md-org-login {
          width: 100%; padding: 0.65rem 1rem; border-radius: 999px;
          border: 1.5px solid #147A6A; background: #147A6A; color: #fff;
          font-weight: 800; font-size: 0.9rem; cursor: pointer;
          box-shadow: 0 3px 0 #0E5348;
        }
        .md-org-login:hover { filter: brightness(1.05); }
        .md-org-auth-note { margin: 0; font-size: 0.75rem; color: #6B7280; line-height: 1.45; }
        @keyframes md-org-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes md-org-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) {
          .md-org-backdrop, .md-org-panel { animation: none !important; }
        }
        .md-org-panel { padding: 0; gap: 0; }
        .md-org-panel-head { padding: 1rem 1rem 0.75rem; border-bottom: 1px solid var(--duo-line, #E7DFCB); }
        .md-org-scroll { flex: 1; overflow-y: auto; padding: 0.9rem 1rem 0.5rem; display: flex; flex-direction: column; gap: 0.35rem; }
        .md-org-auth { padding: 0.85rem 1rem 1rem; }
        .md-org-nav { border-top: 0; padding-top: 0; flex: none; overflow: visible; }
        .md-org-account { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0.75rem; border-radius: 0.8rem; background: #FFFFFF; border: 1px solid var(--duo-line, #E7DFCB); }
        .md-org-avatar { flex: none; width: 2.4rem; height: 2.4rem; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: #147A6A; color: #fff; font-weight: 800; }
        .md-org-account-text { display: flex; flex-direction: column; min-width: 0; }
        .md-org-account-text b { font-size: 0.92rem; color: #2D3A36; }
        .md-org-account-text small { font-size: 0.74rem; color: #6B7A75; line-height: 1.5; }
        .md-org-actions { display: flex; flex-direction: column; gap: 0.45rem; margin: 0.45rem 0 0.2rem; }
        .md-org-btn { width: 100%; padding: 0.55rem 0.8rem; border-radius: 0.65rem; border: 1px solid var(--duo-line-d, #D6CCB4); background: #fff; color: #0E5348; font-size: 0.84rem; font-weight: 700; cursor: pointer; text-align: center; transition: background 0.15s ease, border-color 0.15s ease; }
        .md-org-btn:hover { background: #E8F3EF; border-color: #147A6A; }
        .md-org-btn--solid { background: #147A6A; border-color: #147A6A; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .md-org-btn--solid:hover { background: #0E5348; }
        .md-org-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0 0.2rem; }
        .md-org-chip { padding: 0.35rem 0.8rem; border-radius: 999px; border: 1px solid var(--duo-line-d, #D6CCB4); background: #fff; color: #4F5E59; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
        .md-org-chip:hover { border-color: #147A6A; color: #0E5348; }
        .md-org-chip.is-on { background: #147A6A; border-color: #147A6A; color: #fff; }
        .md-org-units { display: flex; flex-direction: column; gap: 0.25rem; }
        .md-org-unit { width: 100%; text-align: right; padding: 0.5rem 0.75rem; border-radius: 0.6rem; border: 0; background: transparent; color: #374151; font-size: 0.84rem; font-weight: 600; line-height: 1.55; cursor: pointer; border-inline-start: 3px solid transparent; }
        .md-org-unit:hover { background: rgba(20, 122, 106, 0.08); color: #0E5348; }
        .md-org-unit.is-on { background: rgba(20, 122, 106, 0.12); color: #0E5348; font-weight: 800; border-inline-start-color: #147A6A; }
        .md-org-switch { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: 0.7rem; border: 1px solid var(--duo-line, #E7DFCB); background: #fff; cursor: pointer; text-align: right; }
        .md-org-switch-text { display: flex; flex-direction: column; gap: 2px; }
        .md-org-switch-text b { font-size: 0.86rem; color: #2D3A36; }
        .md-org-switch-text small { font-size: 0.72rem; color: #6B7A75; line-height: 1.45; }
        .md-org-knob { flex: none; position: relative; width: 2.6rem; height: 1.5rem; border-radius: 999px; background: #D6CCB4; transition: background 0.2s ease; }
        .md-org-knob i { position: absolute; top: 3px; inset-inline-start: 3px; width: 1.1rem; height: 1.1rem; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: inset-inline-start 0.2s ease; }
        .md-org-knob.is-on { background: #147A6A; }
        .md-org-knob.is-on i { inset-inline-start: calc(100% - 1.1rem - 3px); }
        .md-org-heading { text-transform: none; letter-spacing: 0; font-size: 0.74rem; color: #6B7A75; }
        /* وضع هادئ: no decorative motion on this page */
        .md-platform[data-calm="1"] *, .md-platform[data-calm="1"] *::before, .md-platform[data-calm="1"] *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
        .md-ctx-terms .md-chip:hover:not(.selected) { color: var(--duo-ink, #2D3A36) !important; }
        .md-ctx-terms .md-chip.selected:hover { color: #fff !important; }
      

        /* —— Student welcome banner —— */
        .md-welcome {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          margin: 0 0 1.35rem;
          padding: clamp(1.35rem, 3.5vw, 2rem) clamp(1.1rem, 3vw, 1.75rem);
          border-radius: 1.5rem;
          background: linear-gradient(135deg, #0E5348 0%, #147A6A 48%, #1A8F7C 100%);
          box-shadow: 0 18px 40px -22px rgba(14, 83, 72, 0.45);
          color: #fff;
        }
        .md-welcome-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .md-welcome-orb {
          position: absolute; border-radius: 50%; filter: blur(28px); opacity: 0.45;
        }
        .md-welcome-orb--a {
          width: 12rem; height: 12rem; top: -4rem; inset-inline-end: -2rem;
          background: rgba(227, 192, 139, 0.55);
        }
        .md-welcome-orb--b {
          width: 9rem; height: 9rem; bottom: -3rem; inset-inline-start: -1rem;
          background: rgba(255, 255, 255, 0.18);
        }
        .md-welcome-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 70% at 70% 30%, #000 20%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 70% 30%, #000 20%, transparent 75%);
          opacity: 0.7;
        }
        .md-welcome-body {
          position: relative; z-index: 1;
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem 1.5rem;
        }
        .md-welcome-kicker {
          margin: 0 0 0.35rem; font-size: 0.78rem; font-weight: 800;
          color: rgba(255,255,255,0.78); letter-spacing: 0.02em;
        }
        .md-welcome-title {
          margin: 0; font-size: clamp(1.35rem, 3.2vw, 1.85rem); font-weight: 900;
          line-height: 1.45; color: #fff;
        }
        .md-welcome-sub {
          margin: 0.55rem 0 0; max-width: 34rem; font-size: 0.92rem; line-height: 1.75;
          color: rgba(255,255,255,0.88);
        }
        .md-welcome-cta {
          display: inline-flex; align-items: center; gap: 0.7rem;
          padding: 0.7rem 1rem; border-radius: 1rem; border: 0;
          background: #fff; color: #0E5348; cursor: pointer;
          box-shadow: 0 12px 28px -14px rgba(0,0,0,0.35);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          text-align: right; max-width: 100%;
        }
        .md-welcome-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -14px rgba(0,0,0,0.4); }
        .md-welcome-cta-ico {
          flex: none; width: 2.2rem; height: 2.2rem; border-radius: 0.7rem;
          display: inline-flex; align-items: center; justify-content: center;
          background: #147A6A; color: #fff; font-size: 0.75rem;
        }
        .md-welcome-cta-text { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
        .md-welcome-cta-text b { font-size: 0.88rem; font-weight: 850; }
        .md-welcome-cta-text small {
          font-size: 0.72rem; color: #5A6B65; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 14rem;
        }

        /* —— Dashboard two cards —— */
        .md-dash-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 860px) {
          .md-dash-row {
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
            gap: 1.15rem;
          }
        }
        .md-dash-card {
          border-radius: 1.25rem;
          border: 1px solid var(--duo-line, #DED4BD);
          background: #fff;
          box-shadow: 0 12px 32px -20px rgba(14, 83, 72, 0.22);
          padding: 1.1rem 1.15rem 1.2rem;
        }
        .md-dash-card-head {
          display: flex; align-items: center; gap: 0.55rem; margin-bottom: 0.85rem;
        }
        .md-dash-card-ico {
          width: 2rem; height: 2rem; border-radius: 0.65rem;
          display: inline-flex; align-items: center; justify-content: center;
          background: #E0F1EC; font-size: 0.95rem;
        }
        .md-dash-card-title {
          margin: 0; font-size: 1rem; font-weight: 850; color: #0E5348;
        }
        .md-dash-stats { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 0.5rem; }
        .md-dash-pct b {
          display: block; font-size: 2rem; font-weight: 900; line-height: 1; color: #147A6A;
        }
        .md-dash-pct span { font-size: 0.75rem; color: #6B7A75; font-weight: 700; }
        .md-dash-count { margin: 0; font-size: 0.86rem; color: #3F4E49; }
        .md-dash-bar {
          margin-top: 0.85rem; height: 0.55rem; border-radius: 999px;
          background: #E8F0ED; overflow: hidden;
        }
        .md-dash-bar i {
          display: block; height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #0E5348, #147A6A 55%, #B8832A);
          transition: width 0.4s ease;
        }
        .md-jp--compact { margin-top: 0.75rem; padding: 0; box-shadow: none; border: 0; background: transparent; }
        .md-jp--compact .md-jp-row { margin: 0; }
        .md-dash-now {
          margin: 0.75rem 0 0; font-size: 0.82rem; line-height: 1.6; color: #3F4E49;
        }
        .md-dash-now b { color: #0E5348; }
        .md-dash-continue {
          margin-top: 0.9rem; width: 100%;
          padding: 0.65rem 0.9rem; border-radius: 0.85rem; border: 0;
          background: #147A6A; color: #fff; font-weight: 800; font-size: 0.86rem;
          cursor: pointer; text-align: center;
          box-shadow: 0 10px 22px -12px rgba(20, 122, 106, 0.55);
        }
        .md-dash-continue:hover { filter: brightness(1.05); }
        .md-dash-empty, .md-dash-guest p {
          margin: 0; font-size: 0.9rem; line-height: 1.75; color: #5A6B65;
        }
        .md-dash-recent { margin-top: 1rem; }
        .md-platform.is-dark .md-dash-card,
        html[data-theme="dark"] .md-dash-card {
          background: #192723; border-color: #30423B; color: #EAF1ED;
        }
        .md-platform.is-dark .md-dash-card-title,
        html[data-theme="dark"] .md-dash-card-title { color: #B5DDD2; }
        .md-platform.is-dark .md-dash-card-ico,
        html[data-theme="dark"] .md-dash-card-ico { background: #203029; }
        .md-platform.is-dark .md-dash-bar,
        html[data-theme="dark"] .md-dash-bar { background: #243530; }
        .md-platform.is-dark .md-dash-count,
        .md-platform.is-dark .md-dash-now,
        html[data-theme="dark"] .md-dash-count,
        html[data-theme="dark"] .md-dash-now { color: #CBD8D2; }
        .md-platform.is-dark .md-welcome,
        html[data-theme="dark"] .md-welcome {
          background: linear-gradient(135deg, #0A3F36 0%, #0E5348 50%, #147A6A 100%);
        }
        @media (prefers-reduced-motion: reduce) {
          .md-welcome-cta, .md-dash-bar i { transition: none !important; }
        }

        /* —— Organized nav: light + dark —— */
        .md-platform.is-dark .md-org-panel,
        html[data-theme="dark"] .md-org-panel {
          background: #192723;
          border-left-color: #30423B;
          box-shadow: -16px 0 48px -20px rgba(0, 0, 0, 0.55);
          color: #EAF1ED;
        }
        .md-platform.is-dark .md-org-panel-head,
        html[data-theme="dark"] .md-org-panel-head {
          background: linear-gradient(180deg, #1E2C28 0%, #192723 100%);
          border-bottom-color: #30423B;
        }
        .md-platform.is-dark .md-org-brand,
        html[data-theme="dark"] .md-org-brand { color: #3A9C89; }
        .md-platform.is-dark .md-org-close,
        html[data-theme="dark"] .md-org-close {
          background: #243530; color: #B5DDD2;
        }
        .md-platform.is-dark .md-org-close:hover,
        html[data-theme="dark"] .md-org-close:hover { background: #2A3E38; }
        .md-platform.is-dark .md-org-account,
        html[data-theme="dark"] .md-org-account {
          background: linear-gradient(135deg, #1E2C28, #203029);
          border-color: #30423B;
        }
        .md-platform.is-dark .md-org-account-text b,
        html[data-theme="dark"] .md-org-account-text b { color: #EAF1ED; }
        .md-platform.is-dark .md-org-account-text small,
        html[data-theme="dark"] .md-org-account-text small { color: #A5B7AF; }
        .md-platform.is-dark .md-org-btn,
        html[data-theme="dark"] .md-org-btn {
          background: #1E2C28; border-color: #30423B; color: #B5DDD2;
        }
        .md-platform.is-dark .md-org-btn:hover,
        html[data-theme="dark"] .md-org-btn:hover {
          background: #203029; border-color: #3A9C89;
        }
        .md-platform.is-dark .md-org-btn--solid,
        html[data-theme="dark"] .md-org-btn--solid {
          background: #3A9C89; border-color: #3A9C89; color: #0A3F36;
        }
        .md-platform.is-dark .md-org-btn--solid:hover,
        html[data-theme="dark"] .md-org-btn--solid:hover { background: #2A7A6B; }
        .md-platform.is-dark .md-org-heading,
        html[data-theme="dark"] .md-org-heading { color: #7C8D86; }
        .md-platform.is-dark .md-org-link,
        html[data-theme="dark"] .md-org-link { color: #CBD8D2; }
        .md-platform.is-dark .md-org-link-ico,
        html[data-theme="dark"] .md-org-link-ico { background: #243530; }
        .md-platform.is-dark .md-org-link:hover,
        html[data-theme="dark"] .md-org-link:hover {
          background: rgba(58, 156, 137, 0.14); color: #B5DDD2;
        }
        .md-platform.is-dark .md-org-link:hover .md-org-link-ico,
        html[data-theme="dark"] .md-org-link:hover .md-org-link-ico { background: #203029; }
        .md-platform.is-dark .md-org-link.is-active,
        html[data-theme="dark"] .md-org-link.is-active {
          background: rgba(58, 156, 137, 0.2); color: #9ED8CB;
        }
        .md-platform.is-dark .md-org-link.is-active .md-org-link-ico,
        html[data-theme="dark"] .md-org-link.is-active .md-org-link-ico {
          background: #3A9C89; filter: none;
        }
        .md-platform.is-dark .md-org-link-dot,
        html[data-theme="dark"] .md-org-link-dot {
          background: #3A9C89;
          box-shadow: 0 0 0 3px rgba(58, 156, 137, 0.25);
        }
        .md-platform.is-dark .md-org-switch,
        html[data-theme="dark"] .md-org-switch {
          background: #1E2C28; border-color: #30423B;
        }
        .md-platform.is-dark .md-org-switch:hover,
        html[data-theme="dark"] .md-org-switch:hover {
          border-color: #3A9C89; background: #203029;
        }
        .md-platform.is-dark .md-org-switch-text b,
        html[data-theme="dark"] .md-org-switch-text b { color: #EAF1ED; }
        .md-platform.is-dark .md-org-switch-text small,
        html[data-theme="dark"] .md-org-switch-text small { color: #A5B7AF; }
        .md-platform.is-dark .md-org-knob,
        html[data-theme="dark"] .md-org-knob { background: #44584F; }
        .md-platform.is-dark .md-org-knob.is-on,
        html[data-theme="dark"] .md-org-knob.is-on { background: #3A9C89; }
        .md-platform.is-dark .md-org-auth,
        html[data-theme="dark"] .md-org-auth {
          background: #1E2C28; border-top-color: #30423B;
        }
        .md-platform.is-dark .md-org-auth-note,
        html[data-theme="dark"] .md-org-auth-note { color: #A5B7AF; }
        .md-platform.is-dark .md-org-login,
        html[data-theme="dark"] .md-org-login {
          background: #3A9C89; border-color: #3A9C89; color: #0A3F36;
          box-shadow: 0 10px 22px -12px rgba(58, 156, 137, 0.45);
        }
        .md-platform.is-dark .md-org-backdrop,
        html[data-theme="dark"] .md-org-backdrop {
          background: rgba(0, 0, 0, 0.55);
        }
        .md-platform.is-dark .md-org-trigger,
        html[data-theme="dark"] .md-org-trigger {
          background: #192723; border-color: #30423B; color: #B5DDD2;
          box-shadow: none;
        }
        .md-platform.is-dark .md-org-trigger:hover,
        html[data-theme="dark"] .md-org-trigger:hover {
          background: #203029; color: #9ED8CB;
        }

      `}</style>
    </div>
  );
}