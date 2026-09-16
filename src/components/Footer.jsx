import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listFooterLinks, getBrandSettings } from "../lib/db";

const FALLBACK_EMAIL = "aantounyouss@gmail.com";

export default function Footer() {
  const [links, setLinks] = useState(null);
  const [brand, setBrand] = useState({ name: "مَدَار", description: "", contactEmail: FALLBACK_EMAIL });

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
        });
      });
    return () => {
      mounted = false;
    };
  }, []);

  const email = brand.contactEmail || FALLBACK_EMAIL;

  return (
    <footer className="w-full mt-auto" style={{ background: "#FFFFFF", color: "#8A8570", borderTop: "1px solid #DED4BD" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <img src="/photo/IevsR.png" alt={brand.name} className="h-9 w-auto shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-base" style={{ color: "#10665A" }}>{brand.name}</p>
                <p className="text-xs mt-1 max-w-md leading-5" style={{ color: "#8A8570" }}>{brand.description}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold" aria-label="روابط التذييل">
            {(links || []).map((link) => {
              const to = link.page_slug ? `/student/page/${link.page_slug}` : link.external_url;
              if (!to) return null;
              if (link.external_url) {
                return (
                  <a key={link.id} href={link.external_url} className="hover:underline" style={{ color: "#10665A" }} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                );
              }
              return (
                <Link key={link.id} to={to} className="hover:underline" style={{ color: "#10665A" }}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="font-bold" style={{ color: "#5C5A4A" }}>تواصل معنا:</span>
            <a href={"mailto:" + email} className="font-bold hover:underline break-all" style={{ color: "#10665A" }}>
              {email}
            </a>
          </div>

          <p className="text-[11px]" style={{ color: "#8A8570" }}>
            © {new Date().getFullYear()} {brand.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
