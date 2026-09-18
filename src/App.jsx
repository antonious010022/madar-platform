import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext, Link } from "react-router-dom";
import { useTeacherAuth, useStaffStatus } from "./lib/hooks";
import TeacherLogin from "./pages/TeacherLogin";
import LessonLibraryPage from "./pages/LessonLibrary";
import TeacherStudioPage from "./pages/TeacherStudio";
import StudentPlatform from "./pages/StudentPlatform";
import StudentLessonPage from "./pages/StudentLessonPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CmsPage from "./pages/CmsPage";
import TeacherSettings from "./pages/TeacherSettings";

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 dir-rtl text-right" style={{ background: "#FAF6ED" }}>
      <div className="max-w-md w-full rounded-3xl p-8 bg-white shadow-sm text-center" style={{ border: "1px solid #DED4BD" }}>
        <p className="text-3xl mb-3">🔒</p>
        <h1 className="font-black text-lg mb-2" style={{ color: "#10665A" }}>ليس لديك صلاحية للوصول إلى هذه الصفحة</h1>
        <p className="text-sm mb-6" style={{ color: "#5C5A4A" }}>
          مساحة المعلّم متاحة فقط للحسابات المصرّح لها. يمكنك العودة إلى منصة الطالب.
        </p>
        <Link
          to="/student"
          className="inline-block px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
          style={{ background: "#10665A" }}
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
      <div className="p-10 text-center dir-rtl" style={{ color: "#8A8570" }}>
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

export default function App() {
  return (
    <BrowserRouter>
      <div dir="rtl">
        <Routes>
          <Route path="/" element={<Navigate to="/student" replace />} />

          <Route path="/teacher" element={<TeacherGate />}>
            <Route index element={<TeacherLibraryRoute />} />
            <Route path="lesson/:id" element={<TeacherStudioPage />} />
            <Route path="settings" element={<TeacherSettings />} />
          </Route>

          <Route path="/student" element={<StudentPlatform />} />
          {/* SEO-friendly lesson URLs. lesson.id remains the sole identity/lookup key —
              the slug segment is cosmetic only. Both routes render StudentLessonPage. */}
          <Route path="/lessons/:id/:slug" element={<StudentLessonPage />} />
          <Route path="/lessons/:id" element={<StudentLessonPage />} />
          {/* Legacy URL kept for backward compatibility; redirects to /lessons/:id/:slug after load. */}
          <Route path="/student/lesson/:id" element={<StudentLessonPage />} />
          <Route path="/student/page/:slug" element={<CmsPage />} />
          <Route path="/student/about" element={<AboutPage />} />
          <Route path="/student/privacy" element={<PrivacyPage />} />
          <Route path="/student/terms" element={<TermsPage />} />

          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}