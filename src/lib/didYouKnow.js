import { supabase } from "./supabaseClient";

/* "هل تعلم؟" data layer — resilient pick for auth + guest.
   Guest seen IDs live in localStorage (no extra module import).
   Marking "seen" never blocks showing a fact. */

const GUEST_SEEN_KEY = "madar_guest_seen_facts_v1";

const norm = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);

function rowToFact(r) {
  return {
    id: String(r.id),
    body: r.body || "",
    stage: norm(r.stage),
    grade: norm(r.grade),
    isActive: !!r.is_active,
    createdAt: r.created_at || "",
  };
}

export function factMatches(fact, stage, grade) {
  const s = norm(stage);
  const g = norm(grade);
  if (fact.grade) {
    if (fact.grade !== g) return false;
    if (fact.stage && s && fact.stage !== s) return false;
    return true;
  }
  if (fact.stage) return !!s && fact.stage === s;
  return true;
}

function readGuestSeen() {
  try {
    const raw = localStorage.getItem(GUEST_SEEN_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

function writeGuestSeen(ids) {
  try {
    localStorage.setItem(GUEST_SEEN_KEY, JSON.stringify(ids.map(String)));
  } catch {
    /* ignore */
  }
}

function markGuestSeen(factId) {
  if (!factId) return;
  const id = String(factId);
  const ids = readGuestSeen();
  if (!ids.includes(id)) writeGuestSeen([...ids, id]);
}

function clearGuestSeen(factIds) {
  if (!Array.isArray(factIds) || !factIds.length) {
    writeGuestSeen([]);
    return;
  }
  const drop = new Set(factIds.map(String));
  writeGuestSeen(readGuestSeen().filter((id) => !drop.has(id)));
}

async function listActiveFacts() {
  const { data, error } = await supabase
    .from("did_you_know_facts")
    .select("id, body, stage, grade, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    // Re-throw with a readable message for the UI/console
    const err = new Error(error.message || "failed to load facts");
    err.code = error.code;
    err.details = error.details;
    throw err;
  }
  return (data || []).map(rowToFact);
}

function pickFromPool(facts, seenAtMap) {
  let pool = facts.filter((f) => !seenAtMap.has(f.id));
  let lastId = null;
  if (!pool.length) {
    let lastT = "";
    for (const f of facts) {
      const t = seenAtMap.get(f.id) || "";
      if (t >= lastT) {
        lastT = t;
        lastId = f.id;
      }
    }
    pool = facts.length > 1 ? facts.filter((f) => f.id !== lastId) : facts;
  }
  if (!pool.length) return { chosen: null, resetIds: null };
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return { chosen, resetIds: lastId != null ? facts.map((f) => f.id) : null };
}

/** Auth student. null userId → guest path. */
export async function pickFactForStudent(userId, stage, grade) {
  if (!userId) return pickFactForGuest(stage, grade);

  const facts = (await listActiveFacts()).filter((f) => factMatches(f, stage, grade));
  if (!facts.length) return null;

  let seenAt = new Map();
  try {
    const { data: seenRows, error } = await supabase
      .from("student_seen_facts")
      .select("fact_id, seen_at")
      .eq("user_id", userId);
    if (!error && seenRows) {
      seenAt = new Map(seenRows.map((r) => [String(r.fact_id), String(r.seen_at || "")]));
    }
  } catch (e) {
    console.warn("DidYouKnow read seen (auth):", e);
  }

  const { chosen, resetIds } = pickFromPool(facts, seenAt);
  if (!chosen) return null;

  // Best-effort mark seen — never block the fact
  try {
    if (resetIds?.length) {
      await supabase.from("student_seen_facts").delete().eq("user_id", userId).in("fact_id", resetIds);
    }
    await supabase
      .from("student_seen_facts")
      .upsert(
        { user_id: userId, fact_id: chosen.id, seen_at: new Date().toISOString() },
        { onConflict: "user_id,fact_id", ignoreDuplicates: true }
      );
  } catch (e) {
    console.warn("DidYouKnow mark-seen (auth):", e);
  }

  return chosen;
}

export async function pickFactForGuest(stage, grade) {
  const facts = (await listActiveFacts()).filter((f) => factMatches(f, stage, grade));
  if (!facts.length) return null;

  const seenAt = new Map(readGuestSeen().map((id) => [id, "1"]));
  const { chosen, resetIds } = pickFromPool(facts, seenAt);
  if (!chosen) return null;

  try {
    if (resetIds?.length) clearGuestSeen(resetIds);
    markGuestSeen(chosen.id);
  } catch (e) {
    console.warn("DidYouKnow mark-seen (guest):", e);
  }

  return chosen;
}

export async function listAllFacts() {
  const { data, error } = await supabase
    .from("did_you_know_facts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToFact);
}

export async function saveFact({ id, body, stage, grade, isActive }) {
  const row = {
    body: String(body || "").trim(),
    stage: norm(stage),
    grade: norm(grade),
    is_active: isActive !== false,
    updated_at: new Date().toISOString(),
  };
  if (!row.body) throw new Error("empty fact");
  if (id) {
    const { error } = await supabase.from("did_you_know_facts").update(row).eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("did_you_know_facts").insert(row);
  if (error) throw error;
}

export async function deleteFact(id) {
  const { error } = await supabase.from("did_you_know_facts").delete().eq("id", id);
  if (error) throw error;
}
