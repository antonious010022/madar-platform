import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

export default function TeacherSettings() {
  // ابدأ بصفحات الفوتر — هذا ما يهمك أولًا
  const [tab, setTab] = useState("pages");
  const [nodes, setNodes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [pages, setPages] = useState([]);
  const [links, setLinks] = useState([]);
  const [brand, setBrand] = useState({ name: "مَدَار", description: "", contactEmail: "" });
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

  const tabs = [
    { key: "pages", label: "صفحات الفوتر", desc: "عن مَدَار · الخصوصية · الشروط · تواصل معنا" },
    { key: "contact", label: "التواصل والاسم", desc: "البريد واسم المنصة" },
    { key: "footer", label: "إظهار الروابط", desc: "إخفاء أو إظهار رابط في الفوتر" },
    { key: "curriculum", label: "المنهج", desc: "مراحل · صفوف · مواد" },
    { key: "journey", label: "رسائل الإكمال", desc: "نصوص تظهر للطالب بعد مشهد" },
  ];

  return (
    <div className="min-h-screen dir-rtl text-right p-4 sm:p-6" style={{ background: "#FAF6ED" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h1 className="font-black text-xl" style={{ color: "#10665A" }}>
            إعدادات المنصة
          </h1>
          <Link to="/teacher" className="text-xs font-bold" style={{ color: "#10665A" }}>
            ← رجوع لمكتبة الدروس
          </Link>
        </div>
        <p className="text-sm mb-5 leading-6" style={{ color: "#5C5A4A" }}>
          من هنا تغيّر <strong>محتوى صفحات الفوتر</strong> (عن مَدَار، الخصوصية، الشروط، تواصل معنا)
          وبيانات التواصل، والمنهج الدراسي. التعديل يظهر للطالب بعد الحفظ.
        </p>

        {msg && (
          <div className="mb-4 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "#10665A" }}>
            {msg}
          </div>
        )}
        {err && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#FDE8E8", color: "#9B1C1C" }}>
            {err}
          </div>
        )}
        {loading && (
          <p className="text-sm mb-4" style={{ color: "#8A8570" }}>
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
              className="text-right rounded-2xl px-4 py-3 border transition-all"
              style={{
                background: tab === t.key ? "#10665A" : "#FFFFFF",
                color: tab === t.key ? "#FFFFFF" : "#22291F",
                borderColor: tab === t.key ? "#10665A" : "#DED4BD",
              }}
            >
              <span className="block text-sm font-bold">{t.label}</span>
              <span className="block text-[11px] mt-0.5 opacity-80">{t.desc}</span>
            </button>
          ))}
        </div>

        {/* ========== صفحات الفوتر ========== */}
        {tab === "pages" && (
          <section className="space-y-4">
            <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#DED4BD" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "#10665A" }}>
                محتوى الصفحات التي يفتحها الطالب من الفوتر
              </p>
              <p className="text-xs leading-5" style={{ color: "#8A8570" }}>
                عدّل العنوان والنص ثم اضغط «حفظ هذه الصفحة». الروابط في الفوتر تبقى كما هي؛ أنت تغيّر ما يظهر داخل الصفحة فقط.
              </p>
            </div>

            {pages.length === 0 && !loading && (
              <p className="text-sm" style={{ color: "#C53030" }}>
                لا توجد صفحات محفوظة. تأكد أنك شغّلت migration_data_driven.sql في Supabase.
              </p>
            )}

            {pages.map((pg) => (
              <div key={pg.id} className="rounded-2xl p-5 bg-white border space-y-3" style={{ borderColor: "#DED4BD" }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-black text-base" style={{ color: "#10665A" }}>
                      {pg.title || pg.slug}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "#8A8570" }}>
                      {PAGE_HELP[pg.slug] || `المعرّف: ${pg.slug}`}
                    </p>
                  </div>
                  <label className="text-xs flex items-center gap-2 font-bold" style={{ color: "#5C5A4A" }}>
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
                  <span className="text-xs font-bold mb-1 block" style={{ color: "#8A8570" }}>
                    عنوان الصفحة
                  </span>
                  <input
                    className="w-full text-sm rounded-xl px-3 py-2 border"
                    style={{ borderColor: "#DED4BD" }}
                    value={pg.title || ""}
                    onChange={(e) => setPages(pages.map((x) => (x.id === pg.id ? { ...x, title: e.target.value } : x)))}
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold mb-1 block" style={{ color: "#8A8570" }}>
                    نص الصفحة (يظهر للطالب)
                  </span>
                  <textarea
                    className="w-full text-sm rounded-xl px-3 py-2 border leading-7"
                    style={{ borderColor: "#DED4BD", minHeight: 140 }}
                    value={pg.body || ""}
                    onChange={(e) => setPages(pages.map((x) => (x.id === pg.id ? { ...x, body: e.target.value } : x)))}
                    placeholder="اكتب المحتوى هنا..."
                  />
                </label>

                <button
                  type="button"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: "#10665A" }}
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
          <section className="rounded-2xl p-5 bg-white border space-y-3" style={{ borderColor: "#DED4BD" }}>
            <p className="text-sm font-bold" style={{ color: "#10665A" }}>
              اسم المنصة والبريد الظاهر في الفوتر
            </p>
            <label className="block">
              <span className="text-xs font-bold mb-1 block" style={{ color: "#8A8570" }}>
                اسم المنصة
              </span>
              <input
                className="w-full text-sm rounded-xl px-3 py-2 border"
                value={brand.name || ""}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold mb-1 block" style={{ color: "#8A8570" }}>
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
              <span className="text-xs font-bold mb-1 block" style={{ color: "#8A8570" }}>
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
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: "#10665A" }}
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
            <p className="text-sm leading-6" style={{ color: "#5C5A4A" }}>
              كل صف = رابط في أسفل صفحات الطالب. ألغِ التفعيل ليختفي الرابط من الفوتر دون حذف الصفحة.
            </p>
            {links.length === 0 && (
              <p className="text-sm" style={{ color: "#C53030" }}>
                لا توجد روابط. شغّل migration_data_driven.sql إن لزم.
              </p>
            )}
            {links.map((lk) => (
              <div
                key={lk.id}
                className="rounded-2xl p-4 bg-white border flex flex-wrap items-center gap-3"
                style={{ borderColor: "#DED4BD" }}
              >
                <input
                  className="text-sm rounded-xl px-3 py-2 border flex-1 min-w-[140px]"
                  value={lk.label || ""}
                  onChange={(e) => setLinks(links.map((x) => (x.id === lk.id ? { ...x, label: e.target.value } : x)))}
                />
                <span className="text-[11px]" style={{ color: "#8A8570" }}>
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
                  style={{ background: "#10665A" }}
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
            <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#DED4BD" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "#10665A" }}>
                شجرة المنهج
              </p>
              <p className="text-xs leading-5" style={{ color: "#8A8570" }}>
                مثال: مرحلة «الإعدادية» → صف «الثالث» → ترم «الأول» → مادة «التاريخ».
                هذه الأسماء تظهر لاحقًا عند تصنيف الدروس في الاستوديو.
              </p>
            </div>

            <div className="rounded-2xl p-4 bg-white border space-y-2" style={{ borderColor: "#DED4BD" }}>
              <p className="text-xs font-bold" style={{ color: "#8A8570" }}>
                إضافة عنصر جديد
              </p>
              <select
                className="w-full text-sm rounded-xl px-3 py-2 border"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value, parentId: "" })}
              >
                <option value="stage">المرحلة</option>
                <option value="grade">الصف</option>
                <option value="term">الترم</option>
                <option value="subject">الـوحـدة</option>
              </select>
              {form.kind !== "stage" && (
                <select
                  className="w-full text-sm rounded-xl px-3 py-2 border"
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                >
                  <option value="">—— العنصر الاساسي ——</option>
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
                style={{ background: "#10665A" }}
                onClick={async () => {
                  if (!form.name.trim()) return;
                  try {
                    await saveCurriculumNode({
                      kind: form.kind,
                      name: form.name.trim(),
                      parentId: form.parentId || null,
                      sortOrder: Number(form.sortOrder) || 0,
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

            <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#DED4BD" }}>
              <p className="text-xs font-bold mb-3" style={{ color: "#8A8570" }}>
                العناصر الحالية
              </p>
              {treeLines.length === 0 && (
                <p className="text-sm" style={{ color: "#8A8570" }}>
                  لا يوجد منهج بعد. أضف مرحلة ثم صفًا ثم ترمًا ثم مادة.
                </p>
              )}
              {treeLines.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between gap-2 py-2 border-b text-sm"
                  style={{ borderColor: "#F0EBE0", paddingInlineStart: (n.depth || 0) * 14 }}
                >
                  <span className="min-w-0 flex-1 break-words">
                    <span className="text-[10px] font-bold ml-2 px-1.5 py-0.5 rounded inline-block" style={{ background: "#E4F0EC", color: "#0E5348" }}>
                      {KIND_LABEL[n.kind] || n.kind}
                    </span>
                    {n.name}
                  </span>
                  <button
                    type="button"
                    className="text-[11px] font-bold shrink-0"
                    style={{ color: "#C53030" }}
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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========== قوالب الإكمال ========== */}
        {tab === "journey" && (
          <section className="space-y-3">
            <p className="text-sm leading-6" style={{ color: "#5C5A4A" }}>
              هذه نصوص اختيارية يمكن ربطها من داخل استوديو الدرس («إشعار بعد مشهد معيّن»).
              عدّل العنوان والنص ثم احفظ.
            </p>
            {templates.length === 0 && (
              <p className="text-sm" style={{ color: "#8A8570" }}>
                لا توجد قوالب. شغّل migration_data_driven.sql لزرع القوالب الافتراضية.
              </p>
            )}
            {templates.map((tpl) => (
              <div key={tpl.id} className="rounded-2xl p-4 bg-white border space-y-2" style={{ borderColor: "#DED4BD" }}>
                <p className="text-xs font-bold" style={{ color: "#10665A" }}>
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
                  style={{ background: "#10665A" }}
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