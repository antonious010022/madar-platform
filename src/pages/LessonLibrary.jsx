import { PageLoader } from "../components/DuoFx";
import TeacherThemeToggle from "../lib/teacherTheme";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreateLessonModal } from "../components/Studio";
import { statusMeta, timeAgo } from "../lib/constants";
import {
  listOwnLessons,
  createLesson,
  duplicateLesson,
  deleteLesson,
  signOutTeacher,
  importLessonBundle,
  listCurriculumNodes,
  getGradeCovers,
  saveGradeCovers,
  uploadGradeCover,
  resolveGradeCover,
  omitGradeCover,
} from "../lib/db";
import { makeDemoLesson } from "../lib/demo-data";

/* Filter levels, top → bottom. "subject" is what students see as a unit (وحدة / مادة). */
const LEVELS = [
  { kind: "stage", label: "المرحلة", none: "بدون مرحلة" },
  { kind: "grade", label: "الصف", none: "بدون صف" },
  { kind: "term", label: "الترم", none: "بدون ترم" },
  { kind: "subject", label: "الوحدة", none: "بدون قسم" },
];
const valueOf = (l, kind) => l[kind] || LEVELS.find((x) => x.kind === kind).none;

const LIB_CSS = `
  .duo-lib { min-height: calc(100vh - 41px); }
  .duo-lib-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 24px; background: #FFFFFF; border-bottom: 2px solid var(--duo-line); }
  .duo-lib-title { display: flex; align-items: center; gap: 12px; margin: 0; font-family: var(--duo-font-display); font-size: 1.3rem; font-weight: 800; color: var(--duo-ink); }
  .duo-lib-title i { display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 16px; font-style: normal; font-size: 1.4rem; background: var(--duo-green); box-shadow: 0 4px 0 var(--duo-green-d); }
  .duo-lib-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .duo-lib-mail { font-size: 0.78rem; font-weight: 700; color: var(--duo-muted); }
  .duo-lib-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 14px; border: 2px solid var(--duo-line); background: #FFFFFF; color: var(--duo-ink-soft); box-shadow: 0 4px 0 var(--duo-line); font-family: var(--duo-font-display); font-size: 0.85rem; font-weight: 800; text-decoration: none; cursor: pointer; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, background-color 0.15s ease, border-color 0.15s ease; }
  .duo-lib-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 0 var(--duo-line-d); }
  .duo-lib-btn:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 0 0 transparent; }
  .duo-lib-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .duo-lib-btn.primary { background: var(--duo-green); border-color: var(--duo-green); color: #FFFFFF; box-shadow: 0 4px 0 var(--duo-green-d); }
  .duo-lib-btn.primary:hover:not(:disabled) { box-shadow: 0 6px 0 var(--duo-green-d); }
  .duo-lib-btn.blue { color: var(--duo-blue-ink); border-color: var(--duo-blue); background: var(--duo-blue-s); box-shadow: 0 4px 0 var(--duo-blue-d); }
  .duo-lib-btn.yellow { color: var(--duo-yellow-ink); border-color: var(--duo-yellow); background: var(--duo-yellow-s); box-shadow: 0 4px 0 var(--duo-yellow-d); }
  .duo-lib-btn.pink { color: var(--duo-pink-ink); border-color: var(--duo-pink); background: var(--duo-pink-s); box-shadow: 0 4px 0 var(--duo-pink-d); }
  .duo-lib-btn.danger { color: var(--duo-red-d); }
  .duo-lib-btn.danger.solid { background: var(--duo-red); border-color: var(--duo-red); color: #FFFFFF; box-shadow: 0 4px 0 var(--duo-red-d); }
  .duo-lib-btn.small { padding: 6px 14px; font-size: 0.8rem; }

  .duo-lib-wrap { max-width: 980px; margin: 0 auto; padding: 22px 16px 70px; }
  .duo-lib-error { margin: 0 0 14px; padding: 10px 16px; border-radius: 16px; border: 2px solid var(--duo-red); background: var(--duo-red-s); color: #B3261E; font-weight: 700; }

  .duo-lib-filters { margin-bottom: 18px; padding: 16px; border-radius: 24px; background: #FFFFFF; border: 2px solid var(--duo-line); box-shadow: 0 5px 0 var(--duo-line); }
  .duo-lib-search { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
  .duo-lib-search .ts-input { flex: 1 1 220px; max-width: 420px; }
  .duo-lib-row { display: flex; align-items: flex-start; gap: 10px; margin-top: 10px; }
  .duo-lib-rowlabel { flex: none; width: 74px; padding-top: 7px; font-family: var(--duo-font-display); font-size: 0.82rem; font-weight: 800; color: var(--duo-muted); }
  .duo-lib-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .duo-lib-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 13px; border-radius: 14px; border: 2px solid var(--duo-line); background: #FFFFFF; color: var(--duo-ink-soft); box-shadow: 0 3px 0 var(--duo-line); font-family: var(--duo-font-display); font-size: 0.83rem; font-weight: 800; cursor: pointer; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, background-color 0.15s ease, border-color 0.15s ease; }
  .duo-lib-chip small { padding: 0 7px; border-radius: 999px; background: var(--duo-snow); color: var(--duo-muted); font-size: 0.72rem; font-weight: 800; }
  .duo-lib-chip:hover { transform: translateY(-1px); border-color: var(--duo-line-d); }
  .duo-lib-chip:active { transform: translateY(3px); box-shadow: 0 0 0 transparent; }
  .duo-lib-chip.on { background: var(--duo-green); border-color: var(--duo-green); color: #FFFFFF; box-shadow: 0 3px 0 var(--duo-green-d); }
  .duo-lib-chip.on small { background: rgba(255, 255, 255, 0.28); color: #FFFFFF; }
  .duo-lib-chip.status.on { background: var(--duo-blue); border-color: var(--duo-blue); box-shadow: 0 3px 0 var(--duo-blue-d); }
  .duo-lib-foot { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 2px dashed var(--duo-line); }
  .duo-lib-count { font-size: 0.85rem; font-weight: 800; color: var(--duo-ink-soft); }
  .duo-lib-count b { color: var(--duo-green-ink); }

  .duo-lib-groups { display: flex; flex-direction: column; gap: 14px; }
  .duo-lib-group { border-radius: 24px; background: #FFFFFF; border: 2px solid var(--duo-line); box-shadow: 0 5px 0 var(--duo-line); overflow: hidden; animation: duo-pop 0.45s var(--duo-spring) both; }
  .duo-lib-ghead { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; border: 0; background: transparent; text-align: right; cursor: pointer; font: inherit; color: inherit; }
  .duo-lib-ghead:hover { background: var(--duo-snow); }
  .duo-lib-gicon { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 14px; background: var(--acc); color: #FFFFFF; font-size: 1.1rem; box-shadow: 0 4px 0 var(--acc-deep); }
  .duo-lib-gtext { flex: 1; min-width: 0; }
  .duo-lib-gname { display: block; font-family: var(--duo-font-display); font-size: 1.05rem; font-weight: 800; color: var(--duo-ink); }
  .duo-lib-gpath { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 3px; }
  .duo-lib-gpath span { padding: 0 10px; border-radius: 999px; background: var(--acc-soft); color: var(--acc-ink); font-size: 0.74rem; font-weight: 800; }
  .duo-lib-gcount { flex: none; padding: 2px 12px; border-radius: 999px; background: var(--duo-yellow); color: var(--duo-yellow-ink); box-shadow: 0 3px 0 var(--duo-yellow-d); font-family: var(--duo-font-display); font-size: 0.85rem; font-weight: 800; }
  .duo-lib-caret { flex: none; color: var(--duo-muted); font-size: 1.1rem; font-weight: 800; transition: transform 0.2s var(--duo-spring); }
  .duo-lib-group.open .duo-lib-caret { transform: rotate(-90deg); }
  .duo-lib-gbody { display: flex; flex-direction: column; gap: 12px; padding: 4px 14px 16px; }

  .duo-lib-card { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 14px 16px; border-radius: 20px; background: #FFFFFF; border: 2px solid var(--duo-line); box-shadow: 0 4px 0 var(--duo-line); transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, border-color 0.15s ease; }
  .duo-lib-card:hover { transform: translateY(-2px); border-color: var(--acc); box-shadow: 0 6px 0 var(--acc); }
  .duo-lib-num { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--acc); color: #FFFFFF; box-shadow: 0 3px 0 var(--acc-deep); font-family: var(--duo-font-display); font-size: 1rem; font-weight: 800; }
  .duo-lib-main { flex: 1 1 260px; min-width: 0; }
  .duo-lib-titlerow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 3px; }
  .duo-lib-titlerow h3 { margin: 0; font-family: var(--duo-font-display); font-size: 1.02rem; font-weight: 800; color: var(--duo-ink); overflow-wrap: anywhere; }
  .duo-lib-status { padding: 1px 11px; border-radius: 999px; font-size: 0.74rem; font-weight: 800; background: var(--duo-green-s); color: var(--duo-green-ink); }
  .duo-lib-status[data-tone="plum"] { background: var(--duo-pink-s); color: var(--duo-pink-ink); }
  .duo-lib-status[data-tone="ochre"] { background: var(--duo-yellow-s); color: var(--duo-yellow-ink); }
  .duo-lib-meta { margin: 0 0 2px; font-size: 0.76rem; font-weight: 700; color: var(--duo-muted); }
  .duo-lib-desc { margin: 4px 0 0; font-size: 0.86rem; font-weight: 600; line-height: 1.7; color: var(--duo-ink-soft); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .duo-lib-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .duo-lib-empty { padding: 34px 20px; text-align: center; border-radius: 24px; background: var(--duo-snow); border: 3px dashed var(--duo-line-d); color: var(--duo-muted); font-weight: 700; }
  .duo-lib-empty p { margin: 0 0 14px; }
  .duo-lib-hint { margin: 0 0 14px; font-size: 0.86rem; font-weight: 700; color: var(--duo-ink-soft); }
  .duo-lib-grades { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
  .duo-lib-gcard { display: flex; flex-direction: column; overflow: hidden; border-radius: 24px; background: #FFFFFF; border: 2px solid var(--duo-line); box-shadow: 0 5px 0 var(--duo-line); animation: duo-pop 0.45s var(--duo-spring) both; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, border-color 0.15s ease; }
  .duo-lib-gcard:hover { transform: translateY(-2px); border-color: var(--acc); box-shadow: 0 7px 0 var(--acc); }
  .duo-lib-gcard-main { position: relative; display: flex; align-items: flex-end; min-height: 150px; padding: 0; border: 0; overflow: hidden; background: linear-gradient(145deg, var(--duo-snow), #FFFFFF); text-align: right; font: inherit; color: inherit; cursor: pointer; }
  .duo-lib-gcover { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.5; pointer-events: none; }
  .duo-lib-gcard-body { position: relative; z-index: 1; width: 100%; padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; text-shadow: 0 1px 6px rgba(255, 255, 255, 0.85); }
  .duo-lib-gcard-body b { font-family: var(--duo-font-display); font-size: 1.2rem; font-weight: 800; color: var(--duo-ink); }
  .duo-lib-gcard-body small { font-size: 0.8rem; font-weight: 800; color: var(--duo-ink-soft); }
  .duo-lib-covertools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .duo-lib-gcard .duo-lib-covertools { padding: 10px 12px; border-top: 2px dashed var(--duo-line); background: #FFFFFF; }
  .duo-lib-file { display: none; }
  .duo-lib-btn.is-busy { opacity: 0.6; cursor: progress; }

  .duo-lib-ghero { position: relative; overflow: hidden; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; min-height: 120px; margin-bottom: 18px; padding: 16px 18px; border-radius: 24px; background: linear-gradient(145deg, var(--duo-snow), #FFFFFF); border: 2px solid var(--duo-line); box-shadow: 0 5px 0 var(--duo-line); }
  .duo-lib-ghero > *:not(.duo-lib-gcover) { position: relative; z-index: 1; }
  .duo-lib-ghero-text { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; text-shadow: 0 1px 6px rgba(255, 255, 255, 0.85); }
  .duo-lib-ghero-text h2 { margin: 0; font-family: var(--duo-font-display); font-size: 1.5rem; font-weight: 800; color: var(--duo-ink); }
  .duo-lib-terms { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .duo-lib-terms-tools { display: flex; gap: 8px; margin-inline-start: auto; }
  @media (max-width: 640px) {
    .duo-lib-top { padding: 12px 14px; }
    .duo-lib-actions { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) { .duo-lib-group { animation: none !important; } .duo-lib-card, .duo-lib-chip, .duo-lib-btn, .duo-lib-caret { transition: none !important; } }
`;

