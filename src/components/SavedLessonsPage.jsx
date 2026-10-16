import { useNavigate } from "react-router-dom";
import { useSavedLessonIds } from "../lib/useSavedLessons";
import { useGuestSavedIds } from "../lib/guestSavedLessons";
import { lessonPath, isLessonComingSoon } from "../pages/student-platform/helpers";

/* "دروسي المحفوظة" — نفس البلوك للجميع:
   - طالب مسجّل  → دروسه المحفوظة في حسابه (Supabase، عبر useSavedLessonIds)
   - زائر        → دروسه المحفوظة على هذا المتصفح (localStorage)، مع تنبيه لطيف إنه يقدر يسجّل دخوله
   الستايل هنا من نفس عائلة المنصة (md-*): كروت بحدّ جانبي ملوّن، أخضر المنصة، ووضع داكن. */

export const SAVED_AUTH_COPY = {
  title: "سجّل دخولك لتحتفظ بدروسك على كل أجهزتك",
  subtitle: "دروسك المحفوظة حاليًا على هذا المتصفح فقط. سجّل دخولك لتجدها من أي جهاز.",
};

const COLORS = ["#147A6A", "#B8832A", "#4C7FA1", "#A8587A", "#6B5A9E", "#3F8F4B"];
const ICON = { viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };

