-- Fix "هل تعلم؟" read access. Safe to re-run in Supabase SQL Editor.

-- 1) Ensure tables exist (no-op if already created)
create table if not exists public.did_you_know_facts (
  id          uuid primary key default gen_random_uuid(),
  body        text not null check (char_length(btrim(body)) between 1 and 600),
  stage       text,
  grade       text,
  is_active   boolean not null default true,
  created_by  uuid references auth.users(id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.student_seen_facts (
  user_id  uuid not null references auth.users(id) on delete cascade,
  fact_id  uuid not null references public.did_you_know_facts(id) on delete cascade,
  seen_at  timestamptz not null default now(),
  primary key (user_id, fact_id)
);

alter table public.did_you_know_facts enable row level security;
alter table public.student_seen_facts enable row level security;

-- 2) Drop old policies and recreate simple ones
drop policy if exists "dyk_select" on public.did_you_know_facts;
drop policy if exists "dyk_select_authenticated" on public.did_you_know_facts;
drop policy if exists "dyk_select_anon" on public.did_you_know_facts;
drop policy if exists "dyk_select_active" on public.did_you_know_facts;
drop policy if exists "dyk_select_staff_all" on public.did_you_know_facts;

-- Anyone (guest + logged-in) can read ACTIVE facts only
create policy "dyk_select_active" on public.did_you_know_facts
  for select
  to anon, authenticated
  using (is_active = true);

-- Staff can read all rows (including inactive) if is_staff() exists
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_staff'
  ) then
    execute $p$
      create policy "dyk_select_staff_all" on public.did_you_know_facts
        for select to authenticated
        using (public.is_staff())
    $p$;
  end if;
end$$;

drop policy if exists "dyk_insert_staff" on public.did_you_know_facts;
drop policy if exists "dyk_update_staff" on public.did_you_know_facts;
drop policy if exists "dyk_delete_staff" on public.did_you_know_facts;

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_staff'
  ) then
    execute $p$
      create policy "dyk_insert_staff" on public.did_you_know_facts
        for insert to authenticated with check (public.is_staff())
    $p$;
    execute $p$
      create policy "dyk_update_staff" on public.did_you_know_facts
        for update to authenticated using (public.is_staff()) with check (public.is_staff())
    $p$;
    execute $p$
      create policy "dyk_delete_staff" on public.did_you_know_facts
        for delete to authenticated using (public.is_staff())
    $p$;
  end if;
end$$;

-- Seen rows: own rows only
drop policy if exists "seen_select_own" on public.student_seen_facts;
drop policy if exists "seen_insert_own" on public.student_seen_facts;
drop policy if exists "seen_update_own" on public.student_seen_facts;
drop policy if exists "seen_delete_own" on public.student_seen_facts;

create policy "seen_select_own" on public.student_seen_facts
  for select to authenticated using (auth.uid() = user_id);
create policy "seen_insert_own" on public.student_seen_facts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "seen_update_own" on public.student_seen_facts
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "seen_delete_own" on public.student_seen_facts
  for delete to authenticated using (auth.uid() = user_id);

grant select on table public.did_you_know_facts to anon;
grant select, insert, update, delete on table public.did_you_know_facts to authenticated;
grant select, insert, update, delete on table public.student_seen_facts to authenticated;

-- 3) Optional seed if table is empty (safe: only inserts when zero rows)
insert into public.did_you_know_facts (body, stage, grade, is_active)
select 'نهر النيل هو أطول أنهار العالم، ويمتد عبر عدة دول أفريقية قبل أن يصب في البحر المتوسط.', null, null, true
where not exists (select 1 from public.did_you_know_facts limit 1);
