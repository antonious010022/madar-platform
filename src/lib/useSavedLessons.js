import { useCallback, useEffect, useRef, useState } from "react";
import { listMySavedLessonIds, setLessonSaved } from "./savedLessons";

/* Ids of the lessons saved on the active identity ("حفظ الدرس").
   - Signed-in: from the account (Supabase). Guest (session === null): from this browser (localStorage),
     via listMySavedLessonIds() which already falls back to guestStorage.
   - session === undefined (auth still resolving): ids stays null so the UI shows loading.
   - Re-reads when the tab regains focus, so a lesson saved/removed in another tab shows up.
   - remove(): optimistic un-save through the existing setLessonSaved(); rolls back on failure. */
export function useSavedLessonIds(session) {
  const userId = session?.user?.id || null;
  const authReady = session !== undefined;
  const [ids, setIds] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const idsRef = useRef(null);
  idsRef.current = ids;

  useEffect(() => {
    setIds(null);
    setError("");
    if (!authReady) return undefined;
    let cancelled = false;
    listMySavedLessonIds()
      .then((v) => {
        if (!cancelled) setIds(v);
      })
      .catch(() => {
        if (!cancelled) {
          setError("تعذر تحميل الدروس المحفوظة.");
          setIds((cur) => cur || []);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId, authReady, reloadKey]);

  useEffect(() => {
    if (!authReady) return undefined;
    const onFocus = () => setReloadKey((n) => n + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [authReady]);

  const remove = useCallback(async (lessonId) => {
    const sid = String(lessonId);
    const prev = idsRef.current;
    setError("");
    setIds((cur) => (cur || []).filter((x) => x !== sid));
    try {
      await setLessonSaved(lessonId, false);
    } catch (err) {
      setIds(prev);
      setError("تعذر إزالة الدرس، حاول مرة أخرى.");
      console.warn("unsave lesson:", err);
    }
  }, []);

  return { ids, error, remove, reload: () => setReloadKey((n) => n + 1) };
}
