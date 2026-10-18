/* أيقونات مَدَار — SVG خطّية موحّدة (stroke = currentColor) بدل الإيموجي،
   فتبان بنفس الشكل والحجم على كل الأجهزة وتاخد لون الصندوق اللي هي فيه.
   الاستخدام: <Icon name="book" />  — الحجم من CSS (أو size={20}). */

const P = {
  book: (<><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></>),
  nodes: (<><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="9" r="2.5" /><circle cx="9" cy="18" r="2.5" /><path d="M8.4 6.6l7.2 1.8M16.6 11l-6 5.4M6.7 8.5l1.6 7" /></>),
  repeat: (<><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></>),
  quiz: (<><rect x="5" y="4" width="14" height="17" rx="2.5" /><path d="M9 4V3h6v1" /><path d="m9 13.5 2 2 4-4.5" /></>),
  sparkles: (<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>),
  compass: (<><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>),
  home: (<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>),
  bookmark: (<><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" /></>),
  moon: (<><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" /></>),
  leaf: (<><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19c3-5 6-7 10-9" /></>),
  cap: (<><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 9v5" /></>),
};

export function Icon({ name, size, className }) {
  const body = P[name];
  if (!body) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {body}
    </svg>
  );
}

export default Icon;
