
import { useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useOutletContext,
  Link,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";

import { useTeacherAuth, useStaffStatus, useAuth } from "./lib/hooks";
import { readGuestGradeLocal } from "./pages/student-platform/helpers";

import TeacherLogin from "./pages/TeacherLogin";
import LessonLibraryPage from "./pages/LessonLibrary";
import TeacherStudioPage from "./pages/TeacherStudio";
import TeacherFacts from "./pages/TeacherFacts";
import LandingPage from "./pages/LandingPage";
import StudentPlatform from "./pages/StudentPlatform";
import StudentLessonPage from "./pages/StudentLessonPage";
import SavedLessonsPage from "./pages/SavedLessonsPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CmsPage from "./pages/CmsPage";
import TeacherSettings from "./pages/TeacherSettings";

import { DUO_CSS } from "./styles/duoTheme";
import {
  LoadSplash,
  RouteProgress,
  SwipeBackBubble,
} from "./components/DuoFx";

function AccessDenied() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 dir-rtl text-right"
      style={{ background: "var(--lp-bg, #FFFFFF)" }}
    >
      <div
        className="max-w-md w-full rounded-3xl p-8 text-center"
        style={{
          background: "var(--lp-surface, #FFFFFF)",
          border: "1px solid var(--duo-line)",
          boxShadow: "0 18px 50px -28px rgba(14, 83, 72, 0.25)",
        }}
      >
        <p className="text-3xl mb-3">🔒</p>

        <h1
          className="font-black text-lg mb-2"
          style={{
            color: "var(--duo-green-ink)",
            fontFamily: "var(--duo-font-display)",
          }}
        >
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </h1>

        <p
          className="text-sm mb-6"
          style={{ color: "var(--duo-ink-soft)" }}
        >
          مساحة المعلّم متاحة فقط للحسابات المصرّح لها.
          يمكنك العودة إلى منصة الطالب.
        </p>

        <Link
          to="/student"
          className="inline-block px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
          style={{
            background: "var(--duo-green)",
            boxShadow: "0 10px 22px -12px rgba(20, 122, 106, 0.7)",
            fontFamily: "var(--duo-font-display)",
          }}
        >
          العودة إلى المنصة
        </Link>
      </div>
    </div>
  );
}

/**
 * Protects /teacher/*:
 * - No session -> TeacherLogin
 * - Session but not teacher/admin -> AccessDenied
 * - Teacher/admin -> teacher pages
 */
function TeacherGate() {
  const session = useTeacherAuth();
  const staff = useStaffStatus(session);

  if (session === undefined || (session && staff === undefined)) {
    return (
      <div
        className="p-10 text-center dir-rtl"
        style={{
          color: "var(--duo-muted)",
          fontFamily: "var(--duo-font-display)",
        }}
      >
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

/**
 * Checks whether a guest grade is saved locally.
 * Uses the existing helper and supports legacy keys.
 */
function hasValidGuestGrade(readGrade) {
  try {
    const data =
      typeof readGrade === "function" ? readGrade() : null;

    if (data && typeof data === "object") {
      const grade =
        typeof data.grade === "string" ? data.grade.trim() : "";

      if (grade) return true;
    }
  } catch {
    // Try the stored keys if the helper fails.
  }

  for (const key of [
    "madar_guest_stage_grade_v1",
    "madar_guest_grade_v1",
  ]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") continue;

      const grade =
        typeof data.grade === "string" ? data.grade.trim() : "";

      if (grade) return true;
    } catch {
      // Ignore invalid stored data.
    }
  }

  return false;
}

function resolveHomeTarget(session, readGrade) {
  if (session === undefined) return "wait";
  if (session) return "student";

  return hasValidGuestGrade(readGrade) ? "student" : "landing";
}

/**
 * Smart home route:
 * - New visitor -> LandingPage
 * - Signed-in student -> /student
 * - Guest with saved grade -> /student
 *
 * /welcome is the explicit route for opening LandingPage at any time.
 */
function HomeGate() {
  const session = useAuth();
  const target = resolveHomeTarget(session, readGuestGradeLocal);

  if (target === "wait") {
    return (
      <div
        aria-busy="true"
        style={{
          minHeight: "100vh",
          background: "var(--lp-bg, #FFFFFF)",
        }}
      />
    );
  }

  if (target === "student") {
    return <Navigate to="/student" replace />;
  }

  return <LandingPage />;
}

/**
 * Replays the page-enter animation on navigation.
 */
function PageTransition({ children }) {
  const location = useLocation();
  const navType = useNavigationType();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.setAttribute(
      "data-dir",
      navType === "POP" ? "back" : "forward"
    );

    el.classList.remove("md-page-enter");
    void el.offsetWidth;
    el.classList.add("md-page-enter");
  }, [location.pathname, navType]);

  return (
    <div ref={ref} className="md-page-enter">
      {children}
    </div>
  );
}

