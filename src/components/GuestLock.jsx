import { useEffect, useRef } from "react";

/* Guest view of the dashboard: the real sections (progress, latest lessons, "هل تعلم؟",
   saved lessons) stay exactly as they are but dimmed to 60% and non-interactive, with ONE
   sign-in card in front of them. Signed-in users (locked=false) get the children untouched.
   Purely visual: no data is read or written here. */

export const GUEST_AUTH_COPY = {
  title: "سجّل دخولك لتستمتع بكل مميزات مدار",
  subtitle: "احفظ دروسك وارجع إليها من أي جهاز، واكتشف معلومة جديدة في كل زيارة.",
};

export default function GuestLock({ locked, onLogin, children }) {
  const bodyRef = useRef(null);

  // `inert` keeps keyboard focus / screen readers out of the dimmed copy (set via DOM so it
  // works on any React version).
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (locked) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }, [locked]);

  if (!locked) return <>{children}</>;

  return (
    <div className="duo-guest-lock">
      <div ref={bodyRef} className="duo-guest-lock-body" aria-hidden="true">
        {children}
      </div>
      <div className="duo-guest-lock-card" role="region" aria-label="تسجيل الدخول">
        <span className="duo-guest-lock-icon" aria-hidden="true">🔒</span>
        <h3>{GUEST_AUTH_COPY.title}</h3>
        <p>{GUEST_AUTH_COPY.subtitle}</p>
        <button type="button" className="duo-btn duo-btn-primary px-8 py-2 text-white" onClick={onLogin}>
          تسجيل الدخول
        </button>
      </div>
    </div>
  );
}
