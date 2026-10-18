import { useCallback, useEffect, useState } from "react";

/* الدروس المحفوظة للزائر (بدون تسجيل دخول): بتتخزّن في localStorage على نفس المتصفح فقط.
   الشكل: مصفوفة ids نصّية، الأحدث أولًا. أي تغيير بيتعمّم على كل التابات والمكونات المفتوحة. */

const KEY = "madar_saved_guest_v1";
const EVT = "madar:guest-saved";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

function write(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* مساحة التخزين ممتلئة أو التصفّح الخاص — نتجاهل */
  }
  try {
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* ignore */
  }
}

export function listGuestSavedIds() {
  return read();
}

export function isGuestSaved(lessonId) {
  return read().includes(String(lessonId));
}

export function addGuestSaved(lessonId) {
  const id = String(lessonId);
  write([id, ...read().filter((x) => x !== id)]);
}

export function removeGuestSaved(lessonId) {
  const id = String(lessonId);
  write(read().filter((x) => x !== id));
}

/** يرجّع الحالة الجديدة: true = اتحفظ، false = اتشال. */
export function toggleGuestSaved(lessonId) {
  if (isGuestSaved(lessonId)) {
    removeGuestSaved(lessonId);
    return false;
  }
  addGuestSaved(lessonId);
  return true;
}

function useSync(getValue) {
  const [value, setValue] = useState(getValue);
  useEffect(() => {
    const sync = () => setValue(getValue());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [getValue]);
  return value;
}

/** نفس شكل useSavedLessonIds بتاع الحساب: { ids, error, remove, reload } */
export function useGuestSavedIds() {
  const get = useCallback(() => read(), []);
  const ids = useSync(get);
  return { ids, error: "", remove: removeGuestSaved, reload: () => write(read()) };
}

/** لزرار «حفظ الدرس» في صفحة الدرس عند الزائر: [saved, toggle] */
export function useGuestIsSaved(lessonId) {
  const get = useCallback(() => isGuestSaved(lessonId), [lessonId]);
  const saved = useSync(get);
  return [saved, () => toggleGuestSaved(lessonId)];
}
