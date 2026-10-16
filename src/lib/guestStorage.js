/**
 * Guest-only local persistence for مَدَار.
 * Authenticated account data must NEVER live under these keys.
 *
 * Canonical:
 *   madar_guest_grade_v1 | madar_guest_progress_v1 | madar_guest_saved_v1 | madar_guest_seen_facts_v1
 * Legacy (read + migrate):
 *   madar_guest_stage_grade_v1 | ts_student_progress_v2 | madar_completed_lesson_ids_v1
 */

const GRADE_KEY = "madar_guest_grade_v1";
const GRADE_KEY_LEGACY = "madar_guest_stage_grade_v1";
const PROGRESS_KEY = "madar_guest_progress_v1";
const PROGRESS_KEY_LEGACY = "ts_student_progress_v2";
const COMPLETED_IDS_LEGACY = "madar_completed_lesson_ids_v1";
const SAVED_KEY = "madar_guest_saved_v1";
const SEEN_FACTS_KEY = "madar_guest_seen_facts_v1";

function safeParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function read(key, fallback) {
  try {
    return safeParse(localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* —— Grade —— */

export function readGuestGradeLocal() {
  let data = read(GRADE_KEY, null);
  if (!data || typeof data !== "object") {
    data = read(GRADE_KEY_LEGACY, null);
    if (data && typeof data === "object" && data.grade) {
      write(GRADE_KEY, { stage: data.stage || null, grade: data.grade });
    }
  }
  if (!data || typeof data !== "object") return null;
  const grade = typeof data.grade === "string" && data.grade.trim() ? data.grade.trim() : null;
  if (!grade) return null;
  const stage = typeof data.stage === "string" && data.stage.trim() ? data.stage.trim() : null;
  return { stage, grade };
}

export function writeGuestGradeLocal(stage, grade) {
  const g = grade && String(grade).trim() ? String(grade).trim() : null;
  if (!g) {
    removeKey(GRADE_KEY);
    removeKey(GRADE_KEY_LEGACY);
    return;
  }
  const payload = {
    stage: stage && String(stage).trim() ? String(stage).trim() : null,
    grade: g,
  };
  write(GRADE_KEY, payload);
  write(GRADE_KEY_LEGACY, payload);
}

/* —— Progress —— */

function normalizeRow(row) {
  if (!row || typeof row !== "object") return null;
  const currentScene = Number.isInteger(row.currentScene)
    ? row.currentScene
    : Number.isInteger(row.current_scene)
      ? row.current_scene
      : 0;
  const completedScenes = Array.isArray(row.completedScenes)
    ? row.completedScenes
    : Array.isArray(row.completed_scenes)
      ? row.completed_scenes
      : [];
  const finalReviewCompleted = !!(row.finalReviewCompleted ?? row.final_review_completed);
  const lessonCompleted = !!(row.lessonCompleted ?? row.lesson_completed);
  return {
    currentScene: currentScene >= 0 ? currentScene : 0,
    completedScenes,
    finalReviewCompleted,
    lessonCompleted,
    updatedAt: row.updatedAt || row.savedAt || null,
  };
}

function migrateLegacyProgressMap() {
  const existing = read(PROGRESS_KEY, null);
  if (existing && typeof existing === "object" && Object.keys(existing).length > 0) {
    return existing;
  }

  const map = {};

  const legacy = read(PROGRESS_KEY_LEGACY, null);
  if (legacy && typeof legacy === "object") {
    const lid = legacy.lessonId ? String(legacy.lessonId) : null;
    if (lid) {
      const row = normalizeRow(legacy);
      if (row) {
        let updatedAt = new Date().toISOString();
        if (legacy.savedAt) {
          try {
            updatedAt = new Date(Number(legacy.savedAt) || legacy.savedAt).toISOString();
          } catch {
            /* keep now */
          }
        }
        map[lid] = {
          ...row,
          state: {
            unlockedScenes: legacy.unlockedScenes,
            finalReviewUnlocked: legacy.finalReviewUnlocked,
            view: legacy.view,
          },
          updatedAt,
        };
      }
    }
  }

  const ids = read(COMPLETED_IDS_LEGACY, []);
  if (Array.isArray(ids)) {
    for (const raw of ids) {
      const lid = String(raw);
      if (!map[lid]) {
        map[lid] = {
          currentScene: 0,
          completedScenes: [],
          finalReviewCompleted: true,
          lessonCompleted: true,
          state: {},
          updatedAt: new Date().toISOString(),
        };
      } else {
        map[lid].lessonCompleted = true;
      }
    }
  }

  if (Object.keys(map).length) write(PROGRESS_KEY, map);
  return map;
}

function readProgressMap() {
  const data = read(PROGRESS_KEY, null);
  if (data && typeof data === "object" && Object.keys(data).length > 0) return data;
  return migrateLegacyProgressMap();
}

export function getGuestLessonProgress(lessonId) {
  if (!lessonId) return null;
  const map = readProgressMap();
  const row = map[String(lessonId)];
  if (!row) {
    const legacy = read(PROGRESS_KEY_LEGACY, null);
    if (legacy && String(legacy.lessonId) === String(lessonId)) {
      const n = normalizeRow(legacy);
      if (!n) return null;
      return {
        ...n,
        unlockedScenes: legacy.unlockedScenes,
        finalReviewUnlocked: legacy.finalReviewUnlocked,
        view: legacy.view,
      };
    }
    return null;
  }
  const n = normalizeRow(row);
  if (!n) return null;
  return {
    ...n,
    ...(row.state && typeof row.state === "object" ? row.state : {}),
  };
}

export function saveGuestLessonProgress(lessonId, progress) {
  if (!lessonId) return false;
  const map = readProgressMap();
  const p = progress || {};
  const currentScene = Number.isInteger(p.currentScene)
    ? p.currentScene
    : Number.isInteger(p.current_scene)
      ? p.current_scene
      : 0;
  const completedScenes = Array.isArray(p.completedScenes)
    ? p.completedScenes
    : Array.isArray(p.completed_scenes)
      ? p.completed_scenes
      : [];
  const finalReviewCompleted = !!(p.finalReviewCompleted ?? p.final_review_completed);
  const lessonCompleted = !!(p.lessonCompleted ?? p.lesson_completed);
  const {
    currentScene: _c,
    completedScenes: _cs,
    finalReviewCompleted: _f,
    lessonCompleted: _l,
    current_scene: _c2,
    completed_scenes: _cs2,
    final_review_completed: _f2,
    lesson_completed: _l2,
    lessonId: _a,
    savedAt: _b,
    ...rest
  } = p;

  const updatedAt = new Date().toISOString();
  map[String(lessonId)] = {
    currentScene: currentScene >= 0 ? currentScene : 0,
    completedScenes,
    finalReviewCompleted,
    lessonCompleted,
    state: rest,
    updatedAt,
  };
  write(PROGRESS_KEY, map);

  write(PROGRESS_KEY_LEGACY, {
    lessonId: String(lessonId),
    currentScene: currentScene >= 0 ? currentScene : 0,
    completedScenes,
    finalReviewCompleted,
    lessonCompleted,
    ...rest,
    savedAt: Date.now(),
  });
  const doneIds = Object.entries(map)
    .filter(([, r]) => r && (r.lessonCompleted || r.finalReviewCompleted))
    .map(([id]) => id);
  write(COMPLETED_IDS_LEGACY, doneIds);

  return true;
}

export function listGuestProgress() {
  const map = readProgressMap();
  const rows = Object.entries(map).map(([lessonId, row]) => {
    const n = normalizeRow(row) || {
      currentScene: 0,
      completedScenes: [],
      finalReviewCompleted: false,
      lessonCompleted: false,
    };
    return {
      lessonId: String(lessonId),
      currentScene: n.currentScene,
      completedScenes: n.completedScenes,
      finalReviewCompleted: n.finalReviewCompleted,
      lessonCompleted: n.lessonCompleted,
      completedAt: n.lessonCompleted ? row?.updatedAt || null : null,
      updatedAt: row?.updatedAt || null,
    };
  });
  rows.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  return rows;
}

/* —— Saved lessons —— */

export function listGuestSavedLessonIds() {
  const ids = read(SAVED_KEY, []);
  return Array.isArray(ids) ? ids.map(String) : [];
}

export function isGuestLessonSaved(lessonId) {
  if (!lessonId) return false;
  return listGuestSavedLessonIds().includes(String(lessonId));
}

export function setGuestLessonSaved(lessonId, saved) {
  if (!lessonId) return;
  const id = String(lessonId);
  let ids = listGuestSavedLessonIds();
  if (saved) {
    if (!ids.includes(id)) ids = [id, ...ids];
  } else {
    ids = ids.filter((x) => x !== id);
  }
  write(SAVED_KEY, ids);
}

/* —— Did you know? —— */

export function listGuestSeenFactIds() {
  const ids = read(SEEN_FACTS_KEY, []);
  return Array.isArray(ids) ? ids.map(String) : [];
}

export function markGuestFactSeen(factId) {
  if (!factId) return;
  const id = String(factId);
  const ids = listGuestSeenFactIds();
  if (!ids.includes(id)) write(SEEN_FACTS_KEY, [...ids, id]);
}

export function clearGuestSeenFacts(factIds) {
  if (!Array.isArray(factIds) || !factIds.length) {
    write(SEEN_FACTS_KEY, []);
    return;
  }
  const drop = new Set(factIds.map(String));
  write(SEEN_FACTS_KEY, listGuestSeenFactIds().filter((id) => !drop.has(id)));
}
