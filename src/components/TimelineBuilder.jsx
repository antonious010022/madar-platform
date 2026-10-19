import { useEffect, useState } from "react";
import TimelineView from "./TimelineView";

/**
 * محرر الخط الزمني للمعلم — بديل لـ TimelineStudioEditor بنفس الـ props بالظبط:
 *   <TimelineBuilder items uploadFn onAdd(item) onEdit(itemId, data) onDelete(itemId) />
 * بيعرض الخط الزمني بنفس شكل الطالب، وتضغط على أي بوكس لتعديله، وفورم الإضافة تحته.
 * التاريخ والعنوان مطلوبين؛ الوصف والموقع والصورة اختيارية (البوكس بدونهم لا يفتح تفاصيل عند الطالب).
 */

const STYLE_ID = "md-timeline-builder-css";
const CSS = `
.md-tlb { --tlb-ac: #C2562F; --tlb-soft: rgba(194, 86, 47, 0.1); direction: rtl; border-radius: 1.25rem; border: 1px solid #E3E0EE; background: #fff; padding: 1rem; margin-bottom: 1rem; }
.md-tlb-head { display: flex; align-items: center; justify-content: space-between; gap: .6rem; margin-bottom: .75rem; }
.md-tlb-head h3 { margin: 0; font-size: .95rem; font-weight: 900; color: #433F66; }
.md-tlb-count { padding: .15rem .65rem; border-radius: 999px; font-size: .72rem; font-weight: 800; color: var(--tlb-ac); background: var(--tlb-soft); }
.md-tlb-empty { padding: 1.4rem 1rem; border-radius: 1rem; border: 2px dashed rgba(194, 86, 47, .45); background: var(--tlb-soft); text-align: center; font-size: .85rem; font-weight: 700; color: #6E6B85; }
.md-tlb-hint { margin: .6rem 0 0; font-size: .74rem; font-weight: 700; color: #6E6B85; }
.md-tlb-form { margin-top: .9rem; padding: .95rem; border-radius: 1rem; border: 1px solid var(--tlb-ac); border-inline-start-width: 5px; background: #FFFCFA; }
.md-tlb-form-title { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin: 0 0 .7rem; font-size: .88rem; font-weight: 900; color: var(--tlb-ac); }
.md-tlb-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: .65rem; }
@media (min-width: 640px) { .md-tlb-grid { grid-template-columns: 9rem minmax(0, 1fr); } .md-tlb-grid .is-wide { grid-column: 1 / -1; } }
.md-tlb label > span { display: block; margin-bottom: .25rem; font-size: .74rem; font-weight: 800; color: #433F66; }
.md-tlb input[type="text"], .md-tlb textarea { width: 100%; padding: .6rem .75rem; border-radius: .8rem; border: 1px solid #D9D5E8; background: #fff; font: inherit; font-size: .88rem; color: #2B2750; }
.md-tlb textarea { min-height: 4.6rem; resize: vertical; line-height: 1.7; }
.md-tlb input:focus, .md-tlb textarea:focus { outline: 2px solid rgba(194, 86, 47, .35); border-color: var(--tlb-ac); }
.md-tlb-img { display: flex; align-items: center; gap: .7rem; flex-wrap: wrap; }
.md-tlb-img img { width: 4.2rem; height: 3.2rem; object-fit: cover; border-radius: .6rem; border: 1px solid #E3E0EE; }
.md-tlb-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .85rem; }
.md-tlb-btn { min-height: 2.6rem; padding: .5rem 1.15rem; border-radius: .85rem; border: 1px solid #D9D5E8; background: #fff; color: #433F66; font: inherit; font-size: .84rem; font-weight: 800; cursor: pointer; }
.md-tlb-btn.is-primary { border-color: var(--tlb-ac); background: var(--tlb-ac); color: #fff; }
.md-tlb-btn.is-danger { color: #B3261E; border-color: rgba(179, 38, 30, .35); }
.md-tlb-btn:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 520px) { .md-tlb { padding: .75rem; } .md-tlb-btn { flex: 1 1 auto; } }
`;

