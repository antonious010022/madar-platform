import { createClient } from "@supabase/supabase-js";

const FALLBACK_ORIGIN = "https://madar-platform-five.vercel.app";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const STATIC_PATHS = [
  "/student",
  "/student/about",
  "/student/privacy",
  "/student/terms",
];

function isRowMembersOnly(row) {
  const cfg =
    row?.journey_config && typeof row.journey_config === "object"
      ? row.journey_config
      : {};

  return !!(
    cfg.isMembersOnly ||
    cfg.exclusive ||
    cfg.is_members_only
  );
}

function slugify(text) {
  if (!text || typeof text !== "string") return "";

  let s = text.trim();

  // إزالة التشكيل العربي والتطويل
  s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, "");

  s = s.toLowerCase();

  // السماح بالعربي والإنجليزي والأرقام والمسافات والشرطات
  s = s.replace(
    /[^\u0600-\u06FF\u0750-\u077Fa-z0-9\s-]/g,
    " "
  );

  s = s.replace(/[\s_]+/g, "-");
  s = s.replace(/-+/g, "-");
  s = s.replace(/^-+|-+$/g, "");

  return s;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toLastmod(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function resolveOrigin(req) {
  const forwardedHost = req.headers["x-forwarded-host"];

  const host = forwardedHost
    ? String(forwardedHost).split(",")[0].trim()
    : req.headers.host;

  if (!host) {
    return FALLBACK_ORIGIN;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];

  const proto = forwardedProto
    ? String(forwardedProto).split(",")[0].trim()
    : "https";

  return `${proto}://${host}`;
}

function urlEntry(loc, lastmod = null) {
  const lastmodLine = lastmod
    ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>`
    : "";

  return (
    `  <url>\n` +
    `    <loc>${escapeXml(loc)}</loc>` +
    `${lastmodLine}\n` +
    `  </url>`
  );
}

export default async function handler(req, res) {
  res.setHeader(
    "Content-Type",
    "application/xml; charset=utf-8"
  );

  // السماح فقط بـ GET و HEAD
  if (
    req.method &&
    req.method !== "GET" &&
    req.method !== "HEAD"
  ) {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.end("Method Not Allowed");
    return;
  }

  // التأكد من وجود بيانات Supabase
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.statusCode = 500;

    res.end(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
        "<!-- sitemap unavailable: missing Supabase env vars -->"
    );

    return;
  }

  try {
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    const origin = resolveOrigin(req);

    const entries = [];

    // ============================================
    // الصفحات الثابتة العامة
    // ============================================

    for (const path of STATIC_PATHS) {
      entries.push(
        urlEntry(`${origin}${path}`)
      );
    }

    // ============================================
    // الدروس المنشورة والعامة فقط
    // ============================================

    const {
      data: lessons,
      error: lessonsError,
    } = await supabase
      .from("lessons")
      .select(
        "id, title, status, journey_config, updated_at, seo_slug"
      )
      .eq("status", "Published")
      .order("updated_at", {
        ascending: false,
      });

    if (lessonsError) {
      throw lessonsError;
    }

    for (const row of lessons || []) {
      // تجاهل الصفوف غير الصالحة
      if (!row?.id) {
        continue;
      }

      // عدم وضع الدروس الحصرية في Google
      if (isRowMembersOnly(row)) {
        continue;
      }

      // Prefer the teacher-controlled seo_slug; fall back to one derived
      // from the title. Always re-run through slugify() (even when seo_slug
      // is already set) so a manually-edited or legacy value still yields a
      // safe URL segment — same rule as src/lib/slugify.js everywhere else.
      const slugSource = (row.seo_slug && String(row.seo_slug).trim()) || row.title || "";
      const slug = slugify(slugSource);

      const path = slug
        ? `/lessons/${row.id}/${slug}`
        : `/lessons/${row.id}`;

      entries.push(
        urlEntry(
          `${origin}${path}`,
          toLastmod(row.updated_at)
        )
      );
    }

    // ============================================
    // صفحات المنصة الظاهرة
    // ============================================

    try {
      const {
        data: pages,
        error: pagesError,
      } = await supabase
        .from("platform_pages")
        .select(
          "slug, is_visible, sort_order, updated_at"
        )
        .eq("is_visible", true)
        .order("sort_order", {
          ascending: true,
        });

      // صفحات CMS اختيارية
      // لو حصلت مشكلة فيها لا نوقف Sitemap بالكامل
      if (!pagesError) {
        for (const row of pages || []) {
          if (!row?.slug) {
            continue;
          }

          const slug = encodeURIComponent(
            String(row.slug)
          );

          entries.push(
            urlEntry(
              `${origin}/student/page/${slug}`,
              toLastmod(row.updated_at)
            )
          );
        }
      }
    } catch {
      // تجاهل خطأ platform_pages
    }

    // ============================================
    // إنشاء XML
    // ============================================

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `${entries.join("\n")}\n` +
      `</urlset>\n`;

    res.statusCode = 200;

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    // HEAD لا يحتاج body
    if (req.method === "HEAD") {
      res.end();
      return;
    }

    res.end(xml);
  } catch (error) {
    console.error(
      "Sitemap generation failed:",
      error
    );

    res.statusCode = 502;

    res.setHeader(
      "Content-Type",
      "application/xml; charset=utf-8"
    );

    res.end(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
        "<!-- sitemap generation failed -->"
    );
  }
}