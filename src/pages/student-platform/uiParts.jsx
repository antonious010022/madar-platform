// Feature boxes, stage/grade picker art and StepRow for the student home page.
// Moved verbatim from StudentPlatform.jsx — logic unchanged.

/* ---------------------------------------------------------------------------
   Step Row
--------------------------------------------------------------------------- */
const FEATURE_SVG = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* Feature boxes at the bottom of the home page (presentation only) */
const MADAR_FEATURES = [
  {
    title: "شرح مرئي مبسّط",
    text: "فيديو وصور وشرح واضح يرافق كل فكرة في الدرس.",
    icon: (
      <svg {...FEATURE_SVG}>
        <rect x="2.5" y="6" width="13" height="12" rx="3" />
        <path d="M15.5 10.5l6-3.5v10l-6-3.5z" />
      </svg>
    ),
  },
  {
    title: "خرائط ذهنية",
    text: "تربط الأفكار ببعضها لتتذكّرها وتفهمها بسهولة.",
    icon: (
      <svg {...FEATURE_SVG}>
        <circle cx="12" cy="12" r="3" />
        <circle cx="4.5" cy="5.5" r="2" />
        <circle cx="19.5" cy="5.5" r="2" />
        <circle cx="12" cy="20" r="2" />
        <path d="M10 10L6 7M14 10l4-3M12 15v3" />
      </svg>
    ),
  },
  {
    title: "خطوط زمنية",
    text: "تتبّع الأحداث بترتيبها الصحيح عبر الزمن.",
    icon: (
      <svg {...FEATURE_SVG}>
        <path d="M3 12h18" />
        <circle cx="6" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="18" cy="12" r="1.6" />
        <path d="M6 6v3M12 15v3M18 6v3" />
      </svg>
    ),
  },
  {
    title: "أسئلة ومراجعة",
    text: "اختبر فهمك أولًا بأول وراجع قبل أن تنتقل للتالي.",
    icon: (
      <svg {...FEATURE_SVG}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.7 2.7L16 9.5" />
      </svg>
    ),
  },
];

/* Illustrated cards for choosing the stage / grade (presentation only) */
const GRADE_NUMBERS = {
  "الأول": 1, "الثاني": 2, "الثالث": 3, "الرابع": 4, "الخامس": 5, "السادس": 6, "السابع": 7, "الثامن": 8, "التاسع": 9,
};
const GRADE_ART = ["sprout", "plant", "tree", "books", "bulb", "cap"];

function gradeNumber(grade) {
  const g = String(grade || "").trim();

  if (g.includes("الأول") || g.includes("الاول") || g.includes("أولى") || g.includes("اولى")) return 1;
  if (g.includes("الثاني") || g.includes("الثانى") || g.includes("ثاني")) return 2;
  if (g.includes("الثالث") || g.includes("الثالثة") || g.includes("ثالث")) return 3;
  if (g.includes("الرابع") || g.includes("الرابعة") || g.includes("رابع")) return 4;
  if (g.includes("الخامس") || g.includes("الخامسة") || g.includes("خامس")) return 5;
  if (g.includes("السادس") || g.includes("السادسة") || g.includes("سادس")) return 6;
  if (g.includes("السابع") || g.includes("السابعة") || g.includes("سابع")) return 7;
  if (g.includes("الثامن") || g.includes("الثامنة") || g.includes("ثامن")) return 8;
  if (g.includes("التاسع") || g.includes("التاسعة") || g.includes("تاسع")) return 9;

  return null;
}

function gradeArtKind(grade) {
  const n = gradeNumber(grade);
  return n ? GRADE_ART[(n - 1) % GRADE_ART.length] : "book";
}

function stageArtKind(stage) {
  const st = String(stage || "");
  if (st.includes("ابتدائ")) return "pencil";
  if (st.includes("إعداد") || st.includes("اعداد")) return "globe";
  if (st.includes("ثانو")) return "cap";
  return "book";
}

/* ---------------------------------------------------------------------------
   PickArt — a little cast of smiling characters, one per grade / stage.
   Presentation only (same `kind` prop as before). Colors are fixed per drawing
   so every card looks rich on both the tinted and the "selected" white backdrop.
--------------------------------------------------------------------------- */
const INK = "#3C3C3C";

