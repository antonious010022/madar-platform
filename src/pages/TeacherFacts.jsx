import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listAllFacts, saveFact, deleteFact } from "../lib/didYouKnow";
import { listCurriculumNodes, listPublishedLessons } from "../lib/db";

/* /teacher/facts — manage the "هل تعلم؟" facts.
   Each fact can target a stage and/or a grade; students (signed-in only) get them at random,
   one new fact per visit, without repeats until they've seen all the facts meant for them. */

const EMPTY = { id: null, body: "", stage: "", grade: "", isActive: true };
const MAX = 600;

export default function TeacherFacts() {
  const [facts, setFacts] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [stages, setStages] = useState([]);
  const [pairs, setPairs] = useState([]); // [{stage, grade}]

  async function load() {
    setError("");
    try {
      setFacts(await listAllFacts());
    } catch (e) {
      console.warn("facts:", e);
      setFacts([]);
      setError("تعذر تحميل المعلومات. تأكد من تشغيل ملف migration_did_you_know.sql في Supabase.");
    }
  }

  useEffect(() => {
    load();
    (async () => {
      const [nodes, lessons] = await Promise.all([listCurriculumNodes().catch(() => []), listPublishedLessons().catch(() => [])]);
      const byId = new Map(nodes.map((n) => [String(n.id), n]));
      const st = new Set();
      const pr = new Map();
      for (const n of nodes) {
        if (n.kind === "stage") st.add(n.name);
        if (n.kind === "grade") {
          const p = byId.get(String(n.parentId));
          const stage = p && p.kind === "stage" ? p.name : "";
          pr.set(`${stage}||${n.name}`, { stage, grade: n.name });
        }
      }
      for (const l of lessons) {
        if (l.stage) st.add(l.stage);
        if (l.grade) pr.set(`${l.stage || ""}||${l.grade}`, { stage: l.stage || "", grade: l.grade });
      }
      setStages(Array.from(st));
      setPairs(Array.from(pr.values()));
    })();
  }, []);

  const gradeOptions = useMemo(() => {
    const list = pairs.filter((p) => !form.stage || !p.stage || p.stage === form.stage).map((p) => p.grade);
    const out = Array.from(new Set(list));
    if (form.grade && !out.includes(form.grade)) out.unshift(form.grade);
    return out;
  }, [pairs, form.stage, form.grade]);
  const stageOptions = useMemo(() => {
    const out = [...stages];
    if (form.stage && !out.includes(form.stage)) out.unshift(form.stage);
    return out;
  }, [stages, form.stage]);

  function flash(t) {
    setMsg(t);
    window.setTimeout(() => setMsg(""), 2600);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.body.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      await saveFact(form);
      flash(form.id ? "تم تحديث المعلومة ✓" : "تمت إضافة المعلومة ✓");
      setForm(EMPTY);
      await load();
    } catch (err) {
      console.warn("save fact:", err);
      setError("تعذر الحفظ. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(f) {
    try {
      await saveFact({ ...f, isActive: !f.isActive });
      await load();
    } catch {
      setError("تعذر تغيير الحالة.");
    }
  }
  async function remove(f) {
    if (!window.confirm("حذف هذه المعلومة نهائيًا؟")) return;
    try {
      await deleteFact(f.id);
      if (form.id === f.id) setForm(EMPTY);
      flash("تم الحذف");
      await load();
    } catch {
      setError("تعذر الحذف.");
    }
  }

  const activeCount = (facts || []).filter((f) => f.isActive).length;

  return (
    <div className="ts-root duo-tf" dir="rtl">
      <div className="duo-tf-wrap">
        <Link to="/teacher" className="duo-tf-back">→ مكتبة الدروس</Link>

        <header className="duo-tf-head">
          <span className="duo-tf-bulb" aria-hidden="true">💡</span>
          <div>
            <h1>هل تعلم؟</h1>
            <p>أضف معلومات قصيرة تظهر للطلاب المسجّلين فقط. كل طالب يرى معلومة عشوائية جديدة في كل زيارة، ولا تتكرر له معلومة حتى يرى كل المعلومات المخصصة لصفه.</p>
          </div>
        </header>

        <form className="duo-tf-card" onSubmit={submit}>
          <h2>{form.id ? "تعديل معلومة" : "إضافة معلومة جديدة"}</h2>
          <label className="duo-tf-field">
            <span>نص المعلومة</span>
            <textarea className="ts-input" rows={3} maxLength={MAX} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="مثال: نهر النيل هو أطول نهر في أفريقيا ويمرّ بإحدى عشرة دولة." />
            <small>{form.body.length} / {MAX}</small>
          </label>
          <div className="duo-tf-row">
            <label className="duo-tf-field">
              <span>المرحلة الدراسية</span>
              {stageOptions.length ? (
                <select className="ts-input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value, grade: "" })}>
                  <option value="">كل المراحل</option>
                  {stageOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <input className="ts-input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} placeholder="اتركه فارغًا لكل المراحل" />
              )}
            </label>
            <label className="duo-tf-field">
              <span>الصف الدراسي</span>
              {gradeOptions.length ? (
                <select className="ts-input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                  <option value="">كل الصفوف</option>
                  {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              ) : (
                <input className="ts-input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="اتركه فارغًا لكل الصفوف" />
              )}
            </label>
          </div>
          <label className="duo-tf-check">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <span>مفعّلة (تظهر للطلاب)</span>
          </label>
          <div className="duo-tf-actions">
            <button type="submit" className="duo-btn duo-btn-primary px-8 py-2 text-white" disabled={saving || !form.body.trim()}>
              {saving ? "جاري الحفظ..." : form.id ? "حفظ التعديل" : "إضافة"}
            </button>
            {form.id ? <button type="button" className="duo-btn duo-btn-ghost px-6 py-2" onClick={() => setForm(EMPTY)}>إلغاء</button> : null}
            {msg ? <span className="duo-tf-msg">{msg}</span> : null}
          </div>
        </form>

        {error ? <div className="md-alert error" style={{ marginBottom: 14 }}><span>⚠</span> {error}</div> : null}

        <div className="duo-tf-listhead">
          <h2>المعلومات الحالية</h2>
          {facts ? <span className="duo-saved-count">{facts.length} · مفعّلة {activeCount}</span> : null}
        </div>

        {facts === null ? <p className="duo-tf-empty">جاري التحميل...</p> : facts.length === 0 ? (
          <p className="duo-tf-empty">لا توجد معلومات بعد. أضف أول معلومة من النموذج أعلاه.</p>
        ) : (
          <ul className="duo-tf-list">
            {facts.map((f) => (
              <li key={f.id} className={`duo-tf-item${f.isActive ? "" : " off"}`}>
                <p className="duo-tf-body">{f.body}</p>
                <div className="duo-tf-meta">
                  <span className="duo-tf-badge">{f.grade ? `${f.stage ? f.stage + " · " : ""}${f.grade}` : f.stage ? `كل صفوف ${f.stage}` : "كل الطلاب"}</span>
                  {!f.isActive ? <span className="duo-tf-badge off">متوقفة</span> : null}
                  <span className="duo-tf-spacer" />
                  <button type="button" className="duo-tf-mini" onClick={() => toggle(f)}>{f.isActive ? "إيقاف" : "تفعيل"}</button>
                  <button type="button" className="duo-tf-mini" onClick={() => { setForm({ id: f.id, body: f.body, stage: f.stage || "", grade: f.grade || "", isActive: f.isActive }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>تعديل</button>
                  <button type="button" className="duo-tf-mini danger" onClick={() => remove(f)}>حذف</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
