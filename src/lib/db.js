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
// The UI (unchanged from the approved prototype) expects camelCase scene
// fields like `presenterNotes`, `quickRecallShow`, `quickRecall`. Postgres
// columns are snake_case. These two mappers are the only place that
// translates between them.
// ===========================================================================
function sceneRowToApp(row) {
  return {
    id: row.id,
    title: row.title,
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

function sceneAppToRow(scene) {
  return {
    title: scene.title,
    text: scene.text,
    presenter_notes: scene.presenterNotes,
    quick_recall_show: scene.quickRecallShow,
    quick_recall: scene.quickRecall,
    hotwords: scene.hotwords,
    mindmap: scene.mindmap,
    timeline: scene.timeline,
    questions: scene.questions,
  };
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

// Teacher's own library — every status, own lessons only (RLS enforces this
// server-side regardless, this query just mirrors it).
export async function listOwnLessons(ownerId) {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => lessonRowToApp(row));
}

// Student platform — published only. RLS also enforces this, so even if this
// query were tampered with client-side, Draft/ReadyToRecord rows never come
// back for an unauthenticated request.
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
  // scenes cascade-delete via the FK's `on delete cascade`
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw error;
}

// Deep-regenerate every nested id (mindmap tree, hotwords, timeline,
// questions) so a duplicated lesson is fully independent — editing the copy
// never touches the original (requirement: Lesson Independence).
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
// Imports a full lesson bundle (metadata + scenes with rich content) in one
// go — used only by the dev-only "import demo data" action in the library.
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
  const { error } = await supabase.from("scenes").update(sceneAppToRow(sceneAppPatch)).eq("id", id);
  if (error) throw error;
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
  const { error } = await supabase.storage
    .from("lesson-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("lesson-images").getPublicUrl(path);
  return data.publicUrl;
}