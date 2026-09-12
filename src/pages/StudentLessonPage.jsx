import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StudentView } from "../components/Viewer";
import { getLessonWithScenes } from "../lib/db";
import Footer from "../components/Footer";

const PROGRESS_KEY = "ts_student_progress_v1";

function saveProgress(lessonId, sceneIndex) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ lessonId, sceneIndex, savedAt: Date.now() }));
  } catch (e) {
    /* ignore */
  }
}

export default function StudentLessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null); // null = loading, false = unavailable
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    getLessonWithScenes(id)
      .then((data) => {
        if (!mounted) return;
        if (data.status !== "Published") {
          setLesson(false);
          return;
        }
        setLesson(data);
        try {
          const raw = localStorage.getItem(PROGRESS_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.lessonId === id && typeof parsed.sceneIndex === "number") {
              setSceneIndex(Math.min(parsed.sceneIndex, data.scenes.length - 1));
            }
          }
        } catch (e) {
          /* ignore */
        }
      })
      .catch(() => mounted && setLesson(false));
    return () => {
      mounted = false;
    };
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

  return (
    <div>
      <div className="bg-white px-6 py-3 border-b flex justify-between items-center" style={{ borderColor: "#DED4BD" }}>
        <button onClick={() => navigate("/student")} className="text-sm font-bold" style={{ color: "#10665A" }}>← العودة لقائمة الدروس</button>
        <span className="text-xs" style={{ color: "#8A8570" }}>منصة الطالب التعليمية</span>
      </div>
      <StudentView lesson={lesson} controlled={{ index: sceneIndex, setIndex: setSceneIndex }} />
      <Footer />
    </div>
  );
}
