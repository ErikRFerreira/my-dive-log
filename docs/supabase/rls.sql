-- Supabase RLS policies for Dive Log
-- Generated from current policy intent; safe to re-run.
-- Notes:
--   - Drops existing policies listed here (if they exist), then recreates a consolidated set.
--   - Keeps dive_photos access strictly tied to ownership of the parent dive.
--   - Assumes tables: public.dives, public.dive_photos, public.locations, public.profiles
--   - Assumes columns:
--       dives.user_id (uuid)
--       dive_photos.user_id (uuid), dive_photos.dive_id (uuid)
--       locations.user_id (uuid)
--       profiles.id (uuid, matches auth.uid())

BEGIN;

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.dives       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dive_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Drop existing policies (to avoid PERMISSIVE "OR" surprises)
-- -----------------------------------------------------------------------------
-- dive_photos
DROP POLICY IF EXISTS "Users can insert their dive photos" ON public.dive_photos;
DROP POLICY IF EXISTS "Users can read their dive photos" ON public.dive_photos;
DROP POLICY IF EXISTS "dive_photos_delete_own" ON public.dive_photos;
DROP POLICY IF EXISTS "dive_photos_insert_own_on_own_dive" ON public.dive_photos;
DROP POLICY IF EXISTS "dive_photos_select_own" ON public.dive_photos;
DROP POLICY IF EXISTS "dive_photos_update_own" ON public.dive_photos;

-- dives
DROP POLICY IF EXISTS "Users can update own dives" ON public.dives;
DROP POLICY IF EXISTS "delete own dives" ON public.dives;
DROP POLICY IF EXISTS "insert own dives" ON public.dives;
DROP POLICY IF EXISTS "read own dives" ON public.dives;
DROP POLICY IF EXISTS "update own dives" ON public.dives;

-- locations
DROP POLICY IF EXISTS "delete own locations" ON public.locations;
DROP POLICY IF EXISTS "insert own locations" ON public.locations;
DROP POLICY IF EXISTS "select own locations" ON public.locations;
DROP POLICY IF EXISTS "update own locations" ON public.locations;

-- profiles
DROP POLICY IF EXISTS "insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "read own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;

-- -----------------------------------------------------------------------------
-- dives (owner-scoped)
-- -----------------------------------------------------------------------------
CREATE POLICY "dives_select_own"
ON public.dives
AS PERMISSIVE
FOR SELECT
TO public
USING (auth.uid() = user_id);

CREATE POLICY "dives_insert_own"
ON public.dives
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (user_id = auth.uid());

CREATE POLICY "dives_update_own"
ON public.dives
AS PERMISSIVE
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dives_delete_own"
ON public.dives
AS PERMISSIVE
FOR DELETE
TO public
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- locations (owner-scoped)
-- -----------------------------------------------------------------------------
CREATE POLICY "locations_select_own"
ON public.locations
AS PERMISSIVE
FOR SELECT
TO public
USING (auth.uid() = user_id);

CREATE POLICY "locations_insert_own"
ON public.locations
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "locations_update_own"
ON public.locations
AS PERMISSIVE
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "locations_delete_own"
ON public.locations
AS PERMISSIVE
FOR DELETE
TO public
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- profiles (user can only access their own row)
-- -----------------------------------------------------------------------------
CREATE POLICY "profiles_select_own"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON public.profiles
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- dive_photos (strictly tied to ownership of the parent dive)
-- -----------------------------------------------------------------------------
-- Rationale:
-- 1) Avoid multiple permissive policies that "OR" together and accidentally widen access.
-- 2) Ensure the user can only read/write photos for dives they own.
-- 3) Keep user_id consistent (must equal auth.uid()) and also validate dive ownership via dive_id -> dives.

CREATE POLICY "dive_photos_select_own_dive"
ON public.dive_photos
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.dives d
    WHERE d.id = dive_photos.dive_id
      AND d.user_id = auth.uid()
  )
);

CREATE POLICY "dive_photos_insert_own_dive"
ON public.dive_photos
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  (dive_photos.user_id = auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.dives d
    WHERE d.id = dive_photos.dive_id
      AND d.user_id = auth.uid()
  )
);

CREATE POLICY "dive_photos_update_own_dive"
ON public.dive_photos
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.dives d
    WHERE d.id = dive_photos.dive_id
      AND d.user_id = auth.uid()
  )
)
WITH CHECK (
  (dive_photos.user_id = auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.dives d
    WHERE d.id = dive_photos.dive_id
      AND d.user_id = auth.uid()
  )
);

CREATE POLICY "dive_photos_delete_own_dive"
ON public.dive_photos
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.dives d
    WHERE d.id = dive_photos.dive_id
      AND d.user_id = auth.uid()
  )
);

COMMIT;
