import { useEffect, useState } from "react";
import { listCurriculumNodes } from "./db";

/* Orders curriculum items (stage / grade / term / subject) by the order the
   teacher set in "إدارة المنهج" (curriculum_nodes.sort_order) instead of
   alphabetical or creation-date order — e.g. "الصف الأول الإعدادي" before
   "الصف الثاني الإعدادي", "الفصل الأول" before "الفصل الثاني".

   Read-only: this file never writes to curriculum_nodes.

   useCurriculumRank() loads the nodes once (per mount) and returns a rank
   object to pass into orderByCurriculum(). While loading, or if the load
   fails (table empty, offline, ...), rank is null and orderByCurriculum()
   simply falls back to Arabic locale sort — so a page using this never
   breaks on it, it only gets nicer ordering once the curriculum loads. */

export function useCurriculumRank() {
  const [rank, setRank] = useState(null);
  useEffect(() => {
    let cancelled = false;
    listCurriculumNodes()
      .then((nodes) => {
        if (!cancelled) setRank(buildRank(nodes));
      })
      .catch(() => {
        if (!cancelled) setRank(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return rank;
}

function buildRank(nodes) {
  // key = `${kind}|${parentId}|${name}` — scopes siblings under their parent
  // so e.g. "الفصل الأول" can have a different order per grade.
  const orderByKey = new Map();
  const idByKey = new Map();
  for (const n of nodes || []) {
    const parent = n.parentId ? String(n.parentId) : "";
    const key = `${n.kind}|${parent}|${n.name}`;
    orderByKey.set(key, n.sortOrder ?? 0);
    idByKey.set(key, String(n.id));
  }
  return { orderByKey, idByKey };
}

const PARENT_KIND = { grade: "stage", term: "grade", subject: "term" };

function resolveScope(rank, kind, context) {
  const parentKind = PARENT_KIND[kind];
  if (!parentKind) return ""; // "stage" has no parent — root scope
  const parentName = context?.[parentKind];
  if (!parentName) return "";
  const grandScope = resolveScope(rank, parentKind, context);
  return rank.idByKey.get(`${parentKind}|${grandScope}|${parentName}`) || "";
}

/** Sorts `names` (unique strings, all of the same `kind`) by the teacher's
 *  curriculum order. `context` gives the ancestor names needed to find the
 *  right scope: {stage} for kind "grade", {stage, grade} for "term",
 *  {stage, grade, term} for "subject" — omit for kind "stage".
 *  Names with no matching curriculum node (or while rank is still loading)
 *  fall back to Arabic locale order, after any ranked names. */
export function orderByCurriculum(names, kind, rank, context) {
  const list = Array.isArray(names) ? names.slice() : [];
  const az = (a, b) => a.localeCompare(b, "ar");
  if (!rank) return list.sort(az);
  const scope = resolveScope(rank, kind, context);
  return list.sort((a, b) => {
    const ra = rank.orderByKey.get(`${kind}|${scope}|${a}`);
    const rb = rank.orderByKey.get(`${kind}|${scope}|${b}`);
    if (ra !== undefined && rb !== undefined) return ra - rb || az(a, b);
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return az(a, b);
  });
}
