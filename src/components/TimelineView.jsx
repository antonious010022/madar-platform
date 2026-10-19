import { useEffect, useRef, useState } from "react";

/**
 * الخط الزمني الأفقي ثلاثي الأبعاد — بوكسات ملوّنة تتبادل فوق/تحت الخط، وكورة بتتحرك على الخط لحد الحدث اللي تدوس عليه.
 * - أي بوكس بيتدحرج له الكورة؛ والبوكس اللي فيه تفاصيل (وصف / موقع / صورة) بتفتح له لوحة تفاصيل.
 * - الاستخدام: <TimelineView items={scene.timeline} />
 *   items: [{ id, date, title, description?, location?, image?, _sceneTitle? }]
 */

const STYLE_ID = "md-timeline-view-css-v2";
const PALETTE = ["#C2562F", "#D4802B", "#C2455F", "#9B4F8E", "#4F7FB0", "#2E8B7A"];

const TL_CSS = `
.md-tl { --tl-surface: #FFFFFF; --tl-text: #263B35; --tl-muted: #5E6F69; --tl-line: #DED4BD; --tl-col: 9.75rem; --tl-pad: 1.9rem; --ball: 2.1rem;
  direction: rtl; position: relative; border-radius: 1.25rem; border: 1px solid var(--tl-line); color: var(--tl-text);
  background-color: color-mix(in srgb, var(--tl-surface) 94%, #FAF6ED);
  background-image: radial-gradient(circle at 1px 1px, rgba(194, 86, 47, 0.2) 1px, transparent 1.4px); background-size: 18px 18px; }
html[data-theme="dark"] .md-tl { --tl-surface: #1B2D27; --tl-text: #EAF3F0; --tl-muted: #9DB3AB; --tl-line: #2F4A41; }
.md-tl-scroll { overflow-x: auto; overflow-y: hidden; padding: 1.4rem 1rem 1.5rem; -webkit-overflow-scrolling: touch; scroll-snap-type: x proximity; }
.md-tl-track { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: var(--tl-col); grid-template-rows: 1fr 3.6rem 1fr; width: max-content; min-width: 100%; padding-inline: var(--tl-pad) 3.2rem; }
.md-tl-band { position: absolute; inset-inline: 0; top: calc(50% - 0.5rem); height: 1rem; border-radius: 999px; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0) 55%), rgba(120, 90, 70, 0.16); box-shadow: inset 0 2px 3px rgba(60, 40, 30, .18); }
.md-tl-fill { position: absolute; inset-inline-start: 0; top: calc(50% - 0.5rem); height: 1rem; border-radius: 999px; pointer-events: none;
  width: calc(var(--tl-pad) + (var(--i) + 0.5) * var(--tl-col)); transition: width .65s cubic-bezier(.5, 1.25, .4, 1);
  box-shadow: inset 0 2px 3px rgba(255,255,255,.35), inset 0 -2px 3px rgba(0,0,0,.18); }
.md-tl-dots { position: absolute; inset-inline: 0.2rem 1.4rem; top: calc(50% - 1.5px); border-top: 3px dotted rgba(255,255,255,.85); mix-blend-mode: normal; pointer-events: none; opacity: .75; }
.md-tl-arrow { position: absolute; inset-inline-end: 0.15rem; top: calc(50% - 0.95rem); width: 1.9rem; height: 1.9rem; color: var(--arrow, #C2562F); pointer-events: none; filter: drop-shadow(0 2px 0 rgba(0,0,0,.12)); }
.md-tl-ball { position: absolute; z-index: 3; top: calc(50% - var(--ball) / 2); width: var(--ball); height: var(--ball); margin-inline-start: calc(var(--ball) / -2);
  inset-inline-start: calc(var(--tl-pad) + (var(--i) + 0.5) * var(--tl-col)); transition: inset-inline-start .65s cubic-bezier(.5, 1.25, .4, 1); pointer-events: none; will-change: inset-inline-start; }
.md-tl-ball::before { content: ""; position: absolute; inset-inline: 12%; bottom: -0.55rem; height: .45rem; border-radius: 50%; background: rgba(0,0,0,.22); animation: md-tl-shadow 2.4s ease-in-out infinite; }
.md-tl-ball-body { position: absolute; inset: 0; border-radius: 50%; background-color: var(--bc); transition: background-color .5s ease; animation: md-tl-bob 2.4s ease-in-out infinite;
  box-shadow: 0 5px 10px -3px rgba(0,0,0,.4), inset -3px -4px 6px rgba(0,0,0,.28), inset 2px 2px 4px rgba(255,255,255,.35); }
.md-tl-ball-body::after { content: ""; position: absolute; top: 14%; inset-inline-start: 20%; width: 32%; height: 26%; border-radius: 50%; background: radial-gradient(circle at 40% 40%, #fff, rgba(255,255,255,0) 72%); }
.md-tl-ball-hop { position: absolute; inset: 0; animation: md-tl-hop .65s cubic-bezier(.3, 0, .4, 1); }
.md-tl-cell { display: flex; flex-direction: column; align-items: center; min-width: 0; scroll-snap-align: center; animation: md-tl-pop .55s cubic-bezier(.3, 1.5, .5, 1) both; animation-delay: calc(min(var(--k), 8) * 70ms); }
.md-tl-cell.is-top { grid-row: 1; justify-content: flex-end; }
.md-tl-cell.is-bottom { grid-row: 3; justify-content: flex-start; }
.md-tl-node-cell { grid-row: 2; display: grid; place-items: center; position: relative; z-index: 1; }
.md-tl-node { width: 1.7rem; height: 1.7rem; border-radius: 50%; display: grid; place-items: center; background: var(--tl-surface); border: 3px solid var(--c); box-shadow: 0 3px 0 var(--c-dark), 0 6px 8px -4px rgba(0,0,0,.35); transition: transform .3s ease; }
.md-tl-node::after { content: ""; width: .62rem; height: .62rem; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff 0 12%, var(--c) 45%, var(--c-dark) 100%); }
.md-tl-node-cell.is-on .md-tl-node { transform: scale(1.18); }
.md-tl-stem { flex: none; width: 0; height: 1.15rem; border-inline-start: 3px dotted var(--c); opacity: .75; }
.md-tl-box { --c-dark: color-mix(in srgb, var(--c) 68%, #000); width: calc(var(--tl-col) - 0.8rem); min-height: 3.7rem; padding: 0.55rem 0.6rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.12rem; text-align: center; font: inherit; color: inherit; cursor: pointer;
  background: linear-gradient(180deg, var(--tl-surface), color-mix(in srgb, var(--c) 9%, var(--tl-surface))); border: 2px solid var(--c); border-radius: 1rem;
  box-shadow: 0 4px 0 var(--c-dark), 0 14px 18px -12px color-mix(in srgb, var(--c) 70%, transparent);
  transition: transform .18s ease, box-shadow .18s ease, background .25s ease; -webkit-tap-highlight-color: transparent; }
.md-tl-box b { font-size: 1.12rem; font-weight: 900; line-height: 1.2; color: var(--c); transition: color .2s ease; }
.md-tl-box span { font-size: .84rem; font-weight: 800; line-height: 1.45; color: var(--tl-text); overflow-wrap: anywhere; transition: color .2s ease; }
html[data-theme="dark"] .md-tl-box b { color: color-mix(in srgb, var(--c) 62%, #fff); }
.md-tl-box:hover { transform: translateY(-3px); box-shadow: 0 7px 0 var(--c-dark), 0 18px 22px -12px color-mix(in srgb, var(--c) 75%, transparent); }
.md-tl-box:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--c-dark); }
.md-tl-box:focus-visible { outline: 3px solid color-mix(in srgb, var(--c) 40%, transparent); outline-offset: 3px; }
.md-tl-box.has-info::after { content: "اضغط للتفاصيل"; font-size: .64rem; font-weight: 800; color: var(--tl-muted); }
.md-tl-box.is-on { background: linear-gradient(180deg, color-mix(in srgb, var(--c) 82%, #fff), var(--c)); transform: translateY(-3px); box-shadow: 0 7px 0 var(--c-dark), 0 18px 24px -10px color-mix(in srgb, var(--c) 80%, transparent); }
.md-tl-box.is-on b, .md-tl-box.is-on span, .md-tl-box.is-on::after { color: #fff; }
.md-tl-detail { margin: 0 1rem 1.1rem; padding: 0.95rem 1rem; border-radius: 1rem; background: var(--tl-surface); border: 2px solid var(--c); border-inline-start-width: 6px; box-shadow: 0 4px 0 color-mix(in srgb, var(--c) 68%, #000); animation: md-tl-in .3s ease both; }
.md-tl-detail-head { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; margin-bottom: .45rem; }
.md-tl-chip { padding: .2rem .75rem; border-radius: 999px; font-size: .82rem; font-weight: 900; color: #fff; background: var(--c); box-shadow: 0 2px 0 color-mix(in srgb, var(--c) 68%, #000); }
.md-tl-detail h4 { margin: 0; font-size: 1rem; font-weight: 900; flex: 1 1 auto; min-width: 0; }
.md-tl-close { flex: none; width: 1.9rem; height: 1.9rem; border-radius: 50%; border: 1px solid var(--tl-line); background: transparent; color: var(--tl-muted); cursor: pointer; font-size: .9rem; line-height: 1; }
.md-tl-close:hover { color: var(--c); border-color: var(--c); }
.md-tl-detail p { margin: 0; font-size: .92rem; line-height: 1.9; font-weight: 600; color: var(--tl-muted); }
.md-tl-detail .md-tl-loc { margin-top: .35rem; font-weight: 800; color: var(--c); }
.md-tl-detail .md-tl-from { margin-top: .35rem; font-size: .76rem; font-weight: 700; }
.md-tl-detail img { display: block; width: 100%; max-height: 14rem; margin-top: .65rem; object-fit: cover; border-radius: .8rem; }
@keyframes md-tl-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@keyframes md-tl-pop { from { opacity: 0; transform: translateY(14px) scale(.9); } to { opacity: 1; transform: none; } }
@keyframes md-tl-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes md-tl-shadow { 0%, 100% { transform: scale(1); opacity: .9; } 50% { transform: scale(.8); opacity: .6; } }
@keyframes md-tl-hop { 0% { transform: translateY(0) scale(1, 1); } 25% { transform: translateY(0) scale(1.18, .8); } 55% { transform: translateY(-1.1rem) scale(.92, 1.1); } 100% { transform: translateY(0) scale(1, 1); } }
@media (max-width: 520px) { .md-tl { --tl-col: 8.4rem; --tl-pad: 1.6rem; --ball: 1.9rem; } .md-tl-scroll { padding-inline: .6rem; } .md-tl-box b { font-size: 1.02rem; } .md-tl-box span { font-size: .78rem; } }
@media (prefers-reduced-motion: reduce) { .md-tl *, .md-tl *::before, .md-tl *::after { animation: none !important; transition: none !important; } }
`;

