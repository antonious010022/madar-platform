import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import { getPlatformPageBySlug, getBrandSettings } from "../lib/db";

export default function CmsPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let m = true;
    getPlatformPageBySlug(slug)
      .then((p) => m && setPage(p || false))
      .catch(() => m && setPage(false));
    getBrandSettings().then((b) => m && setEmail(b?.contactEmail || "")).catch(() => {});
    return () => { m = false; };
  }, [slug]);

  if (page === null) {
    return <div className="p-10 text-center" style={{ color: "#6E6B85" }}>جاري التحميل...</div>;
  }
  if (!page || page.is_visible === false) {
    return (
      <div className="min-h-screen flex flex-col dir-rtl text-right" style={{ background: "#F7F5FB" }}>
        <div className="max-w-2xl mx-auto w-full px-5 py-10 flex-1">
          <Link to="/student" className="text-xs font-bold" style={{ color: "#4B2FD1" }}>← العودة</Link>
          <p className="mt-6" style={{ color: "#D6334B" }}>الصفحة غير متاحة.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dir-rtl text-right" style={{ background: "#F7F5FB" }}>
      <div className="max-w-2xl mx-auto w-full px-5 py-10 flex-1">
        <Link to="/student" className="text-xs font-bold mb-6 inline-block" style={{ color: "#4B2FD1" }}>
          ← العودة للمنصة
        </Link>
        <h1 className="font-black text-2xl mb-4" style={{ color: "#4B2FD1" }}>{page.title}</h1>
        <div className="text-sm leading-7 whitespace-pre-wrap" style={{ color: "#433F66" }}>
          {page.body}
        </div>
        {slug === "contact" && email && (
          <p className="mt-6 text-sm">
            <a href={"mailto:" + email} className="font-bold underline" style={{ color: "#4B2FD1" }}>{email}</a>
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
}
