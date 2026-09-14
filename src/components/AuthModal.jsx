import { useEffect, useRef, useState } from "react";
import { signInWithPassword, signUpWithPassword, signInWithGoogle } from "../lib/db";

function mapAuthError(err) {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials"))
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed"))
    return "يجب تأكيد البريد الإلكتروني أولاً. تحقق من صندوق الوارد.";
  if (msg.includes("user already registered") || msg.includes("already registered") || msg.includes("already been registered"))
    return "هذا البريد مسجّل مسبقاً. جرّب تسجيل الدخول.";
  if (msg.includes("password") && (msg.includes("least") || msg.includes("short") || msg.includes("weak")))
    return "كلمة المرور قصيرة جداً. يجب أن تكون 6 أحرف على الأقل.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "مشكلة في الاتصال. تحقق من الإنترنت وحاول مرة أخرى.";
  if (msg.includes("provider is not enabled") || msg.includes("unsupported provider"))
    return "تسجيل Google غير مفعّل حالياً. استخدم البريد الإلكتروني.";
  return "حدث خطأ، حاول مرة أخرى.";
}

export default function AuthModal({ open, onClose, onSuccess, title, subtitle }) {
  const [step, setStep] = useState("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setStep("choice"); setEmail(""); setPassword(""); setError(""); setSuccess(""); setMode("signin");
      return;
    }
    const t = setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      await signInWithGoogle(typeof window !== "undefined" ? window.location.href : undefined);
    } catch (err) {
      setError(mapAuthError(err)); setLoading(false);
    }
  };

  const handleEmailContinue = (e) => {
    e.preventDefault(); setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("أدخل بريداً إلكترونياً صحيحاً."); return;
    }
    setStep("password");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!password || password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل."); return; }
    setLoading(true);
    try {
      if (mode === "signin") {
        try {
          const session = await signInWithPassword(email.trim(), password);
          onSuccess?.(session); onClose?.();
        } catch (err) {
          const msg = (err?.message || "").toLowerCase();
          if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
            setMode("signup");
            setError("لا يوجد حساب بهذا البريد، أو كلمة المرور غير صحيحة. أكمل لإنشاء حساب جديد أو صحّح كلمة المرور.");
          } else throw err;
        }
      } else {
        const { session } = await signUpWithPassword(email.trim(), password);
        if (session) { onSuccess?.(session); onClose?.(); }
        else {
          setSuccess("تم إنشاء الحساب. يرجى تأكيد بريدك من الرابط المرسل ثم تسجيل الدخول.");
          setMode("signin"); setPassword("");
        }
      }
    } catch (err) { setError(mapAuthError(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(14, 23, 18, 0.45)" }}
      role="dialog" aria-modal="true" aria-labelledby="auth-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-white shadow-lg dir-rtl text-right" style={{ border: "1px solid #DED4BD" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 id="auth-modal-title" className="font-black text-lg" style={{ color: "#10665A" }}>{title || "سجّل حسابك"}</h2>
            <p className="text-xs mt-1" style={{ color: "#8A8570" }}>{subtitle || "سجّل حسابك واستمتع بكل مميزات مَدَار مجانًا بالكامل."}</p>
          </div>
          <button type="button" onClick={onClose} className="text-lg leading-none px-2 py-1 rounded-lg" style={{ color: "#8A8570" }} aria-label="إغلاق">×</button>
        </div>
        {step === "choice" && (
          <div className="flex flex-col gap-3">
            <button ref={firstFocusRef} type="button" onClick={handleGoogle} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border disabled:opacity-60"
              style={{ background: "#FFFFFF", borderColor: "#DED4BD", color: "#22291F" }}>
              <span className="inline-flex w-5 h-5 items-center justify-center rounded-full text-xs font-black" style={{ background: "#4285F4", color: "#fff" }}>G</span>
              متابعة باستخدام Google
            </button>
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px" style={{ background: "#DED4BD" }} />
              <span className="text-xs" style={{ color: "#8A8570" }}>أو</span>
              <div className="flex-1 h-px" style={{ background: "#DED4BD" }} />
            </div>
            <button type="button" onClick={() => setStep("email")} disabled={loading}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white" style={{ background: "#10665A" }}>البريد الإلكتروني</button>
          </div>
        )}
        {step === "email" && (
          <form onSubmit={handleEmailContinue} className="flex flex-col gap-3">
            <label className="block">
              <span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>البريد الإلكتروني</span>
              <input ref={firstFocusRef} type="email" required autoComplete="email" className="ts-input text-sm w-full"
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" disabled={loading} />
            </label>
            <button type="submit" className="w-full py-3 rounded-2xl text-sm font-bold text-white" style={{ background: "#10665A" }}>متابعة</button>
            <button type="button" onClick={() => setStep("choice")} className="text-xs font-bold" style={{ color: "#8A8570" }}>← رجوع</button>
          </form>
        )}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <p className="text-xs" style={{ color: "#5C5A4A" }}>{email}</p>
            <label className="block">
              <span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>{mode === "signup" ? "أنشئ كلمة مرور" : "كلمة المرور"}</span>
              <input ref={firstFocusRef} type="password" required minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="ts-input text-sm w-full" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </label>
            {error && <p className="text-xs" style={{ color: "#C53030" }}>{error}</p>}
            {success && <p className="text-xs" style={{ color: "#10665A" }}>{success}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60" style={{ background: "#10665A" }}>
              {loading ? "جاري..." : mode === "signup" ? "إنشاء حساب" : "متابعة"}
            </button>
            <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setSuccess(""); }}
              className="text-xs font-bold" style={{ color: "#10665A" }}>
              {mode === "signin" ? "إنشاء حساب جديد بهذا البريد" : "لدي حساب بالفعل — تسجيل الدخول"}
            </button>
            <button type="button" onClick={() => { setStep("email"); setPassword(""); setError(""); }} className="text-xs font-bold" style={{ color: "#8A8570" }}>← تغيير البريد</button>
          </form>
        )}
        {error && step !== "password" && <p className="text-xs mt-3" style={{ color: "#C53030" }}>{error}</p>}
      </div>
    </div>
  );
}

