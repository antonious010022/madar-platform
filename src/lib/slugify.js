/**
 * Shared slug helper — turns a lesson title into a URL-friendly, SEO-only slug.
 *
 * IMPORTANT: the slug is purely cosmetic (used for readable / SEO-friendly
 * lesson URLs like /lessons/:id/:slug). It is never persisted to Supabase and
 * is never used to look up a lesson — lesson.id remains the single source of
 * truth for identity/lookup. This function must stay identical everywhere it
 * is used (StudentLessonPage, StudentPlatform, api/sitemap.js) so the same
 * title always produces the same slug.
 *
 * Supports: Arabic letters, English letters, digits, spaces (→ "-"),
 * strips other punctuation, collapses repeated "-", trims leading/trailing "-".
 */
export function slugify(text) {
  if (!text || typeof text !== "string") return "";

  let s = text.trim();

  // Strip Arabic diacritics (tashkeel) and the tatweel/kashida character.
  s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, "");

  // Lowercase (only affects Latin letters; harmless for Arabic).
  s = s.toLowerCase();

  // Keep Arabic letters, Latin letters, digits, whitespace and existing dashes.
  // Everything else (punctuation, symbols, etc.) becomes a space.
  s = s.replace(/[^\u0600-\u06FF\u0750-\u077Fa-z0-9\s-]/g, " ");

  // Collapse whitespace/underscores into a single dash.
  s = s.replace(/[\s_]+/g, "-");

  // Collapse repeated dashes into one.
  s = s.replace(/-+/g, "-");

  // Trim leading/trailing dashes.
  s = s.replace(/^-+|-+$/g, "");

  return s;
}

export default slugify;
