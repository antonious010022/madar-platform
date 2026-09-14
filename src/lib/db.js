import { supabase } from "./supabaseClient";
import { uid } from "./constants";

// ===========================================================================
// AUTH (Supabase Auth — teachers and students share the same auth system)
// ===========================================================================
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("getSession error:", error);
    return null;
  }
  return data.session ?? null;
}

/**
 * After Google (or other OAuth) redirect, Supabase puts ?code=... (PKCE)
 * or #access_token=... (implicit) on the URL. Ensure that is exchanged
 * into a persisted session, then strip the sensitive params from the address bar.
 */
export async function recoverSessionFromUrl() {
  if (typeof window === "undefined") return null;

  const href = window.location.href;
  const hasCode = /[?&#]code=/.test(href);
  const hasToken = /[?&#]access_token=/.test(href);
  if (!hasCode && !hasToken) {
    return null; // caller will use getSession()
  }

  try {
    // Let the client finish auto-detect (detectSessionInUrl) first
    await new Promise((r) => setTimeout(r, 50));
    let session = await getSession();
    if (session) {
      cleanOAuthParamsFromUrl();
      return session;
    }

    // PKCE: exchange authorization code if still in the URL
    if (hasCode) {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.warn("exchangeCodeForSession:", error.message);
        } else if (data?.session) {
          cleanOAuthParamsFromUrl();
          return data.session;
        }
      }
    }

    session = await getSession();
    cleanOAuthParamsFromUrl();
    return session;
  } catch (e) {
    console.error("recoverSessionFromUrl:", e);
    return getSession();
  }
}

function cleanOAuthParamsFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    ["code", "state", "error", "error_description", "error_code"].forEach((k) =>
      url.searchParams.delete(k)
    );
    // Strip hash tokens if present
    if (url.hash && /access_token|refresh_token|expires|token_type|provider_token/.test(url.hash)) {
      url.hash = "";
    }
    const cleaned = url.pathname + (url.search || "") + (url.hash || "");
    window.history.replaceState(window.history.state, document.title, cleaned);
  } catch (_) {
    /* ignore */
  }
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session ?? null, event);
  });
  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

/** @deprecated use signInWithPassword — kept for TeacherLogin compatibility */
export async function signInTeacher(email, password) {
  return signInWithPassword(email, password);
}

export async function signUpWithPassword(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { session: data.session, user: data.user };
}

/** @deprecated use signUpWithPassword */
export async function signUpTeacher(email, password) {
  return signUpWithPassword(email, password);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** @deprecated use signOut */
export async function signOutTeacher() {
  return signOut();
}

/**
 * Google OAuth. redirectTo must be in Supabase Auth → URL Configuration → Redirect URLs.
 * We keep the current lesson/scene path so the user returns to the same place.
 * Prefer origin+path+search (no hash) so the OAuth callback query is not mixed with a hash.
 */
export async function signInWithGoogle(redirectTo) {
  let target = redirectTo;
  if (!target && typeof window !== "undefined") {
    target = window.location.origin + window.location.pathname + window.location.search;
  }
  // Remember exact return URL for post-login UI (scene index is already in path or localStorage)
  try {
    if (typeof window !== "undefined" && target) {
      sessionStorage.setItem("madar_auth_return", target);
    }
  } catch (_) {}

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: target,
      queryParams: {
        prompt: "select_account",
      },
    },
  });
  if (error) throw error;
  return data;
}

