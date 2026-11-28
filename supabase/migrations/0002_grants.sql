-- Signed-in listeners may use the playlists table (row-level security still limits them to their
-- own rows). New Supabase projects don't grant table access by default, so it is explicit here.
-- Anonymous visitors get nothing.
-- Run once after 0001: SQL Editor → paste → Run.

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.playlists to authenticated;
revoke all on public.playlists from anon;
