// All CSS of the student home page (moved verbatim from StudentPlatform.jsx).
export const PLATFORM_CSS = `
  :root {
    /* =========================
       MADAR — EDUCATIONAL PREMIUM
       White + Deep Petrol + Calm Teal + Heritage Gold
       ========================= */
    --md-bg: #FFFFFF;
    --md-surface: #FFFFFF;
    --md-surface-2: #F0FAF4;
    --md-surface-3: #E6F7EC;

    --md-teal: #1CB85C;
    --md-teal-deep: #0E9A48;
    --md-teal-dark: #0B7A3A;
    --md-teal-mid: #3DDB7A;
    --md-teal-light: #8CF0B2;
    --md-teal-soft: #E3FBEC;

    --md-gold: #FFA726;
    --md-gold-deep: #E07B00;
    --md-gold-light: #FFC966;
    --md-gold-soft: #FFF2DC;

    --md-text: #1C2B22;
    --md-text-soft: #3A4B41;
    --md-muted: #6B7A72;
    --md-muted-light: #94AC9E;

    --md-border: #DCEEE2;
    --md-border-strong: #BCE0C9;

    --md-shadow-sm:
      0 2px 8px rgba(11, 122, 58, 0.06);
    --md-shadow-md:
      0 10px 28px rgba(11, 122, 58, 0.10);
    --md-shadow-lg:
      0 20px 50px rgba(11, 122, 58, 0.14);

    --md-radius: 22px;
    --md-radius-lg: 30px;

    /* chunky "pressable" depth for primary buttons — playful app feel */
    --md-depth: 4px;
    --md-depth-deep: #0B7A3A;
    --md-depth-gold: #E07B00;
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
    border-radius: 26px;
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
        rgba(28, 184, 92, 0.045),
        transparent 40%
      ),
      radial-gradient(
        circle at 92% 18%,
        rgba(28, 184, 92, 0.03),
        transparent 42%
      ),
      radial-gradient(
        circle at 8% 78%,
        rgba(255, 167, 38, 0.025),
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
        rgba(28, 184, 92, 0.06) 0%,
        rgba(28, 184, 92, 0.028) 35%,
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
        rgba(28, 184, 92, 0.08),
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
        rgba(255, 167, 38, 0.05),
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
    box-shadow: 0 0 6px rgba(28, 184, 92, 0.25);
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
    border: 1px solid rgba(28, 184, 92, 0.14);
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
    border-color: rgba(255, 167, 38, 0.78);
    box-shadow:
      0 0 20px rgba(255, 167, 38, 0.14),
      inset 0 0 16px rgba(255, 167, 38, 0.04);
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
      0 0 0 3px rgba(255, 167, 38, 0.08),
      0 0 10px rgba(255, 167, 38, 0.14);
    opacity: 0.55;
    transition:
      box-shadow 0.4s ease,
      opacity 0.4s ease;
  }

  .md-orbit.active .md-planet {
    opacity: 1;
    box-shadow:
      0 0 0 4px rgba(255, 167, 38, 0.18),
      0 0 18px rgba(255, 167, 38, 0.32),
      0 0 28px rgba(255, 167, 38, 0.12);
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
      drop-shadow(0 4px 10px rgba(255, 167, 38, 0.12));
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
      radial-gradient(circle at 82% 8%, rgba(255, 201, 102, 0.20), transparent 38%),
      linear-gradient(160deg, var(--md-teal-dark) 0%, var(--md-teal-deep) 55%, var(--md-teal) 130%);
    border-radius: 0 0 clamp(32px, 6vw, 72px) clamp(32px, 6vw, 72px);
    box-shadow: 0 24px 60px rgba(11, 122, 58, 0.22);
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
    border: 1px dashed rgba(255, 201, 102, 0.38);
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
    border: 1px solid rgba(255, 201, 102, 0.45);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .md-badge::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--md-gold-light);
    box-shadow: 0 0 0 3px rgba(255, 201, 102, 0.22);
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
    background: #FFF1F1;
    border: 1px solid #FFD2D2;
    color: #D32F2F;
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
    border: 1px solid rgba(28, 184, 92, 0.16);
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
    border: 2px solid var(--md-border-strong);
    color: var(--md-muted);
    transition: all 0.3s ease;
  }

  .md-step.done .md-step-number {
    background: linear-gradient(135deg, var(--md-teal), var(--md-teal-deep));
    border-color: var(--md-teal-deep);
    color: #FFFFFF;
    box-shadow: 0 8px 20px rgba(11, 122, 58, 0.22);
  }

  .md-step.active .md-step-number {
    border-color: var(--md-gold);
    color: var(--md-gold-deep);
    background: var(--md-gold-soft);
    box-shadow: 0 0 0 6px rgba(255, 167, 38, 0.12);
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
    box-shadow: 0 10px 24px rgba(11, 122, 58, 0.24);
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
    outline: 3px solid rgba(255, 201, 102, 0.6);
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
    box-shadow: 0 4px 0 var(--md-depth-deep);
    transition: transform 0.1s ease, box-shadow 0.1s ease, filter 0.15s ease;
  }

  .md-topbar .md-login-btn:hover { filter: brightness(1.06); }

  .md-topbar .md-login-btn:active {
    transform: translateY(4px);
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
    border-radius: 28px !important;
    padding: clamp(24px, 4vw, 40px) !important;
    border: 2px solid var(--md-border) !important;
    background: #FFFFFF !important;
    box-shadow: 0 6px 0 var(--md-border), 0 10px 26px rgba(11, 122, 58, 0.10) !important;
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
    border-radius: 28px !important;
    padding: clamp(22px, 3.5vw, 32px) clamp(22px, 4vw, 40px) !important;
    background: #FFFFFF !important;
    border: 2px solid var(--md-teal-soft) !important;
    box-shadow: 0 6px 0 var(--md-teal-soft), 0 10px 26px rgba(11, 122, 58, 0.10) !important;
  }

  .md-continue .font-black {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    line-height: 1.5;
    color: var(--md-teal-deep) !important;
  }

  .md-continue .md-continue-btn {
    padding: 14px 28px;
    border-radius: 18px !important;
    font-size: 0.95rem;
    box-shadow: 0 5px 0 var(--md-depth-deep);
    transition: transform 0.1s ease, box-shadow 0.1s ease, filter 0.15s ease;
  }

  .md-continue .md-continue-btn:hover { filter: brightness(1.05); }

  .md-continue .md-continue-btn:active {
    transform: translateY(5px);
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
    border: 1.5px solid rgba(28, 184, 92, 0.25);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFFFFF;
    box-shadow: 0 8px 22px rgba(11, 122, 58, 0.28);
    animation: md-assistant-float 2.6s ease-in-out infinite;
  }

  .md-assistant-bubble:hover {
    box-shadow: 0 10px 26px rgba(11, 122, 58, 0.34);
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
    box-shadow: 0 8px 20px rgba(11, 122, 58, 0.14);
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
    border-radius: 20px;
    /* visible button surface so students recognise it as clickable */
    background: #FFFFFF;
    border: 2.5px solid var(--md-border-strong);
    box-shadow: 0 4px 0 var(--md-border-strong);
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
    box-shadow: 0 4px 0 var(--md-teal);
    transform: translateX(-4px);
  }

  .md-unit-card:hover::after {
    background: var(--md-teal);
    color: #FFFFFF;
  }

  .md-unit-card.selected {
    background: linear-gradient(135deg, var(--md-teal-deep), var(--md-teal-dark));
    border-color: var(--md-teal-dark);
    box-shadow: 0 4px 0 var(--md-teal-dark);
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
    border-inline-start: 2px solid var(--md-gold-light);
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
    border-radius: 26px;
    background: #FFFFFF;
    border: 2.5px solid var(--md-border);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 0 var(--md-border);
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
    border-color: rgba(255, 167, 38, 0.45);
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
    background: radial-gradient(500px circle at var(--x, 50%) var(--y, 0%), rgba(28, 184, 92, 0.08), transparent 42%);
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
        rgba(255, 167, 38, 0.42),
        rgba(255, 167, 38, 0.10)
      );
  }

  .md-column-base {
    width: 18px;
    height: 6px;
    background:
      rgba(255, 167, 38, 0.22);
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
    box-shadow: 0 -4px 20px rgba(11, 122, 58, 0.06);
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
    .md-hero-logo { height: 50px; padding: 12px 20px; border-radius: 22px; }
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
    border-radius: 18px;
    background: #FFFFFF;
    border: 1px solid var(--md-border);
    box-shadow: 0 10px 24px rgba(11, 122, 58, 0.11), 0 1px 3px rgba(11, 122, 58, 0.05);
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
    box-shadow: 0 0 0 3px rgba(255, 201, 102, 0.25);
    animation: md-jp-pulse 2.2s ease-in-out infinite;
  }
  @keyframes md-jp-pulse {
    0%, 100% { box-shadow: 0 0 0 2px rgba(255, 201, 102, 0.22); }
    50% { box-shadow: 0 0 0 5px rgba(255, 201, 102, 0.12); }
  }
  .md-jp-pct { flex: 0 0 auto; min-width: 2.6em; text-align: left; font-size: 0.76rem; font-weight: 800; color: var(--md-teal-deep); font-variant-numeric: tabular-nums; }

  /* ---------- Hero: compact, still the petrol "orbit" band ---------- */
  .md-hero {
    padding: clamp(22px, 3.5vw, 34px) 20px clamp(40px, 5.5vw, 52px);
    border-radius: 0 0 clamp(26px, 4vw, 44px) clamp(26px, 4vw, 44px);
    box-shadow: 0 14px 36px rgba(11, 122, 58, 0.18);
  }
  .md-hero-logo-wrap { margin-bottom: 12px; }
  .md-hero-logo-wrap::before { width: 120px; height: 120px; }
  .md-hero-logo { height: 36px; padding: 8px 20px; border-radius: 18px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(255, 255, 255, 0.1); }
  .md-hero .md-badge { font-size: 0.74rem; padding: 4px 14px; margin-bottom: 8px; }
  .md-hero h1 { font-size: clamp(1.5rem, 4.4vw, 2.2rem); margin-bottom: 6px; line-height: 1.35; }
  .md-hero p { font-size: clamp(0.88rem, 2vw, 1rem); line-height: 1.8; max-width: 34em; }

  /* ---------- Dashboard: continue = the primary action ---------- */
  .md-dashboard { gap: 14px; margin-top: 20px; }
  .md-hero + .md-dashboard:has(> .md-jp),
  .md-hero + .md-dashboard:has(> .md-continue),
  .md-hero + .md-dashboard:has(> .md-panel) { margin-top: calc(-1 * clamp(26px, 4vw, 32px)); }

  .md-panel {
    border-radius: 22px !important;
    padding: clamp(18px, 3vw, 26px) !important;
    box-shadow: 0 12px 30px rgba(11, 122, 58, 0.12), 0 1px 4px rgba(11, 122, 58, 0.05) !important;
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
  .md-continue-chip:focus-visible { outline: 3px solid rgba(255, 201, 102, 0.6); outline-offset: 3px; }
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
    box-shadow: 0 6px 16px rgba(11, 122, 58, 0.22);
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
    border-radius: 20px;
    border: 1px solid var(--md-border);
    box-shadow: 0 2px 10px rgba(11, 122, 58, 0.06);
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
    border-radius: 22px;
    padding-inline-start: 78px;
    box-shadow: 0 2px 10px rgba(11, 122, 58, 0.06);
  }
  .md-lesson-card:hover { transform: translateY(-3px); box-shadow: 0 16px 34px rgba(11, 122, 58, 0.12); }
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
    border: 2px solid rgba(28, 184, 92, 0.28);
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
    box-shadow: 0 14px 32px rgba(255, 167, 38, 0.16);
  }
  .md-lesson-card[data-kind="CURRENT"]::after {
    background: var(--md-gold-soft);
    border-color: var(--md-gold);
    color: var(--md-gold-deep);
    box-shadow: 0 0 0 5px rgba(255, 201, 102, 0.2);
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
    box-shadow: 0 8px 18px rgba(11, 122, 58, 0.22);
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
      radial-gradient(circle at 12% 0%, rgba(255, 201, 102, 0.16), transparent 40%),
      linear-gradient(160deg, var(--md-teal-dark) 0%, var(--md-teal-deep) 60%, var(--md-teal) 140%);
    border-radius: clamp(26px, 4vw, 44px) clamp(26px, 4vw, 44px) 0 0;
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
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  }
  .md-feature:hover { transform: translateY(-4px); background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 201, 102, 0.5); }
  .md-feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    border-radius: 18px;
    color: var(--md-gold-light);
    background: rgba(255, 201, 102, 0.12);
    border: 1px solid rgba(255, 201, 102, 0.35);
    box-shadow: 0 0 22px rgba(255, 201, 102, 0.18);
  }
  .md-feature:nth-child(even) .md-feature-icon {
    color: #D5B3FF;
    background: rgba(140, 240, 178, 0.14);
    border-color: rgba(140, 240, 178, 0.4);
    box-shadow: 0 0 22px rgba(140, 240, 178, 0.2);
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
    .md-lesson-card { padding-inline-start: 64px; border-radius: 20px; }
    .md-lesson-card::after { width: 40px; height: 40px; inset-inline-start: 11px; font-size: 0.92rem; }
    .md-lesson-body { padding: 13px 14px 13px 12px; column-gap: 10px; }
    .md-lesson-body h3 { font-size: 0.96rem; }
    .md-lesson-body .md-lesson-cta { font-size: 0; }
    .md-lesson-body .md-lesson-cta span { font-size: 1rem; width: 34px; height: 34px; }
    .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta { padding: 0; background: transparent; box-shadow: none; }
    .md-lesson-card[data-kind="CURRENT"] .md-lesson-cta span { background: var(--md-teal-deep); color: #FFFFFF; }
    .md-features { margin-top: 40px; }
    .md-features-grid { gap: 12px; }
    .md-feature { padding: 18px 12px 16px; border-radius: 20px; }
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
    border-radius: 20px;
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
  .md-ctx-grade:focus-visible, .md-ctx-terms .md-chip:focus-visible { outline: 3px solid rgba(255, 201, 102, 0.6); outline-offset: 2px; }
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
  .md-ctx-terms .md-chip.selected { background: var(--md-teal-deep); color: #FFFFFF; box-shadow: 0 6px 16px rgba(11, 122, 58, 0.22); }
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
    border-radius: 24px;
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
    .md-context { padding: 8px; gap: 8px; border-radius: 18px; }
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
    border-radius: 22px;
    border: 2.5px solid var(--md-border);
    background: #FFFFFF;
    box-shadow: 0 4px 0 var(--md-border);
    color: var(--md-teal-deep);
    cursor: pointer;
    text-align: center;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }
  .md-pick-card:hover:not(:disabled) {
    transform: translateY(-3px);
    border-color: var(--md-teal);
    box-shadow: 0 7px 0 var(--md-teal);
  }
  .md-pick-card:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 2px 0 var(--md-teal); }
  .md-pick-card:focus-visible { outline: 3px solid rgba(255, 201, 102, 0.6); outline-offset: 3px; }
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
  .md-art .a-t { fill: #E3FBEC; stroke: var(--md-teal-deep); stroke-width: 3.6; stroke-linejoin: round; }
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
    box-shadow: 0 4px 0 var(--md-teal-dark);
  }
  .md-pick-card.selected .md-pick-art { background: rgba(255, 255, 255, 0.92); }
  .md-pick-card.selected .md-pick-num { background: var(--md-gold-light); border-color: var(--md-gold-light); color: var(--md-teal-dark); }

  @media (max-width: 640px) {
    .md-pick-grid { grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 10px; }
    .md-pick-card { padding: 8px 8px 12px; border-radius: 18px; gap: 8px; }
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
    --md-blue: #1CB0F6;
    --md-violet: #A568FF;
    --md-coral: #FF7759;
    --md-pink: #FF5BA8;
    --md-success: #FFA726;
    --md-rainbow: linear-gradient(90deg, #1CB85C 0%, #1CB0F6 25%, #A568FF 50%, #FF7759 75%, #FFC966 100%);
    --acc: #1CB85C; --acc-deep: #0E9A48; --acc-soft: #E3FBEC; --acc-light: #CBAEFA; --acc-glow: #1CB85C33;
  }

  /* accent variable sets (unit index / card position cycles through 6 colors) */
  [data-accent="0"],
  .md-pick-grid > :nth-child(6n+1),
  .md-features-grid > :nth-child(6n+1),
  .md-recent-row > :nth-child(6n+1) {
    --acc: #1CB85C; --acc-deep: #0E9A48; --acc-soft: #E3FBEC; --acc-light: #CBAEFA; --acc-glow: #1CB85C33;
  }
  [data-accent="1"],
  .md-pick-grid > :nth-child(6n+2),
  .md-features-grid > :nth-child(6n+2),
  .md-recent-row > :nth-child(6n+2) {
    --acc: #1CB0F6; --acc-deep: #1899D6; --acc-soft: #DDF4FD; --acc-light: #7DD8F5; --acc-glow: #1CB0F633;
  }
  [data-accent="2"],
  .md-pick-grid > :nth-child(6n+3),
  .md-features-grid > :nth-child(6n+3),
  .md-recent-row > :nth-child(6n+3) {
    --acc: #A568FF; --acc-deep: #7C3AED; --acc-soft: #F3E8FF; --acc-light: #D5B3FF; --acc-glow: #A568FF33;
  }
  [data-accent="3"],
  .md-pick-grid > :nth-child(6n+4),
  .md-features-grid > :nth-child(6n+4),
  .md-recent-row > :nth-child(6n+4) {
    --acc: #FF7759; --acc-deep: #D9472C; --acc-soft: #FFE7DD; --acc-light: #FFAD93; --acc-glow: #FF775933;
  }
  [data-accent="4"],
  .md-pick-grid > :nth-child(6n+5),
  .md-features-grid > :nth-child(6n+5),
  .md-recent-row > :nth-child(6n+5) {
    --acc: #FFA726; --acc-deep: #E07B00; --acc-soft: #FFF2DC; --acc-light: #FFC966; --acc-glow: #FFA72633;
  }
  [data-accent="5"],
  .md-pick-grid > :nth-child(6n+6),
  .md-features-grid > :nth-child(6n+6),
  .md-recent-row > :nth-child(6n+6) {
    --acc: #FF5BA8; --acc-deep: #D6246E; --acc-soft: #FFE3F0; --acc-light: #FFA8CF; --acc-glow: #FF5BA833;
  }

  /* ---------- Page background: soft colorful light ---------- */
  .md-platform {
    background:
      radial-gradient(circle at 8% 4%, rgba(28, 176, 246, 0.10), transparent 36%),
      radial-gradient(circle at 94% 12%, rgba(165, 104, 255, 0.09), transparent 38%),
      radial-gradient(circle at 90% 62%, rgba(255, 119, 89, 0.07), transparent 36%),
      radial-gradient(circle at 6% 74%, rgba(255, 201, 102, 0.10), transparent 38%),
      radial-gradient(circle at 50% 100%, rgba(28, 184, 92, 0.08), transparent 42%),
      #FFFFFF;
  }

  /* ---------- Hero: petrol + colorful glows ---------- */
  .md-hero {
    background:
      radial-gradient(circle at 86% 6%, rgba(255, 201, 102, 0.34), transparent 36%),
      radial-gradient(circle at 10% 100%, rgba(165, 104, 255, 0.38), transparent 44%),
      radial-gradient(circle at 58% 118%, rgba(28, 176, 246, 0.40), transparent 46%),
      radial-gradient(circle at 30% -10%, rgba(255, 119, 89, 0.20), transparent 38%),
      linear-gradient(160deg, #0B7A3A 0%, #0E9A48 52%, #17A354 125%);
  }
  .md-hero .md-badge { border-color: rgba(255, 201, 102, 0.6); }

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
  .md-ctx-grade { background: var(--md-blue-soft, #DDF4FD); border-color: #B7E7FA; color: #1899D6; }
  .md-ctx-grade:hover { background: #CDEFFC; border-color: var(--md-blue); }
  .md-ctx-caret { color: var(--md-blue); }
  .md-ctx-terms { background: var(--acc-soft, #F3E8FF); border-color: rgba(165, 104, 255, 0.18); --acc-soft: #F3E8FF; }
  .md-ctx-terms .md-chip.selected { background: linear-gradient(135deg, #7C3AED, #A568FF); box-shadow: 0 8px 18px rgba(124, 58, 237, 0.28); }

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

  .md-split-empty { background: linear-gradient(135deg, #F3E8FF, #DDF4FD); border-color: #DCC2FB; }
  .md-split-empty-icon { background: #FFFFFF; color: var(--md-violet); box-shadow: 0 6px 14px rgba(165, 104, 255, 0.18); }

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
      radial-gradient(circle at 12% 0%, rgba(255, 201, 102, 0.20), transparent 40%),
      radial-gradient(circle at 88% 8%, rgba(165, 104, 255, 0.34), transparent 42%),
      radial-gradient(circle at 50% 120%, rgba(28, 176, 246, 0.34), transparent 50%),
      linear-gradient(160deg, #063D1C 0%, #0E9A48 55%, #0E9A48 135%);
  }
  .md-features-head h2 {
    background: linear-gradient(90deg, #FFFFFF, #FFC966);
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
  .md-ctx-grade:hover { transform: none; background: var(--md-blue-soft, #DDF4FD); border-color: #B7E7FA; }
  .md-ctx-door {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    min-height: 34px;
    padding: 4px 12px 4px 10px;
    border: 2px solid #B7E7FA;
    border-bottom-width: 4px;
    border-radius: 12px;
    background: #FFFFFF;
    color: #1899D6;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 900;
    line-height: 1;
    cursor: pointer;
    transition: transform 0.08s ease, background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }
  .md-ctx-door svg { width: 18px; height: 18px; flex-shrink: 0; }
  .md-ctx-door:hover { background: #1CB0F6; border-color: #1899D6; color: #FFFFFF; }
  .md-ctx-door:active { transform: translateY(2px); border-bottom-width: 2px; }
  .md-ctx-door:focus-visible { outline: 3px solid #1CB0F6; outline-offset: 2px; }
  @media (max-width: 380px) { .md-ctx-door span { display: none; } .md-ctx-door { padding: 4px 10px; } }
`;