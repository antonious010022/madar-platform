import { supabase } from "./supabaseClient";

/* "حفظ الدرس" — per-account saved lessons (table public.student_saved_lessons,
   see supabase/migration_saved_lessons.sql). RLS: each student only sees / changes own rows. */

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id ?? null;
}

/** Is this lesson saved by the current student? (false for guests) */
export async function isLessonSaved(lessonId) {
  const uid = await currentUserId();
  if (!uid || !lessonId) return false;
  const { data, error } = await supabase
    .from("student_saved_lessons")
    .select("lesson_id")
    .eq("user_id", uid)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** Ids of all lessons saved by the current student (empty for guests). */
export async function listMySavedLessonIds() {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from("student_saved_lessons")
    .select("lesson_id, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => String(r.lesson_id));
}

/** Save / un-save a lesson for the current student. */
export async function setLessonSaved(lessonId, saved) {
  const uid = await currentUserId();
  if (!uid) throw new Error("not signed in");
  if (saved) {
    const { error } = await supabase
      .from("student_saved_lessons")
      .upsert({ user_id: uid, lesson_id: lessonId }, { onConflict: "user_id,lesson_id", ignoreDuplicates: true });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("student_saved_lessons").delete().eq("user_id", uid).eq("lesson_id", lessonId);
    if (error) throw error;
  }
}
