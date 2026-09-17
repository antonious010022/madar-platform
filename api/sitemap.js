/**
 * Dynamic Sitemap for مَدَار — Vercel Serverless Function
 * Served at: /api/sitemap
 * For /sitemap.xml, add a rewrite BEFORE the SPA catch-all (see project notes).
 *
 * Uses public anon key + RLS only. No service_role.
 * Query: lessons where status = Published (same rule as listPublishedLessons).
 */

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toLastmod(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function urlEntry(loc, lastmod) {
  const lm = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lm}\n  </url>`;
}

function getBaseUrl(req) {
  const host =
    (req.headers["x-forwarded-host"] && String(req.headers["x-forwarded-host"]).split(",")[0].trim()) ||
    req.headers.host ||
    "";
  if (!host) return null;
  const proto =
    (req.headers["x-forwarded-proto"] && String(req.headers["x-forwarded-proto"]).split(",")[0].trim()) ||
    "https";
  return `${proto}://${host}`;
}

async function supabaseGet(path, url, key) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.end("Method Not Allowed");
    return;
  }

  const base = getBaseUrl(req);
  if (!base) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Missing Host header");
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(
      "Sitemap misconfigured: set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY) in Vercel env."
    );
    return;
  }

  const entries = [];

  // Static public pages (routes from App.jsx)
  entries.push(urlEntry(`${base}/student`, null));
  entries.push(urlEntry(`${base}/student/about`, null));
  entries.push(urlEntry(`${base}/student/privacy`, null));
  entries.push(urlEntry(`${base}/student/terms`, null));

  // Published lessons only — same filter as listPublishedLessons()
  try {
    const lessons = await supabaseGet(
      "lessons?status=eq.Published&select=id,updated_at&order=updated_at.desc",
      supabaseUrl.replace(/\/$/, ""),
      supabaseKey
    );
    if (Array.isArray(lessons)) {
      for (const row of lessons) {
        if (!row || !row.id) continue;
        entries.push(
          urlEntry(`${base}/student/lesson/${row.id}`, toLastmod(row.updated_at))
        );
      }
    }
  } catch (e) {
    // Fail the sitemap if lessons cannot be listed (core content)
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Failed to load published lessons for sitemap.");
    return;
  }

  // CMS pages — only visible if is_visible is true (column used by savePlatformPage)
  try {
    const pages = await supabaseGet(
      "platform_pages?is_visible=eq.true&select=slug,updated_at&order=sort_order.asc",
      supabaseUrl.replace(/\/$/, ""),
      supabaseKey
    );
    if (Array.isArray(pages)) {
      for (const row of pages) {
        if (!row || !row.slug) continue;
        entries.push(
          urlEntry(`${base}/student/page/${encodeURIComponent(row.slug)}`, toLastmod(row.updated_at))
        );
      }
    }
  } catch (_) {
    // CMS optional — ignore if table/RLS/column unavailable
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join("\n") +
    `\n</urlset>\n`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.end(xml);
};
