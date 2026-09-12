import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublishedLessons } from "../lib/db";
import Footer from "../components/Footer";

export default function StudentPlatform() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState(null); // null = loading
  const [error, setError] = useState("");

  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    listPublishedLessons()
      .then(setLessons)
      .catch(() => setError("تعذر تحميل الدروس المنشورة."));
  }, []);

  // كل الاختيارات التالية مشتقة فقط من الدروس المنشورة الفعلية
  // (listPublishedLessons) — لا تُستخدم أي قوائم ثابتة هنا.
  const availableStages = useMemo(() => {
    if (!lessons) return [];
    return Array.from(new Set(lessons.map((l) => l.stage)));
  }, [lessons]);

  const availableGrades = useMemo(() => {
    if (!lessons || !selectedStage) return [];
    const list = lessons.filter((l) => l.stage === selectedStage);
    return Array.from(new Set(list.map((l) => l.grade)));
  }, [lessons, selectedStage]);

  const availableTerms = useMemo(() => {
    if (!lessons || !selectedStage || !selectedGrade) return [];
    const list = lessons.filter((l) => l.stage === selectedStage && l.grade === selectedGrade);
    return Array.from(new Set(list.map((l) => l.term)));
  }, [lessons, selectedStage, selectedGrade]);

  const availableSubjects = useMemo(() => {
    if (!lessons) return [];
    let list = lessons;
    if (selectedStage) list = list.filter((l) => l.stage === selectedStage);
    if (selectedGrade) list = list.filter((l) => l.grade === selectedGrade);
    if (selectedTerm) list = list.filter((l) => l.term === selectedTerm);
    return Array.from(new Set(list.map((l) => l.subject)));
  }, [lessons, selectedStage, selectedGrade, selectedTerm]);

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    let list = lessons;
    if (selectedStage) list = list.filter((l) => l.stage === selectedStage);
    if (selectedGrade) list = list.filter((l) => l.grade === selectedGrade);
    if (selectedTerm) list = list.filter((l) => l.term === selectedTerm);
    if (selectedSubject) list = list.filter((l) => l.subject === selectedSubject);
    return list;
  }, [lessons, selectedStage, selectedGrade, selectedTerm, selectedSubject]);

  return (
<div className="ts-root flex flex-col justify-between" style={{ minHeight: "calc(100vh - 41px)", background: "#FAF6ED" }}>
  <div className="max-w-3xl mx-auto px-5 py-10 w-full flex-grow">
    <div className="text-center mb-8">
      <h1 className="ts-display text-4xl font-bold mb-2 flex items-center justify-center gap-3" style={{ color: "#10665A" }}>
        <img 
          src="/photo/IevsR.png" 
          alt="مَدَار" 
          style={{ height: "42px", width: "auto" }}
        />
        مرحباً بك في منصة مَدَار
      </h1>
      <p className="text-base" style={{ color: "#5C5A4A" }}>تعلم الدراسات الاجتماعية بأسلوب تفاعلي ومرئي</p>
    </div>

        {error && <p className="text-sm text-center mb-6" style={{ color: "#C53030" }}>{error}</p>}
        {lessons === null && !error && <p className="text-sm text-center" style={{ color: "#8A8570" }}>جاري التحميل...</p>}

        {lessons !== null && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2" style={{ color: "#22291F" }}>1. المرحلة الدراسية:</label>
              {availableStages.length === 0 ? (
                <p className="text-sm" style={{ color: "#8A8570" }}>لا توجد دروس منشورة حالياً.</p>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {availableStages.map((st) => (
                    <button
                      key={st}
                      onClick={() => { setSelectedStage(st); setSelectedGrade(""); setSelectedTerm(""); setSelectedSubject(""); }}
                      className="px-5 py-3 rounded-2xl font-bold transition-all shadow-sm"
                      style={{
                        background: selectedStage === st ? "#10665A" : "#FFFFFF",
                        color: selectedStage === st ? "#FAF6ED" : "#22291F",
                        border: "1px solid " + (selectedStage === st ? "#10665A" : "#DED4BD"),
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStage && (
              <div className="ts-fade mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: "#22291F" }}>2. الصف الدراسي:</label>
                {availableGrades.length === 0 ? (
                  <p className="text-sm" style={{ color: "#8A8570" }}>لا توجد صفوف دراسية منشورة لهذه المرحلة حالياً.</p>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    {availableGrades.map((g) => (
                      <button
                        key={g}
                        onClick={() => { setSelectedGrade(g); setSelectedTerm(""); setSelectedSubject(""); }}
                        className="px-5 py-3 rounded-2xl font-bold transition-all shadow-sm"
                        style={{
                          background: selectedGrade === g ? "#10665A" : "#FFFFFF",
                          color: selectedGrade === g ? "#FAF6ED" : "#22291F",
                          border: "1px solid " + (selectedGrade === g ? "#10665A" : "#DED4BD"),
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedGrade && (
              <div className="ts-fade mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: "#22291F" }}>3. الفصل الدراسي:</label>
                {availableTerms.length === 0 ? (
                  <p className="text-sm" style={{ color: "#8A8570" }}>لا توجد فصول دراسية منشورة لهذا الصف حالياً.</p>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    {availableTerms.map((t) => (
                      <button
                        key={t}
                        onClick={() => { setSelectedTerm(t); setSelectedSubject(""); }}
                        className="px-5 py-3 rounded-2xl font-bold transition-all shadow-sm"
                        style={{
                          background: selectedTerm === t ? "#10665A" : "#FFFFFF",
                          color: selectedTerm === t ? "#FAF6ED" : "#22291F",
                          border: "1px solid " + (selectedTerm === t ? "#10665A" : "#DED4BD"),
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTerm && (
              <div className="ts-fade mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: "#22291F" }}>4. المادة الدراسية:</label>
                <div className="flex gap-3 flex-wrap">
                  {availableSubjects.length === 0 ? (
                    <p className="text-sm" style={{ color: "#8A8570" }}>لا توجد مواد دراسية منشورة لهذه المرحلة حالياً.</p>
                  ) : (
                    availableSubjects.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubject(sub)}
                        className="px-5 py-3 rounded-2xl font-bold transition-all shadow-sm"
                        style={{
                          background: selectedSubject === sub ? "#10665A" : "#FFFFFF",
                          color: selectedSubject === sub ? "#FAF6ED" : "#22291F",
                          border: "1px solid " + (selectedSubject === sub ? "#10665A" : "#DED4BD"),
                        }}
                      >
                        {sub}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {selectedSubject && (
              <div className="ts-fade mt-8">
                <h3 className="font-bold text-lg mb-4" style={{ color: "#22291F" }}>الدروس المتاحة:</h3>
                {filteredLessons.length === 0 ? (
                  <div className="rounded-3xl p-8 text-center bg-white border border-[#DED4BD]">
                    <p style={{ color: "#8A8570" }}>لا توجد دروس منشورة حالياً في هذه المادة.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredLessons.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => navigate(`/student/lesson/${l.id}`)}
                        className="rounded-2xl p-5 cursor-pointer bg-white border border-[#DED4BD] shadow-sm hover:border-[#10665A] transition-all"
                      >
                        <h4 className="font-bold text-lg mb-1" style={{ color: "#10665A" }}>{l.title}</h4>
                        <p className="text-sm" style={{ color: "#5C5A4A" }}>{l.description || "درس تعليمي شامل مع خريطة ذهنية وأسئلة تفاعلية."}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