/* أزرار صورة الصف: رفع / تغيير / إزالة */
function CoverTools({ grade, cover, uploading, onFile, onRemove }) {
  return (
    <div className="duo-lib-covertools" onClick={(e) => e.stopPropagation()}>
      <label className={`duo-lib-btn blue small${uploading ? " is-busy" : ""}`}>
        {uploading ? "جاري الرفع..." : cover ? "🖼 تغيير الصورة" : "🖼 إضافة صورة"}
        <input
          type="file"
          accept="image/*"
          className="duo-lib-file"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            e.target.value = "";
            if (f) onFile(grade, f);
          }}
        />
      </label>
      {cover && !uploading && (
        <button type="button" className="duo-lib-btn danger small" onClick={() => onRemove(grade)}>إزالة الصورة</button>
      )}
    </div>
  );
}

export default function LessonLibraryPage({ session }) {
  const navigate = useNavigate();
  const ownerId = session.user.id;

  const [lessons, setLessons] = useState(null);
  const [nodes, setNodes] = useState([]); // curriculum — used only to order grades/terms/units like in settings
  const [covers, setCovers] = useState({});
  const [uploadingGrade, setUploadingGrade] = useState("");
  const [gradeSel, setGradeSel] = useState(""); // الصف المفتوح حالياً ("" = شاشة اختيار الصف)
  const [termSel, setTermSel] = useState("");
  const [openMap, setOpenMap] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const data = await listOwnLessons(ownerId);
      setLessons(data);
    } catch (e) {
      setError("تعذر تحميل الدروس.");
    }
  };

  useEffect(() => {
    refresh();
    listCurriculumNodes().then((n) => setNodes(Array.isArray(n) ? n : [])).catch(() => {});
    getGradeCovers().then((c) => setCovers(c && typeof c === "object" ? c : {})).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* name → position among its siblings in the curriculum (settings order) */
  const rank = useMemo(() => {
    const r = { stage: {}, grade: {}, term: {}, subject: {} };
    const byParent = {};
    for (const n of nodes) (byParent[n.parentId || "root"] ||= []).push(n);
    for (const list of Object.values(byParent)) {
      list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      list.forEach((n, i) => {
        const cur = r[n.kind];
        if (cur && (cur[n.name] === undefined || i < cur[n.name])) cur[n.name] = i;
      });
    }
    return r;
  }, [nodes]);
  const cmp = (kind) => (a, b) => {
    const ra = rank[kind][a] ?? 1e9;
    const rb = rank[kind][b] ?? 1e9;
    return ra !== rb ? ra - rb : String(a).localeCompare(String(b), "ar");
  };

  /* كروت الصفوف: كل صف موجود في المنهج أو عليه دروس، مع عدد دروسه */
  const gradeCards = useMemo(() => {
    const m = new Map();
    nodes.filter((n) => n.kind === "grade" && n.isActive !== false).forEach((n) => { if (!m.has(n.name)) m.set(n.name, 0); });
    (lessons || []).forEach((l) => {
      const g = valueOf(l, "grade");
      m.set(g, (m.get(g) || 0) + 1);
    });
    const c = cmp("grade");
    return Array.from(m.entries()).sort((a, b) => c(a[0], b[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, nodes, rank]);

  /* داخل الصف: ترم ← وحدات ← دروس */
  const terms = useMemo(() => {
    if (!gradeSel) return [];
    const tmap = new Map();
    for (const l of lessons || []) {
      if (valueOf(l, "grade") !== gradeSel) continue;
      const t = valueOf(l, "term");
      const s = valueOf(l, "subject");
      if (!tmap.has(t)) tmap.set(t, new Map());
      const smap = tmap.get(t);
      if (!smap.has(s)) smap.set(s, []);
      smap.get(s).push(l);
    }
    const ct = cmp("term");
    const cs = cmp("subject");
    return Array.from(tmap.entries())
      .sort((a, b) => ct(a[0], b[0]))
      .map(([term, smap]) => {
        const units = Array.from(smap.entries())
          .sort((a, b) => cs(a[0], b[0]))
          .map(([subject, items]) => ({
            key: [gradeSel, term, subject].join("||"),
            subject,
            items: [...items].sort((a, b) => (a.sortOrder > 0 ? a.sortOrder : 1e9) - (b.sortOrder > 0 ? b.sortOrder : 1e9)),
          }));
        return { term, units, count: units.reduce((s, u) => s + u.items.length, 0) };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, gradeSel, rank]);

  const activeTerm = terms.find((t) => t.term === termSel) || terms[0] || null;
  const defaultOpen = !activeTerm || activeTerm.units.length <= 3 || activeTerm.count <= 8;
  const isOpen = (key) => (openMap[key] !== undefined ? openMap[key] : defaultOpen);
  const setAllOpen = (v) => setOpenMap(Object.fromEntries((activeTerm?.units || []).map((u) => [u.key, v])));

  const openGrade = (g) => {
    setGradeSel(g);
    setTermSel("");
    setOpenMap({});
    setConfirmDeleteId(null);
  };
  const closeGrade = () => {
    setGradeSel("");
    setTermSel("");
    setOpenMap({});
    setConfirmDeleteId(null);
  };

  const handleCoverFile = async (grade, file) => {
    if (!file.type.startsWith("image/")) { setError("اختر ملف صورة فقط."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("حجم الصورة أكبر من 5 ميجا. اختر صورة أصغر."); return; }
    setUploadingGrade(grade);
    setError("");
    try {
      const url = await uploadGradeCover(file);
      const next = { ...omitGradeCover(covers, grade), [grade]: url };
      await saveGradeCovers(next);
      setCovers(next);
    } catch (e) {
      console.error("GRADE COVER ERROR", e);
      setError(e?.message || "تعذر رفع صورة الصف.");
    } finally {
      setUploadingGrade("");
    }
  };

  const handleCoverRemove = async (grade) => {
    setUploadingGrade(grade);
    setError("");
    try {
      const next = omitGradeCover(covers, grade);
      await saveGradeCovers(next);
      setCovers(next);
    } catch (e) {
      setError(e?.message || "تعذر إزالة صورة الصف.");
    } finally {
      setUploadingGrade("");
    }
  };

  const handleCreate = async (data) => {
    setBusy(true);
    setError("");
    try {
      const lesson = await createLesson(ownerId, data);
      setShowCreate(false);
      navigate(`/teacher/lesson/${lesson.id}`);
    } catch (e) {
      console.error("CREATE LESSON ERROR", e);
      setError(e?.message || e?.error_description || e?.details || "تعذر إنشاء الدرس.");
    } finally {
      setBusy(false);
    }
  };

  const handleImportDemo = async () => {
    setBusy(true);
    try {
      const demo = makeDemoLesson();
      const lessonId = await importLessonBundle(ownerId, demo);
      navigate(`/teacher/lesson/${lessonId}`);
    } catch (e) {
      setError("تعذر استيراد الدرس التجريبي.");
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async (id) => {
    setBusy(true);
    try {
      await duplicateLesson(id, ownerId);
      await refresh();
    } catch (e) {
      setError("تعذر نسخ الدرس.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    try {
      await deleteLesson(id);
      setConfirmDeleteId(null);
      await refresh();
    } catch (e) {
      setError("تعذر حذف الدرس.");
    } finally {
      setBusy(false);
    }
  };

  const gradeCover = gradeSel ? resolveGradeCover(covers, gradeSel) : "";

  return (
    <div className="ts-root duo-lib">
      <style>{LIB_CSS}</style>
      <TeacherThemeToggle />
      {showCreate && <CreateLessonModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

      <div className="duo-lib-top">
        <h1 className="duo-lib-title">
          <i aria-hidden="true">📚</i>
          مكتبة الدروس
        </h1>
        <div className="duo-lib-tools">
          <span className="duo-lib-mail">{session.user.email}</span>
          <Link to="/teacher/facts" className="duo-lib-btn yellow">💡 هل تعلم؟</Link>
          <Link to="/teacher/settings" className="duo-lib-btn blue">⚙ إعدادات المنهج والمنصة</Link>
          <button onClick={() => setShowCreate(true)} disabled={busy} className="duo-lib-btn primary">+ إنشاء درس جديد</button>
          <button onClick={() => signOutTeacher()} className="duo-lib-btn pink">تسجيل الخروج</button>
        </div>
      </div>

      <div className="duo-lib-wrap">
        {error && <p className="duo-lib-error">{error}</p>}

        {lessons === null && <PageLoader compact />}

        {lessons && lessons.length === 0 && (
          <div className="duo-lib-empty" style={{ marginBottom: 18 }}>
            <p>لا توجد دروس بعد. ابدأ بإنشاء درسك الأول.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setShowCreate(true)} className="duo-lib-btn primary">+ إنشاء درس جديد</button>
              <button onClick={handleImportDemo} disabled={busy} className="duo-lib-btn pink">استيراد درس تجريبي (للتطوير فقط)</button>
            </div>
          </div>
        )}

        {/* ——— الخطوة 1: اختيار الصف ——— */}
        {lessons && !gradeSel && gradeCards.length > 0 && (
          <>
            <p className="duo-lib-hint">اختر الصف لتفتح الترم والوحدات والدروس. ويمكنك إضافة صورة لكل صف — تظهر للطالب بشفافية 50%.</p>
            <div className="duo-lib-grades">
              {gradeCards.map(([g, n], gi) => {
                const cover = resolveGradeCover(covers, g);
                return (
                  <div key={g} className="duo-lib-gcard" data-accent={gi % 6} style={{ animationDelay: `${Math.min(gi, 8) * 0.04}s` }}>
                    <button type="button" className="duo-lib-gcard-main" onClick={() => openGrade(g)}>
                      <span className="duo-lib-gcover" aria-hidden="true" style={cover ? { backgroundImage: `url("${cover}")` } : undefined} />
                      <span className="duo-lib-gcard-body">
                        <b>{g}</b>
                        <small>{n} {n === 1 ? "درس" : "دروس"}</small>
                      </span>
                    </button>
                    <CoverTools grade={g} cover={cover} uploading={uploadingGrade === g} onFile={handleCoverFile} onRemove={handleCoverRemove} />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ——— الخطوة 2: داخل الصف (ترم ← وحدات ← دروس) ——— */}
        {lessons && gradeSel && (
          <>
            <section className="duo-lib-ghero">
              <span className="duo-lib-gcover" aria-hidden="true" style={gradeCover ? { backgroundImage: `url("${gradeCover}")` } : undefined} />
              <div className="duo-lib-ghero-text">
                <button type="button" className="duo-lib-btn small" onClick={closeGrade}>→ كل الصفوف</button>
                <h2>{gradeSel}</h2>
              </div>
              <CoverTools grade={gradeSel} cover={gradeCover} uploading={uploadingGrade === gradeSel} onFile={handleCoverFile} onRemove={handleCoverRemove} />
            </section>

            {terms.length === 0 ? (
              <div className="duo-lib-empty">
                <p>لا توجد دروس في هذا الصف بعد.</p>
                <button type="button" className="duo-lib-btn primary" onClick={() => setShowCreate(true)}>+ إنشاء درس جديد</button>
              </div>
            ) : (
              <>
                <div className="duo-lib-terms" role="tablist" aria-label="الترم">
                  {terms.map((t) => (
                    <button
                      key={t.term}
                      type="button"
                      role="tab"
                      aria-selected={activeTerm?.term === t.term}
                      className={`duo-lib-chip${activeTerm?.term === t.term ? " on" : ""}`}
                      onClick={() => { setTermSel(t.term); setOpenMap({}); }}
                    >
                      {t.term} <small>{t.count}</small>
                    </button>
                  ))}
                  {activeTerm && activeTerm.units.length > 1 && (
                    <span className="duo-lib-terms-tools">
                      <button type="button" className="duo-lib-btn small" onClick={() => setAllOpen(true)}>فتح الكل</button>
                      <button type="button" className="duo-lib-btn small" onClick={() => setAllOpen(false)}>طي الكل</button>
                    </span>
                  )}
                </div>

                <div className="duo-lib-groups">
                  {activeTerm && activeTerm.units.map((u, gi) => {
                    const open = isOpen(u.key);
                    return (
                      <section key={u.key} className={`duo-lib-group${open ? " open" : ""}`} data-accent={gi % 6} style={{ animationDelay: `${Math.min(gi, 8) * 0.04}s` }}>
                        <button type="button" className="duo-lib-ghead" onClick={() => setOpenMap((m) => ({ ...m, [u.key]: !open }))} aria-expanded={open}>
                          <span className="duo-lib-gicon" aria-hidden="true">📘</span>
                          <span className="duo-lib-gtext">
                            <span className="duo-lib-gname">{u.subject}</span>
                          </span>
                          <span className="duo-lib-gcount">{u.items.length}</span>
                          <span className="duo-lib-caret" aria-hidden="true">‹</span>
                        </button>
                        {open && (
                          <div className="duo-lib-gbody">
                            {u.items.map((l, i) => {
                              const st = statusMeta(l.status);
                              return (
                                <article key={l.id} className="duo-lib-card" data-accent={gi % 6}>
                                  <span className="duo-lib-num">{l.sortOrder > 0 ? l.sortOrder : i + 1}</span>
                                  <div className="duo-lib-main">
                                    <div className="duo-lib-titlerow">
                                      <h3>{l.title}</h3>
                                      <span className="duo-lib-status" data-tone={st.tone}>{st.label}</span>
                                    </div>
                                    {l.updatedAt && <p className="duo-lib-meta">تعديل {timeAgo(l.updatedAt)}</p>}
                                    {l.description && <p className="duo-lib-desc">{l.description}</p>}
                                  </div>
                                  <div className="duo-lib-actions">
                                    <button onClick={() => navigate(`/teacher/lesson/${l.id}`)} className="duo-lib-btn primary small">فتح الاستوديو</button>
                                    <button onClick={() => handleDuplicate(l.id)} disabled={busy} className="duo-lib-btn pink small">نسخ الدرس</button>
                                    {confirmDeleteId === l.id ? (
                                      <>
                                        <button onClick={() => handleDelete(l.id)} disabled={busy} className="duo-lib-btn danger solid small">تأكيد الحذف</button>
                                        <button onClick={() => setConfirmDeleteId(null)} className="duo-lib-btn small">إلغاء</button>
                                      </>
                                    ) : (
                                      <button onClick={() => setConfirmDeleteId(l.id)} className="duo-lib-btn danger small">حذف</button>
                                    )}
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}