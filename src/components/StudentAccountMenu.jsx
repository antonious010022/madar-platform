import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, getStudentGradeMeta } from "../lib/db";
import { LetterAvatar } from "./AuthModal";

/* Single source of truth for the logged-in student's account menu.
   Moved verbatim (markup, classes, styles, items) from StudentPlatform.jsx.
   - Renders nothing for guests/loading: each page keeps its own guest/loading UI.
   - Home page passes `stage`, `grade` and `onChangeGrade` (its live state).
   - Other pages omit them: the grade is read with the existing getStudentGradeMeta(),
     and "change grade" opens /student with { changeGrade: true } in the router state. */
export default function StudentAccountMenu({ session, name, stage, grade, onChangeGrade }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [meta, setMeta] = useState({ stage: "", grade: "" });
  const controlled = grade !== undefined;
  const userId = session?.user?.id || null;

  useEffect(() => {
    if (controlled || !userId) return undefined;
    let cancelled = false;
    getStudentGradeMeta()
      .then((m) => { if (!cancelled) setMeta({ stage: m?.stage || "", grade: m?.grade || "" }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [controlled, userId]);

  if (!session) return null;

  const shownStage = controlled ? stage : meta.stage;
  const shownGrade = controlled ? grade : meta.grade;

  function handleChangeGrade() {
    setMenuOpen(false);
    if (onChangeGrade) onChangeGrade();
    else navigate("/student", { state: { changeGrade: true } });
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setMenuOpen((v) => !v)}
        className="md-account-btn flex items-center gap-2 rounded-full py-1 px-2 bg-white/90" style={{ border: "2px solid var(--duo-line)" }}>
        <LetterAvatar name={name} email={session.user?.email} size={28} />
        <span className="text-xs font-bold hidden sm:inline" style={{ color: "var(--duo-ink)" }}>{name}</span>
      </button>
      {menuOpen && (
        <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white py-2 z-50 dir-rtl text-right" style={{ border: "2px solid var(--duo-line)" }}>
          <button type="button" className="w-full text-right px-4 py-2 text-xs font-bold flex items-center gap-2" style={{ color: "var(--duo-orange-ink)" }}
            onClick={() => { setMenuOpen(false); navigate("/student/saved"); }}><span aria-hidden="true">🔖</span><span>دروسي المحفوظة</span></button>
          <button type="button" className="w-full text-right px-4 py-2 text-xs font-bold flex items-center gap-2" style={{ color: "var(--duo-green-ink)" }}
            onClick={handleChangeGrade}><span aria-hidden="true">🎓</span><span>تغيير الصف الدراسي</span></button>
          {shownGrade ? (
            <p className="px-4 pb-2 text-[11px]" style={{ color: "var(--duo-muted)" }}>
              الحالي: {shownStage ? shownStage + " · " : ""}{shownGrade}
            </p>
          ) : null}
          <button type="button" className="w-full text-right px-4 py-2 text-xs flex items-center gap-2" style={{ color: "var(--duo-red-d)" }}
            onClick={async () => { setMenuOpen(false); try { await signOut(); } catch (_) {} }}><span aria-hidden="true">🚪</span><span>تسجيل الخروج</span></button>
        </div>
      )}
    </div>
  );
}
