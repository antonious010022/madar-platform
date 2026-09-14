// ============================================================
// إعدادات الفوتر — عدّل القيم هنا فقط عند توفر البيانات الحقيقية
// ============================================================
const PLATFORM_NAME = "منصة مَدَار";
const PLATFORM_DESCRIPTION =
  "منصة تعليمية تفاعلية تقدّم الدروس بطريقة مبسطة، منظمة، وتفاعلية تساعد الطالب على الفهم والاستيعاب.";
const CONTACT_EMAIL = "aantounyouss@gmail.com"; // TODO: ضع البريد الإلكتروني الحقيقي هنا
const COPYRIGHT_TEXT =
  "© 2026 جميع الحقوق محفوظة بواسطة | Antonious Shenouda | " + PLATFORM_NAME;

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/madarplatform1",
  instagram: "https://www.instagram.com/madar_platform_/",
  youtube: "https://www.youtube.com/@madar_platform",
  tiktok: "https://www.tiktok.com/@madar_platform",
  whatsapp: "#",
};

function IconLink({ href, label, children }) {
  const isRealLink = href && href !== "#";
  return (
    <a
      href={href || "#"}
      target={isRealLink ? "_blank" : undefined}
      rel={isRealLink ? "noopener noreferrer" : undefined}
      aria-label={label}
      onClick={(e) => {
        if (!isRealLink) e.preventDefault();
      }}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full transition-all hover:opacity-80 shrink-0"
      style={{ background: "#10665A", color: "#FAF6ED" }}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer
      className="w-full mt-auto"
      style={{
        background: "#FFFFFF",
        color: "#8A8570",
        borderTop: "0.5px solid #DED4BD",

      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-1.5 text-xs">
          
          {/* الجانب الأيمن: اللوجو + الاسم + الوصف */}
          <div className="flex items-center gap-2 leading-none">
            <img
              src="/photo/IevsR.png"
              alt="مَدَار"
              className="h-4 w-auto shrink-0"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs" style={{ color: "#10665A" }}>
                {PLATFORM_NAME}
              </span>
              <span style={{ color: "#DED4BD" }}>|</span>
              <span className="text-[11px] hidden sm:inline" style={{ color: "#8A8570" }}>
                {PLATFORM_DESCRIPTION}
              </span>
            </div>
          </div>

          {/* الروابط + الأيقونات + الحقوق */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-3">
              <span className="font-medium" style={{ color: "#5C5A4A" }}>
                تواصل معنا
              </span>
              <a
                href={"mailto:" + CONTACT_EMAIL}
                className="font-medium hover:underline"
                style={{ color: "#5C5A4A" }}
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <span className="h-3 w-[1px] hidden sm:inline" style={{ background: "#DED4BD" }}></span>

            {/* الأيقونات */}
            <div className="flex items-center gap-1.5">
              <IconLink href={SOCIAL_LINKS.facebook} label="Facebook">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
                </svg>
              </IconLink>
              <IconLink href={SOCIAL_LINKS.instagram} label="Instagram">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.78.22 2.41.46.65.25 1.2.6 1.75 1.15.55.55.9 1.1 1.15 1.75.24.63.41 1.35.46 2.41.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.78-.46 2.41-.25.65-.6 1.2-1.15 1.75-.55.55-1.1.9-1.75 1.15-.63.24-1.35.41-2.41.46-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.78-.22-2.41-.46a4.93 4.93 0 01-1.75-1.15 4.93 4.93 0 01-1.15-1.75c-.24-.63-.41-1.35-.46-2.41C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.78.46-2.41.25-.65.6-1.2 1.15-1.75A4.93 4.93 0 015.42 2.57c.63-.24 1.35-.41 2.41-.46C8.89 2.01 9.23 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.17 1.17 0 100-2.34 1.17 1.17 0 000 2.34z" />
                </svg>
              </IconLink>
              <IconLink href={SOCIAL_LINKS.youtube} label="YouTube">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
                </svg>
              </IconLink>
              <IconLink href={SOCIAL_LINKS.tiktok} label="TikTok">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.6 2h-3.2v13.3a2.7 2.7 0 11-2.7-2.7c.2 0 .4 0 .6.05V9.4a5.93 5.93 0 00-.6-.03A5.93 5.93 0 1016.6 15.3V8.8a8.1 8.1 0 004.5 1.4V7a4.9 4.9 0 01-4.5-5z" />
                </svg>
              </IconLink>
              <IconLink href={SOCIAL_LINKS.whatsapp} label="WhatsApp">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5 14.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.68.25-1.27.17-1.4-.08-.12-.27-.2-.57-.35zM12.04 2C6.5 2 2 6.48 2 12c0 1.88.52 3.64 1.42 5.15L2 22l4.98-1.3A9.9 9.9 0 0012.04 22C17.6 22 22 17.5 22 12S17.6 2 12.04 2z" />
                </svg>
              </IconLink>
            </div>

            <span className="h-3 w-[1px] hidden lg:inline" style={{ background: "#DED4BD" }}></span>

            <span className="text-[11px] tracking-tight shrink-0" style={{ color: "#8A8570" }}>
              {COPYRIGHT_TEXT}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}