-- ============================================================================
-- Scene types + safe columns for Teacher Studio
-- Run once in: Supabase Dashboard → SQL Editor → Run
-- Safe / idempotent. Does not delete or alter existing data.
-- ============================================================================

-- Lesson-level YouTube (if not already applied)
alter table public.lessons
  add column if not exists youtube_url text not null default '';

-- Optional title font used by the studio (was sent by the app but missing from original schema)
alter table public.scenes
  add column if not exists title_font text;

-- Scene type: EXPLANATION | QUICK_RECALL | MIND_MAP | TIMELINE | QUESTIONS
-- Existing rows get EXPLANATION so published lessons keep working.
alter table public.scenes
  add column if not exists scene_type text not null default 'EXPLANATION';

-- Soft check constraint (not enforced strictly to avoid breaking odd legacy values)
-- Values written by the app: EXPLANATION, QUICK_RECALL, MIND_MAP, TIMELINE, QUESTIONS
