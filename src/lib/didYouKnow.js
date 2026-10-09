import { supabase } from "./supabaseClient";

/* "هل تعلم؟" — data layer.
   Student side : pickFactForStudent()  → random fact that this student has NOT seen yet.
   Teacher side : listAllFacts / saveFact / deleteFact (RLS lets only staff write). */

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

/** Does this fact target that student? (stage/grade NULL on the fact = no restriction)
 *  - fact.grade set  → student's grade must equal it (stage is also checked when both are known)
 *  - only fact.stage → student's stage must equal it
 *  - neither         → everyone */
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

async function listActiveFacts() {
  const { data, error } = await supabase
    .from("did_you_know_facts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(rowToFact);
}

/** Pick the fact to show now.
 *  Random among the eligible facts the student hasn't seen; once all were seen a new round
 *  starts (and never opens with the fact that was just shown). Marks the pick as seen. */
export async function pickFactForStudent(userId, stage, grade) {
  if (!userId) return null;
  const facts = (await listActiveFacts()).filter((f) => factMatches(f, stage, grade));
  if (!facts.length) return null;

  const { data: seenRows, error } = await supabase.from("student_seen_facts").select("fact_id, seen_at").eq("user_id", userId);
  if (error) throw error;
  const seenAt = new Map((seenRows || []).map((r) => [String(r.fact_id), String(r.seen_at || "")]));

  let pool = facts.filter((f) => !seenAt.has(f.id));
  if (!pool.length) {
    let lastId = null;
    let lastT = "";
    for (const f of facts) {
      const t = seenAt.get(f.id) || "";
      if (t >= lastT) {
        lastT = t;
        lastId = f.id;
      }
    }
    await supabase.from("student_seen_facts").delete().eq("user_id", userId).in("fact_id", facts.map((f) => f.id));
    pool = facts.length > 1 ? facts.filter((f) => f.id !== lastId) : facts;
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  // Remembering it is best-effort: even if this write fails the student still sees the fact.
  await supabase
    .from("student_seen_facts")
    .upsert({ user_id: userId, fact_id: chosen.id }, { onConflict: "user_id,fact_id", ignoreDuplicates: true });
  return chosen;
}

/* ------------------------------- teacher side ------------------------------- */

export async function listAllFacts() {
  const { data, error } = await supabase.from("did_you_know_facts").select("*").order("created_at", { ascending: false });
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
