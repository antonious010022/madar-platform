import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ---------------------------------------------------------------------------
// Mind Map — خريطة ذهنية أفقية (RTL) بكاميرا ذكية وحركة سلسة وشكل ثلاثي الأبعاد خفيف.
//  • الضغط على أي عنصر => الكاميرا تروح له وللفروع اللي ظهرت وتقرّب عليهم، وباقي الخريطة يخفت.
//  • كل الحركة بـ CSS transforms فقط (بدون فلاتر/ظلال ثقيلة) فتبقى خفيفة على التليفون.
//  • سحب بالماوس/الإصبع، قرص بإصبعين للتكبير، Ctrl+عجلة الماوس للتكبير، ودعم كامل للكيبورد.
// الواجهة القديمة محفوظة: <MindMapViewerNode node onSelectNode selectedNodeId />
// ---------------------------------------------------------------------------
const MG_PALETTE = [
  { base: "#147A6A", dark: "#0B4F44", soft: "#E3F3EE" },
  { base: "#B8832A", dark: "#86590F", soft: "#F8EDD6" },
  { base: "#4C7FA1", dark: "#2E5B7B", soft: "#E4EFF6" },
  { base: "#A8587A", dark: "#7A3556", soft: "#F7E6EE" },
  { base: "#6B5A9E", dark: "#463878", soft: "#EAE6F6" },
  { base: "#3F8F4B", dark: "#276A33", soft: "#E3F2E5" },
];
const MG_GAP = 62; // المسافة بين الأعمدة
const MG_ROW = 76; // ارتفاع الصف
const MG_DEPTH = 5; // "سمك" الزر ثلاثي الأبعاد
const MG_EASE = "cubic-bezier(.22,.9,.28,1)";
let MG_UID = 0;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mgReduced = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function mgWrap(text, maxChars, maxLines) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  const out = [];
  for (const l of lines) {
    if (l.length > maxChars + 4) for (let a = 0; a < l.length; a += maxChars) out.push(l.slice(a, a + maxChars));
    else out.push(l);
  }
  if (out.length > maxLines) {
    const cut = out.slice(0, maxLines);
    cut[maxLines - 1] = cut[maxLines - 1].slice(0, Math.max(1, maxChars - 1)) + "…";
    return cut;
  }
  return out.length ? out : [""];
}

const mgKids = (node, editing) => (Array.isArray(node?.children) ? node.children.filter((c) => c && (editing || c.label)) : []);

/**
 * شجرة بمفاتيح ثابتة: مفتاح العقدة = id بتاعها (لو موجود)، فالفتح/الطي والفوكس
 * يفضلوا صح حتى لو اتضاف/اتحذف/اتنقل فرع. الجذر مفتاحه دايمًا "0".
 * في وضع التحرير (editing) العقد اللي من غير عنوان بتظهر كعقد "شبح" بدل ما تختفي.
 */
function mgBuildTree(root, editing) {
  const seen = new Set(["0"]);
  const mk = (node, depth, path, branch, parentKey, idx) => {
    let key = path === "0" ? "0" : node.id ? `n:${node.id}` : path;
    if (path !== "0" && seen.has(key)) key = path; // id مكرر
    seen.add(key);
    const e = { key, node, depth, branch, parentKey, idx, kids: [] };
    e.kids = mgKids(node, editing).map((c, i) => mk(c, depth + 1, `${path}.${i}`, depth === 0 ? i : branch, key, i));
    return e;
  };
  return mk(root, 0, "0", -1, null, 0);
}

const mgCount = (t) => 1 + t.kids.reduce((sum, c) => sum + mgCount(c), 0);

function mgAllKeys(t, out = []) {
  if (t.kids.length) out.push(t.key);
  t.kids.forEach((c) => mgAllKeys(c, out));
  return out;
}

/** افتراضيًا: الجذر مفتوح. لو الخريطة صغيرة نفتح المستوى الثاني كمان. */
function mgDefaultOpen(t) {
  const set = new Set(["0"]);
  if (mgCount(t) <= 16) t.kids.forEach((c) => { if (c.kids.length) set.add(c.key); });
  return set;
}

/**
 * الإحداثيات ثابتة: الجذر عند x=0 والأفرع بتمتد لليسار (قيم سالبة)،
 * فلما تفتح فرع مفيش حاجة بتتحرك غير اللي لازم تتحرك.
 */
