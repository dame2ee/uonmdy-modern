-- =============================================================================
--  0001_init.sql — schema, Row Level Security and triggers
--
--  Security model:
--    * anon          → may read published content only, and post contact forms.
--    * authenticated → same as anon, plus staff (admin/editor) get full writes.
--    * admin         → additionally manages user roles and reads the audit log.
--    * service_role  → bypasses RLS; used only by server code and seed scripts.
--
--  Run this once in the Supabase SQL Editor (or `supabase db push`).
--  It is idempotent, so re-running it is safe.
-- =============================================================================

-- ----------------------------------------------------------------------------
--  Types
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'editor');
  end if;
end $$;

-- ----------------------------------------------------------------------------
--  Tables
-- ----------------------------------------------------------------------------

-- Staff accounts. Mirrors auth.users, which owns the credentials.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  role       public.app_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.slides (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  subtitle   text,
  image_url  text not null,
  href       text,
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text,
  category     text,
  sort_order   integer not null default 0,
  published    boolean not null default true,
  published_at timestamptz default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  body         text,
  image_url    text,
  published    boolean not null default true,
  published_at timestamptz default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  image_url  text not null,
  category   text,
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.rectors (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  period     text,
  image_url  text,
  bio        text,
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.campus_stats (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  value      integer not null default 0,
  icon       text,
  sort_order integer not null default 0
);

-- Editable body content for the university/faculty/study/department pages.
create table if not exists public.pages (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  section    text,
  body       text not null default '',
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

-- Append-only trail of every staff mutation. No update/delete policies exist,
-- so rows cannot be altered or removed through the API.
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  actor_email text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  detail      jsonb,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  Indexes
-- ----------------------------------------------------------------------------
create index if not exists profiles_role_idx        on public.profiles (role);
create index if not exists slides_pub_order_idx      on public.slides (published, sort_order);
create index if not exists announcements_pub_idx     on public.announcements (published, sort_order);
create index if not exists news_published_idx        on public.news (published, published_at desc);
create index if not exists gallery_pub_order_idx     on public.gallery_images (published, sort_order);
create index if not exists rectors_pub_order_idx     on public.rectors (published, sort_order);
create index if not exists campus_stats_order_idx    on public.campus_stats (sort_order);
create index if not exists pages_slug_idx            on public.pages (slug);
create index if not exists contact_created_idx       on public.contact_messages (created_at desc);
create index if not exists audit_created_idx         on public.audit_log (created_at desc);

-- ----------------------------------------------------------------------------
--  Helper functions
--
--  These are SECURITY DEFINER on purpose: the policies below call them while
--  reading public.profiles, and a plain function would re-trigger the profiles
--  policies and recurse. `set search_path` prevents search-path hijacking.
-- ----------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Every new auth user gets a profile row. New accounts default to 'editor';
-- promoting to 'admin' is a deliberate action by an existing admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at honest on every table that has one.
do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'slides', 'announcements', 'news', 'pages']
  loop
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format(
      'create trigger touch_updated_at before update on public.%I
         for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
--  Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.slides           enable row level security;
alter table public.announcements    enable row level security;
alter table public.news             enable row level security;
alter table public.gallery_images   enable row level security;
alter table public.rectors          enable row level security;
alter table public.campus_stats     enable row level security;
alter table public.pages            enable row level security;
alter table public.contact_messages enable row level security;
alter table public.audit_log        enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- slides ---------------------------------------------------------------------
drop policy if exists slides_read_published on public.slides;
create policy slides_read_published on public.slides
  for select to anon, authenticated
  using (published);

drop policy if exists slides_staff_all on public.slides;
create policy slides_staff_all on public.slides
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- announcements --------------------------------------------------------------
drop policy if exists announcements_read_published on public.announcements;
create policy announcements_read_published on public.announcements
  for select to anon, authenticated
  using (published);

drop policy if exists announcements_staff_all on public.announcements;
create policy announcements_staff_all on public.announcements
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- news -----------------------------------------------------------------------
drop policy if exists news_read_published on public.news;
create policy news_read_published on public.news
  for select to anon, authenticated
  using (published);

drop policy if exists news_staff_all on public.news;
create policy news_staff_all on public.news
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- gallery_images -------------------------------------------------------------
drop policy if exists gallery_read_published on public.gallery_images;
create policy gallery_read_published on public.gallery_images
  for select to anon, authenticated
  using (published);

drop policy if exists gallery_staff_all on public.gallery_images;
create policy gallery_staff_all on public.gallery_images
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- rectors --------------------------------------------------------------------
drop policy if exists rectors_read_published on public.rectors;
create policy rectors_read_published on public.rectors
  for select to anon, authenticated
  using (published);

drop policy if exists rectors_staff_all on public.rectors;
create policy rectors_staff_all on public.rectors
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- campus_stats ---------------------------------------------------------------
drop policy if exists campus_stats_read_all on public.campus_stats;
create policy campus_stats_read_all on public.campus_stats
  for select to anon, authenticated
  using (true);

drop policy if exists campus_stats_staff_all on public.campus_stats;
create policy campus_stats_staff_all on public.campus_stats
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- pages ----------------------------------------------------------------------
drop policy if exists pages_read_published on public.pages;
create policy pages_read_published on public.pages
  for select to anon, authenticated
  using (published);

drop policy if exists pages_staff_all on public.pages;
create policy pages_staff_all on public.pages
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- contact_messages -----------------------------------------------------------
-- Anyone may submit the public form; only staff may read or triage submissions.
-- Spam is handled in the app layer with a honeypot and per-IP rate limiting.
drop policy if exists contact_insert_public on public.contact_messages;
create policy contact_insert_public on public.contact_messages
  for insert to anon, authenticated
  with check (true);

drop policy if exists contact_staff_read on public.contact_messages;
create policy contact_staff_read on public.contact_messages
  for select to authenticated
  using (public.is_staff());

drop policy if exists contact_staff_update on public.contact_messages;
create policy contact_staff_update on public.contact_messages
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists contact_staff_delete on public.contact_messages;
create policy contact_staff_delete on public.contact_messages
  for delete to authenticated
  using (public.is_staff());

-- audit_log ------------------------------------------------------------------
drop policy if exists audit_staff_insert on public.audit_log;
create policy audit_staff_insert on public.audit_log
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log
  for select to authenticated
  using (public.is_admin());
