import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { PLATFORM_CSS } from "./student-platform/platformStyles";
import { Icon } from "../components/MadarIcons";

/* /about — عن مَدَار. نفس لغة المنصة: شريط علوي زجاجي بلوجو مدار، بانر أخضر بالمدارات،
   كروت بحدّ ملوّن، وزرار «ابدأ التعلّم». المحتوى النصّي كما هو. */

const STEPS = [
  { n: 1, icon: "book", title: "فهم", text: "شرح واضح للمحتوى الأساسي", color: "#147A6A" },
  { n: 2, icon: "nodes", title: "ربط", text: "خرائط ذهنية وخطوط زمنية تربط الأفكار", color: "#B8832A" },
  { n: 3, icon: "repeat", title: "مراجعة", text: "نقاط تذكّر سريعة ومركّزة", color: "#4C7FA1" },
  { n: 4, icon: "quiz", title: "اختبار", text: "أسئلة للتحقق من الفهم", color: "#A8587A" },
];

const CSS = `
.md-ab-top {
  position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  padding: 0.55rem clamp(0.9rem, 3vw, 1.5rem); background: rgba(255, 255, 255, 0.78);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(20, 122, 106, 0.14);
}
.md-ab-logo { display: inline-flex; align-items: center; }
.md-ab-logo img { display: block; height: 2.5rem; width: auto; max-width: 9rem; object-fit: contain; }
.md-ab-back { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.95rem; border: 1.5px solid #CFE7DF; border-radius: 999px; background: #fff; color: #0E5348; font-size: 0.82rem; font-weight: 850; text-decoration: none; box-shadow: 0 3px 0 #CFE7DF; transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
.md-ab-back:active { transform: translateY(2px); box-shadow: 0 1px 0 #CFE7DF; }

/* —— التخطيط: كل الكروت بنفس الاستدارة والمسافات —— */
.md-ab-wrap { --r: 1.4rem; flex: 1; width: 100%; max-width: 54rem; margin: 0 auto; padding: 1.1rem clamp(0.9rem, 3vw, 1.5rem) 2.2rem; position: relative; z-index: 1; display: flex; flex-direction: column; gap: 1.15rem; direction: rtl; text-align: right; }

/* —— البانر —— */
.md-ab-hero {
  position: relative; isolation: isolate; overflow: hidden; padding: clamp(1.6rem, 4vw, 2.4rem) clamp(1.2rem, 3vw, 2rem);
  border-radius: calc(var(--r) + 0.3rem); color: #fff; text-align: center;
  background: linear-gradient(125deg, #0A3F36 0%, #0E5348 38%, #147A6A 78%, #1A8F7C 100%);
  box-shadow: 0 5px 0 #0A3F36, 0 24px 40px -26px rgba(14, 83, 72, 0.6);
}
.md-ab-orbits { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }
.md-ab-hero-logo { display: inline-flex; padding: 0.45rem 0.95rem; margin-bottom: 0.9rem; border-radius: 1rem; background: #fff; box-shadow: 0 10px 20px -12px rgba(0, 0, 0, 0.4); }
.md-ab-hero-logo img { display: block; height: 2.7rem; width: auto; max-width: 10rem; object-fit: contain; }
.md-ab-hero h1 { margin: 0; font-size: clamp(1.6rem, 4.4vw, 2.3rem); font-weight: 900; line-height: 1.4; color: #fff; }
.md-ab-hero p { margin: 0.5rem auto 0; max-width: 34rem; font-size: 0.96rem; line-height: 1.9; color: rgba(255, 255, 255, 0.9); }
.md-ab-pill { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 1rem; padding: 0.32rem 1rem; border-radius: 999px; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.3); font-size: 0.8rem; font-weight: 800; }
.md-ab-pill svg { display: block; width: 1rem; height: 1rem; color: #E3C08B; }

/* —— الكروت النصية: نفس الشكل، وشريط أخضر على الجنب —— */
.md-ab-card { position: relative; padding: 1.2rem 1.4rem; padding-inline-start: 1.9rem; border-radius: var(--r); background: #fff; border: 1.5px solid #E1ECE7; box-shadow: 0 4px 0 #E1ECE7, 0 16px 28px -24px rgba(14, 83, 72, 0.35); }
.md-ab-card::before { content: ""; position: absolute; inset-block: 1.1rem; inset-inline-start: 0.8rem; width: 4px; border-radius: 999px; background: linear-gradient(180deg, #1A8F7C, #0E5348); }
.md-ab-card p { margin: 0; font-size: 0.95rem; line-height: 2; color: #3F4E49; }
.md-ab-card p + p { margin-top: 0.7rem; }
.md-ab-card strong { font-weight: 900; color: #0E5348; }

/* —— عنوان القسم —— */
.md-ab-h { margin: 0 0 0.9rem; display: flex; align-items: center; gap: 0.6rem; font-size: 1.05rem; font-weight: 900; color: #0E5348; }
.md-ab-h::after { content: ""; flex: 1; height: 2px; border-radius: 2px; background: linear-gradient(to left, #CFE7DF, transparent); }
.md-ab-h i { flex: none; width: 2.2rem; height: 2.2rem; border-radius: 0.75rem; display: inline-flex; align-items: center; justify-content: center; background: #E0F1EC; color: #147A6A; font-style: normal; box-shadow: 0 3px 0 #CFE7DF; }
.md-ab-h i svg { display: block; width: 1.15rem; height: 1.15rem; }

/* —— خطوات الرحلة: 4 جنب بعض على الكمبيوتر، 2×2 على الموبايل —— */
.md-ab-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.85rem; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.md-ab-step {
  position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.2rem 0.9rem 1.15rem;
  border-radius: var(--r); border: 1.5px solid color-mix(in srgb, var(--u) 24%, #fff);
  background: linear-gradient(180deg, color-mix(in srgb, var(--u) 8%, #fff) 0%, #fff 70%);
  box-shadow: 0 4px 0 color-mix(in srgb, var(--u) 26%, #fff), 0 16px 26px -22px color-mix(in srgb, var(--u) 60%, transparent);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.md-ab-step-num { position: absolute; top: 0.6rem; inset-inline-start: 0.6rem; width: 1.55rem; height: 1.55rem; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--u); color: #fff; font-size: 0.78rem; font-weight: 900; line-height: 1; }
.md-ab-step-ico { width: 3.2rem; height: 3.2rem; margin: 0.3rem 0 0.8rem; border-radius: 1.05rem; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--u) 15%, #fff); color: var(--u); box-shadow: 0 4px 0 color-mix(in srgb, var(--u) 30%, transparent); }
.md-ab-step-ico svg { display: block; width: 1.55rem; height: 1.55rem; }
.md-ab-step b { display: block; font-size: 1.02rem; font-weight: 900; color: color-mix(in srgb, var(--u) 80%, #000); }
.md-ab-step-text { display: block; margin-top: 0.3rem; font-size: 0.83rem; line-height: 1.75; color: #5A6B65; }

/* —— الملاحظة: نفس لغة الكروت (أخضر هادي بدل الأصفر) —— */
.md-ab-note { display: flex; gap: 0.9rem; align-items: center; padding: 1.1rem 1.3rem; border-radius: var(--r); background: linear-gradient(135deg, #EAF6F2 0%, #F4FAF8 100%); border: 1.5px solid #CFE7DF; box-shadow: 0 4px 0 #CFE7DF; }
.md-ab-note-ico { flex: none; width: 3rem; height: 3rem; border-radius: 1rem; display: inline-flex; align-items: center; justify-content: center; background: #fff; color: #147A6A; box-shadow: 0 4px 0 #BFE2D8; }
.md-ab-note-ico svg { display: block; width: 1.5rem; height: 1.5rem; }
.md-ab-note b { display: block; margin-bottom: 0.15rem; font-size: 0.98rem; font-weight: 900; color: #0E5348; }
.md-ab-note p { margin: 0; font-size: 0.88rem; line-height: 1.9; color: #3F5A52; }

/* —— الزرار والروابط —— */
.md-ab-cta { display: flex; flex-direction: column; align-items: center; gap: 0.9rem; padding: 0.5rem 0 0; text-align: center; }
.md-ab-btn { display: inline-flex; align-items: center; gap: 0.7rem; padding: 0.4rem; padding-inline-start: 1.7rem; border-radius: 999px; background: linear-gradient(135deg, #1A8F7C 0%, #0E5348 100%); color: #fff; font-size: 1rem; font-weight: 900; text-decoration: none; box-shadow: 0 5px 0 #0A3F36, 0 14px 20px -14px rgba(14, 83, 72, 0.65); transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.15s ease; }
.md-ab-btn span { display: inline-flex; align-items: center; justify-content: center; width: 2.1rem; height: 2.1rem; border-radius: 50%; background: #fff; color: #0E5348; font-size: 1.1rem; line-height: 1; }
.md-ab-btn:active { transform: translateY(4px); box-shadow: 0 1px 0 #0A3F36; }
.md-ab-legal { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; }
.md-ab-legal a { padding: 0.32rem 0.95rem; border-radius: 999px; border: 1.5px solid #E1ECE7; background: #fff; color: #5A6B65; font-size: 0.78rem; font-weight: 800; text-decoration: none; transition: border-color 0.15s ease, color 0.15s ease; }
.md-ab-wrap a:focus-visible, .md-ab-top a:focus-visible, .md-ab-top button:focus-visible { outline: 3px solid #E3C08B; outline-offset: 3px; }

/* —— حركات للأجهزة اللي فيها ماوس فقط —— */
@media (hover: hover) and (pointer: fine) {
  .md-ab-back:hover { border-color: #147A6A; transform: translateY(-1px); }
  .md-ab-step:hover { transform: translateY(-4px); box-shadow: 0 6px 0 color-mix(in srgb, var(--u) 30%, #fff), 0 22px 30px -22px color-mix(in srgb, var(--u) 70%, transparent); }
  .md-ab-btn:hover { transform: translateY(-2px); filter: brightness(1.07); box-shadow: 0 7px 0 #0A3F36, 0 18px 24px -14px rgba(14, 83, 72, 0.7); }
  .md-ab-legal a:hover { border-color: #147A6A; color: #0E5348; }
}

/* —— موبايل وتابلت —— */
@media (max-width: 760px) {
  .md-ab-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.7rem; }
  .md-ab-step { padding: 1.1rem 0.7rem 1rem; }
  .md-ab-step-ico { width: 2.9rem; height: 2.9rem; }
}
@media (max-width: 480px) {
  .md-ab-card { padding: 1.05rem 1.1rem; padding-inline-start: 1.7rem; }
  .md-ab-note { align-items: flex-start; padding: 1rem; }
  .md-ab-btn { font-size: 0.95rem; }
}

/* —— الوضع الليلي —— */
html[data-theme="dark"] .md-ab-top { background: rgba(21, 32, 28, 0.78); border-bottom-color: #30423B; }
html[data-theme="dark"] .md-ab-back { background: #192723; border-color: #30423B; color: #B5DDD2; box-shadow: 0 3px 0 #30423B; }
html[data-theme="dark"] .md-ab-hero { background: linear-gradient(125deg, #062a24 0%, #0A3F36 45%, #0E5348 100%); box-shadow: 0 5px 0 #041c18, 0 24px 40px -26px rgba(0, 0, 0, 0.6); }
html[data-theme="dark"] .md-ab-card, html[data-theme="dark"] .md-ab-legal a { background: #192723; border-color: #30423B; box-shadow: 0 4px 0 #30423B; }
html[data-theme="dark"] .md-ab-legal a { box-shadow: none; color: #A5B7AF; }
html[data-theme="dark"] .md-ab-card p { color: #CBD8D2; }
html[data-theme="dark"] .md-ab-card strong, html[data-theme="dark"] .md-ab-h { color: #B5DDD2; }
html[data-theme="dark"] .md-ab-h::after { background: linear-gradient(to left, #30423B, transparent); }
html[data-theme="dark"] .md-ab-h i { background: #203029; color: #9ED8CB; box-shadow: 0 3px 0 #30423B; }
html[data-theme="dark"] .md-ab-step { border-color: color-mix(in srgb, var(--u) 34%, #30423B); background: linear-gradient(180deg, color-mix(in srgb, var(--u) 16%, #192723) 0%, #192723 75%); box-shadow: 0 4px 0 color-mix(in srgb, var(--u) 30%, #15201c); }
html[data-theme="dark"] .md-ab-step-ico { background: color-mix(in srgb, var(--u) 24%, #15201c); }
html[data-theme="dark"] .md-ab-step b { color: color-mix(in srgb, var(--u) 62%, #fff); }
html[data-theme="dark"] .md-ab-step-text { color: #CBD8D2; }
html[data-theme="dark"] .md-ab-note { background: linear-gradient(135deg, #1B2D27 0%, #192723 100%); border-color: #30423B; box-shadow: 0 4px 0 #30423B; }
html[data-theme="dark"] .md-ab-note-ico { background: #203029; color: #9ED8CB; box-shadow: 0 4px 0 #15201c; }
html[data-theme="dark"] .md-ab-note b { color: #B5DDD2; }
html[data-theme="dark"] .md-ab-note p { color: #CBD8D2; }
@media (prefers-reduced-motion: reduce) { .md-ab-step, .md-ab-btn, .md-ab-back { transition: none !important; } }
`;

