import { useEffect, useMemo, useState } from "react";
import {
  getGradeCovers,
  saveGradeCovers,
  uploadGradeCover,
  listPublishedLessons,
} from "../lib/db";

export default function GradeCoversAdmin() {
  const [covers, setCovers] = useState({});
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [c, lessons] = await Promise.all([
          getGradeCovers().catch(() => ({})),
          listPublishedLessons().catch(() => []),
        ]);
        if (cancelled) return;
        setCovers(c && typeof c === "object" ? { ...c } : {});
        const gs = Array.from(
          new Set((lessons || []).map((l) => l.grade).filter(Boolean))
        ).sort((a, b) => String(a).localeCompare(String(b), "ar"));
        setGrades(gs);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "تعذر التحميل");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => {
    const keys = new Set([...grades, ...Object.keys(covers || {})]);
    return Array.from(keys).sort((a, b) => String(a).localeCompare(String(b), "ar"));
  }, [grades, covers]);

  async function onFile(grade, file) {
    if (!file) return;
    setErr(""); setMsg(""); setSaving(true);
    try {
      const url = await uploadGradeCover(file, grade);
      const next = { ...covers, [grade]: url };
      setCovers(next);
      await saveGradeCovers(next);
      setMsg(`تم حفظ صورة: ${grade}`);
    } catch (e) {
      setErr(e?.message || "فشل رفع الصورة");
    } finally {
      setSaving(false);
    }
  }

  function onUrl(grade, url) {
    const next = { ...covers };
    const v = String(url || "").trim();
    if (v) next[grade] = v;
    else delete next[grade];
    setCovers(next);
  }

  async function persist() {
    setSaving(true); setErr(""); setMsg("");
    try {
      await saveGradeCovers(covers);
      setMsg("تم حفظ كل الصور.");
    } catch (e) {
      setErr(e?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid #E3E0EE" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold"
        style={{ background: "#F0F7F5", color: "#0E5348" }}
      >
        <span>🖼️ صور بطاقات الصفوف</span>
        <span style={{ color: "#6E6B85" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="p-3 bg-white">
          <p className="text-[11px] mb-3" style={{ color: "#6E6B85" }}>
            صورة هادئة لكل صف — خلفية شفافة على بطاقة اختيار الصف للطالب.
          </p>
          {loading ? (
            <p className="text-[11px]" style={{ color: "#6E6B85" }}>جاري التحميل…</p>
          ) : (
            <>
              {err ? <p className="text-[11px] mb-2" style={{ color: "#D6334B" }}>{err}</p> : null}
              {msg ? <p className="text-[11px] mb-2" style={{ color: "#0E5348" }}>{msg}</p> : null}
              {rows.length === 0 ? (
                <p className="text-[11px]" style={{ color: "#6E6B85" }}>لا توجد صفوف من الدروس المنشورة بعد.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {rows.map((g) => {
                    const url = covers[g] || "";
                    return (
                      <div key={g} className="p-2 rounded-lg" style={{ border: "1px solid #E3E0EE", background: "#F7F5FB" }}>
                        <div className="flex gap-2 items-start mb-2">
                          <div style={{
                            width: 56, height: 42, borderRadius: 8, flexShrink: 0,
                            background: url
                              ? `linear-gradient(180deg, rgba(14,83,72,.3), rgba(14,83,72,.5)), url(${url}) center/cover`
                              : "linear-gradient(135deg, #E8F3F0, #D5E8E3)",
                            border: "1px solid #E3E0EE",
                          }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold mb-1" style={{ color: "#0E5348" }}>{g}</p>
                            <input type="url" dir="ltr" className="ts-input text-[11px] w-full" placeholder="https://..."
                              value={url} onChange={(e) => onUrl(g, e.target.value)} />
                          </div>
                        </div>
                        <label className="text-[11px] font-bold cursor-pointer" style={{ color: "#147A6A" }}>
                          رفع صورة
                          <input type="file" accept="image/*" hidden disabled={saving}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (f) onFile(g, f);
                            }} />
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
              <button type="button" disabled={saving || rows.length === 0} onClick={persist}
                className="w-full mt-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "#147A6A" }}>
                {saving ? "جاري الحفظ…" : "حفظ صور الصفوف"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
