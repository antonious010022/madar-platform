import { supabase } from "./supabaseClient";
import { saveCurriculumNode } from "./db";

/* Curriculum helpers used by the settings page ("المنهج").
   Lessons store stage / grade / term / subject as plain TEXT (not ids), so renaming a
   curriculum node must also rewrite that text on the lessons that belong to it —
   otherwise those lessons would silently fall out of the student's filters.
   A node is matched together with all its ancestors, so «التاريخ» under one grade is never
   confused with «التاريخ» under another. */

const ORDER = ["stage", "grade", "term", "subject"];

function pathOf(node, nodes) {
  const byId = new Map(nodes.map((n) => [String(n.id), n]));
  const path = {};
  let cur = node;
  let guard = 0;
  while (cur && guard++ < 8) {
    path[cur.kind] = cur.name;
    cur = cur.parentId ? byId.get(String(cur.parentId)) : null;
  }
  return path;
}

function scope(query, node, nodes) {
  const path = pathOf(node, nodes);
  const upTo = ORDER.indexOf(node.kind);
  let q = query;
  ORDER.forEach((k, i) => {
    if (i <= upTo && path[k] !== undefined) q = q.eq(k, path[k]);
  });
  return q;
}

/** How many lessons currently use this node (together with its ancestors). */
export async function countLessonsForNode(node, nodes) {
  const q = scope(supabase.from("lessons").select("id", { count: "exact", head: true }), node, nodes);
  const { count, error } = await q;
  if (error) throw error;
  return count || 0;
}

/** Rename a node and carry the new name to the lessons (and "هل تعلم؟" targets) that use it. */
export async function renameCurriculumNode(node, newName, nodes) {
  const name = String(newName || "").trim();
  if (!name || name === node.name) return { updated: 0 };

  const { data, error } = await scope(supabase.from("lessons").update({ [node.kind]: name }), node, nodes).select("id");
  if (error) throw error;

  await saveCurriculumNode({ ...node, name });

  // "هل تعلم؟" facts target a stage / grade by name too — keep them pointing at the renamed one (best effort).
  if (node.kind === "stage" || node.kind === "grade") {
    try {
      const path = pathOf(node, nodes);
      if (node.kind === "stage") {
        await supabase.from("did_you_know_facts").update({ stage: name }).eq("stage", node.name);
      } else {
        await supabase.from("did_you_know_facts").update({ grade: name }).eq("grade", node.name).eq("stage", path.stage ?? "");
        await supabase.from("did_you_know_facts").update({ grade: name }).eq("grade", node.name).is("stage", null);
      }
    } catch {
      /* table missing or no permission — ignore */
    }
  }
  return { updated: (data || []).length };
}

/** Move a node one step up (-1) or down (+1) among its siblings.
 *  `ordered` = the nodes in the order they are currently displayed. Siblings are renumbered 1..n first,
 *  so it also works when every sort order is still 0. */
export async function moveCurriculumNode(node, dir, ordered) {
  const sibs = ordered.filter((n) => n.kind === node.kind && String(n.parentId || "") === String(node.parentId || ""));
  const i = sibs.findIndex((n) => String(n.id) === String(node.id));
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sibs.length) return;
  const next = sibs.slice();
  [next[i], next[j]] = [next[j], next[i]];
  const jobs = [];
  next.forEach((n, idx) => {
    const want = idx + 1;
    if ((n.sortOrder || 0) !== want) jobs.push(saveCurriculumNode({ ...n, sortOrder: want }));
  });
  await Promise.all(jobs);
}

/** Sort order for a brand-new node = after its siblings. */
export function nextSortOrder(nodes, kind, parentId) {
  const sibs = nodes.filter((n) => n.kind === kind && String(n.parentId || "") === String(parentId || ""));
  return sibs.reduce((m, n) => Math.max(m, n.sortOrder || 0), 0) + 1;
}
