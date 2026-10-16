import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { listPublishedLessons, listMyProgress, getStudentGradeMeta, saveStudentGradeMeta } from "../lib/db";
import { useAuth } from "../lib/hooks";
import Footer from "../components/Footer";
import AuthModal, { GuestWelcomeBanner } from "../components/AuthModal";
import StudentAccountMenu from "../components/StudentAccountMenu";
import { DidYouKnowCard, DYK_AUTH_COPY } from "../components/DidYouKnow";
import { SAVED_AUTH_COPY } from "../components/SavedLessons";
import { useSavedLessonIds } from "../lib/useSavedLessons";
import { useCurriculumRank, orderByCurriculum } from "../lib/curriculumOrder";
import { countScenes } from "../lib/studentSpace";
import {
  arabicLessonOrdinal,
  lessonPath,
  isLessonComingSoon,
  sortLessonsForSequence,
  buildLessonLockStates,
  readGuestGradeLocal,
  writeGuestGradeLocal,
} from "./student-platform/helpers";
import { gradeArtKind, PickArt } from "./student-platform/uiParts";

/* ============================================================================
   "فصلي" — the student's own space.
   The grade is part of the student's identity: asked ONCE (saved in the account, or on this
   device for guests), after that /student opens straight into that grade's space:
   continue card → units → lessons. No filters, no banners. All data/logic is the same as before
   (lessons, progress, lock states, saved lessons, grade metadata) — only the experience changed.
============================================================================ */

const SUBJECT_NAME = "الدراسات الاجتماعية";
const TERM_KEY = "madar_space_term_v1";
const REVIEW_AFTER_DAYS = 7; // "للمراجعة": lessons finished at least this many days ago

const gradeTitle = (grade, stage) => {
  const g = String(grade || "").trim();
  const s = String(stage || "").trim();
  const base = /^الصف/.test(g) ? g : `الصف ${g}`;
  return s && !g.includes(s) ? `${base} ${s}` : base;
};
const unitTitle = (subject, i) => (/^الوحدة/.test(subject) ? subject : `الوحدة ${arabicLessonOrdinal(i)} · ${subject}`);
const lessonRowTitle = (title, i) => (/^الدرس/.test(title) ? title : `الدرس ${arabicLessonOrdinal(i)} · ${title}`);