function mgLayout(tree, openSet) {
  const items = [];
  const byKey = new Map();
  let cursor = 0;
  const build = (e) => {
    const isOpen = e.kids.length > 0 && openSet.has(e.key);
    const label = e.node.label || (e.depth === 0 ? "الخريطة الذهنية" : "(بدون عنوان)");
    const lines = mgWrap(label, e.depth === 0 ? 20 : 18, 2);
    const longest = Math.max(4, ...lines.map((l) => l.length));
    const w = Math.max(e.depth === 0 ? 136 : 112, Math.min(236, longest * 9.6 + (e.kids.length ? 66 : 44)));
    const h = lines.length > 1 ? 62 : 50;
    const item = {
      key: e.key, node: e.node, depth: e.depth, branch: e.branch, parentKey: e.parentKey, idx: e.idx,
      ghost: e.depth > 0 && !e.node.label, kidsCount: e.kids.length, isOpen, lines, w, h, x: 0, y: 0, left: 0, top: 0,
    };
    items.push(item);
    byKey.set(e.key, item);
    if (isOpen) {
      const ys = e.kids.map((c) => build(c).y);
      item.y = (ys[0] + ys[ys.length - 1]) / 2;
    } else {
      item.y = cursor + MG_ROW / 2;
      cursor += MG_ROW;
    }
    return item;
  };
  build(tree);
  const maxDepth = Math.max(...items.map((it) => it.depth));
  const colW = Array(maxDepth + 1).fill(0);
  items.forEach((it) => { colW[it.depth] = Math.max(colW[it.depth], it.w); });
  const colX = [];
  let acc = 0;
  for (let d = 0; d <= maxDepth; d++) { colX[d] = acc; acc += colW[d] + MG_GAP; }
  items.forEach((it) => {
    it.x = colX[it.depth];
    it.left = -(it.x + it.w); // حافة العقدة اليسرى (كل عمود محاذي لليمين)
    it.top = it.y - it.h / 2;
  });
  return { items, byKey };
}

function mgBox(list) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of list) {
    x0 = Math.min(x0, it.left - 34); // مساحة دائرة الفتح/الطي
    x1 = Math.max(x1, it.left + it.w);
    y0 = Math.min(y0, it.top);
    y1 = Math.max(y1, it.top + it.h + MG_DEPTH);
  }
  return { x0, y0, x1, y1 };
}

const MG_SOFT_L = ["#E3F3EE", "#F8EDD6", "#E4EFF6", "#F7E6EE", "#EAE6F6", "#E3F2E5"];
const MG_SOFT_D = ["#1A3A34", "#3A2F17", "#1B3040", "#3B2230", "#2A2547", "#1B3322"];
const mgSoftVars = (arr) => arr.map((c, i) => `--mg-soft${i}:${c};`).join("");

// ألوان الوضع الفاتح (بتاخد من متغيرات المنصة --jr-* لو موجودة)
const MG_LIGHT = `--mg-dark:0;--mg-bg:#FBF8F0;--mg-page:#FBF8F0;--mg-dot:rgba(20,122,106,.16);--mg-glow-a:rgba(20,122,106,.12);--mg-glow-b:rgba(184,131,42,.10);--mg-line:var(--jr-line,#DED4BD);--mg-surface:var(--jr-surface,#FFFFFF);--mg-btn-text:var(--jr-teal-deep,#0E5348);--mg-btn-hover:var(--jr-teal-soft,#E0F1EC);--mg-text:var(--jr-text,#263B35);--mg-soft-text:var(--jr-text-soft,#697A73);--mg-lt:#FFFFFF;--mg-sedge:rgba(0,0,0,.2);--mg-ring:#FFFFFF;--mg-inset:rgba(14,83,72,.07);${mgSoftVars(MG_SOFT_L)}`;
// ألوان الوضع الداكن
const MG_DARK = `--mg-dark:1;--mg-bg:#0E1916;--mg-page:#0B1412;--mg-dot:rgba(120,220,195,.14);--mg-glow-a:rgba(30,160,135,.20);--mg-glow-b:rgba(212,160,60,.10);--mg-line:rgba(255,255,255,.13);--mg-surface:#16231F;--mg-btn-text:#BFE8DD;--mg-btn-hover:#1F352F;--mg-text:#E9F2EF;--mg-soft-text:#8FA69F;--mg-lt:#22332F;--mg-sedge:rgba(255,255,255,.28);--mg-ring:#0E1916;--mg-inset:rgba(0,0,0,.4);${mgSoftVars(MG_SOFT_D)}`;
// أي من دول على عنصر أب = المنصة في الدارك مود (ضيف/شيل اللي بتستخدمه منصتك)
const MG_DARK_SEL = `:is(.dark,.dark-mode,.theme-dark,[data-theme="dark"],[data-mode="dark"],[data-color-mode="dark"],[data-color-scheme="dark"],[data-bs-theme="dark"]) .md-mg,.md-mg.md-mg-dark`;

