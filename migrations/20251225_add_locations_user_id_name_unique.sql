-- Required for Supabase `.upsert(..., { onConflict: 'user_id,name' })` to work.
-- If this fails due to duplicates, first inspect them with:
--   select user_id, name, count(*) from public.locations group by 1,2 having count(*) > 1;
create unique index if not exists locations_user_id_name_uidx
  on public.locations (user_id, name);
