-- ============================================================================
-- MADAR — Student progress (per account, stored in Supabase)
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (idempotent). Requires: public.lessons, public.set_updated_at()
-- (both created by schema.sql).
-- ============================================================================

-- 1) Table: one row per (student, lesson)
create table if not exists public.student_lesson_progress (
  user_id                uuid not null references auth.users(id) on delete cascade,
  lesson_id              uuid not null references public.lessons(id) on delete cascade,
  current_scene          int  not null default 0 check (current_scene >= 0),
  completed_scenes       jsonb not null default '[]'::jsonb,
  final_review_completed boolean not null default false,
  lesson_completed       boolean not null default false,
  completed_at           timestamptz,
  -- everything else the lesson page tracks (view, unlockedScenes, finalReviewUnlocked, ...)
  state                  jsonb not null default '{}'::jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists student_lesson_progress_user_updated_idx
  on public.student_lesson_progress (user_id, updated_at desc);

-- 2) Triggers: keep updated_at fresh; completion is sticky and timestamped by the DB
drop trigger if exists trg_student_lesson_progress_updated_at on public.student_lesson_progress;
create trigger trg_student_lesson_progress_updated_at
  before update on public.student_lesson_progress
  for each row execute function public.set_updated_at();

create or replace function public.student_progress_completion_guard()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    -- a completed lesson never goes back to "not completed"
    new.lesson_completed := old.lesson_completed or new.lesson_completed;
    new.final_review_completed := old.final_review_completed or new.final_review_completed;
    new.completed_at := old.completed_at;
  end if;
  if new.lesson_completed and new.completed_at is null then
    new.completed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_student_progress_completion_guard on public.student_lesson_progress;
create trigger trg_student_progress_completion_guard
  before insert or update on public.student_lesson_progress
  for each row execute function public.student_progress_completion_guard();

-- 3) Row Level Security: a student sees and writes ONLY their own rows.
--    Guests (no session) get nothing. No delete from the client.
alter table public.student_lesson_progress enable row level security;

drop policy if exists "student read own progress" on public.student_lesson_progress;
create policy "student read own progress"
  on public.student_lesson_progress for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "student insert own progress" on public.student_lesson_progress;
create policy "student insert own progress"
  on public.student_lesson_progress for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.lessons l
      where l.id = student_lesson_progress.lesson_id and l.status = 'Published'
    )
  );

drop policy if exists "student update own progress" on public.student_lesson_progress;
create policy "student update own progress"
  on public.student_lesson_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.student_lesson_progress from anon;
revoke all on public.student_lesson_progress from authenticated;
grant select, insert, update on public.student_lesson_progress to authenticated;
