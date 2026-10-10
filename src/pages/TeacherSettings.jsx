import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SOCIAL_PLATFORMS } from "../components/SocialIcons";
import { renameCurriculumNode, moveCurriculumNode, countLessonsForNode, nextSortOrder } from "../lib/curriculumTools";
import {
  listCurriculumNodes,
  saveCurriculumNode,
  deleteCurriculumNode,
  listCompletionTemplates,
  saveCompletionTemplate,
  listPlatformPages,
  savePlatformPage,
  listAllFooterLinks,
  saveFooterLink,
  getBrandSettings,
  saveBrandSettings,
} from "../lib/db";

/**
 * صفحة واضحة لإدارة:
 * 1) صفحات الفوتر (عن مَدَار / الخصوصية / الشروط / تواصل معنا / الحساب)
 * 2) بيانات التواصل واسم المنصة
 * 3) المنهج (مراحل وصفوف ومواد)
 * 4) رسائل إكمال الدرس
 */

const PAGE_HELP = {
  about: "تظهر في الفوتر باسم «عن مَدَار». اكتب تعريف المنصة هنا.",
  privacy: "تظهر في الفوتر باسم «سياسة الخصوصية».",
  terms: "تظهر في الفوتر باسم «الشروط والأحكام».",
  contact: "تظهر في الفوتر باسم «تواصل معنا». البريد يظهر أيضًا من تبويب التواصل.",
  security: "اختياري: صفحة «الحساب والأمان». يمكن إخفاؤها من روابط الفوتر.",
};

const KIND_LABEL = {
  stage: "مرحلة",
  grade: "صف",
  term: "ترم / فصل",
  subject: "مادة / قسم",
};


