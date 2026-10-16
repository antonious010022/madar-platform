import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { listPublishedLessons, listMyProgress, getStudentGradeMeta, saveStudentGradeMeta, getGradeCovers, resolveGradeCover } from "../lib/db";
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

/* —— Brand mark + progress ring —— */
const UNIT_COLORS = ["#147A6A", "#B8832A", "#4C7FA1", "#A8587A", "#6B5A9E", "#3F8F4B"];

function ProgressRing({ pct, size = 112, stroke = 11 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mid = size / 2;
  return (
    <div className="md-ring" style={{ width: size, height: size }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="نسبة التقدّم">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id="mdRingG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#147A6A" />
            <stop offset="1" stopColor="#B8832A" />
          </linearGradient>
        </defs>
        <circle cx={mid} cy={mid} r={r} fill="none" className="md-ring-track" strokeWidth={stroke} />
        <circle cx={mid} cy={mid} r={r} fill="none" stroke="url(#mdRingG)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, Math.max(0, pct)) / 100)}
          transform={`rotate(-90 ${mid} ${mid})`} className="md-ring-arc" />
      </svg>
      <span className="md-ring-label"><b>{pct}%</b></span>
    </div>
  );
}

const SB_NAV = [
  { to: "/student", label: "الرئيسية", icon: "🏠", end: true },
  { to: "/student/saved", label: "دروسي المحفوظة", icon: "🔖" },
];

/* القائمة الجانبية: ملف الطالب + تقدّمه، ثم الفصل والوحدات (تصفّح الصف)، ثم التنقّل والتخصيص */
function StudentOrganizedNav({ open, onClose, session, onLogin, ctx }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const c = ctx || {};
  function go(to) { navigate(to); onClose(); }
  function isActive(item) {
    if (item.end) return pathname === item.to || pathname === "/";
    return pathname === item.to || pathname.startsWith(item.to + "/");
  }
  const hasGrade = !!c.grade;
  const terms = c.terms || [];
  const subjects = c.subjects || [];
  const unitStats = new Map((c.units || []).map((u) => [u.subject, u]));
  const hasProgress = (c.total || 0) > 0;
  const displayName = session ? c.name || "طالب" : "زائر";
  return (
    <>
      <button type="button" className="md-sb-backdrop" aria-label="إغلاق القائمة" onClick={onClose} />
      <aside className="md-sb" role="dialog" aria-modal="true" aria-label="قائمة المنصة">
        <div className="md-sb-head">
          <Link to="/student" className="md-sb-logo" onClick={onClose} aria-label="مَدَار — الرئيسية">
            <img src="/photo/0MSCh.png" alt="مَدَار" />
          </Link>
          <button type="button" className="md-sb-close" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>

        <div className="md-sb-scroll">
          {/* الطالب + تقدّمه + تغيير الصف */}
          <section className="md-sb-me" aria-label="حسابي">
            <div className="md-sb-me-row">
              <span className="md-sb-avatar" aria-hidden="true">{session ? String(displayName).trim().charAt(0) : "👋"}</span>
              <div className="md-sb-me-text">
                <b>{displayName}</b>
                <small>{hasGrade ? `${c.stage ? c.stage + " · " : ""}${c.grade}` : "لم تحدد صفك بعد"}</small>
              </div>
            </div>
            {hasGrade && hasProgress && (
              <div className="md-sb-me-prog">
                <div className="md-sb-me-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.pct || 0} aria-label="تقدّمي في الفصل">
                  <i style={{ width: `${c.pct || 0}%` }} />
                </div>
                <span>{c.completed} من {c.total} {c.total === 1 ? "درس" : "دروس"} · {c.pct}%</span>
              </div>
            )}
            <button type="button" className="md-sb-me-btn" onClick={() => { onClose(); c.onChangeGrade && c.onChangeGrade(); }}>
              🎓 {hasGrade ? "تغيير الصف الدراسي" : "اختيار الصف الدراسي"}
            </button>
          </section>

          {/* تصفّح صفك: الفصل ثم الوحدات */}
          {hasGrade && terms.length > 0 && (
            <section className="md-sb-sec">
              <h3 className="md-sb-h">الفصل الدراسي</h3>
              <div className="md-sb-seg" role="group" aria-label="الفصل الدراسي">
                {terms.map((t) => (
                  <button key={t} type="button" className={`md-sb-seg-btn${c.selectedTerm === t ? " is-on" : ""}`} aria-pressed={c.selectedTerm === t} onClick={() => c.onPickTerm && c.onPickTerm(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </section>
          )}

          {hasGrade && subjects.length > 0 && (
            <section className="md-sb-sec">
              <h3 className="md-sb-h">وحدات الفصل</h3>
              <ul className="md-sb-units">
                {subjects.map((sub, i) => {
                  const st = unitStats.get(sub);
                  const pct = st && st.total ? Math.round((st.completed / st.total) * 100) : 0;
                  const on = c.selectedSubject === sub;
                  return (
                    <li key={sub}>
                      <button type="button" className={`md-sb-unit${on ? " is-on" : ""}${pct === 100 ? " is-done" : ""}`} style={{ "--u": UNIT_COLORS[i % UNIT_COLORS.length] }} aria-pressed={on} onClick={() => { c.onPickSubject && c.onPickSubject(sub); onClose(); }}>
                        <span className="md-sb-unit-num" aria-hidden="true">{pct === 100 ? "✓" : i + 1}</span>
                        <span className="md-sb-unit-body">
                          <b>{sub}</b>
                          {st ? <span className="md-sb-unit-bar"><i style={{ width: `${pct}%` }} /></span> : null}
                        </span>
                        {st ? <span className="md-sb-unit-count">{st.completed}/{st.total}</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <nav className="md-sb-sec" aria-label="التنقّل">
            <h3 className="md-sb-h">تنقّل</h3>
            {SB_NAV.map((item) => {
              const active = isActive(item);
              return (
                <button key={item.to} type="button" className={`md-sb-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined} onClick={() => go(item.to)}>
                  <span className="md-sb-link-ico" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <section className="md-sb-sec">
            <h3 className="md-sb-h">تخصيص</h3>
            <button type="button" className="md-sb-switch" role="switch" aria-checked={!!c.dark} onClick={() => c.onToggleDark && c.onToggleDark()}>
              <span className="md-sb-link-ico" aria-hidden="true">🌙</span>
              <span className="md-sb-switch-text"><b>الوضع الداكن</b></span>
              <span className={`md-sb-knob${c.dark ? " is-on" : ""}`} aria-hidden="true"><i /></span>
            </button>
            <button type="button" className="md-sb-switch" role="switch" aria-checked={!!c.calm} onClick={() => c.onToggleCalm && c.onToggleCalm()}>
              <span className="md-sb-link-ico" aria-hidden="true">🍃</span>
              <span className="md-sb-switch-text"><b>وضع هادئ</b><small>بدون حركات وتأثيرات</small></span>
              <span className={`md-sb-knob${c.calm ? " is-on" : ""}`} aria-hidden="true"><i /></span>
            </button>
          </section>
        </div>

        <div className="md-sb-foot">
          {!session && (
            <div className="md-sb-login">
              <p>سجّل دخولك لتحفظ تقدّمك وتكمل من أي جهاز.</p>
              <button type="button" onClick={() => { onClose(); onLogin(); }}>تسجيل الدخول</button>
            </div>
          )}
          <div className="md-sb-legal">
            <Link to="/student/privacy" onClick={onClose}>الخصوصية</Link>
            <span aria-hidden="true">·</span>
            <Link to="/student/terms" onClick={onClose}>الشروط</Link>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Main Component — Logic 100% preserved
--------------------------------------------------------------------------- */
const GRADE_PHOTO_CSS = ".md-pick-card--photo{position:relative;overflow:hidden;min-height:7.5rem;display:flex;align-items:flex-end;padding:0!important;border-radius:1.15rem;border:1.5px solid var(--duo-line,#DED4BD);background:linear-gradient(145deg,#F3F8F6,#E5EFEC);text-align:right}.md-pick-card--photo .md-pick-cover{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.5;transform:scale(1.02);transition:transform .35s ease}.md-pick-card--photo.has-cover .md-pick-cover{opacity:.5}.md-pick-card--photo .md-pick-cover-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(14,83,72,.12) 45%,rgba(14,83,72,.55));pointer-events:none}.md-pick-card--photo .md-pick-photo-body{position:relative;z-index:1;width:100%;padding:.85rem 1rem .95rem;display:flex;flex-direction:column;gap:.2rem}.md-pick-card--photo .md-pick-title{color:#fff!important;font-weight:850;font-size:.95rem;text-shadow:0 1px 8px rgba(0,0,0,.25)}.md-pick-card--photo .md-pick-num{color:rgba(255,255,255,.9)!important;font-weight:800;font-size:.75rem}.md-pick-card--photo:hover .md-pick-cover,.md-pick-card--photo.selected .md-pick-cover{opacity:.5;transform:scale(1.05)}.md-pick-card--photo.selected{border-color:#147A6A;box-shadow:0 0 0 2px rgba(20,122,106,.35),0 12px 28px -14px rgba(14,83,72,.4)}.md-pick-card--photo:not(.has-cover) .md-pick-title{color:#0E5348!important;text-shadow:none}.md-pick-card--photo:not(.has-cover) .md-pick-num{color:#147A6A!important}.md-pick-card--photo:not(.has-cover) .md-pick-cover-scrim{background:linear-gradient(160deg,rgba(20,122,106,.06),rgba(14,83,72,.14))}html[data-theme='dark'] .md-pick-card--photo{background:linear-gradient(145deg,#1a2420,#15201c);border-color:#30423B}html[data-theme='dark'] .md-pick-card--photo:not(.has-cover) .md-pick-title{color:#EAF1ED!important}";

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
        if (cancelled) return;
        const map = c && typeof c === "object" ? c : {};
        setGradeCovers(map);
        if (Object.keys(map).length === 0) {
          console.info("grade_covers: empty — أضف صورة من /teacher");
        }
      })
      .catch((e) => {
        console.warn("grade_covers load failed (تحقق من RLS على platform_settings):", e?.message || e);
        if (!cancelled) setGradeCovers({});
      });
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


  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? "صباح الخير ☀️" : hour >= 12 && hour < 18 ? "نهارك سعيد" : "مساء الخير 🌙";
  const showGradeMeta = !!(selectedGrade && !pickingGrade);
  const showResume = !!(lessons && lessons.length > 0 && gradeMetaReady && selectedGrade && !pickingGrade && continueLesson);

  return (
    <div className={`md-platform${isDark ? " is-dark" : ""}`} data-calm={calm ? "1" : undefined}>
      <header className="md-topbar md-topbar2">
        <div className="md-topbar2-start">
          <button type="button" className="md-org-trigger" aria-label="فتح قائمة المنصة" aria-expanded={orgNavOpen} onClick={() => setOrgNavOpen(true)}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Link to="/student" className="md-logo" aria-label="مَدَار — الرئيسية">
            <img src="/photo/0MSCh.png" alt="مَدَار" className="md-logo-img" />
          </Link>
        </div>
        <div className="md-topbar2-end">
          {session === undefined ? null : session ? (
            <StudentAccountMenu session={session} name={studentName} stage={selectedStage} grade={selectedGrade} onChangeGrade={openChangeGrade} />
          ) : (
            <button type="button" onClick={() => setAuthOpen(true)} className="md-login-btn text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: "var(--duo-green)" }}>تسجيل الدخول</button>
          )}
        </div>
      </header>
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
          units: progressView,
          pct: progressTotals.pct,
          completed: progressTotals.completed,
          total: progressTotals.total,
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
        {/* Hero — greeting + the ONE "continue learning" card */}
        <section className="md-hero2" aria-label="ترحيب">
          <svg className="md-hero2-orbits" viewBox="0 0 420 260" preserveAspectRatio="xMinYMid slice" aria-hidden="true">
            <ellipse cx="210" cy="130" rx="190" ry="68" transform="rotate(-24 210 130)" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.5" />
            <ellipse cx="210" cy="130" rx="140" ry="48" transform="rotate(-24 210 130)" fill="none" stroke="rgba(227,192,139,.35)" strokeWidth="1.5" strokeDasharray="3 7" />
            <circle cx="338" cy="70" r="6" fill="#E3C08B" />
            <circle cx="92" cy="196" r="4" fill="rgba(255,255,255,.7)" />
          </svg>
          <div className="md-hero2-body">
            <div className="md-hero2-copy">
              <p className="md-hero2-kicker">{session ? greeting : "مَدَار"}</p>
              <h1 className="md-hero2-title">
                {session ? `أهلًا بعودتك${studentName ? `، ${studentName}` : ""} 👋` : "أهلًا بك في مَدَار 👋"}
              </h1>
              <p className="md-hero2-sub">
                {session
                  ? showGradeMeta
                    ? "تابع من حيث توقفت، أو استكشف دروس صفك."
                    : "حدّد صفك الدراسي لنجهّز لك المسار المناسب."
                  : "ابدأ باختيار صفك الدراسي، وجهّز مسارك للتعلّم. يمكنك التسجيل لاحقًا لحفظ تقدّمك."}
              </p>
              {showGradeMeta && (
                <div className="md-hero2-meta">
                  <span className="md-hero2-pill">🎓 {selectedStage ? `${selectedStage} · ` : ""}{selectedGrade}</span>
                  <button type="button" className="md-hero2-link" onClick={openChangeGrade}>تغيير الصف</button>
                </div>
              )}
            </div>
            {showResume && (
              <button type="button" className="md-resume" onClick={() => navigate(lessonPath(continueLesson.lesson))}>
                <span className="md-resume-play" aria-hidden="true">▶</span>
                <span className="md-resume-text">
                  <small>استكمل من حيث توقفت</small>
                  <b>{continueLesson.lesson.title}</b>
                  <em>{continueLesson.done ? "درس مكتمل ✓ — راجعه من جديد" : `آخر موضع: المشهد ${continueLesson.sceneIdx + 1}`}</em>
                </span>
                <span className="md-resume-go" aria-hidden="true">‹</span>
              </button>
            )}
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
                        const cover = resolveGradeCover(gradeCovers, g);
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
                              style={cover ? { backgroundImage: `url("${cover}")` } : undefined}
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

        {/* لوحة متابعة — فقط بعد تحديد الصف */}
        {lessons && lessons.length > 0 && selectedGrade && !pickingGrade && (
          <section className="md-dashboard mb-6" aria-label="لوحة الطالب">
            {/* هل تعلم؟ — بطاقة مستقلة عن قصد، فوق باقي اللوحة */}
            <DidYouKnowCard
              session={session}
              stage={selectedStage}
              grade={selectedGrade}
              ready={gradeMetaReady}
              onRequireLogin={() => openAuthFor(DYK_AUTH_COPY)}
            />

            <div className={`md-dash-row${recentLessons.length > 0 ? "" : " md-dash-row--single"}`}>
              <article className="md-dash-card md-dash-progress">
                <div className="md-dash-card-head">
                  <span className="md-dash-card-ico" aria-hidden="true">🧭</span>
                  <h2 className="md-dash-card-title">رحلتي في التعلّم</h2>
                </div>
                {progressTotals.total > 0 ? (
                  <>
                    <div className="md-prog-top">
                      <ProgressRing pct={progressTotals.pct} />
                      <div className="md-prog-meta">
                        <p className="md-prog-big">
                          <b>{progressTotals.completed}</b>
                          <span> من {progressTotals.total} {progressTotals.total === 1 ? "درس" : "دروس"}</span>
                        </p>
                        <p className="md-prog-cap">
                          {progressTotals.completed >= progressTotals.total
                            ? "أنهيت كل دروس هذا الفصل المتاحة 🎉"
                            : progressTotals.completed === 0
                              ? "ابدأ أول درس وسيتحدّث تقدّمك هنا."
                              : `باقي ${progressTotals.total - progressTotals.completed} ${progressTotals.total - progressTotals.completed === 1 ? "درس" : "دروس"} لتكمل هذا الفصل`}
                        </p>
                        {progressPath.current && (
                          <p className="md-prog-now">
                            <i className="md-prog-now-dot" aria-hidden="true" />
                            <span>الآن:</span>
                            <b>{progressPath.current.unit}</b>
                            <span className="md-prog-sep">›</span>
                            <b>{progressPath.current.title}</b>
                          </p>
                        )}
                      </div>
                    </div>
                    {progressView.length > 0 && (
                      <ul className="md-prog-units" aria-label="التقدّم في كل وحدة">
                        {progressView.map((u, i) => {
                          const pct = u.total ? Math.round((u.completed / u.total) * 100) : 0;
                          const isCur = !!progressPath.current && progressPath.current.unit === u.subject;
                          return (
                            <li key={u.subject} className={`md-prog-unit${isCur ? " is-current" : ""}${pct === 100 ? " is-done" : ""}`} style={{ "--u": UNIT_COLORS[i % UNIT_COLORS.length] }}>
                              <span className="md-prog-unit-name">{pct === 100 ? "✓ " : ""}{u.subject}</span>
                              <span className="md-prog-unit-bar"><i style={{ width: `${pct}%` }} /></span>
                              <span className="md-prog-unit-count">{u.completed}/{u.total}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {!session && <p className="md-dash-note">التقدّم محفوظ على هذا الجهاز.</p>}
                  </>
                ) : (
                  <p className="md-dash-empty">ابدأ أول درس في صفك، وسيظهر تقدّمك هنا تلقائيًا.</p>
                )}
              </article>

              {recentLessons.length > 0 && (
                <aside className="md-dash-side" aria-label="أحدث الدروس">
                  <h2 className="md-recent-title">أحدث الدروس</h2>
                  <div className="md-recent-grid">
                    {recentLessons.map((l, i) => (
                      <button key={l.id} type="button" className="md-recent-card" style={{ "--u": UNIT_COLORS[i % UNIT_COLORS.length] }} onClick={() => navigate(lessonPath(l))}>
                        <span className="md-recent-ico" aria-hidden="true">📘</span>
                        <span className="md-recent-text">
                          <b>{l.title}</b>
                          {l.subject ? <small>{l.subject}</small> : null}
                        </span>
                        <span className="md-recent-go" aria-hidden="true">‹</span>
                      </button>
                    ))}
                  </div>
                </aside>
              )}
            </div>
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
        .md-sb-backdrop { position: fixed; inset: 0; z-index: 80; border: 0; cursor: pointer; background: rgba(8, 40, 34, 0.42); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); animation: md-sb-fade 0.2s ease; }
        .md-sb {
          position: fixed; top: 0; right: 0; z-index: 90; width: min(21rem, 90vw); height: 100%;
          display: flex; flex-direction: column; direction: rtl; background: #FAFAF6;
          border-left: 1px solid var(--duo-line, #E5E7EB); box-shadow: -18px 0 48px -18px rgba(14, 83, 72, 0.4);
          animation: md-sb-slide 0.26s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .md-sb-head { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; background: #fff; border-bottom: 1px solid var(--duo-line, #E7DFCB); }
        .md-sb-logo { display: inline-flex; align-items: center; }
        .md-sb-logo img { display: block; height: 2.4rem; width: auto; max-width: 9rem; object-fit: contain; }
        .md-sb-close { width: 2.1rem; height: 2.1rem; border: 0; border-radius: 999px; background: #F1F4F2; color: #0E5348; cursor: pointer; font-size: 0.9rem; }
        .md-sb-close:hover { background: #E0F1EC; }
        .md-sb-scroll { flex: 1; overflow-y: auto; padding: 0.95rem 1rem 0.6rem; display: flex; flex-direction: column; gap: 1.05rem; }

        .md-sb-me { padding: 0.95rem; border-radius: 1.2rem; color: #fff; background: linear-gradient(125deg, #0E5348 0%, #147A6A 70%, #1A8F7C 100%); box-shadow: 0 14px 28px -18px rgba(14, 83, 72, 0.7); }
        .md-sb-me-row { display: flex; align-items: center; gap: 0.7rem; }
        .md-sb-avatar { flex: none; width: 2.9rem; height: 2.9rem; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: #fff; color: #0E5348; font-size: 1.2rem; font-weight: 900; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.14); }
        .md-sb-me-text { min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
        .md-sb-me-text b { font-size: 1rem; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .md-sb-me-text small { font-size: 0.76rem; font-weight: 700; color: rgba(255, 255, 255, 0.82); }
        .md-sb-me-prog { margin-top: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem; }
        .md-sb-me-bar { height: 0.5rem; border-radius: 999px; background: rgba(255, 255, 255, 0.22); overflow: hidden; }
        .md-sb-me-bar i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #F3DDB6, #E3C08B); transition: width 0.6s ease; }
        .md-sb-me-prog span { font-size: 0.74rem; font-weight: 800; color: rgba(255, 255, 255, 0.9); }
        .md-sb-me-btn { width: 100%; margin-top: 0.8rem; padding: 0.5rem 0.8rem; border: 1px solid rgba(255, 255, 255, 0.35); border-radius: 0.8rem; background: rgba(255, 255, 255, 0.14); color: #fff; font-size: 0.82rem; font-weight: 800; cursor: pointer; transition: background 0.15s ease; }
        .md-sb-me-btn:hover { background: rgba(255, 255, 255, 0.26); }

        .md-sb-sec { display: flex; flex-direction: column; gap: 0.35rem; }
        .md-sb-h { margin: 0 0 0.2rem; padding: 0 0.2rem; font-size: 0.76rem; font-weight: 900; color: #6B7A75; letter-spacing: 0; }
        .md-sb-seg { display: flex; gap: 0.3rem; padding: 0.25rem; border-radius: 0.95rem; background: #EDF1EE; }
        .md-sb-seg-btn { flex: 1; padding: 0.45rem 0.4rem; border: 0; border-radius: 0.7rem; background: transparent; color: #4F5E59; font-size: 0.82rem; font-weight: 800; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
        .md-sb-seg-btn.is-on { background: #147A6A; color: #fff; box-shadow: 0 6px 12px -8px rgba(14, 83, 72, 0.8); }
        .md-sb-units { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
        .md-sb-unit { width: 100%; display: flex; align-items: center; gap: 0.65rem; padding: 0.5rem 0.6rem; border: 1px solid transparent; border-radius: 0.9rem; background: transparent; text-align: right; cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease; }
        .md-sb-unit:hover { background: rgba(20, 122, 106, 0.07); }
        .md-sb-unit.is-on { background: color-mix(in srgb, var(--u) 10%, #fff); border-color: color-mix(in srgb, var(--u) 40%, transparent); }
        .md-sb-unit-num { flex: none; width: 1.9rem; height: 1.9rem; border-radius: 0.6rem; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--u) 15%, #fff); color: var(--u); font-size: 0.82rem; font-weight: 900; }
        .md-sb-unit.is-done .md-sb-unit-num { background: var(--u); color: #fff; }
        .md-sb-unit-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.3rem; }
        .md-sb-unit-body b { font-size: 0.86rem; font-weight: 800; color: #2D3A36; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .md-sb-unit-bar { height: 0.32rem; border-radius: 999px; background: color-mix(in srgb, var(--u) 16%, transparent); overflow: hidden; }
        .md-sb-unit-bar i { display: block; height: 100%; border-radius: 999px; background: var(--u); }
        .md-sb-unit-count { flex: none; font-size: 0.72rem; font-weight: 800; color: #6B7A75; }

        .md-sb-link, .md-sb-switch { width: 100%; display: flex; align-items: center; gap: 0.65rem; padding: 0.55rem 0.6rem; border: 0; border-radius: 0.9rem; background: transparent; text-align: right; cursor: pointer; color: #2D3A36; font-size: 0.9rem; font-weight: 700; transition: background 0.15s ease; }
        .md-sb-link:hover, .md-sb-switch:hover { background: rgba(20, 122, 106, 0.08); }
        .md-sb-link.is-active { background: rgba(20, 122, 106, 0.14); color: #0E5348; font-weight: 900; }
        .md-sb-link-ico { flex: none; width: 2rem; height: 2rem; border-radius: 0.65rem; display: inline-flex; align-items: center; justify-content: center; background: #E8F0ED; font-size: 1rem; }
        .md-sb-link.is-active .md-sb-link-ico { background: #147A6A; }
        .md-sb-switch-text { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .md-sb-switch-text b { font-size: 0.88rem; font-weight: 800; }
        .md-sb-switch-text small { font-size: 0.7rem; font-weight: 700; color: #6B7A75; }
        .md-sb-knob { flex: none; position: relative; width: 2.5rem; height: 1.4rem; border-radius: 999px; background: #CBD5D0; transition: background 0.2s ease; }
        .md-sb-knob i { position: absolute; top: 3px; inset-inline-start: 3px; width: 1rem; height: 1rem; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25); transition: inset-inline-start 0.2s ease; }
        .md-sb-knob.is-on { background: #147A6A; }
        .md-sb-knob.is-on i { inset-inline-start: calc(100% - 1rem - 3px); }

        .md-sb-foot { padding: 0.8rem 1rem 1rem; background: #fff; border-top: 1px solid var(--duo-line, #E7DFCB); display: flex; flex-direction: column; gap: 0.7rem; }
        .md-sb-login { padding: 0.8rem; border-radius: 1rem; background: #FBF3E1; border: 1px dashed #E3B93C; }
        .md-sb-login p { margin: 0 0 0.6rem; font-size: 0.8rem; font-weight: 700; line-height: 1.6; color: #5E4309; }
        .md-sb-login button { width: 100%; padding: 0.6rem 1rem; border: 0; border-radius: 999px; background: #147A6A; color: #fff; font-size: 0.9rem; font-weight: 900; cursor: pointer; box-shadow: 0 4px 0 #0E5348; }
        .md-sb-login button:hover { filter: brightness(1.06); }
        .md-sb-legal { display: flex; justify-content: center; gap: 0.5rem; font-size: 0.72rem; font-weight: 700; color: #9AA7A1; }
        .md-sb-legal a { color: #6B7A75; text-decoration: none; }
        .md-sb-legal a:hover { color: #147A6A; text-decoration: underline; }
        @keyframes md-sb-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes md-sb-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) { .md-sb-backdrop, .md-sb { animation: none !important; } .md-sb-me-bar i, .md-sb-knob, .md-sb-knob i { transition: none !important; } }
        /* وضع هادئ: no decorative motion on this page */
        .md-platform[data-calm="1"] *, .md-platform[data-calm="1"] *::before, .md-platform[data-calm="1"] *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
        .md-ctx-terms .md-chip:hover:not(.selected) { color: var(--duo-ink, #2D3A36) !important; }
        .md-ctx-terms .md-chip.selected:hover { color: #fff !important; }
      

        /* —— Top bar + logo —— */
        .md-topbar2 {
          position: sticky; top: 0; z-index: 40;
          display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
          padding: 0.55rem clamp(0.9rem, 3vw, 1.5rem);
          background: rgba(255, 255, 255, 0.78);
          -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(20, 122, 106, 0.14);
        }
        .md-topbar2-start, .md-topbar2-end { display: flex; align-items: center; gap: 0.7rem; min-width: 0; }
        .md-logo { display: inline-flex; align-items: center; gap: 0.55rem; text-decoration: none; }
        .md-logo-img { display: block; height: 2.5rem; width: auto; max-width: 9rem; object-fit: contain; }
        .md-platform.is-dark .md-topbar2, html[data-theme="dark"] .md-topbar2 { background: rgba(21, 32, 28, 0.78); border-bottom-color: #30423B; }

        /* —— Hero —— */
        .md-hero2 {
          position: relative; isolation: isolate; overflow: hidden;
          margin: 0 0 1.4rem;
          padding: clamp(1.4rem, 3.6vw, 2.1rem) clamp(1.15rem, 3vw, 1.9rem);
          border-radius: 1.6rem; color: #fff;
          background: linear-gradient(125deg, #0A3F36 0%, #0E5348 38%, #147A6A 78%, #1A8F7C 100%);
          box-shadow: 0 22px 44px -24px rgba(14, 83, 72, 0.55);
        }
        .md-hero2-orbits { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; opacity: 0.95; }
        .md-hero2-body { position: relative; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.1rem 1.75rem; }
        .md-hero2-copy { flex: 1 1 18rem; min-width: 0; }
        .md-hero2-kicker { margin: 0 0 0.35rem; font-size: 0.82rem; font-weight: 800; color: rgba(255, 255, 255, 0.8); }
        .md-hero2-title { margin: 0; font-size: clamp(1.4rem, 3.4vw, 2rem); font-weight: 900; line-height: 1.45; color: #fff; }
        .md-hero2-sub { margin: 0.5rem 0 0; max-width: 33rem; font-size: 0.93rem; line-height: 1.8; color: rgba(255, 255, 255, 0.88); }
        .md-hero2-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin-top: 0.9rem; }
        .md-hero2-pill { padding: 0.3rem 0.8rem; border-radius: 999px; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.28); font-size: 0.8rem; font-weight: 800; }
        .md-hero2-link { padding: 0.25rem 0.2rem; border: 0; background: transparent; color: #F3DDB6; font-size: 0.8rem; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
        .md-hero2-link:hover { color: #fff; }

        /* the ONE continue-learning card */
        .md-resume {
          flex: 0 1 22rem; display: flex; align-items: center; gap: 0.85rem; max-width: 100%;
          padding: 0.85rem 1rem; border: 0; border-radius: 1.2rem; text-align: right; cursor: pointer;
          background: #fff; color: #0E5348;
          box-shadow: 0 16px 34px -16px rgba(0, 0, 0, 0.45);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .md-resume:hover { transform: translateY(-3px); box-shadow: 0 22px 40px -16px rgba(0, 0, 0, 0.5); }
        .md-resume:focus-visible { outline: 3px solid #E3C08B; outline-offset: 3px; }
        .md-resume-play {
          flex: none; width: 2.9rem; height: 2.9rem; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #147A6A, #0E5348); color: #fff; font-size: 0.95rem;
          box-shadow: 0 8px 16px -8px rgba(14, 83, 72, 0.7);
        }
        .md-resume-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.12rem; }
        .md-resume-text small { font-size: 0.72rem; font-weight: 800; color: #B8832A; }
        .md-resume-text b { font-size: 0.98rem; font-weight: 900; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .md-resume-text em { font-style: normal; font-size: 0.74rem; font-weight: 700; color: #5A6B65; }
        .md-resume-go { flex: none; font-size: 1.5rem; font-weight: 800; color: #147A6A; transition: transform 0.18s ease; }
        .md-resume:hover .md-resume-go { transform: translateX(-4px); }
        @media (max-width: 640px) { .md-resume { flex-basis: 100%; } }
        .md-platform.is-dark .md-hero2, html[data-theme="dark"] .md-hero2 { background: linear-gradient(125deg, #062a24 0%, #0A3F36 45%, #0E5348 100%); }
        .md-platform.is-dark .md-resume, html[data-theme="dark"] .md-resume { background: #1E2C28; color: #EAF1ED; border: 1px solid #30423B; }
        .md-platform.is-dark .md-resume-text em, html[data-theme="dark"] .md-resume-text em { color: #A5B7AF; }
        .md-platform.is-dark .md-resume-text small, html[data-theme="dark"] .md-resume-text small { color: #E3C08B; }
        .md-platform.is-dark .md-resume-go, html[data-theme="dark"] .md-resume-go { color: #9ED8CB; }

        /* —— Dashboard —— */
        .md-dash-row { display: grid; grid-template-columns: 1fr; gap: 1rem; align-items: start; }
        @media (min-width: 900px) { .md-dash-row { grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr); gap: 1.2rem; } }
        .md-dash-card {
          border-radius: 1.35rem; border: 1px solid var(--duo-line, #DED4BD); background: #fff;
          box-shadow: 0 14px 34px -22px rgba(14, 83, 72, 0.28); padding: 1.15rem 1.2rem 1.25rem;
        }
        .md-dash-card-head { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 1rem; }
        .md-dash-card-ico { width: 2.1rem; height: 2.1rem; border-radius: 0.7rem; display: inline-flex; align-items: center; justify-content: center; background: #E0F1EC; font-size: 1rem; }
        .md-dash-card-title { margin: 0; font-size: 1.02rem; font-weight: 900; color: #0E5348; }
        .md-dash-empty { margin: 0; font-size: 0.9rem; line-height: 1.75; color: #5A6B65; }
        .md-dash-note { margin: 0.85rem 0 0; font-size: 0.76rem; color: #6B7A75; font-weight: 700; }
        .md-dash-side { min-width: 0; }
        .md-dash-side .md-recent-title { margin-top: 0.2rem; }
        .md-dash-row--single { grid-template-columns: 1fr !important; }

        .md-prog-top { display: flex; align-items: center; gap: 1.1rem; }
        .md-ring { position: relative; flex: none; color: #0E5348; }
        .md-ring-track { stroke: currentColor; stroke-opacity: 0.12; }
        .md-ring-arc { transition: stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .md-ring-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
        .md-ring-label b { font-size: 1.55rem; font-weight: 900; color: #0E5348; }
        .md-prog-meta { min-width: 0; display: flex; flex-direction: column; gap: 0.3rem; }
        .md-prog-big { margin: 0; color: #3F4E49; font-size: 0.9rem; font-weight: 700; }
        .md-prog-big b { font-size: 1.7rem; font-weight: 900; color: #147A6A; }
        .md-prog-cap { margin: 0; font-size: 0.82rem; line-height: 1.6; color: #5A6B65; }
        .md-prog-now {
          display: inline-flex; flex-wrap: wrap; align-items: center; gap: 0.35rem;
          margin: 0.3rem 0 0; padding: 0.35rem 0.75rem; border-radius: 999px; width: fit-content; max-width: 100%;
          background: #FBF3E1; color: #86600F; font-size: 0.78rem; font-weight: 700;
        }
        .md-prog-now b { color: #5E4309; font-weight: 850; }
        .md-prog-sep { opacity: 0.6; }
        .md-prog-now-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #B8832A; box-shadow: 0 0 0 0 rgba(184, 131, 42, 0.5); animation: md-prog-pulse 1.8s ease-out infinite; }
        @keyframes md-prog-pulse { 0% { box-shadow: 0 0 0 0 rgba(184, 131, 42, 0.5); } 80%, 100% { box-shadow: 0 0 0 8px rgba(184, 131, 42, 0); } }

        .md-prog-units { list-style: none; margin: 1.1rem 0 0; padding: 0.9rem 0 0; border-top: 1px dashed var(--duo-line, #DED4BD); display: flex; flex-direction: column; gap: 0.6rem; max-height: 15rem; overflow-y: auto; }
        .md-prog-unit { display: grid; grid-template-columns: minmax(5rem, 11rem) 1fr auto; align-items: center; gap: 0.7rem; padding: 0.25rem 0.45rem; border-radius: 0.7rem; }
        .md-prog-unit.is-current { background: color-mix(in srgb, var(--u) 9%, transparent); }
        .md-prog-unit-name { font-size: 0.82rem; font-weight: 800; color: #2D3A36; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .md-prog-unit.is-done .md-prog-unit-name { color: var(--u); }
        .md-prog-unit-bar { height: 0.55rem; border-radius: 999px; background: color-mix(in srgb, var(--u) 16%, transparent); overflow: hidden; }
        .md-prog-unit-bar i { display: block; height: 100%; border-radius: 999px; background: var(--u); transition: width 0.6s ease; }
        .md-prog-unit-count { font-size: 0.74rem; font-weight: 800; color: #6B7A75; min-width: 2.2rem; text-align: left; }
        @media (max-width: 520px) {
          .md-prog-top { flex-direction: column; align-items: flex-start; }
          .md-prog-unit { grid-template-columns: 1fr auto; }
          .md-prog-unit-bar { grid-column: 1 / -1; order: 3; }
        }

        .md-recent-title { margin: 0 0 0.7rem; font-size: 0.95rem; font-weight: 900; color: #0E5348; }
        .md-recent-grid { display: grid; grid-template-columns: 1fr; gap: 0.7rem; }
        .md-recent-card {
          display: flex; align-items: center; gap: 0.7rem; padding: 0.75rem 0.9rem; text-align: right; cursor: pointer;
          background: #fff; border: 1px solid var(--duo-line, #DED4BD); border-inline-start: 4px solid var(--u, #147A6A); border-radius: 1rem;
          box-shadow: 0 10px 24px -20px rgba(14, 83, 72, 0.4);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }
        .md-recent-card:hover { transform: translateY(-2px); box-shadow: 0 16px 28px -20px rgba(14, 83, 72, 0.5); }
        .md-recent-ico { flex: none; width: 2.2rem; height: 2.2rem; border-radius: 0.7rem; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--u) 14%, #fff); }
        .md-recent-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
        .md-recent-text b { font-size: 0.86rem; font-weight: 850; color: #2D3A36; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .md-recent-text small { font-size: 0.72rem; font-weight: 700; color: #6B7A75; }
        .md-recent-go { flex: none; font-size: 1.2rem; font-weight: 800; color: var(--u, #147A6A); }

        .md-platform.is-dark .md-dash-card, html[data-theme="dark"] .md-dash-card { background: #192723; border-color: #30423B; color: #EAF1ED; }
        .md-platform.is-dark .md-dash-card-title, html[data-theme="dark"] .md-dash-card-title,
        .md-platform.is-dark .md-recent-title, html[data-theme="dark"] .md-recent-title { color: #B5DDD2; }
        .md-platform.is-dark .md-dash-card-ico, html[data-theme="dark"] .md-dash-card-ico { background: #203029; }
        .md-platform.is-dark .md-ring, html[data-theme="dark"] .md-ring { color: #B5DDD2; }
        .md-platform.is-dark .md-ring-label b, html[data-theme="dark"] .md-ring-label b { color: #EAF1ED; }
        .md-platform.is-dark .md-prog-big, .md-platform.is-dark .md-prog-cap, .md-platform.is-dark .md-prog-unit-name,
        html[data-theme="dark"] .md-prog-big, html[data-theme="dark"] .md-prog-cap, html[data-theme="dark"] .md-prog-unit-name { color: #CBD8D2; }
        .md-platform.is-dark .md-prog-big b, html[data-theme="dark"] .md-prog-big b { color: #3A9C89; }
        .md-platform.is-dark .md-prog-now, html[data-theme="dark"] .md-prog-now { background: rgba(227, 192, 139, 0.14); color: #E3C08B; }
        .md-platform.is-dark .md-prog-now b, html[data-theme="dark"] .md-prog-now b { color: #F3DDB6; }
        .md-platform.is-dark .md-prog-units, html[data-theme="dark"] .md-prog-units { border-top-color: #30423B; }
        .md-platform.is-dark .md-recent-card, html[data-theme="dark"] .md-recent-card { background: #192723; border-color: #30423B; }
        .md-platform.is-dark .md-recent-text b, html[data-theme="dark"] .md-recent-text b { color: #EAF1ED; }
        .md-platform.is-dark .md-recent-ico, html[data-theme="dark"] .md-recent-ico { background: #203029; }
        .md-platform.is-dark .md-dash-empty, .md-platform.is-dark .md-dash-note, .md-platform.is-dark .md-prog-unit-count,
        html[data-theme="dark"] .md-dash-empty, html[data-theme="dark"] .md-dash-note, html[data-theme="dark"] .md-prog-unit-count { color: #A5B7AF; }
        @media (prefers-reduced-motion: reduce) {
          .md-resume, .md-resume-go, .md-ring-arc, .md-prog-unit-bar i, .md-recent-card { transition: none !important; }
          .md-prog-now-dot { animation: none !important; }
        }

        /* —— Drawer + trigger: dark —— */
        .md-platform.is-dark .md-org-trigger, html[data-theme="dark"] .md-org-trigger { background: #192723; border-color: #30423B; color: #B5DDD2; box-shadow: none; }
        .md-platform.is-dark .md-org-trigger:hover, html[data-theme="dark"] .md-org-trigger:hover { background: #203029; color: #9ED8CB; }
        .md-platform.is-dark .md-sb, html[data-theme="dark"] .md-sb { background: #15201c; border-left-color: #30423B; color: #EAF1ED; box-shadow: -18px 0 48px -18px rgba(0, 0, 0, 0.7); }
        .md-platform.is-dark .md-sb-head, .md-platform.is-dark .md-sb-foot, html[data-theme="dark"] .md-sb-head, html[data-theme="dark"] .md-sb-foot { background: #192723; border-color: #30423B; }
        .md-platform.is-dark .md-sb-close, html[data-theme="dark"] .md-sb-close { background: #243530; color: #B5DDD2; }
        .md-platform.is-dark .md-sb-me, html[data-theme="dark"] .md-sb-me { background: linear-gradient(125deg, #0A3F36, #0E5348 80%); }
        .md-platform.is-dark .md-sb-h, html[data-theme="dark"] .md-sb-h { color: #8FA39A; }
        .md-platform.is-dark .md-sb-seg, html[data-theme="dark"] .md-sb-seg { background: #1E2C28; }
        .md-platform.is-dark .md-sb-seg-btn, html[data-theme="dark"] .md-sb-seg-btn { color: #CBD8D2; }
        .md-platform.is-dark .md-sb-seg-btn.is-on, html[data-theme="dark"] .md-sb-seg-btn.is-on { background: #3A9C89; color: #0A3F36; }
        .md-platform.is-dark .md-sb-unit:hover, .md-platform.is-dark .md-sb-link:hover, .md-platform.is-dark .md-sb-switch:hover,
        html[data-theme="dark"] .md-sb-unit:hover, html[data-theme="dark"] .md-sb-link:hover, html[data-theme="dark"] .md-sb-switch:hover { background: rgba(58, 156, 137, 0.14); }
        .md-platform.is-dark .md-sb-unit.is-on, html[data-theme="dark"] .md-sb-unit.is-on { background: color-mix(in srgb, var(--u) 18%, #15201c); }
        .md-platform.is-dark .md-sb-unit-num, html[data-theme="dark"] .md-sb-unit-num { background: color-mix(in srgb, var(--u) 22%, #15201c); }
        .md-platform.is-dark .md-sb-unit-body b, .md-platform.is-dark .md-sb-link, .md-platform.is-dark .md-sb-switch,
        html[data-theme="dark"] .md-sb-unit-body b, html[data-theme="dark"] .md-sb-link, html[data-theme="dark"] .md-sb-switch { color: #EAF1ED; }
        .md-platform.is-dark .md-sb-link.is-active, html[data-theme="dark"] .md-sb-link.is-active { background: rgba(58, 156, 137, 0.22); color: #9ED8CB; }
        .md-platform.is-dark .md-sb-link-ico, html[data-theme="dark"] .md-sb-link-ico { background: #243530; }
        .md-platform.is-dark .md-sb-link.is-active .md-sb-link-ico, html[data-theme="dark"] .md-sb-link.is-active .md-sb-link-ico { background: #3A9C89; }
        .md-platform.is-dark .md-sb-unit-count, .md-platform.is-dark .md-sb-switch-text small, html[data-theme="dark"] .md-sb-unit-count, html[data-theme="dark"] .md-sb-switch-text small { color: #A5B7AF; }
        .md-platform.is-dark .md-sb-knob, html[data-theme="dark"] .md-sb-knob { background: #44584F; }
        .md-platform.is-dark .md-sb-knob.is-on, html[data-theme="dark"] .md-sb-knob.is-on { background: #3A9C89; }
        .md-platform.is-dark .md-sb-login, html[data-theme="dark"] .md-sb-login { background: rgba(227, 192, 139, 0.1); border-color: #8A6D1C; }
        .md-platform.is-dark .md-sb-login p, html[data-theme="dark"] .md-sb-login p { color: #E3C08B; }
        .md-platform.is-dark .md-sb-login button, html[data-theme="dark"] .md-sb-login button { background: #3A9C89; color: #0A3F36; box-shadow: 0 4px 0 #2A7A6B; }
        .md-platform.is-dark .md-sb-legal a, html[data-theme="dark"] .md-sb-legal a { color: #8FA39A; }
        .md-platform.is-dark .md-sb-backdrop, html[data-theme="dark"] .md-sb-backdrop { background: rgba(0, 0, 0, 0.6); }

      `}</style>
    </div>
  );
}