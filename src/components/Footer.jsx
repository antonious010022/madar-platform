import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listFooterLinks, getBrandSettings } from "../lib/db";
import { SOCIAL_PLATFORMS, SocialIcon, socialHref } from "./SocialIcons";

const FALLBACK_EMAIL = "aantounyouss@gmail.com";

export default function Footer() {
  const [links, setLinks] = useState(null);
  const [brand, setBrand] = useState({ name: "مَدَار", description: "", contactEmail: FALLBACK_EMAIL, socialLinks: {} });

  useEffect(() => {
    let mounted = true;
    Promise.all([listFooterLinks().catch(() => []), getBrandSettings().catch(() => ({}))])
      .then(([l, b]) => {
        if (!mounted) return;
        setLinks(Array.isArray(l) ? l : []);
        setBrand({
          name: b?.name || "مَدَار",
          description: b?.description || "منصة تعليمية تفاعلية.",
          contactEmail: b?.contactEmail || FALLBACK_EMAIL,
          socialLinks: b?.socialLinks && typeof b.socialLinks === "object" ? b.socialLinks : {},
        });
      });
    return () => {
      mounted = false;
    };
  }, []);

  const email = brand.contactEmail || FALLBACK_EMAIL;
  const socials = SOCIAL_PLATFORMS.map((p) => ({ ...p, href: socialHref(p.key, brand.socialLinks?.[p.key]) })).filter((p) => p.href);

  return (
    <footer className="duo-footer w-full mt-auto" style={{ background: "#FFFFFF", color: "var(--duo-muted)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <img src="/photo/0MSCh.png" alt={brand.name} className="h-9 w-auto shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-base" style={{ color: "var(--duo-green-ink)" }}>{brand.name}</p>
                <p className="text-xs mt-1 max-w-md leading-5" style={{ color: "var(--duo-muted)" }}>{brand.description}</p>
              </div>
            </div>

            {socials.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" aria-label="منصات التواصل الاجتماعي">
                {socials.map((p) => (
                  <a
                    key={p.key}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={p.label}
                    aria-label={p.label}
                    style={{ "--sc": p.color }}
                    className="duo-social inline-flex items-center justify-center w-11 h-11 rounded-2xl border-2 bg-white text-[color:var(--sc)] border-[color:var(--sc)] hover:bg-[color:var(--sc)] hover:text-white"
                  >
                    <SocialIcon name={p.key} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold" aria-label="روابط التذييل">
            {(links || []).map((link) => {
              const to = link.page_slug ? `/student/page/${link.page_slug}` : link.external_url;
              if (!to) return null;
              if (link.external_url) {
                return (
                  <a key={link.id} href={link.external_url} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                );
              }
              return (
                <Link key={link.id} to={to}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="font-bold" style={{ color: "var(--duo-ink-soft)" }}>تواصل معنا:</span>
            <a href={"mailto:" + email} className="duo-mail font-bold break-all" style={{ color: "var(--duo-blue-ink)" }}>
              {email}
            </a>
          </div>

           <p className="text-[11px] text-center sm:text-right" style={{ color: "var(--duo-muted)" }}>
           © {new Date().getFullYear()} {brand.name} — جميع الحقوق محفوظة <span className="mx-1">|</span> Antonious Shenoda
           </p>
        </div>
      </div>
    </footer>
  );
}