export default function AboutPage() {
  const navigate = useNavigate();
  const isDark = (() => {
    try { return localStorage.getItem("madar_theme_v1") === "dark"; } catch { return false; }
  })();

  // لو الصفحة اتفتحت مباشرة نطبّق نفس الثيم المحفوظ للمنصة
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className={`md-platform${isDark ? " is-dark" : ""}`} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{PLATFORM_CSS}</style>
      <style>{CSS}</style>

      <header className="md-ab-top">
        <Link to="/student" className="md-ab-logo" aria-label="مَدَار — الرئيسية">
          <img src="/photo/0MSCh.png" alt="مَدَار" />
        </Link>
        <button type="button" className="md-ab-back" onClick={() => navigate("/student")}>
          العودة للمنصة <span aria-hidden="true">←</span>
        </button>
      </header>

      <main className="md-ab-wrap">
        <section className="md-ab-hero" aria-label="عن مَدَار">
          <svg className="md-ab-orbits" viewBox="0 0 420 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <ellipse cx="210" cy="120" rx="190" ry="66" transform="rotate(-24 210 120)" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.5" />
            <ellipse cx="210" cy="120" rx="140" ry="46" transform="rotate(-24 210 120)" fill="none" stroke="rgba(227,192,139,.35)" strokeWidth="1.5" strokeDasharray="3 7" />
            <circle cx="338" cy="64" r="6" fill="#E3C08B" />
            <circle cx="84" cy="176" r="4" fill="rgba(255,255,255,.7)" />
          </svg>
          <span className="md-ab-hero-logo">
            <img src="/photo/0MSCh.png" alt="مَدَار" />
          </span>
          <h1>عن مَدَار</h1>
          <p>منصة تعليمية تفاعلية تقدّم الدروس بأسلوب منظّم ومرئي، يساعد الطالب على الاستيعاب خطوة بخطوة.</p>
          <span className="md-ab-pill"><Icon name="cap" /> موجّهة حاليًا لطلاب المرحلة الإعدادية</span>
        </section>

        <section className="md-ab-card">
          <p>
            <strong>مَدَار</strong> منصة تعليمية تفاعلية موجّهة حاليًا لطلاب <strong>المرحلة الإعدادية</strong>.
            نقدّم الدروس بأسلوب منظم ومرئي يساعد الطالب على الاستيعاب خطوة بخطوة.
          </p>
          <p>
            في مرحلتها الأولى، تُدار مَدَار ويُعد محتواها من إدارة المنصة،
            مع التركيز على جودة التجربة التعليمية داخل كل درس.
          </p>
        </section>

        <section aria-label="رحلة التعلّم في مَدَار">
          <h2 className="md-ab-h"><i aria-hidden="true"><Icon name="compass" /></i> رحلة التعلّم في مَدَار</h2>
          <ol className="md-ab-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="md-ab-step" style={{ "--u": s.color }}>
                <span className="md-ab-step-num" aria-hidden="true">{s.n}</span>
                <span className="md-ab-step-ico" aria-hidden="true"><Icon name={s.icon} /></span>
                <b>{s.title}</b>
                <span className="md-ab-step-text">{s.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="md-ab-note">
          <span className="md-ab-note-ico" aria-hidden="true"><Icon name="sparkles" /></span>
          <div>
            <b>تجربة تعليمية نظيفة</b>
            <p>مَدَار حاليًا بلا إعلانات داخل تجربة الطالب. نريد أن يبقى الانتباه مع الدرس، لا مع مشتتات جانبية.</p>
          </div>
        </section>

        <section className="md-ab-card">
          <p>
            يمكنك البدء كزائر في المحتوى المتاح للجميع.
            بعض المشاهد قد تتطلب تسجيل الدخول (Google أو البريد) حسب إعداد كل درس.
          </p>
        </section>

        <div className="md-ab-cta">
          <Link to="/student" className="md-ab-btn">ابدأ التعلّم <span aria-hidden="true">←</span></Link>
          <nav className="md-ab-legal" aria-label="سياسات المنصة">
            <Link to="/student/privacy">سياسة الخصوصية</Link>
            <Link to="/student/terms">الشروط والأحكام</Link>
          </nav>
        </div>
      </main>

      <Footer />
    </div>
  );
}