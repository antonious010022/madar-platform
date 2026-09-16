-- ============================================================================
-- MADAR Teacher Studio — Security Lockdown
-- Run once in: Supabase Dashboard → SQL Editor → Run
-- ============================================================================
-- After running: promote your teacher account(s) manually, e.g.:
--
--   insert into public.profiles (id, role)
--   values ('YOUR-USER-UUID', 'teacher')
--   on conflict (id) do update set role = excluded.role;
--
-- Find UUID: Authentication → Users in Supabase Dashboard.
-- ============================================================================

-- 1) Profiles / roles (source of truth — not client-editable)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'student'
               check (role in ('student', 'teacher', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
  on public.profiles for select
  using (auth.uid() = id);

-- No INSERT / UPDATE / DELETE policies for authenticated clients.
-- Roles are assigned only from Supabase SQL Editor (or service role).

-- Auto-create student profile on signup
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Backfill existing auth users as students (does not overwrite existing roles)
insert into public.profiles (id, role)
select id, 'student' from auth.users
on conflict (id) do nothing;

-- 2) Helper: is current user teacher or admin?
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('teacher', 'admin')
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated, anon;

-- 3) Tighten LESSONS write policies — staff only + own rows
drop policy if exists "owner insert lessons" on public.lessons;
create policy "staff insert own lessons"
  on public.lessons for insert
  to authenticated
  with check (auth.uid() = owner_id and public.is_staff());

drop policy if exists "owner update own lessons" on public.lessons;
create policy "staff update own lessons"
  on public.lessons for update
  to authenticated
  using (auth.uid() = owner_id and public.is_staff())
  with check (auth.uid() = owner_id and public.is_staff());

drop policy if exists "owner delete own lessons" on public.lessons;
create policy "staff delete own lessons"
  on public.lessons for delete
  to authenticated
  using (auth.uid() = owner_id and public.is_staff());

-- Keep owner read for staff drafts; published still public
drop policy if exists "owner read own lessons" on public.lessons;
create policy "staff read own lessons"
  on public.lessons for select
  to authenticated
  using (auth.uid() = owner_id and public.is_staff());

-- 4) Tighten SCENES write policies
drop policy if exists "owner write own scenes" on public.scenes;
create policy "staff write own scenes"
  on public.scenes for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.lessons l
      where l.id = scenes.lesson_id and l.owner_id = auth.uid()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.lessons l
      where l.id = scenes.lesson_id and l.owner_id = auth.uid()
    )
  );

drop policy if exists "owner read own scenes" on public.scenes;
create policy "staff read own scenes"
  on public.scenes for select
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.lessons l
      where l.id = scenes.lesson_id and l.owner_id = auth.uid()
    )
  );

-- 5) Storage: only staff may upload lesson images (path prefix lesson-images)
-- Keep public read if it already exists; replace write policy if present
drop policy if exists "authenticated upload lesson images" on storage.objects;
drop policy if exists "owner upload lesson images" on storage.objects;
drop policy if exists "staff upload lesson images" on storage.objects;

create policy "staff upload lesson images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'lesson-images'
    and public.is_staff()
  );

drop policy if exists "staff update lesson images" on storage.objects;
create policy "staff update lesson images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'lesson-images' and public.is_staff())
  with check (bucket_id = 'lesson-images' and public.is_staff());

drop policy if exists "staff delete lesson images" on storage.objects;
create policy "staff delete lesson images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'lesson-images' and public.is_staff());
