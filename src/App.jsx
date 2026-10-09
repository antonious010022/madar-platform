import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext, Link, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useTeacherAuth, useStaffStatus } from "./lib/hooks";
import TeacherLogin from "./pages/TeacherLogin";
import LessonLibraryPage from "./pages/LessonLibrary";
import TeacherStudioPage from "./pages/TeacherStudio";
import TeacherFacts from "./pages/TeacherFacts";
import StudentPlatform from "./pages/StudentPlatform";
import StudentLessonPage from "./pages/StudentLessonPage";
import SavedLessonsPage from "./pages/SavedLessonsPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CmsPage from "./pages/CmsPage";
import TeacherSettings from "./pages/TeacherSettings";
import { DUO_CSS } from "./styles/duoTheme";
import { LoadSplash, RouteProgress, SwipeBackBubble } from "./components/DuoFx";

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 dir-rtl text-right" style={{ background: "#FFFFFF" }}>
      <div className="max-w-md w-full rounded-3xl p-8 bg-white text-center" style={{ border: "2px solid var(--duo-line)", boxShadow: "0 6px 0 var(--duo-line)" }}>
        <p className="text-3xl mb-3">🔒</p>
        <h1 className="font-black text-lg mb-2" style={{ color: "var(--duo-green-ink)", fontFamily: "var(--duo-font-display)" }}>ليس لديك صلاحية للوصول إلى هذه الصفحة</h1>
        <p className="text-sm mb-6" style={{ color: "var(--duo-ink-soft)" }}>
          مساحة المعلّم متاحة فقط للحسابات المصرّح لها. يمكنك العودة إلى منصة الطالب.
        </p>
        <Link
          to="/student"
          className="inline-block px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
          style={{ background: "var(--duo-green)", boxShadow: "0 4px 0 var(--duo-green-d)", fontFamily: "var(--duo-font-display)" }}
        >
          العودة إلى المنصة
        </Link>
      </div>
    </div>
  );
}

/**
 * Protects /teacher/* :
 * - no session → TeacherLogin
 * - session but not teacher/admin → AccessDenied
 * - teacher/admin → studio
 * Role comes from public.profiles (RLS); client cannot elevate itself.
 */
function TeacherGate() {
  const session = useTeacherAuth();
  const staff = useStaffStatus(session);

  if (session === undefined || (session && staff === undefined)) {
    return (
      <div className="p-10 text-center dir-rtl" style={{ color: "var(--duo-muted)", fontFamily: "var(--duo-font-display)" }}>
        جاري التحقق من الصلاحيات...
      </div>
    );
  }
  if (session === null) {
    return <TeacherLogin />;
  }
  if (!staff) {
    return <AccessDenied />;
  }
  return <Outlet context={{ session }} />;
}

function TeacherLibraryRoute() {
  const { session } = useOutletContext();
  return <LessonLibraryPage session={session} />;
}

/* Replays the page-enter animation (.md-page-enter in the Duo theme) on every
   navigation for a visual "reload" feel. Forward navigation slides the page in
   from the left, going back (browser back / edge swipe) slides it in from the
   right. This only toggles a CSS class + data attribute on a wrapper div — it
   never remounts the routed pages, so no component state, data fetch, or
   behavior inside them is affected. */
function PageTransition({ children }) {
  const location = useLocation();
  const navType = useNavigationType();
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("data-dir", navType === "POP" ? "back" : "forward");
    el.classList.remove("md-page-enter");
    void el.offsetWidth; // force reflow so the animation can replay
    el.classList.add("md-page-enter");
  }, [location.pathname]);
  return (
    <div ref={ref} className="md-page-enter">
      {children}
    </div>
  );
}

/* Edge swipe-to-go-back (RTL: start near the right edge, drag left).
   Vanilla touch listeners only — no new dependency, no change to any
   existing route/button/behavior; it simply calls the same back
   navigation a user would get from a back button.
   Visual feedback: a round arrow bubble grows out of the right edge following
   the finger and turns green once the swipe is long enough to go back. The
   bubble is driven by direct style writes on a ref (no re-renders). */
