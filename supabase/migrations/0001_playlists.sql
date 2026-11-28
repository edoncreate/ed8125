-- ed8125.com listener playlists.
-- Run once in the Supabase project: SQL Editor → paste → Run.
-- Each signed-in listener (email link, no password) owns their playlists; nobody else can read them.

create table if not exists public.playlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  -- Catalog keys from /catalog.json, e.g. "lt:vol-2/canto", "beat:BaEaVqnvyX4" (YouTube id), "album:brasil-com-amor/3".
  tracks      text[] not null default '{}' check (cardinality(tracks) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists playlists_user_id_idx on public.playlists (user_id);

alter table public.playlists enable row level security;

drop policy if exists "own playlists: read" on public.playlists;
create policy "own playlists: read" on public.playlists
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own playlists: create" on public.playlists;
create policy "own playlists: create" on public.playlists
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "own playlists: change" on public.playlists;
create policy "own playlists: change" on public.playlists
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own playlists: delete" on public.playlists;
create policy "own playlists: delete" on public.playlists
  for delete to authenticated using ((select auth.uid()) = user_id);

-- No more than 50 playlists per listener.
create or replace function public.playlists_limit() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.playlists where user_id = new.user_id) >= 50 then
    raise exception 'playlist limit reached';
  end if;
  return new;
end $$;

drop trigger if exists playlists_limit on public.playlists;
create trigger playlists_limit before insert on public.playlists
  for each row execute function public.playlists_limit();

create or replace function public.playlists_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists playlists_touch on public.playlists;
create trigger playlists_touch before update on public.playlists
  for each row execute function public.playlists_touch();

-- "Delete my account": removes the signed-in user (their playlists go with it).
create or replace function public.delete_me() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
