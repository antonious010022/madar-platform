import { useState } from "react";
import { signInTeacher, signUpTeacher } from "../lib/db";

function mapAuthError(err) {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
    return "يجب تأكيد البريد الإلكتروني أولاً. تحقق من صندوق الوارد.";
  }
  if (msg.includes("user already registered") || msg.includes("already registered") || msg.includes("already been registered")) {
    return "هذا البريد مسجّل مسبقاً. جرّب تسجيل الدخول.";
  }
  if (msg.includes("password") && (msg.includes("least") || msg.includes("short") || msg.includes("weak"))) {
    return "كلمة المرور قصيرة جداً. يجب أن تكون 6 أحرف على الأقل.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "مشكلة في الاتصال. تحقق من الإنترنت وحاول مرة أخرى.";
  }
  return "حدث خطأ، حاول مرة أخرى.";
}

export default function TeacherLogin() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signInTeacher(email, password);
        // بعد نجاح الدخول، الـAuth listener في useTeacherAuth يحدّث الـsession
        // وTeacherGate يعيد الرسم تلقائياً إلى المحتوى المحمي
      } else {
        const { session } = await signUpTeacher(email, password);
        if (session) {
          // تأكيد البريد غير مفعّل → دخول مباشر
          setSuccess("تم إنشاء الحساب بنجاح. جاري الدخول...");
        } else {
          // تأكيد البريد مطلوب
          setSuccess("تم إنشاء الحساب. يرجى تأكيد بريدك الإلكتروني من الرابط المرسل ثم تسجيل الدخول.");
          setMode("signin");
          setPassword("");
        }
      }
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ts-root flex items-center justify-center px-4" style={{ minHeight: "calc(100vh - 41px)", background: "#FAF6ED" }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl p-8 bg-white border shadow-sm" style={{ borderColor: "#DED4BD" }}>
        <h1 className="font-black text-xl mb-1 text-center" style={{ color: "#10665A" }}>استوديو المعلم</h1>
        <p className="text-xs text-center mb-6" style={{ color: "#8A8570" }}>
          {mode === "signin" ? "سجّل الدخول لإدارة دروسك" : "أنشئ حساب معلم جديد"}
        </p>

        <label className="block mb-3">
          <span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>البريد الإلكتروني</span>
          <input
            type="email"
            required
            className="ts-input text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </label>
        <label className="block mb-4">
          <span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>كلمة المرور</span>
          <input
            type="password"
            required
            minLength={6}
            className="ts-input text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </label>

        {error && <p className="text-xs mb-3" style={{ color: "#C53030" }}>{error}</p>}
        {success && <p className="text-xs mb-3" style={{ color: "#10665A" }}>{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white shadow-sm"
          style={{ background: "#10665A", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "جاري التحميل..." : mode === "signin" ? "تسجيل الدخول" : "إنشاء الحساب"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
            setSuccess("");
          }}
          disabled={loading}
          className="w-full mt-3 text-xs font-bold"
          style={{ color: "#4C3F63" }}
        >
          {mode === "signin" ? "ليس لديك حساب؟ إنشاء حساب جديد" : "لديك حساب بالفعل؟ تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}