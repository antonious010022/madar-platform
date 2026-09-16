-- ============================================================================
-- MADAR — Data-driven curriculum, journey, templates, platform content
-- Run in Supabase SQL Editor after previous migrations.
-- ============================================================================

-- Curriculum taxonomy (stage → grade → term → subject)
create table if not exists public.curriculum_nodes (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('stage','grade','term','subject')),
  name        text not null,
  parent_id   uuid references public.curriculum_nodes(id) on delete cascade,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists curriculum_nodes_parent_idx on public.curriculum_nodes(parent_id);
create index if not exists curriculum_nodes_kind_idx on public.curriculum_nodes(kind);

alter table public.curriculum_nodes enable row level security;

drop policy if exists "public read active curriculum" on public.curriculum_nodes;
create policy "public read active curriculum"
  on public.curriculum_nodes for select
  using (is_active = true);

drop policy if exists "staff manage curriculum" on public.curriculum_nodes;
create policy "staff manage curriculum"
  on public.curriculum_nodes for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Completion message templates (editable)
create table if not exists public.completion_templates (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  label       text not null default '',
  title       text not null default '',
  body        text not null default '',
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.completion_templates enable row level security;

drop policy if exists "public read active templates" on public.completion_templates;
create policy "public read active templates"
  on public.completion_templates for select
  using (is_active = true);

drop policy if exists "staff manage templates" on public.completion_templates;
create policy "staff manage templates"
  on public.completion_templates for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Platform pages (About, Privacy, Terms, Contact, Security, …)
create table if not exists public.platform_pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null default '',
  body        text not null default '',
  is_visible  boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.platform_pages enable row level security;

drop policy if exists "public read visible pages" on public.platform_pages;
create policy "public read visible pages"
  on public.platform_pages for select
  using (is_visible = true);

drop policy if exists "staff manage pages" on public.platform_pages;
create policy "staff manage pages"
  on public.platform_pages for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Footer links (order, visibility, linked page slug or external URL)
create table if not exists public.platform_footer_links (
  id          uuid primary key default gen_random_uuid(),
  label       text not null default '',
  page_slug   text,
  external_url text,
  is_visible  boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.platform_footer_links enable row level security;

drop policy if exists "public read visible footer links" on public.platform_footer_links;
create policy "public read visible footer links"
  on public.platform_footer_links for select
  using (is_visible = true);

drop policy if exists "staff manage footer links" on public.platform_footer_links;
create policy "staff manage footer links"
  on public.platform_footer_links for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Platform contact / brand settings (single row style via key)
create table if not exists public.platform_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

drop policy if exists "public read settings" on public.platform_settings;
create policy "public read settings"
  on public.platform_settings for select
  using (true);

drop policy if exists "staff manage settings" on public.platform_settings;
create policy "staff manage settings"
  on public.platform_settings for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Lesson journey config (optional; null = default sequential scenes, no forced review)
alter table public.lessons
  add column if not exists journey_config jsonb not null default '{}'::jsonb;

alter table public.lessons
  add column if not exists sort_order int not null default 0;

-- ---------------------------------------------------------------------------
-- Seeds (safe: only insert if empty)
-- ---------------------------------------------------------------------------
insert into public.completion_templates (key, label, title, body, sort_order)
select * from (values
  ('none', 'بدون إشعار', '', '', 0),
  ('lesson_done', 'تم إكمال الدرس', '🎉 تم إكمال الدرس', 'أحسنت — أنهيت رحلة هذا الدرس على مَدَار.', 1),
  ('review_done', 'تم إكمال المراجعة', '🧠 تم إكمال المراجعة', 'أحسنت — أنهيت مراجعة هذا الجزء.', 2),
  ('quiz_done', 'تم إكمال الاختبار', '📝 تم إكمال الاختبار', 'انتهيت من الاختبار. راجع نتيجتك وتعلّم من أخطائك.', 3)
) as v(key, label, title, body, sort_order)
where not exists (select 1 from public.completion_templates limit 1);

insert into public.platform_pages (slug, title, body, sort_order)
select * from (values
  ('about', 'عن مَدَار', 'مَدَار منصة تعليمية تفاعلية تساعد الطالب على فهم المادة بأسلوب منظم ومرئي.', 1),
  ('privacy', 'سياسة الخصوصية', 'نوضح هنا كيف تتعامل مَدَار مع بياناتك. يمكنك تحديث هذا النص من لوحة التحكم.', 2),
  ('terms', 'الشروط والأحكام', 'باستخدامك مَدَار فإنك توافق على شروط الاستخدام الأساسية للمنصة التعليمية.', 3),
  ('contact', 'تواصل معنا', 'راسلنا عبر البريد الظاهر أدناه. نرحب بملاحظات الطلاب وأولياء الأمور.', 4),
  ('security', 'الحساب والأمان', 'تسجيل الدخول متاح عبر Google أو البريد من خلال نظام المصادقة المعتمد في المنصة. حافظ على بيانات دخولك لنفسك.', 5)
) as v(slug, title, body, sort_order)
where not exists (select 1 from public.platform_pages limit 1);

insert into public.platform_footer_links (label, page_slug, sort_order)
select * from (values
  ('عن مَدَار', 'about', 1),
  ('سياسة الخصوصية', 'privacy', 2),
  ('الشروط والأحكام', 'terms', 3),
  ('تواصل معنا', 'contact', 4),
  ('الحساب والأمان', 'security', 5)
) as v(label, page_slug, sort_order)
where not exists (select 1 from public.platform_footer_links limit 1);

insert into public.platform_settings (key, value)
values (
  'brand',
  '{"name":"مَدَار","description":"منصة تعليمية تفاعلية للدروس المنظمة.","contactEmail":"aantounyouss@gmail.com"}'::jsonb
)
on conflict (key) do nothing;

-- Default curriculum tree (only if empty) — editable later from dashboard
do $$
declare
  s_id uuid; g_id uuid; t_id uuid;
begin
  if exists (select 1 from public.curriculum_nodes limit 1) then
    return;
  end if;
  insert into public.curriculum_nodes (kind, name, parent_id, sort_order)
  values ('stage', 'الإعدادية', null, 1) returning id into s_id;
  insert into public.curriculum_nodes (kind, name, parent_id, sort_order)
  values ('grade', 'الثالث الإعدادي', s_id, 1) returning id into g_id;
  insert into public.curriculum_nodes (kind, name, parent_id, sort_order)
  values ('term', 'الترم الأول', g_id, 1) returning id into t_id;
  insert into public.curriculum_nodes (kind, name, parent_id, sort_order) values
    ('subject', 'التاريخ', t_id, 1),
    ('subject', 'الجغرافيا', t_id, 2);
end $$;
