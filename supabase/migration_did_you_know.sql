-- ============================================================================
-- Madar — "هل تعلم؟" (Did you know?). Run once in Supabase → SQL Editor.
-- Safe to re-run.
--   did_you_know_facts : written by staff (teacher/admin) only. Each fact can target
--                        a stage and/or a grade (NULL = everyone / all of that stage).
--   student_seen_facts : which facts each student has already been shown, so the
--                        rotation is random but never repeats until all were seen.
-- Uses the existing public.is_staff() function (same one db.js calls via rpc).
-- ============================================================================
create table if not exists public.did_you_know_facts (
  id          uuid primary key default gen_random_uuid(),
  body        text not null check (char_length(btrim(body)) between 1 and 600),
  stage       text,                       -- NULL = all stages
  grade       text,                       -- NULL = all grades (of the chosen stage)
  is_active   boolean not null default true,
  created_by  uuid references auth.users(id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists did_you_know_facts_active_idx
  on public.did_you_know_facts (is_active, created_at);

create table if not exists public.student_seen_facts (
  user_id  uuid not null references auth.users(id) on delete cascade,
  fact_id  uuid not null references public.did_you_know_facts(id) on delete cascade,
  seen_at  timestamptz not null default now(),
  primary key (user_id, fact_id)
);

alter table public.did_you_know_facts enable row level security;
alter table public.student_seen_facts enable row level security;

-- facts: any signed-in user reads ACTIVE facts (staff also see inactive); only staff write
drop policy if exists "dyk_select" on public.did_you_know_facts;
create policy "dyk_select" on public.did_you_know_facts
  for select to authenticated
  using (is_active = true or public.is_staff());

drop policy if exists "dyk_insert_staff" on public.did_you_know_facts;
create policy "dyk_insert_staff" on public.did_you_know_facts
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists "dyk_update_staff" on public.did_you_know_facts;
create policy "dyk_update_staff" on public.did_you_know_facts
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "dyk_delete_staff" on public.did_you_know_facts;
create policy "dyk_delete_staff" on public.did_you_know_facts
  for delete to authenticated
  using (public.is_staff());

-- seen: each student only touches their own rows
drop policy if exists "seen_select_own" on public.student_seen_facts;
create policy "seen_select_own" on public.student_seen_facts
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "seen_insert_own" on public.student_seen_facts;
create policy "seen_insert_own" on public.student_seen_facts
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "seen_delete_own" on public.student_seen_facts;
create policy "seen_delete_own" on public.student_seen_facts
  for delete to authenticated using (auth.uid() = user_id);

-- guests (anon) get nothing
revoke all on table public.did_you_know_facts from anon;
revoke all on table public.did_you_know_facts from public;
revoke all on table public.student_seen_facts from anon;
revoke all on table public.student_seen_facts from public;
grant select, insert, update, delete on table public.did_you_know_facts to authenticated;
grant select, insert, delete on table public.student_seen_facts to authenticated;
