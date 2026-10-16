import { useEffect, useState } from "react";
import { pickFactForStudent } from "../lib/didYouKnow";
import { PickArt } from "../pages/student-platform/uiParts";

/* 💡 هل تعلم؟ — original duo-dyk style (bulb + bubble).
   Guests and signed-in students both see a real fact when the table is readable.
   One fact per tab visit (sessionStorage). */

const STORE_KEY = "madar_dyk_visit_v1";
const inflight = new Map();

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
        <div className="duo-dyk-art">
          <PickArt kind="bulb" />
        </div>
        <div className="duo-dyk-bubble">{children}</div>
      </div>
    </section>
  );
}

export function DidYouKnowCard({ session, stage, grade, ready = true, onRequireLogin }) {
  const userId = session?.user?.id || null;
  const lastSignIn = session?.user?.last_sign_in_at || "";
  const [fact, setFact] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | empty | error
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    setFact(null);
    setErrMsg("");
    if (session === undefined || !ready) {
      setStatus("idle");
      return undefined;
    }

    const identity = userId || "guest";
    const key = `${identity}:${lastSignIn}:${stage || ""}|${grade || ""}`;
    const stored = readStored(key);
    if (stored) {
      setFact(stored);
      setStatus("ready");
      return undefined;
    }

    setStatus("loading");
    let cancelled = false;
    let p = inflight.get(key);
    if (!p) {
      p = pickFactForStudent(userId, stage, grade).finally(() =>
        setTimeout(() => inflight.delete(key), 1500)
      );
      inflight.set(key, p);
    }

    p.then((f) => {
      if (cancelled) return;
      if (f) {
        writeStored(key, f);
        setFact(f);
        setStatus("ready");
      } else {
        setFact(null);
        setStatus("empty");
      }
    }).catch((e) => {
      if (cancelled) return;
      console.warn("DidYouKnow pick:", e);
      setFact(null);
      setStatus("error");
      const msg = String(e?.message || e || "");
      if (/permission|policy|RLS|42501/i.test(msg)) {
        setErrMsg("الصلاحيات تمنع قراءة المعلومات. طبّق migration الـ SQL في Supabase.");
      } else if (/relation|does not exist|42P01/i.test(msg)) {
        setErrMsg("جدول المعلومات غير موجود. شغّل migration_did_you_know.sql في Supabase.");
      } else {
        setErrMsg("تعذر تحميل المعلومة الآن.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, lastSignIn, stage, grade, ready, session]);

  if (session === undefined || !ready) return null;

  if (status === "loading" || status === "idle") {
    return (
      <Shell>
        <span className="duo-dyk-tag">💡 هل تعلم؟</span>
        <p className="duo-dyk-text" style={{ opacity: 0.7 }}>
          جاري اختيار معلومة…
        </p>
      </Shell>
    );
  }

  if (status === "error") {
    return (
      <Shell>
        <span className="duo-dyk-tag">💡 هل تعلم؟</span>
        <p className="duo-dyk-text">{errMsg || "تعذر تحميل المعلومة الآن."}</p>
      </Shell>
    );
  }

  if (status === "empty" || !fact) {
    return (
      <Shell>
        <span className="duo-dyk-tag">💡 هل تعلم؟</span>
        <p className="duo-dyk-text">
          لا توجد معلومات متاحة لصفك حاليًا. أضف معلومة نشطة من لوحة المعلم.
        </p>
      </Shell>
    );
  }

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

export default DidYouKnowCard;