const newId = () => `tl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const EMPTY = { date: "", title: "", description: "", location: "", image: "" };

export default function TimelineBuilder({ items = [], uploadFn, onAdd, onEdit, onDelete }) {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);

  const list = Array.isArray(items) ? items : [];
  const [selected, setSelected] = useState(null); // id الحدث اللي بيتعدّل، أو null = إضافة جديدة
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const selectedItem = list.find((it) => it.id === selected) || null;
  useEffect(() => {
    setForm(selectedItem ? { ...EMPTY, ...selectedItem } : EMPTY);
    setErr("");
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (selected && !selectedItem) setSelected(null); }, [selected, selectedItem]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.date.trim() && form.title.trim();

  async function pickImage(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file || !uploadFn) return;
    setBusy(true); setErr("");
    try {
      const r = await uploadFn(file);
      const url = typeof r === "string" ? r : r?.url || r?.publicUrl || r?.src || "";
      if (!url) throw new Error("no url");
      setForm((f) => ({ ...f, image: url }));
    } catch {
      setErr("تعذّر رفع الصورة، جرّب مرة أخرى.");
    } finally { setBusy(false); }
  }

  function save() {
    if (!valid) { setErr("اكتب التاريخ والعنوان أولًا."); return; }
    const data = {
      date: form.date.trim(), title: form.title.trim(),
      description: form.description.trim(), location: form.location.trim(), image: form.image || "",
    };
    if (selectedItem) onEdit && onEdit(selectedItem.id, data);
    else { onAdd && onAdd({ id: newId(), ...data }); setForm(EMPTY); }
    setErr("");
  }

  function remove() {
    if (!selectedItem) return;
    if (typeof window !== "undefined" && !window.confirm("حذف هذا الحدث من الخط الزمني؟")) return;
    onDelete && onDelete(selectedItem.id);
    setSelected(null);
  }

  return (
    <section className="md-tlb" aria-label="محرر الخط الزمني">
      <div className="md-tlb-head">
        <h3>🕒 الخط الزمني</h3>
        <span className="md-tlb-count">{list.length} {list.length === 1 ? "حدث" : "أحداث"}</span>
      </div>

      {list.length === 0 ? (
        <div className="md-tlb-empty">لسه مفيش أحداث — أضف أول حدث من الفورم تحت وهيظهر هنا بنفس شكله عند الطالب.</div>
      ) : (
        <>
          <TimelineView items={list} selectedKey={selected} onSelect={(k) => setSelected(k)} interactiveAll hideDetail />
          <p className="md-tlb-hint">اضغط على أي بوكس لتعديله أو حذفه.</p>
        </>
      )}

      <div className="md-tlb-form">
        <p className="md-tlb-form-title">
          <span>{selectedItem ? "✏️ تعديل الحدث" : "➕ إضافة حدث جديد"}</span>
          {selectedItem && <button type="button" className="md-tlb-btn" onClick={() => setSelected(null)}>إلغاء التحديد</button>}
        </p>
        <div className="md-tlb-grid">
          <label><span>التاريخ *</span><input type="text" value={form.date} onChange={set("date")} placeholder="مثال: 1492" /></label>
          <label><span>عنوان الحدث *</span><input type="text" value={form.title} onChange={set("title")} placeholder="مثال: وصول كولومبس" /></label>
          <label className="is-wide"><span>التفاصيل (اختياري — لو كتبتها البوكس يفتح عند الطالب)</span><textarea value={form.description} onChange={set("description")} placeholder="اشرح الحدث باختصار…" /></label>
          <label className="is-wide"><span>الموقع (اختياري)</span><input type="text" value={form.location} onChange={set("location")} placeholder="مثال: جزر البهاما" /></label>
          {uploadFn && (
            <div className="is-wide md-tlb-img">
              {form.image ? <img src={form.image} alt="" /> : null}
              <label className="md-tlb-btn" style={{ display: "inline-flex", alignItems: "center", cursor: busy ? "wait" : "pointer" }}>
                {busy ? "جارٍ الرفع…" : form.image ? "تغيير الصورة" : "🖼️ إضافة صورة (اختياري)"}
                <input type="file" accept="image/*" onChange={pickImage} disabled={busy} style={{ display: "none" }} />
              </label>
              {form.image && <button type="button" className="md-tlb-btn" onClick={() => setForm((f) => ({ ...f, image: "" }))}>إزالة</button>}
            </div>
          )}
        </div>
        {err && <p role="alert" style={{ margin: ".6rem 0 0", fontSize: ".78rem", fontWeight: 800, color: "#B3261E" }}>{err}</p>}
        <div className="md-tlb-actions">
          <button type="button" className="md-tlb-btn is-primary" onClick={save} disabled={busy}>{selectedItem ? "حفظ التعديل" : "إضافة للخط الزمني"}</button>
          {selectedItem && <button type="button" className="md-tlb-btn is-danger" onClick={remove}>حذف الحدث</button>}
        </div>
      </div>
    </section>
  );
}
