-- Remove stale locations that have no dives referencing them.
-- Safe default: only delete rows older than 7 days.
-- Run manually in Supabase SQL Editor or via a scheduled database job.

delete from public.locations l
where l.created_at < now() - interval '7 days'
  and not exists (
    select 1
    from public.dives d
    where d.location_id = l.id
  );

-- Optional guard: preserve favorited locations.
-- Uncomment this condition in the query above if needed.
-- and coalesce(l.is_favorite, false) = false;
