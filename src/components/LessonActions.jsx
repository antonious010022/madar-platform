import { useEffect, useRef, useState } from "react";
import { isLessonSaved, setLessonSaved } from "../lib/savedLessons";

/* "حفظ الدرس" + "مشاركة الدرس" — shown side by side under the lesson description in the hero.
   - Share: native share sheet when available, otherwise copies the link.
   - Save: stored per account in Supabase (student_saved_lessons). Guests are asked to sign in. */

const CSS = `
  .md-lv-actions { display: flex; justify-content: center; align-items: stretch; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
  .md-lv-act {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 46px; padding: 8px 20px; border: 0; border-radius: 16px; cursor: pointer;
    background: #FFFFFF; color: var(--duo-blue-ink, #0F7DB3);
    font: inherit; font-size: 0.92rem; font-weight: 900; line-height: 1.2;
    box-shadow: 0 4px 0 rgba(0, 0, 0, 0.18);
    transition: transform 0.08s ease, box-shadow 0.08s ease, background 0.15s ease, color 0.15s ease;
  }
  .md-lv-act:hover:not(:disabled) { filter: brightness(1.04); }
  .md-lv-act:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 0 0 rgba(0, 0, 0, 0.18); }
  .md-lv-act:disabled { opacity: 0.7; cursor: wait; }
  .md-lv-act:focus-visible { outline: 3px solid #FFFFFF; outline-offset: 3px; }
  .md-lv-act svg { width: 20px; height: 20px; flex-shrink: 0; }
  .md-lv-act.is-saved { background: var(--duo-yellow, #FFC800); color: #5B4300; }
  .md-lv-act-note { width: 100%; margin: 4px 0 0; text-align: center; font-size: 0.8rem; font-weight: 800; color: #FFFFFF; text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18); }
  @media (max-width: 420px) { .md-lv-actions { gap: 8px; } .md-lv-act { flex: 1 1 0; padding: 8px 12px; font-size: 0.86rem; } }
`;

const ICON = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": "true" };

function BookmarkIcon({ filled }) {
  return (
    <svg {...ICON} fill={filled ? "currentColor" : "none"}>
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg {...ICON}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
    </svg>
  );
}

export default function LessonActions({ lesson, session, onRequireLogin, shareOrigin }) {
  const userId = session?.user?.id || null;
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const noteTimer = useRef(null);

  function flash(msg) {
    setNote(msg);
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(""), 2600);
  }
  useEffect(() => () => window.clearTimeout(noteTimer.current), []);

  // Saved state belongs to the signed-in account only: reset instantly on sign-out / account switch.
  useEffect(() => {
    setSaved(false);
    if (!userId || !lesson?.id) return undefined;
    let cancelled = false;
    isLessonSaved(lesson.id)
      .then((v) => {
        if (!cancelled) setSaved(!!v);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, lesson?.id]);

  async function toggleSave() {
    if (!userId) {
      flash("سجّل دخولك لحفظ الدرس");
      onRequireLogin?.();
      return;
    }
    if (busy) return;
    const next = !saved;
    setBusy(true);
    setSaved(next); // optimistic
    try {
      await setLessonSaved(lesson.id, next);
      flash(next ? "تم حفظ الدرس ✓" : "تم إلغاء الحفظ");
    } catch (err) {
      setSaved(!next);
      flash("تعذر الحفظ، حاول مرة أخرى");
      console.warn("save lesson:", err);
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    // Short link: /lessons/<id> only. The title slug (Arabic → long %D9%85… encoding) is cosmetic,
    // and the lesson page still resolves the lesson by id and shows the full readable URL.
    const origin = shareOrigin || window.location.origin;
    const url = lesson?.id ? `${origin}/lessons/${lesson.id}` : `${origin}${window.location.pathname}`;
    const title = lesson?.title || "درس على مَدَار";
    const text = `تعلّم درس "${title}" على منصة مَدَار`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (err) {
      if (err && err.name === "AbortError") return; // user closed the share sheet
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("تم نسخ رابط الدرس ✓");
    } catch {
      window.prompt("انسخ رابط الدرس:", url);
    }
  }

  return (
    <div className="md-lv-actions">
      <style>{CSS}</style>
      <button
        type="button"
        className={`md-lv-act${saved ? " is-saved" : ""}`}
        onClick={toggleSave}
        disabled={busy}
        aria-pressed={saved}
      >
        <BookmarkIcon filled={saved} />
        <span>{saved ? "تم حفظ الدرس" : "حفظ الدرس"}</span>
      </button>
      <button type="button" className="md-lv-act" onClick={share}>
        <ShareIcon />
        <span>مشاركة الدرس</span>
      </button>
      <p className="md-lv-act-note" role="status" aria-live="polite">{note}</p>
    </div>
  );
}
