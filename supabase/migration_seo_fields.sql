-- ============================================================================
-- MADAR — Per-lesson SEO fields
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe / idempotent. Does not delete, rename, or rewrite any existing data.
--
-- Columns match exactly what src/lib/db.js uses:
--   updateLessonMeta()  → seo_language, seo_title, seo_description, seo_slug
--   lessonRowToApp()    → row.seo_language / seo_title / seo_description / seo_slug
-- ============================================================================

-- 1) Columns (existing lessons get the defaults automatically; no table rewrite)
alter table public.lessons
  add column if not exists seo_language    text not null default 'ar',
  add column if not exists seo_title       text not null default '',
  add column if not exists seo_description text not null default '',
  add column if not exists seo_slug        text not null default '';

-- 2) Slug must be unique among PUBLISHED lessons only.
--    - Drafts may share/reuse a slug while being edited.
--    - Empty slug ('') is excluded (means "derive from title" in the app).
--    - Existing lessons all have '' right now, so this cannot conflict with old data.
--    NOTE: the index name intentionally contains "seo_slug" — db.js
--    (updateLessonMeta) matches on it to turn error 23505 into the friendly
--    "هذا الرابط (Slug) مستخدم بالفعل..." message.
create unique index if not exists lessons_published_seo_slug_uniq
  on public.lessons (seo_slug)
  where status = 'Published' and seo_slug <> '';

-- 3) Make PostgREST (Supabase REST API) pick up the new columns immediately
notify pgrst, 'reload schema';

-- RLS: intentionally NOT changed. Existing lessons policies are row-level
-- (owner/staff write, public read of Published), so they already cover the
-- new columns.
