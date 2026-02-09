# Supabase Row Level Security (RLS)

This project enforces authorization at the **database layer** using Supabase/Postgres **Row Level Security (RLS)**.

**Design goal:** every row of user-owned data is only accessible to its owner (`auth.uid()`), even if the client is compromised.

> This document is intentionally “MD friendly”: short explanations + copy/pastable SQL.
> The canonical executable version also lives in `rls.sql` (keep them aligned).

---

## Tables covered

- `public.dives`
- `public.dive_photos`
- `public.locations`
- `public.profiles`

All tables above should have RLS enabled:

```sql
ALTER TABLE public.dives       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dive_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
```

---

## Policy model (summary)

- **Dives / Locations:** owner-scoped by `user_id = auth.uid()`
- **Profiles:** owner-scoped by `profiles.id = auth.uid()`
- **Dive photos:** access is **strictly tied to the parent dive**
  - A user can only read/write photos if they own the referenced `dives` row.
  - This prevents “PERMISSIVE policy OR-ing” from accidentally widening access.

---

## `public.dives`

### SELECT — read own dives

```sql
CREATE POLICY "dives_select_own"
ON public.dives
FOR SELECT
TO public
USING (auth.uid() = user_id);
```

### INSERT — insert own dives

```sql
CREATE POLICY "dives_insert_own"
ON public.dives
FOR INSERT
TO public
WITH CHECK (user_id = auth.uid());
```

### UPDATE — update own dives

```sql
CREATE POLICY "dives_update_own"
ON public.dives
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### DELETE — delete own dives

```sql
CREATE POLICY "dives_delete_own"
ON public.dives
FOR DELETE
TO public
USING (auth.uid() = user_id);
```

---

## `public.locations`

### SELECT — read own locations

```sql
CREATE POLICY "locations_select_own"
ON public.locations
FOR SELECT
TO public
USING (auth.uid() = user_id);
```

### INSERT — insert own locations

```sql
CREATE POLICY "locations_insert_own"
ON public.locations
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);
```

### UPDATE — update own locations

```sql
CREATE POLICY "locations_update_own"
ON public.locations
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### DELETE — delete own locations

```sql
CREATE POLICY "locations_delete_own"
ON public.locations
FOR DELETE
TO public
USING (auth.uid() = user_id);
```

---

## `public.profiles`

### SELECT — read own profile

```sql
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### INSERT — create own profile

```sql
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);
```

### UPDATE — update own profile

```sql
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

## `public.dive_photos`

### Why these policies are “special”

Your earlier export showed multiple **PERMISSIVE** policies for the same command (e.g., multiple `SELECT` policies).
In Postgres, **PERMISSIVE policies combine with OR**, meaning *any* matching policy can grant access.

To avoid accidental widening, we use **one coherent policy per command** and tie all access to the parent dive’s ownership.

### SELECT — read photos for dives you own

```sql
CREATE POLICY "dive_photos_select_own_dive"
ON public.dive_photos
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
```

### INSERT — add photos only to your own dives

```sql
CREATE POLICY "dive_photos_insert_own_dive"
ON public.dive_photos
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
```

### UPDATE — update photos only for your own dives

```sql
CREATE POLICY "dive_photos_update_own_dive"
ON public.dive_photos
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
```

### DELETE — delete photos only for your own dives

```sql
CREATE POLICY "dive_photos_delete_own_dive"
ON public.dive_photos
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
```

---

## Quick verification queries

### List policies

```sql
select
  schemaname, tablename, policyname, roles, cmd, qual as using_expression, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### Confirm RLS enabled

```sql
select c.relname as table, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;
```

---

## Notes / assumptions

- `dive_photos.user_id` exists and is kept consistent with `auth.uid()`.
  - If you **don’t need** `dive_photos.user_id`, you can remove it and rely purely on the join to `dives`.
- Policies use `TO authenticated` for `dive_photos` to avoid any ambiguity and to match typical Supabase usage for user data.
