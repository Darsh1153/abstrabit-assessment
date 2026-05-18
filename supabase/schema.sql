-- Smart Bookmarks — Database schema
-- Run this in the Supabase SQL Editor for your project.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.

-- 1. Table -----------------------------------------------------------------
create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  url         text not null check (char_length(url) between 1 and 2048),
  title       text not null check (char_length(title) between 1 and 200),
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists bookmarks_user_created_idx
  on public.bookmarks (user_id, created_at desc);

create index if not exists bookmarks_tags_gin_idx
  on public.bookmarks using gin (tags);

-- 2. Row Level Security ----------------------------------------------------
alter table public.bookmarks enable row level security;

drop policy if exists "select own bookmarks" on public.bookmarks;
create policy "select own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "insert own bookmarks" on public.bookmarks;
create policy "insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "delete own bookmarks" on public.bookmarks;
create policy "delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- 3. Realtime publication --------------------------------------------------
-- Add the table to the realtime publication so postgres_changes events fire.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bookmarks'
  ) then
    execute 'alter publication supabase_realtime add table public.bookmarks';
  end if;
end $$;