function useTimelineStyle() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = TL_CSS;
    document.head.appendChild(el);
  }, []);
}

const hasInfo = (it) => !!(String(it?.description || "").trim() || String(it?.location || "").trim() || it?.image);
const colorAt = (i) => PALETTE[i % PALETTE.length];

export default function TimelineView({
  items,
  showSceneTitle = false,
  initialOpenKey = null,
  className = "",
  // وضع المحرر (اختياري): تحكّم خارجي في البوكس المحدد، وإخفاء لوحة التفاصيل
  selectedKey,
  onSelect,
  interactiveAll = false, // متروك للتوافق — كل البوكسات قابلة للضغط الآن
  hideDetail = false,
}) {
  useTimelineStyle();
  const list = Array.isArray(items) ? items.filter((it) => it && (it.date || it.title)) : [];
  const keyOf = (it, i) => String(it.id ?? `tl-${i}`);
  const [openKey, setOpenKey] = useState(initialOpenKey);
  const trackRef = useRef(null);
  const firstRun = useRef(true);

  const controlled = selectedKey !== undefined;
  const activeKey = controlled ? selectedKey : openKey;
  const activeIdx = Math.max(0, list.findIndex((it, i) => keyOf(it, i) === activeKey));
  const selectedIdx = list.findIndex((it, i) => keyOf(it, i) === activeKey);
  const current = !hideDetail && selectedIdx >= 0 && hasInfo(list[selectedIdx]) ? list[selectedIdx] : null;
  const currentColor = colorAt(activeIdx);

  const toggle = (k, it) => {
    const next = activeKey === k ? null : k;
    if (!controlled) setOpenKey(next);
    if (onSelect) onSelect(next, it);
  };

  // يمرّر البوكس المحدد لنص الشاشة (مهم على الموبايل) بدون ما يحرّك الصفحة رأسيًا
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (selectedIdx < 0 || !trackRef.current) return;
    const el = trackRef.current.querySelector(`[data-k="${selectedIdx}"]`);
    if (el && el.scrollIntoView) {
      const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedIdx]);

  if (list.length === 0) return null;

  const fillColors = list.slice(0, activeIdx + 1).map((_, i) => colorAt(i));
  if (fillColors.length === 1) fillColors.push(fillColors[0]);

  return (
    <div className={`md-tl ${className}`.trim()} data-kind="timeline-view" style={{ "--i": activeIdx, "--bc": currentColor, "--arrow": colorAt(list.length - 1) }}>
      <div className="md-tl-scroll">
        <div className="md-tl-track" role="list" ref={trackRef}>
          <span className="md-tl-band" aria-hidden="true" />
          <span className="md-tl-fill" aria-hidden="true" style={{ background: `linear-gradient(to left, ${fillColors.join(", ")})` }} />
          <span className="md-tl-dots" aria-hidden="true" />
          <svg className="md-tl-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
          <span className="md-tl-ball" aria-hidden="true">
            <span className="md-tl-ball-hop" key={activeIdx}><span className="md-tl-ball-body" /></span>
          </span>
          {list.map((it, i) => {
            const k = keyOf(it, i);
            const top = i % 2 === 0;
            const on = selectedIdx === i;
            const info = hasInfo(it);
            const col = i + 1;
            const sty = { gridColumn: col, "--c": colorAt(i), "--c-dark": `color-mix(in srgb, ${colorAt(i)} 68%, #000)`, "--k": i };
            return (
              <div key={k} style={{ display: "contents" }} role="listitem">
                <div className={`md-tl-cell ${top ? "is-top" : "is-bottom"}`} style={sty} data-k={i}>
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
                <div className={`md-tl-node-cell${on ? " is-on" : ""}`} style={sty} aria-hidden="true">
                  <span className="md-tl-node" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {current && (
        <div className="md-tl-detail" style={{ "--c": currentColor }} role="region" aria-live="polite" aria-label={`تفاصيل: ${current.title || current.date || "الحدث"}`}>
          <div className="md-tl-detail-head">
            {current.date ? <span className="md-tl-chip">{current.date}</span> : null}
            {current.title ? <h4>{current.title}</h4> : <span style={{ flex: 1 }} />}
            <button type="button" className="md-tl-close" aria-label="إغلاق التفاصيل" onClick={() => toggle(keyOf(current, selectedIdx), current)}>✕</button>
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