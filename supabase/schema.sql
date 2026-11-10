-- ============================================================================
-- Teacher Studio MVP — Supabase schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- LESSONS  (lesson-level metadata)
-- ---------------------------------------------------------------------------
create table if not exists public.lessons (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  title         text not null default '',
  subject       text not null default '',
  stage         text not null default '',
  grade         text not null default '',
  term          text not null default '',
  description   text not null default '',
  status        text not null default 'Draft' check (status in ('Draft','ReadyToRecord','Published')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SCENES  (one row per scene; the rich sub-structures — hotwords, mindmap,
-- timeline, questions, quick-recall — are stored as JSONB. This keeps the
-- MVP simple while still being real, queryable, Supabase-backed data. Every
-- scene belongs to exactly one lesson and is deleted with it.)
-- ---------------------------------------------------------------------------
create table if not exists public.scenes (
  id                 uuid primary key default gen_random_uuid(),
  lesson_id          uuid not null references public.lessons(id) on delete cascade,
  order_index        int not null default 0,
  title              text not null default '',
  text               text not null default '',
  presenter_notes    text not null default '',
  quick_recall_show  boolean not null default true,
  quick_recall       jsonb not null default '[]'::jsonb,
  hotwords           jsonb not null default '[]'::jsonb,
  mindmap            jsonb not null default '{}'::jsonb,
  timeline           jsonb not null default '[]'::jsonb,
  questions          jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists scenes_lesson_id_idx on public.scenes(lesson_id);
create index if not exists lessons_owner_id_idx on public.lessons(owner_id);
create index if not exists lessons_status_idx on public.lessons(status);

-- ---------------------------------------------------------------------------
-- Keep updated_at fresh automatically
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_lessons_updated_at on public.lessons;
create trigger trg_lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

drop trigger if exists trg_scenes_updated_at on public.scenes;
create trigger trg_scenes_updated_at
  before update on public.scenes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Students hit the site with the anon key and NO session — they may only
-- ever read lessons/scenes whose lesson.status = 'Published'.
-- Teachers (authenticated) may read/write only their own lessons/scenes,
-- regardless of status. This is enforced here, in the database — not by
-- hiding buttons in the UI.
-- ---------------------------------------------------------------------------
alter table public.lessons enable row level security;
alter table public.scenes  enable row level security;

-- Public (anon + authenticated) can read published lessons
drop policy if exists "public read published lessons" on public.lessons;
create policy "public read published lessons"
  on public.lessons for select
  using (status = 'Published');

-- Teachers can read their own lessons in any status
drop policy if exists "owner read own lessons" on public.lessons;
create policy "owner read own lessons"
  on public.lessons for select
  using (auth.uid() = owner_id);

-- Teachers can insert lessons they own
drop policy if exists "owner insert lessons" on public.lessons;
create policy "owner insert lessons"
  on public.lessons for insert
  with check (auth.uid() = owner_id);

-- Teachers can update/delete only their own lessons
drop policy if exists "owner update own lessons" on public.lessons;
create policy "owner update own lessons"
  on public.lessons for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "owner delete own lessons" on public.lessons;
create policy "owner delete own lessons"
  on public.lessons for delete
  using (auth.uid() = owner_id);

-- Scenes inherit visibility/ownership from their parent lesson
drop policy if exists "public read scenes of published lessons" on public.scenes;
create policy "public read scenes of published lessons"
  on public.scenes for select
  using (
    exists (
      select 1 from public.lessons l
      where l.id = scenes.lesson_id and l.status = 'Published'
    )
  );

drop policy if exists "owner read own scenes" on public.scenes;
create policy "owner read own scenes"
  on public.scenes for select
  using (
    exists (
      select 1 from public.lessons l
      where l.id = scenes.lesson_id and l.owner_id = auth.uid()
    )
  );

drop policy if exists "owner write own scenes" on public.scenes;
create policy "owner write own scenes"
  on public.scenes for all
  using (
    exists (
      select 1 from public.lessons l
      where l.id = scenes.lesson_id and l.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lessons l
      where l.id = scenes.lesson_id and l.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- STORAGE — bucket for scene / hotword / timeline images
-- Public read (so students/anon can view images).
-- WRITE (upload / update / delete) is STAFF ONLY and is defined in
-- supabase/migration_teacher_lockdown.sql (needs public.is_staff()).
-- Run that migration right after this file.
--
-- SECURITY NOTE: older versions of this file created "authenticated ..."
-- policies that let ANY signed-in user (including students) overwrite or
-- delete lesson images. They are dropped below so re-running this file can
-- never bring that hole back.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('lesson-images', 'lesson-images', true)
on conflict (id) do nothing;

drop policy if exists "public read lesson images" on storage.objects;
create policy "public read lesson images"
  on storage.objects for select
  using (bucket_id = 'lesson-images');

drop policy if exists "authenticated upload lesson images" on storage.objects;
drop policy if exists "authenticated update own lesson images" on storage.objects;
drop policy if exists "authenticated delete own lesson images" on storage.objects;

-- ============================================================================
-- Done. Next steps (ORDER MATTERS):
-- 1) Run supabase/migration_teacher_lockdown.sql  (roles, is_staff(), staff-only
--    write policies for lessons, scenes and lesson-images storage).
-- 2) Promote your teacher account (see the comment at the top of that file).
-- 3) Run the remaining migration_*.sql files.
-- 4) Dashboard → Authentication → Providers → make sure Email is on.
-- 5) Copy your Project URL + anon public key into .env.
-- ============================================================================