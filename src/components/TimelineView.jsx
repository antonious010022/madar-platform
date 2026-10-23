import { useCallback, useEffect, useRef, useState } from "react";

/**
 * الخط الزمني التفاعلي (ملف مستقل) — 3D + حركة، من غير Scrollbar أفقي.
 * - الأحداث بتتقسّم صفحات حسب عرض الشاشة، والطالب يتنقل بسهمين (أو سحب بالإصبع / أسهم الكيبورد).
 * - الكورة بتبدأ دايمًا من بداية الخط (الصفر)، وكل ما تضغط على حدث بتتدحرج من البداية لحد الحدث.
 * - الحدث اللي فيه تفاصيل (وصف / موقع / صورة) بتفتح له لوحة تفاصيل، واللي مفيهوش بتروحله الكورة بس.
 * الاستخدام: <TimelineView items={scene.timeline} />
 *   items: [{ id, date, title, description?, location?, image?, _sceneTitle? }]
 * props اختيارية للمحرر: selectedKey, onSelect(key, item), hideDetail
 */

const STYLE_ID = "md-timeline-view-css-live";
const OLD_STYLE_IDS = ["md-timeline-view-css", "md-timeline-view-css-v2", "md-timeline-view-css-v3"];
const PALETTE = ["#C2562F", "#D4802B", "#C2455F", "#9B4F8E", "#4F7FB0", "#2E8B7A"];
const MIN_COL = 150; // أقل عرض لعمود حدث (px) — بوكسات مريحة حتى على الموبايل
const PAD_S = 1.7; // rem — مساحة بداية الخط (مكان الكورة)
const GUT_NAV = 0.9; // rem — هامش نهاية الصفحة لما فيه سهمين
const GUT_END = 2.9; // rem — مساحة السهم في آخر الخط لو صفحة واحدة