function useEdgeSwipeBack(bubbleRef) {
  const navigate = useNavigate();
  useEffect(() => {
    const EDGE = 24;
    const THRESHOLD = 90;
    const MAX_OFF_AXIS = 60;
    const MAX_DURATION = 700;
    let startX = null;
    let startY = null;
    let startT = 0;
    let tracking = false;

    function showBubble(pull, ready) {
      const el = bubbleRef.current;
      if (!el) return;
      el.style.transition = "none";
      el.style.opacity = String(Math.min(1, pull / 40));
      el.style.transform = `translateX(${70 - Math.min(pull, 110) * 0.85}px) scale(${ready ? 1.12 : 1})`;
      el.classList.toggle("ready", ready);
    }
    function hideBubble(success) {
      const el = bubbleRef.current;
      if (!el) return;
      if (success) {
        el.classList.add("go");
        setTimeout(() => {
          el.classList.remove("go", "ready");
          el.style.opacity = "0";
          el.style.transform = "";
        }, 380);
        return;
      }
      el.style.transition = "transform 0.25s ease, opacity 0.2s ease";
      el.style.opacity = "0";
      el.style.transform = "translateX(70px)";
      el.classList.remove("ready");
    }

    function onStart(e) {
      const t = e.touches[0];
      if (!t) return;
      tracking = window.innerWidth - t.clientX <= EDGE;
      if (tracking) {
        startX = t.clientX;
        startY = t.clientY;
        startT = Date.now();
      }
    }
    function onMove(e) {
      if (!tracking) return;
      const t = e.touches[0];
      if (!t || Math.abs(t.clientY - startY) > MAX_OFF_AXIS) {
        tracking = false;
        hideBubble(false);
        return;
      }
      const pull = Math.max(0, startX - t.clientX);
      const ready = pull > THRESHOLD && Date.now() - startT < MAX_DURATION && window.history.length > 1;
      showBubble(pull, ready);
    }
    function onEnd(e) {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) {
        hideBubble(false);
        return;
      }
      const dx = t.clientX - startX;
      const dt = Date.now() - startT;
      if (dx < -THRESHOLD && dt < MAX_DURATION && window.history.length > 1) {
        hideBubble(true);
        navigate(-1);
      } else {
        hideBubble(false);
      }
    }
    function onCancel() {
      if (!tracking) return;
      tracking = false;
      hideBubble(false);
    }

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onCancel);
    };
  }, [navigate, bubbleRef]);
}

function AppRoutes() {
  const bubbleRef = useRef(null);
  useEdgeSwipeBack(bubbleRef);
  return (
    <>
    <RouteProgress />
    <SwipeBackBubble bubbleRef={bubbleRef} />
    <PageTransition>
      <Routes>
        <Route path="/" element={<Navigate to="/student" replace />} />

        <Route path="/teacher" element={<TeacherGate />}>
          <Route index element={<TeacherLibraryRoute />} />
          <Route path="lesson/:id" element={<TeacherStudioPage />} />
          <Route path="lesson/:id/record" element={<TeacherStudioPage />} />
          <Route path="settings" element={<TeacherSettings />} />
          <Route path="facts" element={<TeacherFacts />} />
        </Route>

        <Route path="/student" element={<StudentPlatform />} />
        {/* SEO-friendly lesson URLs. lesson.id remains the sole identity/lookup key —
            the slug segment is cosmetic only. Both routes render StudentLessonPage. */}
        <Route path="/lessons/:id/:slug" element={<StudentLessonPage />} />
        <Route path="/lessons/:id" element={<StudentLessonPage />} />
        {/* Legacy URL kept for backward compatibility; redirects to /lessons/:id/:slug after load. */}
        <Route path="/student/lesson/:id" element={<StudentLessonPage />} />
        <Route path="/student/saved" element={<SavedLessonsPage />} />
        <Route path="/student/page/:slug" element={<CmsPage />} />
        <Route path="/student/about" element={<AboutPage />} />
        <Route path="/student/privacy" element={<PrivacyPage />} />
        <Route path="/student/terms" element={<TermsPage />} />

        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </PageTransition>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div dir="rtl">
        <LoadSplash />
        <AppRoutes />
        {/* Duolingo-style skin for every page (style only) */}
        <style>{DUO_CSS}</style>
      </div>
    </BrowserRouter>
  );
}