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
  @media (max-width: 640px) {
    .duo-lib-top { padding: 12px 14px; }
    .duo-lib-row { flex-direction: column; gap: 4px; }
    .duo-lib-rowlabel { width: auto; padding-top: 0; }
    .duo-lib-actions { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) { .duo-lib-group { animation: none !important; } .duo-lib-card, .duo-lib-chip, .duo-lib-btn, .duo-lib-caret { transition: none !important; } }
`;

export default function LessonLibraryPage({ session }) {
  const navigate = useNavigate();
  const ownerId = session.user.id;

  const [lessons, setLessons] = useState(null);
  const [nodes, setNodes] = useState([]); // curriculum — used only to order the filters/groups like in settings
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState({ stage: "", grade: "", term: "", subject: "" });
  const [statusFilter, setStatusFilter] = useState("");
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

  // search + status (the original search: title + subject)
  const base = useMemo(() => {
    if (!lessons) return [];
    const q = query.toLowerCase();
    return lessons.filter(
      (l) => (l.title + l.subject).toLowerCase().includes(q) && (!statusFilter || statusMeta(l.status).label === statusFilter)
    );
  }, [lessons, query, statusFilter]);

  const statusCounts = useMemo(() => {
    const m = new Map();
    (lessons || []).forEach((l) => {
      const lb = statusMeta(l.status).label;
      m.set(lb, (m.get(lb) || 0) + 1);
    });
    return Array.from(m.entries());
  }, [lessons]);

  /* chips for each level, counted among lessons that match the levels above it */
  const levelOptions = useMemo(() => {
    return LEVELS.map((lv, idx) => {
      let list = base;
      for (let j = 0; j < idx; j++) {
        const k = LEVELS[j].kind;
        if (sel[k]) list = list.filter((l) => valueOf(l, k) === sel[k]);
      }
      const counts = new Map();
      list.forEach((l) => {
        const v = valueOf(l, lv.kind);
        counts.set(v, (counts.get(v) || 0) + 1);
      });
      const c = cmp(lv.kind);
      return Array.from(counts.entries()).sort((a, b) => c(a[0], b[0]));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, sel, rank]);

  const filtered = useMemo(
    () => base.filter((l) => LEVELS.every((lv) => !sel[lv.kind] || valueOf(l, lv.kind) === sel[lv.kind])),
    [base, sel]
  );

  const groups = useMemo(() => {
    const map = new Map();
    for (const l of filtered) {
      const g = { stage: valueOf(l, "stage"), grade: valueOf(l, "grade"), term: valueOf(l, "term"), subject: valueOf(l, "subject") };
      const key = [g.stage, g.grade, g.term, g.subject].join("||");
      if (!map.has(key)) map.set(key, { key, ...g, items: [] });
      map.get(key).items.push(l);
    }
    const list = Array.from(map.values());
    for (const g of list) g.items.sort((a, b) => (a.sortOrder > 0 ? a.sortOrder : 1e9) - (b.sortOrder > 0 ? b.sortOrder : 1e9));
    const cs = LEVELS.map((lv) => cmp(lv.kind));
    list.sort((a, b) => {
      for (let i = 0; i < LEVELS.length; i++) {
        const k = LEVELS[i].kind;
        const d = cs[i](a[k], b[k]);
        if (d) return d;
      }
      return 0;
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, rank]);

  const defaultOpen = groups.length <= 3 || filtered.length <= 8;
  const isOpen = (key) => (openMap[key] !== undefined ? openMap[key] : defaultOpen);
  const setAllOpen = (v) => setOpenMap(Object.fromEntries(groups.map((g) => [g.key, v])));

  const pick = (kind, value) => {
    const idx = LEVELS.findIndex((l) => l.kind === kind);
    setSel((s) => {
      const next = { ...s };
      LEVELS.forEach((l, i) => {
        if (i === idx) next[kind] = s[kind] === value ? "" : value; // tap again to clear
        if (i > idx) next[l.kind] = "";
      });
      return next;
    });
    setOpenMap({});
  };
  const anyFilter = !!(query || statusFilter || LEVELS.some((l) => sel[l.kind]));
  const clearAll = () => {
    setQuery("");
    setStatusFilter("");
    setSel({ stage: "", grade: "", term: "", subject: "" });
    setOpenMap({});
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

  return (
    <div className="ts-root duo-lib">
      <style>{LIB_CSS}</style>
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

        {lessons === null && <p style={{ color: "var(--duo-muted)", fontWeight: 700 }}>جاري التحميل...</p>}

        {lessons && lessons.length === 0 && (
          <div className="duo-lib-empty">
            <p>لا توجد دروس بعد. ابدأ بإنشاء درسك الأول.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setShowCreate(true)} className="duo-lib-btn primary">+ إنشاء درس جديد</button>
              <button onClick={handleImportDemo} disabled={busy} className="duo-lib-btn pink">استيراد درس تجريبي (للتطوير فقط)</button>
            </div>
          </div>
        )}

        {lessons && lessons.length > 0 && (
          <>
            <section className="duo-lib-filters" aria-label="فلاتر الدروس">
              <div className="duo-lib-search">
                <input className="ts-input" placeholder="🔍 بحث في الدروس..." value={query} onChange={(e) => setQuery(e.target.value)} />
                {statusCounts.length > 1 && (
                  <div className="duo-lib-chips">
                    <button type="button" className={`duo-lib-chip status${statusFilter === "" ? " on" : ""}`} onClick={() => setStatusFilter("")}>
                      كل الحالات <small>{lessons.length}</small>
                    </button>
                    {statusCounts.map(([label, n]) => (
                      <button key={label} type="button" className={`duo-lib-chip status${statusFilter === label ? " on" : ""}`} onClick={() => setStatusFilter(statusFilter === label ? "" : label)}>
                        {label} <small>{n}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {LEVELS.map((lv, idx) => {
                const opts = levelOptions[idx];
                if (opts.length === 0 || (opts.length === 1 && !sel[lv.kind] && opts[0][0] === lv.none)) return null;
                return (
                  <div key={lv.kind} className="duo-lib-row">
                    <span className="duo-lib-rowlabel">{lv.label}</span>
                    <div className="duo-lib-chips">
                      <button type="button" className={`duo-lib-chip${sel[lv.kind] === "" ? " on" : ""}`} onClick={() => sel[lv.kind] && pick(lv.kind, sel[lv.kind])}>
                        الكل <small>{opts.reduce((s, [, n]) => s + n, 0)}</small>
                      </button>
                      {opts.map(([value, n]) => (
                        <button key={value} type="button" className={`duo-lib-chip${sel[lv.kind] === value ? " on" : ""}`} onClick={() => pick(lv.kind, value)}>
                          {value} <small>{n}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="duo-lib-foot">
                <span className="duo-lib-count">
                  <b>{filtered.length}</b> درس في <b>{groups.length}</b> {groups.length === 1 ? "مجموعة" : "مجموعات"}
                </span>
                <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {groups.length > 1 && (
                    <>
                      <button type="button" className="duo-lib-btn small" onClick={() => setAllOpen(true)}>فتح الكل</button>
                      <button type="button" className="duo-lib-btn small" onClick={() => setAllOpen(false)}>طي الكل</button>
                    </>
                  )}
                  {anyFilter && <button type="button" className="duo-lib-btn small danger" onClick={clearAll}>✕ مسح الفلاتر</button>}
                </span>
              </div>
            </section>

            {filtered.length === 0 ? (
              <div className="duo-lib-empty">
                <p>لا توجد دروس مطابقة.</p>
                <button type="button" className="duo-lib-btn" onClick={clearAll}>مسح الفلاتر</button>
              </div>
            ) : (
              <div className="duo-lib-groups">
                {groups.map((g, gi) => {
                  const open = isOpen(g.key);
                  return (
                    <section key={g.key} className={`duo-lib-group${open ? " open" : ""}`} data-accent={gi % 6} style={{ animationDelay: `${Math.min(gi, 8) * 0.04}s` }}>
                      <button type="button" className="duo-lib-ghead" onClick={() => setOpenMap((m) => ({ ...m, [g.key]: !open }))} aria-expanded={open}>
                        <span className="duo-lib-gicon" aria-hidden="true">📘</span>
                        <span className="duo-lib-gtext">
                          <span className="duo-lib-gname">{g.subject}</span>
                          <span className="duo-lib-gpath">
                            <span>{g.stage}</span>
                            <span>{g.grade}</span>
                            <span>{g.term}</span>
                          </span>
                        </span>
                        <span className="duo-lib-gcount">{g.items.length}</span>
                        <span className="duo-lib-caret" aria-hidden="true">‹</span>
                      </button>
                      {open && (
                        <div className="duo-lib-gbody">
                          {g.items.map((l, i) => {
                            const st = statusMeta(l.status);
                            return (
                              <article key={l.id} className="duo-lib-card" data-accent={gi % 6}>
                                <span className="duo-lib-num">{l.sortOrder > 0 ? l.sortOrder : i + 1}</span>
                                <div className="duo-lib-main">
                                  <div className="duo-lib-titlerow">
                                    <h3>{l.title}</h3>
                                    <span className="duo-lib-status" data-tone={st.tone}>{st.label}</span>
                                  </div>
                                  <p className="duo-lib-meta">
                                    {[l.stage, l.grade, l.term, l.subject].filter(Boolean).join(" / ")}
                                    {l.updatedAt ? ` · تعديل ${timeAgo(l.updatedAt)}` : ""}
                                  </p>
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
            )}
          </>
        )}
      </div>
    </div>
  );
}