function readTermChoice(key) {
  try {
    return (JSON.parse(localStorage.getItem(TERM_KEY) || "{}") || {})[key] || "";
  } catch {
    return "";
  }
}
function writeTermChoice(key, term) {
  try {
    const all = JSON.parse(localStorage.getItem(TERM_KEY) || "{}") || {};
    all[key] = term;
    localStorage.setItem(TERM_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

const MARKS = { COMPLETED: "✓", CURRENT: "●", COMING_SOON: "⏳", ACCESS_LOCK: "🔐", SEQUENCE_LOCK: "🔒" };
const HINTS = { COMING_SOON: "قريبًا", ACCESS_LOCK: "يتطلب تسجيل الدخول", SEQUENCE_LOCK: "أكمل الدرس السابق أولًا" };

const SPACE_CSS = `
  .sp { --sp-bg: #FBFAF7; --sp-line: #E4E2DC; --sp-ink: #1C2430; --sp-soft: #4B5563; --sp-muted: #6B7280;
        --sp-accent: #1D5BA8; --sp-accent-d: #154A8C; --sp-accent-soft: #DCEBFB; --sp-accent-line: #8DB6EA;
        --sp-ok: #2F8F55; --sp-ok-soft: #D3EDDB; --sp-tile: #F3F2EC;
        min-height: 100vh; display: flex; flex-direction: column; background: var(--sp-bg); color: var(--sp-ink);
        font-family: var(--duo-font-body, "Cairo", "Tajawal", system-ui, sans-serif); }
  .sp button { font-family: inherit; }
  .sp-top { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px clamp(16px, 4vw, 40px); background: #FFFFFF; border-bottom: 1px solid var(--sp-line); }
  .sp-brand { display: inline-flex; align-items: center; gap: 10px; padding: 0; border: 0; background: transparent; color: var(--sp-ink); font-size: 1.3rem; font-weight: 800; cursor: pointer; }
  .sp-brand img { height: 34px; width: auto; }
  .sp-login { padding: 8px 18px; border-radius: 12px; border: 1.5px solid var(--sp-accent); background: transparent; color: var(--sp-accent); font-weight: 800; font-size: 0.88rem; cursor: pointer; }
  .sp-login:hover { background: var(--sp-accent-soft); }

  .sp-main { width: 100%; max-width: 1080px; margin: 0 auto; padding: 30px clamp(16px, 4vw, 40px) 60px; flex: 1; }
  .sp-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 22px; }
  .sp-subject { margin: 0; color: var(--sp-muted); font-size: 0.95rem; font-weight: 700; }
  .sp-title { margin: 4px 0 0; font-size: clamp(1.6rem, 4.6vw, 2.4rem); font-weight: 800; line-height: 1.45; }
  .sp-term { position: relative; }
  .sp-term-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 12px; border: 1px solid var(--sp-line); background: #FFFFFF; color: var(--sp-soft); font-size: 0.9rem; font-weight: 700; cursor: pointer; }
  .sp-term-btn[disabled] { cursor: default; }
  .sp-term-menu { position: absolute; top: calc(100% + 6px); inset-inline-start: 0; z-index: 25; min-width: 170px; padding: 6px; border-radius: 14px; background: #FFFFFF; border: 1px solid var(--sp-line); box-shadow: 0 10px 28px rgba(28, 36, 48, 0.12); }
  .sp-term-menu button { display: block; width: 100%; padding: 9px 12px; border: 0; border-radius: 10px; background: transparent; text-align: right; font-weight: 700; color: var(--sp-soft); cursor: pointer; }
  .sp-term-menu button:hover { background: var(--sp-tile); }
  .sp-term-menu button[aria-current="true"] { background: var(--sp-accent-soft); color: var(--sp-accent-d); }

  .sp-grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; grid-template-areas: "cont side" "units side"; gap: 22px 28px; align-items: start; }
  .sp-cont { grid-area: cont; }
  .sp-side { grid-area: side; display: flex; flex-direction: column; gap: 12px; }
  .sp-units-col { grid-area: units; }

  .sp-continue { padding: 22px 24px; border-radius: 22px; background: #FFFFFF; border: 1.5px solid var(--sp-accent-line); }
  .sp-continue.is-done { border-color: var(--sp-ok-soft); background: #F6FBF7; }
  .sp-kicker { margin: 0 0 6px; color: var(--sp-accent); font-size: 0.92rem; font-weight: 800; }
  .sp-continue.is-done .sp-kicker { color: var(--sp-ok); }
  .sp-c-title { margin: 0; font-size: clamp(1.15rem, 3vw, 1.5rem); font-weight: 800; line-height: 1.5; }
  .sp-c-meta { margin: 4px 0 0; color: var(--sp-muted); font-size: 0.92rem; font-weight: 600; }
  .sp-c-row { display: flex; align-items: center; gap: 18px; margin-top: 18px; flex-wrap: wrap; }
  .sp-bar { flex: 1 1 160px; height: 9px; border-radius: 99px; background: #ECEAE3; overflow: hidden; }
  .sp-bar i { display: block; height: 100%; border-radius: 99px; background: var(--sp-accent-d); }
  .sp-btn { padding: 10px 28px; border-radius: 12px; border: 0; background: var(--sp-accent); color: #FFFFFF; font-size: 0.98rem; font-weight: 800; cursor: pointer; transition: background-color 0.15s ease, transform 0.12s ease; }
  .sp-btn:hover { background: var(--sp-accent-d); }
  .sp-btn:active { transform: translateY(1px); }

  .sp-stat { display: block; width: 100%; padding: 14px 18px; border: 0; border-radius: 16px; background: var(--sp-tile); text-align: right; color: var(--sp-ink); cursor: pointer; transition: background-color 0.15s ease; }
  .sp-stat:hover { background: #ECEBE3; }
  .sp-stat[disabled] { cursor: default; }
  .sp-stat small { display: block; color: var(--sp-muted); font-size: 0.85rem; font-weight: 700; }
  .sp-stat b { display: block; margin-top: 2px; font-size: 1.55rem; font-weight: 800; line-height: 1.4; }
  .sp-stat b.is-text { font-size: 1rem; line-height: 1.6; }
  .sp-stat .lock { font-size: 0.85rem; font-weight: 700; color: var(--sp-muted); }

  .sp-unit { margin-top: 10px; border-radius: 20px; border: 1px solid transparent; transition: background-color 0.15s ease, border-color 0.15s ease; }
  .sp-unit.open { background: #FFFFFF; border-color: var(--sp-line); }
  .sp-unit-head { display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px; border: 0; background: transparent; text-align: right; color: var(--sp-ink); cursor: pointer; border-radius: 20px; }
  .sp-unit-head:hover { background: rgba(0, 0, 0, 0.025); }
  .sp-mark { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid var(--sp-line); color: var(--sp-muted); font-weight: 800; font-size: 0.95rem; background: #FFFFFF; }
  .sp-unit[data-status="current"] .sp-mark { background: var(--sp-accent-soft); border-color: var(--sp-accent-soft); color: var(--sp-accent-d); }
  .sp-unit[data-status="done"] .sp-mark { background: var(--sp-ok-soft); border-color: var(--sp-ok-soft); color: var(--sp-ok); }
  .sp-unit-name { flex: 1; min-width: 0; font-size: 1.05rem; font-weight: 800; }
  .sp-unit[data-status="todo"] .sp-unit-name { color: var(--sp-soft); font-weight: 700; }
  .sp-unit-count { color: var(--sp-muted); font-size: 0.9rem; font-weight: 700; }
  .sp-lessons { list-style: none; margin: 0; padding: 0 10px 12px; }
  .sp-lesson { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 14px; border: 0; border-radius: 12px; background: transparent; text-align: right; color: var(--sp-soft); font-size: 0.98rem; font-weight: 600; cursor: pointer; }
  .sp-lesson:hover:not([disabled]) { background: var(--sp-tile); }
  .sp-lesson-mark { flex: none; width: 22px; text-align: center; font-weight: 800; }
  .sp-lesson[data-kind="COMPLETED"] .sp-lesson-mark { color: var(--sp-ok); }
  .sp-lesson[data-kind="CURRENT"] .sp-lesson-mark { color: var(--sp-accent); font-size: 0.8rem; }
  .sp-lesson[data-target="true"] { background: var(--sp-accent-soft); color: var(--sp-accent-d); font-weight: 800; }
  .sp-lesson[data-target="true"]:hover:not([disabled]) { background: #CFE3F8; }
  .sp-lesson[disabled] { cursor: not-allowed; opacity: 0.6; }
  .sp-lesson-name { flex: 1; min-width: 0; }
  .sp-lesson small { flex: none; color: var(--sp-muted); font-size: 0.78rem; font-weight: 700; }
  .sp-empty { padding: 28px 20px; border-radius: 20px; border: 1.5px dashed var(--sp-line); background: #FFFFFF; text-align: center; color: var(--sp-muted); font-weight: 700; }
  .sp-skel { border-radius: 20px; background: linear-gradient(90deg, #EFEDE6 25%, #F7F6F1 50%, #EFEDE6 75%); background-size: 220% 100%; animation: sp-shimmer 1.4s linear infinite; }
  @keyframes sp-shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }

  .sp-onb { flex: 1; display: flex; align-items: center; justify-content: center; padding: 28px 16px 48px; }
  .sp-onb-card { width: 100%; max-width: 780px; padding: clamp(22px, 4vw, 42px); border-radius: 28px; background: #FFFFFF; border: 1px solid var(--sp-line); }
  .sp-onb-card h1 { margin: 0 0 6px; text-align: center; font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; }
  .sp-onb-card > p { margin: 0 0 22px; text-align: center; color: var(--sp-muted); font-weight: 600; line-height: 1.8; }
  .sp-onb-stage { margin: 18px 0 10px; color: var(--sp-muted); font-size: 0.95rem; font-weight: 800; }
  .sp-onb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
  .sp-onb-grade { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 12px 16px; border-radius: 20px; border: 1.5px solid var(--sp-line); background: #FFFFFF; color: var(--sp-ink); cursor: pointer; transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.12s ease; }
  .sp-onb-grade:hover:not([disabled]) { border-color: var(--sp-accent-line); background: #F5F9FE; }
  .sp-onb-grade:active:not([disabled]) { transform: translateY(1px); }
  .sp-onb-grade[disabled] { opacity: 0.6; cursor: wait; }
  .sp-onb-art { display: flex; align-items: center; justify-content: center; width: 100%; max-width: 120px; aspect-ratio: 1 / 0.95; border-radius: 16px; background: var(--sp-tile); }
  .sp-onb-art .md-art { width: 92%; height: 92%; }
  .sp-onb-name { font-size: 1.05rem; font-weight: 800; text-align: center; }
  .sp-onb-note { margin: 14px 0 0; text-align: center; font-weight: 700; }
  .sp-onb-note.err { color: #B3261E; }
  .sp-onb-cancel { display: block; margin: 18px auto 0; padding: 8px 20px; border-radius: 12px; border: 1px solid var(--sp-line); background: #FFFFFF; color: var(--sp-soft); font-weight: 700; cursor: pointer; }

  @media (max-width: 860px) {
    .sp-grid { grid-template-columns: minmax(0, 1fr); grid-template-areas: "cont" "side" "units"; }
    .sp-side { flex-direction: row; gap: 10px; overflow-x: auto; padding-bottom: 2px; }
    .sp-side .sp-stat { flex: 1 0 140px; }
    .sp-continue { padding: 18px; }
  }
  @media (prefers-reduced-motion: reduce) { .sp-skel { animation: none; } .sp-btn, .sp-stat, .sp-onb-grade { transition: none; } }
`;

export default function StudentSpace() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuth();
  const isGuest = !session;

  const [lessons, setLessons] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [myProgress, setMyProgress] = useState([]);
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [gradeReady, setGradeReady] = useState(false);
  const [pickingGrade, setPickingGrade] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [term, setTerm] = useState("");
  const [termMenu, setTermMenu] = useState(false);
  const [openUnits, setOpenUnits] = useState({});
  const [authOpen, setAuthOpen] = useState(false);
  const [authCtx, setAuthCtx] = useState(null);
  const [sceneTotal, setSceneTotal] = useState(null);
  const curRank = useCurriculumRank();
  const { ids: savedIds } = useSavedLessonIds(session);

  const openAuthFor = (ctx) => {
    setAuthCtx(ctx || null);
    setAuthOpen(true);
  };

  /* ----------------------------- data ----------------------------- */
  useEffect(() => {
    setLoadError("");
    listPublishedLessons()
      .then(setLessons)
      .catch(() => setLoadError("تعذر تحميل الدروس. تحقق من الاتصال وحاول مرة أخرى."));
  }, [attempt]);

  // grade identity: account → saved in the account, guest → saved on this device
  useEffect(() => {
    let cancelled = false;
    async function loadGrade() {
      setGradeReady(false);
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
          if (!cancelled) setGradeReady(true);
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
        setGradeReady(true);
      }
    }
    loadGrade();
    return () => {
      cancelled = true;
    };
  }, [session]);

  // arrived from another page's account menu ("تغيير الصف الدراسي")
  useEffect(() => {
    if (!gradeReady || !session || !location.state?.changeGrade) return;
    setPickingGrade(true);
    setSaveError("");
    navigate(location.pathname, { replace: true, state: null });
  }, [gradeReady, session, location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (session === undefined) return undefined;
    if (!session) {
      setMyProgress([]);
      return undefined;
    }
    let cancelled = false;
    listMyProgress()
      .then((rows) => !cancelled && setMyProgress(Array.isArray(rows) ? rows : []))
      .catch(() => !cancelled && setMyProgress([]));
    return () => {
      cancelled = true;
    };
  }, [session === undefined, session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function chooseGrade(stage, grade) {
    setSaveError("");
    setSaving(true);
    try {
      if (session) await saveStudentGradeMeta(stage || null, grade);
      else writeGuestGradeLocal(stage || null, grade);
      setSelectedStage(stage || "");
      setSelectedGrade(grade);
      setTerm("");
      setOpenUnits({});
      setPickingGrade(false);
    } catch (err) {
      console.warn("chooseGrade:", err);
      setSaveError("تعذر حفظ الصف. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelPick() {
    setSaveError("");
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
      }
    }
  }

  /* --------------------------- derived data --------------------------- */
  const gradeLessons = useMemo(() => {
    if (!lessons || !selectedGrade) return [];
    return lessons.filter((l) => l.grade === selectedGrade && (!selectedStage || l.stage === selectedStage));
  }, [lessons, selectedStage, selectedGrade]);

  // a saved grade that no longer has lessons (renamed / removed) → ask again instead of showing an empty space
  const gradeGone = !!lessons && !!selectedGrade && gradeLessons.length === 0;
  const showOnboarding = gradeReady && !!lessons && (pickingGrade || !selectedGrade || gradeGone);

  const gradeGroups = useMemo(() => {
    if (!lessons) return [];
    const byStage = new Map();
    for (const l of lessons) {
      if (!l.grade) continue;
      const st = l.stage || "";
      if (!byStage.has(st)) byStage.set(st, new Set());
      byStage.get(st).add(l.grade);
    }
    const stages = orderByCurriculum(Array.from(byStage.keys()).filter(Boolean), "stage", curRank);
    const ordered = byStage.has("") ? [...stages, ""] : stages;
    return ordered.map((st) => ({ stage: st, grades: orderByCurriculum(Array.from(byStage.get(st)), "grade", curRank, { stage: st }) }));
  }, [lessons, curRank]);

  const terms = useMemo(() => {
    const stageCtx = selectedStage || gradeLessons[0]?.stage || "";
    return orderByCurriculum(Array.from(new Set(gradeLessons.map((l) => l.term).filter(Boolean))), "term", curRank, { stage: stageCtx, grade: selectedGrade });
  }, [gradeLessons, selectedStage, selectedGrade, curRank]);

  const completedIds = useMemo(() => new Set(myProgress.filter((p) => p.lessonCompleted).map((p) => String(p.lessonId))), [myProgress]);
  const progressByLesson = useMemo(() => new Map(myProgress.map((p) => [String(p.lessonId), p])), [myProgress]);

  // where the student stopped last (most recently updated progress row that belongs to this grade)
  const resume = useMemo(() => {
    for (const p of myProgress) {
      const l = gradeLessons.find((x) => String(x.id) === String(p.lessonId));
      if (l && !isLessonComingSoon(l) && !p.lessonCompleted) return { lesson: l, progress: p };
    }
    return null;
  }, [myProgress, gradeLessons]);

  // the term to show: the one the student was last in → the one they chose before → the first
  useEffect(() => {
    if (!terms.length) {
      if (term) setTerm("");
      return;
    }
    if (term && terms.includes(term)) return;
    const key = `${selectedStage}|${selectedGrade}`;
    const remembered = readTermChoice(key);
    const resumeTerm = resume?.lesson?.term;
    setTerm(
      (resumeTerm && terms.includes(resumeTerm) && resumeTerm) ||
        (remembered && terms.includes(remembered) && remembered) ||
        terms[0]
    );
  }, [terms, term, resume, selectedStage, selectedGrade]);

  const termLessons = useMemo(() => (term ? gradeLessons.filter((l) => l.term === term) : []), [gradeLessons, term]);

  const units = useMemo(() => {
    const firstSeen = new Map();
    for (const l of termLessons) {
      if (!l.subject) continue;
      const created = String(l.createdAt || l.created_at || l.updatedAt || l.updated_at || "");
      const cur = firstSeen.get(l.subject);
      if (!cur) firstSeen.set(l.subject, { created });
      else if (created && (!cur.created || created < cur.created)) cur.created = created;
    }
    const byAdded = Array.from(firstSeen.keys()).sort((a, b) => {
      const A = firstSeen.get(a);
      const B = firstSeen.get(b);
      if (A.created !== B.created) return A.created.localeCompare(B.created);
      return a.localeCompare(b, "ar");
    });
    const stageCtx = selectedStage || termLessons[0]?.stage || "";
    return orderByCurriculum(byAdded, "subject", curRank, { stage: stageCtx, grade: selectedGrade, term });
  }, [termLessons, selectedStage, selectedGrade, term, curRank]);

  const unitModels = useMemo(
    () =>
      units.map((name, index) => {
        const own = sortLessonsForSequence(termLessons.filter((l) => l.subject === name));
        const items = buildLessonLockStates(own, completedIds, isGuest);
        const real = items.filter((x) => x.kind !== "COMING_SOON");
        const done = real.filter((x) => x.kind === "COMPLETED").length;
        return { name, index, items, total: real.length, done };
      }),
    [units, termLessons, completedIds, isGuest]
  );

  // the one lesson the space points at: resume → otherwise the next open lesson, in unit order
  const target = useMemo(() => {
    if (resume && termLessons.some((l) => String(l.id) === String(resume.lesson.id))) return { kind: "resume", lesson: resume.lesson, progress: resume.progress };
    for (const u of unitModels) {
      const it = u.items.find((x) => x.kind === "CURRENT");
      if (it) return { kind: myProgress.length ? "next" : "start", lesson: it.lesson, progress: null };
    }
    return null;
  }, [resume, termLessons, unitModels, myProgress.length]);

  const allDone = unitModels.length > 0 && unitModels.every((u) => u.total === 0 || u.done === u.total) && !target;

  // «المشهد 3 من 5»
  useEffect(() => {
    setSceneTotal(null);
    if (target?.kind !== "resume") return undefined;
    let cancelled = false;
    countScenes(target.lesson.id)
      .then((n) => !cancelled && setSceneTotal(n))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [target?.lesson?.id, target?.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const reviewDue = useMemo(() => {
    const cutoff = Date.now() - REVIEW_AFTER_DAYS * 86400000;
    return gradeLessons
      .map((l) => ({ l, p: progressByLesson.get(String(l.id)) }))
      .filter(({ l, p }) => p?.lessonCompleted && p.completedAt && new Date(p.completedAt).getTime() <= cutoff && !isLessonComingSoon(l))
      .sort((a, b) => new Date(a.p.completedAt) - new Date(b.p.completedAt))
      .map((x) => x.l);
  }, [gradeLessons, progressByLesson]);

  const latestLesson = useMemo(() => {
    const open = gradeLessons.filter((l) => !isLessonComingSoon(l));
    return open.reduce((best, l) => (!best || String(l.updatedAt || "") > String(best.updatedAt || "") ? l : best), null);
  }, [gradeLessons]);

  const savedCount = useMemo(() => {
    if (!savedIds || !lessons) return null;
    const ids = new Set(lessons.map((l) => String(l.id)));
    return savedIds.filter((id) => ids.has(String(id))).length;
  }, [savedIds, lessons]);

  const studentName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email?.split("@")[0] ||
    "حسابي";

  /* ----------------------------- actions ----------------------------- */
  const open = (lesson) => navigate(lessonPath(lesson));
  const onLessonClick = (item) => {
    if (item.kind === "ACCESS_LOCK") return openAuthFor({ title: "سجّل دخولك لفتح هذا الدرس", subtitle: "هذا الدرس متاح للمسجّلين فقط، والتسجيل مجاني." });
    if (item.kind === "SEQUENCE_LOCK" || item.kind === "COMING_SOON") return;
    open(item.lesson);
  };
  const toggleUnit = (name, current) => setOpenUnits((m) => ({ ...m, [name]: !current }));
  const chooseTerm = (t) => {
    setTerm(t);
    setTermMenu(false);
    writeTermChoice(`${selectedStage}|${selectedGrade}`, t);
  };
  const defaultOpenUnit = useMemo(() => {
    if (target) return unitModels.find((u) => u.items.some((x) => String(x.lesson.id) === String(target.lesson.id)))?.name;
    return unitModels.find((u) => u.total > 0 && u.done < u.total)?.name;
  }, [unitModels, target]);

  /* ------------------------------ render ------------------------------ */
  const topbar = (
    <header className="sp-top">
      <button type="button" className="sp-brand" onClick={() => navigate("/student")} aria-label="مَدَار — الرئيسية">
        <img src="/photo/IevsR.png" alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
        <span>مَدَار</span>
      </button>
      {session === undefined ? null : session ? (
        <StudentAccountMenu session={session} name={studentName} stage={selectedStage} grade={selectedGrade} onChangeGrade={() => { setPickingGrade(true); setSaveError(""); }} />
      ) : (
        <button type="button" className="sp-login" onClick={() => openAuthFor(null)}>تسجيل الدخول</button>
      )}
    </header>
  );

  let body;
  if (loadError && !lessons) {
    body = (
      <main className="sp-main">
        <div className="sp-empty">
          {loadError}
          <div style={{ marginTop: 14 }}><button type="button" className="sp-btn" onClick={() => setAttempt((n) => n + 1)}>إعادة المحاولة</button></div>
        </div>
      </main>
    );
  } else if (!lessons || !gradeReady) {
    body = (
      <main className="sp-main" aria-busy="true">
        <div className="sp-skel" style={{ height: 60, width: 280, marginBottom: 22 }} />
        <div className="sp-skel" style={{ height: 150, marginBottom: 16 }} />
        <div className="sp-skel" style={{ height: 70, marginBottom: 10 }} />
        <div className="sp-skel" style={{ height: 70 }} />
      </main>
    );
  } else if (lessons.length === 0) {
    body = (
      <main className="sp-main"><div className="sp-empty">لا توجد دروس منشورة بعد. عُد قريبًا.</div></main>
    );
  } else if (showOnboarding) {
    body = (
      <main className="sp-onb">
        <div className="sp-onb-card">
          <h1>ما صفك الدراسي؟</h1>
          <p>
            {gradeGone ? "تم تحديث الصفوف على المنصة، اختر صفك مرة أخرى." : "اختره مرة واحدة فقط."}{" "}
            سنحفظه {session ? "في حسابك" : "على هذا الجهاز"} وتدخل بعدها مباشرة إلى فصلك.
          </p>
          {gradeGroups.map((g) => (
            <div key={g.stage || "none"}>
              {gradeGroups.length > 1 && g.stage ? <h2 className="sp-onb-stage">{g.stage}</h2> : null}
              <div className="sp-onb-grid">
                {g.grades.map((grade) => (
                  <button key={grade} type="button" className="sp-onb-grade" disabled={saving} onClick={() => chooseGrade(g.stage, grade)}>
                    <span className="sp-onb-art"><PickArt kind={gradeArtKind(grade, g.stage)} /></span>
                    <span className="sp-onb-name">{gradeTitle(grade, g.stage)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {saving ? <p className="sp-onb-note" style={{ color: "var(--sp-muted)" }}>جاري الحفظ...</p> : null}
          {saveError ? <p className="sp-onb-note err">{saveError}</p> : null}
          {selectedGrade && !gradeGone ? <button type="button" className="sp-onb-cancel" disabled={saving} onClick={cancelPick}>إلغاء والبقاء في {gradeTitle(selectedGrade, selectedStage)}</button> : null}
        </div>
      </main>
    );
  } else {
    const resumeTotal = target?.kind === "resume" ? sceneTotal : null;
    const rp = target?.progress;
    const pct = resumeTotal ? Math.min(100, Math.round((Math.max((rp?.completedScenes || []).length, rp?.currentScene || 0) / resumeTotal) * 100)) : 0;
    const targetUnit = target ? unitModels.find((u) => u.items.some((x) => String(x.lesson.id) === String(target.lesson.id))) : null;

    body = (
      <main className="sp-main">
        <div className="sp-head">
          <div>
            <p className="sp-subject">{SUBJECT_NAME}</p>
            <h1 className="sp-title">{gradeTitle(selectedGrade, selectedStage)}</h1>
          </div>
          {terms.length > 0 && (
            <div className="sp-term">
              <button type="button" className="sp-term-btn" disabled={terms.length < 2} onClick={() => setTermMenu((v) => !v)} aria-haspopup="listbox" aria-expanded={termMenu}>
                <span>{term}</span>
                {terms.length > 1 ? <span aria-hidden="true">▾</span> : null}
              </button>
              {termMenu && terms.length > 1 && (
                <div className="sp-term-menu" role="listbox">
                  {terms.map((t) => (
                    <button key={t} type="button" role="option" aria-selected={t === term} aria-current={t === term} onClick={() => chooseTerm(t)}>{t}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sp-grid">
          <section className="sp-cont" aria-label="متابعة التعلم">
            {target ? (
              <div className="sp-continue">
                <p className="sp-kicker">{target.kind === "resume" ? "▶ كمّل من حيث وقفت" : target.kind === "next" ? "▶ الدرس التالي" : "▶ ابدأ رحلتك"}</p>
                <h2 className="sp-c-title">{target.lesson.title}</h2>
                <p className="sp-c-meta">
                  {[targetUnit ? unitTitle(targetUnit.name, targetUnit.index) : target.lesson.subject, resumeTotal ? `المشهد ${Math.min((rp?.currentScene || 0) + 1, resumeTotal)} من ${resumeTotal}` : null].filter(Boolean).join(" · ")}
                </p>
                <div className="sp-c-row">
                  {target.kind === "resume" ? <div className="sp-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div> : <div style={{ flex: 1 }} />}
                  <button type="button" className="sp-btn" onClick={() => open(target.lesson)}>{target.kind === "resume" ? "استكمل" : "ابدأ الدرس"}</button>
                </div>
              </div>
            ) : allDone ? (
              <div className="sp-continue is-done">
                <p className="sp-kicker">🎉 أنهيت كل دروس هذا الفصل</p>
                <h2 className="sp-c-title">أحسنت!</h2>
                <p className="sp-c-meta">{terms.length > 1 ? "يمكنك الانتقال إلى الفصل الآخر من الأعلى، أو مراجعة دروسك من الأسفل." : "يمكنك مراجعة أي درس من القائمة بالأسفل."}</p>
              </div>
            ) : (
              <div className="sp-empty">لا توجد دروس متاحة في هذا الفصل بعد.</div>
            )}
          </section>

          <aside className="sp-side" aria-label="ملخصك">
            <button type="button" className="sp-stat" onClick={() => (session ? navigate("/student/saved") : openAuthFor(SAVED_AUTH_COPY))}>
              <small>المحفوظات</small>
              {session ? <b>{savedCount ?? "…"}</b> : <b className="is-text lock">🔒 سجّل دخولك</b>}
            </button>
            <button
              type="button"
              className="sp-stat"
              disabled={!!session && reviewDue.length === 0}
              onClick={() => (session ? reviewDue[0] && open(reviewDue[0]) : openAuthFor({ title: "سجّل دخولك لتتابع مراجعاتك", subtitle: "نذكّرك بالدروس التي أنهيتها منذ أسبوع لتثبّت معلوماتك." }))}
              title={session ? `دروس أنهيتها منذ ${REVIEW_AFTER_DAYS} أيام أو أكثر` : undefined}
            >
              <small>للمراجعة</small>
              {session ? <b>{reviewDue.length}</b> : <b className="is-text lock">🔒 سجّل دخولك</b>}
            </button>
            <button type="button" className="sp-stat" disabled={!latestLesson} onClick={() => latestLesson && open(latestLesson)}>
              <small>أحدث درس</small>
              <b className="is-text">{latestLesson ? latestLesson.title : "—"}</b>
            </button>
          </aside>

          <section className="sp-units-col" aria-label="وحدات الفصل">
            {unitModels.length === 0 ? (
              <div className="sp-empty">لا توجد وحدات في هذا الفصل بعد.</div>
            ) : (
              unitModels.map((u) => {
                const isOpen = openUnits[u.name] !== undefined ? openUnits[u.name] : u.name === defaultOpenUnit;
                const status = u.total > 0 && u.done === u.total ? "done" : target && targetUnit?.name === u.name ? "current" : u.done > 0 ? "current" : "todo";
                return (
                  <section key={u.name} className={`sp-unit${isOpen ? " open" : ""}`} data-status={status}>
                    <button type="button" className="sp-unit-head" aria-expanded={isOpen} onClick={() => toggleUnit(u.name, isOpen)}>
                      <span className="sp-mark">{status === "done" ? "✓" : u.index + 1}</span>
                      <span className="sp-unit-name">{unitTitle(u.name, u.index)}</span>
                      <span className="sp-unit-count">{u.done} / {u.total}</span>
                    </button>
                    {isOpen && (
                      <ul className="sp-lessons">
                        {u.items.map((it, i) => {
                          const disabled = it.kind === "SEQUENCE_LOCK" || it.kind === "COMING_SOON";
                          const isTarget = !!target && String(target.lesson.id) === String(it.lesson.id);
                          return (
                            <li key={it.lesson.id}>
                              <button type="button" className="sp-lesson" data-kind={it.kind} data-target={isTarget ? "true" : "false"} disabled={disabled} onClick={() => onLessonClick(it)} title={HINTS[it.kind] || undefined}>
                                <span className="sp-lesson-mark" aria-hidden="true">{MARKS[it.kind] || "○"}</span>
                                <span className="sp-lesson-name">{lessonRowTitle(it.lesson.title, i)}</span>
                                {HINTS[it.kind] ? <small>{HINTS[it.kind]}</small> : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                );
              })
            )}
            <div style={{ marginTop: 26 }}>
              <DidYouKnowCard session={session} stage={selectedStage} grade={selectedGrade} ready={gradeReady && !showOnboarding} onRequireLogin={() => openAuthFor(DYK_AUTH_COPY)} />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <div className="sp" dir="rtl">
      <style>{SPACE_CSS}</style>
      {topbar}
      {body}
      <Footer />
      <GuestWelcomeBanner session={session} />
      <AuthModal open={authOpen} onClose={() => { setAuthOpen(false); setAuthCtx(null); }} title={authCtx?.title} subtitle={authCtx?.subtitle} />
    </div>
  );
}
