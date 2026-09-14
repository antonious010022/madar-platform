-- ============================================================================
-- Optional migration: YouTube video URL on lessons
-- Safe to run multiple times. Does not break existing published lessons.
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

alter table public.lessons
  add column if not exists youtube_url text not null default '';