const TL_CSS = `
.md-tl { --ac: #C2562F; --tl-surface: #FFFFFF; --tl-text: #263B35; --tl-muted: #5E6F69; --tl-line: #DED4BD; --ball: 2.1rem;
  direction: rtl; position: relative; border-radius: 1.4rem; border: 1px solid var(--tl-line); color: var(--tl-text); overflow: hidden;
  background-color: color-mix(in srgb, var(--tl-surface) 94%, #FAF6ED);
  background-image: radial-gradient(circle at 1px 1px, rgba(194, 86, 47, 0.2) 1px, transparent 1.4px); background-size: 18px 18px;
  box-shadow: 0 6px 0 rgba(194, 86, 47, 0.12), 0 16px 24px -18px rgba(60, 40, 30, .35); }
html[data-theme="dark"] .md-tl { --tl-surface: #1B2D27; --tl-text: #EAF3F0; --tl-muted: #9DB3AB; --tl-line: #2F4A41; }
.md-tl-stage { position: relative; }
.md-tl-scroller { overflow-x: auto; overflow-y: hidden; padding: 1.6rem 0 1.3rem; scroll-snap-type: x mandatory; scroll-padding-inline-start: var(--padS, 1.7rem); overscroll-behavior-x: contain; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
.md-tl-scroller::-webkit-scrollbar { display: none; }
.md-tl-track { --padS: 1.7rem; --x0: 1.05rem; --x1: calc(var(--padS) + (var(--i) + 0.5) * var(--cw));
  position: relative; box-sizing: border-box; display: grid; grid-template-columns: repeat(var(--n), var(--cw)); grid-template-rows: 1fr 4rem 1fr; padding-inline-start: var(--padS);
  width: calc(var(--padS) + var(--pages) * var(--per) * var(--cw) + var(--gut)); }
.md-tl-node-cell.is-snap { scroll-snap-align: start; }
.md-tl-band { position: absolute; inset-inline: 0; top: calc(50% - 0.5rem); height: 1rem; border-radius: 999px; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0) 55%), rgba(120, 90, 70, 0.16); box-shadow: inset 0 2px 3px rgba(60, 40, 30, .18); }
.md-tl-dotline { position: absolute; inset-inline: 0.2rem 0.2rem; top: calc(50% - 1.5px); border-top: 3px dotted rgba(255,255,255,.85); opacity: .75; pointer-events: none; }
.md-tl-fill { position: absolute; inset-inline-start: 0; top: calc(50% - 0.5rem); height: 1rem; border-radius: 999px; pointer-events: none; width: var(--bx);
  transition: width var(--dur, .7s) cubic-bezier(.45, .05, .3, 1); box-shadow: inset 0 2px 3px rgba(255,255,255,.35), inset 0 -2px 3px rgba(0,0,0,.18); }
.md-tl-home { position: absolute; top: calc(50% - 0.85rem); width: 1.7rem; height: 1.7rem; margin-inline-start: -0.85rem; inset-inline-start: var(--hx); transition: inset-inline-start .6s cubic-bezier(.45, .05, .3, 1); border-radius: 50%; border: 2px dashed color-mix(in srgb, var(--bc) 70%, transparent); background: color-mix(in srgb, var(--bc) 12%, transparent); pointer-events: none; }
.md-tl-deco { position: absolute; inset-inline-end: 0.2rem; top: calc(50% - 0.95rem); width: 1.9rem; height: 1.9rem; color: var(--decoc, #C2562F); pointer-events: none; filter: drop-shadow(0 2px 0 rgba(0,0,0,.12)); }
.md-tl-ball { position: absolute; z-index: 3; top: calc(50% - var(--ball) / 2); width: var(--ball); height: var(--ball); margin-inline-start: calc(var(--ball) / -2); pointer-events: none;
  inset-inline-start: var(--bx); transition: inset-inline-start var(--dur, .7s) cubic-bezier(.45, .05, .3, 1); }
.md-tl-ball::before { content: ""; position: absolute; inset-inline: 12%; bottom: -0.55rem; height: .45rem; border-radius: 50%; background: rgba(0,0,0,.22); }
.md-tl-ball-land { position: absolute; inset: 0; animation: md-tl-bob 2.4s ease-in-out infinite; }
.md-tl-ball-land.is-hop { animation: md-tl-land .55s ease var(--dur, .7s) both, md-tl-bob 2.4s ease-in-out calc(var(--dur, .7s) + .55s) infinite; }
.md-tl-ball-spin { position: absolute; inset: 0; border-radius: 50%; transform: rotate(calc(var(--rot, 0) * -320deg)); transition: transform var(--dur, .7s) cubic-bezier(.45, .05, .3, 1); }
.md-tl-ball-body { position: absolute; inset: 0; border-radius: 50%; background-color: var(--bc);
  box-shadow: 0 5px 10px -3px rgba(0,0,0,.4), inset -3px -4px 6px rgba(0,0,0,.28), inset 2px 2px 4px rgba(255,255,255,.35); }
.md-tl-ball-body::after { content: ""; position: absolute; top: 14%; inset-inline-start: 20%; width: 32%; height: 26%; border-radius: 50%; background: radial-gradient(circle at 40% 40%, #fff, rgba(255,255,255,0) 72%); }
.md-tl-ball-body::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: repeating-conic-gradient(from 0deg, rgba(255,255,255,.22) 0 12deg, transparent 12deg 60deg); mask-image: radial-gradient(circle, transparent 38%, #000 40%); -webkit-mask-image: radial-gradient(circle, transparent 38%, #000 40%); }
.md-tl-cell { display: flex; flex-direction: column; align-items: center; min-width: 0; animation: md-tl-pop .55s cubic-bezier(.3, 1.5, .5, 1) both; animation-delay: calc(min(var(--k), 5) * 70ms); }
.md-tl-cell.is-top { grid-row: 1; justify-content: flex-end; }
.md-tl-cell.is-bottom { grid-row: 3; justify-content: flex-start; }
.md-tl-node-cell { grid-row: 2; display: grid; place-items: center; position: relative; z-index: 1; }
.md-tl-node { width: 1.7rem; height: 1.7rem; border-radius: 50%; display: grid; place-items: center; background: var(--tl-surface); border: 3px solid var(--c); box-shadow: 0 3px 0 var(--c-dark), 0 6px 8px -4px rgba(0,0,0,.35); transition: transform .3s ease; }
.md-tl-node::after { content: ""; width: .62rem; height: .62rem; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff 0 12%, var(--c) 45%, var(--c-dark) 100%); }
.md-tl-node-cell.is-on .md-tl-node { transform: scale(1.18); }
.md-tl-node-cell.is-on::before { content: ""; position: absolute; width: 1.7rem; height: 1.7rem; border-radius: 50%; border: 3px solid var(--c); opacity: 0; animation: md-tl-ring 1.5s ease-out var(--dur, .7s) 3; }
.md-tl-stem { flex: none; width: 0; height: 1.3rem; border-inline-start: 3px dotted var(--c); opacity: .75; }
.md-tl-box { width: calc(100% - 0.6rem); max-width: 15rem; min-height: 4.8rem; padding: 0.8rem 0.65rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.12rem; text-align: center; font: inherit; color: inherit; cursor: pointer;
  background: linear-gradient(180deg, var(--tl-surface), color-mix(in srgb, var(--c) 9%, var(--tl-surface))); border: 2px solid var(--c); border-radius: 1rem;
  box-shadow: 0 4px 0 var(--c-dark), 0 14px 18px -12px color-mix(in srgb, var(--c) 70%, transparent);
  transition: transform .18s ease, box-shadow .18s ease, background .25s ease; -webkit-tap-highlight-color: transparent; }
.md-tl-box b { font-size: clamp(1.2rem, 4.2vw, 1.5rem); font-weight: 900; line-height: 1.2; color: var(--c); transition: color .2s ease; }
.md-tl-box span { font-size: clamp(.9rem, 3.1vw, 1.05rem); font-weight: 800; line-height: 1.5; color: var(--tl-text); overflow-wrap: anywhere; transition: color .2s ease; }
html[data-theme="dark"] .md-tl-box b { color: color-mix(in srgb, var(--c) 62%, #fff); }
.md-tl-box:hover { transform: translateY(-3px); box-shadow: 0 7px 0 var(--c-dark), 0 18px 22px -12px color-mix(in srgb, var(--c) 75%, transparent); }
.md-tl-box:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--c-dark); }
.md-tl-box:focus-visible { outline: 3px solid color-mix(in srgb, var(--c) 40%, transparent); outline-offset: 3px; }
.md-tl-box.has-info::after { content: "اضغط للتفاصيل"; font-size: .7rem; font-weight: 800; color: var(--tl-muted); }
.md-tl-box.is-on { background: linear-gradient(180deg, color-mix(in srgb, var(--c) 82%, #fff), var(--c)); transform: translateY(-3px); box-shadow: 0 7px 0 var(--c-dark), 0 18px 24px -10px color-mix(in srgb, var(--c) 80%, transparent); }
.md-tl-box.is-on b, .md-tl-box.is-on span, .md-tl-box.is-on::after { color: #fff; }
.md-tl-controls { display: flex; align-items: center; justify-content: space-between; gap: .6rem; padding: .35rem .9rem 1rem; }
.md-tl-nav { flex: none; width: 3rem; height: 3rem; padding: 0; display: grid; place-items: center; cursor: pointer; border-radius: 50%; color: var(--ac); border: 2px solid var(--ac);
  background: linear-gradient(180deg, var(--tl-surface), color-mix(in srgb, var(--ac) 14%, var(--tl-surface)));
  box-shadow: 0 4px 0 color-mix(in srgb, var(--ac) 68%, #000), 0 10px 14px -8px rgba(60, 40, 30, .5); transition: transform .15s ease, box-shadow .15s ease, opacity .2s ease; -webkit-tap-highlight-color: transparent; }
.md-tl-nav:hover:not(:disabled) { transform: translateY(-2px); }
.md-tl-nav:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 color-mix(in srgb, var(--ac) 68%, #000); }
.md-tl-nav:disabled { opacity: .35; cursor: default; box-shadow: none; transform: translateY(3px); }
.md-tl-nav:focus-visible { outline: 3px solid color-mix(in srgb, var(--ac) 40%, transparent); outline-offset: 3px; }
.md-tl-nav svg { width: 1.4rem; height: 1.4rem; }
.md-tl-nav.is-next:not(:disabled) svg { animation: md-tl-nudge 1.6s ease-in-out infinite; }
.md-tl-pager { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: .35rem; }
.md-tl-dots { display: flex; align-items: center; justify-content: center; gap: .4rem; flex-wrap: wrap; }
.md-tl-dots button { width: .6rem; height: .6rem; padding: 0; border: 0; border-radius: 999px; cursor: pointer; background: color-mix(in srgb, var(--ac) 28%, transparent); transition: width .25s ease, background .25s ease; }
.md-tl-dots button[aria-current="true"] { width: 1.6rem; background: var(--ac); box-shadow: 0 2px 0 color-mix(in srgb, var(--ac) 68%, #000); }
.md-tl-pager small { font-size: .76rem; font-weight: 800; color: var(--tl-muted); }
.md-tl-detail { margin: 0 0.8rem 1rem; padding: 0.95rem 1rem; border-radius: 1rem; background: var(--tl-surface); border: 2px solid var(--c); border-inline-start-width: 6px; box-shadow: 0 4px 0 color-mix(in srgb, var(--c) 68%, #000); animation: md-tl-in .3s ease both; }
.md-tl-detail-head { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; margin-bottom: .45rem; }
.md-tl-chip { padding: .2rem .75rem; border-radius: 999px; font-size: .82rem; font-weight: 900; color: #fff; background: var(--c); box-shadow: 0 2px 0 color-mix(in srgb, var(--c) 68%, #000); }
.md-tl-detail h4 { margin: 0; font-size: 1rem; font-weight: 900; flex: 1 1 auto; min-width: 0; }
.md-tl-close { flex: none; width: 1.9rem; height: 1.9rem; border-radius: 50%; border: 1px solid var(--tl-line); background: transparent; color: var(--tl-muted); cursor: pointer; font-size: .9rem; line-height: 1; }
.md-tl-close:hover { color: var(--c); border-color: var(--c); }
.md-tl-detail p { margin: 0; font-size: .92rem; line-height: 1.9; font-weight: 600; color: var(--tl-muted); }
.md-tl-detail .md-tl-loc { margin-top: .35rem; font-weight: 800; color: var(--c); }
.md-tl-detail .md-tl-from { margin-top: .35rem; font-size: .76rem; font-weight: 700; }
.md-tl-detail img { display: block; width: 100%; max-height: 14rem; margin-top: .65rem; object-fit: cover; border-radius: .8rem; }
@keyframes md-tl-roll { from { inset-inline-start: var(--x0); } to { inset-inline-start: var(--x1); } }
@keyframes md-tl-fillgrow { from { width: var(--x0); } to { width: var(--x1); } }
@keyframes md-tl-spin { from { transform: rotate(0deg); } to { transform: rotate(var(--spin, -360deg)); } }
@keyframes md-tl-land { 0% { transform: scale(1, 1); } 30% { transform: scale(1.2, .8); } 65% { transform: translateY(-.9rem) scale(.92, 1.1); } 100% { transform: scale(1, 1); } }
@keyframes md-tl-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes md-tl-ring { 0% { opacity: .75; transform: scale(1); } 100% { opacity: 0; transform: scale(2.1); } }
@keyframes md-tl-pop { from { opacity: 0; transform: translateY(14px) scale(.9); } to { opacity: 1; transform: none; } }
@keyframes md-tl-nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-3px); } }
@keyframes md-tl-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@media (max-width: 520px) { .md-tl { --ball: 1.9rem; } .md-tl-nav { width: 2.8rem; height: 2.8rem; } }
@media (prefers-reduced-motion: reduce) { .md-tl *, .md-tl *::before, .md-tl *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; animation-delay: 0s !important; transition: none !important; } }
`;

