
import React from "react";

// منصات التواصل الاجتماعي.
// تُحفظ الروابط داخل platform_settings
// key = "brand" في الحقل socialLinks.
// لا يتطلب هذا الملف أي تغيير في قاعدة البيانات.

export const SOCIAL_PLATFORMS = [
  {
    key: "facebook",
    color: "#1877F2",
    label: "فيسبوك",
    placeholder: "https://facebook.com/اسم-الصفحة",
  },
  {
    key: "instagram",
    color: "#D6249F",
    label: "إنستجرام",
    placeholder: "https://instagram.com/اسم-الحساب",
  },
  {
    key: "youtube",
    color: "#E02424",
    label: "يوتيوب",
    placeholder: "https://youtube.com/@اسم-القناة",
  },
  {
    key: "tiktok",
    color: "#111111",
    label: "تيك توك",
    placeholder: "https://tiktok.com/@اسم-الحساب",
  },
  {
    key: "telegram",
    color: "#229ED9",
    label: "تليجرام",
    placeholder: "https://t.me/اسم-القناة",
  },
  {
    key: "whatsapp",
    color: "#25A244",
    label: "واتساب",
    placeholder: "رقم الهاتف بالصيغة الدولية، مثل 201001234567",
  },
  {
    key: "x",
    color: "#111111",
    label: "X (تويتر)",
    placeholder: "https://x.com/اسم-الحساب",
  },
];

/**
 * تحويل القيمة إلى رابط آمن.
 * يدعم روابط HTTP/HTTPS وأرقام واتساب الدولية.
 */
export function socialHref(key, raw) {
  const value = String(raw || "").trim();

  if (!value) return null;

  if (key === "whatsapp" && /^[+\d\s()-]{7,}$/.test(value)) {
    const phone = value.replace(/\D/g, "");
    return phone ? `https://wa.me/${phone}` : null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // رفض أي بروتوكول آخر، مثل javascript:
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return null;
  }

  const cleanValue = value.replace(/^\/+/, "");

  if (!cleanValue) return null;

  return `https://${cleanValue}`;
}

// خصائص الأيقونات.
// مساحة رسم موحدة لجميع المنصات.
const ICON_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
};

// رسومات الأيقونات.
const ICONS = {
  facebook: (
    <path d="M15 21v-8h3l.5-4H15V7c0-1.2.4-2 2-2h2V2.2C18.3 2.1 17.3 2 16.2 2 12.9 2 11 4 11 7.4V9H8v4h3v8z" />
  ),

  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),

  youtube: (
    <>
      <path d="M21 7.5a2.8 2.8 0 0 0-2-2C17.2 5 12 5 12 5s-5.2 0-7 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.7 12a29 29 0 0 0 .3 4.5 2.8 2.8 0 0 0 2 2c1.8.5 7 .5 7 .5s5.2 0 7-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .3-4.5 29 29 0 0 0-.3-4.5Z" />
      <path d="m10 9 5 3-5 3z" />
    </>
  ),

  tiktok: (
    <>
      <path d="M14 3v11.2a3.7 3.7 0 1 1-3.2-3.7" />
      <path d="M14 3c.4 3 2.3 5 5 5.3" />
    </>
  ),

  telegram: (
    <>
      <path d="m21.5 3-4 18-5.2-6.1-3.1-3.1z" />
      <path d="m21.5 3-12.3 8.8" />
      <path d="m12.3 14.9-2.1 2.2.2-5.4" />
    </>
  ),

  whatsapp: (
    <>
      <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3 20l1.2-4.9a8.2 8.2 0 1 1 16-3.4Z" />
      <path d="M8.3 7.9c.3-.6.6-.6 1-.6h.4c.2 0 .4.1.5.5l.8 1.8c.1.3.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .7.5.9 1.3 1.7 2.2 2.2.3.2.5.2.7 0l.8-.9c.2-.2.4-.3.7-.2l1.7.8c.3.2.5.3.5.5 0 .4-.2 1.2-.7 1.6-.5.5-1.2.7-1.9.6-1.1-.1-2.4-.7-3.8-1.9-1.1-1-2.1-2.2-2.5-3.5-.4-1.2-.1-2.2.3-3Z" />
    </>
  ),

  x: (
    <>
      <path d="M5 4h4.2L19 20h-4.2z" />
      <path d="m19 4-6 7" />
      <path d="m5 20 6-7" />
    </>
  ),
};

/**
 * أيقونة التواصل الاجتماعي.
 * توحيد حجم SVG ومركزه داخل الدائرة يتم عبر CSS.
 */
export function SocialIcon({ name }) {
  return (
    <svg
      {...ICON_PROPS}
      className={`md-social-icon md-social-icon-${name}`}
    >
      {ICONS[name] || null}
    </svg>
  );
}
