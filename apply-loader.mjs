// Run from the project root:  node apply-loader.mjs
// Replaces the old loaders with the unified ones. Safe to re-run (idempotent),
// keeps each file's line endings, and reports every replacement it made.
import fs from "node:fs";

const NEW_CSS = [
  ".duo-splash { position: fixed; inset: 0; z-index: 10000; pointer-events: none; display: flex; align-items: center; justify-content: center; background-color: #FFFFFF; background-image: radial-gradient(circle, #E7DFC9 1.6px, transparent 1.8px); background-size: 30px 30px; transition: opacity 0.35s ease, clip-path 0.45s cubic-bezier(0.7, 0, 0.3, 1); clip-path: circle(150% at 50% 50%); }",
  ".duo-splash.leaving { opacity: 0; clip-path: circle(0% at 50% 50%); }",
  ".duo-splash-orbit { position: relative; width: 136px; height: 136px; display: flex; align-items: center; justify-content: center; }",
  ".duo-splash-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--duo-line); }",
  ".duo-splash-spin { position: absolute; inset: 0; animation: duo-splash-orbit 2.4s linear infinite; }",
  ".duo-splash-spin i { position: absolute; top: -6px; left: 50%; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; background: var(--duo-green); }",
  ".duo-splash-spin2 { animation-delay: -1.2s; }",
  ".duo-splash-spin2 i { background: var(--duo-blue); }",
  ".duo-splash-logo { width: 78px; height: 78px; display: flex; align-items: center; justify-content: center; animation: duo-splash-turn 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite; }",
  ".duo-splash-logo img { width: 100%; height: 100%; object-fit: contain; }",
  ".duo-splash-logo b { font: 800 2.6rem var(--duo-font-display); color: var(--duo-green-ink); }",
  "@keyframes duo-splash-orbit { to { transform: rotate(360deg); } }",
  "@keyframes duo-splash-turn { to { transform: rotate(360deg); } }",
  "",
  ".duo-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 55vh; padding: 24px; }",
  ".duo-loader.compact { min-height: 0; padding: 36px 16px; }",
  ".duo-loader-logo { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 14px; background: var(--duo-snow, #FFFFFF); border: 1px solid var(--duo-green); animation: duo-loader-pulse 1.6s ease-in-out infinite; }",
  ".duo-loader-logo img { width: 38px; height: 38px; object-fit: contain; }",
  ".duo-loader-logo b { font: 800 1.5rem var(--duo-font-display); color: var(--duo-green-ink); }",
  ".duo-loader-bar { width: 120px; height: 6px; border-radius: 999px; background: var(--duo-line); overflow: hidden; direction: ltr; }",
  ".duo-loader-bar i { display: block; height: 100%; width: 40%; border-radius: 999px; background: var(--duo-green); animation: duo-loader-slide 1.4s ease-in-out infinite; }",
  ".duo-loader-cap { font: 700 0.8rem var(--duo-font-display); color: var(--duo-muted); }",
  "@keyframes duo-loader-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }",
  "@keyframes duo-loader-slide { from { transform: translateX(-120%); } to { transform: translateX(320%); } }",
];

const IMPORT_DUOFX = (rel) => `import { PageLoader } from "${rel}components/DuoFx";`;
const log = [];

function edit(file, fn) {
  if (!fs.existsSync(file)) { log.push(`MISSING FILE  ${file}`); return; }
  const raw = fs.readFileSync(file, "utf8");
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const before = raw.replace(/\r\n/g, "\n");
  const after = fn(before);
  if (after === before) return;
  fs.writeFileSync(file, after.replace(/\n/g, eol), "utf8");
}

function replaceOnce(file, label, regex, replacement) {
  edit(file, (s) => {
    if (!regex.test(s)) { log.push(`SKIP (not found / already done)  ${file} :: ${label}`); return s; }
    log.push(`OK            ${file} :: ${label}`);
    return s.replace(regex, replacement);
  });
}

function addImport(file, rel) {
  edit(file, (s) => {
    if (/import\s*\{[^}]*PageLoader[^}]*\}\s*from\s*"[^"]*DuoFx"/.test(s)) return s;
    log.push(`OK            ${file} :: import PageLoader`);
    return IMPORT_DUOFX(rel) + "\n" + s;
  });
}