const TS_CSS = `
  .duo-ts h1 { font-family: var(--duo-font-display); font-weight: 800; color: var(--duo-ink); }
  .duo-ts-link { display: inline-flex; align-items: center; padding: 7px 14px; border-radius: 14px; border: 2px solid var(--duo-line); background: #FFFFFF; color: var(--duo-blue-ink); box-shadow: 0 3px 0 var(--duo-line); font-family: var(--duo-font-display); font-size: 0.8rem; font-weight: 800; text-decoration: none; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease; }
  .duo-ts-link:hover { transform: translateY(-1px); border-color: var(--duo-blue); }
  .duo-ts-link:active { transform: translateY(3px); box-shadow: 0 0 0 transparent; }
  .duo-ts-link.yellow { background: var(--duo-yellow-s); border-color: var(--duo-yellow); color: var(--duo-yellow-ink); box-shadow: 0 3px 0 var(--duo-yellow-d); }

  .duo-ts-tab { padding: 12px 16px; border-radius: 20px; border: 2px solid var(--duo-line); background: #FFFFFF; color: var(--duo-ink); box-shadow: 0 4px 0 var(--duo-line); cursor: pointer; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, background-color 0.15s ease, border-color 0.15s ease; }
  .duo-ts-tab span:first-child { font-family: var(--duo-font-display); font-weight: 800; }
  .duo-ts-tab:hover { transform: translateY(-2px); border-color: var(--duo-line-d); box-shadow: 0 6px 0 var(--duo-line-d); }
  .duo-ts-tab:active { transform: translateY(4px); box-shadow: 0 0 0 transparent; }
  .duo-ts-tab[data-active="true"] { background: var(--duo-green); border-color: var(--duo-green); color: #FFFFFF; box-shadow: 0 4px 0 var(--duo-green-d); }

  .duo-ts-toast { background: var(--duo-green); border-radius: 16px; box-shadow: 0 4px 0 var(--duo-green-d); animation: duo-pop 0.4s var(--duo-spring) both; }
  .duo-ts-err { background: var(--duo-red-s); color: #B3261E; border: 2px solid var(--duo-red); border-radius: 16px; font-weight: 700; box-shadow: 0 4px 0 var(--duo-red-d); }

  /* cards */
  .duo-ts section .rounded-2xl.bg-white { border: 2px solid var(--duo-line); border-radius: 24px; box-shadow: 0 5px 0 var(--duo-line); }
  .duo-ts section .rounded-2xl.bg-white .text-sm.font-bold { font-family: var(--duo-font-display); }

  /* inputs that don't use .ts-input */
  .duo-ts :is(input:not([type="checkbox"]):not([type="radio"]), select, textarea) { border: 2px solid var(--duo-line); border-radius: 14px; background: var(--duo-snow); color: var(--duo-ink); font-weight: 600; transition: border-color 0.15s ease, background 0.15s ease; }
  .duo-ts :is(input, select, textarea):focus { outline: none; border-color: var(--duo-blue); background: #FFFFFF; }
  .duo-ts input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--duo-green); }

  /* green action buttons (they carry the old brand color inline) */
  .duo-ts button[style*="--duo-green)"] { color: #FFFFFF; border-radius: 14px; box-shadow: 0 4px 0 var(--duo-green-d); font-family: var(--duo-font-display); font-weight: 800; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, filter 0.15s ease; }
  .duo-ts button[style*="--duo-green)"]:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 5px 0 var(--duo-green-d); }
  .duo-ts button[style*="--duo-green)"]:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 0 0 transparent; }

  /* curriculum tree */
  .duo-cur-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; padding: 8px 12px; border-radius: 16px; background: #FFFFFF; border: 2px solid var(--duo-line); box-shadow: 0 3px 0 var(--duo-line); transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease; }
  .duo-cur-row:hover { transform: translateY(-1px); box-shadow: 0 4px 0 var(--duo-line-d); }
  .duo-cur-kind { flex: none; padding: 1px 11px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; background: var(--duo-green-s); color: var(--duo-green-ink); }
  .duo-cur-kind[data-kind="grade"] { background: var(--duo-blue-s); color: var(--duo-blue-ink); }
  .duo-cur-kind[data-kind="term"] { background: var(--duo-purple-s); color: var(--duo-purple-ink); }
  .duo-cur-kind[data-kind="subject"] { background: var(--duo-orange-s); color: var(--duo-orange-ink); }
  .duo-cur-name { flex: 1 1 140px; min-width: 0; font-family: var(--duo-font-display); font-size: 0.98rem; font-weight: 800; color: var(--duo-ink); overflow-wrap: anywhere; }
  .duo-cur-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .duo-cur-edit { display: flex; align-items: center; gap: 6px; flex: 1 1 220px; flex-wrap: wrap; }
  .duo-cur-edit .ts-input { flex: 1 1 140px; padding: 6px 12px; }
  .duo-cur-btn { padding: 4px 12px; border-radius: 11px; border: 2px solid var(--duo-line); background: #FFFFFF; color: var(--duo-ink-soft); box-shadow: 0 3px 0 var(--duo-line); font-family: var(--duo-font-display); font-size: 0.78rem; font-weight: 800; cursor: pointer; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease; }
  .duo-cur-btn.arrow { width: 32px; padding: 3px 0; font-size: 1rem; }
  .duo-cur-btn:hover:not(:disabled) { border-color: var(--duo-blue); color: var(--duo-blue-ink); }
  .duo-cur-btn:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 0 0 transparent; }
  .duo-cur-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .duo-cur-btn.ok { background: var(--duo-green); border-color: var(--duo-green); color: #FFFFFF; box-shadow: 0 3px 0 var(--duo-green-d); }
  .duo-cur-btn.danger { color: var(--duo-red-d); }
  .duo-cur-btn.danger:hover:not(:disabled) { background: var(--duo-red-s); border-color: var(--duo-red); color: var(--duo-red-d); }
  @media (prefers-reduced-motion: reduce) { .duo-ts-toast { animation: none !important; } .duo-ts-tab, .duo-cur-row, .duo-cur-btn { transition: none !important; } }
`;

const TEACHER_SETTINGS_TAB_KEY = "madar_teacher_settings_tab_v1";
const TEACHER_SETTINGS_TABS = ["pages", "contact", "footer", "curriculum", "journey"];

