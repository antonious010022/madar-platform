// Illustrated art for the grade / stage picker (presentation only, static strings).
// One distinct drawing per school year (12 slots) in a soft-gradient "sticker" style.
// Each string is the INNER markup of the 80x80 <svg> that PickArt() renders; classes
// pa-eye / pa-face keep the blink + bob animations from the theme. Gradient ids are
// prefixed per drawing (ga1…ga12) so repeated instances on a page never clash.

const INK = "#3C3C3C";
const n = (v) => Math.round(v * 100) / 100;

const eye = (cx, y, s) =>
  `<g class="pa-eye"><ellipse cx="${n(cx)}" cy="${n(y)}" rx="${n(2.2 * s)}" ry="${n(2.7 * s)}" fill="${INK}"/><circle cx="${n(cx + 0.7 * s)}" cy="${n(y - s)}" r="${n(0.85 * s)}" fill="#fff"/></g>`;

const face = (x, y, s = 1, gap = 6.5) => {
  const e = gap * s;
  return (
    `<g class="pa-face">${eye(x - e, y, s)}${eye(x + e, y, s)}` +
    `<ellipse cx="${n(x - e - 4.2 * s)}" cy="${n(y + 4.2 * s)}" rx="${n(2.8 * s)}" ry="${n(1.7 * s)}" fill="#FF6F91" opacity=".5"/>` +
    `<ellipse cx="${n(x + e + 4.2 * s)}" cy="${n(y + 4.2 * s)}" rx="${n(2.8 * s)}" ry="${n(1.7 * s)}" fill="#FF6F91" opacity=".5"/>` +
    `<path d="M${n(x - 3 * s)} ${n(y + 3.6 * s)} Q${n(x)} ${n(y + 7.6 * s)} ${n(x + 3 * s)} ${n(y + 3.6 * s)}" fill="none" stroke="${INK}" stroke-width="${n(1.7 * s)}" stroke-linecap="round"/></g>`
  );
};

