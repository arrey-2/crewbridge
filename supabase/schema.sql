-- CrewBridge Supabase schema for project ref: ntckfbbhknxoztmzmhjk

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  trade text,
  role text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  job_name text not null,
  sender_role text not null,
  original_text text not null,
  translated_text text not null,
  source_language text not null,
  target_language text not null,
  trade text not null,
  safety_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  translation_count integer not null default 0,
  unique (user_id, date)
);

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.translations enable row level security;
alter table public.usage enable row level security;

create policy "profiles own select" on public.profiles for select using (auth.uid() = id);
create policy "profiles own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "jobs own select" on public.jobs for select using (auth.uid() = user_id);
create policy "jobs own insert" on public.jobs for insert with check (auth.uid() = user_id);
create policy "jobs own update" on public.jobs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "translations own select" on public.translations for select using (auth.uid() = user_id);
create policy "translations own insert" on public.translations for insert with check (auth.uid() = user_id);
create policy "translations own update" on public.translations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "usage own select" on public.usage for select using (auth.uid() = user_id);
create policy "usage own insert" on public.usage for insert with check (auth.uid() = user_id);
create policy "usage own update" on public.usage for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
