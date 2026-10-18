import { createContext, useContext, useLayoutEffect, useSyncExternalStore } from "react";

/* ثيم داشبورد المعلم — مستقل تمامًا عن منصة الطالب.
   - مفتاح تخزين خاص بالمعلم (لا يلمس ثيم الطالب).
   - يُطبَّق عبر attribute على <html> اسمه data-teacher-theme (وليس data-theme / class="dark" الخاصين بالطالب).
   - كل الأنماط محصورة داخل .ts-root فقط، فلا تتأثر صفحات الطالب أبدًا. */

const KEY = "madar_teacher_theme_v1";
const EVENT = "madar-teacher-theme";

function read() {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch (_) {
    return "light";
  }
}

function subscribe(cb) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // مزامنة بين التابات
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setTeacherTheme(next) {
  try {
    localStorage.setItem(KEY, next === "dark" ? "dark" : "light");
  } catch (_) {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useTeacherTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "light");
  return [theme, (t) => setTeacherTheme(t ?? (theme === "dark" ? "light" : "dark"))];
}

/* ---------- الأنماط ---------- */

// React يحوّل #HEX في style إلى rgb(...) داخل الـDOM، فنطابق بصيغة rgb.
const RGB = {
  "#FFFFFF": "rgb(255, 255, 255)",
  "#F7F5FB": "rgb(247, 245, 251)",
  "#EFEAFD": "rgb(239, 234, 253)",
  "#E3E0EE": "rgb(227, 224, 238)",
  "#4B2FD1": "rgb(75, 47, 209)",
  "#2E1C86": "rgb(46, 28, 134)",
  "#171333": "rgb(23, 19, 51)",
  "#433F66": "rgb(67, 63, 102)",
  "#6E6B85": "rgb(110, 107, 133)",
  "#D6334B": "rgb(214, 51, 75)",
  "#A1172B": "rgb(161, 23, 43)",
  "#FDE8EC": "rgb(253, 232, 236)",
  "#F7E6C4": "rgb(247, 230, 196)",
};

// خاصية color (النص) فقط — لا تلتقط border-color / background-color
const D = 'html[data-teacher-theme="dark"] ';
const txt = (hex) => `${D}.ts-root [style^="color: ${RGB[hex]}"], ${D}.ts-root [style*="; color: ${RGB[hex]}"]`;
// خاصية background (الشورت-هاند)
const bg = (hex) => `${D}.ts-root [style^="background: ${RGB[hex]}"], ${D}.ts-root [style*="; background: ${RGB[hex]}"]`;

export const TEACHER_DARK_CSS = `
/* ملاحظة: data-theme="dark" بيتفرض على <html> داخل داشبورد المعلم (انظر الـeffect تحت)،
   فمتغيّرات duoTheme الداكنة (--lp-* و --duo-* و --md-*) شغّالة هنا بنفس ألوان المنصة.
   وقسم "16) FALLBACK" في duoTheme بيحوّل ألوان النصوص/الحدود القديمة لمتغيّرات الثيم لوحده.
   اللي ناقص: الخلفيات البيضاء الثابتة، ودي بنغطيها هنا (داخل .ts-root فقط). */
html[data-teacher-theme="dark"] .ts-root { color-scheme: dark; }

/* خلفيات بيضاء ثابتة (Tailwind + inline + كلاسات Duo المكتوبة بـ #FFFFFF) */
html[data-teacher-theme="dark"] .ts-root .bg-white,
${bg("#FFFFFF")},
html[data-teacher-theme="dark"] .ts-root :is(.duo-ts-link, .duo-ts-tab, .duo-cur-row, .duo-cur-btn, .duo-tf-card, .duo-tf-item, .duo-tf-mini, .duo-btn-ghost, .duo-close, .duo-modal, .duo-lib-top, .duo-lib-btn, .duo-lib-filters, .duo-lib-chip, .duo-lib-group, .duo-lib-card, .duo-lib-gcard, .duo-lib-gcard .duo-lib-covertools) {
  background: var(--lp-surface) !important;
}
html[data-teacher-theme="dark"] .ts-root :is(.duo-lib-btn, .duo-lib-chip) { color: var(--duo-ink-soft); border-color: var(--duo-line); }
html[data-teacher-theme="dark"] .ts-root .duo-lib-btn.blue { background: var(--duo-blue-s) !important; color: var(--duo-blue-ink); border-color: var(--duo-blue); }
html[data-teacher-theme="dark"] .ts-root .duo-lib-btn.yellow { background: var(--duo-yellow-s) !important; color: var(--duo-yellow-ink); border-color: var(--duo-yellow); }
html[data-teacher-theme="dark"] .ts-root .duo-lib-btn.pink { background: var(--duo-pink-s) !important; color: var(--duo-pink-ink); border-color: var(--duo-pink); }
html[data-teacher-theme="dark"] .ts-root .duo-lib-btn.primary,
html[data-teacher-theme="dark"] .ts-root .duo-lib-chip.on { background: var(--duo-green) !important; color: #fff; border-color: var(--duo-green); }
html[data-teacher-theme="dark"] .ts-root .duo-lib-chip.status.on { background: var(--duo-blue) !important; border-color: var(--duo-blue); }
html[data-teacher-theme="dark"] .ts-root :is(.duo-lib-gcard-main, .duo-lib-ghero) { background: linear-gradient(145deg, var(--duo-snow), var(--lp-surface)); }
html[data-teacher-theme="dark"] .ts-root :is(.duo-lib-gcard-body, .duo-lib-ghero-text) { text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6); }
html[data-teacher-theme="dark"] .ts-root :is(.duo-ts-link, .duo-ts-tab, .duo-cur-row, .duo-cur-btn, .duo-tf-card, .duo-tf-item, .duo-tf-mini) {
  color: var(--duo-ink);
  border-color: var(--duo-line);
}
html[data-teacher-theme="dark"] .ts-root .duo-ts-link.yellow { background: var(--duo-yellow-s) !important; color: var(--duo-yellow-ink); }
html[data-teacher-theme="dark"] .ts-root .duo-ts-tab[data-active="true"],
html[data-teacher-theme="dark"] .ts-root .duo-cur-btn.ok { background: var(--duo-green) !important; color: #fff; }
html[data-teacher-theme="dark"] .ts-root .duo-tf-item.off { background: var(--duo-snow) !important; }

/* خلفيات فاتحة ملوّنة */
${bg("#EFEAFD")} { background: var(--duo-green-s) !important; }
${bg("#F7E6C4")} { background: var(--duo-yellow-s) !important; }
${bg("#FDE8EC")} { background: var(--duo-red-s) !important; }
${bg("#E3E0EE")} { background: var(--duo-line) !important; }

/* نصوص مش متغطّية في duoTheme */
${txt("#2E1C86")} { color: var(--duo-green-ink) !important; }
${txt("#A1172B")} { color: #F0919E !important; }
${txt("#F7F5FB")} { color: var(--duo-ink) !important; }

/* حقول الإدخال */
html[data-teacher-theme="dark"] .ts-root :is(input:not([type="checkbox"]):not([type="radio"]), select, textarea) {
  background: var(--duo-snow);
  color: var(--duo-ink);
  border-color: var(--duo-line);
}
html[data-teacher-theme="dark"] .ts-root :is(input, select, textarea)::placeholder { color: var(--duo-muted); }
html[data-teacher-theme="dark"] .ts-root :is(input, select, textarea):focus { background: var(--lp-surface); }
`;

