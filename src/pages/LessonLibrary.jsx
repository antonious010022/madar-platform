import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Pill } from "../components/Viewer";
import { CreateLessonModal } from "../components/Studio";
import { statusMeta, timeAgo } from "../lib/constants";
import {
  listOwnLessons,
  createLesson,
  duplicateLesson,
  deleteLesson,
  signOutTeacher,
  importLessonBundle,
} from "../lib/db";
import { makeDemoLesson } from "../lib/demo-data";

export default function LessonLibraryPage({ session }) {
  const navigate = useNavigate();
  const ownerId = session.user.id;

  const [lessons, setLessons] = useState(null);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const data = await listOwnLessons(ownerId);
      setLessons(data);
    } catch (e) {
      setError("تعذر تحميل الدروس.");
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!lessons) return [];
    return lessons.filter((l) => (l.title + l.subject).toLowerCase().includes(query.toLowerCase()));
  }, [lessons, query]);

  const groupedLessons = useMemo(() => {
    const tree = {};
    for (const l of filtered) {
      const stage = l.stage || "بدون مرحلة";
      const grade = l.grade || "بدون صف";
      const term = l.term || "بدون ترم";
      const subject = l.subject || "بدون قسم";
      tree[stage] = tree[stage] || {};
      tree[stage][grade] = tree[stage][grade] || {};
      tree[stage][grade][term] = tree[stage][grade][term] || {};
      tree[stage][grade][term][subject] = tree[stage][grade][term][subject] || [];
      tree[stage][grade][term][subject].push(l);
    }
    return tree;
  }, [filtered]);

  const handleCreate = async (data) => {
    setBusy(true);
    setError("");
    try {
      const lesson = await createLesson(ownerId, data);
      setShowCreate(false);
      navigate(`/teacher/lesson/${lesson.id}`);
    } catch (e) {
      console.error("CREATE LESSON ERROR", e);
      setError(e?.message || e?.error_description || e?.details || "تعذر إنشاء الدرس.");
    } finally {
      setBusy(false);
    }
  };

  const handleImportDemo = async () => {
    setBusy(true);
    try {
      const demo = makeDemoLesson();
      const lessonId = await importLessonBundle(ownerId, demo);
      navigate(`/teacher/lesson/${lessonId}`);
    } catch (e) {
      setError("تعذر استيراد الدرس التجريبي.");
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async (id) => {
    setBusy(true);
    try {
      await duplicateLesson(id, ownerId);
      await refresh();
    } catch (e) {
      setError("تعذر نسخ الدرس.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    try {
      await deleteLesson(id);
      setConfirmDeleteId(null);
      await refresh();
    } catch (e) {
      setError("تعذر حذف الدرس.");
    } finally {
      setBusy(false);
    }
  };

  const stageKeys = Object.keys(groupedLessons);

  return (
    <div className="ts-root" style={{ minHeight: "calc(100vh - 41px)", background: "#FAF6ED" }}>
      {showCreate && (
        <CreateLessonModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}

      <div
        className="flex items-center justify-between px-6 py-5 bg-white shadow-sm border-b flex-wrap gap-3"
        style={{ borderColor: "#DED4BD" }}
      >
        <h1 className="font-black text-xl" style={{ color: "#10665A" }}>
          مكتبة الدروس والتحكم الشخصي
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/teacher/settings"
            className="px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: "#E4F0EC", color: "#0E5348" }}
          >
            إعدادات المنهج والمنصة
          </Link>
          <span className="text-xs" style={{ color: "#8A8570" }}>
            {session.user.email}
          </span>
          <button
            onClick={() => setShowCreate(true)}
            disabled={busy}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
            style={{ background: "#10665A" }}
          >
            + إنشاء درس جديد
          </button>
          <button
            onClick={() => signOutTeacher()}
            className="px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: "#EAE6F1", color: "#4C3F63" }}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <p className="text-sm mb-4" style={{ color: "#C53030" }}>
            {error}
          </p>
        )}

        <div className="mb-6">
          <input
            className="ts-input max-w-md"
            placeholder="بحث في الدروس..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {lessons === null && (
          <p className="text-sm" style={{ color: "#8A8570" }}>
            جاري التحميل...
          </p>
        )}

        {lessons && lessons.length === 0 && (
          <div className="rounded-3xl p-10 text-center bg-white border" style={{ borderColor: "#DED4BD" }}>
            <p className="mb-4" style={{ color: "#8A8570" }}>
              لا توجد دروس بعد. ابدأ بإنشاء درسك الأول.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
                style={{ background: "#10665A" }}
              >
                + إنشاء درس جديد
              </button>
              <button
                onClick={handleImportDemo}
                disabled={busy}
                className="px-4 py-2 rounded-xl text-xs font-bold"
                style={{ background: "#EAE6F1", color: "#4C3F63" }}
              >
                استيراد درس تجريبي (للتطوير فقط)
              </button>
            </div>
          </div>
        )}

        {lessons && lessons.length > 0 && (
          <div className="flex flex-col gap-6">
            {filtered.length === 0 && (
              <p className="text-sm" style={{ color: "#8A8570" }}>
                لا توجد دروس مطابقة.
              </p>
            )}

            {stageKeys.map((stage) => (
              <div key={stage}>
                <h2 className="font-black text-sm mb-3" style={{ color: "#10665A" }}>
                  📚 {stage}
                </h2>
                {Object.keys(groupedLessons[stage]).map((grade) => (
                  <div key={grade} className="mb-4" style={{ paddingInlineStart: 8 }}>
                    <h3 className="font-bold text-xs mb-2" style={{ color: "#0E5348" }}>
                      {grade}
                    </h3>
                    {Object.keys(groupedLessons[stage][grade]).map((term) => (
                      <div key={term} className="mb-3" style={{ paddingInlineStart: 8 }}>
                        <p className="text-[11px] font-bold mb-2" style={{ color: "#8A8570" }}>
                          {term}
                        </p>
                        {Object.keys(groupedLessons[stage][grade][term]).map((subject) => (
                          <div key={subject} className="mb-3" style={{ paddingInlineStart: 8 }}>
                            <p className="text-xs font-bold mb-2" style={{ color: "#5C5A4A" }}>
                              {subject}
                            </p>
                            <div className="flex flex-col gap-3">
                              {groupedLessons[stage][grade][term][subject].map((l) => (
                                <div
                                  key={l.id}
                                  className="ts-fade rounded-3xl p-5 flex items-center justify-between flex-wrap gap-4 bg-white border shadow-sm"
                                  style={{ borderColor: "#DED4BD" }}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <h3 className="font-bold text-base" style={{ color: "#22291F" }}>
                                        {l.title}
                                      </h3>
                                      <Pill tone={statusMeta(l.status).tone}>
                                        {statusMeta(l.status).label}
                                      </Pill>
                                    </div>
                                    <p className="text-xs mb-1" style={{ color: "#8A8570" }}>
                                      {[l.stage, l.grade, l.term, l.subject].filter(Boolean).join(" / ")}
                                      {l.updatedAt ? ` · تعديل ${timeAgo(l.updatedAt)}` : ""}
                                    </p>
                                    {l.description && (
                                      <p className="text-sm" style={{ color: "#5C5A4A" }}>
                                        {l.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                      onClick={() => navigate(`/teacher/lesson/${l.id}`)}
                                      className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
                                      style={{ background: "#10665A" }}
                                    >
                                      فتح الاستوديو
                                    </button>
                                    <button
                                      onClick={() => handleDuplicate(l.id)}
                                      disabled={busy}
                                      className="px-4 py-2 rounded-xl text-xs font-bold"
                                      style={{ background: "#EAE6F1", color: "#4C3F63" }}
                                    >
                                      نسخ الدرس
                                    </button>
                                    {confirmDeleteId === l.id ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleDelete(l.id)}
                                          disabled={busy}
                                          className="px-3 py-2 rounded-xl text-xs font-bold text-white"
                                          style={{ background: "#C53030" }}
                                        >
                                          تأكيد الحذف
                                        </button>
                                        <button
                                          onClick={() => setConfirmDeleteId(null)}
                                          className="px-2 py-2 text-xs"
                                          style={{ color: "#8A8570" }}
                                        >
                                          إلغاء
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmDeleteId(l.id)}
                                        className="px-3 py-2 rounded-xl text-xs font-bold"
                                        style={{ color: "#C53030" }}
                                      >
                                        حذف
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}