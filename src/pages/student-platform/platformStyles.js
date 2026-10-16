// All CSS of the student home page (moved verbatim from StudentPlatform.jsx).
export const PLATFORM_CSS = `
  :root {
    /* =========================
       MADAR — EDUCATIONAL PREMIUM
       White + Deep Petrol + Calm Teal + Heritage Gold
       ========================= */
    --md-bg: #FFFFFF;
    --md-surface: #FFFFFF;
    --md-surface-2: #EEF6F3;
    --md-surface-3: #E4F2EE;

    --md-teal: #1E8C7A;
    --md-teal-deep: #147A6A;
    --md-teal-dark: #0E5348;
    --md-teal-mid: #3E9A8A;
    --md-teal-light: #A9D6CB;
    --md-teal-soft: #E4F2EE;

    --md-gold: #C9812F;
    --md-gold-deep: #9C5F1C;
    --md-gold-light: #E3C08B;
    --md-gold-soft: #F8EFDD;

    --md-text: #22302C;
    --md-text-soft: #3F4E49;
    --md-muted: #6B7A75;
    --md-muted-light: #9DB0A9;

    --md-border: #DCE9E4;
    --md-border-strong: #BBD8CF;

    --md-shadow-sm:
      0 2px 8px rgba(14, 83, 72, 0.06);
    --md-shadow-md:
      0 10px 28px rgba(14, 83, 72, 0.10);
    --md-shadow-lg:
      0 20px 50px rgba(14, 83, 72, 0.14);

    --md-radius: 22px;
    --md-radius-lg: 30px;

    /* chunky "pressable" depth for primary buttons — playful app feel */
    --md-depth: 4px;
    --md-depth-deep: #0E5348;
    --md-depth-gold: #9C5F1C;
  }

  /* =========================
     HERO LOGO
     ========================= */
  .md-hero-logo-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 26px;
    position: relative;
  }

  .md-hero-logo-wrap::before {
    content: "";
    position: absolute;
    width: 170px;
    height: 170px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.20), rgba(255, 255, 255, 0.05) 50%, transparent 72%);
    z-index: -1;
  }

  .md-hero-logo {
    height: 58px;
    width: auto;
    object-fit: contain;
    box-sizing: content-box;
    padding: 14px 26px;
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22), 0 0 0 6px rgba(255, 255, 255, 0.10);
    transition: transform 0.35s ease, box-shadow 0.35s ease;
  }

  .md-hero-logo:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.28), 0 0 0 8px rgba(255, 255, 255, 0.12);
  }

  /* =========================
     PLATFORM
     ========================= */
  .md-platform {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(
        circle at 50% -8%,
        rgba(30, 140, 122, 0.045),
        transparent 40%
      ),
      radial-gradient(
        circle at 92% 18%,
        rgba(30, 140, 122, 0.03),
        transparent 42%
      ),
      radial-gradient(
        circle at 8% 78%,
        rgba(201, 129, 47, 0.025),
        transparent 38%
      ),
      #FFFFFF;
    color: var(--md-text);
    font-family:
      "Segoe UI",
      "Cairo",
      "Noto Sans Arabic",
      system-ui,
      sans-serif;
    position: relative;
    overflow-x: hidden;
    overflow-x: clip;
    direction: rtl;
  }

  .md-main {
    flex: 1;
    position: relative;
    z-index: 2;
    --md-main-pb: 72px;
    max-width: 1040px;
    margin: 0 auto;
    padding: 0 20px var(--md-main-pb);
  }

  /* =========================
     BACKGROUND
     ========================= */
  .md-bg-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
    transition: transform 0.4s ease-out;
  }

  .md-galaxy {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .md-nebula {
    position: absolute;
    width: 80vmin;
    height: 80vmin;
    border-radius: 50%;
    background:
      radial-gradient(
        circle,
        rgba(30, 140, 122, 0.06) 0%,
        rgba(30, 140, 122, 0.028) 35%,
        transparent 68%
      );
    filter: blur(38px);
  }

  .md-bg-layer::before,
  .md-bg-layer::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .md-bg-layer::before {
    width: 440px;
    height: 440px;
    top: -230px;
    right: -190px;
    background:
      radial-gradient(
        circle,
        rgba(30, 140, 122, 0.08),
        transparent 70%
      );
  }

  .md-bg-layer::after {
    width: 340px;
    height: 340px;
    bottom: -170px;
    left: -150px;
    background:
      radial-gradient(
        circle,
        rgba(201, 129, 47, 0.05),
        transparent 70%
      );
  }

  /* =========================
     STARS
     ========================= */
  .md-star {
    position: absolute;
    border-radius: 50%;
    background: var(--md-teal);
    opacity: 0.22;
    box-shadow: 0 0 6px rgba(30, 140, 122, 0.25);
  }

  .md-star.twinkle {
    animation: twinkle 4.5s ease-in-out infinite;
  }

  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.12;
      transform: scale(1);
    }
    50% {
      opacity: 0.38;
      transform: scale(1.28);
    }
  }

  /* =========================
     ORBITS
     ========================= */
  .md-orbit {
    position: absolute;
    border: 1px solid rgba(30, 140, 122, 0.14);
    border-radius: 50%;
    opacity: 0.28;
    animation: spin linear infinite;
    transition:
      opacity 0.45s ease,
      border-color 0.45s ease,
      box-shadow 0.45s ease;
  }

  .md-orbit.active {
    opacity: 0.95;
    border-color: rgba(201, 129, 47, 0.78);
    box-shadow:
      0 0 20px rgba(201, 129, 47, 0.14),
      inset 0 0 16px rgba(201, 129, 47, 0.04);
  }

  .md-planet {
    position: absolute;
    top: -5px;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform: translateX(-50%);
    background:
      radial-gradient(
        circle at 35% 30%,
        var(--md-gold-light),
        var(--md-gold) 55%,
        var(--md-gold-deep)
      );
    box-shadow:
      0 0 0 3px rgba(201, 129, 47, 0.08),
      0 0 10px rgba(201, 129, 47, 0.14);
    opacity: 0.55;
    transition:
      box-shadow 0.4s ease,
      opacity 0.4s ease;
  }

  .md-orbit.active .md-planet {
    opacity: 1;
    box-shadow:
      0 0 0 4px rgba(201, 129, 47, 0.18),
      0 0 18px rgba(201, 129, 47, 0.32),
      0 0 28px rgba(201, 129, 47, 0.12);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* =========================
     ATLAS
     ========================= */
  .md-atlas {
    position: absolute;
    bottom: 8%;
    left: 50%;
    transform: translateX(-50%);
    width: min(680px, 92vw);
    opacity: 0.04;
    filter:
      grayscale(1)
      sepia(0.12);
  }

  .md-atlas-svg {
    width: 100%;
    height: auto;
  }

  /* =========================
     COMPASS
     ========================= */
  .md-corner-compass {
    position: fixed;
    top: 28px;
    left: 28px;
    width: 64px;
    height: 64px;
    color: var(--md-gold);
    opacity: 0.24;
    z-index: 5;
    pointer-events: none;
    filter:
      drop-shadow(0 4px 10px rgba(201, 129, 47, 0.12));
  }

  /* =========================
     HERO
     ========================= */
  /* Full-bleed "orbit" hero: deep teal band with concentric rings */
  .md-hero {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100vw;
    margin: 0 calc(50% - 50vw);
    padding: clamp(44px, 7vw, 84px) 20px clamp(96px, 12vw, 128px);
    text-align: center;
    background:
      radial-gradient(circle at 82% 8%, rgba(227, 192, 139, 0.20), transparent 38%),
      linear-gradient(160deg, var(--md-teal-dark) 0%, var(--md-teal-deep) 55%, var(--md-teal) 130%);
    border-radius: 0 0 clamp(22px, 6vw, 72px) clamp(22px, 6vw, 72px);
    box-shadow: 0 24px 60px rgba(14, 83, 72, 0.22);
  }

  .md-hero > * {
    position: relative;
    z-index: 1;
    animation: md-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .md-hero > *:nth-child(2) { animation-delay: 0.06s; }
  .md-hero > *:nth-child(3) { animation-delay: 0.12s; }
  .md-hero > *:nth-child(4) { animation-delay: 0.18s; }

  .md-hero::before,
  .md-hero::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 46%;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  .md-hero::before {
    width: min(820px, 150vw);
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    border: 1px solid rgba(255, 255, 255, 0.10);
    box-shadow:
      0 0 0 clamp(48px, 8vw, 90px) rgba(255, 255, 255, 0.025),
      0 0 0 clamp(96px, 16vw, 180px) rgba(255, 255, 255, 0.018);
  }

  .md-hero::after {
    width: min(520px, 110vw);
    aspect-ratio: 1;
    border: 1px dashed rgba(227, 192, 139, 0.38);
    transform: translate(-50%, -50%);
    animation: md-orbit-turn 120s linear infinite;
  }

  @keyframes md-orbit-turn {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes md-rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .md-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 7px 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: var(--md-gold-light);
    font-size: 0.85rem;
    font-weight: 700;
    margin-bottom: 20px;
    border: 1px solid rgba(227, 192, 139, 0.45);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .md-badge::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--md-gold-light);
    box-shadow: 0 0 0 3px rgba(227, 192, 139, 0.22);
  }

  .md-hero h1 {
    font-size: clamp(2.2rem, 6.5vw, 3.8rem);
    font-weight: 900;
    line-height: 1.25;
    margin: 0 auto 18px;
    max-width: 16em;
    color: #FFFFFF;
    background: none;
    -webkit-text-fill-color: #FFFFFF;
    text-wrap: balance;
  }

  .md-hero p {
    color: rgba(255, 255, 255, 0.82);
    font-size: clamp(1rem, 2.4vw, 1.18rem);
    line-height: 2;
    margin: 0 auto;
    max-width: 36em;
    text-wrap: balance;
  }

  /* =========================
     ALERT
     ========================= */
  .md-alert {
    padding: 14px 18px;
    border-radius: 14px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
    box-shadow: var(--md-shadow-sm);
  }

  .md-alert.error {
    background: #F8EAE6;
    border: 1px solid #EFCFC8;
    color: #A8443A;
  }

  /* =========================
     LOADING
     ========================= */
  .md-loading {
    display: flex;
    justify-content: center;
    padding: 60px 0;
  }

  .md-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .md-spinner-rose {
    width: 56px;
    height: 56px;
    color: var(--md-teal);
    animation: spin 4s linear infinite;
  }

  .md-spinner-text {
    color: var(--md-muted);
    font-size: 0.9rem;
  }

  /* =========================
     JOURNEY
     ========================= */
  /* Journey = an open vertical timeline (no boxes) */
  .md-journey {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 44px;
    animation: md-rise 0.6s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .md-journey-meta {
    width: fit-content;
    max-width: 100%;
    gap: 10px;
    padding: 8px 8px 8px 18px;
    margin-bottom: 30px !important;
    border-radius: 999px;
    background: var(--md-teal-soft);
    border: 1px solid rgba(30, 140, 122, 0.16);
    font-size: 0.85rem !important;
  }

  .md-link-btn {
    padding: 4px 14px;
    border-radius: 999px;
    background: #FFFFFF;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .md-link-btn:hover {
    background: var(--md-teal);
    color: #FFFFFF !important;
    text-decoration: none;
  }

  .md-step {
    display: flex;
    gap: clamp(16px, 3vw, 28px);
    padding: 4px 0;
  }

  .md-step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 44px;
    flex-shrink: 0;
  }

  .md-step-number {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.05rem;
    background: #FFFFFF;
    border: 1.5px solid var(--md-border-strong);
    color: var(--md-muted);
    transition: all 0.3s ease;
  }

  .md-step.done .md-step-number {
    background: linear-gradient(135deg, var(--md-teal), var(--md-teal-deep));
    border-color: var(--md-teal-deep);
    color: #FFFFFF;
    box-shadow: 0 8px 20px rgba(14, 83, 72, 0.22);
  }

  .md-step.active .md-step-number {
    border-color: var(--md-gold);
    color: var(--md-gold-deep);
    background: var(--md-gold-soft);
    box-shadow: 0 0 0 6px rgba(201, 129, 47, 0.12);
  }

  .md-step-line {
    width: 2px;
    flex: 1;
    margin-top: 8px;
    min-height: 32px;
    border-radius: 2px;
    background: repeating-linear-gradient(180deg, var(--md-border-strong) 0 6px, transparent 6px 12px);
  }

  .md-step:last-child .md-step-line {
    display: none;
  }

  .md-step-content {
    flex: 1;
    min-width: 0; /* عشان النص ميتقطعش */
    padding-bottom: 36px;
  }

  .md-step-label {
    display: block;
    width: 100%;
    margin-bottom: 16px;
    font-size: 1.25rem;
    font-weight: 900;
    line-height: 44px;
    color: var(--md-text-soft);
  }

  .md-step.active .md-step-label { color: var(--md-gold-deep); }
  .md-step.done .md-step-label { color: var(--md-teal-deep); }

  /* =========================
     CHIPS
     ========================= */
  .md-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .md-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 46px;
    padding: 10px 22px;
    border-radius: 999px;
    background: #FFFFFF;
    border: 1.5px solid var(--md-border-strong);
    color: var(--md-text-soft);
    font-size: 0.98rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  }

  .md-chip:hover {
    border-color: var(--md-teal);
    background: var(--md-teal-soft);
    transform: translateY(-2px);
  }

  .md-chip.selected {
    background: var(--md-teal-deep);
    border-color: var(--md-teal-deep);
    color: #FFFFFF;
    box-shadow: 0 10px 24px rgba(14, 83, 72, 0.24);
  }

  .md-chip.selected::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--md-gold-light);
  }

  .md-chip:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .md-chip:focus-visible,
  .md-unit-card:focus-visible,
  .md-lesson-card:focus-visible,
  .md-continue-btn:focus-visible,
  .md-recent-chip:focus-visible {
    outline: 3px solid rgba(227, 192, 139, 0.6);
    outline-offset: 3px;
  }

  .md-empty {
    color: var(--md-muted);
    font-size: 0.95rem;
    margin: 0;
    padding: 16px 20px;
    border-radius: 16px;
    background: var(--md-surface-2);
    border: 1px dashed var(--md-border-strong);
  }

  /* =========================
     TOP BAR
     ========================= */
  .md-topbar {
    position: sticky;
    top: 0;
    z-index: 40 !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    background: rgba(255, 255, 255, 0.82) !important;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--md-border);
  }

  .md-account-btn { min-height: 44px; transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .md-account-btn:hover { box-shadow: var(--md-shadow-md); transform: translateY(-1px); }

  .md-topbar .md-login-btn {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 22px;
    border-radius: 16px !important;
    font-size: 0.82rem;
    box-shadow: 0 2px 0 var(--md-depth-deep);
    transition: transform 0.1s ease, box-shadow 0.1s ease, filter 0.15s ease;
  }

  .md-topbar .md-login-btn:hover { filter: brightness(1.06); }

  .md-topbar .md-login-btn:active {
    transform: translateY(2px);
    box-shadow: 0 0 0 var(--md-depth-deep);
  }

  /* =========================
     DASHBOARD — floating cards over the hero, then open sections
     ========================= */
  .md-dashboard {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 34px;
    margin-top: 40px;
    margin-bottom: 0 !important;
  }

  .md-hero + .md-dashboard:has(> .md-continue),
  .md-hero + .md-dashboard:has(> .md-panel) {
    margin-top: calc(-1 * clamp(56px, 8vw, 76px));
  }

  .md-dashboard > .md-continue { margin-bottom: 0 !important; }
  .md-dashboard > div.mt-4 { margin-top: 0 !important; }

  .md-panel {
    position: relative;
    overflow: hidden;
    border-radius: 20px !important;
    padding: clamp(24px, 4vw, 40px) !important;
    border: 1.5px solid var(--md-border) !important;
    background: #FFFFFF !important;
    box-shadow: 0 3px 0 var(--md-border), 0 10px 26px rgba(14, 83, 72, 0.10) !important;
  }

  .md-panel::before,
  .md-continue::before {
    content: "";
    position: absolute;
    inset-inline: 0;
    top: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--md-teal), var(--md-gold));
  }

  .md-panel h2 {
    font-size: 1.5rem;
    font-weight: 900;
    margin-bottom: 6px;
  }

  .md-continue {
    position: relative;
    overflow: hidden;
    border-radius: 20px !important;
    padding: clamp(22px, 3.5vw, 32px) clamp(22px, 4vw, 40px) !important;
    background: #FFFFFF !important;
    border: 1.5px solid var(--md-teal-soft) !important;
    box-shadow: 0 3px 0 var(--md-teal-soft), 0 10px 26px rgba(14, 83, 72, 0.10) !important;
  }

  .md-continue .font-black {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    line-height: 1.5;
    color: var(--md-teal-deep) !important;
  }

  .md-continue .md-continue-btn {
    padding: 14px 28px;
    border-radius: 13px !important;
    font-size: 0.95rem;
    box-shadow: 0 3px 0 var(--md-depth-deep);
    transition: transform 0.1s ease, box-shadow 0.1s ease, filter 0.15s ease;
  }

  .md-continue .md-continue-btn:hover { filter: brightness(1.05); }

  .md-continue .md-continue-btn:active {
    transform: translateY(3px);
    box-shadow: 0 0 0 var(--md-depth-deep);
  }

  .md-dashboard .md-section-label {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 0.82rem;
    font-weight: 800;
    margin-bottom: 16px !important;
    color: var(--md-teal-deep) !important;
  }

  .md-dashboard .md-section-label::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--md-border);
  }

  .md-dashboard .md-recent-chip {
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 0.85rem;
    background: var(--md-surface-2);
    border-color: var(--md-border) !important;
    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  }

  .md-dashboard .md-recent-chip:hover {
    background: var(--md-teal-soft);
    border-color: var(--md-teal) !important;
    transform: translateY(-2px);
  }

  /* progress: open rows with hairlines, not boxes */
  .md-dashboard .md-progress-grid {
    gap: 8px clamp(28px, 5vw, 56px);
  }

  .md-progress-row {
    padding: 4px 0 18px !important;
    border: 0 !important;
    border-bottom: 1px solid var(--md-border) !important;
    border-radius: 0 !important;
    background: transparent !important;
    font-size: 0.86rem;
    line-height: 1.8;
  }

  .md-progress-row p:first-child {
    font-size: 1.05rem;
    font-weight: 900;
  }

  .md-progress-row .md-progress-track {
    height: 6px !important;
    margin-top: 12px !important;
    overflow: hidden;
    border-radius: 999px;
  }

  .md-progress-fill {
    background-image: linear-gradient(90deg, var(--md-teal), var(--md-gold)) !important;
    transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* =========================
     COMING-SOON ASSISTANT BUBBLE
     ========================= */
  .md-assistant-wrap {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .md-assistant-bubble {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 1.5px solid rgba(30, 140, 122, 0.25);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFFFFF;
    box-shadow: 0 8px 22px rgba(14, 83, 72, 0.28);
    animation: md-assistant-float 2.6s ease-in-out infinite;
  }

  .md-assistant-bubble:hover {
    box-shadow: 0 10px 26px rgba(14, 83, 72, 0.34);
  }

  .md-assistant-bubble-logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
    pointer-events: none;
  }

  @keyframes md-assistant-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .md-assistant-bubble { animation: none; }
  }

  .md-assistant-tooltip {
    max-width: 200px;
    background: #FFFFFF;
    border: 1px solid var(--md-border);
    border-radius: 14px;
    padding: 10px 14px;
    text-align: right;
    box-shadow: 0 8px 20px rgba(14, 83, 72, 0.14);
  }

  .md-assistant-tooltip-title {
    margin: 0 0 2px;
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--md-teal-deep);
  }

  .md-assistant-tooltip-body {
    margin: 0;
    font-size: 0.78rem;
    color: var(--md-muted);
  }

  /* =========================
     UNIT CARDS + LESSON PREVIEW
     ========================= */
  /* Units = numbered editorial list, hairline separated */
  .md-units-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 clamp(28px, 5vw, 56px);
    counter-reset: unit;
    align-items: start;
  }

  .md-unit-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 6px 0 16px;
    border-bottom: 1px solid var(--md-border);
    counter-increment: unit;
  }

  .md-unit-card {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 68px;
    padding: 12px 16px;
    border-radius: 14px;
    /* visible button surface so students recognise it as clickable */
    background: #FFFFFF;
    border: 2.5px solid var(--md-border-strong);
    box-shadow: 0 2px 0 var(--md-border-strong);
    cursor: pointer;
    text-align: right;
    transition: background 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }

  /* arrow affordance (points forward in RTL, turns down when the unit is open) */
  .md-unit-card::after {
    content: "‹";
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--md-teal-soft);
    color: var(--md-teal-deep);
    font-size: 1.4rem;
    font-weight: 900;
    line-height: 1;
    padding-bottom: 3px;
    transition: transform 0.22s ease, background 0.22s ease, color 0.22s ease;
  }

  .md-unit-card::before {
    content: counter(unit, decimal-leading-zero);
    flex-shrink: 0;
    font-size: 1.9rem;
    font-weight: 900;
    line-height: 1;
    color: var(--md-gold-light);
    opacity: 0.85;
    font-variant-numeric: tabular-nums;
  }

  .md-unit-card:hover {
    background: var(--md-teal-soft);
    border-color: var(--md-teal);
    box-shadow: 0 2px 0 var(--md-teal);
    transform: translateX(-4px);
  }

  .md-unit-card:hover::after {
    background: var(--md-teal);
    color: #FFFFFF;
  }

  .md-unit-card.selected {
    background: linear-gradient(135deg, var(--md-teal-deep), var(--md-teal-dark));
    border-color: var(--md-teal-dark);
    box-shadow: 0 2px 0 var(--md-teal-dark);
    transform: none;
  }

  .md-unit-card.selected::after {
    background: rgba(255, 255, 255, 0.16);
    color: #FFFFFF;
    transform: rotate(-90deg);
  }

  .md-unit-card.selected::before { color: var(--md-gold-light); opacity: 1; }

  .md-unit-card-title {
    flex: 1;
    font-weight: 800;
    font-size: 1.08rem;
    line-height: 1.5;
    color: var(--md-text);
  }

  .md-unit-card.selected .md-unit-card-title { color: #FFFFFF; }

  .md-unit-card-count {
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--md-teal-deep);
    background: var(--md-teal-soft);
    padding: 5px 12px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .md-unit-card.selected .md-unit-card-count {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.16);
  }

  .md-unit-preview {
    list-style: none;
    margin: 0 30px 0 0;
    padding: 0 16px 0 0;
    border-inline-start: 1.5px solid var(--md-gold-light);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .md-unit-preview li {
    font-size: 0.86rem;
    color: var(--md-text-soft);
    line-height: 1.7;
  }

  .md-unit-preview-num {
    color: var(--md-teal-deep);
    font-weight: 800;
  }

  /* =========================
     LESSONS
     ========================= */
  /* Lessons = full-bleed tinted band; the only place real cards appear */
  .md-lessons {
    margin: 48px calc(50% - 50vw) calc(-1 * var(--md-main-pb));
    padding: clamp(40px, 6vw, 68px) calc(50vw - 50%);
    background: linear-gradient(180deg, var(--md-surface-2), var(--md-teal-soft));
    border-block: 1px solid var(--md-border);
  }

  .md-lessons-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: clamp(24px, 4vw, 36px);
  }

  .md-lessons-header h2 {
    position: relative;
    margin: 0;
    padding-bottom: 14px;
    font-size: clamp(1.5rem, 4vw, 2.1rem);
    font-weight: 900;
    color: var(--md-teal-dark);
  }

  .md-lessons-header h2::after {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    bottom: 0;
    width: 48px;
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--md-gold), var(--md-gold-light));
  }

  .md-count {
    font-size: 0.85rem;
    font-weight: 800;
    color: #FFFFFF;
    background: var(--md-teal-deep);
    padding: 7px 16px;
    border-radius: 999px;
  }

  .md-lessons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 22px;
    counter-reset: lesson;
  }

  /* =========================
     LESSON CARD
     ========================= */
  .md-lesson-card {
    position: relative;
    display: flex;
    flex-direction: column;
    counter-increment: lesson;
    border-radius: 18px;
    background: #FFFFFF;
    border: 2.5px solid var(--md-border);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 0 var(--md-border);
  }

  .md-lesson-card::after {
    content: attr(data-num);
    position: absolute;
    top: 12px;
    inset-inline-end: 20px;
    font-size: 3rem;
    font-weight: 900;
    line-height: 1;
    color: var(--md-teal);
    opacity: 0.09;
    pointer-events: none;
    font-variant-numeric: tabular-nums;
  }

  .md-lesson-card::before {
    content: "";
    position: absolute;
    inset-inline: 0;
    top: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--md-teal), var(--md-gold));
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.35s ease;
  }

  .md-lesson-card:hover {
    transform: translateY(-5px);
    border-color: var(--md-teal);
    box-shadow: 0 9px 0 var(--md-teal);
  }

  .md-lesson-card:hover::before { transform: scaleX(1); }

  .md-lesson-locked {
    background: var(--md-surface-3);
    border-style: dashed;
    box-shadow: none;
  }

  /* "Coming soon" lesson — card stays visible, clearly not openable */
  .md-lesson-soon {
    background: var(--md-gold-soft);
    border-color: rgba(201, 129, 47, 0.45);
  }

  .md-soon-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 12px;
    border-radius: 999px;
    background: var(--md-gold-soft);
    border: 1px solid var(--md-gold-light);
    color: var(--md-gold-deep);
    font-size: 0.72rem;
    font-weight: 800;
    line-height: 1.4;
  }

  .md-lesson-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(500px circle at var(--x, 50%) var(--y, 0%), rgba(30, 140, 122, 0.08), transparent 42%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .md-lesson-card:hover .md-lesson-glow { opacity: 1; }

  .md-lesson-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 26px 26px 22px;
    position: relative;
  }

  .md-lesson-body h3 {
    margin: 0 0 10px;
    font-size: 1.15rem;
    font-weight: 900;
    line-height: 1.5;
    color: var(--md-teal-dark);
  }

  .md-lesson-body p {
    margin: 0 0 22px;
    color: var(--md-muted);
    font-size: 0.9rem;
    line-height: 1.8;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .md-lesson-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--md-border);
    font-size: 0.92rem;
    font-weight: 800;
    color: var(--md-teal);
  }

  .md-lesson-cta span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--md-teal-soft);
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
  }

  .md-lesson-card:hover .md-lesson-cta span {
    transform: translateX(-4px);
    background: var(--md-teal);
    color: #FFFFFF;
  }

  /* =========================
     HISTORICAL FRIEZE
     ========================= */
  .md-frieze {
    position: relative;
    z-index: 2;
    margin-top: 40px;
    padding: 28px 0 10px;
    border-top: 1px solid var(--md-border);
    overflow: hidden;
  }

  .md-frieze-inner {
    display: flex;
    justify-content: center;
    gap: 28px;
    opacity: 0.2;
  }

  .md-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 22px;
  }

  .md-column-capital {
    width: 22px;
    height: 8px;
    background:
      linear-gradient(
        90deg,
        transparent,
        var(--md-gold),
        transparent
      );
    border-radius: 2px;
  }

  .md-column-shaft {
    width: 8px;
    height: 36px;
    background:
      linear-gradient(
        180deg,
        rgba(201, 129, 47, 0.42),
        rgba(201, 129, 47, 0.10)
      );
  }

  .md-column-base {
    width: 18px;
    height: 6px;
    background:
      rgba(201, 129, 47, 0.22);
    border-radius: 1px;
  }

  /* =========================
     FOOTER — ثابت من تحت
     ========================= */
  .md-footer {
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--md-border);
    padding: 14px 20px;
    text-align: center;
    box-shadow: 0 -4px 20px rgba(14, 83, 72, 0.06);
  }

  .md-footer-inner {
    max-width: 920px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
  }

  .md-footer-brand {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--md-teal-deep);
  }

  .md-footer-desc {
    font-size: 0.82rem;
    color: var(--md-muted);
    line-height: 1.6;
    max-width: 640px;
  }

  .md-footer-contact {
    font-size: 0.82rem;
    color: var(--md-text-soft);
  }

  .md-footer-contact a {
    color: var(--md-teal);
    text-decoration: none;
    font-weight: 600;
  }

  .md-footer-contact a:hover {
    text-decoration: underline;
  }

  .md-footer-copy {
    font-size: 0.78rem;
    color: var(--md-muted-light);
    margin-top: 2px;
  }

  /* =========================
     RESPONSIVE
     ========================= */
  @media (max-width: 1024px) {
    .md-main { max-width: 860px; }
    .md-lessons-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  }

  @media (max-width: 768px) {
    .md-hero-logo { height: 50px; padding: 12px 20px; border-radius: 15px; }
    .md-main { padding: 0 16px var(--md-main-pb); }
    .md-corner-compass { width: 44px; height: 44px; top: 16px; left: 16px; }
    .md-units-grid { grid-template-columns: 1fr; }
    .md-step-label { font-size: 1.1rem; }
    .md-footer { padding: 12px 16px; }
    .md-footer-desc { font-size: 0.78rem; }
  }

  @media (max-width: 640px) {
    .md-main { --md-main-pb: 56px; padding: 0 16px var(--md-main-pb); }
    .md-corner-compass { width: 40px; height: 40px; top: 14px; left: 14px; }
    .md-hero h1 { max-width: 12em; }
    .md-journey { margin-top: 32px; }
    .md-step { gap: 14px; }
    .md-step-indicator { width: 36px; }
    .md-step-number { width: 36px; height: 36px; font-size: 0.92rem; }
    .md-step-label { line-height: 36px; font-size: 1.05rem; }
    .md-chip { min-height: 44px; padding: 9px 18px; font-size: 0.92rem; }
    .md-lessons-grid { grid-template-columns: 1fr; gap: 16px; }
    .md-lesson-body { padding: 22px 20px 18px; }
    .md-lesson-card::after { font-size: 2.4rem; }
    .md-unit-card::before { font-size: 1.5rem; }
    .md-unit-preview { margin-right: 22px; }
    .md-continue .md-continue-btn { width: 100%; }
    .md-assistant-wrap { bottom: 14px; right: 14px; }
    .md-footer-inner { gap: 4px; }
  }

  /* =========================
     ACCESSIBILITY
     ========================= */
  @media (prefers-reduced-motion: reduce) {
    .md-orbit,
    .md-star.twinkle,
    .md-spinner-rose,
    .md-hero-logo,
    .md-hero > *,
    .md-hero::after,
    .md-journey,
    .md-chip,
    .md-unit-card,
    .md-lesson-card,
    .md-continue-btn,
    .md-recent-chip {
      animation: none !important;
      transition: none !important;
    }
  }

  /* =========================================================================
     MADAR HOME v2 — style layer (no logic changes)
     One clear path: Continue → Term → Unit → Lesson path.
     Same identity: petrol + heritage gold, soft shadows, rounded cards.
     ========================================================================= */

  /* Calmer background so content leads */
  .md-bg-layer { opacity: 0.38; }
  .md-corner-compass { opacity: 0.12; }

  /* ---------- Top bar ---------- */
  .md-topbar { padding-top: 8px !important; padding-bottom: 8px !important; }

  /* ---------- Progress strip (where "continue" used to be) ---------- */
  .md-jp {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 12px 16px 13px;
    border-radius: 13px;
    background: #FFFFFF;
    border: 1px solid var(--md-border);
    box-shadow: 0 10px 24px rgba(14, 83, 72, 0.11), 0 1px 3px rgba(14, 83, 72, 0.05);
  }
  .md-jp-where {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.6;
    color: var(--md-muted);
  }
  .md-jp-where b { font-weight: 900; color: var(--md-teal-deep); }
  .md-jp-sep { color: var(--md-gold); font-weight: 900; }
  .md-jp-row { display: flex; align-items: center; gap: 10px; }
  .md-jp-bar { flex: 1; display: flex; gap: 3px; height: 9px; min-width: 0; }
  .md-jp-seg {
    flex: 1 1 0;
    min-width: 3px;
    border-radius: 999px;
    background: var(--md-surface-3);
    box-shadow: inset 0 0 0 1px rgba(188, 224, 201, 0.45);
    transition: background 0.5s ease, box-shadow 0.5s ease;
  }
  .md-jp-seg.unit-start:not(:first-child) { margin-inline-start: 5px; }
  .md-jp-seg.done { background: var(--md-teal); box-shadow: none; }
  .md-jp-seg.current {
    background: var(--md-gold-light);
    box-shadow: 0 0 0 3px rgba(227, 192, 139, 0.25);
    animation: md-jp-pulse 2.2s ease-in-out infinite;
  }
  @keyframes md-jp-pulse {
    0%, 100% { box-shadow: 0 0 0 2px rgba(227, 192, 139, 0.22); }
    50% { box-shadow: 0 0 0 5px rgba(227, 192, 139, 0.12); }
  }
  .md-jp-pct { flex: 0 0 auto; min-width: 2.6em; text-align: left; font-size: 0.76rem; font-weight: 800; color: var(--md-teal-deep); font-variant-numeric: tabular-nums; }

  /* ---------- Hero: compact, still the petrol "orbit" band ---------- */
  .md-hero {
    padding: clamp(22px, 3.5vw, 34px) 20px clamp(40px, 5.5vw, 52px);
    border-radius: 0 0 clamp(18px, 4vw, 31px) clamp(18px, 4vw, 31px);
    box-shadow: 0 14px 36px rgba(14, 83, 72, 0.18);
  }
  .md-hero-logo-wrap { margin-bottom: 12px; }
  .md-hero-logo-wrap::before { width: 120px; height: 120px; }
  .md-hero-logo { height: 36px; padding: 8px 20px; border-radius: 13px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(255, 255, 255, 0.1); }
  .md-hero .md-badge { font-size: 0.74rem; padding: 4px 14px; margin-bottom: 8px; }
  .md-hero h1 { font-size: clamp(1.5rem, 4.4vw, 2.2rem); margin-bottom: 6px; line-height: 1.35; }
  .md-hero p { font-size: clamp(0.88rem, 2vw, 1rem); line-height: 1.8; max-width: 34em; }

  /* ---------- Dashboard: continue = the primary action ---------- */
  .md-dashboard { gap: 14px; margin-top: 20px; }
  .md-hero + .md-dashboard:has(> .md-jp),
  .md-hero + .md-dashboard:has(> .md-continue),
  .md-hero + .md-dashboard:has(> .md-panel) { margin-top: calc(-1 * clamp(26px, 4vw, 32px)); }

  .md-panel {
    border-radius: 15px !important;
    padding: clamp(18px, 3vw, 26px) !important;
    box-shadow: 0 12px 30px rgba(14, 83, 72, 0.12), 0 1px 4px rgba(14, 83, 72, 0.05) !important;
  }
  .md-panel h2 { font-size: 1.2rem; }
  .md-panel .md-chips { gap: 10px; }
  .md-panel .md-chip { min-height: 50px; padding: 10px 24px; font-size: 1rem; }

  /* Continue-learning lives in the top bar now (compact chip) */
  .md-continue-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: min(260px, 46vw);
    min-height: 40px;
    padding: 4px 14px 4px 6px;
    border-radius: 999px;
    border: 1px solid var(--md-gold-light);
    background: linear-gradient(135deg, #FFFFFF, var(--md-gold-soft));
    color: var(--md-teal-deep);
    cursor: pointer;
    text-align: right;
    box-shadow: var(--md-shadow-sm);
    transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  }
  .md-continue-chip:hover { box-shadow: var(--md-shadow-md); border-color: var(--md-gold); transform: translateY(-1px); }
  .md-continue-chip:focus-visible { outline: 3px solid rgba(227, 192, 139, 0.6); outline-offset: 3px; }
  .md-continue-chip-icon {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding-inline-end: 2px;
    border-radius: 50%;
    background: var(--md-teal-deep);
    color: #FFFFFF;
    font-size: 0.62rem;
  }
  .md-continue-chip-label { display: none; }
  .md-continue-chip-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
  .md-continue-chip-text b { font-size: 0.78rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .md-continue-chip-text small { font-size: 0.64rem; font-weight: 700; color: var(--md-gold-deep); }

  .md-dashboard .md-section-label { font-size: 0.78rem; margin-bottom: 8px !important; }
  .md-dashboard .md-recent-chip {
    padding: 8px 16px;
    font-size: 0.82rem;
    max-width: 100%;
    text-align: right;
    background: #FFFFFF;
    box-shadow: var(--md-shadow-sm);
  }

  /* ---------- Journey meta + steps ---------- */
  .md-journey { margin-top: 22px; }
  .md-journey-meta { margin-bottom: 16px !important; padding: 5px 6px 5px 14px; font-size: 0.8rem !important; }

  .md-step { padding: 0; gap: 0; }
  .md-step-indicator { display: none; }
  .md-step-content { padding-bottom: 20px; }
  .md-step-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 0.98rem;
    line-height: 1.5;
    color: var(--md-teal-deep) !important;
  }
  .md-step-label::before {
    content: "";
    width: 4px;
    height: 18px;
    border-radius: 4px;
    background: linear-gradient(180deg, var(--md-teal), var(--md-gold));
  }

  /* Term = segmented control */
  .md-step[data-step="1"] .md-chips {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: var(--md-surface-3);
    border: 1px solid var(--md-border);
  }
  .md-step[data-step="1"] .md-chip {
    min-height: 40px;
    padding: 6px 22px;
    border: 0;
    background: transparent;
    font-size: 0.92rem;
    box-shadow: none;
    transform: none;
  }
  .md-step[data-step="1"] .md-chip:hover { background: rgba(255, 255, 255, 0.7); }
  .md-step[data-step="1"] .md-chip.selected {
    background: var(--md-teal-deep);
    color: #FFFFFF;
    box-shadow: 0 6px 16px rgba(14, 83, 72, 0.22);
  }
  .md-step[data-step="1"] .md-chip.selected::before { display: none; }

  /* ---------- Units: clear cards with a mini progress bar ---------- */
  .md-units-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
    align-items: start;
  }
  .md-unit-row { padding: 0; border-bottom: 0; gap: 8px; }
  .md-unit-card {
    flex-wrap: wrap;
    row-gap: 10px;
    min-height: 64px;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid var(--md-border);
    box-shadow: 0 2px 10px rgba(14, 83, 72, 0.06);
  }
  .md-unit-card::before { font-size: 1.15rem; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 14px; background: var(--md-gold-soft); color: var(--md-gold-deep); opacity: 1; }
  .md-unit-card.selected::before { background: rgba(255, 255, 255, 0.14); color: var(--md-gold-light); }
  .md-unit-card-title { font-size: 1.02rem; }
  .md-unit-card:hover { transform: translateY(-2px); }
  .md-unit-card-progress {
    order: 99;
    flex: 1 0 100%;
    height: 5px;
    border-radius: 999px;
    overflow: hidden;
    background: var(--md-surface-3);
  }
  .md-unit-card-progress i {
    display: block;
    height: 100%;
    border-radius: 999px;
    background-image: linear-gradient(90deg, var(--md-teal), var(--md-gold));
    transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .md-unit-card.selected .md-unit-card-progress { background: rgba(255, 255, 255, 0.18); }
  .md-unit-preview { margin: 0 14px 0 0; padding: 0 14px 0 0; gap: 4px; }
  .md-unit-preview li { font-size: 0.78rem; line-height: 1.7; }
  .md-unit-preview li:nth-child(n+4) { display: none; }

  /* ---------- Lessons: a connected learning path ---------- */
  .md-lessons {
    margin-top: 28px;
    padding: clamp(26px, 4vw, 40px) calc(50vw - 50%);
    background: linear-gradient(180deg, var(--md-surface-2), #FFFFFF 70%);
  }
  .md-lessons { scroll-margin-top: 64px; animation: md-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .md-lessons .md-lessons-header,
  .md-lessons .md-lessons-grid,
  .md-lessons > .md-empty { max-width: 860px; margin-inline: auto; }
  .md-lessons-header { margin-bottom: 20px; }
  .md-lessons-header h2 { font-size: clamp(1.25rem, 3.4vw, 1.6rem); padding-bottom: 10px; }
  .md-lessons-header h2.md-lessons-title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 2px 10px;
    font-size: clamp(1rem, 3vw, 1.3rem);
    line-height: 1.6;
  }
  .md-lessons-title span { font-weight: 700; color: var(--md-text-soft); }
  .md-lessons-title i { font-style: normal; font-weight: 900; color: var(--md-gold); }
  .md-lessons-title b { font-weight: 900; color: var(--md-teal-deep); font-size: 1.12em; }
  .md-count { font-size: 0.78rem; padding: 5px 14px; }

  .md-lessons .md-lessons-grid {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .md-lessons .md-lessons-grid::before {
    content: "";
    position: absolute;
    inset-block: 28px;
    inset-inline-start: 36px;
    width: 0;
    border-inline-start: 2px dashed var(--md-border-strong);
    z-index: 0;
  }

  .md-lesson-card {
    z-index: 1;
    flex-direction: row;
    align-items: center;
    border-radius: 15px;
    padding-inline-start: 78px;
    box-shadow: 0 2px 10px rgba(14, 83, 72, 0.06);
  }
  .md-lesson-card:hover { transform: translateY(-3px); box-shadow: 0 16px 34px rgba(14, 83, 72, 0.12); }
  .md-lesson-card::before { display: none; }
  .md-lesson-glow { display: none; }

  /* number node */
  .md-lesson-card::after {
    content: attr(data-num);
    position: absolute;
    top: 50%;
    inset-inline-start: 14px;
    inset-inline-end: auto;
    transform: translateY(-50%);
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--md-teal-soft);
    border: 1.5px solid rgba(30, 140, 122, 0.28);
    color: var(--md-teal-deep);
    font-size: 1rem;
    font-weight: 900;
    opacity: 1;
  }
  .md-lesson-card[data-kind="COMPLETED"]::after {
    content: "✓";
    background: var(--md-teal);
    border-color: var(--md-teal);
    color: #FFFFFF;
    font-size: 1.2rem;
  }
  .md-lesson-card[data-kind="CURRENT"] {
    border-color: var(--md-gold-light);
    box-shadow: 0 14px 32px rgba(201, 129, 47, 0.16);
  }
  .md-lesson-card[data-kind="CURRENT"]::after {
    background: var(--md-gold-soft);
    border-color: var(--md-gold);
    color: var(--md-gold-deep);
    box-shadow: 0 0 0 5px rgba(227, 192, 139, 0.2);
  }
  .md-lesson-card[data-kind="SEQUENCE_LOCK"]::after,
  .md-lesson-card[data-kind="COMING_SOON"]::after {
    background: var(--md-surface-3);
    border: 2px dashed var(--md-border-strong);
    color: var(--md-muted);
  }
  .md-lesson-card[data-kind="ACCESS_LOCK"]::after {
    background: var(--md-gold-soft);
    border-color: var(--md-gold-light);
    color: var(--md-gold-deep);
  }

  .md-lesson-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 14px;
    row-gap: 2px;
    align-items: center;
    padding: 16px 18px 16px 16px;
  }
  .md-lesson-body > div:first-child { grid-column: 1; }
  .md-lesson-body h3 { font-size: 1.02rem; margin: 0; }
  .md-lesson-body p { grid-column: 1; margin: 0; font-size: 0.82rem; line-height: 1.7; }
  .md-lesson-body .md-lesson-cta {
    grid-column: 2;
    grid-row: 1 / span 2;
    margin: 0;
    padding: 0;
    border-top: 0;
    font-size: 0.85rem;
    white-space: nowrap;
  }
  .md-lesson-body .md-lesson-cta span { width: 34px; height: 34px; }
  .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta {
    padding: 5px 5px 5px 16px;
    border-radius: 999px;
    background: var(--md-teal-deep);
    color: #FFFFFF !important;
    box-shadow: 0 8px 18px rgba(14, 83, 72, 0.22);
  }
  .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta span { background: rgba(255, 255, 255, 0.18); }

  /* ---------- Feature boxes (bottom) ---------- */
  .md-features {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    margin: 56px calc(50% - 50vw) calc(-1 * var(--md-main-pb));
    padding: clamp(36px, 6vw, 60px) calc(50vw - 50%);
    background:
      radial-gradient(circle at 12% 0%, rgba(227, 192, 139, 0.16), transparent 40%),
      linear-gradient(160deg, var(--md-teal-dark) 0%, var(--md-teal-deep) 60%, var(--md-teal) 140%);
    border-radius: clamp(18px, 4vw, 31px) clamp(18px, 4vw, 31px) 0 0;
  }
  .md-lessons + .md-features { margin-top: 0; }
  .md-features::before {
    content: "";
    position: absolute;
    z-index: 0;
    width: 520px;
    height: 520px;
    top: -300px;
    inset-inline-end: -140px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.07);
    box-shadow: 0 0 0 54px rgba(255, 255, 255, 0.02), 0 0 0 108px rgba(255, 255, 255, 0.012);
    pointer-events: none;
  }
  .md-features-head, .md-features-grid { position: relative; z-index: 1; max-width: 1040px; margin-inline: auto; }
  .md-features-head { text-align: center; margin-bottom: clamp(22px, 4vw, 34px); }
  .md-features-head h2 { margin: 0 0 6px; font-size: clamp(1.25rem, 3.6vw, 1.7rem); font-weight: 900; color: #FFFFFF; }
  .md-features-head p { margin: 0; font-size: 0.9rem; color: rgba(255, 255, 255, 0.72); }
  .md-features-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .md-feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    padding: 24px 16px 22px;
    border-radius: 17px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  }
  .md-feature:hover { transform: translateY(-4px); background: rgba(255, 255, 255, 0.1); border-color: rgba(227, 192, 139, 0.5); }
  .md-feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    border-radius: 13px;
    color: var(--md-gold-light);
    background: rgba(227, 192, 139, 0.12);
    border: 1px solid rgba(227, 192, 139, 0.35);
    box-shadow: 0 0 22px rgba(227, 192, 139, 0.18);
  }
  .md-feature:nth-child(even) .md-feature-icon {
    color: #CDBBDA;
    background: rgba(169, 214, 203, 0.14);
    border-color: rgba(169, 214, 203, 0.4);
    box-shadow: 0 0 22px rgba(169, 214, 203, 0.2);
  }
  .md-feature-icon svg { width: 28px; height: 28px; }
  .md-feature h3 { margin: 0; font-size: 1.02rem; font-weight: 900; color: #FFFFFF; }
  .md-feature p { margin: 0; font-size: 0.8rem; line-height: 1.8; color: rgba(255, 255, 255, 0.7); }

  .md-frieze { opacity: 0.55; }

  @media (max-width: 900px) {
    .md-features-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 640px) {
    .md-hero p { font-size: 0.84rem; line-height: 1.7; margin-top: 2px; }
    .md-hero { padding-bottom: 50px; }
    .md-corner-compass { opacity: 0.1; }
    .md-bg-layer { opacity: 0.26; }
    .md-dashboard { margin-top: 14px; }
    .md-dashboard .md-recent-chip { flex: 1 1 100%; border-radius: 16px; }
    .md-continue-chip { padding: 3px 12px 3px 4px; gap: 6px; max-width: none; flex-shrink: 0; }
    .md-continue-chip-text { display: none; }
    .md-continue-chip-label { display: inline; font-size: 0.74rem; font-weight: 800; white-space: nowrap; color: var(--md-teal-deep); }
    .md-continue-chip-icon { width: 30px; height: 30px; }
    .md-topbar { gap: 6px !important; padding-inline: 10px !important; }
    .md-jp { padding: 11px 13px 12px; border-radius: 16px; }
    .md-jp-where { font-size: 0.8rem; }
    .md-journey { margin-top: 14px; }
    .md-step[data-step="1"] .md-chips { display: flex; width: 100%; }
    .md-step[data-step="1"] .md-chip { flex: 1 1 auto; justify-content: center; padding: 6px 12px; }
    .md-units-grid { grid-template-columns: 1fr; gap: 12px; }
    .md-unit-card { min-height: 60px; }
    .md-unit-preview li { font-size: 0.74rem; }
    .md-lessons { padding-top: 22px; }
    .md-lessons .md-lessons-grid { gap: 12px; }
    .md-lessons .md-lessons-grid::before { inset-inline-start: 30px; }
    .md-lesson-card { padding-inline-start: 64px; border-radius: 14px; }
    .md-lesson-card::after { width: 40px; height: 40px; inset-inline-start: 11px; font-size: 0.92rem; }
    .md-lesson-body { padding: 13px 14px 13px 12px; column-gap: 10px; }
    .md-lesson-body h3 { font-size: 0.96rem; }
    .md-lesson-body .md-lesson-cta { font-size: 0; }
    .md-lesson-body .md-lesson-cta span { font-size: 1rem; width: 34px; height: 34px; }
    .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta { padding: 0; background: transparent; box-shadow: none; }
    .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta span { background: var(--md-teal-deep); color: #FFFFFF; }
    .md-features { margin-top: 40px; }
    .md-features-grid { gap: 12px; }
    .md-feature { padding: 18px 12px 16px; border-radius: 14px; }
    .md-feature-icon { width: 50px; height: 50px; border-radius: 16px; }
    .md-feature h3 { font-size: 0.94rem; }
    .md-feature p { font-size: 0.74rem; }
  }

  /* =========================================================================
     SPLIT LAYOUT — context bar + units rail + lessons column (style only)
     ========================================================================= */
  .md-main { max-width: 1120px; }

  .md-context {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 12px;
    margin-bottom: 18px;
    padding: 10px 12px;
    border-radius: 14px;
    background: #FFFFFF;
    border: 1px solid var(--md-border);
    box-shadow: var(--md-shadow-sm);
  }
  .md-ctx-grade {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    max-width: 100%;
    padding: 6px 16px;
    border-radius: 999px;
    border: 1.5px solid var(--md-border-strong);
    background: var(--md-surface-2);
    color: var(--md-teal-deep);
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }
  .md-ctx-grade:hover { border-color: var(--md-teal); background: var(--md-teal-soft); transform: translateY(-1px); }
  .md-ctx-grade:focus-visible, .md-ctx-terms .md-chip:focus-visible { outline: 3px solid rgba(227, 192, 139, 0.6); outline-offset: 2px; }
  .md-ctx-grade-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .md-ctx-caret { color: var(--md-gold); font-size: 0.8rem; }

  .md-ctx-terms {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: var(--md-surface-3);
    border: 1px solid var(--md-border);
  }
  .md-ctx-terms .md-chip {
    min-height: 38px;
    padding: 6px 20px;
    border: 0;
    background: transparent;
    font-size: 0.88rem;
    box-shadow: none;
    transform: none;
  }
  .md-ctx-terms .md-chip:hover { background: rgba(255, 255, 255, 0.75); }
  .md-ctx-terms .md-chip.selected { background: var(--md-teal-deep); color: #FFFFFF; box-shadow: 0 6px 16px rgba(14, 83, 72, 0.22); }
  .md-ctx-terms .md-chip.selected::before { display: none; }

  .md-split {
    display: grid;
    grid-template-columns: minmax(250px, 300px) minmax(0, 1fr);
    gap: clamp(18px, 3vw, 32px);
    align-items: start;
  }
  .md-units-rail { position: sticky; top: 16px; min-width: 0; }
  .md-rail-label { margin: 0 0 10px; font-size: 0.8rem; font-weight: 800; color: var(--md-muted); }
  .md-units-rail .md-units-grid { display: flex; flex-direction: column; gap: 10px; }
  .md-units-rail .md-unit-row { gap: 0; }
  .md-units-rail .md-unit-preview { display: none; }
  .md-units-rail .md-unit-card { width: 100%; min-height: 62px; padding: 12px 14px; }
  .md-split-main { min-width: 0; }

  /* lessons now live in the column (no full-bleed band) */
  .md-split .md-lessons {
    margin: 0;
    padding: 0;
    background: none;
    border: 0;
    scroll-margin-top: 16px;
  }
  .md-split .md-lessons .md-lessons-header,
  .md-split .md-lessons .md-lessons-grid,
  .md-split .md-lessons > .md-empty { max-width: none; margin-inline: 0; }
  .md-split .md-lessons .md-lessons-header { margin-bottom: 16px; }
  .md-split .md-lessons .md-lessons-grid { grid-template-columns: none; }

  .md-split-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 220px;
    padding: 24px;
    border-radius: 17px;
    border: 1.5px dashed var(--md-border-strong);
    background: var(--md-surface-2);
    color: var(--md-muted);
    text-align: center;
  }
  .md-split-empty p { margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--md-text-soft); }
  .md-split-empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--md-teal-soft);
    color: var(--md-teal-deep);
    font-size: 1.3rem;
    font-weight: 900;
  }

  /* ---- phones & small tablets: units become a swipeable strip above the lessons ---- */
  @media (max-width: 860px) {
    .md-split { grid-template-columns: minmax(0, 1fr); gap: 14px; }
    .md-units-rail { position: static; }
    .md-rail-label { margin-bottom: 8px; }
    .md-units-rail .md-units-grid {
      flex-direction: row;
      gap: 10px;
      overflow-x: auto;
      padding: 2px 2px 10px;
      margin-inline: -2px;
      scroll-snap-type: x proximity;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    .md-units-rail .md-unit-row { flex: 0 0 auto; scroll-snap-align: start; }
    .md-units-rail .md-unit-card { width: 168px; min-height: 76px; padding: 10px 12px; row-gap: 8px; }
    .md-units-rail .md-unit-card::before,
    .md-units-rail .md-unit-card::after { display: none; }
    .md-units-rail .md-unit-card-title { font-size: 0.92rem; flex: 1 1 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .md-split-empty { min-height: 120px; padding: 18px; }
    .md-split-empty-icon { transform: rotate(90deg); }
  }

  @media (max-width: 640px) {
    .md-context { padding: 8px; gap: 8px; border-radius: 13px; }
    .md-ctx-grade { width: 100%; justify-content: space-between; }
    .md-ctx-terms { width: 100%; display: flex; }
    .md-ctx-terms .md-chip { flex: 1 1 0; justify-content: center; padding: 6px 10px; }
  }

  /* =========================================================================
     STAGE / GRADE PICKER — illustrated cards (style only)
     ========================================================================= */
  .md-pick-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 190px));
    gap: 14px;
  }
  .md-pick-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 12px 12px 14px;
    border-radius: 15px;
    border: 2.5px solid var(--md-border);
    background: #FFFFFF;
    box-shadow: 0 2px 0 var(--md-border);
    color: var(--md-teal-deep);
    cursor: pointer;
    text-align: center;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }
  .md-pick-card:hover:not(:disabled) {
    transform: translateY(-3px);
    border-color: var(--md-teal);
    box-shadow: 0 3px 0 var(--md-teal);
  }
  .md-pick-card:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 1px 0 var(--md-teal); }
  .md-pick-card:focus-visible { outline: 3px solid rgba(227, 192, 139, 0.6); outline-offset: 3px; }
  .md-pick-card:disabled { opacity: 0.55; cursor: not-allowed; }
  .md-pick-art {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1 / 0.82;
    border-radius: 16px;
    background: var(--md-surface-3);
    transition: background 0.22s ease;
  }
  .md-pick-card:hover:not(:disabled) .md-pick-art { background: var(--md-teal-soft); }
  .md-art { width: 76%; height: 76%; overflow: visible; }
  .md-art .a-l { fill: none; stroke: var(--md-teal-deep); stroke-width: 3.6; stroke-linecap: round; stroke-linejoin: round; }
  .md-art .a-t { fill: #E4F2EE; stroke: var(--md-teal-deep); stroke-width: 3.6; stroke-linejoin: round; }
  .md-art .a-g { fill: var(--md-gold-soft); stroke: var(--md-gold-deep); stroke-width: 3.6; stroke-linejoin: round; }
  .md-art .a-s { fill: var(--md-teal); stroke: none; }
  .md-art .a-y { fill: var(--md-gold-light); stroke: none; }
  .md-pick-title { font-size: 0.98rem; font-weight: 900; line-height: 1.4; }
  .md-pick-num {
    position: absolute;
    top: 8px;
    inset-inline-start: 8px;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--md-gold-soft);
    border: 1.5px solid var(--md-gold-light);
    color: var(--md-gold-deep);
    font-size: 0.95rem;
    font-weight: 900;
  }
  .md-pick-card.selected {
    background: linear-gradient(160deg, var(--md-teal-deep), var(--md-teal-dark));
    border-color: var(--md-teal-dark);
    color: #FFFFFF;
    box-shadow: 0 2px 0 var(--md-teal-dark);
  }
  .md-pick-card.selected .md-pick-art { background: rgba(255, 255, 255, 0.92); }
  .md-pick-card.selected .md-pick-num { background: var(--md-gold-light); border-color: var(--md-gold-light); color: var(--md-teal-dark); }

  @media (max-width: 640px) {
    .md-pick-grid { grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 10px; }
    .md-pick-card { padding: 8px 8px 12px; border-radius: 13px; gap: 8px; }
    .md-pick-art { border-radius: 13px; }
    .md-pick-title { font-size: 0.86rem; }
    .md-pick-num { width: 26px; height: 26px; font-size: 0.85rem; top: 6px; inset-inline-start: 6px; }
  }

  /* =========================================================================
     COLOR SYSTEM v3 — a livelier palette (style only)
     Brand anchors stay: petrol green + heritage gold. New accents add variety:
     blue · violet · coral · pink. Each unit / card gets its own accent.
     ========================================================================= */
  :root {
    --md-blue: #4F7F99;
    --md-violet: #8D6FA8;
    --md-coral: #C2674A;
    --md-pink: #B8728F;
    --md-success: #C9812F;
    --md-rainbow: linear-gradient(90deg, #1E8C7A 0%, #4F7F99 25%, #8D6FA8 50%, #C2674A 75%, #E3C08B 100%);
    --acc: #1E8C7A; --acc-deep: #147A6A; --acc-soft: #E4F2EE; --acc-light: #CDBBDA; --acc-glow: #1E8C7A33;
  }

  /* accent variable sets (unit index / card position cycles through 6 colors) */
  [data-accent="0"],
  .md-pick-grid > :nth-child(6n+1),
  .md-features-grid > :nth-child(6n+1),
  .md-recent-row > :nth-child(6n+1) {
    --acc: #1E8C7A; --acc-deep: #147A6A; --acc-soft: #E4F2EE; --acc-light: #CDBBDA; --acc-glow: #1E8C7A33;
  }
  [data-accent="1"],
  .md-pick-grid > :nth-child(6n+2),
  .md-features-grid > :nth-child(6n+2),
  .md-recent-row > :nth-child(6n+2) {
    --acc: #4F7F99; --acc-deep: #3A6680; --acc-soft: #E6EEF3; --acc-light: #8FB1C3; --acc-glow: #4F7F9933;
  }
  [data-accent="2"],
  .md-pick-grid > :nth-child(6n+3),
  .md-features-grid > :nth-child(6n+3),
  .md-recent-row > :nth-child(6n+3) {
    --acc: #8D6FA8; --acc-deep: #6F5390; --acc-soft: #EFE8F4; --acc-light: #CDBBDA; --acc-glow: #8D6FA833;
  }
  [data-accent="3"],
  .md-pick-grid > :nth-child(6n+4),
  .md-features-grid > :nth-child(6n+4),
  .md-recent-row > :nth-child(6n+4) {
    --acc: #C2674A; --acc-deep: #A8472F; --acc-soft: #F6E4DA; --acc-light: #E0AE9A; --acc-glow: #C2674A33;
  }
  [data-accent="4"],
  .md-pick-grid > :nth-child(6n+5),
  .md-features-grid > :nth-child(6n+5),
  .md-recent-row > :nth-child(6n+5) {
    --acc: #C9812F; --acc-deep: #9C5F1C; --acc-soft: #F8EFDD; --acc-light: #E3C08B; --acc-glow: #C9812F33;
  }
  [data-accent="5"],
  .md-pick-grid > :nth-child(6n+6),
  .md-features-grid > :nth-child(6n+6),
  .md-recent-row > :nth-child(6n+6) {
    --acc: #B8728F; --acc-deep: #94566F; --acc-soft: #F5E6EC; --acc-light: #DDB8C8; --acc-glow: #B8728F33;
  }

  /* ---------- Page background: soft colorful light ---------- */
  .md-platform {
    background:
      radial-gradient(circle at 8% 4%, rgba(79, 127, 153, 0.10), transparent 36%),
      radial-gradient(circle at 94% 12%, rgba(141, 111, 168, 0.09), transparent 38%),
      radial-gradient(circle at 90% 62%, rgba(194, 103, 74, 0.07), transparent 36%),
      radial-gradient(circle at 6% 74%, rgba(227, 192, 139, 0.10), transparent 38%),
      radial-gradient(circle at 50% 100%, rgba(30, 140, 122, 0.08), transparent 42%),
      #FFFFFF;
  }

  /* ---------- Hero: petrol + colorful glows ---------- */
  .md-hero {
    background:
      radial-gradient(circle at 86% 6%, rgba(227, 192, 139, 0.34), transparent 36%),
      radial-gradient(circle at 10% 100%, rgba(141, 111, 168, 0.38), transparent 44%),
      radial-gradient(circle at 58% 118%, rgba(79, 127, 153, 0.40), transparent 46%),
      radial-gradient(circle at 30% -10%, rgba(194, 103, 74, 0.20), transparent 38%),
      linear-gradient(160deg, #0E5348 0%, #147A6A 52%, #1E8C7A 125%);
  }
  .md-hero .md-badge { border-color: rgba(227, 192, 139, 0.6); }

  /* ---------- Rainbow signature bar on key cards ---------- */
  .md-context, .md-jp { position: relative; overflow: hidden; }
  .md-context::before, .md-jp::before {
    content: "";
    position: absolute;
    top: 0;
    inset-inline: 0;
    height: 4px;
    background: var(--md-rainbow);
  }
  .md-context { padding-top: 14px; }
  .md-jp { padding-top: 16px; }

  /* ---------- Context bar ---------- */
  .md-ctx-grade { background: var(--md-blue-soft, #E6EEF3); border-color: #B3CBD8; color: #3A6680; }
  .md-ctx-grade:hover { background: #D5E3EB; border-color: var(--md-blue); }
  .md-ctx-caret { color: var(--md-blue); }
  .md-ctx-terms { background: var(--acc-soft, #EFE8F4); border-color: rgba(141, 111, 168, 0.18); --acc-soft: #EFE8F4; }
  .md-ctx-terms .md-chip.selected { background: linear-gradient(135deg, #6F5390, #8D6FA8); box-shadow: 0 8px 18px rgba(111, 83, 144, 0.28); }

  /* ---------- Progress strip: unit colors ---------- */
  .md-jp-seg.done { background: var(--acc, var(--md-teal)); }
  .md-jp-seg.current { background: var(--md-gold-light); }
  .md-jp-where b { color: var(--md-teal-deep); }
  .md-jp-pct { color: var(--md-violet); }

  /* ---------- Latest lessons chips ---------- */
  .md-dashboard .md-recent-chip {
    border: 1px solid var(--acc-soft) !important;
    border-inline-start: 4px solid var(--acc) !important;
    background: #FFFFFF;
    color: var(--acc-deep) !important;
  }
  .md-dashboard .md-recent-chip:hover { background: var(--acc-soft); transform: translateY(-2px); }

  /* ---------- Units rail: each unit has its own color ---------- */
  .md-rail-label { color: var(--md-violet); }
  .md-unit-card {
    border: 1px solid var(--acc-soft);
    border-inline-start: 5px solid var(--acc);
    background: linear-gradient(135deg, #FFFFFF 55%, var(--acc-soft));
  }
  .md-unit-card::before { background: var(--acc-soft); color: var(--acc-deep); }
  .md-unit-card::after { background: var(--acc-soft); color: var(--acc-deep); }
  .md-unit-card:hover { border-color: var(--acc); border-inline-start-color: var(--acc); background: linear-gradient(135deg, #FFFFFF 40%, var(--acc-soft)); box-shadow: 0 12px 26px var(--acc-glow); }
  .md-unit-card:hover::after { background: var(--acc); color: #FFFFFF; }
  .md-unit-card-count { background: var(--acc-soft); color: var(--acc-deep); }
  .md-unit-card-progress i { background-image: linear-gradient(90deg, var(--acc), var(--acc-light)); }
  .md-unit-card.selected {
    background: linear-gradient(135deg, var(--acc-deep), var(--acc));
    border-color: var(--acc-deep);
    border-inline-start-color: var(--md-gold-light);
    box-shadow: 0 16px 32px var(--acc-glow);
  }
  .md-unit-card.selected::before { background: rgba(255, 255, 255, 0.2); color: #FFFFFF; }
  .md-unit-card.selected::after { background: rgba(255, 255, 255, 0.22); color: #FFFFFF; }
  .md-unit-card.selected .md-unit-card-count { background: rgba(255, 255, 255, 0.22); color: #FFFFFF; }
  .md-unit-card.selected .md-unit-card-progress i { background-image: linear-gradient(90deg, #FFFFFF, var(--md-gold-light)); }

  /* ---------- Lessons column: colored by the open unit ---------- */
  .md-lessons-header h2 { border-bottom-color: var(--acc-soft); }
  .md-lessons-title b { color: var(--acc-deep); }
  .md-lessons-title i { color: var(--acc); }
  .md-count { background: var(--acc-deep); color: #FFFFFF; }
  .md-lessons .md-lessons-grid::before { border-inline-start-color: var(--acc); opacity: 0.45; }

  .md-lesson-card {
    border: 1px solid var(--acc-soft);
    border-inline-start: 5px solid var(--acc);
    background: linear-gradient(135deg, #FFFFFF 62%, var(--acc-soft));
  }
  .md-lesson-card:hover { border-color: var(--acc); box-shadow: 0 16px 32px var(--acc-glow); }
  .md-lesson-card::after { background: #FFFFFF; border-color: var(--acc); color: var(--acc-deep); }
  .md-lesson-body h3 { color: var(--acc-deep); }
  .md-lesson-cta { color: var(--acc-deep); }
  .md-lesson-cta span { background: var(--acc-soft); color: var(--acc-deep); }
  .md-lesson-card[data-kind="COMPLETED"]::after { background: var(--md-success); border-color: var(--md-success); color: #FFFFFF; }
  .md-lesson-card[data-kind="COMPLETED"] .md-lesson-cta { color: var(--md-success); }
  .md-lesson-card[data-kind="CURRENT"] { border-color: var(--md-gold-light); border-inline-start-color: var(--md-gold); background: linear-gradient(135deg, #FFFFFF 50%, var(--md-gold-soft)); }
  .md-lesson-card[data-kind="CURRENT"]::after { background: var(--md-gold-soft); border-color: var(--md-gold); color: var(--md-gold-deep); }
  .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta { background: linear-gradient(135deg, var(--acc-deep), var(--acc)); }
  .md-lesson-card[data-kind="SEQUENCE_LOCK"], .md-lesson-card[data-kind="COMING_SOON"] { background: var(--md-surface-3); border-inline-start-color: var(--md-border-strong); }
  .md-lesson-card[data-kind="SEQUENCE_LOCK"] h3, .md-lesson-card[data-kind="COMING_SOON"] h3 { color: var(--md-muted); }

  .md-split-empty { background: linear-gradient(135deg, #EFE8F4, #E6EEF3); border-color: #DAC9E4; }
  .md-split-empty-icon { background: #FFFFFF; color: var(--md-violet); box-shadow: 0 6px 14px rgba(141, 111, 168, 0.18); }

  /* ---------- Stage / grade picker: colorful illustrated cards ---------- */
  .md-pick-card { border-color: var(--acc-soft); border-top: 5px solid var(--acc); }
  .md-pick-card:hover:not(:disabled) { border-color: var(--acc); box-shadow: 0 16px 34px var(--acc-glow); }
  .md-pick-art { background: var(--acc-soft); }
  .md-pick-card:hover:not(:disabled) .md-pick-art { background: var(--acc-soft); }
  .md-pick-title { color: var(--acc-deep); }
  .md-art .a-l { stroke: var(--acc-deep); }
  .md-art .a-t { fill: #FFFFFF; stroke: var(--acc-deep); }
  .md-art .a-s { fill: var(--acc); }
  .md-pick-num { background: var(--acc); border-color: var(--acc); color: #FFFFFF; }
  .md-pick-card.selected { background: linear-gradient(160deg, var(--acc-deep), var(--acc)); border-color: var(--acc-deep); border-top-color: var(--md-gold-light); box-shadow: 0 16px 34px var(--acc-glow); }
  .md-pick-card.selected .md-pick-title { color: #FFFFFF; }
  .md-pick-card.selected .md-pick-art { background: rgba(255, 255, 255, 0.94); }
  .md-pick-card.selected .md-pick-num { background: var(--md-gold-light); border-color: var(--md-gold-light); color: var(--acc-deep); }

  /* ---------- Feature boxes: dark band, four glowing colors ---------- */
  .md-features {
    background:
      radial-gradient(circle at 12% 0%, rgba(227, 192, 139, 0.20), transparent 40%),
      radial-gradient(circle at 88% 8%, rgba(141, 111, 168, 0.34), transparent 42%),
      radial-gradient(circle at 50% 120%, rgba(79, 127, 153, 0.34), transparent 50%),
      linear-gradient(160deg, #0B463C 0%, #147A6A 55%, #147A6A 135%);
  }
  .md-features-head h2 {
    background: linear-gradient(90deg, #FFFFFF, #E3C08B);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .md-feature {
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid var(--acc-glow);
    border-top: 3px solid var(--acc-light);
  }
  .md-feature:hover { background: rgba(255, 255, 255, 0.12); border-color: var(--acc-light); box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22); }
  .md-feature .md-feature-icon,
  .md-feature:nth-child(even) .md-feature-icon {
    color: var(--acc-light);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--acc-light);
    box-shadow: 0 0 26px var(--acc-glow);
  }
  .md-feature h3 { color: #FFFFFF; }

  /* ---------- Unit counts / chips in the picker panel ---------- */
  .md-panel h2 { color: var(--md-violet); }

  @media (prefers-reduced-motion: reduce) {
    .md-feature, .md-unit-card-progress i, .md-lesson-card, .md-jp-seg, .md-lessons, .md-pick-card { animation: none !important; transition: none !important; }
  }

  /* ---------- grade pill: label + inset "door" button to change the grade (style only) ---------- */
  .md-ctx-grade {
    gap: 10px;
    padding: 4px 4px 4px 16px;
    cursor: default;
  }
  .md-ctx-grade:hover { transform: none; background: var(--md-blue-soft, #E6EEF3); border-color: #B3CBD8; }
  .md-ctx-door {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    min-height: 34px;
    padding: 4px 12px 4px 10px;
    border: 1.5px solid #B3CBD8;
    border-bottom-width: 4px;
    border-radius: 12px;
    background: #FFFFFF;
    color: #3A6680;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 900;
    line-height: 1;
    cursor: pointer;
    transition: transform 0.08s ease, background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }
  .md-ctx-door svg { width: 18px; height: 18px; flex-shrink: 0; }
  .md-ctx-door:hover { background: #4F7F99; border-color: #3A6680; color: #FFFFFF; }
  .md-ctx-door:active { transform: translateY(2px); border-bottom-width: 2px; }
  .md-ctx-door:focus-visible { outline: 3px solid #4F7F99; outline-offset: 2px; }
  @media (max-width: 380px) { .md-ctx-door span { display: none; } .md-ctx-door { padding: 4px 10px; } }


/* =========================================================================
   VISUAL EXCELLENCE LAYER — dashboard polish (style only, no logic)
   Calm premium: white surfaces, teal #147A6A / deep #0E5348, gold #B9791F
   ========================================================================= */

.md-platform {
  --md-bg: #FFFFFF;
  --md-surface: #FFFFFF;
  --md-surface-2: #F7FAF9;
  --md-surface-3: #EEF5F3;
  --md-teal: #147A6A;
  --md-teal-deep: #0E5348;
  --md-teal-dark: #0A3F36;
  --md-gold: #B9791F;
  --md-gold-deep: #8A5A14;
  --md-gold-soft: #F8EFD8;
  --md-border: #DED4BD;
  --md-border-strong: #C7BA9C;
  --md-text: #263B35;
  --md-muted: #697A73;
  background-color: #FFFFFF !important;
}

.md-topbar {
  background: color-mix(in srgb, #FFFFFF 92%, transparent) !important;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--md-border, #DED4BD);
}

.md-welcome {
  border-radius: 1.35rem !important;
  box-shadow:
    0 22px 48px -24px rgba(14, 83, 72, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
}
.md-welcome-title { letter-spacing: -0.01em; text-wrap: balance; }
.md-welcome-sub { opacity: 0.92; }
.md-welcome-cta {
  border-radius: 0.95rem !important;
  font-weight: 800;
  transition: transform 0.18s ease, box-shadow 0.18s ease !important;
}
.md-welcome-cta:hover { transform: translateY(-2px); }
.md-welcome-cta:active { transform: translateY(1px); }
.md-welcome-cta:focus-visible {
  outline: 3px solid rgba(185, 121, 31, 0.55);
  outline-offset: 3px;
}

.md-dash-row { gap: 1.15rem !important; }
.md-dash-card {
  background: #FFFFFF !important;
  border: 1px solid var(--md-border, #DED4BD) !important;
  border-radius: 1.2rem !important;
  box-shadow: 0 14px 36px -22px rgba(14, 83, 72, 0.2) !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.md-dash-card:hover {
  border-color: color-mix(in srgb, #147A6A 35%, #DED4BD);
  box-shadow: 0 18px 40px -20px rgba(14, 83, 72, 0.26) !important;
}
.md-dash-card-title { color: #0E5348 !important; font-weight: 850 !important; }
.md-dash-card-ico { background: #E0F1EC !important; border-radius: 0.7rem !important; }
.md-dash-bar { background: #E8F0ED !important; height: 0.5rem !important; }
.md-dash-bar i {
  background: linear-gradient(90deg, #0E5348, #147A6A 60%, #B9791F) !important;
}
.md-dash-continue {
  background: #147A6A !important;
  border-radius: 0.85rem !important;
  font-weight: 800 !important;
  box-shadow: 0 10px 22px -12px rgba(20, 122, 106, 0.5) !important;
  transition: filter 0.15s ease, transform 0.15s ease !important;
}
.md-dash-continue:hover { filter: brightness(1.06); transform: translateY(-1px); }
.md-dash-continue:active { transform: translateY(1px); }
.md-dash-continue:focus-visible {
  outline: 3px solid rgba(185, 121, 31, 0.55);
  outline-offset: 2px;
}

.md-context {
  background: #FFFFFF !important;
  border: 1px solid var(--md-border, #DED4BD) !important;
  border-radius: 1.15rem !important;
  box-shadow: 0 8px 24px -16px rgba(14, 83, 72, 0.14) !important;
}
.md-ctx-grade {
  background: #EEF5F3 !important;
  border-color: #BBD8CF !important;
  color: #0E5348 !important;
}
.md-ctx-door {
  background: #FFFFFF !important;
  border-color: #BBD8CF !important;
  color: #0E5348 !important;
}
.md-ctx-door:hover {
  background: #147A6A !important;
  border-color: #0E5348 !important;
  color: #FFFFFF !important;
}

.md-unit-card {
  border-radius: 1rem !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease !important;
}
.md-unit-card:hover { transform: translateY(-2px); }
.md-unit-card:active { transform: translateY(0); }
.md-unit-card.selected {
  box-shadow: 0 14px 32px -12px rgba(14, 83, 72, 0.35) !important;
}

.md-lesson-card {
  border-radius: 1rem !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease !important;
}
.md-lesson-card:hover:not([aria-disabled="true"]) { transform: translateY(-2px); }
.md-lesson-card[data-kind="CURRENT"] {
  box-shadow: 0 12px 28px -14px rgba(185, 121, 31, 0.28) !important;
}
.md-lesson-cta span { border-radius: 999px !important; font-weight: 800 !important; }

.md-chip {
  border-radius: 999px !important;
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease !important;
}
.md-chip:hover:not(:disabled) { transform: translateY(-1px); }
.md-chip.selected {
  background: #147A6A !important;
  border-color: #147A6A !important;
  color: #FFFFFF !important;
}

.md-org-panel {
  border-radius: 1.25rem 0 0 1.25rem !important;
  box-shadow: -20px 0 48px -24px rgba(14, 83, 72, 0.28) !important;
}
.md-org-account {
  background: #FFFFFF !important;
  border: 1px solid var(--md-border, #DED4BD) !important;
  border-radius: 0.9rem !important;
}
.md-org-link { border-radius: 0.7rem !important; }
.md-org-link.is-active {
  background: rgba(20, 122, 106, 0.12) !important;
  color: #147A6A !important;
  font-weight: 800 !important;
}
.md-org-link:hover { background: rgba(20, 122, 106, 0.08) !important; }
.md-org-btn { border-radius: 0.7rem !important; }
.md-org-btn--solid {
  background: #147A6A !important;
  border-color: #147A6A !important;
}

.md-pick-card {
  border-radius: 1rem !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease !important;
}
.md-pick-card:hover:not(:disabled) { transform: translateY(-3px); }

.md-platform :is(button, a, [role="button"]):focus-visible {
  outline: 3px solid rgba(185, 121, 31, 0.55);
  outline-offset: 3px;
}

html[data-theme="dark"] .md-platform {
  background-color: var(--lp-bg, #101A18) !important;
}
html[data-theme="dark"] .md-dash-card,
html[data-theme="dark"] .md-context,
html[data-theme="dark"] .md-org-account {
  background: var(--lp-surface, #192723) !important;
  border-color: var(--lp-line, #30423B) !important;
}
html[data-theme="dark"] .md-topbar {
  background: color-mix(in srgb, var(--lp-bg, #101A18) 92%, transparent) !important;
  border-bottom-color: var(--lp-line, #30423B) !important;
}

@media (prefers-reduced-motion: reduce) {
  .md-welcome-cta,
  .md-dash-continue,
  .md-unit-card,
  .md-lesson-card,
  .md-chip,
  .md-pick-card {
    transition: none !important;
    transform: none !important;
  }
}



/* =========================================================================
   MADAR • THE KNOWLEDGE PALACE
   A visual-only refinement layer. No component, data, or interaction changes.
   ========================================================================= */
.md-platform {
  --md-bg: #FAF6ED;
  --md-surface: #FFFEFA;
  --md-surface-2: #F3EEE2;
  --md-surface-3: #E9E7DA;
  --md-teal: #147A6A;
  --md-teal-deep: #0E5348;
  --md-teal-dark: #093B34;
  --md-gold: #B9791F;
  --md-gold-deep: #855313;
  --md-gold-soft: #F5E9CF;
  --md-border: #E5DCC8;
  --md-border-strong: #CDBD9C;
  --md-text: #213A33;
  --md-text-soft: #40584F;
  --md-muted: #718078;
  background:
    radial-gradient(ellipse at 4% 18%, rgba(185,121,31,.065), transparent 26rem),
    radial-gradient(ellipse at 96% 38%, rgba(20,122,106,.06), transparent 30rem),
    #FAF6ED !important;
  color: var(--md-text);
}

.md-platform::selection { background: rgba(20,122,106,.18); color: #0E5348; }
.md-main { max-width: 1180px; padding-inline: clamp(16px, 3vw, 34px); }
.md-topbar {
  background: rgba(250,246,237,.88) !important;
  border-bottom-color: rgba(205,189,156,.6) !important;
  box-shadow: 0 5px 24px rgba(14,83,72,.035);
}
.md-hero {
  background:
    radial-gradient(ellipse at 12% 20%, rgba(227,192,139,.18), transparent 32%),
    radial-gradient(ellipse at 90% 78%, rgba(20,122,106,.42), transparent 38%),
    linear-gradient(128deg, #093B34 0%, #0E5348 48%, #147A6A 100%);
  border-radius: 0 0 clamp(28px, 5vw, 64px) clamp(28px, 5vw, 64px);
  box-shadow: 0 28px 70px -32px rgba(9,59,52,.72);
}
.md-hero::before {
  width: min(900px, 150vw);
  border-color: rgba(245,233,207,.14);
  box-shadow:
    0 0 0 clamp(38px, 7vw, 86px) rgba(245,233,207,.035),
    0 0 0 clamp(82px, 14vw, 166px) rgba(245,233,207,.025);
}
.md-hero::after { border-color: rgba(227,192,139,.30); }
.md-hero h1 { letter-spacing: -.035em; }
.md-badge {
  background: rgba(250,246,237,.09);
  border-color: rgba(227,192,139,.48);
  color: #F1D8A7;
}
.md-hero-logo {
  border-radius: 16px;
  box-shadow: 0 18px 42px rgba(0,0,0,.22), 0 0 0 1px rgba(227,192,139,.32);
}
.md-corner-compass { opacity: .28; }

.md-dashboard { gap: clamp(22px, 3vw, 34px); }
.md-dashboard > .md-continue,
.md-dashboard > .md-panel,
.md-dash-card,
.md-context {
  border-radius: 22px !important;
}
.md-panel {
  border: 1px solid rgba(205,189,156,.66) !important;
  background: linear-gradient(145deg, #FFFEFA 0%, #FBF7EE 100%) !important;
  box-shadow: 0 2px 0 rgba(205,189,156,.34), 0 18px 48px -32px rgba(14,83,72,.32) !important;
}
.md-panel::before,
.md-continue::before {
  height: 3px;
  background: linear-gradient(90deg, transparent, #147A6A 24%, #B9791F 72%, transparent);
}
.md-panel h2 { color: #0E5348 !important; letter-spacing: -.025em; }
.md-continue {
  background:
    radial-gradient(circle at 8% 10%, rgba(185,121,31,.10), transparent 34%),
    linear-gradient(135deg, #FFFEFA 0%, #F5F0E4 100%) !important;
  border-color: rgba(205,189,156,.7) !important;
  box-shadow: 0 2px 0 rgba(205,189,156,.34), 0 18px 44px -30px rgba(14,83,72,.3) !important;
}
.md-continue .font-black { color: #0E5348 !important; }
.md-continue .md-continue-btn,
.md-dash-continue,
.md-org-btn--solid {
  background: linear-gradient(135deg, #147A6A, #0E5348) !important;
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: 0 5px 0 #093B34, 0 12px 24px -15px rgba(14,83,72,.7) !important;
}
.md-continue .md-continue-btn:hover,
.md-dash-continue:hover,
.md-org-btn--solid:hover { filter: brightness(1.07); }
.md-continue .md-continue-btn:active,
.md-dash-continue:active { transform: translateY(3px); box-shadow: 0 2px 0 #093B34 !important; }

.md-dash-row { gap: clamp(12px, 1.8vw, 20px) !important; }
.md-dash-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(155deg, #FFFEFA 0%, #F7F2E7 100%) !important;
  border: 1px solid rgba(205,189,156,.68) !important;
  box-shadow: 0 3px 0 rgba(205,189,156,.22), 0 14px 32px -26px rgba(14,83,72,.45) !important;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease !important;
}
.md-dash-card::before {
  content: "";
  position: absolute;
  inset-inline-start: 0;
  top: 16%;
  bottom: 16%;
  width: 3px;
  border-radius: 4px;
  background: linear-gradient(180deg, #B9791F, #147A6A);
  opacity: .8;
}
.md-dash-card:hover {
  transform: translateY(-4px);
  border-color: rgba(20,122,106,.42) !important;
  box-shadow: 0 18px 38px -24px rgba(14,83,72,.38) !important;
}
.md-dash-card-title { color: #0E5348 !important; }
.md-dash-card-ico {
  background: linear-gradient(145deg, #E2F0E9, #F5E9CF) !important;
  border: 1px solid rgba(185,121,31,.16);
}
.md-dash-bar { background: #E5E8DC !important; }
.md-dash-bar i { background: linear-gradient(90deg, #0E5348, #147A6A 68%, #B9791F) !important; }

.md-context {
  background: rgba(255,254,250,.86) !important;
  border: 1px solid rgba(205,189,156,.66) !important;
  box-shadow: 0 10px 28px -24px rgba(14,83,72,.35) !important;
}
.md-ctx-grade {
  background: #E8F1EA !important;
  border-color: #C4D9CD !important;
  color: #0E5348 !important;
}
.md-ctx-door {
  border-bottom-width: 3px;
  background: #FFFEFA !important;
  border-color: #D7C7A7 !important;
  color: #0E5348 !important;
}
.md-ctx-door:hover {
  background: #147A6A !important;
  border-color: #0E5348 !important;
  color: #fff !important;
}

.md-dashboard .md-section-label { color: #0E5348 !important; }
.md-dashboard .md-section-label::after { background: linear-gradient(90deg, rgba(205,189,156,.15), #D7C7A7); }
.md-chip {
  background: rgba(255,254,250,.92);
  border-color: #D7C7A7;
  color: #40584F;
  box-shadow: 0 2px 0 rgba(205,189,156,.18);
}
.md-chip:hover:not(:disabled) {
  background: #E8F1EA;
  border-color: #147A6A;
}
.md-chip.selected {
  background: linear-gradient(135deg, #147A6A, #0E5348) !important;
  border-color: #0E5348 !important;
  box-shadow: 0 5px 0 #093B34, 0 10px 22px -15px rgba(14,83,72,.7);
}
.md-chip.selected::before { background: #F1D8A7; }

.md-unit-card {
  border-radius: 18px !important;
  border-color: rgba(205,189,156,.7) !important;
  background: linear-gradient(145deg, #FFFEFA, #F6F0E3) !important;
  box-shadow: 0 3px 0 rgba(205,189,156,.28), 0 12px 30px -26px rgba(14,83,72,.48) !important;
}
.md-unit-card:hover {
  border-color: rgba(20,122,106,.6) !important;
  box-shadow: 0 18px 34px -24px rgba(14,83,72,.48) !important;
}
.md-unit-card.selected {
  border-color: #147A6A !important;
  background: linear-gradient(145deg, #E7F2EC, #FFFEFA) !important;
  box-shadow: 0 0 0 2px rgba(20,122,106,.1), 0 14px 32px -18px rgba(14,83,72,.45) !important;
}
.md-unit-card-progress i { background: linear-gradient(90deg, #0E5348, #147A6A, #B9791F) !important; }

.md-lesson-card {
  border-radius: 18px !important;
  border-color: rgba(205,189,156,.72);
  background: linear-gradient(145deg, #FFFEFA 55%, #F6F0E3);
  box-shadow: 0 3px 0 rgba(205,189,156,.24), 0 12px 28px -24px rgba(14,83,72,.45);
}
.md-lesson-card:hover:not([aria-disabled="true"]) {
  transform: translateY(-3px);
  box-shadow: 0 18px 34px -23px rgba(14,83,72,.45);
}
.md-lesson-card[data-kind="CURRENT"] {
  border-color: #D7B56F !important;
  background: linear-gradient(145deg, #FFFEFA 42%, #F8EFD8) !important;
  box-shadow: 0 0 0 1px rgba(185,121,31,.10), 0 14px 30px -20px rgba(185,121,31,.42) !important;
}
.md-lesson-card[data-kind="COMPLETED"] {
  background: linear-gradient(145deg, #FFFEFA, #EAF3E9) !important;
}
.md-lesson-card[data-kind="SEQUENCE_LOCK"],
.md-lesson-card[data-kind="COMING_SOON"] {
  background: #F0EEE5 !important;
  border-color: #E0DACB !important;
  box-shadow: none !important;
}
.md-lesson-cta span { background: #E8F1EA !important; color: #0E5348 !important; }
.md-lesson-card[data-kind="CURRENT"] .md-lesson-cta { color: #fff !important; }

.md-pick-card {
  border-radius: 18px !important;
  border-color: rgba(205,189,156,.75) !important;
  background: linear-gradient(145deg, #FFFEFA, #F6F0E3) !important;
  box-shadow: 0 3px 0 rgba(205,189,156,.22), 0 14px 30px -26px rgba(14,83,72,.42);
}
.md-pick-card:hover:not(:disabled) {
  border-color: #147A6A !important;
  box-shadow: 0 18px 34px -22px rgba(14,83,72,.4) !important;
}
.md-pick-art { border-radius: 14px; }
.md-pick-card.selected {
  background: linear-gradient(145deg, #0E5348, #147A6A) !important;
  border-color: #0E5348 !important;
  box-shadow: 0 6px 0 #093B34, 0 18px 36px -24px rgba(14,83,72,.65) !important;
}
.md-pick-card.selected .md-pick-title { color: #fff !important; }
.md-pick-num { background: #B9791F !important; border-color: #B9791F !important; }

.md-org-panel {
  background: #FFFEFA !important;
  border-color: #E5DCC8 !important;
}
.md-org-panel-head {
  background: linear-gradient(145deg, #F8F1E4, #FFFEFA) !important;
  border-bottom-color: #E5DCC8 !important;
}
.md-org-brand { color: #0E5348 !important; }
.md-org-account {
  background: linear-gradient(145deg, #F8F1E4, #FFFEFA) !important;
  border-color: #E5DCC8 !important;
}
.md-org-avatar {
  background: linear-gradient(145deg, #147A6A, #0E5348) !important;
  box-shadow: 0 0 0 3px rgba(185,121,31,.13);
}
.md-org-link.is-active {
  background: #E8F1EA !important;
  color: #0E5348 !important;
}
.md-org-link:hover { background: #F3EEE2 !important; }
.md-org-switch { border-color: #E5DCC8 !important; background: #FFFEFA !important; }
.md-org-switch:hover { background: #F8F1E4 !important; border-color: #CDBD9C !important; }

.md-empty {
  background: linear-gradient(145deg, #F8F1E4, #FFFEFA) !important;
  border-color: #D7C7A7 !important;
}
.md-alert.error { border-radius: 16px; }
.md-recent-chip { border-radius: 14px !important; }

@media (max-width: 700px) {
  .md-main { padding-inline: 15px; }
  .md-hero {
    padding-inline: 18px;
    border-radius: 0 0 28px 28px;
  }
  .md-dashboard { gap: 20px; }
  .md-panel { padding: 22px 18px !important; border-radius: 18px !important; }
  .md-dash-card { border-radius: 17px !important; }
  .md-org-panel { border-radius: 20px 0 0 20px !important; }
}
@media (prefers-reduced-motion: reduce) {
  .md-hero::after,
  .md-hero > *,
  .md-dash-card,
  .md-unit-card,
  .md-lesson-card,
  .md-pick-card {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
html[data-theme="dark"] .md-platform {
  --md-bg: #101A18;
  --md-surface: #192723;
  --md-surface-2: #1E2C28;
  --md-surface-3: #243530;
  --md-border: #30423B;
  --md-border-strong: #44584F;
  --md-text: #EAF1ED;
  --md-text-soft: #CBD8D2;
  --md-muted: #A5B7AF;
  background:
    radial-gradient(ellipse at 4% 18%, rgba(185,121,31,.055), transparent 26rem),
    radial-gradient(ellipse at 96% 38%, rgba(20,122,106,.07), transparent 30rem),
    #101A18 !important;
}
html[data-theme="dark"] .md-panel,
html[data-theme="dark"] .md-continue,
html[data-theme="dark"] .md-unit-card,
html[data-theme="dark"] .md-lesson-card,
html[data-theme="dark"] .md-pick-card {
  background: linear-gradient(145deg, #192723, #1B2A25) !important;
  border-color: #30423B !important;
  color: #EAF1ED;
}
html[data-theme="dark"] .md-panel h2,
html[data-theme="dark"] .md-continue .font-black,
html[data-theme="dark"] .md-lesson-body h3,
html[data-theme="dark"] .md-unit-card,
html[data-theme="dark"] .md-dash-card-title { color: #B5DDD2 !important; }
html[data-theme="dark"] .md-context,
html[data-theme="dark"] .md-dash-card {
  background: linear-gradient(145deg, #192723, #1E2C28) !important;
  border-color: #30423B !important;
  color: #EAF1ED;
}
html[data-theme="dark"] .md-chip,
html[data-theme="dark"] .md-ctx-door {
  background: #1E2C28 !important;
  border-color: #44584F !important;
  color: #CBD8D2 !important;
}
html[data-theme="dark"] .md-chip.selected { background: #147A6A !important; color: #fff !important; }
html[data-theme="dark"] .md-lesson-card[data-kind="CURRENT"] { background: linear-gradient(145deg, #192723, #352D1D) !important; }
html[data-theme="dark"] .md-lesson-card[data-kind="SEQUENCE_LOCK"],
html[data-theme="dark"] .md-lesson-card[data-kind="COMING_SOON"] { background: #202C28 !important; }
html[data-theme="dark"] .md-org-panel,
html[data-theme="dark"] .md-org-panel-head,
html[data-theme="dark"] .md-org-account,
html[data-theme="dark"] .md-org-switch {
  background: #192723 !important;
  border-color: #30423B !important;
}



/* ====================================================================== */
/* مَدَار — PALACE IDENTITY LAYER (appended; the rules above are untouched) */
/* ====================================================================== */
/* =============================================================================
   مَدَار — PREMIUM IDENTITY LAYER  ("الأطلس التراثي" / heritage atlas)
   Parchment + deep forest green + calm green + restrained gold.
   Soft layered depth (never hard 3D): inner highlight, tinted multi-layer shadows, embossed hairlines.
   VISUAL ONLY — no markup contract, no logic. Everything below is scoped to .md-platform, and
   written with a higher specificity than the global skin injected later by the app, so it wins
   without touching that file. Light/dark follow the app's own switch:
   html[data-theme="dark"]  or  .md-platform.is-dark.
============================================================================= */

/* ---- 1) TOKENS (light) — also re-points the legacy --duo-* / --md-* / --acc* tokens in this scope ---- */
html body .md-platform {
  --pm-sh: 10, 63, 54;
  --pm-bg: #FAF6ED; --pm-bg-2: #F3ECDB;
  --pm-card: #FFFEFA; --pm-card-2: #FBF7EC; --pm-track: #EDE5D0;
  --pm-hair: #E7DEC8; --pm-hair-2: #DED4BD;
  --pm-text: #16302A; --pm-text-2: #3F5851; --pm-text-3: #6B7C75;
  --pm-g900: #0A3F36; --pm-g800: #0E5348; --pm-g700: #147A6A; --pm-g600: #2A9482; --pm-g300: #9FCDBB; --pm-g100: #DCEEE6; --pm-g50: #EDF6F1;
  --pm-accent: #147A6A; --pm-accent-hi: #1C8F7D; --pm-accent-d: #0E5348; --pm-accent-ink: #0E5348; --pm-tint: #E2F1EC;
  --pm-gold: #B9791F; --pm-gold-2: #D49A3A; --pm-gold-3: #EBC47A; --pm-gold-line: #E4BF7A; --pm-gold-soft: #F8EBCB; --pm-gold-ink: #6B430E; --pm-gold-tint: #FCF4E0;
  --pm-bronze: #A7733A; --pm-sage: #6F9A7B; --pm-olive: #7C8B3D; --pm-sea: #2A8A86;
  --pm-font-display: "Amiri", "Cairo", "Tajawal", serif;
  --pm-font-ui: "Cairo", "Tajawal", "Noto Sans Arabic", system-ui, sans-serif;
  --pm-ease: cubic-bezier(0.22, 0.8, 0.3, 1);
  --pm-s1: inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 1px 2px rgba(var(--pm-sh), 0.07), 0 4px 10px -3px rgba(var(--pm-sh), 0.09);
  --pm-s2: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(185, 121, 31, 0.10), 0 2px 4px rgba(var(--pm-sh), 0.06), 0 14px 28px -12px rgba(var(--pm-sh), 0.20);
  --pm-s3: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 3px 6px rgba(var(--pm-sh), 0.08), 0 24px 44px -16px rgba(var(--pm-sh), 0.30), 0 0 0 1px rgba(185, 121, 31, 0.30);
  --pm-pit: inset 0 2px 5px rgba(var(--pm-sh), 0.14), 0 1px 0 rgba(255, 255, 255, 0.75);
  --pm-lattice: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23EBC47A' stroke-width='1'%3E%3Cpath d='M28 4l7 17 17 7-17 7-7 17-7-17-17-7 17-7z'/%3E%3Cpath d='M0 0l8 8M56 0l-8 8M0 56l8-48M56 56l-8-8' opacity='.5'/%3E%3Ccircle cx='28' cy='28' r='3'/%3E%3C/g%3E%3C/svg%3E");

  /* legacy tokens → premium palette (so any older rule in this page adopts it too) */
  --duo-green: var(--pm-accent); --duo-green-d: var(--pm-accent-d); --duo-green-s: var(--pm-tint); --duo-green-ink: var(--pm-accent-ink);
  --duo-blue: var(--pm-sea); --duo-blue-d: #1E6C69; --duo-blue-s: var(--pm-tint); --duo-blue-ink: var(--pm-accent-ink);
  --duo-purple: var(--pm-sage); --duo-purple-d: #52795F; --duo-purple-s: #EAF1EA; --duo-purple-ink: #3C6650;
  --duo-orange: var(--pm-gold-2); --duo-orange-d: var(--pm-gold); --duo-orange-s: var(--pm-gold-tint); --duo-orange-ink: var(--pm-gold-ink);
  --duo-yellow: var(--pm-gold-2); --duo-yellow-d: var(--pm-gold); --duo-yellow-s: var(--pm-gold-soft); --duo-yellow-ink: var(--pm-gold-ink);
  --duo-pink: var(--pm-bronze); --duo-pink-d: #85561F; --duo-pink-s: #F5E8D8; --duo-pink-ink: #6E4416;
  --duo-red: #B4513F; --duo-red-d: #8F3B2C; --duo-red-s: #F7E4DE;
  --duo-ink: var(--pm-text); --duo-ink-soft: var(--pm-text-2); --duo-muted: var(--pm-text-3);
  --duo-line: var(--pm-hair); --duo-line-d: var(--pm-hair-2); --duo-snow: var(--pm-card-2);
  --duo-font-display: var(--pm-font-ui); --duo-font-body: var(--pm-font-ui);
  --md-bg: var(--pm-bg); --md-surface: var(--pm-card); --md-surface-2: var(--pm-g50); --md-surface-3: var(--pm-track);
  --md-teal: var(--pm-accent); --md-teal-deep: var(--pm-accent-d); --md-teal-dark: var(--pm-accent-ink); --md-teal-soft: var(--pm-tint); --md-teal-light: var(--pm-g300);
  --md-gold: var(--pm-gold); --md-gold-deep: var(--pm-gold-ink); --md-gold-light: var(--pm-gold-2); --md-gold-soft: var(--pm-gold-soft); --md-sienna: var(--pm-bronze);
  --md-text: var(--pm-text); --md-text-soft: var(--pm-text-2); --md-muted: var(--pm-text-3); --md-border: var(--pm-hair); --md-border-strong: var(--pm-hair-2);
  --md-shadow-sm: var(--pm-s1); --md-shadow-md: var(--pm-s2); --md-shadow-lg: var(--pm-s3);
  --md-success: var(--pm-accent); --md-blue: var(--pm-sea);
  --md-rainbow: linear-gradient(90deg, transparent, var(--pm-gold-3) 20%, var(--pm-gold) 50%, var(--pm-gold-3) 80%, transparent);
  --acc: var(--pm-accent); --acc-deep: var(--pm-accent-d); --acc-ink: var(--pm-accent-ink); --acc-soft: var(--pm-tint); --acc-light: var(--pm-g300); --acc-glow: rgba(20, 122, 106, 0.3);
}

/* ---- tokens (dark) — same names, so every rule below flips automatically ---- */
html[data-theme="dark"] body .md-platform, html body .md-platform.is-dark {
  --pm-sh: 0, 0, 0;
  --pm-bg: #0B1512; --pm-bg-2: #0F1C18;
  --pm-card: #14231E; --pm-card-2: #182A24; --pm-track: #0E1A16;
  --pm-hair: #27403A; --pm-hair-2: #34544C;
  --pm-text: #EAF1ED; --pm-text-2: #C5D5CD; --pm-text-3: #8FA89E;
  --pm-accent: #2A9482; --pm-accent-hi: #36A894; --pm-accent-d: #176B5D; --pm-accent-ink: #A5DDCA; --pm-tint: #1A302A;
  --pm-gold: #D6AE5B; --pm-gold-2: #E2BE6E; --pm-gold-3: #8F7535; --pm-gold-line: #6E5A28; --pm-gold-soft: #2F2A19; --pm-gold-ink: #F0CC86; --pm-gold-tint: #262213;
  --pm-s1: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 2px rgba(0, 0, 0, 0.4), 0 6px 14px -4px rgba(0, 0, 0, 0.45);
  --pm-s2: inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(214, 174, 91, 0.08), 0 2px 4px rgba(0, 0, 0, 0.4), 0 18px 34px -14px rgba(0, 0, 0, 0.6);
  --pm-s3: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 3px 6px rgba(0, 0, 0, 0.45), 0 28px 50px -18px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(214, 174, 91, 0.4);
  --pm-pit: inset 0 2px 6px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.04);
  --duo-purple-s: #1E2D26; --duo-pink-s: #2B241A; --duo-red-s: #2E1D19;
  --acc-glow: rgba(42, 148, 130, 0.4);
}

/* six accent personalities for units / grade cards / recent chips — greens, gold and earth only */
html body .md-platform [data-accent="0"], html body .md-platform .md-pick-grid > :nth-child(6n+1), html body .md-platform .md-features-grid > :nth-child(6n+1), html body .md-platform .md-recent-row > :nth-child(6n+1) {
  --acc: #147A6A; --acc-deep: #0E5348; --acc-ink: #0E5348; --acc-soft: #E3F1EA; --acc-light: #9FCDBB; --acc-glow: rgba(20, 122, 106, 0.3);
}
html body .md-platform [data-accent="1"], html body .md-platform .md-pick-grid > :nth-child(6n+2), html body .md-platform .md-features-grid > :nth-child(6n+2), html body .md-platform .md-recent-row > :nth-child(6n+2) {
  --acc: #2A8A86; --acc-deep: #1B5F5C; --acc-ink: #17504D; --acc-soft: #E0F1F0; --acc-light: #9ACFCB; --acc-glow: rgba(42, 138, 134, 0.3);
}
html body .md-platform [data-accent="2"], html body .md-platform .md-pick-grid > :nth-child(6n+3), html body .md-platform .md-features-grid > :nth-child(6n+3), html body .md-platform .md-recent-row > :nth-child(6n+3) {
  --acc: #B9791F; --acc-deep: #8A5A14; --acc-ink: #6B430E; --acc-soft: #F8EBCB; --acc-light: #EBC47A; --acc-glow: rgba(185, 121, 31, 0.32);
}
html body .md-platform [data-accent="3"], html body .md-platform .md-pick-grid > :nth-child(6n+4), html body .md-platform .md-features-grid > :nth-child(6n+4), html body .md-platform .md-recent-row > :nth-child(6n+4) {
  --acc: #6F9A7B; --acc-deep: #4B7558; --acc-ink: #34593F; --acc-soft: #E8F1EA; --acc-light: #B6D3BE; --acc-glow: rgba(111, 154, 123, 0.3);
}
html body .md-platform [data-accent="4"], html body .md-platform .md-pick-grid > :nth-child(6n+5), html body .md-platform .md-features-grid > :nth-child(6n+5), html body .md-platform .md-recent-row > :nth-child(6n+5) {
  --acc: #A7733A; --acc-deep: #7C5122; --acc-ink: #6A431A; --acc-soft: #F6E9D8; --acc-light: #DDBB91; --acc-glow: rgba(167, 115, 58, 0.3);
}
html body .md-platform [data-accent="5"], html body .md-platform .md-pick-grid > :nth-child(6n+6), html body .md-platform .md-features-grid > :nth-child(6n+6), html body .md-platform .md-recent-row > :nth-child(6n+6) {
  --acc: #7C8B3D; --acc-deep: #566327; --acc-ink: #475320; --acc-soft: #EEF1DD; --acc-light: #C5CE94; --acc-glow: rgba(124, 139, 61, 0.3);
}
html[data-theme="dark"] body .md-platform [data-accent="0"], html body .md-platform.is-dark [data-accent="0"], html[data-theme="dark"] body .md-platform .md-pick-grid > :nth-child(6n+1), html body .md-platform.is-dark .md-pick-grid > :nth-child(6n+1), html[data-theme="dark"] body .md-platform .md-recent-row > :nth-child(6n+1), html body .md-platform.is-dark .md-recent-row > :nth-child(6n+1) { --acc-soft: #1A302A; --acc-ink: #A5DDCA; --acc-light: #2F6B5B; }
html[data-theme="dark"] body .md-platform [data-accent="1"], html body .md-platform.is-dark [data-accent="1"], html[data-theme="dark"] body .md-platform .md-pick-grid > :nth-child(6n+2), html body .md-platform.is-dark .md-pick-grid > :nth-child(6n+2), html[data-theme="dark"] body .md-platform .md-recent-row > :nth-child(6n+2), html body .md-platform.is-dark .md-recent-row > :nth-child(6n+2) { --acc-soft: #19302F; --acc-ink: #9ADAD5; --acc-light: #2B6E6A; }
html[data-theme="dark"] body .md-platform [data-accent="2"], html body .md-platform.is-dark [data-accent="2"], html[data-theme="dark"] body .md-platform .md-pick-grid > :nth-child(6n+3), html body .md-platform.is-dark .md-pick-grid > :nth-child(6n+3), html[data-theme="dark"] body .md-platform .md-recent-row > :nth-child(6n+3), html body .md-platform.is-dark .md-recent-row > :nth-child(6n+3) { --acc-soft: #2B2616; --acc-ink: #F0CC86; --acc-light: #7A5A22; }
html[data-theme="dark"] body .md-platform [data-accent="3"], html body .md-platform.is-dark [data-accent="3"], html[data-theme="dark"] body .md-platform .md-pick-grid > :nth-child(6n+4), html body .md-platform.is-dark .md-pick-grid > :nth-child(6n+4), html[data-theme="dark"] body .md-platform .md-recent-row > :nth-child(6n+4), html body .md-platform.is-dark .md-recent-row > :nth-child(6n+4) { --acc-soft: #1C2D23; --acc-ink: #B9DCC3; --acc-light: #4B7558; }
html[data-theme="dark"] body .md-platform [data-accent="4"], html body .md-platform.is-dark [data-accent="4"], html[data-theme="dark"] body .md-platform .md-pick-grid > :nth-child(6n+5), html body .md-platform.is-dark .md-pick-grid > :nth-child(6n+5), html[data-theme="dark"] body .md-platform .md-recent-row > :nth-child(6n+5), html body .md-platform.is-dark .md-recent-row > :nth-child(6n+5) { --acc-soft: #2A2218; --acc-ink: #E5C197; --acc-light: #7C5122; }
html[data-theme="dark"] body .md-platform [data-accent="5"], html body .md-platform.is-dark [data-accent="5"], html[data-theme="dark"] body .md-platform .md-pick-grid > :nth-child(6n+6), html body .md-platform.is-dark .md-pick-grid > :nth-child(6n+6), html[data-theme="dark"] body .md-platform .md-recent-row > :nth-child(6n+6), html body .md-platform.is-dark .md-recent-row > :nth-child(6n+6) { --acc-soft: #232A17; --acc-ink: #CDD79A; --acc-light: #566327; }

/* ---- 2) PAGE — parchment with soft light pools, not a flat white sheet ---- */
html body .md-platform {
  background-color: var(--pm-bg) !important;
  background-image:
    radial-gradient(1100px 520px at 88% -6%, rgba(212, 154, 58, 0.13), transparent 62%),
    radial-gradient(900px 480px at -8% 6%, rgba(20, 122, 106, 0.09), transparent 58%),
    linear-gradient(180deg, var(--pm-bg) 0%, var(--pm-bg-2) 100%) !important;
  background-size: auto !important;
  color: var(--pm-text);
  font-family: var(--pm-font-ui);
}
html body .md-platform :is(h1, h2, h3, button, .md-chip, .md-count, .md-pick-title, .md-unit-card-title, .md-lesson-cta, .md-section-label, .md-rail-label) { font-family: var(--pm-font-ui); }
html body .md-platform :is(.md-welcome-title, .md-pick-head h2, .md-lessons-title, .md-dash-card-title, .md-org-brand, .duo-saved-hero h1, .duo-saved-title, .duo-modal :is(h2, h3)) { font-family: var(--pm-font-display); }
html body .md-platform ::selection { background: var(--pm-gold-3); color: var(--pm-g900); }
html body .md-platform :is(a, button, [role="button"], input, select, textarea):focus-visible { outline: 2px solid var(--pm-gold-2); outline-offset: 3px; border-radius: 12px; }
html body .md-platform .md-main { position: relative; z-index: 2; }

/* ---- 3) TOP BAR — parchment strip with a gold hairline and a quiet shadow ---- */
html body .md-platform .md-topbar {
  background: linear-gradient(180deg, rgba(255, 253, 248, 0.92), rgba(250, 244, 229, 0.90)) !important;
  border-bottom: 1px solid var(--pm-hair) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 10px 22px -16px rgba(var(--pm-sh), 0.35);
  backdrop-filter: none;
}
html[data-theme="dark"] body .md-platform .md-topbar, html body .md-platform.is-dark .md-topbar { background: linear-gradient(180deg, rgba(20, 35, 30, 0.94), rgba(15, 28, 24, 0.92)) !important; }
html body .md-platform .md-topbar::after { content: ""; position: absolute; inset-inline: 0; bottom: -1px; height: 1px; pointer-events: none; background: linear-gradient(90deg, transparent, var(--pm-gold-line) 22%, var(--pm-gold-2) 50%, var(--pm-gold-line) 78%, transparent); opacity: 0.9; }
html body .md-platform .md-org-trigger {
  background: radial-gradient(circle at 32% 24%, var(--pm-card), var(--pm-card-2)) !important;
  border: 1px solid var(--pm-hair-2) !important; color: var(--pm-accent-ink) !important;
  box-shadow: var(--pm-s1), inset 0 -2px 3px rgba(var(--pm-sh), 0.06) !important;
  transition: transform 0.25s var(--pm-ease), box-shadow 0.25s var(--pm-ease), border-color 0.25s ease;
}
html body .md-platform .md-org-trigger:hover { transform: translateY(-1px); border-color: var(--pm-gold-2) !important; box-shadow: var(--pm-s2) !important; }
html body .md-platform .md-org-trigger:active { transform: translateY(0); box-shadow: var(--pm-pit) !important; }
html body .md-platform .md-continue-chip {
  position: relative; border-radius: 16px; border: 1px solid var(--pm-gold-line);
  background: linear-gradient(180deg, var(--pm-gold-tint), var(--pm-gold-soft)); color: var(--pm-gold-ink);
  box-shadow: var(--pm-s1); transition: transform 0.25s var(--pm-ease), box-shadow 0.25s var(--pm-ease);
}
html body .md-platform .md-continue-chip:hover { transform: translateY(-2px); box-shadow: var(--pm-s2); border-color: var(--pm-gold-2); }
html body .md-platform .md-continue-chip-icon { background: radial-gradient(circle at 30% 25%, #F2D391, var(--pm-gold-2) 58%, var(--pm-gold)); color: #4A2E06; border-radius: 50%; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -2px 3px rgba(107, 67, 14, 0.35), 0 2px 5px rgba(var(--pm-sh), 0.25); }
html body .md-platform .md-continue-chip-text small { color: var(--pm-gold-ink); opacity: 0.85; }
html body .md-platform .md-continue-chip-label { color: var(--pm-gold-ink); font-weight: 800; }
html body .md-platform .md-login-btn {
  background: linear-gradient(180deg, var(--pm-accent-hi), var(--pm-accent)) !important; color: #FFFFFF !important;
  border: 1px solid var(--pm-accent-d) !important; border-radius: 13px !important; padding: 8px 20px !important; font-weight: 800; letter-spacing: 0.01em;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -2px 0 rgba(0, 0, 0, 0.16), 0 8px 16px -8px rgba(var(--pm-sh), 0.55) !important;
  transition: transform 0.25s var(--pm-ease), box-shadow 0.25s var(--pm-ease), filter 0.2s ease;
}
html body .md-platform .md-login-btn:hover { transform: translateY(-2px); filter: brightness(1.06); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.16), 0 14px 22px -10px rgba(var(--pm-sh), 0.6) !important; }
html body .md-platform .md-login-btn:active { transform: translateY(0); filter: brightness(0.97); }

/* ---- 4) ATLAS BACKDROP — gold map lines, dust and astrolabe rings (decor.jsx), purposeful & faint ---- */
html body .md-platform .md-bg-layer { opacity: 1; }
html body .md-platform .md-bg-layer::before, html body .md-platform .md-bg-layer::after { display: none; }
html body .md-platform .md-atlas { opacity: 0.55; color: var(--pm-gold); filter: none; }
html[data-theme="dark"] body .md-platform .md-atlas, html body .md-platform.is-dark .md-atlas { opacity: 0.4; }
html body .md-platform .md-nebula { background: radial-gradient(circle, rgba(212, 154, 58, 0.10) 0%, rgba(20, 122, 106, 0.06) 40%, transparent 68%); }
html body .md-platform .md-star:nth-child(n) { background: var(--pm-gold-2); border-radius: 50%; opacity: 0.55; box-shadow: 0 0 6px rgba(212, 154, 58, 0.5); }
html body .md-platform .md-orbit { border: 1px dashed var(--pm-gold-line) !important; opacity: 0.5; }
html body .md-platform .md-orbit.active { opacity: 0.9; border-style: solid !important; box-shadow: 0 0 22px -6px rgba(212, 154, 58, 0.45); }
html body .md-platform .md-planet { top: -5px; width: 9px; height: 9px; background: var(--pm-gold-2) !important; opacity: 0.95; box-shadow: 0 0 0 3px rgba(212, 154, 58, 0.22) !important; }
html body .md-platform .md-corner-compass { color: var(--pm-gold); opacity: 0.22; filter: none; }
html[data-theme="dark"] body .md-platform .md-corner-compass, html body .md-platform.is-dark .md-corner-compass { opacity: 0.3; }

/* ---- 5) WELCOME — the "title page": deep forest, gold frame, lattice, soft light ---- */
html body .md-platform .md-welcome {
  border-radius: 28px; border: 1px solid rgba(235, 196, 122, 0.30);
  background:
    radial-gradient(760px 300px at 94% -24%, rgba(235, 196, 122, 0.34), transparent 62%),
    radial-gradient(620px 280px at -2% 118%, rgba(42, 148, 130, 0.50), transparent 62%),
    linear-gradient(135deg, #08382F 0%, #0E5348 48%, #147A6A 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), inset 0 -1px 0 rgba(0, 0, 0, 0.28), 0 2px 5px rgba(var(--pm-sh), 0.16), 0 30px 54px -26px rgba(8, 56, 47, 0.72);
}
html body .md-platform .md-welcome::before { content: ""; position: absolute; inset: 9px; border-radius: 20px; border: 1px solid rgba(235, 196, 122, 0.28); pointer-events: none; z-index: 0; }
html body .md-platform .md-welcome::after { content: ""; position: absolute; inset-inline-end: -64px; top: -64px; width: 280px; height: 280px; border-radius: 50%; pointer-events: none; z-index: 0; opacity: 0.55;
  background: repeating-radial-gradient(circle at center, transparent 0 24px, rgba(235, 196, 122, 0.22) 24px 25px);
  -webkit-mask-image: radial-gradient(circle at center, #000 18%, transparent 72%); mask-image: radial-gradient(circle at center, #000 18%, transparent 72%); }
html body .md-platform .md-welcome-orb--a { background: rgba(235, 196, 122, 0.55); }
html body .md-platform .md-welcome-orb--b { background: rgba(159, 205, 187, 0.22); }
html body .md-platform .md-welcome-grid {
  background-image: var(--pm-lattice); background-size: 56px 56px; opacity: 0.20;
  -webkit-mask-image: radial-gradient(ellipse 85% 75% at 72% 30%, #000 14%, transparent 74%); mask-image: radial-gradient(ellipse 85% 75% at 72% 30%, #000 14%, transparent 74%);
}
html body .md-platform .md-welcome-kicker { display: inline-flex; align-items: center; gap: 10px; color: var(--pm-gold-3); font-size: 0.8rem; font-weight: 800; letter-spacing: 0.04em; }
html body .md-platform .md-welcome-kicker::before { content: ""; width: 26px; height: 1px; background: linear-gradient(90deg, transparent, var(--pm-gold-3)); }
html body .md-platform .md-welcome-title { font-family: var(--pm-font-display); font-weight: 700; font-size: clamp(1.6rem, 3.8vw, 2.2rem); line-height: 1.5; color: #FFFBF0; text-shadow: 0 2px 14px rgba(0, 0, 0, 0.30); }
html body .md-platform .md-welcome-sub { color: rgba(255, 249, 232, 0.86); font-weight: 600; }
html body .md-platform .md-welcome-cta {
  border-radius: 18px; border: 1px solid rgba(235, 196, 122, 0.75);
  background: linear-gradient(180deg, #FFFDF6, #F6ECD3); color: var(--pm-g800);
  box-shadow: inset 0 1px 0 #fff, inset 0 -2px 0 rgba(185, 121, 31, 0.14), 0 14px 26px -12px rgba(0, 0, 0, 0.55);
  transition: transform 0.28s var(--pm-ease), box-shadow 0.28s var(--pm-ease);
}
html body .md-platform .md-welcome-cta:hover { transform: translateY(-3px); box-shadow: inset 0 1px 0 #fff, inset 0 -2px 0 rgba(185, 121, 31, 0.16), 0 20px 32px -12px rgba(0, 0, 0, 0.6), 0 0 0 3px rgba(235, 196, 122, 0.35); }
html body .md-platform .md-welcome-cta:active { transform: translateY(-1px); }
html body .md-platform .md-welcome-cta-ico { background: linear-gradient(160deg, var(--pm-g700), var(--pm-g900)); color: var(--pm-gold-3); border-radius: 12px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 0 0 1px rgba(235, 196, 122, 0.5), 0 4px 8px -2px rgba(8, 56, 47, 0.5); }
html body .md-platform .md-welcome-cta-text b { color: var(--pm-g800); }
html body .md-platform .md-welcome-cta-text small { color: #5E6F68; }

/* floating hint cards in the hero */
html body .md-platform .md-scatter-inner { border: 1px solid var(--pm-gold-line); background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s2); border-radius: 14px; }
html body .md-platform .md-scatter-icon { background: linear-gradient(160deg, var(--pm-tint), var(--pm-g100)); box-shadow: inset 0 0 0 1px rgba(var(--pm-sh), 0.08); border-radius: 10px; }
html body .md-platform .md-scatter-title { color: var(--pm-accent-ink); font-family: var(--pm-font-ui); font-weight: 800; }
html body .md-platform .md-scatter-sub { color: var(--pm-text-3); }

/* ---- 6) PANEL + GRADE / STAGE PICKER — each choice is a "book cover" with a spine, a recessed plate and a gold coin ---- */
html body .md-platform .md-panel {
  position: relative; border-radius: 28px !important; border: 1px solid var(--pm-hair) !important;
  background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; box-shadow: var(--pm-s2) !important;
}
html body .md-platform .md-panel::before { content: ""; display: block !important; position: absolute; inset-inline: 28px; top: 0; height: 3px; border-radius: 0 0 8px 8px; background: linear-gradient(90deg, transparent, var(--pm-gold-2), transparent); opacity: 0.9; }
html body .md-platform .md-pick-head-icon { background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 62%, var(--pm-gold)); border: 1px solid #9A6417; border-radius: 50%; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65), inset 0 -3px 4px rgba(107, 67, 14, 0.3), 0 5px 10px -3px rgba(var(--pm-sh), 0.3); animation: none; }
html body .md-platform .md-pick-head h2 { font-family: var(--pm-font-display); font-size: 1.5rem !important; font-weight: 700; color: var(--pm-text); }
html body .md-platform .md-pick-head p { color: var(--pm-text-2) !important; font-weight: 600; }
html body .md-platform .md-pick-label { display: flex; align-items: center; gap: 10px; color: var(--pm-text-2) !important; font-weight: 800; }
html body .md-platform .md-pick-label::before { content: ""; width: 7px; height: 7px; transform: rotate(45deg); background: var(--pm-gold-2); box-shadow: 0 0 0 3px rgba(212, 154, 58, 0.2); flex: none; }
html body .md-platform .md-pick-label::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, var(--pm-hair-2), transparent); }
html body .md-platform .md-pick-card {
  position: relative; overflow: hidden; border-radius: 22px; border: 1px solid var(--pm-hair); border-top-color: var(--pm-hair);
  background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s1); color: var(--acc-ink);
  transition: transform 0.3s var(--pm-ease), box-shadow 0.3s var(--pm-ease), border-color 0.3s ease, background 0.3s ease; animation: pm-rise 0.55s var(--pm-ease) both;
}
html body .md-platform .md-pick-card::before { content: ""; position: absolute; inset-block: 14px; inset-inline-start: 0; width: 4px; border-radius: 4px; background: linear-gradient(180deg, var(--acc), var(--acc-deep)); opacity: 0.85; transition: opacity 0.3s ease, inset-block 0.3s var(--pm-ease); }
html body .md-platform .md-pick-card:hover:not(:disabled) { transform: translateY(-5px); border-color: var(--pm-gold-line); background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s3); }
html body .md-platform .md-pick-card:hover:not(:disabled)::before { inset-block: 8px; opacity: 1; }
html body .md-platform .md-pick-card:active:not(:disabled) { transform: translateY(-1px); box-shadow: var(--pm-s1); }
html body .md-platform .md-pick-art, html body .md-platform .md-pick-card:hover:not(:disabled) .md-pick-art {
  border-radius: 16px; background: radial-gradient(120% 95% at 50% 0%, var(--acc-soft), var(--pm-card-2));
  border: 1px solid rgba(var(--pm-sh), 0.07); box-shadow: inset 0 2px 6px rgba(var(--pm-sh), 0.10), inset 0 -1px 0 rgba(255, 255, 255, 0.7);
}
html body .md-platform .md-pick-art .md-art { transition: transform 0.45s var(--pm-ease); filter: saturate(0.92); }
html body .md-platform .md-pick-card:hover:not(:disabled) .md-pick-art .md-art { transform: scale(1.06) translateY(-2px); }
html body .md-platform .md-pick-title { color: var(--acc-ink); font-weight: 800; }
html body .md-platform .md-pick-num { width: 30px; height: 30px; border: 1px solid #9A6417; color: #4A2E06; background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 58%, var(--pm-gold)); border-radius: 50%; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(107, 67, 14, 0.35), 0 3px 6px rgba(var(--pm-sh), 0.28); font-family: var(--pm-font-display); font-weight: 700; }
html body .md-platform .md-pick-card.selected {
  background: linear-gradient(160deg, var(--pm-g800), var(--pm-g900)); border-color: var(--pm-gold-2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 0 0 2px var(--pm-gold-2), 0 22px 36px -16px rgba(8, 56, 47, 0.7);
}
html body .md-platform .md-pick-card.selected::before { background: linear-gradient(180deg, var(--pm-gold-3), var(--pm-gold)); opacity: 1; }
html body .md-platform .md-pick-card.selected .md-pick-title { color: #FFF7E4; }
html body .md-platform .md-pick-card.selected .md-pick-art { background: radial-gradient(120% 95% at 50% 0%, #FFFDF6, #F3EAD2); }
html body .md-platform .md-pick-card.selected::after { content: "✓"; position: absolute; top: 9px; inset-inline-end: 9px; z-index: 2; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 60%, var(--pm-gold)); color: #4A2E06; font-size: 0.85rem; font-weight: 900; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 3px 6px rgba(0, 0, 0, 0.35); }
html body .md-platform .md-pick-card.selected .md-pick-num { background: #FFF7E4; border-color: var(--pm-gold-3); color: var(--pm-g800); }

/* ---- 7) CONTEXT BAR — a ledger strip; the term switch is a recessed track with a raised green tab ---- */
html body .md-platform .md-context { border-radius: 20px !important; border: 1px solid var(--pm-hair) !important; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; box-shadow: var(--pm-s1) !important; }
html body .md-platform .md-context::before { display: none; }
html body .md-platform .md-ctx-grade { position: relative; border-radius: 15px; border: 1px solid var(--pm-gold-line); background: linear-gradient(180deg, var(--pm-gold-tint), var(--pm-gold-soft)); color: var(--pm-gold-ink); box-shadow: var(--pm-s1); font-weight: 800; transition: box-shadow 0.25s var(--pm-ease), transform 0.25s var(--pm-ease); }
html body .md-platform .md-ctx-grade:hover { transform: none; background: linear-gradient(180deg, var(--pm-gold-tint), var(--pm-gold-soft)); border-color: var(--pm-gold-2); box-shadow: var(--pm-s2); }
html body .md-platform .md-ctx-grade-text { color: var(--pm-gold-ink); }
html body .md-platform .md-ctx-door { border: 1px solid var(--pm-gold-line); border-bottom-width: 1px; border-radius: 12px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); color: var(--pm-gold-ink); box-shadow: var(--pm-s1); }
html body .md-platform .md-ctx-door:hover { background: linear-gradient(180deg, var(--pm-g700), var(--pm-g800)); border-color: var(--pm-g800); color: #FFF7E4; }
html body .md-platform .md-ctx-terms { padding: 4px; gap: 4px; border-radius: 16px; border: 1px solid var(--pm-hair); background: var(--pm-track); box-shadow: var(--pm-pit); }
html body .md-platform .md-chip {
  border-radius: 13px; border: 1px solid transparent; background: transparent; color: var(--pm-text-2); box-shadow: none; font-weight: 800;
  transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s var(--pm-ease), transform 0.25s var(--pm-ease);
}
html body .md-platform .md-chip:hover:not(:disabled):not(.selected) { background: rgba(255, 255, 255, 0.6); border-color: var(--pm-hair); color: var(--pm-text) !important; box-shadow: var(--pm-s1); transform: none; }
html body .md-platform .md-chip.selected, html body .md-platform .md-ctx-terms .md-chip.selected {
  background: linear-gradient(180deg, var(--pm-accent-hi), var(--pm-accent)); border-color: var(--pm-accent-d); color: #FFFFFF !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -2px 0 rgba(0, 0, 0, 0.16), 0 6px 12px -5px rgba(var(--pm-sh), 0.55);
}
html body .md-platform .md-chip.selected::before { background: var(--pm-gold-3); }
html[data-theme="dark"] body .md-platform .md-ctx-terms .md-chip:hover:not(.selected), html body .md-platform.is-dark .md-ctx-terms .md-chip:hover:not(.selected) { background: rgba(255, 255, 255, 0.06); }

/* ---- 8) PROGRESS + STATS — the "ledger cards": a side rule, an embossed icon plate, an engraved figure, a gloss bar ---- */
html body .md-platform .md-dash-card {
  position: relative; overflow: hidden; border-radius: 26px; border: 1px solid var(--pm-hair);
  background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s2); color: var(--pm-text);
  transition: box-shadow 0.35s var(--pm-ease), transform 0.35s var(--pm-ease), border-color 0.35s ease;
}
html body .md-platform .md-dash-card:hover { transform: translateY(-3px); box-shadow: var(--pm-s3); }
html body .md-platform .md-dash-card::before { content: ""; position: absolute; inset-inline-start: 0; top: 22px; bottom: 22px; width: 4px; border-radius: 4px; background: linear-gradient(180deg, var(--pm-gold-2), var(--pm-accent)); }
html body .md-platform .md-dash-card-ico { width: 2.3rem; height: 2.3rem; border-radius: 14px; background: linear-gradient(160deg, var(--pm-tint), var(--pm-g100)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 0 0 1px rgba(var(--pm-sh), 0.08), 0 4px 8px -3px rgba(var(--pm-sh), 0.2); }
html body .md-platform .md-dash-card-title { font-family: var(--pm-font-display); font-size: 1.2rem; font-weight: 700; color: var(--pm-accent-ink); }
html body .md-platform .md-dash-pct b { font-family: var(--pm-font-display); font-size: 2.7rem; font-weight: 700; color: var(--pm-accent-ink); text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8), 0 3px 10px rgba(var(--pm-sh), 0.12); }
html[data-theme="dark"] body .md-platform .md-dash-pct b, html body .md-platform.is-dark .md-dash-pct b { text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4); }
html body .md-platform .md-dash-pct span { color: var(--pm-text-3); font-weight: 700; }
html body .md-platform .md-dash-count, html body .md-platform .md-dash-now { color: var(--pm-text-2); font-weight: 600; }
html body .md-platform .md-dash-now b { color: var(--pm-accent-ink); }
html body .md-platform .md-dash-bar { position: relative; height: 0.75rem; border-radius: 999px; background: var(--pm-track); box-shadow: var(--pm-pit); }
html body .md-platform .md-dash-bar i { position: relative; border-radius: 999px; background: linear-gradient(90deg, var(--pm-g800), var(--pm-accent) 62%, var(--pm-gold-2)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 0 12px rgba(212, 154, 58, 0.35); transition: width 0.7s var(--pm-ease); }
html body .md-platform .md-dash-bar i::after { content: ""; position: absolute; inset-inline: 6px; top: 2px; height: 2px; border-radius: 2px; background: rgba(255, 255, 255, 0.5); }
html body .md-platform .md-jp--compact { background: transparent !important; border: 0 !important; box-shadow: none !important; }
html body .md-platform .md-jp-bar { gap: 5px; height: auto; }
html body .md-platform .md-jp-seg { position: relative; height: 0.5rem; border-radius: 999px; background: var(--pm-track); box-shadow: var(--pm-pit); animation: none; transition: background 0.35s ease, box-shadow 0.35s ease; }
html body .md-platform .md-jp-seg.done { background: linear-gradient(180deg, var(--pm-accent-hi), var(--pm-accent-d)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 2px 5px -1px rgba(var(--pm-sh), 0.4); }
html body .md-platform .md-jp-seg.done::after { display: none; }
html body .md-platform .md-jp-seg.current { background: linear-gradient(180deg, var(--pm-gold-3), var(--pm-gold)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 0 0 3px rgba(212, 154, 58, 0.22), 0 0 14px rgba(212, 154, 58, 0.5); animation: pm-glint 2.8s ease-in-out infinite; }
html body .md-platform .md-jp-sep { color: var(--pm-gold); }
html body .md-platform .md-dash-continue {
  border: 1px solid var(--pm-accent-d); border-radius: 15px; color: #FFFFFF; font-weight: 800;
  background: linear-gradient(180deg, var(--pm-accent-hi), var(--pm-accent)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -2px 0 rgba(0, 0, 0, 0.16), 0 12px 22px -12px rgba(var(--pm-sh), 0.6);
  transition: transform 0.28s var(--pm-ease), box-shadow 0.28s var(--pm-ease), filter 0.2s ease;
}
html body .md-platform .md-dash-continue:hover { filter: brightness(1.06); transform: translateY(-2px); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.16), 0 18px 28px -12px rgba(var(--pm-sh), 0.65); }
html body .md-platform .md-dash-continue:active { transform: translateY(0); }
html body .md-platform .md-dash-empty, html body .md-platform .md-dash-guest p { color: var(--pm-text-2); font-weight: 600; }
/* "هل تعلم؟" — a lantern: warm gold-tinted card, the fact sits on a parchment note */
html body .md-platform .md-dash-dyk { border-color: var(--pm-gold-line); background: radial-gradient(420px 240px at 100% 0%, rgba(235, 196, 122, 0.34), transparent 66%), linear-gradient(180deg, var(--pm-gold-tint), var(--pm-gold-soft)); }
html[data-theme="dark"] body .md-platform .md-dash-dyk, html body .md-platform.is-dark .md-dash-dyk { background: radial-gradient(420px 240px at 100% 0%, rgba(214, 174, 91, 0.16), transparent 66%), linear-gradient(180deg, #221E10, #1C190E); }
html body .md-platform .md-dash-dyk::before { background: linear-gradient(180deg, var(--pm-gold-3), var(--pm-gold)); }
html body .md-platform .md-dash-dyk .md-dash-card-ico { background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 62%, var(--pm-gold)); border-radius: 50%; }
html body .md-platform .md-dash-dyk .md-dash-card-title { color: var(--pm-gold-ink); }
html body .md-platform .md-dash-dyk .md-dashboard { margin: 0 !important; }
html body .md-platform .md-dash-dyk .duo-dyk { background: transparent !important; border: 0 !important; box-shadow: none !important; padding: 0 !important; }
html body .md-platform .duo-dyk-bubble { border: 1px solid var(--pm-gold-line); border-radius: 18px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s1); }
html body .md-platform .duo-dyk-bubble::before { background: var(--pm-card); border-color: var(--pm-gold-line); }
html body .md-platform .duo-dyk-tag { background: linear-gradient(180deg, var(--pm-gold-3), var(--pm-gold-2)); color: #4A2E06; border: 1px solid var(--pm-gold); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55); font-weight: 800; }
html body .md-platform .duo-dyk-text { color: var(--pm-text); font-weight: 600; }
html body .md-platform .duo-dyk-art { filter: drop-shadow(0 8px 10px rgba(var(--pm-sh), 0.22)); }
html body .md-platform .duo-dyk.locked .duo-dyk-bubble { background: var(--pm-card-2); }

html body .md-platform .md-section-label { display: flex; align-items: center; gap: 10px; color: var(--pm-text-3) !important; font-weight: 800; }
html body .md-platform .md-section-label::after { content: ""; flex: 1; height: 1px; border-radius: 0; background: linear-gradient(90deg, var(--pm-hair-2), transparent); }
html body .md-platform .md-recent-chip {
  position: relative; border: 1px solid var(--pm-hair) !important; border-radius: 15px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); color: var(--acc-ink) !important;
  box-shadow: var(--pm-s1); font-weight: 700; transition: transform 0.28s var(--pm-ease), box-shadow 0.28s var(--pm-ease), border-color 0.28s ease;
}
html body .md-platform .md-recent-chip::before { content: ""; display: inline-block; width: 7px; height: 7px; margin-inline-end: 8px; border-radius: 50%; background: var(--acc); box-shadow: 0 0 0 3px var(--acc-soft); vertical-align: middle; }
html body .md-platform .md-recent-chip:hover { transform: translateY(-3px); background: linear-gradient(180deg, var(--pm-card), var(--acc-soft)); border-color: var(--acc-light) !important; box-shadow: var(--pm-s2); }
html body .md-platform .md-recent-chip:active { transform: translateY(0); }

/* ---- 9) UNITS — chapter tabs with an accent spine and an engraved gold medallion ---- */
html body .md-platform .md-rail-label { color: var(--pm-text-3); font-weight: 800; letter-spacing: 0.02em; }
html body .md-platform .md-unit-card {
  position: relative; border-radius: 20px; border: 1px solid var(--pm-hair); border-inline-start: 1px solid var(--pm-hair);
  background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s1);
  transition: transform 0.3s var(--pm-ease), box-shadow 0.3s var(--pm-ease), border-color 0.3s ease, background 0.3s ease;
}
html body .md-platform .md-unit-card:hover { transform: translateY(-3px); border-color: var(--pm-gold-line); border-inline-start-color: var(--pm-gold-line); background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s2); }
html body .md-platform .md-unit-card::before { box-shadow: inset 0 1px 0 #fff, 0 3px 6px rgba(var(--pm-sh), 0.16); width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--pm-gold-line); background: radial-gradient(circle at 30% 25%, #FFF4D6, var(--pm-gold-soft)); color: var(--pm-gold-ink); font-family: var(--pm-font-display); font-size: 1.15rem; font-weight: 700; opacity: 1; }
html body .md-platform .md-unit-card::after { background: var(--acc-soft); color: var(--acc-ink); box-shadow: inset 0 0 0 1px rgba(var(--pm-sh), 0.06); }
html body .md-platform .md-unit-card:hover::after { background: var(--acc); color: #FFFFFF; }
html body .md-platform .md-unit-card-title { color: var(--pm-text); font-weight: 800; }
html body .md-platform .md-unit-card-count { background: var(--acc-soft); color: var(--acc-ink); font-weight: 800; box-shadow: inset 0 0 0 1px rgba(var(--pm-sh), 0.05); }
html body .md-platform .md-unit-card-progress { height: 7px; border-radius: 999px; background: var(--pm-track); box-shadow: var(--pm-pit); }
html body .md-platform .md-unit-card-progress i { background: linear-gradient(90deg, var(--pm-accent), var(--pm-gold-2)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4); }
html body .md-platform .md-unit-card.selected { background: linear-gradient(160deg, var(--pm-g800), var(--pm-g900)); border-color: var(--pm-gold-2); border-inline-start-color: var(--pm-gold-2); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 20px 34px -16px rgba(8, 56, 47, 0.7); transform: none; }
html body .md-platform .md-unit-card.selected::before { background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 60%, var(--pm-gold)); color: #4A2E06; border-color: #9A6417; }
html body .md-platform .md-unit-card.selected::after { background: rgba(255, 255, 255, 0.14); color: var(--pm-gold-3); }
html body .md-platform .md-unit-card.selected .md-unit-card-title { color: #FFF7E4; }
html body .md-platform .md-unit-card.selected .md-unit-card-count { background: rgba(255, 255, 255, 0.14); color: var(--pm-gold-3); box-shadow: none; }
html body .md-platform .md-unit-card.selected .md-unit-card-progress { background: rgba(0, 0, 0, 0.28); box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4); }
html body .md-platform .md-unit-preview { border-inline-start: 1px dashed var(--pm-gold-line); }
html body .md-platform .md-unit-preview li { color: var(--pm-text-2); font-weight: 600; border-bottom: 1px dotted var(--pm-hair-2); }
html body .md-platform .md-unit-preview-num { color: var(--pm-gold); font-family: var(--pm-font-display); font-weight: 700; }
html body .md-platform .md-split-empty { border: 1px dashed var(--pm-gold-line); border-radius: 24px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s1); }
html body .md-platform .md-split-empty p { color: var(--pm-text-2); font-family: var(--pm-font-ui); font-weight: 700; }
html body .md-platform .md-split-empty-icon { background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 62%, var(--pm-gold)); color: #4A2E06; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 6px 12px -4px rgba(var(--pm-sh), 0.35); animation: none; }
html body .md-platform .md-empty { border: 1px dashed var(--pm-hair-2); border-radius: 18px; background: var(--pm-card-2); color: var(--pm-text-2); font-weight: 700; }
html body .md-platform .md-alert.error { border: 1px solid #D9A99F; border-inline-start: 4px solid #B4513F; border-radius: 16px; background: linear-gradient(180deg, #FBEFEB, #F7E4DE); color: #8F3B2C; box-shadow: var(--pm-s1); font-weight: 700; }
html[data-theme="dark"] body .md-platform .md-alert.error, html body .md-platform.is-dark .md-alert.error { background: linear-gradient(180deg, #2E1D19, #281915); border-color: #6E3B30; color: #F0B9AD; }
html body .md-platform .md-alert button { background: #B4513F !important; border-radius: 11px !important; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 3px 6px rgba(var(--pm-sh), 0.3); }

/* ---- 10) THE PALACE — arched window + skyline inside the welcome hall (elements added in StudentPlatform.jsx, decorative only) ---- */
html body .md-platform .md-welcome-bg { overflow: hidden; border-radius: inherit; }
html body .md-platform .md-welcome-body { position: relative; z-index: 2; }
html body .md-platform .pm-palace { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
html body .md-platform .pm-skyline { position: absolute; inset-inline: 0; bottom: 0; width: 100%; height: 46%; min-height: 84px; color: #EBC47A; opacity: 0.20;
  -webkit-mask-image: linear-gradient(0deg, #000 30%, transparent 100%); mask-image: linear-gradient(0deg, #000 30%, transparent 100%); }
html body .md-platform .pm-skyline path, html body .md-platform .pm-skyline rect { fill: currentColor; }
html body .md-platform .pm-skyline line { stroke: currentColor; stroke-width: 2; }
html body .md-platform .pm-arch { position: absolute; inset-inline-end: clamp(18px, 4vw, 54px); bottom: -2px; width: clamp(150px, 17vw, 210px); height: clamp(190px, 22vw, 262px);
  border: 1px solid rgba(235, 196, 122, 0.55); border-bottom: 0; border-radius: 999px 999px 0 0; padding: 9px 9px 0;
  background: linear-gradient(180deg, rgba(235, 196, 122, 0.14), rgba(235, 196, 122, 0.03));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 -10px 40px -16px rgba(235, 196, 122, 0.35); }
html body .md-platform .pm-arch-in { display: flex; align-items: flex-start; justify-content: center; width: 100%; height: 100%; padding-top: 22%; border: 1px solid rgba(235, 196, 122, 0.32); border-bottom: 0; border-radius: 999px 999px 0 0;
  background:
    radial-gradient(circle at 50% 36%, rgba(235, 196, 122, 0.34), transparent 58%),
    var(--pm-lattice), linear-gradient(180deg, rgba(8, 56, 47, 0.55), rgba(8, 56, 47, 0.1));
  background-size: auto, 40px 40px, auto; }
html body .md-platform .pm-arch-compass { width: 62%; height: auto; color: #EBC47A; opacity: 0.9; filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35)); animation: pm-spin 80s linear infinite; }
html body .md-platform .pm-greet { display: inline-block; vertical-align: -0.12em; margin-inline-start: 0.35rem; color: var(--pm-gold-3); }

/* ---- 11) LESSONS — course tiles; the number is an engraved medallion that changes metal with its state ---- */
html body .md-platform .md-lessons-header h2 { border-bottom: 1px solid var(--pm-hair-2); font-family: var(--pm-font-display); font-weight: 700; color: var(--pm-text); }
html body .md-platform .md-lessons-title { font-family: var(--pm-font-display); font-weight: 700; }
html body .md-platform .md-lessons-title span { color: var(--pm-text-3); }
html body .md-platform .md-lessons-title i { color: var(--pm-gold); }
html body .md-platform .md-lessons-title b { color: var(--acc-ink); }
html body .md-platform .md-count { background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 60%, var(--pm-gold)); color: #4A2E06; border: 1px solid #9A6417; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -2px 3px rgba(107, 67, 14, 0.3), 0 3px 6px rgba(var(--pm-sh), 0.25); font-weight: 800; }
html body .md-platform .md-lessons .md-lessons-grid::before { inset-inline-start: 41px; border-inline-start: 2px dotted var(--pm-gold-line); opacity: 0.9; }
html body .md-platform .md-lesson-card {
  position: relative; overflow: hidden; border-radius: 24px; border: 1px solid var(--pm-hair) !important; border-inline-start: 1px solid var(--pm-hair) !important; padding-inline-start: 90px;
  background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; box-shadow: var(--pm-s2) !important;
  transition: transform 0.32s var(--pm-ease), box-shadow 0.32s var(--pm-ease), border-color 0.32s ease;
}
html body .md-platform .md-lesson-card:hover:not([aria-disabled="true"]) { transform: translateY(-4px); border-color: var(--pm-gold-line) !important; box-shadow: var(--pm-s3) !important; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; }
html body .md-platform .md-lesson-card:active:not([aria-disabled="true"]) { transform: translateY(-1px); }
html body .md-platform .md-lesson-body h3 { font-family: var(--pm-font-display); font-size: 1.18rem; font-weight: 700; color: var(--pm-text); }
html body .md-platform .md-lesson-body p { color: var(--pm-text-2); font-weight: 500; }
html body .md-platform .md-lesson-cta { color: var(--acc-ink); font-weight: 800; }
html body .md-platform .md-lesson-cta span { background: var(--acc-soft); color: var(--acc-ink); box-shadow: inset 0 0 0 1px rgba(var(--pm-sh), 0.06); }
html body .md-platform .md-lesson-card:hover .md-lesson-cta span { background: var(--acc); color: #FFFFFF; }
html body .md-platform .md-lesson-card::after {
  content: attr(data-num); position: absolute; top: 50%; inset-inline-start: 16px; transform: translateY(-50%); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%;
  background: radial-gradient(circle at 30% 25%, #FFFFFF, var(--pm-card-2)); border: 1.5px solid var(--acc-light); color: var(--acc-ink);
  font-family: var(--pm-font-display); font-size: 1.4rem; font-weight: 700; box-shadow: inset 0 1px 0 #fff, inset 0 -2px 4px rgba(var(--pm-sh), 0.08), 0 6px 10px -4px rgba(var(--pm-sh), 0.28); animation: none; opacity: 1;
}
html body .md-platform .md-lesson-card[data-kind="COMPLETED"]::after { content: "✓"; border: 1px solid #9A6417; color: #4A2E06; font-size: 1.35rem; background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 58%, var(--pm-gold)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -3px 4px rgba(107, 67, 14, 0.3), 0 6px 10px -4px rgba(var(--pm-sh), 0.35); }
html body .md-platform .md-lesson-card[data-kind="CURRENT"] { border-color: var(--pm-gold-line) !important; background: radial-gradient(520px 200px at 100% 0%, rgba(235, 196, 122, 0.22), transparent 62%), linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; box-shadow: var(--pm-s2), 0 0 0 1px rgba(185, 121, 31, 0.18) !important; }
html body .md-platform .md-lesson-card[data-kind="CURRENT"]::after { border: 2px solid var(--pm-gold-2); color: var(--pm-gold-3); background: linear-gradient(160deg, var(--pm-g700), var(--pm-g900)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 0 0 5px rgba(212, 154, 58, 0.18), 0 10px 16px -6px rgba(8, 56, 47, 0.6); animation: pm-halo 3s ease-in-out infinite; }
html body .md-platform .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta { padding: 7px 8px 7px 16px; border-radius: 14px; color: #FFFFFF !important; background: linear-gradient(180deg, var(--pm-accent-hi), var(--pm-accent)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -2px 0 rgba(0, 0, 0, 0.14), 0 8px 14px -8px rgba(var(--pm-sh), 0.6); }
html body .md-platform .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta span { background: rgba(255, 255, 255, 0.22); color: #FFFFFF; }
html body .md-platform .md-lesson-card[data-kind="ACCESS_LOCK"] { border-color: var(--pm-gold-line) !important; background: linear-gradient(180deg, var(--pm-gold-tint), var(--pm-gold-soft)) !important; }
html body .md-platform .md-lesson-card[data-kind="ACCESS_LOCK"]::after { border-color: var(--pm-gold-2); color: var(--pm-gold-ink); background: radial-gradient(circle at 30% 25%, #FFF4D6, var(--pm-gold-soft)); }
html body .md-platform .md-lesson-card[data-kind="SEQUENCE_LOCK"], html body .md-platform .md-lesson-card[data-kind="COMING_SOON"] { border: 1px dashed var(--pm-hair-2) !important; background: linear-gradient(180deg, var(--pm-card-2), var(--pm-track)) !important; box-shadow: var(--pm-s1) !important; filter: none; opacity: 0.95; }
html body .md-platform .md-lesson-card[data-kind="SEQUENCE_LOCK"]::after, html body .md-platform .md-lesson-card[data-kind="COMING_SOON"]::after { border: 1px dashed var(--pm-hair-2); color: var(--pm-text-3); background: var(--pm-track); box-shadow: var(--pm-pit); }
html body .md-platform .md-lesson-card[data-kind="SEQUENCE_LOCK"] h3, html body .md-platform .md-lesson-card[data-kind="COMING_SOON"] h3 { color: var(--pm-text-3); }
html body .md-platform .md-soon-badge { background: linear-gradient(180deg, var(--pm-gold-tint), var(--pm-gold-soft)); border: 1px solid var(--pm-gold-line); color: var(--pm-gold-ink); box-shadow: none; font-weight: 800; }
html body .md-platform .md-lesson-body .pm-icon { color: var(--acc-ink); }
html body .md-platform .md-lesson-card[data-kind="SEQUENCE_LOCK"] .pm-icon, html body .md-platform .md-lesson-card[data-kind="COMING_SOON"] .pm-icon { color: var(--pm-text-3); }

/* ---- 12) COLONNADE — the history frieze becomes a row of classical columns standing on a gold ground line ---- */
html body .md-platform .md-frieze { position: relative; opacity: 1; margin-top: 30px; padding: 26px 0 0; border-top: 0; }
html body .md-platform .md-frieze::before { content: ""; position: absolute; inset-inline: 8%; top: 12px; height: 1px; background: linear-gradient(90deg, transparent, var(--pm-gold-line), transparent); }
html body .md-platform .md-frieze-inner { display: flex; justify-content: center; align-items: flex-end; gap: clamp(10px, 2.6vw, 30px); opacity: 1; padding: 0 12px; border-bottom: 2px solid var(--pm-gold-line);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent); mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent); }
html body .md-platform .md-column { display: flex; flex-direction: column; align-items: center; width: auto; }
html body .md-platform .md-column-capital { display: block; width: 30px; height: 11px; border-radius: 3px 3px 1px 1px; background: linear-gradient(180deg, #F3E6C6, #DBC58F); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 3px rgba(var(--pm-sh), 0.14); }
html body .md-platform .md-column-shaft { width: 18px; height: 58px; border-radius: 2px; animation: none;
  background: repeating-linear-gradient(90deg, rgba(107, 67, 14, 0) 0 3px, rgba(107, 67, 14, 0.11) 3px 4px), linear-gradient(90deg, #E7D6A8, #FAF1D6 46%, #D8C186); box-shadow: 0 6px 8px -4px rgba(var(--pm-sh), 0.22); }
html body .md-platform .md-column-base { display: block; width: 27px; height: 8px; border-radius: 1px 1px 0 0; background: linear-gradient(180deg, #DBC58F, #C9AF70); }
html body .md-platform .md-column:nth-child(3n+2) .md-column-shaft { height: 70px; }
html body .md-platform .md-column:nth-child(4n+3) .md-column-shaft { height: 50px; }
html[data-theme="dark"] body .md-platform .md-column-capital, html body .md-platform.is-dark .md-column-capital, html[data-theme="dark"] body .md-platform .md-column-base, html body .md-platform.is-dark .md-column-base { background: linear-gradient(180deg, #8B7438, #6B5726); box-shadow: none; }
html[data-theme="dark"] body .md-platform .md-column-shaft, html body .md-platform.is-dark .md-column-shaft { background: repeating-linear-gradient(90deg, rgba(0, 0, 0, 0) 0 3px, rgba(0, 0, 0, 0.18) 3px 4px), linear-gradient(90deg, #6B5726, #9A8244 46%, #5C4B20); box-shadow: none; }

/* ---- 13) FOOTER — a deep-forest base under the colonnade, gold rule on top, gold links ---- */
html body .md-platform .duo-footer {
  position: relative; margin-top: 0; padding-top: 30px; color: #D5E5DE !important; border-top: 0 !important;
  background: radial-gradient(760px 240px at 88% 0%, rgba(235, 196, 122, 0.16), transparent 62%), var(--pm-lattice), linear-gradient(180deg, #0E5348 0%, #0A3F36 100%) !important;
  background-size: auto, 56px 56px, auto !important; box-shadow: inset 0 1px 0 rgba(235, 196, 122, 0.4);
  --duo-green-ink: #F0CC86; --duo-muted: #A9C7BC; --duo-ink-soft: #D5E5DE; --duo-blue-ink: #F0CC86; --duo-blue-d: #FFE3A4;
}
html body .md-platform .duo-footer::before { height: 3px; background: linear-gradient(90deg, transparent, #EBC47A 18%, #B9791F 50%, #EBC47A 82%, transparent); }
html body .md-platform .duo-footer p.font-black { font-family: var(--pm-font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: 0.01em; }
html body .md-platform .duo-footer img { filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35)); }
html body .md-platform .duo-footer nav a { border-radius: 14px; border: 1px solid rgba(235, 196, 122, 0.32); background: rgba(255, 255, 255, 0.05); color: #F3E3B8 !important; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08); font-weight: 700; transition: transform 0.28s var(--pm-ease), background 0.28s ease, border-color 0.28s ease; }
html body .md-platform .duo-footer nav a:hover { background: rgba(235, 196, 122, 0.14); border-color: #EBC47A; box-shadow: 0 10px 18px -10px rgba(0, 0, 0, 0.5); transform: translateY(-2px); }
html body .md-platform .duo-mail { border-bottom: 1px dotted #EBC47A; }
html body .md-platform .duo-social { border-radius: 14px !important; background: #FFFDF6 !important; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(235, 196, 122, 0.5); }
html body .md-platform .duo-social:hover { transform: translateY(-3px); box-shadow: 0 10px 16px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px #EBC47A; }

/* ---- 14) DIALOGS, FIELDS & BUTTONS ---- */
html body .md-platform .duo-overlay { background: rgba(8, 56, 47, 0.58) !important; backdrop-filter: blur(2px); }
html body .md-platform .duo-modal { position: relative; border-radius: 26px !important; border: 1px solid var(--pm-gold-line) !important; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; box-shadow: var(--pm-s3) !important; animation: pm-rise 0.45s var(--pm-ease) both; }
html body .md-platform .duo-modal::before { content: ""; position: absolute; inset-inline: 30px; top: 0; height: 3px; border-radius: 0 0 8px 8px; background: linear-gradient(90deg, transparent, var(--pm-gold-2), transparent); }
html body .md-platform .duo-modal :is(h2, h3) { font-family: var(--pm-font-display); font-weight: 700; color: var(--pm-accent-ink) !important; }
html body .md-platform .duo-close { border: 1px solid var(--pm-hair-2); border-radius: 50% !important; background: var(--pm-card); box-shadow: var(--pm-s1); }
html body .md-platform .duo-close:hover { background: var(--pm-gold-tint); border-color: var(--pm-gold-2); color: var(--pm-gold-ink) !important; box-shadow: var(--pm-s2); }
html body .md-platform .duo-btn { border-radius: 15px !important; font-family: var(--pm-font-ui); font-weight: 800 !important; letter-spacing: 0.01em; transition: transform 0.28s var(--pm-ease), box-shadow 0.28s var(--pm-ease), filter 0.2s ease; }
html body .md-platform .duo-btn-primary { background: linear-gradient(180deg, var(--pm-accent-hi), var(--pm-accent)) !important; border: 1px solid var(--pm-accent-d) !important; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -2px 0 rgba(0, 0, 0, 0.16), 0 10px 18px -10px rgba(var(--pm-sh), 0.6) !important; }
html body .md-platform .duo-btn-primary:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-2px); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.16), 0 16px 24px -10px rgba(var(--pm-sh), 0.65) !important; }
html body .md-platform .duo-btn-ghost { background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; border: 1px solid var(--pm-gold-line) !important; color: var(--pm-gold-ink) !important; box-shadow: var(--pm-s1) !important; }
html body .md-platform .duo-btn-ghost:hover:not(:disabled) { border-color: var(--pm-gold-2) !important; box-shadow: var(--pm-s2) !important; transform: translateY(-2px); }
html body .md-platform .duo-btn:active:not(:disabled) { transform: translateY(0); }
html body .md-platform .duo-linkbtn:hover { color: var(--pm-gold) !important; }
html body .md-platform .duo-banner { border-radius: 20px !important; border: 1px solid var(--pm-gold-line) !important; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; box-shadow: var(--pm-s3) !important; }
html body .md-platform .ts-input { border: 1px solid var(--pm-hair-2); border-radius: 14px; background: var(--pm-card); color: var(--pm-text); box-shadow: var(--pm-pit); transition: border-color 0.25s ease, box-shadow 0.25s ease; }
html body .md-platform .ts-input:focus { border-color: var(--pm-gold-2); box-shadow: var(--pm-pit), 0 0 0 3px rgba(212, 154, 58, 0.22); background: var(--pm-card); }

/* ---- 15) ACCOUNT DRAWER — an ivory sheet with a deep-forest header ---- */
html body .md-platform .md-org-panel { background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; box-shadow: var(--pm-s3) !important; }
html body .md-platform .md-org-panel-head { background: radial-gradient(360px 160px at 100% 0%, rgba(235, 196, 122, 0.22), transparent 65%), linear-gradient(135deg, #0A3F36, #0E5348) !important; border-bottom: 1px solid var(--pm-gold-line) !important; }
html body .md-platform .md-org-brand { font-family: var(--pm-font-display); font-size: 1.5rem; font-weight: 700; color: #F0CC86 !important; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
html body .md-platform .md-org-close { border: 1px solid rgba(235, 196, 122, 0.5); border-radius: 50%; background: rgba(255, 255, 255, 0.08); color: #F3E3B8; transition: background 0.25s ease, transform 0.25s var(--pm-ease); }
html body .md-platform .md-org-close:hover { background: rgba(235, 196, 122, 0.2); transform: rotate(90deg); }
html body .md-platform .md-org-account { border: 1px solid var(--pm-hair) !important; border-radius: 18px !important; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)) !important; box-shadow: var(--pm-s1); }
html body .md-platform .md-org-avatar { border: 2px solid var(--pm-gold-2); background: linear-gradient(160deg, var(--pm-g700), var(--pm-g900)) !important; color: var(--pm-gold-3) !important; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px -3px rgba(var(--pm-sh), 0.4); font-family: var(--pm-font-display); font-weight: 700; }
html body .md-platform .md-org-heading { color: var(--pm-gold) !important; font-weight: 800; letter-spacing: 0.03em; }
html body .md-platform .md-org-link { border-radius: 14px; color: var(--pm-text-2); font-weight: 700; transition: background 0.25s ease, color 0.25s ease, transform 0.25s var(--pm-ease); }
html body .md-platform .md-org-link:hover { background: var(--pm-tint) !important; color: var(--pm-accent-ink) !important; transform: translateX(-3px); }
html body .md-platform .md-org-link.is-active { background: linear-gradient(270deg, var(--pm-tint), transparent) !important; color: var(--pm-accent-ink) !important; box-shadow: inset -3px 0 0 var(--pm-gold-2) !important; }
html body .md-platform .md-org-link-ico { background: linear-gradient(160deg, var(--pm-tint), var(--pm-g100)); border-radius: 12px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 0 0 1px rgba(var(--pm-sh), 0.07); }
html body .md-platform .md-org-chip.is-on { background: linear-gradient(180deg, var(--pm-accent-hi), var(--pm-accent)); border-color: var(--pm-accent-d); color: #fff; }
html body .md-platform .md-org-switch { border: 1px solid var(--pm-hair-2) !important; border-radius: 14px !important; background: var(--pm-card-2) !important; box-shadow: var(--pm-pit); }
html body .md-platform .md-org-btn { border: 1px solid var(--pm-gold-line); border-radius: 14px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); color: var(--pm-gold-ink); box-shadow: var(--pm-s1); font-weight: 800; transition: transform 0.25s var(--pm-ease), box-shadow 0.25s var(--pm-ease); }
html body .md-platform .md-org-btn:hover { transform: translateY(-2px); box-shadow: var(--pm-s2); }
html body .md-platform .md-org-btn--solid { background: linear-gradient(180deg, var(--pm-accent-hi), var(--pm-accent)) !important; border-color: var(--pm-accent-d) !important; color: #FFFFFF !important; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -2px 0 rgba(0, 0, 0, 0.16), 0 10px 18px -10px rgba(var(--pm-sh), 0.6) !important; }

/* ---- 16) SAVED LESSONS page + cards — "bookmarked volumes": a gold ribbon on every card ---- */
html body .md-platform .duo-saved-hero {
  position: relative; overflow: hidden; border-radius: 0 0 36px 36px; color: #FFFBF0; border: 1px solid rgba(235, 196, 122, 0.3); border-top: 0;
  background: radial-gradient(640px 260px at 92% -30%, rgba(235, 196, 122, 0.34), transparent 62%), var(--pm-lattice), linear-gradient(135deg, #08382F 0%, #0E5348 52%, #147A6A 100%);
  background-size: auto, 56px 56px, auto; box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25), 0 26px 46px -26px rgba(8, 56, 47, 0.7);
}
html body .md-platform .duo-saved-hero::after { content: ""; position: absolute; inset: 10px 10px 0; border: 1px solid rgba(235, 196, 122, 0.26); border-top: 0; border-radius: 0 0 28px 28px; pointer-events: none; }
html body .md-platform .duo-saved-hero-ico { width: 74px; height: 74px; border-radius: 50%; color: #4A2E06; background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 58%, var(--pm-gold)); border: 1px solid #9A6417; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -3px 5px rgba(107, 67, 14, 0.3), 0 12px 22px -8px rgba(0, 0, 0, 0.5); }
html body .md-platform .duo-saved-hero h1 { font-family: var(--pm-font-display); font-weight: 700; color: #FFFBF0; text-shadow: 0 3px 14px rgba(0, 0, 0, 0.35); }
html body .md-platform .duo-saved-hero p { color: rgba(255, 249, 232, 0.86); font-weight: 600; }
html body .md-platform .duo-saved-title { color: var(--pm-text); }
html body .md-platform .duo-saved-title .ico { border-radius: 50%; color: #4A2E06; background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 58%, var(--pm-gold)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px -2px rgba(var(--pm-sh), 0.3); }
html body .md-platform .duo-saved-count { background: var(--pm-gold-soft); color: var(--pm-gold-ink); border: 1px solid var(--pm-gold-line); box-shadow: none; }
html body .md-platform .duo-saved-all, html body .md-platform .duo-saved-chip { border: 1px solid var(--pm-gold-line); border-radius: 14px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); color: var(--pm-gold-ink); box-shadow: var(--pm-s1); }
html body .md-platform .duo-saved-all:hover, html body .md-platform .duo-saved-chip:hover { border-color: var(--pm-gold-2); box-shadow: var(--pm-s2); background: linear-gradient(180deg, var(--pm-card), var(--pm-gold-tint)); }
html body .md-platform .duo-saved-card { position: relative; border: 1px solid var(--pm-hair); border-radius: 22px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s2); transition: transform 0.32s var(--pm-ease), box-shadow 0.32s var(--pm-ease), border-color 0.32s ease; }
html body .md-platform .duo-saved-card:not(.ghost):hover { transform: translateY(-4px); border-color: var(--pm-gold-line); box-shadow: var(--pm-s3); }
html body .md-platform .duo-saved-card:not(.ghost)::before { content: ""; position: absolute; top: -1px; inset-inline-start: 22px; width: 14px; height: 24px; z-index: 2; background: linear-gradient(180deg, var(--pm-gold-2), var(--pm-gold)); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%); filter: drop-shadow(0 2px 2px rgba(var(--pm-sh), 0.3)); }
html body .md-platform .duo-saved-badge { border-radius: 16px; background: linear-gradient(160deg, var(--pm-g700), var(--pm-g900)); color: var(--pm-gold-3); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 10px -4px rgba(var(--pm-sh), 0.5); }
html body .md-platform .duo-saved-name { font-family: var(--pm-font-display); font-size: 1.1rem; font-weight: 700; color: var(--pm-text); }
html body .md-platform .duo-saved-meta { color: var(--pm-text-3); }
html body .md-platform .duo-saved-go { background: var(--pm-tint); color: var(--pm-accent-ink); }
html body .md-platform .duo-saved-card:hover .duo-saved-go { background: var(--pm-accent); color: #FFFFFF; }
html body .md-platform .duo-saved-remove { background: var(--pm-card-2); color: var(--pm-gold); border-inline-start: 1px solid var(--pm-hair); }
html body .md-platform .duo-saved-remove:hover { background: var(--duo-red-s); color: var(--duo-red-d); }
html body .md-platform .duo-saved-soon { background: var(--pm-gold-soft); color: var(--pm-gold-ink); }
html body .md-platform .duo-saved-bar { background: linear-gradient(90deg, var(--pm-track) 25%, var(--pm-card-2) 50%, var(--pm-track) 75%); background-size: 220% 100%; }
html body .md-platform .duo-saved-ghostbadge { background: var(--pm-track); box-shadow: var(--pm-pit); }
html body .md-platform .duo-saved-lockbox { border: 1px solid var(--pm-gold-line); border-radius: 24px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s3); }
html body .md-platform .duo-saved-lockbox p { font-family: var(--pm-font-display); font-weight: 700; color: var(--pm-text); }
html body .md-platform .duo-saved-lockicon { border-radius: 50%; color: #4A2E06; background: radial-gradient(circle at 30% 25%, #F6DDA4, var(--pm-gold-2) 58%, var(--pm-gold)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 6px 12px -4px rgba(var(--pm-sh), 0.35); animation: none; }
html body .md-platform .duo-saved-empty { border: 1px dashed var(--pm-gold-line); border-radius: 22px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); color: var(--pm-text-2); }
html body .md-platform .duo-saved-empty b { font-family: var(--pm-font-display); color: var(--pm-text); }

/* ---- 17) LOADING — a compass that turns, on a parchment plate ---- */
html body .md-platform .md-loading { display: flex; justify-content: center; padding: 34px 0; }
html body .md-platform .md-spinner { display: inline-flex; flex-direction: column; align-items: center; gap: 12px; padding: 22px 34px; border: 1px solid var(--pm-gold-line); border-radius: 24px; background: linear-gradient(180deg, var(--pm-card), var(--pm-card-2)); box-shadow: var(--pm-s2); }
html body .md-platform .md-spinner-rose { width: 64px; height: 64px; color: var(--pm-gold); animation: pm-spin 6s linear infinite; filter: drop-shadow(0 4px 8px rgba(var(--pm-sh), 0.25)); }
html body .md-platform .md-spinner-text { color: var(--pm-text-2); font-weight: 700; letter-spacing: 0.02em; }

/* ---- 18) ICON SET — one family: 24px grid, rounded strokes, a gold accent in every glyph (see PmIcon) ---- */
html body .md-platform .pm-icon { display: inline-block; flex: none; vertical-align: middle; overflow: visible; }
html body .md-platform .pm-icon .pm-i-fill { fill: currentColor; fill-opacity: 0.13; stroke: none; }
html body .md-platform .pm-icon .pm-i-gold { fill: var(--pm-gold-2); stroke: var(--pm-gold); stroke-width: 1; }
html body .md-platform .pm-icon .pm-i-goldline { stroke: var(--pm-gold); }
html body .md-platform .md-dash-card-ico .pm-icon, html body .md-platform .md-pick-head-icon .pm-icon, html body .md-platform .md-split-empty-icon .pm-icon, html body .md-platform .md-continue-chip-icon .pm-icon, html body .md-platform .md-welcome-cta-ico .pm-icon { width: 62%; height: 62%; }
html body .md-platform .md-pick-head-icon { color: #4A2E06; }
html body .md-platform .md-pick-head-icon .pm-icon .pm-i-gold, html body .md-platform .md-continue-chip-icon .pm-icon .pm-i-gold { fill: #4A2E06; stroke: #4A2E06; }
html body .md-platform .md-welcome-cta-ico .pm-icon .pm-i-gold { fill: var(--pm-gold-3); stroke: var(--pm-gold-3); }
html body .md-platform .md-dash-card-ico { color: var(--pm-accent-ink); }
html body .md-platform .md-dash-dyk .md-dash-card-ico { color: #4A2E06; }
html body .md-platform .md-dash-dyk .md-dash-card-ico .pm-icon .pm-i-gold { fill: #FFF4D6; stroke: #FFF4D6; }
html body .md-platform .md-scatter-icon .pm-icon { width: 18px; height: 18px; }
html body .md-platform .md-org-trigger .pm-icon { width: 22px; height: 22px; }
html body .md-platform .md-org-trigger .pm-icon .pm-i-gold { fill: var(--pm-gold-2); }
html body .md-platform .md-org-close .pm-icon { width: 16px; height: 16px; }

/* ---- 19) MOTION — short and quiet; the app's calm switch and prefers-reduced-motion switch all of it off ---- */
@keyframes pm-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes pm-halo { 0%, 100% { box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 0 0 5px rgba(212, 154, 58, 0.18), 0 10px 16px -6px rgba(8, 56, 47, 0.6); } 50% { box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 0 0 9px rgba(212, 154, 58, 0.07), 0 10px 16px -6px rgba(8, 56, 47, 0.6); } }
@keyframes pm-glint { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.12); } }
@keyframes pm-spin { to { transform: rotate(360deg); } }

/* ---- 20) RESPONSIVE ---- */
@media (max-width: 720px) {
  html body .md-platform .pm-arch { display: none; }
  html body .md-platform .pm-skyline { height: 38%; opacity: 0.16; }
  html body .md-platform .md-welcome { border-radius: 22px !important; }
  html body .md-platform .md-lesson-card { padding-inline-start: 72px; border-radius: 20px; }
  html body .md-platform .md-lesson-card::after { width: 42px; height: 42px; inset-inline-start: 12px; font-size: 1.2rem; }
  html body .md-platform .md-lessons .md-lessons-grid::before { inset-inline-start: 33px; }
  html body .md-platform .md-column-shaft { width: 13px; height: 44px; }
  html body .md-platform .md-column:nth-child(3n+2) .md-column-shaft { height: 54px; }
  html body .md-platform .md-column-capital { width: 22px; }
  html body .md-platform .md-column-base { width: 20px; }
  html body .md-platform .md-frieze-inner { gap: 8px; }
  html body .md-platform .md-panel { border-radius: 22px !important; }
  html body .md-platform .md-dash-pct b { font-size: 2.3rem; }
}
@media (prefers-reduced-motion: reduce) {
  html body .md-platform .pm-arch-compass, html body .md-platform .md-spinner-rose, html body .md-platform .md-lesson-card[data-kind="CURRENT"]::after, html body .md-platform .md-jp-seg.current, html body .md-platform .md-pick-card, html body .md-platform .duo-modal { animation: none !important; }
  html body .md-platform .md-pick-card, html body .md-platform .md-lesson-card, html body .md-platform .md-unit-card, html body .md-platform .md-dash-card, html body .md-platform .md-recent-chip, html body .md-platform .md-chip, html body .md-platform .md-login-btn, html body .md-platform .duo-btn, html body .md-platform .md-org-link { transition: none !important; }
}
html body .md-platform[data-calm="1"] .pm-arch-compass, html body .md-platform[data-calm="1"] .md-spinner-rose, html body .md-platform[data-calm="1"] .md-lesson-card::after, html body .md-platform[data-calm="1"] .md-jp-seg.current { animation: none !important; }

`;