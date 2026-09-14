-- Optional: scene-level members-only access. Safe / idempotent.
alter table public.scenes
  add column if not exists is_members_only boolean not null default false;