const MG_CSS = `
.md-mg { ${MG_LIGHT} }
${MG_DARK_SEL} { ${MG_DARK} }
.md-mg.md-mg-light { ${MG_LIGHT} }
.md-mg { width: 100%; direction: rtl; }
.md-mg.is-full { position: fixed; inset: 0; z-index: 99999; display: flex; flex-direction: column; box-sizing: border-box; background: var(--mg-page); padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left)); }
.md-mg.is-full .md-mg-view { flex: 1 1 auto; height: auto; min-height: 0; border-radius: 16px; }
.md-mg-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 10px; margin-bottom: 8px; }
.md-mg-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.md-mg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 40px; height: 38px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--mg-line); background: var(--mg-surface); color: var(--mg-btn-text); font-size: 13px; font-weight: 800; cursor: pointer; font-family: inherit; box-shadow: 0 2px 0 var(--mg-line); transition: transform .12s ease, box-shadow .12s ease, background .15s ease; -webkit-tap-highlight-color: transparent; }
.md-mg-btn:hover { background: var(--mg-btn-hover); }
.md-mg-btn:active { transform: translateY(2px); box-shadow: 0 0 0 var(--mg-line); }
.md-mg-btn:focus-visible { outline: 2px solid #B8832A; outline-offset: 2px; }
.md-mg-btn svg { width: 16px; height: 16px; flex: none; }

.md-mg-view { position: relative; height: var(--mg-h, clamp(340px, 64vh, 580px)); overflow: hidden; border-radius: 20px; border: 1px solid var(--mg-line); cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; overscroll-behavior: contain;
  background: radial-gradient(ellipse at 88% 12%, var(--mg-glow-a), transparent 55%), radial-gradient(ellipse at 10% 95%, var(--mg-glow-b), transparent 50%), radial-gradient(circle, var(--mg-dot) 1px, transparent 1.2px) 0 0 / 22px 22px, var(--mg-bg);
  box-shadow: inset 0 2px 14px var(--mg-inset); }
.md-mg-view.is-drag { cursor: grabbing; }
.md-mg-view svg { display: block; width: 100%; height: 100%; }
.md-mg-cam { transform-origin: 0 0; will-change: transform; }

.md-mg-n { transform-origin: 0 0; transition: transform .55s ${MG_EASE}, opacity .4s ease; animation: md-in .6s cubic-bezier(.2,.9,.3,1.18) backwards; animation-delay: var(--d, 0ms); }
.md-mg-lk { transform-origin: 0 0; fill: none; stroke-linecap: round; vector-effect: non-scaling-stroke; transition: transform .55s ${MG_EASE}, opacity .4s ease, stroke-width .3s ease; animation: md-fade .5s ease backwards; animation-delay: var(--d, 0ms); }
@keyframes md-in { from { transform: translate(var(--ex), var(--ey)) scale(.35); opacity: 0; } }
@keyframes md-fade { from { opacity: 0; } }

.md-mg-node { cursor: pointer; outline: none; }
.md-mg-face { transition: transform .18s ease; }
@media (hover: hover) { .md-mg-node:hover .md-mg-face { transform: translateY(-2px); } }
.md-mg-node:active .md-mg-face { transform: translateY(${MG_DEPTH - 2}px); }
.md-mg-f.is-strong { stroke: var(--mg-sedge); }
.md-mg-n.is-ghost .md-mg-f { stroke-dasharray: 5 4; }
.md-mg-n.is-ghost .md-mg-txt { opacity: .55; }
.md-mg-node:focus-visible .md-mg-f { stroke: #B8832A; stroke-width: 3.6; }
.md-mg-bd { stroke: var(--mg-ring); }
.md-mg-txt { pointer-events: none; font-family: inherit; }
.md-mg-tog { cursor: pointer; }
.md-mg-pulse { fill: none; pointer-events: none; transform-box: fill-box; transform-origin: center; animation: md-pulse 1.1s ease-out 2; }
@keyframes md-pulse { 0% { opacity: .9; transform: scale(1); } 100% { opacity: 0; transform: scale(1.16); } }
.md-mg-hint { margin: 8px 0 0; text-align: center; font-size: 11px; font-weight: 700; color: var(--mg-soft-text); }
@media (prefers-reduced-motion: reduce) {
  .md-mg-n, .md-mg-lk { animation: none; transition: none; }
  .md-mg-pulse { animation: none; }
  .md-mg-face { transition: none; }
}
`;