/**
 * Edge swipe-to-go-back for touch devices.
 */
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
      el.style.transform =
        `translateX(${70 - Math.min(pull, 110) * 0.85}px) ` +
        `scale(${ready ? 1.12 : 1})`;

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

      el.style.transition =
        "transform 0.25s ease, opacity 0.2s ease";
      el.style.opacity = "0";
      el.style.transform = "translateX(70px)";
      el.classList.remove("ready");
    }

    function onStart(e) {
      const touch = e.touches[0];
      if (!touch) return;

      tracking = window.innerWidth - touch.clientX <= EDGE;

      if (tracking) {
        startX = touch.clientX;
        startY = touch.clientY;
        startT = Date.now();
      }
    }

    function onMove(e) {
      if (!tracking) return;

      const touch = e.touches[0];

      if (
        !touch ||
        Math.abs(touch.clientY - startY) > MAX_OFF_AXIS
      ) {
        tracking = false;
        hideBubble(false);
        return;
      }

      const pull = Math.max(0, startX - touch.clientX);
      const ready =
        pull > THRESHOLD &&
        Date.now() - startT < MAX_DURATION &&
        window.history.length > 1;

      showBubble(pull, ready);
    }

    function onEnd(e) {
      if (!tracking) return;

      tracking = false;

      const touch = e.changedTouches[0];

      if (!touch) {
        hideBubble(false);
        return;
      }

      const dx = touch.clientX - startX;
      const duration = Date.now() - startT;

      if (
        dx < -THRESHOLD &&
        duration < MAX_DURATION &&
        window.history.length > 1
      ) {
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

    document.addEventListener("touchstart", onStart, {
      passive: true,
    });
    document.addEventListener("touchmove", onMove, {
      passive: true,
    });
    document.addEventListener("touchend", onEnd, {
      passive: true,
    });
    document.addEventListener("touchcancel", onCancel, {
      passive: true,
    });

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
          {/* Smart entry point */}
          <Route path="/" element={<HomeGate />} />

          {/* Landing page, always accessible */}
          <Route path="/welcome" element={<LandingPage />} />

          {/* Independent About page */}
          <Route path="/about" element={<AboutPage />} />

          {/* Teacher area */}
          <Route path="/teacher" element={<TeacherGate />}>
            <Route index element={<TeacherLibraryRoute />} />
            <Route
              path="lesson/:id"
              element={<TeacherStudioPage />}
            />
            <Route
              path="lesson/:id/record"
              element={<TeacherStudioPage />}
            />
            <Route
              path="settings"
              element={<TeacherSettings />}
            />
            <Route path="facts" element={<TeacherFacts />} />
          </Route>

          {/* Student platform */}
          <Route path="/student" element={<StudentPlatform />} />

          {/* Lesson URLs */}
          <Route
            path="/lessons/:id/:slug"
            element={<StudentLessonPage />}
          />
          <Route
            path="/lessons/:id"
            element={<StudentLessonPage />}
          />
          <Route
            path="/student/lesson/:id"
            element={<StudentLessonPage />}
          />

          <Route
            path="/student/saved"
            element={<SavedLessonsPage />}
          />

          <Route
            path="/student/page/:slug"
            element={<CmsPage />}
          />

          {/* Legacy About URL */}
          <Route
            path="/student/about"
            element={<Navigate to="/about" replace />}
          />

          <Route
            path="/student/privacy"
            element={<PrivacyPage />}
          />

          <Route
            path="/student/terms"
            element={<TermsPage />}
          />

          {/* Unknown URLs */}
          <Route
            path="*"
            element={<Navigate to="/student" replace />}
          />
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

        {/* Global visual theme */}
        <style>{DUO_CSS}</style>
      </div>
    </BrowserRouter>
  );
}
