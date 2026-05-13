-- ==========================================
-- CV Tracker - Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ==========================================

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  preferred_language text default 'pl' check (preferred_language in ('pl', 'en')),
  created_at timestamptz default now()
);

-- Applications table
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  company_name text not null,
  position text not null,
  status text not null default 'applied',
  job_link text,
  screenshot_path text,
  salary_range text,
  location text,
  notes text,
  applied_at date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Status constraint
alter table applications add constraint valid_status
  check (status in (
    'applied',
    'phone_screen',
    'interview',
    'technical',
    'offer',
    'rejected',
    'withdrawn'
  ));

-- Index for faster queries per user
create index idx_applications_user_id on applications(user_id);
create index idx_applications_status on applications(status);
create index idx_applications_updated_at on applications(updated_at desc);

-- ==========================================
-- Row Level Security
-- ==========================================

alter table profiles enable row level security;
alter table applications enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Applications: full CRUD only for owner
create policy "Users can view own applications"
  on applications for select
  using (auth.uid() = user_id);

create policy "Users can create own applications"
  on applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on applications for update
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on applications for delete
  using (auth.uid() = user_id);

-- ==========================================
-- Storage
-- ==========================================

-- Create screenshots bucket (run via Supabase Dashboard > Storage or API)
-- insert into storage.buckets (id, name, public) values ('job-screenshots', 'job-screenshots', true);

-- Storage policy: users can only upload/read/delete their own files
create policy "Users can upload own screenshots"
  on storage.objects for insert
  with check (bucket_id = 'job-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view own screenshots"
  on storage.objects for select
  using (bucket_id = 'job-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own screenshots"
  on storage.objects for delete
  using (bucket_id = 'job-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

-- ==========================================
-- Auto-create profile on signup
-- ==========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- Auto-update updated_at timestamp
-- ==========================================

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_updated_at
  before update on applications
  for each row execute procedure public.update_updated_at();
