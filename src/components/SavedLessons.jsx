import { useNavigate } from "react-router-dom";
import { useSavedLessonIds } from "../lib/useSavedLessons";
import { lessonPath, isLessonComingSoon } from "../pages/student-platform/helpers";

/* "دروسي المحفوظة" — the same block for everyone:
   - signed-in student → their saved lessons from the account (cards, open / remove)
   - guest             → the lessons saved on this browser, same cards, plus a small "sign in to keep them" note */

export const SAVED_AUTH_COPY = {
  title: "سجّل دخولك لتحتفظ بدروسك على كل أجهزتك",
  subtitle: "دروسك المحفوظة الآن على هذا المتصفح فقط. سجّل دخولك لتجدها من أي جهاز.",
};

const NOTE_CSS = `
.duo-saved-guestnote { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 14px; margin: 0 0 14px; padding: 12px 16px; background: var(--duo-yellow-s); border: 1px dashed var(--duo-yellow); border-radius: 18px; color: var(--duo-yellow-ink); }
.duo-saved-guestnote > span { font-size: 1.3rem; }
.duo-saved-guestnote p { flex: 1 1 200px; margin: 0; font-size: 0.86rem; font-weight: 700; line-height: 1.7; }
.duo-saved-guestnote b { font-weight: 800; }
.duo-saved-guestnote button { padding: 7px 18px; border: 0; border-radius: 14px; background: var(--duo-orange); color: #FFFFFF; font: inherit; font-size: 0.84rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.18); transition: transform 0.08s ease, box-shadow 0.08s ease; }
.duo-saved-guestnote button:active { transform: translateY(3px); box-shadow: 0 0 0 transparent; }
`;

const ICON = { viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };

export function BookmarkIcon({ filled = true }) {
  return (
    <svg {...ICON} fill={filled ? "currentColor" : "none"} stroke="currentColor">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function metaOf(l) {
  return [l.stage, l.grade, l.term, l.subject].filter(Boolean).join(" · ");
}

function SavedCard({ lesson, index, onOpen, onRemove }) {
  const soon = isLessonComingSoon(lesson);
  return (
    <article className="duo-saved-card" data-accent={index % 6} style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}>
      <button type="button" className="duo-saved-open" onClick={() => onOpen(lesson)} disabled={soon}>
        <span className="duo-saved-badge"><BookmarkIcon /></span>
        <span className="duo-saved-body">
          <span className="duo-saved-name">{lesson.title}</span>
          {metaOf(lesson) ? <span className="duo-saved-meta">{metaOf(lesson)}</span> : null}
          {soon ? <span className="duo-saved-soon">⏳ قريبًا</span> : null}
        </span>
        {!soon ? <span className="duo-saved-go" aria-hidden="true">‹</span> : null}
      </button>
      <button type="button" className="duo-saved-remove" onClick={() => onRemove(lesson.id)} aria-label={`إزالة «${lesson.title}» من المحفوظات`} title="إزالة من المحفوظات">
        <BookmarkIcon />
      </button>
    </article>
  );
}

function GhostCard({ index }) {
  return (
    <div className="duo-saved-card ghost" data-accent={index % 6} aria-hidden="true">
      <div className="duo-saved-open" style={{ cursor: "default" }}>
        <span className="duo-saved-ghostbadge" />
        <span className="duo-saved-body" style={{ flex: 1 }}>
          <span className="duo-saved-bar" style={{ width: `${70 - index * 8}%` }} />
          <span className="duo-saved-bar" style={{ width: "42%", height: 9 }} />
        </span>
      </div>
    </div>
  );
}

function GhostList({ count = 3 }) {
  return (
    <div className="duo-saved-list">
      {Array.from({ length: count }).map((_, i) => <GhostCard key={i} index={i} />)}
    </div>
  );
}

/**
 * props:
 *  session         useAuth() value (undefined = still checking, null = guest)
 *  lessons         published lessons already loaded by the page (null while loading)
 *  limit           show only the latest N (home) — omit to show all (saved page)
 *  onRequireLogin  guest tapped the prompt → open the sign-in modal
 *  onSeeAll        "عرض الكل" tapped (home only)
 *  hideHeader      the page draws its own heading
 */
export function SavedLessonsPanel({ session, lessons, limit, onRequireLogin, onSeeAll, hideHeader = false }) {
  const navigate = useNavigate();
  const { ids, error, remove, reload } = useSavedLessonIds(session);

  const open = (lesson) => navigate(lessonPath(lesson));

  let body;
  let count = null;

  if (session === undefined) {
    body = <GhostList />;
  } else if (ids === null || lessons === null) {
    body = <GhostList />;
  } else {
    const byId = new Map(lessons.map((l) => [String(l.id), l]));
    const items = ids.map((id) => byId.get(id)).filter(Boolean);
    count = items.length;
    const shown = limit ? items.slice(0, limit) : items;
    body = (
      <>
        {!session && onRequireLogin ? (
          <div className="duo-saved-guestnote">
            <span aria-hidden="true">💾</span>
            <p><b>محفوظة على هذا الجهاز فقط.</b> سجّل دخولك لتحتفظ بها وتجدها من أي جهاز.</p>
            <button type="button" onClick={onRequireLogin}>تسجيل الدخول</button>
          </div>
        ) : null}
        {error ? (
          <div className="md-alert error flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 12 }}>
            <span><span>⚠</span> {error}</span>
            <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" onClick={reload}>إعادة المحاولة</button>
          </div>
        ) : null}
        {shown.length === 0 ? (
          <div className="duo-saved-empty">
            <b>لا توجد دروس محفوظة بعد</b>
            افتح أي درس واضغط «حفظ الدرس» ليظهر هنا.
          </div>
        ) : (
          <div className="duo-saved-list">
            {shown.map((l, i) => <SavedCard key={l.id} lesson={l} index={i} onOpen={open} onRemove={remove} />)}
          </div>
        )}
        {limit && count > limit && onSeeAll ? (
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button type="button" className="duo-saved-all" onClick={onSeeAll}>عرض الكل ({count})</button>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="duo-saved">
      <style>{NOTE_CSS}</style>
      {hideHeader ? null : (
        <div className="duo-saved-head">
          <h2 className="duo-saved-title">
            <span className="ico"><BookmarkIcon /></span>
            دروسي المحفوظة
            {count ? <span className="duo-saved-count">{count}</span> : null}
          </h2>
        </div>
      )}
      {body}
    </div>
  );
}

/* Home-page section. Same for guests and students. */
export function SavedLessonsSection({ session, lessons, limit = 3, onRequireLogin }) {
  const navigate = useNavigate();
  return (
    <section className="md-dashboard mb-6" aria-label="دروسي المحفوظة">
      <SavedLessonsPanel session={session} lessons={lessons} limit={limit} onRequireLogin={onRequireLogin} onSeeAll={() => navigate("/student/saved")} />
    </section>
  );
}
