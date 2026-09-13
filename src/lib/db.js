import { supabase } from "./supabaseClient";
import { uid } from "./constants";

// ===========================================================================
// AUTH (teacher only — students never sign in)
// ===========================================================================
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function signInTeacher(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signUpTeacher(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // data.session يكون null إذا كان تأكيد البريد مفعّلاً
  return { session: data.session, user: data.user };
}

export async function signOutTeacher() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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

function defaultScenePayload(title) {
  return {
    title,
    title_font: null,
    text: "<p>محتوى الدرس التمهيدي...</p>",
    presenter_notes: "",
    quick_recall_show: true,
    quick_recall: ["نقطة رئيسية"],
    hotwords: [],
    mindmap: { id: uid("mm"), label: title, description: "", children: [] },
    timeline: [],
    questions: [],
  };
}

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
      status: "Draft",
    })
    .select()
    .single();
  if (lessonErr) throw lessonErr;

  const { data: sceneRow, error: sceneErr } = await supabase
    .from("scenes")
    .insert({ lesson_id: lessonRow.id, order_index: 0, ...defaultScenePayload("المشهد الأول") })
    .select()
    .single();
  if (sceneErr) throw sceneErr;

  return lessonRowToApp(lessonRow, [sceneRow]);
}

export async function updateLessonMeta(id, patch) {
  const { error } = await supabase.from("lessons").update(patch).eq("id", id);
  if (error) throw error;
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

export async function createScene(lessonId, orderIndex, title = "مشهد جديد") {
  const { data, error } = await supabase
    .from("scenes")
    .insert({ lesson_id: lessonId, order_index: orderIndex, ...defaultScenePayload(title) })
    .select()
    .single();
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