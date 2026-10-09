import { useEffect, useState } from "react";
import { pickFactForStudent } from "../lib/didYouKnow";
import { PickArt } from "../pages/student-platform/uiParts";

/* 💡 هل تعلم؟ — one fact per visit for signed-in students.
   - A "visit" = this browser tab session + this login. Navigating around keeps the same fact;
     closing the browser / signing in again / opening a new tab session shows the next one.
   - Guests see a locked teaser with a sign-in button (no fact data is ever requested for them). */

const STORE_KEY = "madar_dyk_visit_v1";
const inflight = new Map(); // de-duplicates the pick (React StrictMode runs effects twice in dev)

function readStored(key) {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && p.key === key && p.fact && p.fact.body ? p.fact : null;
  } catch {
    return null;
  }
}
function writeStored(key, fact) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ key, fact }));
  } catch {
    /* ignore */
  }
}

function Shell({ children, locked = false }) {
  return (
    <section className="md-dashboard mb-6" aria-label="هل تعلم؟">
      <div className={`duo-dyk${locked ? " locked" : ""}`} data-accent="4">
        <div className="duo-dyk-art"><PickArt kind="bulb" /></div>
        <div className="duo-dyk-bubble">{children}</div>
      </div>
    </section>
  );
}

export function DidYouKnowCard({ session, stage, grade, ready = true, onRequireLogin }) {
  const userId = session?.user?.id || null;
  const lastSignIn = session?.user?.last_sign_in_at || "";
  const [fact, setFact] = useState(null);

  useEffect(() => {
    setFact(null);
    if (!userId || !ready) return undefined;
    const key = `${userId}:${lastSignIn}:${stage || ""}|${grade || ""}`;
    const stored = readStored(key);
    if (stored) {
      setFact(stored);
      return undefined;
    }
    let cancelled = false;
    let p = inflight.get(key);
    if (!p) {
      p = pickFactForStudent(userId, stage, grade).finally(() => setTimeout(() => inflight.delete(key), 1500));
      inflight.set(key, p);
    }
    p.then((f) => {
      if (f) writeStored(key, f);
      if (!cancelled) setFact(f || null);
    }).catch(() => {
      if (!cancelled) setFact(null);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, lastSignIn, stage, grade, ready]);

  if (session === undefined) return null;

  if (!session) {
    return (
      <Shell locked>
        <span className="duo-dyk-tag">💡 هل تعلم؟</span>
        <p className="duo-dyk-text">سجّل دخولك لتكتشف معلومة جديدة ومختلفة في كل زيارة.</p>
        <button type="button" className="duo-btn duo-btn-primary px-6 py-2 text-sm text-white" style={{ marginTop: 10 }} onClick={onRequireLogin}>
          تسجيل الدخول
        </button>
      </Shell>
    );
  }

  if (!fact) return null;
  return (
    <Shell>
      <span className="duo-dyk-tag">💡 هل تعلم؟</span>
      <p className="duo-dyk-text">{fact.body}</p>
    </Shell>
  );
}

export const DYK_AUTH_COPY = {
  title: "سجّل دخولك لتكتشف معلومات جديدة",
  subtitle: "في كل زيارة تظهر لك معلومة مختلفة في «هل تعلم؟».",
};
