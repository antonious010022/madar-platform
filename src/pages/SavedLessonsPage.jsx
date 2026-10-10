import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublishedLessons } from "../lib/db";
import { useAuth } from "../lib/hooks";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import StudentAccountMenu from "../components/StudentAccountMenu";
import { SavedLessonsPanel, BookmarkIcon, SAVED_AUTH_COPY } from "../components/SavedLessons";
import { PLATFORM_CSS } from "./student-platform/platformStyles";

/* /student/saved — open to everyone.
   Student: all saved lessons. Guest: same page, locked placeholders + sign-in prompt (no data loaded). */
export default function SavedLessonsPage() {
  const session = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const userId = session?.user?.id || null;

  useEffect(() => {
    if (session === undefined) return undefined;
    setError("");
    if (!userId) {
      setLessons([]); // guests: nothing is fetched or shown
      return undefined;
    }
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
    <div className="md-platform" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{PLATFORM_CSS}</style>
      <div className="md-topbar flex justify-between items-center gap-2 px-4 sm:px-6 py-2 relative z-20" style={{ background: "transparent" }}>
        <button type="button" className="md-ctx-grade" onClick={() => navigate("/student")}>
          <span aria-hidden="true">→</span> الرئيسية
        </button>
        {session === undefined ? null : session ? (
          <StudentAccountMenu session={session} name={studentName} />
        ) : (
          <button type="button" onClick={() => setAuthOpen(true)} className="md-login-btn text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: "var(--duo-green)" }}>
            تسجيل الدخول
          </button>
        )}
      </div>

      <header className="duo-saved-hero">
        <span className="duo-saved-hero-ico"><BookmarkIcon /></span>
        <h1>دروسي المحفوظة</h1>
        <p>{session ? "كل الدروس التي حفظتها في مكان واحد." : "سجّل دخولك لتحفظ دروسك وتجدها هنا دائمًا."}</p>
      </header>

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