/** Extract YouTube video ID from common URL forms. Returns null if invalid. */
export function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // youtu.be/ID
  const short = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([A-Za-z0-9_-]{11})(?:[?&#/]|$)/);
  if (short) return short[1];
  // youtube.com/watch?v=ID (any query order)
  const watch = trimmed.match(/[?&]v=([A-Za-z0-9_-]{11})(?:[&?#]|$)/);
  if (watch) return watch[1];
  // youtube.com/embed/ID | /v/ID | /shorts/ID | /live/ID
  const path = trimmed.match(/(?:youtube\.com|youtube-nocookie\.com)\/(?:embed|v|shorts|live)\/([A-Za-z0-9_-]{11})(?:[?&#/]|$)/);
  if (path) return path[1];
  // bare 11-char id
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

// ===========================================================================
// Row <-> app-shape mapping
// The UI expects camelCase scene fields like `presenterNotes`, `quickRecallShow`,
// `quickRecall`. Postgres columns are snake_case.
// ===========================================================================
function sceneRowToApp(row) {
  return {
    id: row.id,
    title: row.title,
    titleFont: row.title_font || null,
    // EXPLANATION | QUICK_RECALL | MIND_MAP | TIMELINE | QUESTIONS
    // Missing/null → treated as LEGACY in the Viewer (show all sections for old data)
    sceneType: row.scene_type || "EXPLANATION",
    isMembersOnly: !!row.is_members_only,
    text: row.text,
    presenterNotes: row.presenter_notes,
    quickRecallShow: row.quick_recall_show,
    quickRecall: row.quick_recall || [],
    hotwords: row.hotwords || [],
    mindmap: row.mindmap || { id: uid("mm"), label: "", description: "", children: [] },
    timeline: row.timeline || [],
    questions: row.questions || [],
  };
}

// تحويل كائن المشهد (أو جزء منه) إلى تنسيق Postgres snake_case مع استبعاد القيم غير المحددة (undefined)
function sceneAppToRow(scene) {
  const row = {};

  if (scene.title !== undefined) row.title = scene.title;
  if (scene.titleFont !== undefined) row.title_font = scene.titleFont || null;
  if (scene.title_font !== undefined) row.title_font = scene.title_font;
  if (scene.text !== undefined) row.text = scene.text;
  if (scene.presenterNotes !== undefined) row.presenter_notes = scene.presenterNotes;
  if (scene.presenter_notes !== undefined) row.presenter_notes = scene.presenter_notes;
  if (scene.quickRecallShow !== undefined) row.quick_recall_show = scene.quickRecallShow;
  if (scene.quick_recall_show !== undefined) row.quick_recall_show = scene.quick_recall_show;
  if (scene.quickRecall !== undefined) row.quick_recall = scene.quickRecall;
  if (scene.quick_recall !== undefined) row.quick_recall = scene.quick_recall;
  if (scene.hotwords !== undefined) row.hotwords = scene.hotwords;
  if (scene.mindmap !== undefined) row.mindmap = scene.mindmap;
  if (scene.timeline !== undefined) row.timeline = scene.timeline;
  if (scene.questions !== undefined) row.questions = scene.questions;
  if (scene.sceneType !== undefined) row.scene_type = scene.sceneType;
  if (scene.scene_type !== undefined) row.scene_type = scene.scene_type;
  if (scene.isMembersOnly !== undefined) row.is_members_only = !!scene.isMembersOnly;
  if (scene.is_members_only !== undefined) row.is_members_only = !!scene.is_members_only;

  return row;
}

function lessonRowToApp(row, scenes) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    subject: row.subject,
    stage: row.stage,
    grade: row.grade,
    term: row.term,
    description: row.description,
    status: row.status,
    youtubeUrl: row.youtube_url || "",
    updatedAt: row.updated_at,
    scenes: scenes ? scenes.map(sceneRowToApp) : undefined,
  };
}

// ===========================================================================
// LESSONS
// ===========================================================================

export async function listOwnLessons(ownerId) {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => lessonRowToApp(row));
}

export async function listPublishedLessons() {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("status", "Published")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => lessonRowToApp(row));
}

export async function getLessonWithScenes(id) {
  const { data: lessonRow, error: lessonErr } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();
  if (lessonErr) throw lessonErr;

  const { data: sceneRows, error: sceneErr } = await supabase
    .from("scenes")
    .select("*")
    .eq("lesson_id", id)
    .order("order_index", { ascending: true });
  if (sceneErr) throw sceneErr;

  return lessonRowToApp(lessonRow, sceneRows);
}

function defaultScenePayload(title, sceneType = "EXPLANATION") {
  const type = sceneType || "EXPLANATION";
  const base = {
    title: title || defaultTitleForType(type),
    scene_type: type,
    text: type === "EXPLANATION" ? "<p>محتوى الدرس التمهيدي...</p>" : "",
    presenter_notes: "",
    quick_recall_show: true,
    quick_recall: type === "QUICK_RECALL" ? ["نقطة رئيسية"] : [],
    hotwords: [],
    mindmap:
      type === "MIND_MAP"
        ? { id: uid("mm"), label: title || "الخريطة الذهنية", description: "", children: [] }
        : { id: uid("mm"), label: "", description: "", children: [] },
    timeline: [],
    questions: [],
  };
  // title_font is optional in DB; only send if column exists — safe null
  base.title_font = null;
  return base;
}

function defaultTitleForType(type) {
  switch (type) {
    case "QUICK_RECALL": return "تذكّر سريع";
    case "MIND_MAP": return "الخريطة الذهنية";
    case "TIMELINE": return "الخط الزمني والأحداث";
    case "QUESTIONS": return "تحقق من فهمك";
    default: return "المشهد الأول";
  }
}

export const SCENE_TYPES = [
  { key: "EXPLANATION", label: "شرح", icon: "📝" },
  { key: "QUICK_RECALL", label: "تذكّر سريع", icon: "🧠" },
  { key: "MIND_MAP", label: "الخريطة الذهنية", icon: "🗺️" },
  { key: "TIMELINE", label: "الخط الزمني", icon: "🕒" },
  { key: "QUESTIONS", label: "تحقق من فهمك", icon: "❓" },
];


export async function createLesson(ownerId, meta) {
  const { data: lessonRow, error: lessonErr } = await supabase
    .from("lessons")
    .insert({
      owner_id: ownerId,
      title: meta.title,
      subject: meta.subject || "عام",
      stage: meta.stage,
      grade: meta.grade,
      term: meta.term,
      description: meta.description || "",
      youtube_url: meta.youtubeUrl || meta.youtube_url || "",
      status: "Draft",
    })
    .select()
    .single();
  if (lessonErr) throw lessonErr;

  const firstPayload = defaultScenePayload("المشهد الأول", "EXPLANATION");
  delete firstPayload.title_font;
  let { data: sceneRow, error: sceneErr } = await supabase
    .from("scenes")
    .insert({ lesson_id: lessonRow.id, order_index: 0, ...firstPayload })
    .select()
    .single();
  if (sceneErr && /scene_type|title_font/i.test(sceneErr.message || "")) {
    const { scene_type, ...rest } = firstPayload;
    const retry = await supabase
      .from("scenes")
      .insert({ lesson_id: lessonRow.id, order_index: 0, ...rest })
      .select()
      .single();
    sceneRow = retry.data;
    sceneErr = retry.error;
  }
  if (sceneErr) throw sceneErr;

  return lessonRowToApp(lessonRow, [sceneRow]);
}

export async function updateLessonMeta(id, patch) {
  // Only allow known lesson columns — prevents accidental camelCase / extra keys from breaking the update
  const allowed = {};
  if (patch.title !== undefined) allowed.title = patch.title;
  if (patch.subject !== undefined) allowed.subject = patch.subject;
  if (patch.stage !== undefined) allowed.stage = patch.stage;
  if (patch.grade !== undefined) allowed.grade = patch.grade;
  if (patch.term !== undefined) allowed.term = patch.term;
  if (patch.description !== undefined) allowed.description = patch.description;
  if (patch.status !== undefined) allowed.status = patch.status;
  if (patch.youtubeUrl !== undefined) allowed.youtube_url = patch.youtubeUrl || "";
  if (patch.youtube_url !== undefined) allowed.youtube_url = patch.youtube_url || "";
  if (Object.keys(allowed).length === 0) return;
  const { error } = await supabase.from("lessons").update(allowed).eq("id", id);
  if (error) {
    // Clearer signal when migration was not applied
    if (/youtube_url/i.test(error.message || "")) {
      const e = new Error("عمود youtube_url غير موجود. نفّذ migration_youtube_and_notes.sql في Supabase.");
      e.cause = error;
      throw e;
    }
    throw error;
  }
}

export async function deleteLesson(id) {
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw error;
}

function regenerateMindmapIds(node) {
  return {
    ...node,
    id: uid("mm"),
    children: (node.children || []).map(regenerateMindmapIds),
  };
}

export async function duplicateLesson(id, ownerId) {
  const original = await getLessonWithScenes(id);

  const { data: newLessonRow, error: lessonErr } = await supabase
    .from("lessons")
    .insert({
      owner_id: ownerId,
      title: original.title + " (نسخة)",
      subject: original.subject,
      stage: original.stage,
      grade: original.grade,
      term: original.term,
      description: original.description,
      youtube_url: original.youtubeUrl || "",
      status: "Draft",
    })
    .select()
    .single();
  if (lessonErr) throw lessonErr;

  const newScenesPayload = original.scenes.map((scene, index) => ({
    lesson_id: newLessonRow.id,
    order_index: index,
    title: scene.title,
    title_font: scene.titleFont || null,
    text: scene.text,
    presenter_notes: scene.presenterNotes,
    quick_recall_show: scene.quickRecallShow,
    quick_recall: scene.quickRecall,
    hotwords: (scene.hotwords || []).map((h) => ({ ...h, id: uid("hw") })),
    mindmap: scene.mindmap ? regenerateMindmapIds(scene.mindmap) : scene.mindmap,
    timeline: (scene.timeline || []).map((t) => ({ ...t, id: uid("t") })),
    questions: (scene.questions || []).map((q) => ({ ...q, id: uid("q") })),
  }));

  const { error: sceneErr } = await supabase.from("scenes").insert(newScenesPayload);
  if (sceneErr) throw sceneErr;

  return newLessonRow.id;
}

// ===========================================================================
// SCENES
// ===========================================================================
export async function importLessonBundle(ownerId, bundle) {
  const { data: lessonRow, error: lessonErr } = await supabase
    .from("lessons")
    .insert({
      owner_id: ownerId,
      title: bundle.title,
      subject: bundle.subject || "عام",
      stage: bundle.stage,
      grade: bundle.grade,
      term: bundle.term,
      description: bundle.description || "",
      youtube_url: bundle.youtubeUrl || bundle.youtube_url || "",
      status: "Draft",
    })
    .select()
    .single();
  if (lessonErr) throw lessonErr;

  const scenesPayload = bundle.scenes.map((scene, index) => ({
    lesson_id: lessonRow.id,
    order_index: index,
    title: scene.title,
    title_font: scene.titleFont || scene.title_font || null,
    text: scene.text,
    presenter_notes: scene.presenter_notes || "",
    quick_recall_show: scene.quickRecallShow !== false,
    quick_recall: scene.quickRecall || [],
    hotwords: scene.hotwords || [],
    mindmap: scene.mindmap || { id: uid("mm"), label: scene.title, description: "", children: [] },
    timeline: scene.timeline || [],
    questions: scene.questions || [],
  }));

  const { error: sceneErr } = await supabase.from("scenes").insert(scenesPayload);
  if (sceneErr) throw sceneErr;

  return lessonRow.id;
}

export async function createScene(lessonId, orderIndex, title, sceneType = "EXPLANATION") {
  const type = sceneType || "EXPLANATION";
  const payload = defaultScenePayload(title || defaultTitleForType(type), type);
  // Build insert carefully: drop title_font if DB rejects it (handled by retry below)
  const insertRow = {
    lesson_id: lessonId,
    order_index: orderIndex,
    title: payload.title,
    scene_type: payload.scene_type,
    text: payload.text,
    presenter_notes: payload.presenter_notes,
    quick_recall_show: payload.quick_recall_show,
    quick_recall: payload.quick_recall,
    hotwords: payload.hotwords,
    mindmap: payload.mindmap,
    timeline: payload.timeline,
    questions: payload.questions,
    is_members_only: false,
  };
  let { data, error } = await supabase.from("scenes").insert(insertRow).select().single();
  // If scene_type column missing (migration not run), retry without it and keep type only in app via mindmap label — but prefer failing clearly
  if (error && /scene_type|youtube_url|title_font|is_members_only/i.test(error.message || "")) {
    console.warn("createScene column issue, retrying minimal insert:", error.message);
    const minimal = {
      lesson_id: lessonId,
      order_index: orderIndex,
      title: payload.title,
      text: payload.text,
      presenter_notes: payload.presenter_notes,
      quick_recall_show: payload.quick_recall_show,
      quick_recall: payload.quick_recall,
      hotwords: payload.hotwords,
      mindmap: payload.mindmap,
      timeline: payload.timeline,
      questions: payload.questions,
    };
    const retry = await supabase.from("scenes").insert(minimal).select().single();
    data = retry.data;
    error = retry.error;
    if (!error && data) {
      // Annotate type client-side until migration is applied
      return { ...sceneRowToApp(data), sceneType: type };
    }
  }
  if (error) throw error;
  return sceneRowToApp(data);
}

export async function updateScene(id, sceneAppPatch) {
  const payload = sceneAppToRow(sceneAppPatch);
  
  // إذا لم يحتوي التعديل على أي حقل للرفع، نلغي العملية لتجنب استعلام فارغ
  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase.from("scenes").update(payload).eq("id", id);
  if (error) {
    console.error("Supabase updateScene error:", error);
    throw error;
  }
}

export async function deleteScene(id) {
  const { error } = await supabase.from("scenes").delete().eq("id", id);
  if (error) throw error;
}

// ===========================================================================
// STORAGE — images (scene body images, hotword images, timeline images)
// ===========================================================================
export async function uploadLessonImage(file, lessonId) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${lessonId}/${uid("img")}.${ext}`;
  
  // الحاوية المعرفة في مشروعك باسم lesson-images
  const bucketName = "lesson-images";

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, { cacheControl: "3600", upsert: false });
    
  if (error) throw error;
  
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
}