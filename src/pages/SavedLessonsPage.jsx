import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listPublishedLessons } from "../lib/db";
import { useAuth } from "../lib/hooks";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import StudentAccountMenu from "../components/StudentAccountMenu";
import { SavedLessonsPanel, BookmarkIcon, SAVED_AUTH_COPY } from "../components/SavedLessons";
import { PLATFORM_CSS } from "./student-platform/platformStyles";

const TOP_CSS = `
.md-svp-top {
  position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  padding: 0.55rem clamp(0.9rem, 3vw, 1.5rem); background: rgba(255, 255, 255, 0.78);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(20, 122, 106, 0.14);
}
.md-svp-start, .md-svp-end { display: flex; align-items: center; gap: 0.7rem; min-width: 0; }
.md-svp-logo { display: inline-flex; align-items: center; }
.md-svp-logo img { display: block; height: 2.5rem; width: auto; max-width: 9rem; object-fit: contain; }
.md-svp-back { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.9rem; border: 1.5px solid var(--duo-line, #DED4BD); border-radius: 999px; background: #fff; color: #0E5348; font-size: 0.82rem; font-weight: 850; cursor: pointer; transition: border-color 0.15s ease, transform 0.15s ease; }
.md-svp-back:hover { border-color: #147A6A; transform: translateY(-1px); }
.md-svp-back:focus-visible, .md-svp-logo:focus-visible { outline: 2px solid #B8832A; outline-offset: 3px; }
html[data-theme="dark"] .md-svp-top { background: rgba(21, 32, 28, 0.78); border-bottom-color: #30423B; }
html[data-theme="dark"] .md-svp-back { background: #192723; border-color: #30423B; color: #B5DDD2; }
@media (prefers-reduced-motion: reduce) { .md-svp-back { transition: none !important; } }
.md-svh-wrap { width: 100%; max-width: 920px; margin: 14px auto 22px; padding: 0 16px; box-sizing: border-box; }
.md-svh {
  position: relative; isolation: isolate; overflow: hidden; text-align: center; color: #fff;
  padding: clamp(1.5rem, 4vw, 2.2rem) clamp(1.2rem, 3vw, 2rem); border-radius: 1.7rem;
  background: linear-gradient(125deg, #0A3F36 0%, #0E5348 38%, #147A6A 78%, #1A8F7C 100%);
  box-shadow: 0 22px 44px -24px rgba(14, 83, 72, 0.55);
}
.md-svh-orbits { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }
.md-svh-ico { display: inline-flex; align-items: center; justify-content: center; width: 4rem; height: 4rem; margin-bottom: 0.7rem; border-radius: 1.3rem; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.3); color: #F3DDB6; box-shadow: 0 6px 0 rgba(0, 0, 0, 0.14); animation: md-svh-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.md-svh-ico svg { display: block; width: 1.9rem; height: 1.9rem; }
.md-svh h1 { margin: 0; font-size: clamp(1.6rem, 4.6vw, 2.2rem); font-weight: 900; line-height: 1.4; color: #fff; }
.md-svh p { margin: 0.45rem auto 0; max-width: 32rem; font-size: 0.94rem; line-height: 1.9; font-weight: 700; color: rgba(255, 255, 255, 0.9); }
@keyframes md-svh-pop { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: none; } }
html[data-theme="dark"] .md-svh { background: linear-gradient(125deg, #062a24 0%, #0A3F36 45%, #0E5348 100%); }
@media (prefers-reduced-motion: reduce) { .md-svh-ico { animation: none !important; } }
`;

/* /student/saved — open to everyone.
   Student: all saved lessons from the account. Guest: the lessons saved on this browser + a sign-in note. */
export default function SavedLessonsPage() {
  const session = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const userId = session?.user?.id || null;
  const isDark = (() => {
    try { return localStorage.getItem("madar_theme_v1") === "dark"; } catch { return false; }
  })();
  // لو الصفحة اتفتحت مباشرة نطبّق نفس الثيم المحفوظ للمنصة
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (session === undefined) return undefined;
    setError("");
    let cancelled = false;
    setLessons(null);
    listPublishedLessons()
      .then((l) => { if (!cancelled) setLessons(l); })
      .catch(() => { if (!cancelled) setError("تعذر تحميل الدروس. تحقق من الاتصال وحاول مرة أخرى."); });
    return () => { cancelled = true; };
  }, [session === undefined, userId, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const studentName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email?.split("@")[0] ||
    "حسابي";

  return (
    <div className={`md-platform${isDark ? " is-dark" : ""}`} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{PLATFORM_CSS}</style>
      <style>{TOP_CSS}</style>
      <header className="md-svp-top">
        <div className="md-svp-start">
          <button type="button" className="md-svp-back" onClick={() => navigate("/student")}>
            <span aria-hidden="true">→</span> الرئيسية
          </button>
          <Link to="/student" className="md-svp-logo" aria-label="مَدَار — الرئيسية">
            <img src="/photo/0MSCh.png" alt="مَدَار" />
          </Link>
        </div>
        <div className="md-svp-end">
          {session === undefined ? null : session ? (
            <StudentAccountMenu session={session} name={studentName} />
          ) : (
            <button type="button" onClick={() => setAuthOpen(true)} className="md-login-btn text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: "var(--duo-green)" }}>
              تسجيل الدخول
            </button>
          )}
        </div>
      </header>

      <div className="md-svh-wrap">
        <section className="md-svh" aria-label="دروسي المحفوظة">
          <svg className="md-svh-orbits" viewBox="0 0 420 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <ellipse cx="210" cy="110" rx="190" ry="64" transform="rotate(-24 210 110)" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.5" />
            <ellipse cx="210" cy="110" rx="140" ry="46" transform="rotate(-24 210 110)" fill="none" stroke="rgba(227,192,139,.35)" strokeWidth="1.5" strokeDasharray="3 7" />
            <circle cx="338" cy="58" r="6" fill="#E3C08B" />
            <circle cx="84" cy="168" r="4" fill="rgba(255,255,255,.7)" />
          </svg>
          <span className="md-svh-ico"><BookmarkIcon /></span>
          <h1>دروسي المحفوظة</h1>
          <p>{session ? "كل الدروس التي حفظتها في مكان واحد." : "الدروس التي حفظتها على هذا المتصفح. سجّل دخولك لتحتفظ بها على كل أجهزتك."}</p>
        </section>
      </div>

      <main className="duo-saved-main">
        {error ? (
          <div className="md-alert error flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 14 }}>
            <span><span>⚠</span> {error}</span>
            <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" onClick={() => setAttempt((n) => n + 1)}>إعادة المحاولة</button>
          </div>
        ) : null}
        {error ? null : <SavedLessonsPanel session={session} lessons={lessons} hideHeader onRequireLogin={() => setAuthOpen(true)} />}
      </main>

      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} title={SAVED_AUTH_COPY.title} subtitle={SAVED_AUTH_COPY.subtitle} />
    </div>
  );
}