/**
 * dark      : true/false لفرض الوضع، وسيبه undefined عشان يتبع المنصة تلقائيًا
 * editing   : وضع المعلم — العقد من غير عنوان بتظهر كـ"شبح" بدل ما تختفي
 * resetKey  : لو اتحدد، الخريطة ما بتعملش reset للعرض إلا لما القيمة دي تتغير (مهم أثناء التحرير)
 * reveal    : { id, n } — يفتح الأجداد ويعمل فوكس على العقدة دي (بعد إضافة فرع مثلًا)
 * height    : ارتفاع الإطار (مثال "clamp(320px,52vh,520px)")
 */
export function MindMapGraph({ node, onSelectNode, selectedNodeId, dark, editing = false, resetKey, reveal, height }) {
  const uidRef = useRef(null);
  if (!uidRef.current) uidRef.current = `mg${++MG_UID}`;
  const uid = uidRef.current;

  const viewRef = useRef(null);
  const camElRef = useRef(null);
  const cam = useRef({ x: 0, y: 0, k: 1 });
  const pending = useRef({ type: "fit", animate: false });
  const userMoved = useRef(false);
  const ptrs = useRef(new Map());
  const drag = useRef({ moved: false, c: null, sx: 0, sy: 0 });
  const pinch = useRef(null);
  const layRef = useRef(null);
  const firstRun = useRef(true);
  const firstFull = useRef(true);
  const rootRef = useRef(null);
  const treeRef = useRef(null);

  const [open, setOpen] = useState(() => (node ? mgDefaultOpen(mgBuildTree(node, editing)) : new Set(["0"])));
  const [focusKey, setFocusKey] = useState("0"); // للكيبورد
  const [spot, setSpot] = useState(null); // العنصر اللي عليه الفوكس (الباقي يخفت)
  const [full, setFull] = useState(false); // وضع ملء الشاشة
  const [forceDark, setForceDark] = useState(false); // بيتحدد وقت التكبير (لأن الـPortal بيطلع برّه الأب)

  const tree = useMemo(() => (node ? mgBuildTree(node, editing) : null), [node, editing]);
  const lay = useMemo(() => (tree ? mgLayout(tree, open) : null), [tree, open]);
  layRef.current = lay;
  treeRef.current = tree;
  const resetToken = resetKey != null ? String(resetKey) : node ? String(node.id ?? node.label ?? "") : "";

  // ----------------------------- الكاميرا -----------------------------
  function applyCam(c, animate) {
    cam.current = c;
    const g = camElRef.current;
    if (!g) return;
    g.style.transition = animate && !mgReduced() ? `transform .75s ${MG_EASE}` : "none";
    g.style.transform = `translate(${c.x}px, ${c.y}px) scale(${c.k})`;
  }
  // لو الكاميرا في نص حركة والمستخدم مسك الشاشة، نقرأ مكانها الفعلي عشان مفيش قفزة
  function syncCam() {
    const g = camElRef.current;
    if (!g) return;
    try {
      const m = new DOMMatrix(getComputedStyle(g).transform);
      if (m.a > 0) cam.current = { x: m.e, y: m.f, k: m.a };
    } catch (_) { /* ignore */ }
  }
  function fitBox(box, { pad = 30, minK = 0.5, maxK = 1.2, animate = true } = {}) {
    const el = viewRef.current;
    if (!el || !el.clientWidth) return;
    const W = el.clientWidth, H = el.clientHeight;
    const bw = box.x1 - box.x0 + pad * 2, bh = box.y1 - box.y0 + pad * 2;
    const k = clamp(Math.min(W / bw, H / bh), minK, maxK);
    const cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
    applyCam({ x: W / 2 - cx * k, y: H / 2 - cy * k, k }, animate);
  }
  function fitAll(layout, animate = true) {
    if (!layout) return;
    fitBox(mgBox(layout.items), { pad: 26, minK: 0.5, maxK: 1, animate });
  }
  /** فوكس على عنصر + الفروع اللي ظاهرة تحته */
  function focusGroup(key, layout, leaf = false, animate = true) {
    if (!layout) return;
    const list = layout.items.filter((i) => i.key === key || i.parentKey === key);
    if (!list.length) return;
    const k0 = clamp(cam.current.k, 0.8, 1.1);
    fitBox(mgBox(list), leaf ? { pad: 40, minK: k0, maxK: k0, animate } : { pad: 38, minK: 0.6, maxK: 1.25, animate });
  }
  function panTo(it) {
    const el = viewRef.current;
    if (!el) return;
    const c = cam.current, W = el.clientWidth, H = el.clientHeight, m = 24;
    const sx = c.x + it.left * c.k, sy = c.y + it.top * c.k;
    if (sx < m || sy < m || sx + it.w * c.k > W - m || sy + it.h * c.k > H - m) {
      applyCam({ x: W / 2 - (it.left + it.w / 2) * c.k, y: H / 2 - it.y * c.k, k: c.k }, true);
    }
  }
  function zoomAt(f, mx, my, animate = true) {
    const c = cam.current;
    const k = clamp(c.k * f, 0.35, 2);
    applyCam({ x: mx - ((mx - c.x) * k) / c.k, y: my - ((my - c.y) * k) / c.k, k }, animate);
  }
  function zoomBtn(f) {
    const el = viewRef.current;
    if (el) zoomAt(f, el.clientWidth / 2, el.clientHeight / 2);
  }

  // بعد ما التخطيط يتغير (فتح/طي) نحرّك الكاميرا للمكان الجديد
  useLayoutEffect(() => {
    const p = pending.current;
    if (!p || !lay) return;
    pending.current = null;
    if (p.type === "fit") fitAll(lay, p.animate);
    else focusGroup(p.key, lay);
  }, [lay]);

  // خريطة جديدة
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setOpen(treeRef.current ? mgDefaultOpen(treeRef.current) : new Set(["0"]));
    setFocusKey("0");
    setSpot(null);
    userMoved.current = false;
    pending.current = { type: "fit", animate: false };
  }, [resetToken]);

  // طلب من برّه (المحرر): افتح الأجداد وركّز على العقدة (وإخوتها)
  useEffect(() => {
    if (!reveal || reveal.id == null) return;
    const t = treeRef.current;
    if (!t) return;
    const map = new Map();
    let target = null;
    const index = (e) => { map.set(e.key, e); if (e.node.id === reveal.id) target = e; e.kids.forEach(index); };
    index(t);
    if (!target) return;
    const anc = [];
    for (let k = target.parentKey; k != null; k = map.get(k)?.parentKey) anc.push(k);
    setOpen((prev) => new Set([...prev, ...anc])); // Set جديد دايمًا => التخطيط يتحسب ويتنفّذ الفوكس
    setSpot(target.key);
    setFocusKey(target.key);
    userMoved.current = true;
    pending.current = { type: "focus", key: target.parentKey != null ? target.parentKey : target.key };
  }, [reveal]);

  // تغيير حجم الشاشة (دوران التليفون مثلًا)
  useEffect(() => {
    const el = viewRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    let w = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (Math.abs(el.clientWidth - w) > 1) {
        w = el.clientWidth;
        if (!userMoved.current && layRef.current) fitAll(layRef.current, false);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [!!node, full]);

  // Ctrl/⌘ + عجلة الماوس (وقرص التراك-باد) للتكبير — العجلة العادية تفضل للصفحة
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      userMoved.current = true;
      const r = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.004), e.clientX - r.left, e.clientY - r.top, false);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [!!node, full]);

  // تكبير/تصغير: الـDOM بيتبني من جديد (Portal) فنرجّع الكاميرا بدون حركة
  useLayoutEffect(() => {
    if (firstFull.current) { firstFull.current = false; return; }
    ptrs.current.clear();
    pinch.current = null;
    drag.current = { moved: false, c: null, sx: 0, sy: 0 };
    const l = layRef.current;
    if (!l) return;
    applyCam({ x: 0, y: 0, k: 1 }, false);
    if (spot && l.byKey.get(spot)) focusGroup(spot, l, false, false);
    else fitAll(l, false);
  }, [full]);

  // في ملء الشاشة: نقفل سكرول الصفحة، وEscape يرجّع للحجم العادي
  useEffect(() => {
    if (!full) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setFull(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [full]);

  // ----------------------------- اللمس والماوس -----------------------------
  const rel = (e) => { const r = viewRef.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const twoPts = () => { const [a, b] = [...ptrs.current.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }; };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    syncCam();
    const p = rel(e);
    ptrs.current.set(e.pointerId, p);
    if (ptrs.current.size === 1) {
      drag.current = { moved: false, c: { ...cam.current }, sx: p.x, sy: p.y };
    } else if (ptrs.current.size === 2) {
      const t = twoPts();
      pinch.current = { d: t.d, m: t.m, c: { ...cam.current } };
      drag.current.moved = true;
      userMoved.current = true;
      viewRef.current.classList.add("is-drag");
    }
  };
  const onPointerMove = (e) => {
    if (!ptrs.current.has(e.pointerId)) return;
    const np = rel(e);
    ptrs.current.set(e.pointerId, np);
    if (ptrs.current.size >= 2 && pinch.current) {
      const t = twoPts(), p0 = pinch.current;
      const k = clamp((p0.c.k * t.d) / p0.d, 0.35, 2);
      const cx = (p0.m.x - p0.c.x) / p0.c.k, cy = (p0.m.y - p0.c.y) / p0.c.k;
      applyCam({ x: t.m.x - cx * k, y: t.m.y - cy * k, k }, false);
      return;
    }
    const dr = drag.current;
    if (!dr.c) return;
    const dx = np.x - dr.sx, dy = np.y - dr.sy;
    if (!dr.moved && Math.abs(dx) + Math.abs(dy) > 6) {
      dr.moved = true;
      userMoved.current = true;
      try { viewRef.current.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      viewRef.current.classList.add("is-drag");
    }
    if (dr.moved) applyCam({ x: dr.c.x + dx, y: dr.c.y + dy, k: dr.c.k }, false);
  };
  const onPointerUp = (e) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size === 0) {
      viewRef.current && viewRef.current.classList.remove("is-drag");
      pinch.current = null;
      const d = drag.current;
      d.c = null;
      setTimeout(() => { d.moved = false; }, 0);
    } else if (ptrs.current.size === 1) {
      pinch.current = null;
      const [r] = [...ptrs.current.values()];
      drag.current = { moved: true, c: { ...cam.current }, sx: r.x, sy: r.y };
    }
  };

  if (!node || !lay) return null;

  const { items, byKey } = lay;
  const spotKey = spot && byKey.has(spot) ? spot : null; // لو العقدة اتحذفت نتجاهل الفوكس
  const anc = new Set();
  for (let k = spotKey ? byKey.get(spotKey).parentKey : null; k != null; k = byKey.get(k)?.parentKey) anc.add(k);
  const tabKey = byKey.has(focusKey) ? focusKey : "0";
  const hasAnyKids = items.some((it) => it.kidsCount > 0);
  const parents = items.filter((it) => it.isOpen);
  const heavy = items.length > 60; // خريطة كبيرة => نلغي التتابع في الظهور

  const toggle = (key) => setOpen((prev) => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  const toggleFocus = (it) => {
    if (drag.current.moved) return;
    setFocusKey(it.key);
    setSpot(it.key);
    pending.current = { type: "focus", key: it.key };
    toggle(it.key);
  };
  const activate = (it) => {
    if (drag.current.moved) return;
    userMoved.current = true;
    setFocusKey(it.key);
    if (onSelectNode) onSelectNode(it.node);
    const wasSpot = spot === it.key;
    setSpot(it.key);
    if (!it.kidsCount) { focusGroup(it.key, lay, true); return; }
    if (it.isOpen && !wasSpot) { focusGroup(it.key, lay); return; } // أول ضغطة على فرع مفتوح = فوكس، التانية = طي
    pending.current = { type: "focus", key: it.key };
    toggle(it.key);
  };
  const focusNode = (key) => {
    setFocusKey(key);
    const it = byKey.get(key);
    if (it) panTo(it);
    requestAnimationFrame(() => {
      const el = viewRef.current && viewRef.current.querySelector(`[data-key="${key}"]`);
      if (el) el.focus({ preventScroll: true });
    });
  };
  const onKeyDown = (e, it) => {
    const idx = items.findIndex((x) => x.key === it.key);
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(it); }
    else if (e.key === "Escape") { if (!full) { e.preventDefault(); setSpot(null); fitAll(lay); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (items[idx + 1]) focusNode(items[idx + 1].key); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (items[idx - 1]) focusNode(items[idx - 1].key); }
    else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (it.kidsCount && !it.isOpen) toggleFocus(it);
      else if (it.isOpen) { const first = items.find((x) => x.parentKey === it.key); if (first) focusNode(first.key); }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (it.isOpen) toggleFocus(it);
      else if (it.parentKey) focusNode(it.parentKey);
    }
  };
  const toggleFull = () => {
    if (!full) {
      const el = rootRef.current;
      setForceDark(!!el && getComputedStyle(el).getPropertyValue("--mg-dark").trim() === "1");
    }
    setFull((v) => !v);
  };
  const resetView = () => { setSpot(null); userMoved.current = false; fitAll(lay); };
  const openAll = () => { setSpot(null); pending.current = { type: "fit", animate: true }; setOpen(new Set(tree ? mgAllKeys(tree) : ["0"])); };
  const closeAll = () => { setSpot(null); pending.current = { type: "fit", animate: true }; setOpen(new Set(["0"])); };

  // مستوى الإضاءة: عنصر الفوكس + فروعه ساطعين، والأجداد باهتين شوية، والباقي خافت
  const opacityOf = (it) => {
    if (!spotKey) return 1;
    if (it.key === spotKey || it.parentKey === spotKey) return 1;
    if (anc.has(it.key)) return 0.6;
    return 0.2;
  };

  const themeCls = dark === true || (full && forceDark && dark !== false) ? " md-mg-dark" : dark === false ? " md-mg-light" : "";
  const ui = (
    <div
      ref={rootRef}
      className={`md-mg${full ? " is-full" : ""}${themeCls}`}
      role={full ? "dialog" : undefined}
      aria-modal={full ? "true" : undefined}
      aria-label={full ? "الخريطة الذهنية بملء الشاشة" : undefined}
      style={height ? { "--mg-h": height } : undefined}
    >
      <style>{MG_CSS}</style>
      <div className="md-mg-bar">
        <div className="md-mg-btns" role="group" aria-label="التحكم في الخريطة">
          <button type="button" className="md-mg-btn" aria-label="إبعاد الخريطة" onClick={() => zoomBtn(1 / 1.25)}>−</button>
          <button type="button" className="md-mg-btn" aria-label="تقريب الخريطة" onClick={() => zoomBtn(1.25)}>+</button>
          <button type="button" className="md-mg-btn" onClick={resetView}>ملاءمة</button>
          <button
            type="button"
            className="md-mg-btn"
            aria-pressed={full}
            aria-label={full ? "تصغير الخريطة والرجوع للحجم العادي" : "تكبير الخريطة لملء الشاشة"}
            onClick={toggleFull}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={full ? "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"} />
            </svg>
            {full ? "تصغير" : "تكبير"}
          </button>
        </div>
        {hasAnyKids && (
          <div className="md-mg-btns" role="group" aria-label="فتح وطي الأفرع">
            <button type="button" className="md-mg-btn" onClick={openAll}>فتح الكل</button>
            <button type="button" className="md-mg-btn" onClick={closeAll}>طي الكل</button>
          </div>
        )}
      </div>

      <div
        ref={viewRef}
        className="md-mg-view"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg role="tree" aria-label="خريطة ذهنية تفاعلية. استخدم الأسهم للتنقل وEnter للفتح والتركيز، وEscape للعودة للعرض الكامل.">
          <defs>
            {MG_PALETTE.map((c, i) => (
              <g key={i}>
                <linearGradient id={`${uid}-s${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={c.base} />
                  <stop offset="1" stopColor={c.dark} />
                </linearGradient>
                <linearGradient id={`${uid}-l${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" style={{ stopColor: "var(--mg-lt)" }} />
                  <stop offset="1" style={{ stopColor: `var(--mg-soft${i})` }} />
                </linearGradient>
              </g>
            ))}
            <linearGradient id={`${uid}-root`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1A8F7C" />
              <stop offset="1" stopColor="#0A4339" />
            </linearGradient>
            <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.38" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g ref={camElRef} className="md-mg-cam">
            {/* الخطوط: منحنى واحد مُطبَّع (0,0)→(1,1) ويتحرك/يتمدد بـ transform فقط */}
            {parents.flatMap((p) =>
              items.filter((c) => c.parentKey === p.key).map((c) => {
                const x0 = p.left - 30, x1 = c.left + c.w;
                const dx = x1 - x0 || -1, dy = c.y - p.y || 0.001;
                const hot = !!spotKey && (c.key === spotKey || c.parentKey === spotKey);
                const onPath = !!spotKey && anc.has(c.key);
                const op = !spotKey ? 0.85 : hot ? 1 : onPath ? 0.7 : 0.14;
                const sib = c.idx;
                return (
                  <path
                    key={`lk-${c.key}`}
                    className="md-mg-lk"
                    d="M0 0C0.5 0 0.5 1 1 1"
                    stroke={MG_PALETTE[Math.max(0, c.branch) % MG_PALETTE.length].base}
                    style={{
                      transform: `translate(${x0}px, ${p.y}px) scale(${dx}, ${dy})`,
                      strokeWidth: (p.depth === 0 ? 3 : 2.2) + (hot ? 0.9 : 0),
                      opacity: op,
                      "--d": heavy ? "0ms" : `${Math.min(c.depth * 70 + sib * 28, 520)}ms`,
                    }}
                  />
                );
              })
            )}

            {items.map((it) => {
              const isRoot = it.depth === 0;
              const pal = MG_PALETTE[Math.max(0, it.branch) % MG_PALETTE.length];
              const strong = !isRoot && it.depth === 1;
              const sel = selectedNodeId != null && it.node.id === selectedNodeId;
              const isSpot = spotKey === it.key;
              const par = it.parentKey ? byKey.get(it.parentKey) : null;
              const sib = it.idx;

              const face = isRoot ? `url(#${uid}-root)` : strong ? `url(#${uid}-s${Math.max(0, it.branch) % MG_PALETTE.length})` : `url(#${uid}-l${Math.max(0, it.branch) % MG_PALETTE.length})`;
              const edge = isRoot ? "#E3C08B" : strong ? pal.dark : pal.base;
              const thick = isRoot ? "#06302A" : pal.dark;
              const thickOp = isRoot || strong ? 1 : 0.5;
              const textFill = isRoot || strong ? "#FFFFFF" : "var(--mg-text)";
              const badgeFill = isRoot ? "#B8832A" : pal.base;
              const lh = 17;

              return (
                <g
                  key={it.key}
                  className={`md-mg-n${it.ghost ? " is-ghost" : ""}`}
                  style={{
                    transform: `translate(${it.left}px, ${it.top}px)`,
                    opacity: opacityOf(it),
                    "--ex": `${par ? par.left : it.left}px`,
                    "--ey": `${par ? par.top + (par.h - it.h) / 2 : it.top}px`,
                    "--d": heavy ? "0ms" : `${Math.min(it.depth * 70 + sib * 28, 520)}ms`,
                  }}
                >
                  <g
                    className="md-mg-node"
                    data-key={it.key}
                    role="treeitem"
                    aria-level={it.depth + 1}
                    aria-expanded={it.kidsCount ? it.isOpen : undefined}
                    aria-label={`${it.node.label}${it.kidsCount ? `، ${it.kidsCount} عناصر` : ""}`}
                    tabIndex={it.key === tabKey ? 0 : -1}
                    onClick={() => activate(it)}
                    onKeyDown={(e) => onKeyDown(e, it)}
                    onFocus={() => setFocusKey(it.key)}
                  >
                    <title>{it.node.description || it.node.label}</title>
                    {/* السمك (الجزء السفلي الغامق) */}
                    <rect x={0} y={MG_DEPTH} width={it.w} height={it.h} rx={15} fill={thick} fillOpacity={thickOp} />
                    <g className="md-mg-face">
                      <rect className={strong ? "md-mg-f is-strong" : "md-mg-f"} x={0} y={0} width={it.w} height={it.h} rx={15} fill={face} stroke={edge} strokeWidth={isRoot ? 2.5 : 1.8} />
                      {(isRoot || strong) && (
                        <rect x={4} y={3} width={it.w - 8} height={it.h * 0.46} rx={11} fill={`url(#${uid}-gloss)`} style={{ pointerEvents: "none" }} />
                      )}
                      {sel && <rect x={-4} y={-4} width={it.w + 8} height={it.h + 8} rx={19} fill="none" stroke="#B8832A" strokeWidth={3.2} style={{ pointerEvents: "none" }} />}
                      {it.lines.map((ln, li) => (
                        <text
                          key={li}
                          className="md-mg-txt"
                          x={it.w / 2}
                          y={it.h / 2 - ((it.lines.length - 1) * lh) / 2 + li * lh}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={isRoot ? 15 : 14}
                          fontWeight={isRoot || strong ? 800 : 700}
                          fill={textFill}
                        >
                          {ln}
                        </text>
                      ))}
                    </g>
                    {isSpot && <rect className="md-mg-pulse" x={-5} y={-5} width={it.w + 10} height={it.h + 10 + MG_DEPTH} rx={19} stroke={isRoot ? "#E3C08B" : pal.base} strokeWidth={3} />}
                  </g>

                  {it.kidsCount > 0 && (
                    <g className="md-mg-tog" aria-hidden="true" onClick={(e) => { e.stopPropagation(); toggleFocus(it); }}>
                      <circle cx={-18} cy={it.h / 2 + 2.5} r={12} fill={isRoot ? "#7A5410" : pal.dark} />
                      <circle className="md-mg-bd" cx={-18} cy={it.h / 2} r={12} fill={badgeFill} stroke="#FFFFFF" strokeWidth={2} />
                      <text x={-18} y={it.h / 2} textAnchor="middle" dominantBaseline="central" fontSize={it.isOpen ? 17 : 12} fontWeight={800} fill="#FFFFFF" style={{ pointerEvents: "none" }}>
                        {it.isOpen ? "−" : it.kidsCount}
                      </text>
                      <circle cx={-18} cy={it.h / 2} r={21} fill="transparent" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <p className="md-mg-hint">{editing ? "اضغط على أي عقدة لتحديدها وتعديلها · نفس شكل الخريطة عند الطالب · اسحب للتحريك" : "اضغط على أي عنصر لفتحه والتركيز عليه · اضغط عليه تاني لطيّه · اسحب للتحريك · بإصبعين للتكبير"}</p>
    </div>
  );
  return full && typeof document !== "undefined" ? createPortal(ui, document.body) : ui;
}

export function MindMapViewerNode({ node, depth = 0, ...rest }) {
  if (!node || depth > 0) return null;
  return <MindMapGraph node={node} {...rest} />;
}

export default MindMapViewerNode;
