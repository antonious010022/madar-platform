// ============================================================================
// DUO THEME — playful, colorful, chunky "Duolingo-like" skin for the whole site.
// STYLE ONLY: no logic, no markup contract changes. Every selector here targets
// classes that already exist. It is injected AFTER the old styles (see App.jsx
// and platformStyles.js) so it wins at equal specificity.
//
// Palette: green #58CC02 · blue #1CB0F6 · purple #CE82FF · orange #FF9600
//          yellow #FFC800 · pink #FF86D0 · red #FF4B4B · ink #3C3C3C
// Signature: thick rounded shapes + a hard "3D" bottom edge that squashes on press.
// ============================================================================
export const DUO_CSS = `
/* ---------------------------------------------------------------------------
   1) TOKENS — old --md-* tokens are re-pointed to the new palette, so every
      existing rule (lesson page, platform, footer…) changes color at once.
--------------------------------------------------------------------------- */
:root {
  --duo-green: #58CC02;  --duo-green-d: #58A700;  --duo-green-s: #D7FFB8;  --duo-green-ink: #3F7D00;
  --duo-blue: #1CB0F6;   --duo-blue-d: #1899D6;   --duo-blue-s: #DDF4FF;   --duo-blue-ink: #0B7BB5;
  --duo-purple: #CE82FF; --duo-purple-d: #A568CC; --duo-purple-s: #F3E1FF; --duo-purple-ink: #7B3FA6;
  --duo-orange: #FF9600; --duo-orange-d: #CD7900; --duo-orange-s: #FFE9C7; --duo-orange-ink: #A85F00;
  --duo-yellow: #FFC800; --duo-yellow-d: #D9A600; --duo-yellow-s: #FFF4C2; --duo-yellow-ink: #8A6800;
  --duo-pink: #FF86D0;   --duo-pink-d: #D864AE;   --duo-pink-s: #FFE3F4;   --duo-pink-ink: #A8397F;
  --duo-red: #FF4B4B;    --duo-red-d: #EA2B2B;    --duo-red-s: #FFDFE0;
  --duo-ink: #3C3C3C; --duo-ink-soft: #5E5E5E; --duo-muted: #777777;
  --duo-line: #E5E5E5; --duo-line-d: #CFCFCF; --duo-snow: #F7F7F7;
  --duo-font-display: "Baloo Bhaijaan 2", "Marhey", "Cairo", "Tajawal", system-ui, sans-serif;
  --duo-font-body: "Cairo", "Tajawal", "Noto Sans Arabic", system-ui, sans-serif;
  --duo-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --md-bg: #FFFFFF; --md-surface: #FFFFFF; --md-surface-2: #F7F7F7; --md-surface-3: #F0F0F0;
  --md-teal: #58CC02; --md-teal-deep: #58A700; --md-teal-dark: #3F7D00;
  --md-teal-mid: #89E219; --md-teal-light: #B8F28B; --md-teal-soft: #D7FFB8;
  --md-gold: #FFC800; --md-gold-deep: #8A6800; --md-gold-light: #FFD84D; --md-gold-soft: #FFF4C2;
  --md-text: #3C3C3C; --md-text-soft: #5E5E5E; --md-muted: #777777; --md-muted-light: #AFAFAF;
  --md-border: #E5E5E5; --md-border-strong: #D0D0D0;
  --md-shadow-sm: 0 2px 0 #E5E5E5; --md-shadow-md: 0 4px 0 #E5E5E5; --md-shadow-lg: 0 6px 0 #D0D0D0;
  --md-radius: 16px; --md-radius-lg: 22px;
  --md-font: var(--duo-font-body);
  --md-sienna: #FF9600; --md-blue: #1CB0F6; --md-violet: #A568CC; --md-coral: #FF4B4B; --md-pink: #FF86D0; --md-success: #58CC02;
  --md-rainbow: linear-gradient(90deg, #58CC02 0 20%, #1CB0F6 20% 40%, #CE82FF 40% 60%, #FF9600 60% 80%, #FFC800 80% 100%);
  --acc: #58CC02; --acc-deep: #58A700; --acc-ink: #3F7D00; --acc-soft: #E2FBCB; --acc-light: #B8F28B; --acc-glow: #58CC0255;
}

/* six accent sets (units / pick cards / features / recent chips cycle through them) */
[data-accent="0"], .md-pick-grid > :nth-child(6n+1), .md-features-grid > :nth-child(6n+1), .md-recent-row > :nth-child(6n+1) {
  --acc: #58CC02; --acc-deep: #58A700; --acc-ink: #3F7D00; --acc-soft: #E2FBCB; --acc-light: #B8F28B; --acc-glow: #58CC0255;
}
[data-accent="1"], .md-pick-grid > :nth-child(6n+2), .md-features-grid > :nth-child(6n+2), .md-recent-row > :nth-child(6n+2) {
  --acc: #1CB0F6; --acc-deep: #1899D6; --acc-ink: #0B7BB5; --acc-soft: #DDF4FF; --acc-light: #8FD8FB; --acc-glow: #1CB0F655;
}
[data-accent="2"], .md-pick-grid > :nth-child(6n+3), .md-features-grid > :nth-child(6n+3), .md-recent-row > :nth-child(6n+3) {
  --acc: #CE82FF; --acc-deep: #A568CC; --acc-ink: #7B3FA6; --acc-soft: #F3E1FF; --acc-light: #E3B8FF; --acc-glow: #CE82FF55;
}
[data-accent="3"], .md-pick-grid > :nth-child(6n+4), .md-features-grid > :nth-child(6n+4), .md-recent-row > :nth-child(6n+4) {
  --acc: #FF9600; --acc-deep: #CD7900; --acc-ink: #A85F00; --acc-soft: #FFE9C7; --acc-light: #FFC477; --acc-glow: #FF960055;
}
[data-accent="4"], .md-pick-grid > :nth-child(6n+5), .md-features-grid > :nth-child(6n+5), .md-recent-row > :nth-child(6n+5) {
  --acc: #FFC800; --acc-deep: #D9A600; --acc-ink: #8A6800; --acc-soft: #FFF4C2; --acc-light: #FFE27A; --acc-glow: #FFC80066;
}
[data-accent="5"], .md-pick-grid > :nth-child(6n+6), .md-features-grid > :nth-child(6n+6), .md-recent-row > :nth-child(6n+6) {
  --acc: #FF86D0; --acc-deep: #D864AE; --acc-ink: #A8397F; --acc-soft: #FFE3F4; --acc-light: #FFB8E3; --acc-glow: #FF86D055;
}

/* ---------------------------------------------------------------------------
   2) BASE — type, page background, focus, selection, scrollbars
--------------------------------------------------------------------------- */
html { overflow-x: clip; }
html body {
  background: #FFFFFF;
  color: var(--duo-ink);
  font-family: var(--duo-font-body);
  -webkit-tap-highlight-color: transparent;
}
::selection { background: var(--duo-green-s); color: var(--duo-green-ink); }
.ts-root, .ts-root * { font-family: var(--duo-font-body); }
.ts-display { font-family: var(--duo-font-display); }
.ts-richtext, .ts-richtext *, .ProseMirror, .ProseMirror * { font-family: 'Amiri', serif; } /* lesson text font unchanged */

/* soft dotted paper under everything */
.md-platform, .md-lesson-page, .ts-root {
  background-color: #FFFFFF !important;
  background-image: radial-gradient(circle, #ECECEC 1.6px, transparent 1.8px) !important;
  background-size: 30px 30px !important;
  color: var(--duo-ink);
  font-family: var(--duo-font-body);
}
.md-platform :is(h1, h2, h3, button, .md-chip, .md-badge, .md-count, .md-pick-title, .md-unit-card-title, .md-lesson-cta, .md-section-label, .md-rail-label, .md-footer-brand),
.md-lesson-page :is(h1, h2, h3, button, .md-lv-pill, .md-lv-btn, .md-lv-step, .md-lv-card-title, .md-lv-scene-title) {
  font-family: var(--duo-font-display);
}

:where(a, button, [role="button"], input, select, textarea):focus-visible,
.md-chip:focus-visible, .md-unit-card:focus-visible, .md-lesson-card:focus-visible,
.md-continue-btn:focus-visible, .md-recent-chip:focus-visible, .md-pick-card:focus-visible,
.md-lesson-page button:focus-visible, .md-lesson-page a:focus-visible {
  outline: 3px solid var(--duo-blue);
  outline-offset: 3px;
  border-radius: 14px;
}

.ts-scrollbar::-webkit-scrollbar-thumb { background: var(--duo-line-d); border-radius: 999px; }

/* ---------------------------------------------------------------------------
   3) THE 3D PRESS — shared by every tappable thing
--------------------------------------------------------------------------- */
.md-chip, .md-ctx-grade, .md-unit-card, .md-lesson-card, .md-pick-card, .md-recent-chip,
.md-continue-chip, .md-account-btn, .md-login-btn, .md-continue-btn, .md-lv-btn, .md-lv-btn-sm,
.md-lv-step, .md-lv-back, .md-lv-toggle, .md-lv-opt, .md-assistant-bubble {
  -webkit-user-select: none; user-select: none;
  transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, filter 0.18s ease;
}
.md-chip:active:not(:disabled), .md-ctx-grade:active, .md-unit-card:active, .md-lesson-card:active:not([aria-disabled="true"]),
.md-pick-card:active:not(:disabled), .md-recent-chip:active, .md-continue-chip:active, .md-account-btn:active,
.md-login-btn:active, .md-continue-btn:active, .md-lv-btn:active:not(:disabled), .md-lv-btn-sm:active:not(:disabled),
.md-lv-step:active:not(:disabled), .md-lv-back:active, .md-lv-toggle:active, .md-lv-opt:active:not(:disabled) {
  transform: translateY(4px) !important;
  box-shadow: 0 0 0 transparent !important;
}

/* ---------------------------------------------------------------------------
   4) TOP BAR + account
--------------------------------------------------------------------------- */
.md-topbar, .md-lesson-page .md-lv-topbar {
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: none; -webkit-backdrop-filter: none;
  border-bottom: 2px solid var(--duo-line) !important;
}
.md-account-btn {
  background: #FFFFFF !important;
  border: 2px solid var(--duo-line) !important;
  box-shadow: 0 3px 0 var(--duo-line);
}
.md-account-btn:hover { background: var(--duo-snow) !important; transform: none; box-shadow: 0 3px 0 var(--duo-line-d); }
.md-topbar .md-login-btn, .md-lesson-page .md-lv-login {
  background: var(--duo-green) !important;
  color: #FFFFFF !important;
  border-radius: 16px !important;
  padding: 9px 22px !important;
  font-family: var(--duo-font-display);
  font-size: 0.95rem !important;
  font-weight: 800;
  box-shadow: 0 4px 0 var(--duo-green-d) !important;
  filter: none;
}
.md-topbar .md-login-btn:hover, .md-lesson-page .md-lv-login:hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 5px 0 var(--duo-green-d) !important; }
.md-topbar div.absolute, .md-lesson-page .md-lv-menu {
  border: 2px solid var(--duo-line) !important;
  border-radius: 18px !important;
  box-shadow: 0 5px 0 var(--duo-line) !important;
  animation: duo-pop 0.28s var(--duo-spring) both;
  transform-origin: top left;
}
.md-topbar div.absolute button { border-radius: 12px; transition: background 0.15s ease; }
.md-topbar div.absolute button:hover { background: var(--duo-snow); }

.md-continue-chip {
  background: var(--duo-yellow-s);
  border: 2px solid var(--duo-yellow);
  box-shadow: 0 3px 0 var(--duo-yellow-d);
  color: var(--duo-yellow-ink);
  border-radius: 18px;
}
.md-continue-chip:hover { transform: translateY(-1px); box-shadow: 0 4px 0 var(--duo-yellow-d); border-color: var(--duo-yellow); }
.md-continue-chip-icon { background: var(--duo-green); color: #FFFFFF; box-shadow: 0 2px 0 var(--duo-green-d); }
.md-continue-chip-text small { color: var(--duo-orange-ink); }
.md-continue-chip-label { color: var(--duo-yellow-ink); }

/* ---------------------------------------------------------------------------
   5) HERO — big green band with a chunky 3D edge and playful bubbles
--------------------------------------------------------------------------- */
.md-hero {
  background:
    radial-gradient(circle at 10% 24%, rgba(255, 255, 255, 0.20) 0 58px, transparent 60px),
    radial-gradient(circle at 92% 66%, rgba(255, 255, 255, 0.15) 0 96px, transparent 98px),
    radial-gradient(circle at 78% 12%, rgba(255, 200, 0, 0.55) 0 30px, transparent 32px),
    radial-gradient(circle at 22% 88%, rgba(28, 176, 246, 0.50) 0 38px, transparent 40px),
    radial-gradient(circle at 60% 94%, rgba(206, 130, 255, 0.50) 0 26px, transparent 28px),
    linear-gradient(180deg, #62D40A 0%, #58CC02 100%);
  border-radius: 0 0 clamp(34px, 6vw, 64px) clamp(34px, 6vw, 64px);
  box-shadow: 0 8px 0 var(--duo-green-d);
}
.md-hero::before { border-color: rgba(255, 255, 255, 0.22); box-shadow: 0 0 0 clamp(48px, 8vw, 90px) rgba(255, 255, 255, 0.06), 0 0 0 clamp(96px, 16vw, 180px) rgba(255, 255, 255, 0.04); }
.md-hero::after { border: 3px dashed rgba(255, 255, 255, 0.45); }
.md-hero > * { animation: duo-pop 0.7s var(--duo-spring) both; }
.md-hero > *:nth-child(2) { animation-delay: 0.08s; }
.md-hero > *:nth-child(3) { animation-delay: 0.16s; }
.md-hero > *:nth-child(4) { animation-delay: 0.24s; }
.md-hero-logo-wrap::before { background: radial-gradient(circle, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.08) 55%, transparent 72%); }
.md-hero-logo { border-radius: 26px; background: #FFFFFF; box-shadow: 0 6px 0 rgba(0, 0, 0, 0.18); }
.md-hero-logo:hover { transform: rotate(-3deg) scale(1.05); box-shadow: 0 8px 0 rgba(0, 0, 0, 0.18); }
.md-badge, .md-hero .md-badge {
  background: #FFFFFF; color: var(--duo-green-ink); border: 0;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.16);
  font-family: var(--duo-font-display); font-weight: 800; backdrop-filter: none; -webkit-backdrop-filter: none;
}
.md-badge::before { background: var(--duo-yellow); box-shadow: 0 0 0 3px rgba(255, 200, 0, 0.3); animation: duo-pulse 1.6s ease-in-out infinite; }
.md-hero h1 { font-family: var(--duo-font-display); font-weight: 800; color: #FFFFFF; -webkit-text-fill-color: #FFFFFF; text-shadow: 0 4px 0 rgba(0, 0, 0, 0.14); }
.md-hero p { color: #FFFFFF; opacity: 0.96; font-weight: 600; }

/* ---------------------------------------------------------------------------
   6) BACKGROUND DECOR — stars → confetti, orbits → colorful rings, no purple haze
--------------------------------------------------------------------------- */
.md-bg-layer { opacity: 0.7; }
.md-bg-layer::before { background: radial-gradient(circle, rgba(28, 176, 246, 0.14), transparent 70%); }
.md-bg-layer::after { background: radial-gradient(circle, rgba(255, 200, 0, 0.16), transparent 70%); }
.md-nebula { background: radial-gradient(circle, rgba(206, 130, 255, 0.10) 0%, rgba(88, 204, 2, 0.05) 40%, transparent 68%); }
.md-star { opacity: 0.8; box-shadow: none; border-radius: 4px; }
.md-star:nth-child(5n+1) { background: var(--duo-green); }
.md-star:nth-child(5n+2) { background: var(--duo-blue); border-radius: 50%; }
.md-star:nth-child(5n+3) { background: var(--duo-orange); }
.md-star:nth-child(5n+4) { background: var(--duo-purple); border-radius: 50%; }
.md-star:nth-child(5n+5) { background: var(--duo-yellow); }
.md-orbit { border: 2px dashed currentColor; opacity: 0.35; }
.md-orbit.active { opacity: 0.8; border-color: var(--duo-yellow) !important; box-shadow: none; }
.md-planet { top: -7px; width: 14px; height: 14px; opacity: 0.9; box-shadow: 0 3px 0 rgba(0, 0, 0, 0.12); }
.md-orbit.active .md-planet { box-shadow: 0 3px 0 rgba(0, 0, 0, 0.16), 0 0 0 5px rgba(255, 200, 0, 0.3); }
.md-atlas { opacity: 0.16; filter: none; }
.md-corner-compass { color: var(--duo-orange); opacity: 0.55; filter: none; }

/* ---------------------------------------------------------------------------
   7) PANELS & PROGRESS
--------------------------------------------------------------------------- */
.md-panel, .md-continue, .md-context, .md-jp {
  background: #FFFFFF !important;
  border: 2px solid var(--duo-line) !important;
  border-radius: 24px !important;
  box-shadow: 0 5px 0 var(--duo-line) !important;
  overflow: visible;
}
.md-panel::before, .md-continue::before, .md-context::before, .md-jp::before { display: none; }
.md-context { border-radius: 22px !important; padding: 10px 12px; }
.md-jp { border-radius: 22px !important; padding: 14px 18px 16px; }
.md-panel h2 { color: var(--duo-ink); font-family: var(--duo-font-display); font-weight: 800; }
.md-continue .font-black { color: var(--duo-green-ink) !important; }
.md-continue .md-continue-btn {
  background: var(--duo-green) !important; color: #FFF !important; border-radius: 16px;
  box-shadow: 0 5px 0 var(--duo-green-d); font-family: var(--duo-font-display); font-weight: 800;
}
.md-continue .md-continue-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 0 var(--duo-green-d); filter: brightness(1.05); }

.md-jp-where { color: var(--duo-muted); font-weight: 700; }
.md-jp-where b { color: var(--duo-ink); }
.md-jp-sep { color: var(--duo-orange); }
.md-jp-bar { height: 16px; gap: 4px; }
.md-jp-seg { position: relative; height: 16px; border-radius: 999px; background: var(--duo-line); box-shadow: none; overflow: hidden; }
.md-jp-seg.done { background: var(--acc, var(--duo-green)); }
.md-jp-seg.done::after { content: ""; position: absolute; top: 3px; inset-inline: 5px; height: 4px; border-radius: 999px; background: rgba(255, 255, 255, 0.38); }
.md-jp-seg.current { background: var(--duo-yellow); box-shadow: none; animation: duo-bar-bob 1.4s ease-in-out infinite; }
.md-jp-pct { color: var(--duo-green-ink); font-family: var(--duo-font-display); font-size: 0.95rem; font-weight: 800; }

.md-dashboard .md-section-label { color: var(--duo-muted) !important; font-family: var(--duo-font-display); font-size: 0.95rem; }
.md-dashboard .md-section-label::after { height: 2px; border-radius: 2px; background: var(--duo-line); }
.md-dashboard .md-recent-chip {
  background: #FFFFFF; color: var(--acc-ink) !important;
  border: 2px solid var(--duo-line) !important; border-radius: 16px;
  box-shadow: 0 4px 0 var(--acc);
  font-family: var(--duo-font-display); font-weight: 700;
}
.md-dashboard .md-recent-chip:hover { background: var(--acc-soft); border-color: var(--acc) !important; transform: translateY(-2px); box-shadow: 0 6px 0 var(--acc); }

/* ---------------------------------------------------------------------------
   8) CHIPS · grade/term context bar · alerts · empty states · loading
--------------------------------------------------------------------------- */
.md-chip {
  background: #FFFFFF; color: var(--duo-ink-soft);
  border: 2px solid var(--duo-line); border-radius: 16px;
  box-shadow: 0 4px 0 var(--duo-line);
  font-weight: 800;
}
.md-chip:hover:not(:disabled) { background: var(--duo-snow); border-color: var(--duo-line-d); transform: translateY(-1px); box-shadow: 0 5px 0 var(--duo-line-d); }
.md-chip.selected { background: var(--duo-green); border-color: var(--duo-green); color: #FFFFFF; box-shadow: 0 4px 0 var(--duo-green-d); }
.md-chip.selected::before { background: #FFFFFF; }
.md-ctx-grade {
  background: var(--duo-blue-s); border: 2px solid var(--duo-blue); color: var(--duo-blue-ink);
  border-radius: 16px; box-shadow: 0 4px 0 var(--duo-blue-d); font-family: var(--duo-font-display); font-weight: 800;
}
.md-ctx-grade:hover { background: #CDEEFF; border-color: var(--duo-blue); transform: translateY(-1px); }
.md-ctx-caret { color: var(--duo-blue); }
.md-ctx-terms { background: var(--duo-snow); border: 2px solid var(--duo-line); border-radius: 18px; gap: 6px; padding: 5px; }
.md-ctx-terms .md-chip { border: 2px solid transparent; background: transparent; box-shadow: none; border-radius: 13px; }
.md-ctx-terms .md-chip:hover:not(:disabled) { background: #FFFFFF; border-color: var(--duo-line); box-shadow: none; }
.md-ctx-terms .md-chip.selected { background: var(--duo-green); border-color: var(--duo-green); color: #FFF; box-shadow: 0 3px 0 var(--duo-green-d); }

.md-alert.error { background: var(--duo-red-s); border: 2px solid var(--duo-red); color: #B3261E; border-radius: 18px; box-shadow: 0 4px 0 var(--duo-red-d); font-weight: 700; }
.md-alert button { background: var(--duo-red) !important; box-shadow: 0 3px 0 var(--duo-red-d); border-radius: 12px !important; }
.md-alert button:active { transform: translateY(3px); box-shadow: none; }
.md-empty { background: var(--duo-snow); border: 2px dashed var(--duo-line-d); border-radius: 18px; color: var(--duo-muted); font-weight: 700; }
.md-spinner-rose { color: var(--duo-green); animation: spin 2.4s linear infinite, duo-bounce 1s ease-in-out infinite; }
.md-spinner-text { color: var(--duo-muted); font-family: var(--duo-font-display); font-weight: 700; }

/* ---------------------------------------------------------------------------
   9) STAGE / GRADE PICKER — big friendly illustrated cards
--------------------------------------------------------------------------- */
.md-pick-card {
  background: #FFFFFF; border: 2px solid var(--duo-line); border-top: 2px solid var(--duo-line);
  border-radius: 22px; box-shadow: 0 5px 0 var(--duo-line); color: var(--acc-ink);
  animation: duo-pop 0.55s var(--duo-spring) both;
}
.md-pick-grid > :nth-child(2) { animation-delay: 0.05s; } .md-pick-grid > :nth-child(3) { animation-delay: 0.1s; }
.md-pick-grid > :nth-child(4) { animation-delay: 0.15s; } .md-pick-grid > :nth-child(5) { animation-delay: 0.2s; }
.md-pick-grid > :nth-child(6) { animation-delay: 0.25s; } .md-pick-grid > :nth-child(n+7) { animation-delay: 0.3s; }
.md-pick-card:hover:not(:disabled) { background: var(--duo-snow); border-color: var(--acc); transform: translateY(-3px) rotate(-1deg); box-shadow: 0 8px 0 var(--acc); }
.md-pick-art, .md-pick-card:hover:not(:disabled) .md-pick-art { background: var(--acc-soft); border-radius: 18px; }
.md-pick-card:hover:not(:disabled) .md-art { animation: duo-wiggle 0.6s ease; }
.md-pick-title { color: var(--acc-ink); font-family: var(--duo-font-display); font-weight: 800; }
.md-pick-num { background: var(--duo-yellow); border: 0; color: var(--duo-yellow-ink); box-shadow: 0 3px 0 var(--duo-yellow-d); font-family: var(--duo-font-display); }
.md-art .a-l { stroke: var(--acc-deep); stroke-width: 3; }
.md-art .a-t { fill: var(--acc-light); stroke: var(--acc-deep); stroke-width: 3; }
.md-art .a-g { fill: var(--duo-yellow-s); stroke: var(--duo-yellow-d); stroke-width: 3; }
.md-art .a-s { fill: var(--acc); }
.md-art .a-y { fill: var(--duo-yellow); }
.md-pick-card.selected { background: var(--acc); border-color: var(--acc-deep); border-top-color: var(--acc-deep); box-shadow: 0 5px 0 var(--acc-deep); }
.md-pick-card.selected .md-pick-title { color: #FFFFFF; }
.md-pick-card.selected .md-pick-art { background: #FFFFFF; }
.md-pick-card.selected .md-pick-num { background: #FFFFFF; color: var(--acc-ink); box-shadow: 0 3px 0 rgba(0, 0, 0, 0.15); }

/* ---------------------------------------------------------------------------
   10) UNITS — chunky numbered buttons
--------------------------------------------------------------------------- */
.md-rail-label { color: var(--duo-muted); font-size: 0.95rem; font-weight: 800; }
.md-unit-row { border-bottom: 0; }
.md-unit-card {
  background: #FFFFFF; border: 2px solid var(--duo-line); border-inline-start: 2px solid var(--duo-line);
  border-radius: 20px; box-shadow: 0 5px 0 var(--duo-line);
}
.md-unit-card::before {
  background: var(--acc); color: #FFFFFF; opacity: 1; border-radius: 14px;
  box-shadow: 0 3px 0 var(--acc-deep); font-family: var(--duo-font-display); font-weight: 800;
  width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.05rem;
}
.md-unit-card::after { background: var(--acc-soft); color: var(--acc-ink); }
.md-unit-card:hover { background: #FFFFFF; border-color: var(--acc); border-inline-start-color: var(--acc); transform: translateY(-2px); box-shadow: 0 7px 0 var(--acc); }
.md-unit-card:hover::after { background: var(--acc); color: #FFFFFF; }
.md-unit-card-title { color: var(--duo-ink); font-family: var(--duo-font-display); font-weight: 800; }
.md-unit-card-count { background: var(--acc-soft); color: var(--acc-ink); font-weight: 800; }
.md-unit-card-progress { height: 10px; background: var(--duo-line); }
.md-unit-card-progress i { position: relative; background-image: none; background-color: var(--acc); }
.md-unit-card-progress i::after { content: ""; position: absolute; top: 2px; inset-inline: 4px; height: 3px; border-radius: 99px; background: rgba(255, 255, 255, 0.4); }
.md-unit-card.selected { background: var(--acc); border-color: var(--acc-deep); border-inline-start-color: var(--acc-deep); box-shadow: 0 5px 0 var(--acc-deep); transform: none; }
.md-unit-card.selected::before { background: #FFFFFF; color: var(--acc-ink); box-shadow: 0 3px 0 rgba(0, 0, 0, 0.15); }
.md-unit-card.selected::after { background: rgba(255, 255, 255, 0.28); color: #FFFFFF; }
.md-unit-card.selected .md-unit-card-title { color: #FFFFFF; }
.md-unit-card.selected .md-unit-card-count { background: rgba(255, 255, 255, 0.28); color: #FFFFFF; }
.md-unit-card.selected .md-unit-card-progress { background: rgba(0, 0, 0, 0.14); }
.md-unit-card.selected .md-unit-card-progress i { background-color: #FFFFFF; background-image: none; }
.md-unit-preview { border-inline-start: 3px dotted var(--acc-light); }
.md-unit-preview li { color: var(--duo-ink-soft); font-weight: 600; }
.md-unit-preview-num { color: var(--acc-ink); }

.md-split-empty { background: var(--duo-snow); border: 3px dashed var(--duo-line-d); border-radius: 24px; }
.md-split-empty p { color: var(--duo-muted); font-family: var(--duo-font-display); font-weight: 700; }
.md-split-empty-icon { background: var(--duo-blue); color: #FFFFFF; box-shadow: 0 4px 0 var(--duo-blue-d); animation: duo-nudge 1.4s ease-in-out infinite; }

/* ---------------------------------------------------------------------------
   11) LESSONS — a Duolingo-style learning path
--------------------------------------------------------------------------- */
.md-lessons-header h2 { border-bottom: 3px solid var(--duo-line); font-family: var(--duo-font-display); }
.md-lessons-title span { color: var(--duo-muted); }
.md-lessons-title i { color: var(--duo-orange); }
.md-lessons-title b { color: var(--acc-ink); }
.md-count { background: var(--duo-yellow); color: var(--duo-yellow-ink); box-shadow: 0 3px 0 var(--duo-yellow-d); font-family: var(--duo-font-display); font-weight: 800; }
.md-lessons .md-lessons-grid::before { inset-inline-start: 38px; border-inline-start: 4px dotted var(--duo-line-d); opacity: 1; }

.md-lesson-card {
  background: #FFFFFF; border: 2px solid var(--duo-line); border-inline-start: 2px solid var(--duo-line);
  border-radius: 24px; box-shadow: 0 5px 0 var(--duo-line); padding-inline-start: 86px;
}
.md-lesson-card:hover { background: #FFFFFF; border-color: var(--acc); transform: translateY(-3px); box-shadow: 0 8px 0 var(--acc); }
.md-lesson-card h3, .md-lesson-body h3 { color: var(--duo-ink); font-family: var(--duo-font-display); font-weight: 800; }
.md-lesson-body p { color: var(--duo-muted); font-weight: 600; }
.md-lesson-cta { color: var(--acc-ink); font-weight: 800; border-top: 0; }
.md-lesson-cta span { background: var(--acc-soft); color: var(--acc-ink); }
.md-lesson-card:hover .md-lesson-cta span { background: var(--acc); color: #FFFFFF; }

/* path nodes */
.md-lesson-card::after {
  width: 54px; height: 54px; inset-inline-start: 12px;
  border: 0; background: var(--acc); color: #FFFFFF; box-shadow: 0 5px 0 var(--acc-deep);
  font-family: var(--duo-font-display); font-size: 1.15rem; font-weight: 800; opacity: 1;
}
.md-lesson-card[data-kind="COMPLETED"]::after { content: "✓"; background: var(--duo-yellow); border: 0; color: #FFFFFF; box-shadow: 0 5px 0 var(--duo-yellow-d); font-size: 1.5rem; }
.md-lesson-card[data-kind="COMPLETED"] .md-lesson-cta { color: var(--duo-yellow-ink); }
.md-lesson-card[data-kind="CURRENT"] {
  background: linear-gradient(135deg, #FFFFFF 55%, var(--duo-green-s)); border-color: var(--duo-green); border-inline-start-color: var(--duo-green);
  box-shadow: 0 5px 0 var(--duo-green-d);
}
.md-lesson-card[data-kind="CURRENT"]:hover { box-shadow: 0 8px 0 var(--duo-green-d); border-color: var(--duo-green); }
.md-lesson-card[data-kind="CURRENT"]::after {
  background: var(--duo-green); border: 0; color: #FFFFFF; box-shadow: 0 5px 0 var(--duo-green-d), 0 0 0 0 rgba(88, 204, 2, 0.45);
  animation: duo-node-pulse 1.8s ease-out infinite;
}
.md-lesson-card[data-kind="CURRENT"] .md-lesson-cta, .md-lesson-body .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta {
  background: var(--duo-green); color: #FFFFFF !important; border-radius: 16px; padding: 7px 8px 7px 16px;
  box-shadow: 0 4px 0 var(--duo-green-d); font-family: var(--duo-font-display);
}
.md-lesson-card[data-kind="CURRENT"] .md-lesson-cta span { background: rgba(255, 255, 255, 0.28); color: #FFFFFF; }
.md-lesson-card[data-kind="ACCESS_LOCK"] { background: var(--duo-orange-s); border-color: var(--duo-orange) !important; box-shadow: 0 5px 0 var(--duo-orange-d); }
.md-lesson-card[data-kind="ACCESS_LOCK"]::after { background: var(--duo-orange); border: 0; color: #FFFFFF; box-shadow: 0 5px 0 var(--duo-orange-d); }
.md-lesson-card[data-kind="ACCESS_LOCK"] .md-lesson-cta { color: var(--duo-orange-ink) !important; }
.md-lesson-card[data-kind="SEQUENCE_LOCK"], .md-lesson-card[data-kind="COMING_SOON"], .md-lesson-locked {
  background: var(--duo-snow); border: 2px dashed var(--duo-line-d); box-shadow: none; opacity: 1 !important; filter: grayscale(0.15);
}
.md-lesson-card[data-kind="SEQUENCE_LOCK"]:hover, .md-lesson-card[data-kind="COMING_SOON"]:hover { transform: none; box-shadow: none; }
.md-lesson-card[data-kind="SEQUENCE_LOCK"]::after, .md-lesson-card[data-kind="COMING_SOON"]::after {
  background: var(--duo-line); border: 0; color: #AFAFAF; box-shadow: 0 5px 0 var(--duo-line-d);
}
.md-lesson-card[data-kind="SEQUENCE_LOCK"] h3, .md-lesson-card[data-kind="COMING_SOON"] h3 { color: var(--duo-muted); }
.md-lesson-soon { background: var(--duo-yellow-s) !important; border-color: var(--duo-yellow) !important; border-style: dashed !important; }
.md-soon-badge { background: var(--duo-orange); border: 0; color: #FFFFFF; box-shadow: 0 2px 0 var(--duo-orange-d); font-family: var(--duo-font-display); }

/* ---------------------------------------------------------------------------
   12) FEATURES BAND (bottom) · FRIEZE · ASSISTANT
--------------------------------------------------------------------------- */
.md-features {
  background:
    radial-gradient(circle at 8% 12%, rgba(255, 255, 255, 0.22) 0 46px, transparent 48px),
    radial-gradient(circle at 94% 80%, rgba(255, 255, 255, 0.16) 0 84px, transparent 86px),
    radial-gradient(circle at 82% 8%, rgba(255, 200, 0, 0.6) 0 22px, transparent 24px),
    linear-gradient(180deg, #34BDF8 0%, #1CB0F6 100%);
  box-shadow: inset 0 6px 0 var(--duo-blue-d);
}
.md-features::before { border-color: rgba(255, 255, 255, 0.22); }
.md-features-head h2 { background: none; -webkit-background-clip: border-box; background-clip: border-box; color: #FFFFFF; -webkit-text-fill-color: #FFFFFF; font-family: var(--duo-font-display); font-weight: 800; text-shadow: 0 3px 0 rgba(0, 0, 0, 0.14); }
.md-features-head p { color: #FFFFFF; opacity: 0.95; font-weight: 600; }
.md-feature {
  background: #FFFFFF; border: 2px solid #FFFFFF; border-top: 2px solid #FFFFFF; border-radius: 24px;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.16); backdrop-filter: none; -webkit-backdrop-filter: none;
}
.md-feature:hover { background: #FFFFFF; border-color: #FFFFFF; transform: translateY(-5px) rotate(-1deg); box-shadow: 0 11px 0 rgba(0, 0, 0, 0.16); }
.md-feature .md-feature-icon, .md-feature:nth-child(even) .md-feature-icon {
  width: 60px; height: 60px; border: 0; border-radius: 20px;
  background: var(--acc); color: #FFFFFF; box-shadow: 0 5px 0 var(--acc-deep);
}
.md-feature:hover .md-feature-icon { animation: duo-wiggle 0.6s ease; }
.md-feature h3 { color: var(--duo-ink); font-family: var(--duo-font-display); font-weight: 800; }
.md-feature p { color: var(--duo-muted); font-weight: 600; }

/* old column frieze → a row of bouncy candy bars */
.md-frieze { opacity: 1; border-top: 0; margin-top: 28px; padding: 18px 0 14px; }
.md-frieze-inner { opacity: 1; gap: 12px; align-items: flex-end; }
.md-column { width: 22px; }
.md-column-capital, .md-column-base { display: none; }
.md-column-shaft { width: 22px; height: 34px; border-radius: 12px; background: var(--duo-green); box-shadow: 0 5px 0 var(--duo-green-d); animation: duo-wave 2.4s ease-in-out infinite; }
.md-column:nth-child(6n+1) .md-column-shaft { background: var(--duo-green); box-shadow: 0 5px 0 var(--duo-green-d); }
.md-column:nth-child(6n+2) .md-column-shaft { background: var(--duo-blue); box-shadow: 0 5px 0 var(--duo-blue-d); height: 46px; animation-delay: 0.15s; }
.md-column:nth-child(6n+3) .md-column-shaft { background: var(--duo-purple); box-shadow: 0 5px 0 var(--duo-purple-d); height: 28px; animation-delay: 0.3s; }
.md-column:nth-child(6n+4) .md-column-shaft { background: var(--duo-orange); box-shadow: 0 5px 0 var(--duo-orange-d); height: 40px; animation-delay: 0.45s; }
.md-column:nth-child(6n+5) .md-column-shaft { background: var(--duo-yellow); box-shadow: 0 5px 0 var(--duo-yellow-d); height: 32px; animation-delay: 0.6s; }
.md-column:nth-child(6n+6) .md-column-shaft { background: var(--duo-pink); box-shadow: 0 5px 0 var(--duo-pink-d); height: 44px; animation-delay: 0.75s; }

.md-assistant-bubble { width: 62px; height: 62px; border: 3px solid var(--duo-green); background: #FFFFFF; box-shadow: 0 5px 0 var(--duo-green-d); }
.md-assistant-bubble:hover { box-shadow: 0 6px 0 var(--duo-green-d); filter: brightness(1.03); }
.md-assistant-bubble:active { transform: translateY(5px) !important; box-shadow: 0 0 0 transparent !important; }
.md-assistant-tooltip { position: relative; background: #FFFFFF; border: 2px solid var(--duo-line); border-radius: 18px; box-shadow: 0 4px 0 var(--duo-line); animation: duo-pop 0.35s var(--duo-spring) both; transform-origin: bottom right; }
.md-assistant-tooltip::after { content: ""; position: absolute; bottom: -9px; inset-inline-end: 22px; width: 14px; height: 14px; background: #FFFFFF; border-inline-end: 2px solid var(--duo-line); border-bottom: 2px solid var(--duo-line); transform: rotate(45deg); }
.md-assistant-tooltip-title { color: var(--duo-green-ink); font-family: var(--duo-font-display); font-weight: 800; }
.md-assistant-tooltip-body { color: var(--duo-ink-soft); font-weight: 600; }

/* ---------------------------------------------------------------------------
   13) FOOTER (student platform + every other page that uses <Footer/>)
--------------------------------------------------------------------------- */
.md-footer {
  background: #FFFFFF; backdrop-filter: none; -webkit-backdrop-filter: none;
  border-top: 0; box-shadow: none; padding: 24px 20px 20px; position: relative;
}
.md-footer::before { content: ""; position: absolute; top: 0; inset-inline: 0; height: 8px; background: var(--md-rainbow); }
.md-footer-brand { color: var(--duo-green-ink); font-family: var(--duo-font-display); font-size: 1.15rem; font-weight: 800; }
.md-footer-desc { color: var(--duo-muted); font-weight: 600; }
.md-footer-contact { color: var(--duo-ink-soft); font-weight: 600; }
.md-footer a, .md-footer-contact a { color: var(--duo-blue-ink); font-weight: 800; text-decoration: none; display: inline-block; transition: transform 0.18s var(--duo-spring), color 0.15s ease; }
.md-footer a:hover, .md-footer-contact a:hover { color: var(--duo-blue-d); text-decoration: none; transform: translateY(-2px) rotate(-2deg); }
.md-footer-copy { color: #AFAFAF; font-weight: 600; }

/* ---------------------------------------------------------------------------
   14) LESSON PAGE (.md-lesson-page — also covers the lesson footer/login)
--------------------------------------------------------------------------- */
.md-lesson-page .md-lv-back {
  background: #FFFFFF; color: var(--duo-blue-ink) !important; border: 2px solid var(--duo-line);
  border-radius: 16px; box-shadow: 0 3px 0 var(--duo-line); font-family: var(--duo-font-display);
}
.md-lesson-page .md-lv-back:hover { background: var(--duo-blue-s); color: var(--duo-blue-ink) !important; border-color: var(--duo-blue); transform: translateY(-1px); }
.md-lesson-page .md-lv-topbar-title { color: var(--duo-muted) !important; font-family: var(--duo-font-display); }
.md-lesson-page .md-lv-account { background: #FFFFFF; border: 2px solid var(--duo-line); box-shadow: 0 3px 0 var(--duo-line); }
.md-lesson-page .md-lv-account:hover { box-shadow: 0 3px 0 var(--duo-line-d); transform: none; }
.md-lesson-page .md-lv-progress { background: var(--duo-green-s) !important; color: var(--duo-green-ink) !important; border-bottom: 2px solid var(--duo-green); font-family: var(--duo-font-display); }

.md-lesson-page .md-lv-hero {
  background:
    radial-gradient(circle at 8% 26%, rgba(255, 255, 255, 0.22) 0 48px, transparent 50px),
    radial-gradient(circle at 92% 72%, rgba(255, 255, 255, 0.16) 0 84px, transparent 86px),
    radial-gradient(circle at 80% 14%, rgba(255, 200, 0, 0.6) 0 24px, transparent 26px),
    radial-gradient(circle at 24% 92%, rgba(206, 130, 255, 0.55) 0 30px, transparent 32px),
    linear-gradient(180deg, #34BDF8 0%, #1CB0F6 100%);
  box-shadow: 0 8px 0 var(--duo-blue-d);
}
.md-lesson-page .md-lv-hero::before { border-color: rgba(255, 255, 255, 0.22); box-shadow: 0 0 0 46px rgba(255, 255, 255, 0.06), 0 0 0 92px rgba(255, 255, 255, 0.04); }
.md-lesson-page .md-lv-hero > * { animation: duo-pop 0.65s var(--duo-spring) both; }
.md-lesson-page .md-lv-hero > *:nth-child(2) { animation-delay: 0.1s; }
.md-lesson-page .md-lv-pill {
  background: #FFFFFF !important; color: var(--duo-blue-ink) !important; border: 0;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.16); backdrop-filter: none; -webkit-backdrop-filter: none; font-weight: 800 !important;
}
.md-lesson-page .md-lv-pill::before { background: var(--duo-yellow); box-shadow: 0 0 0 3px rgba(255, 200, 0, 0.3); }
.md-lesson-page .md-lv-h1 { font-family: var(--duo-font-display); font-weight: 800; text-shadow: 0 4px 0 rgba(0, 0, 0, 0.14); }
.md-lesson-page .md-lv-desc { color: #FFFFFF !important; font-weight: 600; opacity: 0.96; }

.md-lesson-page .md-lv-video { border: 3px solid var(--duo-line) !important; border-radius: 26px !important; box-shadow: 0 7px 0 var(--duo-line) !important; }
.md-lesson-page .md-lv-video-note { color: var(--duo-ink-soft) !important; font-weight: 600; }

.md-lesson-page .md-lv-journey, .md-lesson-page .md-lv-notice {
  background: #FFFFFF !important; border: 2px solid var(--duo-line) !important; border-radius: 24px !important;
  box-shadow: 0 5px 0 var(--duo-line) !important; overflow: visible;
}
.md-lesson-page .md-lv-journey::before, .md-lesson-page .md-lv-card--accent::before, .md-lesson-page .md-lv-notice::before { display: none; }
.md-lesson-page .md-lv-journey p, .md-lesson-page .md-lv-notice p.font-black { color: var(--duo-green-ink) !important; font-family: var(--duo-font-display); }
.md-lesson-page .md-lv-track { height: 16px; background: var(--duo-line); border-radius: 999px; }
.md-lesson-page .md-lv-fill { position: relative; background-image: none; background-color: var(--duo-green); }
.md-lesson-page .md-lv-fill::after { content: ""; position: absolute; top: 3px; inset-inline: 6px; height: 4px; border-radius: 99px; background: rgba(255, 255, 255, 0.4); }
.md-lesson-page .md-lv-journey .md-lv-legend { color: var(--duo-muted) !important; font-weight: 600; }

/* scene steps */
.md-lesson-page .md-lv-step {
  background: #FFFFFF !important; border: 2px solid var(--duo-line) !important; border-radius: 16px !important;
  color: var(--duo-ink-soft) !important; box-shadow: 0 4px 0 var(--duo-line) !important; font-weight: 800 !important;
}
.md-lesson-page .md-lv-step:hover:not(:disabled), .md-lesson-page .md-lv-step[data-state="available"]:hover:not(:disabled) {
  background: var(--duo-snow) !important; border-color: var(--duo-blue) !important; transform: translateY(-2px); box-shadow: 0 6px 0 var(--duo-blue) !important;
}
.md-lesson-page .md-lv-step[data-state="current"] { background: var(--duo-blue) !important; border-color: var(--duo-blue) !important; color: #FFFFFF !important; box-shadow: 0 4px 0 var(--duo-blue-d) !important; }
.md-lesson-page .md-lv-step[data-state="done"] { background: var(--duo-green-s) !important; border-color: var(--duo-green) !important; color: var(--duo-green-ink) !important; box-shadow: 0 4px 0 var(--duo-green-d) !important; }
.md-lesson-page .md-lv-step[data-state="access"] { background: var(--duo-orange-s) !important; border-color: var(--duo-orange) !important; color: var(--duo-orange-ink) !important; box-shadow: 0 4px 0 var(--duo-orange-d) !important; }
.md-lesson-page .md-lv-step[data-state="sequence"] { background: var(--duo-snow) !important; border: 2px dashed var(--duo-line-d) !important; color: #AFAFAF !important; box-shadow: none !important; opacity: 1 !important; }

/* content cards — one accent color each */
.md-lesson-page .md-lv-card, .md-lesson-page .md-lv-card[data-kind] {
  background: #FFFFFF !important; border: 2px solid var(--duo-line) !important; border-inline-start: 2px solid var(--duo-line) !important;
  border-radius: 24px !important; box-shadow: 0 5px 0 var(--duo-line) !important;
}
.md-lesson-page .md-lv-card[data-kind]:hover { border-color: var(--lv-acc) !important; box-shadow: 0 5px 0 var(--lv-acc) !important; }
.md-lesson-page .md-lv-card[data-kind="text"]      { --lv-acc: #1CB0F6; --lv-acc-deep: #0B7BB5; --lv-soft: #DDF4FF; --lv-dark: #1899D6; }
.md-lesson-page .md-lv-card[data-kind="mindmap"]   { --lv-acc: #CE82FF; --lv-acc-deep: #7B3FA6; --lv-soft: #F3E1FF; --lv-dark: #A568CC; }
.md-lesson-page .md-lv-card[data-kind="timeline"]  { --lv-acc: #FF9600; --lv-acc-deep: #A85F00; --lv-soft: #FFE9C7; --lv-dark: #CD7900; }
.md-lesson-page .md-lv-card[data-kind="questions"] { --lv-acc: #58CC02; --lv-acc-deep: #3F7D00; --lv-soft: #D7FFB8; --lv-dark: #58A700; }
.md-lesson-page .md-lv-card[data-kind="review"]    { --lv-acc: #FF86D0; --lv-acc-deep: #A8397F; --lv-soft: #FFE3F4; --lv-dark: #D864AE; }
.md-lesson-page .md-lv-card[data-kind] .md-lv-card-title, .md-lesson-page .md-lv-card[data-kind] .md-lv-scene-title { color: var(--lv-acc-deep) !important; font-weight: 800 !important; }
.md-lesson-page .md-lv-card-title { color: var(--duo-ink) !important; }
.md-lesson-page .md-lv-scene-title { color: var(--duo-ink) !important; border-color: var(--duo-line) !important; }
.md-lesson-page .md-lv-card[data-kind] .md-lv-toggle, .md-lesson-page .md-lv-toggle {
  background: var(--lv-soft, var(--duo-blue-s)) !important; color: var(--lv-acc-deep, var(--duo-blue-ink)) !important;
  border: 2px solid var(--lv-acc, var(--duo-blue)); border-radius: 14px !important; box-shadow: 0 3px 0 var(--lv-dark, var(--duo-blue-d)); font-weight: 800;
}
.md-lesson-page .md-lv-card[data-kind] .md-lv-toggle:hover, .md-lesson-page .md-lv-toggle:hover { background: var(--lv-acc, var(--duo-blue)) !important; color: #FFFFFF !important; }
.md-lesson-page .md-lv-recall { background: var(--duo-blue-s) !important; border: 2px solid var(--duo-blue) !important; border-radius: 20px !important; }
.md-lesson-page .md-lv-detail { background: var(--duo-yellow-s) !important; border: 2px solid var(--duo-yellow) !important; border-radius: 18px !important; }
.md-lesson-page .md-lv-mm-node { border: 2px solid var(--duo-line); border-radius: 16px !important; box-shadow: 0 3px 0 var(--duo-line); }
.md-lesson-page .md-lv-mm-node:hover, .md-lesson-page .md-lv-card[data-kind="mindmap"] .md-lv-mm-node:hover { border-color: var(--duo-purple) !important; transform: translateY(-2px); box-shadow: 0 5px 0 var(--duo-purple-d); }
.md-lesson-page .md-lv-tl-item { background: #FFFFFF !important; border: 2px solid var(--duo-line) !important; border-radius: 18px !important; box-shadow: 0 3px 0 var(--duo-line); }
.md-lesson-page .md-lv-tl-item:hover { border-color: var(--duo-orange) !important; box-shadow: 0 5px 0 var(--duo-orange-d); }
.md-lesson-page .md-lv-tl-date, .md-lesson-page .md-lv-card[data-kind="timeline"] .md-lv-tl-date { background: var(--duo-orange) !important; color: #FFFFFF !important; border-radius: 12px !important; box-shadow: 0 3px 0 var(--duo-orange-d); font-family: var(--duo-font-display); }

/* questions */
.md-lesson-page .md-lv-q { background: var(--duo-snow) !important; border: 2px solid var(--duo-line) !important; border-radius: 20px !important; }
.md-lesson-page .md-lv-opt { border: 2px solid var(--duo-line); border-radius: 16px !important; box-shadow: 0 3px 0 var(--duo-line); font-weight: 700; }
.md-lesson-page .md-lv-opt:hover:not(:disabled) { border-color: var(--duo-blue) !important; background: var(--duo-blue-s); transform: translateY(-1px); box-shadow: 0 4px 0 var(--duo-blue-d); }
.md-lesson-page .md-lv-btn-sm, .md-lesson-page .md-lv-card[data-kind="questions"] .md-lv-btn-sm {
  background: var(--duo-green) !important; color: #FFFFFF !important; border-radius: 14px !important;
  box-shadow: 0 4px 0 var(--duo-green-d); font-family: var(--duo-font-display); font-weight: 800;
}
.md-lesson-page .md-lv-btn-sm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 0 var(--duo-green-d); filter: brightness(1.05); }

/* big lesson buttons */
.md-lesson-page .md-lv-btn { border-radius: 18px !important; min-height: 52px; font-family: var(--duo-font-display); font-size: 1.02rem !important; font-weight: 800 !important; letter-spacing: 0.01em; }
.md-lesson-page .md-lv-btn-primary { background: var(--duo-green) !important; color: #FFFFFF !important; box-shadow: 0 5px 0 var(--duo-green-d); }
.md-lesson-page .md-lv-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 7px 0 var(--duo-green-d); filter: brightness(1.05); }
.md-lesson-page .md-lv-btn-ghost { background: #FFFFFF !important; color: var(--duo-blue-ink) !important; border: 2px solid var(--duo-line); box-shadow: 0 5px 0 var(--duo-line); }
.md-lesson-page .md-lv-btn-ghost:hover:not(:disabled) { background: var(--duo-blue-s) !important; border-color: var(--duo-blue); box-shadow: 0 7px 0 var(--duo-blue-d); transform: translateY(-2px); }
.md-lesson-page .md-lv-btn-text { background: transparent !important; box-shadow: none; color: var(--duo-muted) !important; }
.md-lesson-page .md-lv-btn-text:hover { color: var(--duo-blue-ink) !important; }
.md-lesson-page .md-lv-btn:disabled { opacity: 1; background: var(--duo-line) !important; color: #AFAFAF !important; box-shadow: 0 5px 0 var(--duo-line-d); cursor: not-allowed; }
.md-lesson-page .md-lv-btn-done { background: var(--duo-yellow) !important; box-shadow: 0 5px 0 var(--duo-yellow-d); }
.md-lesson-page .md-lv-lock { background: var(--duo-orange-s) !important; border: 3px dashed var(--duo-orange) !important; border-radius: 24px !important; }
.md-lesson-page .md-lv-lock p.font-black { color: var(--duo-orange-ink) !important; }
.md-lesson-page .md-lv-notice { animation: duo-pop 0.6s var(--duo-spring) both; }
.md-lesson-page footer { border-top: 0 !important; }

/* ---------------------------------------------------------------------------
   15) RICH TEXT, INPUTS, TEACHER STUDIO bits that share the global tokens
--------------------------------------------------------------------------- */
.ts-hotword, .ts-hotword-target { color: var(--duo-orange-ink); text-decoration-color: var(--duo-orange); }
.ts-hotword.active, .ts-hotword-target.active { background: var(--duo-yellow-s); border-radius: 8px; }
.ts-selectable::selection { background: var(--duo-yellow-s); }
.ts-richtext h1, .ts-richtext h2, .ts-richtext h3 { color: var(--duo-ink); }
.ts-richtext blockquote { border-right: 5px solid var(--duo-green); background: var(--duo-green-s); border-radius: 14px 0 0 14px; padding: 8px 14px; color: var(--duo-ink-soft); }
.ts-richtext a, .ProseMirror a { color: var(--duo-blue-ink); font-weight: 800; }
.ts-richtext img { border-radius: 18px; border: 2px solid var(--duo-line); box-shadow: 0 4px 0 var(--duo-line); }
.ts-richtext th, .ProseMirror th { background: var(--duo-green); color: #FFFFFF; }
.ts-richtext td, .ts-richtext th, .ProseMirror td, .ProseMirror th { border: 2px solid var(--duo-line); }
.ts-richtext tr:nth-child(even) td, .ProseMirror tr:nth-child(even) td { background: var(--duo-snow); }
.ts-input { border: 2px solid var(--duo-line); border-radius: 14px; background: var(--duo-snow); color: var(--duo-ink); padding: 10px 14px; transition: border-color 0.15s ease, background 0.15s ease; }
.ts-input:focus { border-color: var(--duo-blue); background: #FFFFFF; }

/* ---------------------------------------------------------------------------
   16) FALLBACK for pages whose inline colors we didn't touch
       (About / Privacy / Terms / Cms / AuthModal / Teacher …): any element that
       still carries one of the OLD inline colors is re-skinned automatically.
--------------------------------------------------------------------------- */
[style*="background: rgb(75, 47, 209)"], [style*="background-color: rgb(75, 47, 209)"] { background: var(--duo-green) !important; box-shadow: 0 4px 0 var(--duo-green-d); border-radius: 14px; }
[style*="color: rgb(75, 47, 209)"] { color: var(--duo-green-ink) !important; }
[style*="color: rgb(23, 19, 51)"] { color: var(--duo-ink) !important; }
[style*="color: rgb(110, 107, 133)"] { color: var(--duo-muted) !important; }
[style*="color: rgb(67, 63, 102)"] { color: var(--duo-ink-soft) !important; }
[style*="color: rgb(201, 151, 46)"] { color: var(--duo-orange-ink) !important; }
[style*="color: rgb(214, 51, 75)"] { color: var(--duo-red-d) !important; }
[style*="rgb(227, 224, 238)"] { border-color: var(--duo-line) !important; }
[style*="solid rgb(227, 224, 238)"] { border-width: 2px !important; }
[style*="background: rgb(247, 245, 251)"] { background: var(--duo-snow) !important; }

/* ---------------------------------------------------------------------------
   17) MOTION KEYFRAMES
--------------------------------------------------------------------------- */
@keyframes duo-pop { 0% { opacity: 0; transform: translateY(14px) scale(0.92); } 100% { opacity: 1; transform: none; } }
@keyframes duo-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.5); } }
@keyframes duo-bounce { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
@keyframes duo-wiggle { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
@keyframes duo-nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-6px); } }
@keyframes duo-wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes duo-bar-bob { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.35); } }
@keyframes duo-node-pulse {
  0% { box-shadow: 0 5px 0 var(--duo-green-d), 0 0 0 0 rgba(88, 204, 2, 0.5); }
  70% { box-shadow: 0 5px 0 var(--duo-green-d), 0 0 0 14px rgba(88, 204, 2, 0); }
  100% { box-shadow: 0 5px 0 var(--duo-green-d), 0 0 0 0 rgba(88, 204, 2, 0); }
}

/* ---------------------------------------------------------------------------
   18) PAGE TRANSITIONS + RELOAD SPLASH + SWIPE-BACK BUBBLE
       (markup lives in components/DuoFx.jsx + App.jsx). NOTE: the page wrapper
       only animates opacity / "left" — never transform — so position:fixed
       children (assistant bubble, background layer) never jump.
--------------------------------------------------------------------------- */
.md-page-enter { position: relative; animation: duo-page-in 0.5s cubic-bezier(0.22, 1.25, 0.36, 1) backwards; }
.md-page-enter[data-dir="back"] { animation-name: duo-page-in-back; }
@keyframes duo-page-in { from { opacity: 0; left: -46px; } to { opacity: 1; left: 0; } }
@keyframes duo-page-in-back { from { opacity: 0; left: 46px; } to { opacity: 1; left: 0; } }

.duo-routebar { position: fixed; top: 0; inset-inline: 0; height: 6px; z-index: 9998; pointer-events: none; overflow: hidden; animation: duo-routebar-fade 0.9s ease forwards; }
.duo-routebar i { position: absolute; top: 0; bottom: 0; right: 0; width: 100%; background: var(--md-rainbow); border-radius: 0 0 6px 6px; transform-origin: right; animation: duo-routebar-fill 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
@keyframes duo-routebar-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes duo-routebar-fade { 0%, 70% { opacity: 1; } 100% { opacity: 0; } }

.duo-splash { position: fixed; inset: 0; z-index: 10000; pointer-events: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; background-color: #FFFFFF; background-image: radial-gradient(circle, #ECECEC 1.6px, transparent 1.8px); background-size: 30px 30px; transition: opacity 0.35s ease, clip-path 0.45s cubic-bezier(0.7, 0, 0.3, 1); clip-path: circle(150% at 50% 50%); }
.duo-splash.leaving { opacity: 0; clip-path: circle(0% at 50% 50%); }
.duo-splash-logo { width: 104px; height: 104px; display: flex; align-items: center; justify-content: center; border-radius: 30px; background: #FFFFFF; border: 3px solid var(--duo-green); box-shadow: 0 7px 0 var(--duo-green-d); animation: duo-splash-hop 0.8s var(--duo-spring) infinite alternate; }
.duo-splash-logo img { width: 72px; height: 72px; object-fit: contain; }
.duo-splash-logo b { font: 800 2.4rem var(--duo-font-display); color: var(--duo-green-ink); }
.duo-splash-bar { width: min(240px, 60vw); height: 18px; border-radius: 999px; background: var(--duo-line); overflow: hidden; }
.duo-splash-bar i { display: block; height: 100%; width: 100%; border-radius: 999px; background: var(--duo-green); transform-origin: right; transform: scaleX(0); animation: duo-splash-fill 0.95s cubic-bezier(0.4, 0, 0.2, 1) forwards; position: relative; }
.duo-splash-bar i::after { content: ""; position: absolute; top: 4px; inset-inline: 7px; height: 4px; border-radius: 99px; background: rgba(255, 255, 255, 0.4); }
.duo-splash-dots { display: flex; gap: 10px; }
.duo-splash-dots span { width: 14px; height: 14px; border-radius: 50%; animation: duo-splash-dot 0.7s ease-in-out infinite alternate; }
.duo-splash-dots span:nth-child(1) { background: var(--duo-green); }
.duo-splash-dots span:nth-child(2) { background: var(--duo-blue); animation-delay: 0.1s; }
.duo-splash-dots span:nth-child(3) { background: var(--duo-orange); animation-delay: 0.2s; }
.duo-splash-dots span:nth-child(4) { background: var(--duo-purple); animation-delay: 0.3s; }
.duo-splash-dots span:nth-child(5) { background: var(--duo-yellow); animation-delay: 0.4s; }
@keyframes duo-splash-hop { from { transform: translateY(0) rotate(-3deg); } to { transform: translateY(-16px) rotate(3deg); } }
@keyframes duo-splash-fill { to { transform: scaleX(1); } }
@keyframes duo-splash-dot { from { transform: translateY(0); } to { transform: translateY(-10px); } }

/* swipe-back bubble: grows out of the right edge while the finger drags left */
.duo-swipe { position: fixed; top: 50%; right: 0; z-index: 9997; width: 58px; height: 58px; margin-top: -29px; pointer-events: none; opacity: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #FFFFFF; border: 3px solid var(--duo-line-d); color: var(--duo-muted); box-shadow: 0 5px 0 var(--duo-line-d); transform: translateX(70px); will-change: transform, opacity; }
.duo-swipe svg { width: 26px; height: 26px; transition: transform 0.2s var(--duo-spring); }
.duo-swipe.ready { background: var(--duo-green); border-color: var(--duo-green-d); color: #FFFFFF; box-shadow: 0 5px 0 var(--duo-green-d); }
.duo-swipe.ready svg { transform: scale(1.25); }
.duo-swipe.go { animation: duo-swipe-go 0.35s ease forwards; }
@keyframes duo-swipe-go { to { opacity: 0; transform: translateX(-30px) scale(1.4); } }

/* ---------------------------------------------------------------------------
   18b) FOOTER.jsx · AUTH MODAL · GUEST BANNER (classes added in those files)
--------------------------------------------------------------------------- */
.duo-footer { position: relative; background: #FFFFFF !important; border-top: 0 !important; padding-top: 8px; }
.duo-footer::before { content: ""; position: absolute; top: 0; inset-inline: 0; height: 8px; background: var(--md-rainbow); }
.duo-footer p.font-black { font-family: var(--duo-font-display); font-size: 1.25rem; font-weight: 800; }
.duo-footer img { filter: drop-shadow(0 3px 0 var(--duo-line)); transition: transform 0.25s var(--duo-spring); }
.duo-footer img:hover { transform: rotate(-6deg) scale(1.08); }
.duo-footer nav a {
  --c: var(--duo-blue); --cd: var(--duo-blue-d); --cs: var(--duo-blue-s); --ci: var(--duo-blue-ink);
  display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 14px;
  background: #FFFFFF; border: 2px solid var(--duo-line); box-shadow: 0 3px 0 var(--duo-line);
  color: var(--ci); font-family: var(--duo-font-display); font-weight: 800; text-decoration: none !important;
  transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, background-color 0.18s ease, border-color 0.18s ease;
}
.duo-footer nav a:nth-child(5n+2) { --c: var(--duo-green); --cd: var(--duo-green-d); --cs: var(--duo-green-s); --ci: var(--duo-green-ink); }
.duo-footer nav a:nth-child(5n+3) { --c: var(--duo-purple); --cd: var(--duo-purple-d); --cs: var(--duo-purple-s); --ci: var(--duo-purple-ink); }
.duo-footer nav a:nth-child(5n+4) { --c: var(--duo-orange); --cd: var(--duo-orange-d); --cs: var(--duo-orange-s); --ci: var(--duo-orange-ink); }
.duo-footer nav a:nth-child(5n+5) { --c: var(--duo-pink); --cd: var(--duo-pink-d); --cs: var(--duo-pink-s); --ci: var(--duo-pink-ink); }
.duo-footer nav a:hover { background: var(--cs); border-color: var(--c); box-shadow: 0 5px 0 var(--cd); transform: translateY(-2px); }
.duo-footer nav a:active { transform: translateY(3px); box-shadow: 0 0 0 transparent; }
.duo-mail { text-decoration: none; border-bottom: 3px dotted var(--duo-blue); transition: color 0.15s ease, border-color 0.15s ease; }
.duo-mail:hover { color: var(--duo-blue-d) !important; border-bottom-style: solid; }
.duo-social { box-shadow: 0 4px 0 var(--sc); transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, background-color 0.18s ease, color 0.18s ease; }
.duo-social:hover { transform: translateY(-3px) rotate(-5deg); box-shadow: 0 7px 0 var(--sc); }
.duo-social:active { transform: translateY(4px); box-shadow: 0 0 0 transparent; }

.duo-overlay { animation: duo-fade 0.2s ease both; }
.duo-modal { border-radius: 28px !important; box-shadow: 0 8px 0 var(--duo-line) !important; animation: duo-pop 0.45s var(--duo-spring) both; }
.duo-modal :is(h2, h3) { font-family: var(--duo-font-display); font-weight: 800; }
.duo-close { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; padding: 0 !important; border: 2px solid var(--duo-line); border-radius: 12px !important; box-shadow: 0 3px 0 var(--duo-line); background: #FFFFFF; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, background-color 0.15s ease; }
.duo-close:hover { background: var(--duo-red-s); border-color: var(--duo-red); color: var(--duo-red-d) !important; box-shadow: 0 3px 0 var(--duo-red-d); }
.duo-close:active { transform: translateY(3px); box-shadow: 0 0 0 transparent; }
.duo-btn { min-height: 50px; border-radius: 16px !important; font-family: var(--duo-font-display); font-size: 1rem !important; font-weight: 800 !important; cursor: pointer; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, filter 0.18s ease, background-color 0.18s ease, border-color 0.18s ease; }
.duo-btn-primary { background: var(--duo-green) !important; color: #FFFFFF !important; border: 0; box-shadow: 0 5px 0 var(--duo-green-d); }
.duo-btn-primary:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 6px 0 var(--duo-green-d); }
.duo-btn-ghost { background: #FFFFFF !important; border: 2px solid var(--duo-line) !important; box-shadow: 0 5px 0 var(--duo-line); }
.duo-btn-ghost:hover:not(:disabled) { background: var(--duo-snow) !important; border-color: var(--duo-blue) !important; box-shadow: 0 6px 0 var(--duo-blue-d); transform: translateY(-1px); }
.duo-btn:active:not(:disabled) { transform: translateY(5px); box-shadow: 0 0 0 transparent; }
.duo-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.duo-linkbtn { font-family: var(--duo-font-display); font-weight: 800; transition: color 0.15s ease, transform 0.15s var(--duo-spring); }
.duo-linkbtn:hover { color: var(--duo-blue-d) !important; transform: translateY(-1px); }
.duo-banner { border-radius: 20px !important; box-shadow: 0 5px 0 var(--duo-line) !important; animation: duo-slide-up 0.5s var(--duo-spring) both; }
@keyframes duo-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes duo-slide-up { from { opacity: 0; transform: translateY(40px) scale(0.96); } to { opacity: 1; transform: none; } }

/* ---------------------------------------------------------------------------
   18c) PICK-CARD CHARACTERS (PickArt in uiParts.jsx)
--------------------------------------------------------------------------- */

.md-art { width: 88%; height: 88%; }
.md-art .pa-body { transform-box: fill-box; transform-origin: 50% 100%; animation: duo-bob 3.2s ease-in-out infinite; }
.md-pick-grid > :nth-child(even) .md-art .pa-body { animation-delay: -1.4s; }
.md-pick-grid > :nth-child(3n) .md-art .pa-body { animation-delay: -2.2s; }
.md-art .pa-eye { transform-box: fill-box; transform-origin: center; animation: duo-blink 4.4s infinite; }
.md-pick-grid > :nth-child(even) .md-art .pa-eye { animation-delay: -2s; }
.md-art .pa-spark { transform-box: fill-box; transform-origin: center; animation: duo-twinkle 2.6s ease-in-out infinite; }
.md-art .pa-spark:nth-of-type(2) { animation-delay: -0.9s; }
.md-art .pa-spark:nth-of-type(3) { animation-delay: -1.7s; }
.md-pick-card:hover:not(:disabled) .md-art .pa-body { animation: duo-hop 0.5s var(--duo-spring) infinite alternate; }
.md-pick-card.selected .md-art .pa-body { animation: duo-hop 0.7s var(--duo-spring) infinite alternate; }
.md-pick-card:hover:not(:disabled) .md-art { animation: none; }
@keyframes duo-bob { 0%, 100% { transform: translateY(0) scale(1, 1); } 50% { transform: translateY(-1.6px) scale(1.015, 0.99); } }
@keyframes duo-hop { from { transform: translateY(0) scale(1.04, 0.95); } to { transform: translateY(-4px) scale(0.97, 1.04); } }
@keyframes duo-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.08); } }
@keyframes duo-twinkle { 0%, 100% { transform: scale(0.7) rotate(0); opacity: 0.55; } 50% { transform: scale(1.15) rotate(20deg); opacity: 1; } }

/* ---------------------------------------------------------------------------
   18d) SAVED LESSONS ("دروسي المحفوظة") — chip, home section, page, locked guest state
--------------------------------------------------------------------------- */
.duo-saved-chip {
  display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 6px 12px;
  background: #FFFFFF; color: var(--duo-orange-ink); border: 2px solid var(--duo-line); border-radius: 16px;
  box-shadow: 0 3px 0 var(--duo-line); font-family: var(--duo-font-display); font-size: 0.8rem; font-weight: 800; cursor: pointer;
  transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, background-color 0.18s ease, border-color 0.18s ease;
}
.duo-saved-chip svg { width: 18px; height: 18px; }
.duo-saved-chip:hover { background: var(--duo-orange-s); border-color: var(--duo-orange); box-shadow: 0 4px 0 var(--duo-orange-d); transform: translateY(-1px); }
.duo-saved-chip:active { transform: translateY(3px); box-shadow: 0 0 0 transparent; }

.duo-saved-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.duo-saved-title { display: flex; align-items: center; gap: 10px; margin: 0; font-family: var(--duo-font-display); font-size: 1.1rem; font-weight: 800; color: var(--duo-ink); }
.duo-saved-title .ico { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 13px; background: var(--duo-orange); color: #FFFFFF; box-shadow: 0 4px 0 var(--duo-orange-d); }
.duo-saved-title .ico svg { width: 20px; height: 20px; }
.duo-saved-count { padding: 1px 11px; border-radius: 999px; background: var(--duo-yellow); color: var(--duo-yellow-ink); box-shadow: 0 3px 0 var(--duo-yellow-d); font-size: 0.82rem; }
.duo-saved-all { padding: 8px 20px; border-radius: 14px; background: #FFFFFF; color: var(--duo-blue-ink); border: 2px solid var(--duo-line); box-shadow: 0 4px 0 var(--duo-line); font-family: var(--duo-font-display); font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, background-color 0.15s ease; }
.duo-saved-all:hover { background: var(--duo-blue-s); border-color: var(--duo-blue); box-shadow: 0 5px 0 var(--duo-blue-d); transform: translateY(-1px); }
.duo-saved-all:active { transform: translateY(4px); box-shadow: 0 0 0 transparent; }

.duo-saved-list { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr)); }
.duo-saved-card {
  display: flex; align-items: stretch; overflow: hidden; background: #FFFFFF;
  border: 2px solid var(--duo-line); border-radius: 20px; box-shadow: 0 5px 0 var(--duo-line);
  animation: duo-pop 0.5s var(--duo-spring) both;
  transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, border-color 0.18s ease;
}
.duo-saved-card:not(.ghost):hover { border-color: var(--acc); box-shadow: 0 7px 0 var(--acc); transform: translateY(-2px); }
.duo-saved-open { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; padding: 14px; background: transparent; border: 0; text-align: right; color: inherit; font: inherit; cursor: pointer; }
.duo-saved-open:disabled { cursor: not-allowed; opacity: 0.75; }
.duo-saved-badge { flex: none; display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 15px; background: var(--acc); color: #FFFFFF; box-shadow: 0 4px 0 var(--acc-deep); }
.duo-saved-badge svg { width: 22px; height: 22px; }
.duo-saved-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.duo-saved-name { font-family: var(--duo-font-display); font-size: 1rem; font-weight: 800; line-height: 1.35; color: var(--duo-ink); overflow-wrap: anywhere; }
.duo-saved-meta { font-size: 0.76rem; font-weight: 700; color: var(--duo-muted); }
.duo-saved-soon { align-self: flex-start; padding: 1px 10px; border-radius: 999px; background: var(--duo-yellow-s); color: var(--duo-yellow-ink); font-size: 0.72rem; font-weight: 800; }
.duo-saved-go { flex: none; margin-inline-start: auto; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: var(--acc-soft); color: var(--acc-ink); font-size: 1.2rem; font-weight: 800; transition: background-color 0.15s ease, color 0.15s ease; }
.duo-saved-card:hover .duo-saved-go { background: var(--acc); color: #FFFFFF; }
.duo-saved-remove { flex: none; display: flex; align-items: center; justify-content: center; width: 54px; border: 0; border-inline-start: 2px solid var(--duo-line); background: var(--duo-snow); color: var(--duo-orange); cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease, transform 0.14s var(--duo-spring); }
.duo-saved-remove svg { width: 22px; height: 22px; }
.duo-saved-remove:hover { background: var(--duo-red-s); color: var(--duo-red-d); }
.duo-saved-remove:active { transform: scale(0.88); }

.duo-saved-card.ghost { box-shadow: 0 5px 0 var(--duo-line); }
.duo-saved-ghostbadge { flex: none; width: 46px; height: 46px; border-radius: 15px; background: var(--acc-light); opacity: 0.6; }
.duo-saved-bar { display: block; height: 13px; border-radius: 99px; background: linear-gradient(90deg, var(--duo-line) 25%, #F6F6F6 50%, var(--duo-line) 75%); background-size: 220% 100%; animation: duo-shimmer 1.5s linear infinite; }
@keyframes duo-shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }

.duo-saved-locked { position: relative; }
.duo-saved-locked .duo-saved-list { filter: blur(3px); opacity: 0.7; pointer-events: none; user-select: none; }
.duo-saved-lockmsg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 10px; }
.duo-saved-lockbox { display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 340px; padding: 18px 22px; text-align: center; background: #FFFFFF; border: 2px solid var(--duo-line); border-radius: 24px; box-shadow: 0 6px 0 var(--duo-line); animation: duo-pop 0.55s var(--duo-spring) both; }
.duo-saved-lockbox p { margin: 0; font-family: var(--duo-font-display); font-size: 1.05rem; font-weight: 800; color: var(--duo-ink); }
.duo-saved-lockbox small { font-size: 0.8rem; font-weight: 600; color: var(--duo-muted); }
.duo-saved-lockicon { display: flex; align-items: center; justify-content: center; width: 54px; height: 54px; border-radius: 18px; background: var(--duo-orange); color: #FFFFFF; box-shadow: 0 5px 0 var(--duo-orange-d); animation: duo-wiggle 2.6s ease-in-out infinite; }
.duo-saved-empty { padding: 24px 16px; text-align: center; background: var(--duo-snow); border: 3px dashed var(--duo-line-d); border-radius: 22px; color: var(--duo-muted); font-weight: 700; }
.duo-saved-empty b { display: block; margin-bottom: 4px; font-family: var(--duo-font-display); font-size: 1.05rem; color: var(--duo-ink); }

/* /student/saved page */
.duo-saved-hero {
  position: relative; margin: 4px 0 26px; padding: 26px 20px 34px; text-align: center; color: #FFFFFF;
  background:
    radial-gradient(circle at 9% 28%, rgba(255, 255, 255, 0.22) 0 46px, transparent 48px),
    radial-gradient(circle at 92% 70%, rgba(255, 255, 255, 0.16) 0 82px, transparent 84px),
    radial-gradient(circle at 78% 12%, rgba(28, 176, 246, 0.55) 0 24px, transparent 26px),
    linear-gradient(180deg, #FFA928 0%, #FF9600 100%);
  border-radius: 0 0 clamp(34px, 6vw, 60px) clamp(34px, 6vw, 60px); box-shadow: 0 8px 0 var(--duo-orange-d);
}
.duo-saved-hero > * { animation: duo-pop 0.65s var(--duo-spring) both; }
.duo-saved-hero > *:nth-child(2) { animation-delay: 0.08s; } .duo-saved-hero > *:nth-child(3) { animation-delay: 0.16s; }
.duo-saved-hero-ico { display: inline-flex; align-items: center; justify-content: center; width: 70px; height: 70px; margin-bottom: 8px; border-radius: 24px; background: #FFFFFF; color: var(--duo-orange); box-shadow: 0 6px 0 rgba(0, 0, 0, 0.18); }
.duo-saved-hero-ico svg { width: 36px; height: 36px; }
.duo-saved-hero h1 { margin: 0; font-family: var(--duo-font-display); font-size: clamp(1.7rem, 5vw, 2.3rem); font-weight: 800; color: #FFFFFF; text-shadow: 0 4px 0 rgba(0, 0, 0, 0.14); }
.duo-saved-hero p { margin: 6px 0 0; font-weight: 700; opacity: 0.96; }
.duo-saved-main { width: 100%; max-width: 920px; margin: 0 auto; padding: 0 16px 36px; flex: 1; }
/* ---------------------------------------------------------------------------

/* ---------------------------------------------------------------------------
   Grade / stage picker polish ("اختر صفك الدراسي")
   Paste inside DUO_CSS (duoTheme.js), right after section "9) STAGE / GRADE PICKER"
   (after the .md-pick-card.selected .md-pick-num rule, ~line 315).
   No backticks / dollar-brace sequences, so it is safe inside the template literal.
--------------------------------------------------------------------------- */
.md-pick-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.md-pick-head-icon {
  flex: none; display: inline-flex; align-items: center; justify-content: center;
  width: 56px; height: 56px; border-radius: 18px; font-size: 1.75rem;
  background: var(--duo-yellow-s); border: 2px solid var(--duo-yellow); box-shadow: 0 4px 0 var(--duo-yellow-d);
  animation: duo-pop 0.5s var(--duo-spring) both;
}
.md-pick-head h2 { margin: 0 0 3px !important; font-family: var(--duo-font-display); font-size: 1.3rem !important; }
.md-pick-head p { margin: 0 !important; line-height: 1.8; }

.md-pick-label {
  display: flex; align-items: center; gap: 10px; margin: 6px 0 12px !important;
  color: var(--duo-ink-soft) !important; font-family: var(--duo-font-display); font-size: 0.95rem !important; font-weight: 800;
}
.md-pick-label::after { content: ""; flex: 1; height: 2px; border-radius: 2px; background: var(--duo-line); }

/* bigger, fluid cards so the drawings can breathe (desktop: fills the panel, no empty strip) */
@media (min-width: 641px) {
  .md-pick-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
}
@media (max-width: 640px) {
  .md-pick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .md-pick-card { padding: 10px 10px 14px; }
}
.md-pick-art { aspect-ratio: 1 / 0.92; }
.md-pick-art .md-art { width: 94%; height: 94%; }
.md-pick-title { font-size: 1.02rem; }

/* clear "this is your pick" tick on the selected card */
.md-pick-card.selected::after {
  content: "✓"; position: absolute; top: 8px; inset-inline-end: 8px; z-index: 1;
  display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%;
  background: #FFFFFF; color: var(--acc-ink); font-size: 0.95rem; font-weight: 900; box-shadow: 0 3px 0 rgba(0, 0, 0, 0.15);
  animation: duo-pop 0.4s var(--duo-spring) both;
}
@media (prefers-reduced-motion: reduce) {
  .md-pick-head-icon, .md-pick-card.selected::after { animation: none !important; }
}
  
   Guest lock — dimmed dashboard (60%) with one sign-in card in front.
   Paste inside DUO_CSS, right after the duo-facts block (before the final
   @media (max-width: 640px) block). No backticks / dollar-brace sequences.
--------------------------------------------------------------------------- */
.duo-guest-lock { display: grid; margin-bottom: 24px; }
.duo-guest-lock-body { grid-area: 1 / 1; opacity: 0.6; pointer-events: none; user-select: none; }
.duo-guest-lock-card {
  grid-area: 1 / 1; align-self: start; justify-self: center;
  position: sticky; top: 22vh; z-index: 6;
  width: min(92%, 420px); margin-top: 90px; padding: 22px 22px 24px; text-align: center;
  border-radius: 24px; background: #FFFFFF;
  border: 2px solid var(--duo-line); box-shadow: 0 6px 0 var(--duo-line-d);
  animation: duo-pop 0.5s var(--duo-spring) both;
}
.duo-guest-lock-icon { display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 54px; margin-bottom: 8px; border-radius: 18px; font-size: 1.6rem; background: var(--duo-yellow-s); border: 2px solid var(--duo-yellow); box-shadow: 0 4px 0 var(--duo-yellow-d); }
.duo-guest-lock-card h3 { margin: 0 0 6px; color: var(--duo-green-ink); font-family: var(--duo-font-display); font-size: 1.15rem; font-weight: 800; }
.duo-guest-lock-card p { margin: 0 0 14px; color: var(--duo-ink-soft); font-size: 0.92rem; line-height: 1.8; }
@media (max-width: 640px) {
  .duo-guest-lock-card { margin-top: 60px; padding: 18px 16px 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .duo-guest-lock-card { animation: none !important; }
}
  
/* ---------------------------------------------------------------------------
   "هل تعلم؟" — student card (.duo-dyk-*) + teacher page /teacher/facts (.duo-tf-*)
   Paste inside DUO_CSS (duoTheme.js), before the final @media (max-width: 640px) block.
   Contains no backticks or dollar-brace sequences, so it is safe inside the template literal.
--------------------------------------------------------------------------- */

/* ---- student card: art + speech bubble ---------------------------------- */
.duo-dyk { display: flex; align-items: center; gap: 18px; }
.duo-dyk-art { flex: 0 0 auto; width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; animation: duo-pop 0.5s var(--duo-spring) both; }
.duo-dyk-art .md-art { width: 100%; height: 100%; }
.duo-dyk-bubble {
  position: relative; flex: 1 1 auto; min-width: 0;
  padding: 16px 20px; border-radius: 22px;
  background: var(--acc-soft, var(--duo-yellow-s));
  border: 2px solid var(--acc, var(--duo-yellow));
  box-shadow: 0 5px 0 var(--acc-deep, var(--duo-yellow-d));
  animation: duo-slide-up 0.5s var(--duo-spring) both;
}
/* tail pointing at the art (page is RTL → art is on the right) */
.duo-dyk-bubble::before {
  content: ""; position: absolute; top: 50%; right: -9px; width: 16px; height: 16px;
  background: var(--acc-soft, var(--duo-yellow-s));
  border-top: 2px solid var(--acc, var(--duo-yellow)); border-right: 2px solid var(--acc, var(--duo-yellow));
  border-radius: 0 4px 0 0; transform: translateY(-50%) rotate(45deg);
}
.duo-dyk-tag {
  display: inline-block; margin-bottom: 6px; padding: 2px 12px; border-radius: 999px;
  background: var(--acc, var(--duo-yellow)); color: var(--acc-ink, var(--duo-yellow-ink));
  font-family: var(--duo-font-display); font-size: 0.85rem; font-weight: 800;
}
.duo-dyk-text { margin: 0; color: var(--duo-ink); font-size: 1.02rem; font-weight: 700; line-height: 1.85; overflow-wrap: anywhere; }
/* guest teaser */
.duo-dyk.locked .duo-dyk-art { filter: grayscale(0.55); opacity: 0.85; }
.duo-dyk.locked .duo-dyk-bubble { background: var(--duo-snow); border-color: var(--duo-line); box-shadow: 0 5px 0 var(--duo-line); }
.duo-dyk.locked .duo-dyk-bubble::before { background: var(--duo-snow); border-color: var(--duo-line); }
.duo-dyk.locked .duo-dyk-tag { background: var(--duo-line); color: var(--duo-muted); }
.duo-dyk.locked .duo-dyk-text { color: var(--duo-ink-soft); }

/* ---- teacher page ------------------------------------------------------- */
.duo-tf { min-height: 100vh; background: #FFFFFF; }
.duo-tf-wrap { max-width: 760px; margin: 0 auto; padding: 24px 16px 64px; }
.duo-tf-back { display: inline-block; margin-bottom: 14px; color: var(--duo-blue-ink); font-family: var(--duo-font-display); font-weight: 800; text-decoration: none; transition: transform 0.15s var(--duo-spring), color 0.15s ease; }
.duo-tf-back:hover { color: var(--duo-blue-d); transform: translateX(3px); }

.duo-tf-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
.duo-tf-bulb { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 18px; font-size: 1.8rem; background: var(--duo-yellow-s); border: 2px solid var(--duo-yellow); box-shadow: 0 4px 0 var(--duo-yellow-d); }
.duo-tf-head h1 { margin: 0 0 4px; color: var(--duo-green-ink); font-family: var(--duo-font-display); font-size: 1.6rem; font-weight: 800; }
.duo-tf-head p { margin: 0; color: var(--duo-ink-soft); font-size: 0.92rem; line-height: 1.8; }

.duo-tf-card { margin-bottom: 18px; padding: 20px; border-radius: 22px; background: #FFFFFF; border: 2px solid var(--duo-line); box-shadow: 0 5px 0 var(--duo-line); }
.duo-tf-card h2, .duo-tf-listhead h2 { margin: 0 0 12px; color: var(--duo-ink); font-family: var(--duo-font-display); font-size: 1.1rem; font-weight: 800; }
.duo-tf-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.duo-tf-field > span { color: var(--duo-ink-soft); font-family: var(--duo-font-display); font-size: 0.92rem; font-weight: 800; }
.duo-tf-field > small { align-self: flex-end; color: var(--duo-muted); font-size: 0.78rem; }
.duo-tf-field .ts-input { width: 100%; }
.duo-tf-field textarea.ts-input { resize: vertical; min-height: 84px; line-height: 1.8; }
.duo-tf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.duo-tf-check { display: inline-flex; align-items: center; gap: 8px; margin: 2px 0 14px; cursor: pointer; color: var(--duo-ink-soft); font-weight: 700; }
.duo-tf-check input { width: 20px; height: 20px; accent-color: var(--duo-green); cursor: pointer; }
.duo-tf-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.duo-tf-msg { color: var(--duo-green-ink); font-family: var(--duo-font-display); font-weight: 800; animation: duo-fade 0.3s ease both; }

.duo-tf-listhead { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 6px 0 12px; }
.duo-tf-listhead h2 { margin: 0; }
.duo-tf-empty { padding: 28px 16px; text-align: center; border-radius: 20px; border: 2px dashed var(--duo-line-d); background: var(--duo-snow); color: var(--duo-muted); font-weight: 700; }
.duo-tf-list { display: flex; flex-direction: column; gap: 12px; margin: 0; padding: 0; list-style: none; }
.duo-tf-item { padding: 14px 16px; border-radius: 20px; background: #FFFFFF; border: 2px solid var(--duo-line); box-shadow: 0 4px 0 var(--duo-line); transition: transform 0.15s var(--duo-spring), box-shadow 0.15s ease; }
.duo-tf-item:hover { transform: translateY(-2px); box-shadow: 0 6px 0 var(--duo-line); }
.duo-tf-item.off { background: var(--duo-snow); }
.duo-tf-item.off .duo-tf-body { color: var(--duo-muted); }
.duo-tf-body { margin: 0 0 10px; color: var(--duo-ink); font-weight: 700; line-height: 1.85; overflow-wrap: anywhere; }
.duo-tf-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.duo-tf-spacer { flex: 1 1 auto; }
.duo-tf-badge { padding: 2px 11px; border-radius: 999px; background: var(--duo-blue-s); color: var(--duo-blue-ink); font-size: 0.8rem; font-weight: 800; }
.duo-tf-badge.off { background: var(--duo-line); color: var(--duo-muted); }
.duo-tf-mini { padding: 5px 14px; border-radius: 12px; cursor: pointer; background: #FFFFFF; color: var(--duo-ink-soft); border: 2px solid var(--duo-line); box-shadow: 0 3px 0 var(--duo-line); font-family: var(--duo-font-display); font-size: 0.85rem; font-weight: 800; transition: transform 0.14s var(--duo-spring), box-shadow 0.14s ease, border-color 0.15s ease, color 0.15s ease; }
.duo-tf-mini:hover { border-color: var(--duo-blue); color: var(--duo-blue-ink); box-shadow: 0 3px 0 var(--duo-blue-d); }
.duo-tf-mini:active { transform: translateY(3px); box-shadow: 0 0 0 transparent; }
.duo-tf-mini.danger:hover { background: var(--duo-red-s); border-color: var(--duo-red); color: var(--duo-red-d); box-shadow: 0 3px 0 var(--duo-red-d); }

@media (max-width: 640px) {
  .duo-dyk { flex-direction: column; align-items: stretch; gap: 14px; }
  .duo-dyk-art { width: 76px; height: 76px; align-self: center; }
  .duo-dyk-bubble::before { top: -9px; right: 50%; transform: translateX(50%) rotate(-45deg); }
  .duo-tf-row { grid-template-columns: 1fr; }
  .duo-tf-head h1 { font-size: 1.35rem; }
}
@media (prefers-reduced-motion: reduce) {
  .duo-dyk-art, .duo-dyk-bubble, .duo-tf-msg { animation: none !important; }
  .duo-tf-item, .duo-tf-mini, .duo-tf-back { transition: none !important; }
}

/* ---------------------------------------------------------------------------
   19) RESPONSIVE TUNING
--------------------------------------------------------------------------- */
@media (max-width: 640px) {
  .md-lessons .md-lessons-grid::before { inset-inline-start: 31px; }
  .md-lesson-card { padding-inline-start: 68px; border-radius: 20px; }
  .md-lesson-card::after { width: 44px; height: 44px; inset-inline-start: 9px; font-size: 0.98rem; }
  .md-lesson-card[data-kind="COMPLETED"]::after { font-size: 1.3rem; }
  .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta { padding: 0; background: transparent; box-shadow: none; }
  .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta span { background: var(--duo-green); color: #FFFFFF; box-shadow: 0 3px 0 var(--duo-green-d); }
  .md-chip { min-height: 44px; }
  .md-unit-card::before { width: 38px; height: 38px; font-size: 0.95rem; }
  .md-column { width: 16px; } .md-column-shaft { width: 16px; } .md-frieze-inner { gap: 8px; }
  .md-assistant-bubble { width: 56px; height: 56px; }
  .md-jp { padding: 12px 14px 14px; }
}

/* ---------------------------------------------------------------------------
   20) REDUCED MOTION — keep the colors, drop the movement
--------------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .md-page-enter, .md-hero > *, .md-pick-card, .md-lesson-card::after, .md-column-shaft, .md-badge::before,
  .md-split-empty-icon, .md-jp-seg.current, .md-spinner-rose, .md-assistant-tooltip, .md-topbar div.absolute,
  .md-lesson-page .md-lv-hero > *, .md-lesson-page .md-lv-notice, .duo-routebar, .duo-routebar i,
  .duo-saved-card, .duo-saved-lockbox, .duo-saved-lockicon, .duo-saved-bar, .duo-saved-hero > *,
  .duo-overlay, .duo-modal, .duo-banner, .md-art .pa-body, .md-art .pa-eye, .md-art .pa-spark { animation: none !important; }
  .duo-splash { display: none !important; }
  .md-chip, .md-unit-card, .md-lesson-card, .md-pick-card, .md-feature, .md-recent-chip { transition: none !important; }
}
`;

export default DUO_CSS;