-- ============================================================
-- Riverside Lawncare — one-time database setup
-- Paste this entire file into the Supabase SQL editor and run it.
-- Re-running is safe (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---- Enums --------------------------------------------------
do $$ begin
  create type plant_type as enum ('tree','bush','flower','grass','evergreen','perennial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sun_level as enum ('full','partial','shade');
exception when duplicate_object then null; end $$;

do $$ begin
  create type water_level as enum ('low','medium','high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type size_level as enum ('small','medium','large');
exception when duplicate_object then null; end $$;

do $$ begin
  create type growth_speed as enum ('slow','medium','fast');
exception when duplicate_object then null; end $$;

do $$ begin
  create type entity_status as enum ('active','disabled');
exception when duplicate_object then null; end $$;

-- ---- plants -------------------------------------------------
create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scientific_name text,
  plant_type plant_type not null,
  sun sun_level,
  water water_level,
  size size_level,
  mature_height_ft numeric,
  mature_width_ft numeric,
  growth_speed growth_speed,
  hardy_zone_min int,
  hardy_zone_max int,
  deer_resistant boolean not null default false,
  native boolean not null default false,
  flowering boolean not null default false,
  low_maintenance boolean not null default false,
  price_range text,
  notes text,
  image_path text,
  status entity_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plants_status_idx on public.plants(status);
create index if not exists plants_type_idx on public.plants(plant_type);

-- ---- pavers (skeleton for v2) -------------------------------
create table if not exists public.pavers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  manufacturer text,
  style text,
  color text,
  dimensions text,
  price_tier text,
  notes text,
  image_path text,
  status entity_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- gallery (skeleton for v2) ------------------------------
create table if not exists public.gallery_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_path text,
  status entity_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_job_plants (
  job_id uuid not null references public.gallery_jobs(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  primary key (job_id, plant_id)
);

-- ---- projects (saved customer selection lists) --------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_address text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete restrict,
  quantity int not null default 1 check (quantity > 0),
  note text
);

create index if not exists project_items_project_idx on public.project_items(project_id);

-- ---- updated_at trigger -------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists plants_updated_at on public.plants;
create trigger plants_updated_at before update on public.plants
  for each row execute function public.set_updated_at();

drop trigger if exists pavers_updated_at on public.pavers;
create trigger pavers_updated_at before update on public.pavers
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.plants enable row level security;
alter table public.pavers enable row level security;
alter table public.gallery_jobs enable row level security;
alter table public.gallery_job_plants enable row level security;
alter table public.projects enable row level security;
alter table public.project_items enable row level security;

-- plants: anon + authed can read active; authed can do anything
drop policy if exists "plants_read_public" on public.plants;
create policy "plants_read_public" on public.plants
  for select using (status = 'active' or auth.role() = 'authenticated');

drop policy if exists "plants_write_authed" on public.plants;
create policy "plants_write_authed" on public.plants
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- pavers: same shape
drop policy if exists "pavers_read_public" on public.pavers;
create policy "pavers_read_public" on public.pavers
  for select using (status = 'active' or auth.role() = 'authenticated');

drop policy if exists "pavers_write_authed" on public.pavers;
create policy "pavers_write_authed" on public.pavers
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- gallery: same shape
drop policy if exists "gallery_read_public" on public.gallery_jobs;
create policy "gallery_read_public" on public.gallery_jobs
  for select using (status = 'active' or auth.role() = 'authenticated');

drop policy if exists "gallery_write_authed" on public.gallery_jobs;
create policy "gallery_write_authed" on public.gallery_jobs
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "gallery_plants_read_public" on public.gallery_job_plants;
create policy "gallery_plants_read_public" on public.gallery_job_plants
  for select using (true);

drop policy if exists "gallery_plants_write_authed" on public.gallery_job_plants;
create policy "gallery_plants_write_authed" on public.gallery_job_plants
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- projects: employees only
drop policy if exists "projects_all_authed" on public.projects;
create policy "projects_all_authed" on public.projects
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "project_items_all_authed" on public.project_items;
create policy "project_items_all_authed" on public.project_items
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Storage bucket for plant + paver images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('plant-images', 'plant-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "plant_images_read" on storage.objects;
create policy "plant_images_read" on storage.objects
  for select using (bucket_id = 'plant-images');

drop policy if exists "plant_images_write_authed" on storage.objects;
create policy "plant_images_write_authed" on storage.objects
  for insert with check (bucket_id = 'plant-images' and auth.role() = 'authenticated');

drop policy if exists "plant_images_update_authed" on storage.objects;
create policy "plant_images_update_authed" on storage.objects
  for update using (bucket_id = 'plant-images' and auth.role() = 'authenticated');

drop policy if exists "plant_images_delete_authed" on storage.objects;
create policy "plant_images_delete_authed" on storage.objects
  for delete using (bucket_id = 'plant-images' and auth.role() = 'authenticated');
