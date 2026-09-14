import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StudentView } from "../components/Viewer";
import { getLessonWithScenes, signOut } from "../lib/db";
import { useAuth } from "../lib/hooks";
import Footer from "../components/Footer";
import AuthModal, { GuestWelcomeBanner, LetterAvatar } from "../components/AuthModal";

const PROGRESS_KEY = "ts_student_progress_v1";

function saveProgress(lessonId, sceneIndex) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ lessonId, sceneIndex, savedAt: Date.now() }));
  } catch (e) {}
}

function displayName(session) {
  if (!session?.user) return "";
  const u = session.user;
  return u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "طالب";
}

export default function StudentLessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = useAuth();
  const [lesson, setLesson] = useState(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getLessonWithScenes(id)
      .then((data) => {
        if (!mounted) return;
        if (data.status !== "Published") { setLesson(false); return; }
        setLesson(data);
        try {
          const raw = localStorage.getItem(PROGRESS_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.lessonId === id && typeof parsed.sceneIndex === "number") {
              const max = Math.max(0, (data.scenes?.length || 1) - 1);
              setSceneIndex(Math.min(Math.max(0, parsed.sceneIndex), max));
            }
          }
        } catch (e) {}
      })
      .catch(() => mounted && setLesson(false));
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (lesson) saveProgress(id, sceneIndex);
  }, [id, lesson, sceneIndex]);

  if (lesson === null) {
    return <div className="p-10 text-center" style={{ color: "#8A8570" }}>جاري تحميل الدرس...</div>;
  }
  if (lesson === false) {
    return (
      <div className="p-10 text-center">
        <p style={{ color: "#C53030" }}>هذا الدرس غير متاح حالياً.</p>
        <button onClick={() => navigate("/student")} className="mt-4 text-sm font-bold" style={{ color: "#10665A" }}>← العودة لمنصة الطالب</button>
      </div>
    );
  }

  const name = displayName(session);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF6ED" }}>
      <div className="bg-white px-4 sm:px-6 py-3 border-b flex justify-between items-center gap-2 flex-wrap" style={{ borderColor: "#DED4BD" }}>
        <button onClick={() => navigate("/student")} className="text-sm font-bold" style={{ color: "#10665A" }}>← العودة لقائمة الدروس</button>
        <span className="text-xs font-medium truncate max-w-[40%]" style={{ color: "#8A8570" }}>{lesson?.title || "منصة الطالب التعليمية"}</span>
        <div className="relative">
          {session === undefined ? (
            <span className="text-xs" style={{ color: "#8A8570" }}>...</span>
          ) : session ? (
            <>
              <button type="button" onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-full py-1 px-2" aria-expanded={menuOpen}>
                <LetterAvatar name={name} email={session.user?.email} size={28} />
                <span className="text-xs font-bold hidden sm:inline" style={{ color: "#22291F" }}>{name}</span>
              </button>
              {menuOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-white shadow-lg py-2 z-50 dir-rtl text-right" style={{ border: "1px solid #DED4BD" }}>
                  <p className="px-4 py-1 text-xs font-bold" style={{ color: "#10665A" }}>{name}</p>
                  <button type="button" className="w-full text-right px-4 py-2 text-xs" style={{ color: "#5C5A4A" }}
                    onClick={() => { setMenuOpen(false); navigate("/student"); }}>لوحة الطالب</button>
                  <button type="button" className="w-full text-right px-4 py-2 text-xs" style={{ color: "#C53030" }}
                    onClick={async () => { setMenuOpen(false); try { await signOut(); } catch (_) {} }}>تسجيل الخروج</button>
                </div>
              )}
            </>
          ) : (
            <button type="button" onClick={() => setAuthOpen(true)} className="text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: "#10665A" }}>تسجيل الدخول</button>
          )}
        </div>
      </div>

      <StudentView
        lesson={lesson}
        controlled={{ index: sceneIndex, setIndex: setSceneIndex }}
        requireAuthForTools
        session={session}
      />

      <Footer />
      <GuestWelcomeBanner session={session} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