export function BookmarkIcon({ filled = true }) {
  return (
    <svg {...ICON} fill={filled ? "currentColor" : "none"} stroke="currentColor">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

const SV_CSS = `
.md-sv { direction: rtl; }
.md-sv svg { width: 1.2rem; height: 1.2rem; display: block; }
.md-sv-head { display: flex; align-items: center; margin-bottom: 0.9rem; }
.md-sv-title { margin: 0; display: flex; align-items: center; gap: 0.55rem; font-size: 1.02rem; font-weight: 900; color: #0E5348; }
.md-sv-title .ico { width: 2.1rem; height: 2.1rem; border-radius: 0.7rem; display: inline-flex; align-items: center; justify-content: center; background: #FBF3E1; color: #B8832A; }
.md-sv-count { padding: 0.05rem 0.65rem; border-radius: 999px; background: #147A6A; color: #fff; font-size: 0.78rem; font-weight: 900; }

.md-sv-note { display: flex; align-items: center; flex-wrap: wrap; gap: 0.7rem 0.9rem; margin: 0 0 1rem; padding: 0.8rem 1rem; border-radius: 1.1rem; background: #FBF3E1; border: 1px dashed #E3B93C; }
.md-sv-note-ico { flex: none; font-size: 1.3rem; }
.md-sv-note p { flex: 1 1 14rem; margin: 0; font-size: 0.84rem; line-height: 1.7; font-weight: 700; color: #5E4309; }
.md-sv-note p b { font-weight: 900; }
.md-sv-note button { flex: none; padding: 0.5rem 1.1rem; border: 0; border-radius: 999px; background: #147A6A; color: #fff; font-size: 0.82rem; font-weight: 900; cursor: pointer; box-shadow: 0 3px 0 #0E5348; }
.md-sv-note button:hover { filter: brightness(1.06); }

.md-sv-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr)); gap: 0.85rem; }
.md-sv-card {
  display: flex; align-items: stretch; overflow: hidden; background: #fff;
  border: 1px solid var(--duo-line, #DED4BD); border-inline-start: 5px solid var(--u, #147A6A); border-radius: 1.15rem;
  box-shadow: 0 12px 26px -22px rgba(14, 83, 72, 0.5);
  animation: md-sv-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.md-sv-card:hover { transform: translateY(-3px); box-shadow: 0 18px 30px -20px rgba(14, 83, 72, 0.6); }
.md-sv-open { flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.8rem; padding: 0.9rem 0.95rem; border: 0; background: transparent; text-align: right; cursor: pointer; color: inherit; font: inherit; }
.md-sv-open:disabled { cursor: default; opacity: 0.75; }
.md-sv-open:focus-visible { outline: 2px solid var(--u, #147A6A); outline-offset: -2px; }
.md-sv-ico { flex: none; width: 2.6rem; height: 2.6rem; border-radius: 0.85rem; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--u) 14%, #fff); color: var(--u); }
.md-sv-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
.md-sv-body b { font-size: 0.95rem; font-weight: 850; line-height: 1.5; color: #2D3A36; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.md-sv-body small { font-size: 0.74rem; font-weight: 700; color: #6B7A75; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.md-sv-soon { width: fit-content; padding: 0.05rem 0.6rem; border-radius: 999px; background: #FBF3E1; color: #86600F; font-size: 0.72rem; font-weight: 800; font-style: normal; }
.md-sv-go { flex: none; font-size: 1.35rem; font-weight: 800; color: var(--u); transition: transform 0.16s ease; }
.md-sv-card:hover .md-sv-go { transform: translateX(-3px); }
.md-sv-remove { flex: none; width: 3rem; border: 0; border-inline-start: 1px dashed var(--duo-line, #DED4BD); background: transparent; color: #B8832A; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s ease, color 0.15s ease; }
.md-sv-remove:hover { background: #FBF3E1; color: #8A5F0F; }
.md-sv-remove:focus-visible { outline: 2px solid #B8832A; outline-offset: -2px; }

.md-sv-ghost { height: 4.6rem; border-radius: 1.15rem; border: 1px solid var(--duo-line, #DED4BD); border-inline-start: 5px solid #D5DDD9; background: linear-gradient(100deg, #F1F4F2 30%, #FAFBFA 50%, #F1F4F2 70%); background-size: 220% 100%; animation: md-sv-shimmer 1.4s linear infinite; }
.md-sv-empty { text-align: center; padding: 2.2rem 1.2rem; border-radius: 1.5rem; background: #fff; border: 2px dashed #E3D9BD; }
.md-sv-empty-ico { width: 4.2rem; height: 4.2rem; margin: 0 auto 0.85rem; border-radius: 1.3rem; display: flex; align-items: center; justify-content: center; background: #FBF3E1; color: #B8832A; box-shadow: 0 6px 0 #F0D48A; }
.md-sv-empty-ico svg { width: 1.9rem; height: 1.9rem; }
.md-sv-empty b { display: block; margin-bottom: 0.3rem; font-size: 1.08rem; font-weight: 900; color: #0E5348; }
.md-sv-empty p { margin: 0 0 1.1rem; font-size: 0.88rem; line-height: 1.8; color: #5A6B65; }
.md-sv-empty button, .md-sv-all { padding: 0.6rem 1.4rem; border: 0; border-radius: 999px; background: #147A6A; color: #fff; font-size: 0.88rem; font-weight: 900; cursor: pointer; box-shadow: 0 4px 0 #0E5348; }
.md-sv-empty button:hover, .md-sv-all:hover { filter: brightness(1.06); }
.md-sv-err { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.7rem; margin-bottom: 0.9rem; padding: 0.7rem 1rem; border-radius: 1rem; background: #FDECEA; border: 1px solid #F2B8B5; color: #B3261E; font-size: 0.84rem; font-weight: 700; }
.md-sv-err button { padding: 0.35rem 0.9rem; border: 0; border-radius: 999px; background: #B3261E; color: #fff; font-size: 0.78rem; font-weight: 800; cursor: pointer; }

@keyframes md-sv-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes md-sv-shimmer { from { background-position: 120% 0; } to { background-position: -120% 0; } }

html[data-theme="dark"] .md-sv-title { color: #B5DDD2; }
html[data-theme="dark"] .md-sv-title .ico, html[data-theme="dark"] .md-sv-empty-ico { background: rgba(227, 192, 139, 0.12); color: #E3C08B; box-shadow: 0 6px 0 #5C4A14; }
html[data-theme="dark"] .md-sv-note { background: rgba(227, 192, 139, 0.1); border-color: #8A6D1C; }
html[data-theme="dark"] .md-sv-note p { color: #E3C08B; }
html[data-theme="dark"] .md-sv-card, html[data-theme="dark"] .md-sv-empty { background: #192723; border-color: #30423B; }
html[data-theme="dark"] .md-sv-card { border-inline-start-color: var(--u, #3A9C89); }
html[data-theme="dark"] .md-sv-ico { background: color-mix(in srgb, var(--u) 22%, #15201c); }
html[data-theme="dark"] .md-sv-body b { color: #EAF1ED; }
html[data-theme="dark"] .md-sv-body small, html[data-theme="dark"] .md-sv-empty p { color: #A5B7AF; }
html[data-theme="dark"] .md-sv-empty b { color: #B5DDD2; }
html[data-theme="dark"] .md-sv-remove { border-inline-start-color: #30423B; color: #E3C08B; }
html[data-theme="dark"] .md-sv-remove:hover { background: rgba(227, 192, 139, 0.12); }
html[data-theme="dark"] .md-sv-ghost { background: linear-gradient(100deg, #1E2C28 30%, #243530 50%, #1E2C28 70%); background-size: 220% 100%; border-color: #30423B; }
@media (prefers-reduced-motion: reduce) { .md-sv-card, .md-sv-ghost { animation: none !important; } .md-sv-go, .md-sv-card { transition: none !important; } }
`;

function metaOf(l) {
  return [l.grade, l.term, l.subject].filter(Boolean).join(" · ");
}

function SavedCard({ lesson, index, onOpen, onRemove }) {
  const soon = isLessonComingSoon(lesson);
  return (
    <article className="md-sv-card" style={{ "--u": COLORS[index % COLORS.length], animationDelay: `${Math.min(index, 8) * 0.05}s` }}>
      <button type="button" className="md-sv-open" onClick={() => onOpen(lesson)} disabled={soon}>
        <span className="md-sv-ico"><BookmarkIcon /></span>
        <span className="md-sv-body">
          <b>{lesson.title}</b>
          {metaOf(lesson) ? <small>{metaOf(lesson)}</small> : null}
          {soon ? <em className="md-sv-soon">⏳ قريبًا</em> : null}
        </span>
        {!soon ? <span className="md-sv-go" aria-hidden="true">‹</span> : null}
      </button>
      <button type="button" className="md-sv-remove" onClick={() => onRemove(lesson.id)} aria-label={`إزالة «${lesson.title}» من المحفوظات`} title="إزالة من المحفوظات">
        <BookmarkIcon />
      </button>
    </article>
  );
}

function GhostList({ count = 3 }) {
  return (
    <div className="md-sv-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => <div key={i} className="md-sv-ghost" />)}
    </div>
  );
}

/**
 * props:
 *  session         useAuth() (undefined = بيتأكد، null = زائر)
 *  lessons         الدروس المنشورة اللي الصفحة حمّلتها (null وهي بتحمّل) — للزائر برضه
 *  limit           آخر N درس فقط (للرئيسية) — اتركها فاضية لعرض الكل
 *  onRequireLogin  الزائر ضغط «تسجيل الدخول» (يفتح مودال الدخول)
 *  onSeeAll        «عرض الكل» (للرئيسية فقط)
 *  hideHeader      الصفحة بترسم عنوانها بنفسها
 */
export function SavedLessonsPanel({ session, lessons, limit, onRequireLogin, onSeeAll, hideHeader = false }) {
  const navigate = useNavigate();
  const account = useSavedLessonIds(session);
  const guest = useGuestSavedIds();
  const isGuest = session === null;
  const { ids, error, remove, reload } = isGuest ? guest : account;

  const open = (lesson) => navigate(lessonPath(lesson));

  let body;
  let count = null;

  if (session === undefined || ids === null || lessons === null) {
    body = <GhostList />;
  } else {
    const byId = new Map(lessons.map((l) => [String(l.id), l]));
    const items = ids.map((id) => byId.get(String(id))).filter(Boolean);
    count = items.length;
    const shown = limit ? items.slice(0, limit) : items;
    body = (
      <>
        {isGuest && onRequireLogin ? (
          <div className="md-sv-note">
            <span className="md-sv-note-ico" aria-hidden="true">💾</span>
            <p><b>محفوظة على هذا الجهاز فقط.</b> {SAVED_AUTH_COPY.title}.</p>
            <button type="button" onClick={onRequireLogin}>تسجيل الدخول</button>
          </div>
        ) : null}
        {error ? (
          <div className="md-sv-err">
            <span>⚠ {error}</span>
            <button type="button" onClick={reload}>إعادة المحاولة</button>
          </div>
        ) : null}
        {shown.length === 0 ? (
          <div className="md-sv-empty">
            <span className="md-sv-empty-ico"><BookmarkIcon filled={false} /></span>
            <b>لا توجد دروس محفوظة بعد</b>
            <p>افتح أي درس واضغط «حفظ الدرس» ليظهر هنا، وترجع له في أي وقت.</p>
            <button type="button" onClick={() => navigate("/student")}>تصفّح الدروس</button>
          </div>
        ) : (
          <div className="md-sv-list">
            {shown.map((l, i) => <SavedCard key={l.id} lesson={l} index={i} onOpen={open} onRemove={remove} />)}
          </div>
        )}
        {limit && count > limit && onSeeAll ? (
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button type="button" className="md-sv-all" onClick={onSeeAll}>عرض الكل ({count})</button>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="md-sv">
      <style>{SV_CSS}</style>
      {hideHeader ? null : (
        <div className="md-sv-head">
          <h2 className="md-sv-title">
            <span className="ico"><BookmarkIcon /></span>
            دروسي المحفوظة
            {count ? <span className="md-sv-count">{count}</span> : null}
          </h2>
        </div>
      )}
      {body}
    </div>
  );
}

/* قسم للصفحة الرئيسية. نفس السلوك للزائر والطالب. */
export function SavedLessonsSection({ session, lessons, limit = 3, onRequireLogin }) {
  const navigate = useNavigate();
  return (
    <section className="md-dashboard mb-6" aria-label="دروسي المحفوظة">
      <SavedLessonsPanel session={session} lessons={lessons} limit={limit} onRequireLogin={onRequireLogin} onSeeAll={() => navigate("/student/saved")} />
    </section>
  );
}