function Face({ x, y, s = 1, gap = 6.5 }) {
  const e = gap * s;
  const eye = (cx) => (
    <g className="pa-eye">
      <ellipse cx={cx} cy={y} rx={2.2 * s} ry={2.7 * s} fill={INK} />
      <circle cx={cx + 0.7 * s} cy={y - 1 * s} r={0.85 * s} fill="#FFFFFF" />
    </g>
  );
  return (
    <g className="pa-face">
      {eye(x - e)}
      {eye(x + e)}
      <ellipse cx={x - e - 4.2 * s} cy={y + 4.2 * s} rx={2.8 * s} ry={1.7 * s} fill="#FF6F91" opacity=".5" />
      <ellipse cx={x + e + 4.2 * s} cy={y + 4.2 * s} rx={2.8 * s} ry={1.7 * s} fill="#FF6F91" opacity=".5" />
      <path
        d={`M${x - 3 * s} ${y + 3.6 * s} Q${x} ${y + 7.6 * s} ${x + 3 * s} ${y + 3.6 * s}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.7 * s}
        strokeLinecap="round"
      />
    </g>
  );
}

function Spark({ x, y, r, fill }) {
  return (
    <path
      className="pa-spark"
      style={{ fill }}
      d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`}
    />
  );
}

function PickArt({ kind }) {
  const render = () => {
    switch (kind) {
      case "sprout": // الصف الأول — a seedling peeking out of the soil
        return (
          <>
            <path d="M40 34 Q40 30 41 27" stroke="#58A700" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M40 33 C40 23 32 17 22 19 C22 29 30 35 40 33Z" fill="#58CC02" />
            <path d="M40 33 Q31 27 25 21" stroke="#89E219" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M40 33 C40 21 48 13 60 14 C60 27 52 34 40 33Z" fill="#89E219" />
            <path d="M40 33 Q49 25 57 17" stroke="#58CC02" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <circle cx="40" cy="50" r="16" fill="#B6EE5A" />
            <ellipse cx="32" cy="42" rx="4" ry="2.4" fill="#FFFFFF" opacity=".45" transform="rotate(-30 32 42)" />
            <Face x={40} y={49} />
            <path d="M16 73 Q17 58 40 58 Q63 58 64 73Z" fill="#A9693B" />
            <path d="M16 73 Q16.4 69 18 66 Q40 76 62 66 Q63.6 69 64 73Z" fill="#8F562E" />
            <circle cx="28" cy="66" r="1.6" fill="#C98B5B" />
            <circle cx="49" cy="64" r="1.3" fill="#C98B5B" />
            <circle cx="55" cy="68" r="1.6" fill="#C98B5B" />
          </>
        );
      case "plant": // الصف الثاني — a flower pot with a pink flower
        return (
          <>
            <path d="M40 46 V29" stroke="#58A700" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M40 41 C30 41 23 35 23 27 C32 27 40 33 40 41Z" fill="#58CC02" />
            <path d="M40 35 C40 26 47 20 58 20 C58 29 51 35 40 35Z" fill="#89E219" />
            <g>
              <circle cx="45.5" cy="22" r="4.2" fill="#FF86D0" />
              <circle cx="41.7" cy="27.2" r="4.2" fill="#FF86D0" />
              <circle cx="35.5" cy="25.2" r="4.2" fill="#FF86D0" />
              <circle cx="35.5" cy="18.8" r="4.2" fill="#FF86D0" />
              <circle cx="41.7" cy="16.8" r="4.2" fill="#FF86D0" />
              <circle cx="40" cy="22" r="3.8" fill="#FFC800" />
            </g>
            <rect x="23" y="44" width="34" height="9" rx="3.5" fill="#E8733A" />
            <path d="M26.5 53 H53.5 L50 69 Q49.6 72 46.5 72 H33.5 Q30.4 72 30 69Z" fill="#F59A5B" />
            <path d="M44 53 H53.5 L50 69 Q49.6 72 46.5 72 H44Z" fill="#E8733A" opacity=".55" />
            <rect x="26" y="45" width="28" height="2" rx="1" fill="#FFFFFF" opacity=".35" />
            <Face x={40} y={60.5} s={0.9} gap={6.2} />
          </>
        );
      case "tree": // الصف الثالث — a fluffy tree with apples
        return (
          <>
            <ellipse cx="40" cy="69" rx="21" ry="4.5" fill="#89E219" />
            <path d="M34 46 H46 L47.5 68 H32.5Z" fill="#B97A4A" />
            <path d="M42 46 H46 L47.5 68 H42Z" fill="#A0653A" />
            <g fill="#58A700">
              <circle cx="27" cy="36.5" r="12" />
              <circle cx="53" cy="36.5" r="12" />
              <circle cx="40" cy="26.5" r="14" />
              <circle cx="40" cy="40.5" r="12" />
            </g>
            <g fill="#58CC02">
              <circle cx="27" cy="34" r="12" />
              <circle cx="53" cy="34" r="12" />
              <circle cx="40" cy="24" r="14" />
              <circle cx="40" cy="38" r="12" />
            </g>
            <circle cx="33" cy="18" r="5" fill="#89E219" opacity=".85" />
            <circle cx="21" cy="29" r="3.4" fill="#89E219" opacity=".85" />
            <circle cx="28" cy="42" r="2.7" fill="#FF4B4B" />
            <circle cx="55" cy="26" r="2.7" fill="#FF4B4B" />
            <circle cx="27.3" cy="41.3" r="0.8" fill="#FFFFFF" opacity=".8" />
            <circle cx="54.3" cy="25.3" r="0.8" fill="#FFFFFF" opacity=".8" />
            <Face x={40} y={33} s={1.05} />
          </>
        );
      case "books": // الصف الرابع — a cheerful stack of books
        return (
          <>
            <rect x="11" y="54" width="58" height="15" rx="4.5" fill="#1CB0F6" />
            <rect x="60" y="56" width="7" height="11" rx="2" fill="#DDF4FF" />
            <rect x="15" y="57" width="3" height="9" rx="1.5" fill="#FFFFFF" opacity=".55" />
            <rect x="11" y="63" width="58" height="6" rx="3" fill="#1899D6" opacity=".55" />
            <rect x="17" y="39" width="50" height="15" rx="4.5" fill="#FF9600" />
            <rect x="58" y="41" width="7" height="11" rx="2" fill="#FFE9C7" />
            <rect x="21" y="42" width="3" height="9" rx="1.5" fill="#FFFFFF" opacity=".55" />
            <rect x="17" y="48" width="50" height="6" rx="3" fill="#CD7900" opacity=".55" />
            <rect x="13" y="23" width="48" height="16" rx="4.5" fill="#CE82FF" />
            <rect x="52" y="25" width="7" height="12" rx="2" fill="#F3E1FF" />
            <rect x="13" y="33" width="48" height="6" rx="3" fill="#A568CC" opacity=".55" />
            <Face x={34} y={30} s={0.82} gap={6.4} />
            <path d="M44 23 V15 L47 17.5 L50 15 V23Z" fill="#FF4B4B" />
          </>
        );
      case "bulb": // الصف الخامس — a bright idea
        return (
          <>
            <g stroke="#FFC800" strokeWidth="3" strokeLinecap="round">
              <path d="M40 3.5 V7.5" />
              <path d="M17 11 L20 14" />
              <path d="M63 11 L60 14" />
              <path d="M9.5 31 H13.5" />
              <path d="M66.5 31 H70.5" />
            </g>
            <path d="M40 12 C27 12 20 22 20 31 C20 38 24 42 28 47 V51 H52 V47 C56 42 60 38 60 31 C60 22 53 12 40 12Z" fill="#FFD84D" />
            <path d="M49 14 C56 17 60 24 60 31 C60 38 56 42 52 47 V51 H46 V47 C50 42 54 38 54 31 C54 24 52 18 49 14Z" fill="#FFC800" opacity=".7" />
            <path d="M27 21 C29 16 33 14 36 13.5" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".75" />
            <Face x={40} y={31} s={1.05} />
            <rect x="28" y="51" width="24" height="5.5" rx="2.5" fill="#B5B5B5" />
            <rect x="30" y="57" width="20" height="5.5" rx="2.5" fill="#8E8E8E" />
            <path d="M35 63.5 H45 Q45 69 40 69 Q35 69 35 63.5Z" fill="#5E5E5E" />
          </>
        );
      case "cap": // الصف السادس / المرحلة الثانوية — a graduate
        return (
          <>
            <path d="M24 40 V53 C24 59 31 63 40 63 C49 63 56 59 56 53 V40Z" fill="#1899D6" />
            <path d="M46 40 H56 V53 C56 59 49 63 40 63 C44 61 46 57 46 53Z" fill="#1580B5" opacity=".6" />
            <path d="M10 30 L40 44 L70 30 V34.5 L40 48.5 L10 34.5Z" fill="#1580B5" />
            <path d="M40 15 L70 30 L40 44 L10 30Z" fill="#1CB0F6" />
            <path d="M40 15 L70 30 L55 37 L25 22Z" fill="#FFFFFF" opacity=".16" />
            <path d="M40 30 L63 32.5 V47" stroke="#FFC800" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="60.6" y="46" width="4.8" height="8.5" rx="2.4" fill="#FFC800" />
            <circle cx="40" cy="30" r="2.6" fill="#FFC800" />
            <Face x={40} y={53} s={0.9} gap={6.2} />
          </>
        );
      case "pencil": // المرحلة الابتدائية — a lively pencil
        return (
          <g transform="rotate(14 40 40)">
            <rect x="30" y="3" width="20" height="10" rx="4.5" fill="#FF86D0" />
            <rect x="30" y="11" width="20" height="6" fill="#B5B5B5" />
            <rect x="30" y="13" width="20" height="1.6" fill="#FFFFFF" opacity=".5" />
            <rect x="30" y="17" width="20" height="38" fill="#FFC800" />
            <rect x="30" y="17" width="5" height="38" fill="#FFD84D" />
            <rect x="45" y="17" width="5" height="38" fill="#E5B400" />
            <path d="M30 55 H50 L40 73Z" fill="#F4C896" />
            <path d="M40 55 H50 L40 73Z" fill="#E3AE76" />
            <path d="M36.4 66.6 H43.6 L40 73Z" fill="#3C3C3C" />
            <Face x={40} y={36} s={1} gap={6} />
          </g>
        );
      case "globe": // المرحلة الإعدادية — a friendly globe
        return (
          <>
            <rect x="37" y="60" width="6" height="11" rx="2" fill="#A568CC" />
            <ellipse cx="40" cy="71" rx="15" ry="3.6" fill="#CE82FF" />
            <circle cx="40" cy="37" r="25" fill="#1CB0F6" />
            <path d="M28 18 C34 15 41 17 41 22 C41 27 35 28 33 32 C30 35 24 31 25 26 C25 22 26 20 28 18Z" fill="#58CC02" />
            <path d="M49 46 C54 43 60 46 58.5 51 C57 56 52 57 49.5 53.5 C47.5 50.5 47.5 48 49 46Z" fill="#58CC02" />
            <path d="M24 49 C27 47 31 49 30 53 C29 56 25 56 23.5 53Z" fill="#58CC02" />
            <path d="M57 20 C63 24 65 31 63 37" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".4" />
            <circle cx="40" cy="37" r="25" fill="none" stroke="#1899D6" strokeWidth="2.6" />
            <Face x={40} y={36} s={1.02} />
          </>
        );
      case "book":
      default: // fallback — an open book that smiles
        return (
          <>
            <path d="M7 26 Q24 19 40 28 Q56 19 73 26 V63 Q56 57 40 65 Q24 57 7 63Z" fill="#1CB0F6" />
            <path d="M7 58 Q24 52 40 60.5 Q56 52 73 58 V63 Q56 57 40 65 Q24 57 7 63Z" fill="#1899D6" />
            <path d="M11 28 Q25 22 40 30.5 V60 Q25 53 11 59Z" fill="#FFFFFF" />
            <path d="M69 28 Q55 22 40 30.5 V60 Q55 53 69 59Z" fill="#F0F0F0" />
            <g stroke="#D0D0D0" strokeWidth="1.8" strokeLinecap="round">
              <path d="M17 34 Q22 32.5 28 35" />
              <path d="M17 39 Q22 37.5 26 39.5" />
              <path d="M52 35 Q58 32.5 63 34" />
              <path d="M54 39.5 Q58 37.5 63 39" />
            </g>
            <path d="M54 25 V38 L57.5 34.8 L61 38 V24Z" fill="#FF4B4B" />
            <Face x={40} y={47} s={0.95} gap={6.6} />
          </>
        );
    }
  };
  return (
    <svg className="md-art" viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <circle cx="40" cy="42" r="31" style={{ fill: "var(--acc-light)" }} opacity=".3" />
      <ellipse cx="40" cy="73.5" rx="19" ry="3" fill="#000000" opacity=".1" />
      <g className="pa-body">{render()}</g>
      <Spark x={11} y={17} r={4.2} fill="#FFC800" />
      <Spark x={69} y={25} r={3.2} fill="var(--acc)" />
      <Spark x={67} y={62} r={2.6} fill="#FFFFFF" />
    </svg>
  );
}

function StepRow({ number, done, active, label, children }) {
  return (
    <div className={`md-step ${done ? "done" : ""} ${active ? "active" : ""}`} data-step={number}>
      <div className="md-step-indicator">
        <div className="md-step-number">{done ? "✓" : number}</div>
        <div className="md-step-line" />
      </div>
      <div className="md-step-content">
        <div className="md-step-label">{label}</div>
        <div className="md-step-body">{children}</div>
      </div>
    </div>
  );
}

export { FEATURE_SVG, MADAR_FEATURES, GRADE_NUMBERS, GRADE_ART, gradeNumber, gradeArtKind, stageArtKind, PickArt, StepRow };