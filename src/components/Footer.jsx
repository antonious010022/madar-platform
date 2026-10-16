
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listFooterLinks, getBrandSettings } from "../lib/db";
import { SOCIAL_PLATFORMS, SocialIcon, socialHref } from "./SocialIcons";
import "./footer-styles.css";

const FALLBACK_EMAIL = "aantounyouss@gmail.com";

export default function Footer() {
  const [links, setLinks] = useState(null);
  const [brand, setBrand] = useState({
    name: "مَدَار",
    description: "",
    contactEmail: FALLBACK_EMAIL,
    socialLinks: {},
  });

  useEffect(() => {
    let mounted = true;

    Promise.all([
      listFooterLinks().catch(() => []),
      getBrandSettings().catch(() => ({})),
    ]).then(([footerLinks, settings]) => {
      if (!mounted) return;

      setLinks(Array.isArray(footerLinks) ? footerLinks : []);

      setBrand({
        name: settings?.name || "مَدَار",
        description: settings?.description || "منصة تعليمية تفاعلية.",
        contactEmail: settings?.contactEmail || FALLBACK_EMAIL,
        socialLinks:
          settings?.socialLinks &&
          typeof settings.socialLinks === "object"
            ? settings.socialLinks
            : {},
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  const email = brand.contactEmail || FALLBACK_EMAIL;

  const socials = SOCIAL_PLATFORMS
    .map((platform) => ({
      ...platform,
      href: socialHref(
        platform.key,
        brand.socialLinks?.[platform.key]
      ),
    }))
    .filter((platform) => platform.href);

  return (
    <footer className="md-footer w-full mt-auto">
      <div className="md-footer-accent" aria-hidden="true" />

      <div className="md-footer-inner">
        <div className="md-footer-top">
          <div className="md-footer-brand">
            <Link
              to="/about"
              className="md-footer-logo-link"
              aria-label={`${brand.name} — صفحة التعريف`}
            >
              <img
                src="/photo/0MSCh.png"
                alt={brand.name}
                className="md-footer-logo"
              />
            </Link>

            <div className="md-footer-brand-text">
              <p className="md-footer-name">{brand.name}</p>
              <p className="md-footer-desc">
                {brand.description}
              </p>
            </div>
          </div>

          {socials.length > 0 && (
            <div
              className="md-footer-socials"
              aria-label="منصات التواصل الاجتماعي"
            >
              {socials.map((platform) => (
                <a
  key={platform.key}
  href={platform.href}
  target="_blank"
  rel="noopener noreferrer"
  title={platform.label}
  aria-label={platform.label}
  style={{ "--sc": platform.color }}
  className="md-footer-social"
>
  <span className="md-footer-social-icon-wrap">
    <SocialIcon name={platform.key} />
  </span>
</a>
              ))}
            </div>
          )}
        </div>

        <div className="md-footer-mid">
          <nav
            className="md-footer-nav"
            aria-label="روابط التذييل"
          >
            {(links || []).map((link) => {
              const destination = link.page_slug
                ? `/student/page/${link.page_slug}`
                : link.external_url;

              if (!destination) return null;

              if (link.external_url) {
                const isInternal =
                  link.external_url.startsWith("/") &&
                  !link.external_url.startsWith("//");

                if (isInternal) {
                  return (
                    <Link
                      key={link.id}
                      to={link.external_url}
                    >
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <a
                    key={link.id}
                    href={link.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.id}
                  to={destination}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <a
            href={`mailto:${email}`}
            className="md-footer-mail"
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4h16v16H4z" />
              <path d="m4 6 8 7 8-7" />
            </svg>

            <span>{email}</span>
          </a>
        </div>

        <p className="md-footer-copy">
          © {new Date().getFullYear()} {brand.name}
          {" — جميع الحقوق محفوظة "}
          <span className="md-footer-dot">·</span>
          {" Antonious Shenoda"}
        </p>
      </div>
    </footer>
  );
}
