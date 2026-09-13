// ============================================================
// إعدادات الفوتر — عدّل القيم هنا فقط عند توفر البيانات الحقيقية
// ============================================================
const PLATFORM_NAME = "منصة مَدَار";
const PLATFORM_DESCRIPTION =
  "منصة تعليمية تفاعلية تقدّم الدروس بطريقة مبسطة، منظمة، وتفاعلية تساعد الطالب على الفهم والاستيعاب.";
const CONTACT_EMAIL = "aantonyouss@gmail.com"; // TODO: ضع البريد الإلكتروني الحقيقي هنا
const COPYRIGHT_TEXT =
  "© 2026 جميع الحقوق محفوظة بواسطة | Antonious Shenouda | " + PLATFORM_NAME;

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/madarplatform1/", // TODO: ضع رابط فيسبوك الحقيقي هنا
  instagram: "https://www.instagram.com/madar_platform_", // TODO: ضع رابط إنستغرام الحقيقي هنا
  youtube: "https://www.youtube.com/channel/UCwykQ0WgKMCuhxgg65RlNFQ", // TODO: ضع رابط يوتيوب الحقيقي هنا
  tiktok: "https://www.tiktok.com/@madar_platform", // TODO: ضع رابط تيك توك الحقيقي هنا
  whatsapp: "#", // TODO: ضع رابط واتساب الحقيقي هنا (مثال: https://wa.me/20XXXXXXXXX)
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
      className="md-footer-icon"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="md-footer">
      <div className="md-footer-inner">
        {/* اللوجو + الاسم + الوصف */}
        <div className="md-footer-brand">
          <img src="/photo/IevsR.png" alt="مَدَار" className="md-footer-logo" />
          <div className="md-footer-brand-text">
            <span className="md-footer-name">{PLATFORM_NAME}</span>
            <span className="md-footer-sep">|</span>
            <span className="md-footer-desc">{PLATFORM_DESCRIPTION}</span>
          </div>
        </div>

        {/* التواصل + الأيقونات + الحقوق */}
        <div className="md-footer-meta">
          <div className="md-footer-contact">
            <span>تواصل معنا</span>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>

          <div className="md-footer-social">
            <IconLink href={SOCIAL_LINKS.facebook} label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
              </svg>
            </IconLink>
            <IconLink href={SOCIAL_LINKS.instagram} label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.78.22 2.41.46.65.25 1.2.6 1.75 1.15.55.55.9 1.1 1.15 1.75.24.63.41 1.35.46 2.41.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.78-.46 2.41-.25.65-.6 1.2-1.15 1.75-.55.55-1.1.9-1.75 1.15-.63.24-1.35.41-2.41.46-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.78-.22-2.41-.46a4.93 4.93 0 01-1.75-1.15 4.93 4.93 0 01-1.15-1.75c-.24-.63-.41-1.35-.46-2.41C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.78.46-2.41.25-.65.6-1.2 1.15-1.75A4.93 4.93 0 015.42 2.57c.63-.24 1.35-.41 2.41-.46C8.89 2.01 9.23 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.17 1.17 0 100-2.34 1.17 1.17 0 000 2.34z" />
              </svg>
            </IconLink>
            <IconLink href={SOCIAL_LINKS.youtube} label="YouTube">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
              </svg>
            </IconLink>
            <IconLink href={SOCIAL_LINKS.tiktok} label="TikTok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.6 2h-3.2v13.3a2.7 2.7 0 11-2.7-2.7c.2 0 .4 0 .6.05V9.4a5.93 5.93 0 00-.6-.03A5.93 5.93 0 1016.6 15.3V8.8a8.1 8.1 0 004.5 1.4V7a4.9 4.9 0 01-4.5-5z" />
              </svg>
            </IconLink>
            <IconLink href={SOCIAL_LINKS.whatsapp} label="WhatsApp">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.68.25-1.27.17-1.4-.08-.12-.27-.2-.57-.35zM12.04 2C6.5 2 2 6.48 2 12c0 1.88.52 3.64 1.42 5.15L2 22l4.98-1.3A9.9 9.9 0 0012.04 22C17.6 22 22 17.5 22 12S17.6 2 12.04 2z" />
              </svg>
            </IconLink>
          </div>

          <span className="md-footer-copy">{COPYRIGHT_TEXT}</span>
        </div>
      </div>

      <style>{`
  .md-footer {
    position: relative;
    z-index: 10;
    margin-top: auto;
    background: #ffffff;
    border-top: 1px solid #e8eeed;
    color: #647572;
  }

  .md-footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 14px 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 24px;
    font-size: 0.78rem;
  }

  .md-footer-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .md-footer-logo {
    height: 22px;
    width: auto;
    object-fit: contain;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 5px rgba(14, 83, 72, 0.12));
  }

  .md-footer-brand-text {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;
  }

  .md-footer-name {
    font-weight: 700;
    color: #0E5348;
    white-space: nowrap;
  }

  .md-footer-sep {
    color: #d5dfdd;
  }

  .md-footer-desc {
    color: #71817e;
    line-height: 1.4;
  }

  .md-footer-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px 18px;
  }

  .md-footer-contact {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .md-footer-contact span {
    color: #657572;
    font-weight: 500;
  }

  .md-footer-contact a {
    color: #3f5753;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .md-footer-contact a:hover {
    color: #0E5348;
  }

  .md-footer-social {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .md-footer-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f0f7f5;
    color: #0E5348;
    border: 1px solid #dceae7;
    transition: all 0.22s ease;
  }

  .md-footer-icon:hover {
    background: #0E5348;
    color: #ffffff;
    border-color: #0E5348;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(14, 83, 72, 0.18);
  }

  .md-footer-copy {
    color: #8a9996;
    font-size: 0.72rem;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .md-footer-inner {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
    }

    .md-footer-meta {
      width: 100%;
      justify-content: space-between;
    }

    .md-footer-desc {
      font-size: 0.7rem;
    }
  }
`}</style>
    </footer>
  );
}