// vertical (default) or horizontal 2-stop gradient
const lg = (id, a, b, horizontal = false) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${horizontal ? 1 : 0}" y2="${horizontal ? 0 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const star = (cx, cy, r, fill) =>
  `<path d="M${cx} ${cy - r} L${n(cx + r * 0.3)} ${n(cy - r * 0.3)} L${cx + r} ${cy} L${n(cx + r * 0.3)} ${n(cy + r * 0.3)} L${cx} ${cy + r} L${n(cx - r * 0.3)} ${n(cy + r * 0.3)} L${cx - r} ${cy} L${n(cx - r * 0.3)} ${n(cy - r * 0.3)}Z" fill="${fill}"/>`;

const ART = {
  /* 1 — a seedling waking up in the soil */
  g1: () => `
<defs>${lg("ga1s", "#D6F77A", "#7CD11C")}${lg("ga1l", "#B4F04A", "#4FBE00")}${lg("ga1m", "#BE7C4B", "#80502E")}</defs>
<path d="M40 31 Q40 27 41 23" stroke="#47A600" stroke-width="3.4" stroke-linecap="round" fill="none"/>
<path d="M41 26 C41 14 31 7 17 10 C17 23 28 30 41 26Z" fill="url(#ga1l)"/>
<path d="M41 26 Q31 19 22 13" stroke="#F0FFC0" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".8"/>
<path d="M41 26 C41 12 51 5 65 7 C65 21 54 28 41 26Z" fill="url(#ga1l)"/>
<path d="M41 26 Q51 18 60 11" stroke="#F0FFC0" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".8"/>
<circle cx="40" cy="47" r="17" fill="url(#ga1s)"/>
<ellipse cx="32" cy="39" rx="5" ry="2.8" fill="#fff" opacity=".5" transform="rotate(-30 32 39)"/>
${face(40, 48.5)}
<path d="M12 73 Q14 56 40 56 Q66 56 68 73Z" fill="url(#ga1m)"/>
<path d="M12 73 Q12.6 68 15 64 Q40 76 65 64 Q67.4 68 68 73Z" fill="#6E4326" opacity=".45"/>
<circle cx="27" cy="65" r="1.7" fill="#D9A06E"/><circle cx="50" cy="62.5" r="1.4" fill="#D9A06E"/><circle cx="57" cy="68" r="1.8" fill="#D9A06E"/>
<path d="M22 58 q-1 -5 -3 -7 M22 58 q2 -4 4 -5 M60 58 q1 -4 3 -6 M60 58 q-2 -3 -4 -4" stroke="#4FBE00" stroke-width="2" stroke-linecap="round" fill="none"/>`,

  /* 2 — a lively pencil leaving a doodle */
  g2: () => `
<defs>${lg("ga2e", "#FFA8DB", "#EE5DB0")}${lg("ga2f", "#F1F1F1", "#A8AFB8")}${lg("ga2b", "#FFE266", "#FFB300", true)}</defs>
<path d="M27 73 q-3.5 -6.5 -7 0 t-7 0 t-7 0" stroke="var(--acc)" stroke-width="2.6" stroke-linecap="round" fill="none" style="stroke:var(--acc)"/>
<g transform="rotate(20 40 40)">
  <rect x="30" y="3" width="20" height="12" rx="5.5" fill="url(#ga2e)"/>
  <rect x="31.5" y="5" width="3" height="8" rx="1.5" fill="#fff" opacity=".45"/>
  <rect x="30" y="13" width="20" height="9" fill="url(#ga2f)"/>
  <path d="M30 16 H50 M30 19.5 H50" stroke="#fff" stroke-width="1.3" opacity=".7"/>
  <rect x="30" y="22" width="20" height="33" fill="url(#ga2b)"/>
  <rect x="43" y="22" width="7" height="33" fill="#D98E00" opacity=".4"/>
  <rect x="32" y="22" width="3" height="33" fill="#fff" opacity=".45"/>
  <path d="M30 55 H50 L40 73Z" fill="#F7D3A3"/>
  <path d="M40 55 H50 L40 73Z" fill="#E4B07A"/>
  <path d="M36.2 66.2 H43.8 L40 73Z" fill="${INK}"/>
  ${face(40, 38, 1, 6)}
</g>`,

  /* 3 — a school backpack ready for adventure */
  g3: () => `
<defs>${lg("ga3b", "#FF9D4D", "#F2661A")}${lg("ga3p", "#FFBB7A", "#FF8A3D")}</defs>
<path d="M31 18 Q31 7 40 7 Q49 7 49 18" stroke="#D2570F" stroke-width="3.6" stroke-linecap="round" fill="none"/>
<path d="M17 31 Q17 15 40 15 Q63 15 63 31 V66 Q63 72 57 72 H23 Q17 72 17 66Z" fill="url(#ga3b)"/>
<path d="M52 15.4 Q63 18 63 31 V66 Q63 72 57 72 H52Z" fill="#BF480B" opacity=".28"/>
<rect x="21" y="21" width="3.2" height="18" rx="1.6" fill="#fff" opacity=".42"/>
${face(40, 33, 1.05)}
<path d="M23 49 H57 V65 Q57 69 53 69 H27 Q23 69 23 65Z" fill="url(#ga3p)"/>
<path d="M23 49 H57" stroke="#C4500F" stroke-width="1.8" stroke-dasharray="3 2.4"/>
<rect x="37.6" y="46.4" width="4.8" height="7" rx="2.4" fill="#FFD84D" stroke="#D9A600" stroke-width="1"/>
${star(40, 60.5, 4.6, "#FFD84D")}
<rect x="11" y="44" width="7" height="14" rx="3.5" fill="#F2661A"/><rect x="62" y="44" width="7" height="14" rx="3.5" fill="#D85A12"/>`,

  /* 4 — a golden compass that always finds the way */
  g4: () => `
<defs>${lg("ga4r", "#FFE27A", "#DFA000")}${lg("ga4d", "#FFFFFF", "#FFF1CC")}</defs>
<rect x="34.5" y="3" width="11" height="9" rx="3.5" fill="url(#ga4r)" stroke="#B98300" stroke-width="1.2"/>
<circle cx="40" cy="43" r="28" fill="url(#ga4r)"/>
<circle cx="40" cy="43" r="28" fill="none" stroke="#C48A00" stroke-width="1.6" opacity=".6"/>
<circle cx="40" cy="43" r="22.5" fill="url(#ga4d)" stroke="#C48A00" stroke-width="1.6"/>
<path d="M40 21.5 V25.5 M40 60.5 V64.5 M18.5 43 H22.5 M57.5 43 H61.5" stroke="#C48A00" stroke-width="2.2" stroke-linecap="round"/>
<path d="M26 29 L28.4 31.4 M54 29 L51.6 31.4 M26 57 L28.4 54.6 M54 57 L51.6 54.6" stroke="#E2B955" stroke-width="1.6" stroke-linecap="round"/>
${face(40, 30.5, 0.82, 6.4)}
<g transform="rotate(72 40 44)">
  <path d="M40 27 L45 44 H35Z" fill="#FF4B4B"/>
  <path d="M40 61 L45 44 H35Z" fill="#D5DAE3"/>
  <path d="M40 27 L42.5 44 H40Z" fill="#fff" opacity=".28"/>
</g>
<circle cx="40" cy="44" r="3" fill="#fff" stroke="#C48A00" stroke-width="1.4"/>
<path d="M22 22 Q27 15 36 13" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".55"/>`,

  /* 5 — a rocket blasting off */
  g5: () => `
<defs>${lg("ga5b", "#FFFFFF", "#CFDAEA", true)}${lg("ga5f", "#FFD84D", "#FF7A1A")}${lg("ga5n", "#FF6B6B", "#E02D2D", true)}</defs>
<g transform="rotate(14 40 40)">
  <path d="M33 58 Q40 82 47 58Z" fill="url(#ga5f)"/>
  <path d="M36.5 58 Q40 71 43.5 58Z" fill="#FFF2A8"/>
  <path d="M27 42 L13 58 Q12 62 17 62 L27 56Z" fill="url(#ga5n)"/>
  <path d="M53 42 L67 58 Q68 62 63 62 L53 56Z" fill="url(#ga5n)"/>
  <path d="M40 4 C54 13 57 32 55 56 H25 C23 32 26 13 40 4Z" fill="url(#ga5b)"/>
  <path d="M40 4 C47 8 52 14 54 21 H26 C28 14 33 8 40 4Z" fill="url(#ga5n)"/>
  <path d="M47 8 C53 16 56 34 54 56 H49 C51 34 50 18 47 8Z" fill="#8FA2BD" opacity=".28"/>
  <rect x="25" y="52" width="30" height="7" rx="3" fill="#7F90AA"/>
  <circle cx="40" cy="35" r="10.5" fill="#8FA2BD"/>
  <circle cx="40" cy="35" r="8.6" fill="#C9EEFF"/>
  <path d="M33.5 30 Q36 26.5 40 26.2" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/>
  ${face(40, 35, 0.62, 6.3)}
</g>`,

  /* 6 — the champion's trophy (end of primary) */
  g6: () => `
<defs>${lg("ga6c", "#FFE680", "#E7A800", true)}${lg("ga6b", "#C98350", "#8D5424")}</defs>
<path d="M21 17 H11 Q9 17 9 19.5 Q9 34 24 37" stroke="#E7A800" stroke-width="4.2" stroke-linecap="round" fill="none"/>
<path d="M59 17 H69 Q71 17 71 19.5 Q71 34 56 37" stroke="#E7A800" stroke-width="4.2" stroke-linecap="round" fill="none"/>
<rect x="34.5" y="48" width="11" height="13" fill="#E7A800"/>
<rect x="30" y="57" width="20" height="8" rx="2.5" fill="url(#ga6c)"/>
<rect x="21" y="64" width="38" height="9" rx="3.5" fill="url(#ga6b)"/>
<rect x="31" y="66.4" width="18" height="4" rx="1.6" fill="#FFE27A"/>
<path d="M19 12 H61 V30 Q61 52 40 52 Q19 52 19 30Z" fill="url(#ga6c)"/>
<path d="M50 12 H61 V30 Q61 52 40 52 Q46 46 49 36Z" fill="#C98A00" opacity=".3"/>
<rect x="17" y="9" width="46" height="7" rx="3.5" fill="#FFD84D"/>
<path d="M25 21 V31 Q25 40 31 45" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".55"/>
${face(40, 31, 1.05)}
${star(40, 6, 3.6, "#fff")}`,

  /* 7 — a friendly globe on its stand */
  g7: () => `
<defs><radialGradient id="ga7o" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#6FD0FF"/><stop offset="1" stop-color="#1480D6"/></radialGradient>${lg("ga7l", "#9BE83A", "#4DBB00")}</defs>
<rect x="37" y="59" width="6" height="11" fill="#C98350"/>
<ellipse cx="40" cy="72" rx="16" ry="4.2" fill="#8D5424"/>
<ellipse cx="40" cy="70.8" rx="16" ry="3.6" fill="#B87333"/>
<circle cx="40" cy="35" r="26" fill="url(#ga7o)"/>
<g opacity=".28" stroke="#fff" stroke-width="1.3" fill="none"><ellipse cx="40" cy="35" rx="11" ry="26"/><path d="M14 35 H66 M17 24 H63 M17 46 H63"/></g>
<path d="M27 16 C33 12 41 14 41 20 C41 26 34 27 32 31 C29 34 22 30 23 25 C23 21 24 18 27 16Z" fill="url(#ga7l)"/>
<path d="M50 44 C55 41 62 44 60 50 C58 56 53 57 50 53.5 C48 50.5 48.4 46.4 50 44Z" fill="url(#ga7l)"/>
<path d="M22 47 C25 45 29 47 28 51 C27 54 23 54 21.6 51Z" fill="url(#ga7l)"/>
<path d="M56 17 C63 21 65 29 63 36" stroke="#fff" stroke-width="2.8" stroke-linecap="round" fill="none" opacity=".45"/>
<circle cx="40" cy="35" r="26" fill="none" stroke="#1067B0" stroke-width="2"/>
<path d="M11 44 A31 31 0 0 0 40 66" stroke="#F0B400" stroke-width="3.6" stroke-linecap="round" fill="none"/>
${face(40, 36, 1.05)}`,

  /* 8 — a telescope searching the sky */
  g8: () => `
<defs>${lg("ga8t", "#46D9CF", "#0F8D86")}${lg("ga8e", "#B9C4D2", "#7F8DA1")}</defs>
<path d="M36 47 L22 73 M36 47 L52 73 M36 47 V75" stroke="#8D5424" stroke-width="3.8" stroke-linecap="round"/>
<circle cx="36" cy="46" r="4" fill="#C98350"/>
<g transform="rotate(-30 36 38)">
  <rect x="3" y="33" width="10" height="10" rx="3" fill="url(#ga8e)"/>
  <rect x="11" y="31" width="17" height="14" rx="3.5" fill="url(#ga8t)"/>
  <rect x="26" y="26" width="38" height="24" rx="6" fill="url(#ga8t)"/>
  <rect x="26" y="26" width="38" height="8" rx="4" fill="#fff" opacity=".22"/>
  <rect x="50" y="26" width="4.5" height="24" fill="#0B6E68" opacity=".5"/>
  <rect x="62" y="23" width="8" height="30" rx="3.5" fill="url(#ga8e)"/>
  <ellipse cx="68.5" cy="38" rx="2.4" ry="11" fill="#CFF3FF"/>
  ${face(38, 37, 0.74, 6.2)}
</g>
${star(66, 14, 4.2, "#FFC800")}${star(18, 20, 2.8, "#fff")}`,

  /* 9 — an hourglass (history & time) */
  g9: () => `
<defs>${lg("ga9w", "#D9965C", "#8F5A2C")}${lg("ga9s", "#FFDD6B", "#FFAA00")}</defs>
<rect x="15" y="64" width="50" height="9" rx="3.5" fill="url(#ga9w)"/>
<rect x="15" y="5" width="50" height="9" rx="3.5" fill="url(#ga9w)"/>
<rect x="19" y="12" width="4.6" height="54" rx="2" fill="#8F5A2C"/><rect x="56.4" y="12" width="4.6" height="54" rx="2" fill="#8F5A2C"/>
<path d="M25 14 H55 C55 28 46 34 43 39.5 C46 45 55 51 55 64 H25 C25 51 34 45 37 39.5 C34 34 25 28 25 14Z" fill="#E4F6FF" opacity=".92" stroke="#8FD8FB" stroke-width="1.8"/>
<path d="M28.5 16 H51.5 C50.5 24 46.5 28.5 42 31.5 H38 C33.5 28.5 29.5 24 28.5 16Z" fill="url(#ga9s)"/>
<path d="M40 36 V50" stroke="#FFC107" stroke-width="1.6" stroke-linecap="round"/>
<path d="M27.5 62 C28.5 55 34 51.5 40 49 C46 51.5 51.5 55 52.5 62Z" fill="url(#ga9s)"/>
<path d="M29 17 C28 24 31 30 37 35" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".7"/>
${face(40, 22, 0.78, 6)}`,

  /* 10 — a pyramid under the desert sun */
  g10: () => `
<defs>${lg("ga10f", "#FFE1A0", "#F2B45E")}${lg("ga10s", "#E5A04A", "#C9822F")}<radialGradient id="ga10u" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFF08A"/><stop offset="1" stop-color="#FFB400"/></radialGradient></defs>
<circle cx="62" cy="19" r="9.5" fill="url(#ga10u)"/>
<g stroke="#FFC800" stroke-width="2" stroke-linecap="round"><path d="M62 4.5 V7"/><path d="M75 11 L73 13"/><path d="M77 23 H74.6"/><path d="M49 11 L51 13"/></g>
<path d="M36 11 L72 62 L58 64Z" fill="url(#ga10s)"/>
<path d="M36 11 L10 64 H58Z" fill="url(#ga10f)"/>
<path d="M36 11 L26 31 M36 11 L46 31" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".3"/>
<path d="M24 34 H48 M16.5 49 H55 M57.5 41 L66 52 M62 52 L66 58" stroke="#C98A3E" stroke-width="1.2" opacity=".45" fill="none"/>
<ellipse cx="40" cy="67" rx="33" ry="9" fill="#F4CB82"/>
<path d="M12 67 Q26 61 40 66 Q54 71 68 65 Q64 74 40 76 Q16 74 12 67Z" fill="#E8B765"/>
<path d="M20 69 q4 -2 8 0 M52 71 q4 -2 8 0" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".5"/>
${face(34, 45, 1, 6.6)}`,

  /* 11 — a lighthouse guiding the way */
  g11: () => `
<defs>${lg("ga11t", "#FFFFFF", "#E1E8F2", true)}${lg("ga11r", "#8B98AB", "#5D6A7E")}</defs>
<path d="M44 17 L75 6 V30Z" fill="#FFF2A0" opacity=".6"/>
<path d="M36 17 L5 6 V30Z" fill="#FFF2A0" opacity=".6"/>
<ellipse cx="40" cy="69" rx="33" ry="9.5" fill="#1CB0F6" opacity=".85"/>
<path d="M14 68 Q27 65 40 68 T66 68" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".55"/>
<path d="M17 72 Q28 70 40 72 T63 72" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".4"/>
<path d="M19 71 Q22 62 31 62 H49 Q58 62 61 71Z" fill="url(#ga11r)"/>
<path d="M29 62 L34 26 H46 L51 62Z" fill="url(#ga11t)"/>
<path d="M34 26 H46 L45.2 34 H34.8Z" fill="#FF4B4B"/>
<path d="M30.4 54 H49.6 L51 62 H29Z" fill="#FF4B4B"/>
<path d="M44 26 L49 62 H46Z" fill="#8FA2BD" opacity=".22"/>
<rect x="30" y="22" width="20" height="5" rx="2" fill="#5D6A7E"/>
<rect x="34.5" y="11" width="11" height="11.5" rx="2" fill="#FFE27A" stroke="#E5A800" stroke-width="1.2"/>
<path d="M32.5 12 L40 4 L47.5 12Z" fill="#FF4B4B"/>
${face(40, 43.5, 0.92, 6.2)}`,

  /* 12 — the graduate (diploma + confetti) */
  g12: () => `
<defs>${lg("ga12b", "#38C0FA", "#1388C8")}${lg("ga12c", "#1CA3E6", "#0F78AE")}${lg("ga12p", "#FFFFFF", "#EFE7CF")}</defs>
<rect x="6" y="14" width="5" height="5" rx="1" fill="#FF4B4B" transform="rotate(25 8 16)"/>
<rect x="69" y="9" width="5" height="5" rx="1" fill="#CE82FF" transform="rotate(-20 71 11)"/>
<rect x="72" y="46" width="5" height="5" rx="1" fill="#FFC800" transform="rotate(35 74 48)"/>
<rect x="4" y="44" width="5" height="5" rx="1" fill="#58CC02" transform="rotate(-30 6 46)"/>
<path d="M24 34 V50 C24 56 31 59 40 59 C49 59 56 56 56 50 V34Z" fill="url(#ga12c)"/>
<path d="M46 34 H56 V50 C56 56 49 59 40 59 C44 57 46 54 46 50Z" fill="#0D6A9A" opacity=".55"/>
<path d="M8 27 L40 41 L72 27 V32 L40 46 L8 32Z" fill="#0F78AE"/>
<path d="M40 10 L72 27 L40 41 L8 27Z" fill="url(#ga12b)"/>
<path d="M40 10 L72 27 L56 35 L24 18Z" fill="#fff" opacity=".18"/>
<path d="M40 26 L64 30 V50" stroke="#FFC800" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<rect x="61.4" y="48" width="5.2" height="9" rx="2.6" fill="#FFC800"/>
<circle cx="40" cy="26" r="2.8" fill="#FFC800"/>
${face(40, 49, 0.9, 6.3)}
<g transform="rotate(-6 40 67)"><rect x="10" y="62.5" width="60" height="9.5" rx="4.75" fill="url(#ga12p)" stroke="#D9CFAE" stroke-width="1"/><path d="M40 62.5 V72" stroke="#FF4B4B" stroke-width="5"/><circle cx="40" cy="67.2" r="2.2" fill="#E02D2D"/></g>`,
};

export const GRADE_SLOTS = 12;

/** Returns the inner SVG markup for a drawing, or null when the kind is not one of the new drawings. */
export function gradeArtMarkup(kind) {
  const fn = ART[kind];
  return fn ? fn() : null;
}
export const GRADE_ART_KINDS = Object.keys(ART);
