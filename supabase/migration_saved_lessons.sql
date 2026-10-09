-- ============================================================================
-- Madar — saved lessons ("حفظ الدرس"). Run once in Supabase → SQL Editor.
-- Safe to re-run. Each student can only read / add / remove their own rows.
-- ============================================================================
create table if not exists public.student_saved_lessons (
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists student_saved_lessons_user_idx
  on public.student_saved_lessons (user_id, created_at desc);

alter table public.student_saved_lessons enable row level security;

drop policy if exists "saved_lessons_select_own" on public.student_saved_lessons;
create policy "saved_lessons_select_own"
  on public.student_saved_lessons for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "saved_lessons_insert_own" on public.student_saved_lessons;
create policy "saved_lessons_insert_own"
  on public.student_saved_lessons for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "saved_lessons_delete_own" on public.student_saved_lessons;
create policy "saved_lessons_delete_own"
  on public.student_saved_lessons for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.student_saved_lessons from anon;
revoke all on table public.student_saved_lessons from public;
grant select, insert, delete on table public.student_saved_lessons to authenticated;
