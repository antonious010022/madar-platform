import { supabase } from "./supabaseClient";

/* Small read-only helper for the student space: how many scenes ("chapters") a lesson has,
   so the "continue" card can say «المشهد 3 من 5» without loading the whole lesson. */
export async function countScenes(lessonId) {
  if (!lessonId) return 0;
  const { count, error } = await supabase.from("scenes").select("id", { count: "exact", head: true }).eq("lesson_id", lessonId);
  if (error) throw error;
  return count || 0;
}
