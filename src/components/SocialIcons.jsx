// منصات التواصل الاجتماعي: تُحفظ داخل platform_settings (key = "brand") في الحقل socialLinks
// بالشكل { facebook: "https://...", instagram: "...", ... } — بدون أي تغيير في قاعدة البيانات.

export const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "فيسبوك", placeholder: "https://facebook.com/اسم-الصفحة" },
  { key: "instagram", label: "إنستجرام", placeholder: "https://instagram.com/اسم-الحساب" },
  { key: "youtube", label: "يوتيوب", placeholder: "https://youtube.com/@اسم-القناة" },
  { key: "tiktok", label: "تيك توك", placeholder: "https://tiktok.com/@اسم-الحساب" },
  { key: "telegram", label: "تليجرام", placeholder: "https://t.me/اسم-القناة" },
  { key: "whatsapp", label: "واتساب", placeholder: "رقم الهاتف بالصيغة الدولية، مثل 201001234567" },
  { key: "x", label: "X (تويتر)", placeholder: "https://x.com/اسم-الحساب" },
];

/** يحوّل القيمة المكتوبة إلى رابط آمن (http/https فقط) أو null إذا كانت فارغة/غير صالحة. */
export function socialHref(key, raw) {
  const v = String(raw || "").trim();
  if (!v) return null;
  if (key === "whatsapp" && /^[+\d\s()-]{7,}$/.test(v)) {
    return `https://wa.me/${v.replace(/\D/g, "")}`;
  }
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return null; // أي بروتوكول آخر (javascript: ...) مرفوض
  return `https://${v.replace(/^\/+/, "")}`;
}

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

const ICONS = {
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  youtube: (
    <>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
  tiktok: (
    <>
      <path d="M14.5 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14.5 3c.3 2.7 2.2 4.7 5 4.9" />
    </>
  ),
  telegram: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  whatsapp: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  x: (
    <>
      <path d="M4 4l16 16" />
      <path d="M20 4 4 20" />
    </>
  ),
};

export function SocialIcon({ name }) {
  return <svg {...ICON_PROPS}>{ICONS[name] || null}</svg>;
}