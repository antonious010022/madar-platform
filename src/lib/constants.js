export const STAGES = ["الابتدائية", "الإعدادية", "الثانوية"];
export const GRADES = ["الأول", "الثاني", "الثالث"];
export const TERMS = ["الترم الأول", "الترم الثاني"];
export const STATUSES = [
  { key: "Draft", label: "مسودة", tone: "plum" },
  { key: "ReadyToRecord", label: "جاهز للتصوير", tone: "ochre" },
  { key: "Published", label: "تم النشر", tone: "teal" },
];

export function statusMeta(key) {
  return STATUSES.find((s) => s.key === key) || STATUSES[0];
}

export const uid = (p) =>
  p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.round(diff / 3600000);
  if (h < 1) return "منذ لحظات";
  if (h < 24) return `منذ ${h} س`;
  return `منذ ${Math.round(h / 24)} يوم`;
}