// بصمة للـ CSS: لو الكود اتغيّر (أو الصفحة اتعمل لها Hot Reload) بنحدّث الـ <style> بدل ما نسيب نسخة قديمة
const CSS_REV = `${TL_CSS.length}-${Array.from(TL_CSS).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)}`;

function useTimelineStyle() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    OLD_STYLE_IDS.forEach((id) => { const old = document.getElementById(id); if (old) old.remove(); });
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    if (el.getAttribute("data-rev") !== CSS_REV) {
      el.textContent = TL_CSS;
      el.setAttribute("data-rev", CSS_REV);
    }
  }, []);
}

const hasInfo = (it) => !!(String(it?.description || "").trim() || String(it?.location || "").trim() || it?.image);
const colorAt = (i) => PALETTE[i % PALETTE.length];
const dark = (c) => `color-mix(in srgb, ${c} 68%, #000)`;

const ChevR = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>);
const ChevL = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>);

export default function TimelineView({
  items,
  showSceneTitle = false,
  initialOpenKey = null,
  className = "",
  selectedKey,
  onSelect,
  interactiveAll = false, // متروك للتوافق
  hideDetail = false,
}) {
  useTimelineStyle();
  const list = Array.isArray(items) ? items.filter((it) => it && (it.date || it.title)) : [];
  const n = list.length;
  const keyOf = (it, i) => String(it.id ?? `tl-${i}`);

  const rootRef = useRef(null);
  const scRef = useRef(null);
  const raf = useRef(0);
  const prevX = useRef(-0.6);
  const [width, setWidth] = useState(0);
  const [rem, setRem] = useState(16);
  const [page, setPage] = useState(0);
  const [roll, setRoll] = useState(0);
  const [openKey, setOpenKey] = useState(initialOpenKey);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    setRem(parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    const measure = () => setWidth(el.clientWidth);
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [n > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // عدد الأحداث في "الشاشة" الواحدة + هل محتاج أسهم
  const V = width || 340;
  const perFull = Math.max(2, Math.min(6, Math.floor((V - (PAD_S + GUT_NAV) * rem) / MIN_COL)));
  const hasNav = n > perFull;
  const per = hasNav ? perFull : Math.max(1, n);
  const gut = hasNav ? GUT_NAV : GUT_END;
  const cw = Math.max(90, (V - (PAD_S + gut) * rem) / per);
  const pages = Math.max(1, Math.ceil(n / per));
  const step = per * cw;
  const pg = Math.min(page, pages - 1);

  const controlled = selectedKey !== undefined;
  const activeKey = controlled ? selectedKey : openKey;
  const selectedIdx = list.findIndex((it, i) => keyOf(it, i) === activeKey);
  const rolling = selectedIdx >= 0;
  const current = !hideDetail && rolling && hasInfo(list[selectedIdx]) ? list[selectedIdx] : null;
  const currentColor = colorAt(rolling ? selectedIdx : pg * per);

  const reduce = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animRef = useRef(0);
  const stopAnim = () => {
    if (!animRef.current) return;
    cancelAnimationFrame(animRef.current);
    animRef.current = 0;
    if (scRef.current) scRef.current.style.scrollSnapType = "";
  };
  // تمرير سلس متصل (rAF) — بيشتغل بنفس الشكل في كل المتصفحات، مش قفزة بين شاشات
  const scrollToPage = useCallback((p) => {
    const el = scRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const to = -Math.min(Math.max(0, p) * step, max); // الصفحة RTL: القيم سالبة
    const from = el.scrollLeft;
    cancelAnimationFrame(animRef.current);
    if (reduce() || Math.abs(to - from) < 2) { el.scrollLeft = to; animRef.current = 0; return; }
    const ms = Math.min(950, 380 + Math.abs(to - from) * 0.9);
    const t0 = performance.now();
    el.style.scrollSnapType = "none";
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // easeInOutCubic
      el.scrollLeft = from + (to - from) * e;
      if (k < 1) animRef.current = requestAnimationFrame(tick);
      else { animRef.current = 0; el.style.scrollSnapType = ""; }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [step]);

  // الصفحة الحالية من مكان التمرير (سحب أو أسهم)
  const onScroll = () => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = scRef.current;
      if (!el) return;
      const off = Math.abs(el.scrollLeft);
      const max = el.scrollWidth - el.clientWidth;
      let p = Math.round(off / step);
      if (max > 0 && off >= max - 2) p = pages - 1;
      setPage(Math.max(0, Math.min(pages - 1, p)));
    });
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // اختيار حدث خارج الشاشة الحالية (من المحرر مثلًا) → مرّر له
  useEffect(() => {
    if (selectedIdx >= 0 && hasNav) {
      const p = Math.floor(selectedIdx / per);
      if (p !== pg) scrollToPage(p);
    }
  }, [selectedIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = useCallback((next, it) => {
    if (!controlled) setOpenKey(next);
    if (onSelect) onSelect(next, it || null);
  }, [controlled, onSelect]);

  const toggle = (k, it) => {
    setRoll((r) => r + 1);
    select(activeKey === k ? null : k, it);
  };

  const next = () => scrollToPage(Math.min(pages - 1, pg + 1));
  const prev = () => scrollToPage(Math.max(0, pg - 1));
  const onKeyDown = (e) => {
    if (!hasNav) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); next(); }
    if (e.key === "ArrowRight") { e.preventDefault(); prev(); }
  };

  if (n === 0) return null;

  // مكان الكورة بوحدة "عمود": حدث محدد، أو بداية الصفحة الحالية
  const curX = rolling ? selectedIdx + 0.5 : pg * per - 0.6;
  const dur = Math.min(1.6, 0.45 + 0.09 * Math.abs(curX - prevX.current));
  prevX.current = curX;
  const fillColors = rolling ? list.slice(0, selectedIdx + 1).map((_, i) => colorAt(i)) : [];
  if (fillColors.length === 1) fillColors.push(fillColors[0]);
  const from = pg * per + 1;
  const to = Math.min(n, (pg + 1) * per);

  return (
    <div ref={rootRef} className={`md-tl ${className}`.trim()} data-kind="timeline-view"
      style={{ "--bc": currentColor, "--decoc": colorAt(n - 1), "--dur": `${dur.toFixed(2)}s` }}
      onKeyDown={onKeyDown}>
      <div className="md-tl-stage">
        <div className="md-tl-scroller" ref={scRef} onScroll={onScroll} onTouchStart={stopAnim} onWheel={stopAnim} onPointerDown={stopAnim}>
          <div className="md-tl-track" role="list"
            style={{
              "--n": n, "--per": per, "--pages": pages, "--cw": `${cw.toFixed(1)}px`, "--gut": `${gut}rem`, "--pg": pg, "--i": rolling ? selectedIdx : 0,
              "--hx": "calc(var(--x0) + var(--pg) * var(--per) * var(--cw))", "--bx": rolling ? "var(--x1)" : "calc(var(--x0) + var(--pg) * var(--per) * var(--cw))",
            }}>
            <span className="md-tl-band" aria-hidden="true" />
            <span className="md-tl-dotline" aria-hidden="true" />
            <span className="md-tl-fill" aria-hidden="true" style={{ background: rolling ? `linear-gradient(to left, ${fillColors.join(", ")})` : "transparent" }} />
            <span className="md-tl-home" aria-hidden="true" />
            {!hasNav && (
              <svg className="md-tl-deco" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5 8 12l7 7" /></svg>
            )}
            <span className="md-tl-ball" style={{ "--rot": rolling ? selectedIdx + 1 : pg * per }} aria-hidden="true">
              <span className={`md-tl-ball-land${rolling ? " is-hop" : ""}`} key={`l-${rolling ? activeKey : "idle"}-${roll}`}>
                <span className="md-tl-ball-spin"><span className="md-tl-ball-body" /></span>
              </span>
            </span>
            {list.map((it, i) => {
              const k = keyOf(it, i);
              const top = i % 2 === 0;
              const on = selectedIdx === i;
              const info = hasInfo(it);
              const c = colorAt(i);
              const sty = { gridColumn: i + 1, "--c": c, "--c-dark": dark(c), "--k": i };
              return (
                <div key={k} style={{ display: "contents" }} role="listitem">
                  <div className={`md-tl-cell ${top ? "is-top" : "is-bottom"}`} style={sty}>
                    {!top && <span className="md-tl-stem" aria-hidden="true" />}
                    <button
                      type="button"
                      className={`md-tl-box${info && !hideDetail ? " has-info" : ""}${on ? " is-on" : ""}`}
                      aria-expanded={info && !hideDetail ? on : undefined}
                      aria-pressed={info && !hideDetail ? undefined : on}
                      onClick={() => toggle(k, it)}
                    >
                      {it.date ? <b>{it.date}</b> : null}
                      {it.title ? <span>{it.title}</span> : null}
                    </button>
                    {top && <span className="md-tl-stem" aria-hidden="true" />}
                  </div>
                  <div className={`md-tl-node-cell${on ? " is-on" : ""}${i % per === 0 ? " is-snap" : ""}`} style={sty} aria-hidden="true"><span className="md-tl-node" /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {hasNav && (
        <div className="md-tl-controls">
          <button type="button" className="md-tl-nav is-prev" onClick={prev} disabled={pg === 0} aria-label="الأحداث السابقة"><ChevR /></button>
          <div className="md-tl-pager" role="group" aria-label="مواضع الخط الزمني">
            <div className="md-tl-dots">
              {Array.from({ length: pages }, (_, p) => (
                <button key={p} type="button" aria-label={`الجزء ${p + 1} من ${pages}`} aria-current={p === pg ? "true" : undefined} onClick={() => scrollToPage(p)} />
              ))}
            </div>
            <small>{from}–{to} من {n}</small>
          </div>
          <button type="button" className="md-tl-nav is-next" onClick={next} disabled={pg === pages - 1} aria-label="الأحداث التالية"><ChevL /></button>
        </div>
      )}

      {current && (
        <div className="md-tl-detail" style={{ "--c": currentColor }} role="region" aria-live="polite" aria-label={`تفاصيل: ${current.title || current.date || "الحدث"}`}>
          <div className="md-tl-detail-head">
            {current.date ? <span className="md-tl-chip">{current.date}</span> : null}
            {current.title ? <h4>{current.title}</h4> : <span style={{ flex: 1 }} />}
            <button type="button" className="md-tl-close" aria-label="إغلاق التفاصيل" onClick={() => select(null, null)}>✕</button>
          </div>
          {String(current.description || "").trim() ? <p>{current.description}</p> : null}
          {String(current.location || "").trim() ? <p className="md-tl-loc">📍 الموقع: {current.location}</p> : null}
          {current.image ? <img src={current.image} alt={current.title || "حدث"} loading="lazy" /> : null}
          {showSceneTitle && current._sceneTitle ? <p className="md-tl-from">من مشهد: {current._sceneTitle}</p> : null}
        </div>
      )}
    </div>
  );
}