export function RegistrationGate({ open, onClose, onRequestAuth, featureLabel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: "rgba(14, 23, 18, 0.4)" }}
      role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="w-full max-w-sm rounded-3xl p-6 bg-white shadow-lg dir-rtl text-right" style={{ border: "1px solid #DED4BD" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-black text-lg mb-1" style={{ color: "#10665A" }}>افتح الميزة مجانًا</h3>
        <p className="text-sm mb-4" style={{ color: "#5C5A4A" }}>
          سجّل حسابك للاستمتاع بكل مميزات مَدَار مجانًا وحفظ تقدمك.
          {featureLabel ? <span className="block mt-1 text-xs" style={{ color: "#8A8570" }}>الميزة: {featureLabel}</span> : null}
        </p>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={onRequestAuth} className="w-full py-3 rounded-2xl text-sm font-bold text-white" style={{ background: "#10665A" }}>متابعة باستخدام Google أو البريد</button>
          <button type="button" onClick={onClose} className="w-full py-2 rounded-2xl text-xs font-bold" style={{ color: "#8A8570" }}>لاحقاً</button>
        </div>
      </div>
    </div>
  );
}

export function GuestWelcomeBanner({ session }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (session === undefined) return;
    if (session) { setVisible(false); return; }
    try { if (sessionStorage.getItem("madar_guest_banner_dismissed") === "1") return; } catch (_) {}
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(t);
  }, [session]);
  if (!visible || session) return null;
  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem("madar_guest_banner_dismissed", "1"); } catch (_) {}
  };
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[80] rounded-2xl p-4 shadow-lg dir-rtl text-right"
      style={{ background: "#FFFFFF", border: "1px solid #DED4BD" }} role="status">
      <div className="flex justify-between gap-2 items-start">
        <p className="text-sm font-medium" style={{ color: "#22291F" }}>سجّل حسابك واستمتع بكل مميزات مَدَار مجانًا بالكامل.</p>
        <button type="button" onClick={dismiss} aria-label="إغلاق" className="text-lg leading-none" style={{ color: "#8A8570" }}>×</button>
      </div>
    </div>
  );
}

export function LetterAvatar({ name, email, size = 32 }) {
  const label = (name || email || "?").trim();
  const letter = label.charAt(0).toUpperCase() || "?";
  return (
    <span className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42, background: "#E4F0EC", color: "#0E5348" }} aria-hidden="true">
      {letter}
    </span>
  );
}