export default function TeacherSettings() {
  // ابدأ بصفحات الفوتر — هذا ما يهمك أولًا
  const [tab, setTab] = useState(() => {
    // Teacher-only key: remember the active settings tab across refresh
    try {
      const v = localStorage.getItem(TEACHER_SETTINGS_TAB_KEY);
      return TEACHER_SETTINGS_TABS.includes(v) ? v : "pages";
    } catch (_) {
      return "pages";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(TEACHER_SETTINGS_TAB_KEY, tab);
    } catch (_) {
      /* ignore */
    }
  }, [tab]);
  const [nodes, setNodes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [pages, setPages] = useState([]);
  const [links, setLinks] = useState([]);
  const [brand, setBrand] = useState({ name: "مَدَار", description: "", contactEmail: "", socialLinks: {} });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ kind: "stage", name: "", parentId: "", sortOrder: 0 });

  const reload = async () => {
    setLoading(true);
    setErr("");
    try {
      const results = await Promise.allSettled([
        listCurriculumNodes(),
        listCompletionTemplates(),
        listPlatformPages(),
        listAllFooterLinks(),
        getBrandSettings(),
      ]);
      const val = (i, fallback) =>
        results[i].status === "fulfilled" ? results[i].value : fallback;
      const errMsg = results
        .map((r, i) => (r.status === "rejected" ? `${["منهج","قوالب","صفحات","فوتر","هوية"][i]}: ${r.reason?.message || r.reason}` : null))
        .filter(Boolean)
        .join(" | ");

      const n = val(0, []);
      const tpls = val(1, []);
      const pgs = val(2, []);
      const lks = val(3, []);
      const b = val(4, {});

      setNodes(Array.isArray(n) ? n : []);
      setTemplates(Array.isArray(tpls) ? tpls : []);
      setPages(Array.isArray(pgs) ? pgs : []);
      setLinks(Array.isArray(lks) ? lks : []);
      setBrand({
        name: b?.name || "مَدَار",
        description: b?.description || "",
        contactEmail: b?.contactEmail || "",
        socialLinks: b?.socialLinks && typeof b.socialLinks === "object" ? b.socialLinks : {},
      });
      if (errMsg) {
        setErr("خطأ من قاعدة البيانات: " + errMsg);
      } else if ((!pgs || pgs.length === 0) && (!lks || lks.length === 0)) {
        setErr(
          "الجداول موجودة غالبًا لكن فارغة. نفّذ SQL «زرع الصفحات» من الرسالة التالية في Supabase، ثم حدّث الصفحة."
        );
      }
    } catch (e) {
      setErr(e.message || "تعذر تحميل الإعدادات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const parentsFor = useMemo(() => {
    const need = { stage: null, grade: "stage", term: "grade", subject: "term" }[form.kind];
    if (!need) return [];
    return nodes.filter((n) => n.kind === need);
  }, [form.kind, nodes]);

  const treeLines = useMemo(() => {
    const byParent = {};
    nodes.forEach((n) => {
      const k = n.parentId || "root";
      (byParent[k] ||= []).push(n);
    });
    const out = [];
    const walk = (parentKey, depth) => {
      const list = (byParent[parentKey] || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      for (const n of list) {
        out.push({ ...n, depth });
        walk(n.id, depth + 1);
      }
    };
    walk("root", 0);
    return out;
  }, [nodes]);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  // --- المنهج: تعديل العنوان + تغيير الترتيب ---
  const [editing, setEditing] = useState(null); // { id, name }
  const [nodeBusy, setNodeBusy] = useState(false);

  const saveRename = async (n) => {
    const name = (editing?.name || "").trim();
    if (!name || name === n.name) {
      setEditing(null);
      return;
    }
    setNodeBusy(true);
    try {
      const count = await countLessonsForNode(n, nodes).catch(() => 0);
      const ask = count > 0
        ? `سيتم تغيير الاسم من «${n.name}» إلى «${name}» وتحديث ${count} درس مرتبط به. متابعة؟`
        : `تغيير الاسم من «${n.name}» إلى «${name}»؟`;
      if (!confirm(ask)) return;
      const { updated } = await renameCurriculumNode(n, name, nodes);
      setEditing(null);
      flash(updated > 0 ? `تم التعديل وتحديث ${updated} درس ✓` : "تم تعديل العنوان ✓");
      await reload();
    } catch (e) {
      setErr(e.message || "فشل تعديل العنوان");
    } finally {
      setNodeBusy(false);
    }
  };

  const moveNode = async (n, dir) => {
    setNodeBusy(true);
    try {
      await moveCurriculumNode(n, dir, treeLines);
      await reload();
    } catch (e) {
      setErr(e.message || "فشل تغيير الترتيب");
    } finally {
      setNodeBusy(false);
    }
  };

  const tabs = [
    { key: "pages", label: "صفحات الفوتر", desc: "عن مَدَار · الخصوصية · الشروط · تواصل معنا" },
    { key: "contact", label: "التواصل والاسم", desc: "البريد واسم المنصة" },
    { key: "footer", label: "إظهار الروابط", desc: "إخفاء أو إظهار رابط في الفوتر" },
    { key: "curriculum", label: "المنهج", desc: "مراحل · صفوف · مواد" },
    { key: "journey", label: "رسائل الإكمال", desc: "نصوص تظهر للطالب بعد مشهد" },
  ];

  return (
    <div className="ts-root duo-ts min-h-screen dir-rtl text-right p-4 sm:p-6">
      <style>{TS_CSS}</style>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h1 className="font-black text-xl" style={{ color: "var(--duo-green-ink)" }}>
            إعدادات المنصة
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/teacher/facts" className="duo-ts-link yellow">💡 هل تعلم؟</Link>
            <Link to="/teacher" className="duo-ts-link">← رجوع لمكتبة الدروس</Link>
          </div>
        </div>
        <p className="text-sm mb-5 leading-6" style={{ color: "var(--duo-ink-soft)" }}>
          من هنا تغيّر <strong>محتوى صفحات الفوتر</strong> (عن مَدَار، الخصوصية، الشروط، تواصل معنا)
          وبيانات التواصل، والمنهج الدراسي. التعديل يظهر للطالب بعد الحفظ.
        </p>

        {msg && (
          <div className="duo-ts-toast mb-4 px-4 py-2 rounded-xl text-sm font-bold text-white">
            {msg}
          </div>
        )}
        {err && (
          <div className="duo-ts-err mb-4 px-4 py-3 rounded-xl text-sm">
            {err}
          </div>
        )}
        {loading && (
          <p className="text-sm mb-4" style={{ color: "var(--duo-muted)" }}>
            جاري تحميل الإعدادات...
          </p>
        )}

        {/* تبويبات بشرح */}
        <div className="flex flex-col gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="duo-ts-tab text-right"
              data-active={tab === t.key ? "true" : "false"}
            >
              <span className="block text-sm font-bold">{t.label}</span>
              <span className="block text-[11px] mt-0.5 opacity-80">{t.desc}</span>
            </button>
          ))}
        </div>

        {/* ========== صفحات الفوتر ========== */}
        {tab === "pages" && (
          <section className="space-y-4">
            <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: "var(--duo-line)" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "var(--duo-green-ink)" }}>
                محتوى الصفحات التي يفتحها الطالب من الفوتر
              </p>
              <p className="text-xs leading-5" style={{ color: "var(--duo-muted)" }}>
                عدّل العنوان والنص ثم اضغط «حفظ هذه الصفحة». الروابط في الفوتر تبقى كما هي؛ أنت تغيّر ما يظهر داخل الصفحة فقط.
              </p>
            </div>

            {pages.length === 0 && !loading && (
              <p className="text-sm" style={{ color: "var(--duo-red-d)" }}>
                لا توجد صفحات محفوظة. تأكد أنك شغّلت migration_data_driven.sql في Supabase.
              </p>
            )}

            {pages.map((pg) => (
              <div key={pg.id} className="rounded-2xl p-5 bg-white border space-y-3" style={{ borderColor: "var(--duo-line)" }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-black text-base" style={{ color: "var(--duo-green-ink)" }}>
                      {pg.title || pg.slug}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--duo-muted)" }}>
                      {PAGE_HELP[pg.slug] || `المعرّف: ${pg.slug}`}
                    </p>
                  </div>
                  <label className="text-xs flex items-center gap-2 font-bold" style={{ color: "var(--duo-ink-soft)" }}>
                    <input
                      type="checkbox"
                      checked={pg.is_visible !== false}
                      onChange={(e) =>
                        setPages(pages.map((x) => (x.id === pg.id ? { ...x, is_visible: e.target.checked } : x)))
                      }
                    />
                    الصفحة ظاهرة للطلاب
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-bold mb-1 block" style={{ color: "var(--duo-muted)" }}>
                    عنوان الصفحة
                  </span>
                  <input
                    className="w-full text-sm rounded-xl px-3 py-2 border"
                    style={{ borderColor: "var(--duo-line)" }}
                    value={pg.title || ""}
                    onChange={(e) => setPages(pages.map((x) => (x.id === pg.id ? { ...x, title: e.target.value } : x)))}
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold mb-1 block" style={{ color: "var(--duo-muted)" }}>
                    نص الصفحة (يظهر للطالب)
                  </span>
                  <textarea
                    className="w-full text-sm rounded-xl px-3 py-2 border leading-7"
                    style={{ borderColor: "var(--duo-line)", minHeight: 140 }}
                    value={pg.body || ""}
                    onChange={(e) => setPages(pages.map((x) => (x.id === pg.id ? { ...x, body: e.target.value } : x)))}
                    placeholder="اكتب المحتوى هنا..."
                  />
                </label>

                <button
                  type="button"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: "var(--duo-green)" }}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await savePlatformPage(pg);
                      flash("تم حفظ الصفحة ✓");
                      await reload();
                    } catch (e) {
                      setErr(e.message || "فشل الحفظ");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  حفظ هذه الصفحة
                </button>
              </div>
            ))}
          </section>
        )}

        {/* ========== التواصل ========== */}
        {tab === "contact" && (
          <section className="rounded-2xl p-5 bg-white border space-y-3" style={{ borderColor: "var(--duo-line)" }}>
            <p className="text-sm font-bold" style={{ color: "var(--duo-green-ink)" }}>
              اسم المنصة والبريد الظاهر في الفوتر
            </p>
            <label className="block">
              <span className="text-xs font-bold mb-1 block" style={{ color: "var(--duo-muted)" }}>
                اسم المنصة
              </span>
              <input
                className="w-full text-sm rounded-xl px-3 py-2 border"
                value={brand.name || ""}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold mb-1 block" style={{ color: "var(--duo-muted)" }}>
                وصف قصير تحت الاسم
              </span>
              <textarea
                className="w-full text-sm rounded-xl px-3 py-2 border"
                rows={2}
                value={brand.description || ""}
                onChange={(e) => setBrand({ ...brand, description: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold mb-1 block" style={{ color: "var(--duo-muted)" }}>
                بريد التواصل (تواصل معنا)
              </span>
              <input
                className="w-full text-sm rounded-xl px-3 py-2 border"
                type="email"
                value={brand.contactEmail || ""}
                onChange={(e) => setBrand({ ...brand, contactEmail: e.target.value })}
                placeholder="name@example.com"
              />
            </label>

            <div className="pt-2">
              <p className="text-sm font-bold mb-1" style={{ color: "var(--duo-green-ink)" }}>
                منصات التواصل الاجتماعي (تظهر كأيقونات في الفوتر)
              </p>
              <p className="text-[11px] mb-2" style={{ color: "var(--duo-muted)" }}>
                اترك الخانة فارغة لإخفاء أيقونة المنصة. اضغط «حفظ» بعد التعديل.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SOCIAL_PLATFORMS.map((p) => (
                  <label key={p.key} className="block">
                    <span className="text-xs font-bold mb-1 block" style={{ color: "var(--duo-muted)" }}>
                      {p.label}
                    </span>
                    <input
                      className="w-full text-sm rounded-xl px-3 py-2 border"
                      dir="ltr"
                      value={brand.socialLinks?.[p.key] || ""}
                      onChange={(e) =>
                        setBrand({ ...brand, socialLinks: { ...(brand.socialLinks || {}), [p.key]: e.target.value } })
                      }
                      placeholder={p.placeholder}
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: "var(--duo-green)" }}
              onClick={async () => {
                try {
                  await saveBrandSettings(brand);
                  flash("تم حفظ بيانات التواصل ✓");
                } catch (e) {
                  setErr(e.message || "فشل الحفظ");
                }
              }}
            >
              حفظ
            </button>
          </section>
        )}

        {/* ========== إظهار/إخفاء روابط الفوتر ========== */}
        {tab === "footer" && (
          <section className="space-y-3">
            <p className="text-sm leading-6" style={{ color: "var(--duo-ink-soft)" }}>
              كل صف = رابط في أسفل صفحات الطالب. ألغِ التفعيل ليختفي الرابط من الفوتر دون حذف الصفحة.
            </p>
            {links.length === 0 && (
              <p className="text-sm" style={{ color: "var(--duo-red-d)" }}>
                لا توجد روابط. شغّل migration_data_driven.sql إن لزم.
              </p>
            )}
            {links.map((lk) => (
              <div
                key={lk.id}
                className="rounded-2xl p-4 bg-white border flex flex-wrap items-center gap-3"
                style={{ borderColor: "var(--duo-line)" }}
              >
                <input
                  className="text-sm rounded-xl px-3 py-2 border flex-1 min-w-[140px]"
                  value={lk.label || ""}
                  onChange={(e) => setLinks(links.map((x) => (x.id === lk.id ? { ...x, label: e.target.value } : x)))}
                />
                <span className="text-[11px]" style={{ color: "var(--duo-muted)" }}>
                  {lk.page_slug ? `→ /student/page/${lk.page_slug}` : lk.external_url || ""}
                </span>
                <label className="text-xs font-bold flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={lk.is_visible !== false}
                    onChange={(e) =>
                      setLinks(links.map((x) => (x.id === lk.id ? { ...x, is_visible: e.target.checked } : x)))
                    }
                  />
                  ظاهر في الفوتر
                </label>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: "var(--duo-green)" }}
                  onClick={async () => {
                    try {
                      await saveFooterLink(lk);
                      flash("تم حفظ الرابط ✓");
                      await reload();
                    } catch (e) {
                      setErr(e.message || "فشل الحفظ");
                    }
                  }}
                >
                  حفظ
                </button>
              </div>
            ))}
          </section>
        )}

        {/* ========== المنهج ========== */}
        {tab === "curriculum" && (
          <section className="space-y-4">
            <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: "var(--duo-line)" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "var(--duo-green-ink)" }}>
                شجرة المنهج
              </p>
              <p className="text-xs leading-5" style={{ color: "var(--duo-muted)" }}>
                مثال: مرحلة «الإعدادية» → صف «الثالث» → ترم «الأول» → مادة «التاريخ».
                هذه الأسماء تظهر لاحقًا عند تصنيف الدروس في الاستوديو. يمكنك تعديل أي عنوان بزر «تعديل» (تتحدّث الدروس المرتبطة به تلقائيًا) وتغيير الترتيب بأزرار ↑ ↓.
              </p>
            </div>

            <div className="rounded-2xl p-4 bg-white border space-y-2" style={{ borderColor: "var(--duo-line)" }}>
              <p className="text-xs font-bold" style={{ color: "var(--duo-muted)" }}>
                إضافة عنصر جديد
              </p>
              <select
                className="w-full text-sm rounded-xl px-3 py-2 border"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value, parentId: "" })}
              >
                <option value="stage">مرحلة (مثل: الإعدادية)</option>
                <option value="grade">صف (مثل: الثالث الإعدادي)</option>
                <option value="term">ترم (مثل: الترم الأول)</option>
                <option value="subject">مادة / قسم (مثل: التاريخ)</option>
              </select>
              {form.kind !== "stage" && (
                <select
                  className="w-full text-sm rounded-xl px-3 py-2 border"
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                >
                  <option value="">— اختر العنصر الأب —</option>
                  {parentsFor.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                className="w-full text-sm rounded-xl px-3 py-2 border"
                placeholder="الاسم الذي سيظهر"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: "var(--duo-green)" }}
                onClick={async () => {
                  if (!form.name.trim()) return;
                  try {
                    await saveCurriculumNode({
                      kind: form.kind,
                      name: form.name.trim(),
                      parentId: form.parentId || null,
                      sortOrder: nextSortOrder(nodes, form.kind, form.parentId),
                      isActive: true,
                    });
                    setForm({ ...form, name: "" });
                    flash("تمت الإضافة ✓");
                    await reload();
                  } catch (e) {
                    setErr(e.message || "فشلت الإضافة");
                  }
                }}
              >
                إضافة
              </button>
            </div>

            <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: "var(--duo-line)" }}>
              <p className="text-xs font-bold mb-3" style={{ color: "var(--duo-muted)" }}>
                العناصر الحالية
              </p>
              {treeLines.length === 0 && (
                <p className="text-sm" style={{ color: "var(--duo-muted)" }}>
                  لا يوجد منهج بعد. أضف مرحلة ثم صفًا ثم ترمًا ثم مادة.
                </p>
              )}
              {treeLines.map((n) => {
                const sibs = treeLines.filter((x) => x.kind === n.kind && String(x.parentId || "") === String(n.parentId || ""));
                const idx = sibs.findIndex((x) => x.id === n.id);
                const isEditing = editing?.id === n.id;
                return (
                  <div key={n.id} className="duo-cur-row" data-kind={n.kind} style={{ marginInlineStart: (n.depth || 0) * 18 }}>
                    <span className="duo-cur-kind" data-kind={n.kind}>{KIND_LABEL[n.kind] || n.kind}</span>
                    {isEditing ? (
                      <form
                        className="duo-cur-edit"
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveRename(n);
                        }}
                      >
                        <input
                          className="ts-input"
                          autoFocus
                          value={editing.name}
                          onChange={(e) => setEditing({ id: n.id, name: e.target.value })}
                          onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
                          aria-label="العنوان الجديد"
                        />
                        <button type="submit" className="duo-cur-btn ok" disabled={nodeBusy}>حفظ</button>
                        <button type="button" className="duo-cur-btn" onClick={() => setEditing(null)}>إلغاء</button>
                      </form>
                    ) : (
                      <span className="duo-cur-name">{n.name}</span>
                    )}
                    {!isEditing && (
                      <span className="duo-cur-actions">
                        <button type="button" className="duo-cur-btn arrow" disabled={nodeBusy || idx <= 0} onClick={() => moveNode(n, -1)} title="تحريك لأعلى" aria-label={`تحريك «${n.name}» لأعلى`}>↑</button>
                        <button type="button" className="duo-cur-btn arrow" disabled={nodeBusy || idx < 0 || idx >= sibs.length - 1} onClick={() => moveNode(n, 1)} title="تحريك لأسفل" aria-label={`تحريك «${n.name}» لأسفل`}>↓</button>
                        <button type="button" className="duo-cur-btn" disabled={nodeBusy} onClick={() => setEditing({ id: n.id, name: n.name })}>تعديل</button>
                        <button
                          type="button"
                          className="duo-cur-btn danger"
                          disabled={nodeBusy}
                          onClick={async () => {
                            if (!confirm("حذف هذا العنصر؟")) return;
                            try {
                              await deleteCurriculumNode(n.id);
                              flash("تم الحذف");
                              await reload();
                            } catch (e) {
                              setErr(e.message || "فشل الحذف");
                            }
                          }}
                        >
                          حذف
                        </button>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========== قوالب الإكمال ========== */}
        {tab === "journey" && (
          <section className="space-y-3">
            <p className="text-sm leading-6" style={{ color: "var(--duo-ink-soft)" }}>
              هذه نصوص اختيارية يمكن ربطها من داخل استوديو الدرس («إشعار بعد مشهد معيّن»).
              عدّل العنوان والنص ثم احفظ.
            </p>
            {templates.length === 0 && (
              <p className="text-sm" style={{ color: "var(--duo-muted)" }}>
                لا توجد قوالب. شغّل migration_data_driven.sql لزرع القوالب الافتراضية.
              </p>
            )}
            {templates.map((tpl) => (
              <div key={tpl.id} className="rounded-2xl p-4 bg-white border space-y-2" style={{ borderColor: "var(--duo-line)" }}>
                <p className="text-xs font-bold" style={{ color: "var(--duo-green-ink)" }}>
                  {tpl.label || tpl.key}
                </p>
                <input
                  className="w-full text-sm rounded-xl px-3 py-2 border"
                  value={tpl.title || ""}
                  onChange={(e) => setTemplates(templates.map((x) => (x.id === tpl.id ? { ...x, title: e.target.value } : x)))}
                  placeholder="عنوان الرسالة"
                />
                <textarea
                  className="w-full text-sm rounded-xl px-3 py-2 border"
                  rows={2}
                  value={tpl.body || ""}
                  onChange={(e) => setTemplates(templates.map((x) => (x.id === tpl.id ? { ...x, body: e.target.value } : x)))}
                  placeholder="نص الرسالة"
                />
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: "var(--duo-green)" }}
                  onClick={async () => {
                    try {
                      await saveCompletionTemplate(tpl);
                      flash("تم حفظ القالب ✓");
                    } catch (e) {
                      setErr(e.message || "فشل الحفظ");
                    }
                  }}
                >
                  حفظ
                </button>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}