import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from "react-router-dom";
import { useTeacherAuth } from "./lib/hooks";
import TeacherLogin from "./pages/TeacherLogin";
import LessonLibraryPage from "./pages/LessonLibrary";
import TeacherStudioPage from "./pages/TeacherStudio";
import StudentPlatform from "./pages/StudentPlatform";
import StudentLessonPage from "./pages/StudentLessonPage";

// Guards every /teacher/* route: students never reach the studio, and
// write access is enforced server-side by Supabase RLS regardless of what
// happens in this component.
function TeacherGate() {
  const session = useTeacherAuth();

  if (session === undefined) {
    return <div className="p-10 text-center" style={{ color: "#8A8570" }}>جاري التحقق من الدخول...</div>;
  }
  if (session === null) {
    return <TeacherLogin />;
  }
  return <Outlet context={{ session }} />;
}

// Reads the session passed down via <Outlet context> from TeacherGate
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

          {/* Teacher routes — fully protected */}
          <Route path="/teacher" element={<TeacherGate />}>
            <Route index element={<TeacherLibraryRoute />} />
            <Route path="lesson/:id" element={<TeacherStudioPage />} />
          </Route>

          {/* Student routes — fully public */}
          <Route path="/student" element={<StudentPlatform />} />
          <Route path="/student/lesson/:id" element={<StudentLessonPage />} />

          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}