/* 1) CSS */
edit("src/styles/duoTheme.js", (s) => {
  const start = s.indexOf(".duo-splash {");
  const endMarker = s.indexOf("@keyframes duo-splash-dot");
  if (start === -1 || endMarker === -1) { log.push("SKIP (not found / already done)  duoTheme.js :: splash css"); return s; }
  const endLine = s.indexOf("\n", endMarker);
  log.push("OK            src/styles/duoTheme.js :: splash + loader css");
  return s.slice(0, start) + NEW_CSS.join("\n") + s.slice(endLine);
});
edit("src/styles/duoTheme.js", (s) => {
  if (s.includes(".duo-loader-logo, .duo-loader-bar i")) return s;
  const re = /(\.duo-splash \{ display: none !important; \})/;
  if (!re.test(s)) { log.push("SKIP  duoTheme.js :: reduced-motion"); return s; }
  log.push("OK            src/styles/duoTheme.js :: reduced-motion");
  return s.replace(re, "$1\n  .duo-loader-logo, .duo-loader-bar i { animation: none !important; }");
});

/* 2) App.jsx (TeacherGate) */
replaceOnce("src/App.jsx", "import PageLoader", /SwipeBackBubble,\n\} from "\.\/components\/DuoFx";/, 'SwipeBackBubble,\n  PageLoader,\n} from "./components/DuoFx";');
replaceOnce("src/App.jsx", "TeacherGate loader", /<div\s+className="p-10 text-center dir-rtl"[\s\S]*?جاري التحقق من الصلاحيات\.\.\.\s*<\/div>/, '<PageLoader label="جاري التحقق من الصلاحيات…" />');

/* 3) Pages */
replaceOnce("src/pages/StudentLessonPage.jsx", "lesson loader",
  /<div className="flex-1 flex items-center justify-center p-10 dir-rtl"[^>]*>\s*<p>جاري تحميل الدرس\.\.\.<\/p>\s*<\/div>/,
  '<div className="flex-1 flex items-center justify-center dir-rtl"><PageLoader compact label="جاري تحميل الدرس…" /></div>');
addImport("src/pages/StudentLessonPage.jsx", "../");

replaceOnce("src/pages/CmsPage.jsx", "cms loader", /return <div className="p-10 text-center"[^>]*>جاري التحميل\.\.\.<\/div>;/, "return <PageLoader />;");
addImport("src/pages/CmsPage.jsx", "../");

replaceOnce("src/pages/TeacherStudio.jsx", "studio loader", /return <div className="p-10 text-center"[^>]*>جاري تحميل الدرس\.\.\.<\/div>;/, 'return <PageLoader label="جاري تحميل الدرس…" />;');
addImport("src/pages/TeacherStudio.jsx", "../");

replaceOnce("src/pages/LessonLibrary.jsx", "library loader", /\{lessons === null && <p[^>]*>جاري التحميل\.\.\.<\/p>\}/, "{lessons === null && <PageLoader compact />}");
addImport("src/pages/LessonLibrary.jsx", "../");

replaceOnce("src/pages/TeacherSettings.jsx", "settings loader", /\{loading && \(\s*<p[^>]*>\s*جاري تحميل الإعدادات\.\.\.\s*<\/p>\s*\)\}/, '{loading && <PageLoader compact label="جاري تحميل الإعدادات…" />}');
addImport("src/pages/TeacherSettings.jsx", "../");

replaceOnce("src/pages/TeacherFacts.jsx", "facts loader", /<p className="duo-tf-empty">جاري التحميل\.\.\.<\/p>/, "<PageLoader compact />");
addImport("src/pages/TeacherFacts.jsx", "../");

replaceOnce("src/pages/StudentPlatform.jsx", "platform loader",
  /<div className="md-loading">\s*<CompassSpinner \/>\s*<p[^>]*>جاري تجهيز مسارك التعليمي\.\.\.<\/p>\s*<\/div>/,
  '<div className="md-loading"><PageLoader compact label="جاري تجهيز مسارك التعليمي…" /></div>');
addImport("src/pages/StudentPlatform.jsx", "../");

console.log(log.join("\n"));
