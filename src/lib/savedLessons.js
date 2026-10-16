import { supabase } from "./supabaseClient";
import {
  listGuestSavedLessonIds,
  isGuestLessonSaved,
  setGuestLessonSaved,
} from "./guestStorage";

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id ?? null;
}

export async function isLessonSaved(lessonId) {
  if (!lessonId) return false;
  const uid = await currentUserId();
  if (!uid) return isGuestLessonSaved(lessonId);
  const { data, error } = await supabase
    .from("student_saved_lessons")
    .select("lesson_id")
    .eq("user_id", uid)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function listMySavedLessonIds() {
  const uid = await currentUserId();
  if (!uid) return listGuestSavedLessonIds();
  const { data, error } = await supabase
    .from("student_saved_lessons")
    .select("lesson_id, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => String(r.lesson_id));
}

export async function setLessonSaved(lessonId, saved) {
  if (!lessonId) return;
  const uid = await currentUserId();
  if (!uid) {
    setGuestLessonSaved(lessonId, saved);
    return;
  }
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