const TOGGLE_CSS = `
.ts-theme-toggle {
  position: fixed; bottom: 16px; left: 16px; z-index: 60;
  width: 42px; height: 42px; border-radius: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 18px; line-height: 1; cursor: pointer;
  background: #FFFFFF; border: 1px solid #DED4BD; box-shadow: 0 3px 0 #DED4BD;
  transition: transform .14s ease, box-shadow .14s ease;
}
.ts-theme-toggle:hover { transform: translateY(-1px); }
.ts-theme-toggle:active { transform: translateY(3px); box-shadow: 0 0 0 transparent; }
html[data-teacher-theme="dark"] .ts-theme-toggle { background: #192723; border-color: #30423B; box-shadow: 0 3px 0 #30423B; }
@media print { .ts-theme-toggle { display: none; } }
`;

const ScopeCtx = createContext(false);

/* الطبقة الفعلية: تحقن الأنماط، تفرض ثيم المعلم على <html>، وترسم الزر. */
function ThemeLayer({ floating = true }) {
  const [theme, setTheme] = useTeacherTheme();

  // useLayoutEffect عشان الثيم يتفرض قبل أول رسم للصفحة (من غير وميض بثيم الطالب)
  useLayoutEffect(() => {
    const root = document.documentElement;
    // ثيم الطالب بيشتغل بـ html[data-theme="dark"]. داخل داشبورد المعلم نفرض اختيار المعلم عليه
    // (عشان ثيم الطالب ما يتسرّبش هنا)، وعند الخروج نرجّع القيمة الأصلية زي ما كانت.
    // مش بنكتب في localStorage الخاص بالطالب أبدًا.
    const prev = root.getAttribute("data-theme");
    const apply = () => {
      if (root.getAttribute("data-teacher-theme") !== theme) root.setAttribute("data-teacher-theme", theme);
      if (root.getAttribute("data-theme") !== theme) root.setAttribute("data-theme", theme);
    };
    apply();

    // حراسة: لو أي كود تاني رجّع data-theme لثيم الطالب بعد ما نفرضه، نرجّع ثيم المعلم فورًا.
    // حد أقصى للتصحيحات عشان ما ندخلش في صراع لا نهائي مع كود تاني.
    let fixes = 0;
    const mo = new MutationObserver(() => {
      if (fixes >= 200) return;
      if (root.getAttribute("data-theme") !== theme || root.getAttribute("data-teacher-theme") !== theme) {
        fixes += 1;
        apply();
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-teacher-theme"] });

    return () => {
      mo.disconnect();
      root.removeAttribute("data-teacher-theme");
      if (prev === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", prev);
    };
  }, [theme]);

  return (
    <>
      <style>{TEACHER_DARK_CSS + TOGGLE_CSS}</style>
      {floating ? (
        <button
          type="button"
          className="ts-theme-toggle"
          onClick={() => setTheme()}
          aria-label={theme === "dark" ? "التبديل للوضع الفاتح" : "التبديل للوضع الداكن"}
          title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      ) : null}
    </>
  );
}

/* الاستخدام الأفضل: لفّ كل مسارات /teacher/* مرة واحدة (في TeacherGate داخل App.jsx).
   بعدها أي <TeacherThemeToggle /> جوه الصفحات بيتحوّل لـ no-op تلقائيًا (مفيش زرّين). */
export function TeacherThemeScope({ children, floating = true }) {
  return (
    <ScopeCtx.Provider value={true}>
      <ThemeLayer floating={floating} />
      {children}
    </ScopeCtx.Provider>
  );
}

/* استخدام مستقل داخل صفحة (لو مفيش TeacherThemeScope فوقه). جوه الـScope بيرجّع null. */
export default function TeacherThemeToggle({ floating = true }) {
  const inScope = useContext(ScopeCtx);
  if (inScope) return null;
  return <ThemeLayer floating={floating} />;
}