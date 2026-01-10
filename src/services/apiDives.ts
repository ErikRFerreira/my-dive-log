import type { Dive, NewDiveInput, UpdateDivePatch } from '@/features/dives';
import type { DiveFilters } from '@/features/dives/hooks/useGetDives';
import { supabase } from './supabase';
import { ITEMS_PER_PAGE } from '@/shared/constants';
import { getOrCreateLocationId, getOrCreateLocationIdForCurrentUser } from './apiLocations';
import { getCurrentUserId } from './apiAuth';
import { geocodeLocation } from './apiGeocode';


/**
 * Fetch a single dive by ID from Supabase.
 *
 * @param {string} id - Dive primary key.
 * @returns {Promise<Dive | null>} Dive when found, otherwise null.
 * @throws {Error} When Supabase returns an error.
 */
export async function getDiveById(id: string): Promise<Dive | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('dives')
    .select('*, locations(id, name, country, country_code)')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data ?? null;
}

/**
 * Fetch a paginated list of dives with optional filters.
 *
 * @param {DiveFilters} [filters] - Sorting, depth, location, search, and pagination options.
 * @returns {Promise<{ dives: Dive[]; totalCount: number } | null>} Dives for the requested page plus total row count.
 * @throws {Error} When Supabase returns an error.
 */
export async function getDives(filters?: DiveFilters): Promise<{
  dives: Dive[];
  totalCount: number;
} | null> {
  const userId = await getCurrentUserId();

  let query = supabase
    .from('dives')
    .select('*, locations(id, name, country, country_code, is_favorite)', { count: 'exact' });

  query = query.eq('user_id', userId);

  // Apply depth filter
  if (filters?.maxDepth) {
    query = query.lte('depth', filters.maxDepth);
  }

  // Apply country filter
  if (filters?.country) {
    const { data: locationMatches, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('user_id', userId)
      .eq('country', filters.country)
      .limit(1000);

    if (locationError) throw locationError;

    const locationIds = (locationMatches ?? []).map((l) => l.id).filter(Boolean);
    if (!locationIds.length) {
      return { dives: [], totalCount: 0 };
    }

    query = query.in('location_id', locationIds);
  }

  // Apply location filter (locations table)
  if (filters?.locationId) {
    query = query.eq('location_id', filters.locationId);
  }

  // Apply search filter
  if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
    const raw = filters.searchQuery.trim();
    const searchTerm = raw.replace(/[(),]/g, ' ').replace(/\s+/g, ' ').trim();

    const { data: locationMatches, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('user_id', userId)
      .or(`name.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`)
      .limit(1000);

    if (locationError) throw locationError;

    const locationIds = (locationMatches ?? []).map((l) => l.id).filter(Boolean);

    const orParts = [`notes.ilike.%${searchTerm}%`, `summary.ilike.%${searchTerm}%`];
    if (locationIds.length) {
      orParts.push(`location_id.in.(${locationIds.join(',')})`);
    }

    query = query.or(orParts.join(','));
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'date';
  query = query.order(sortBy, { ascending: false });

  // Apply pagination (opt-in).
  // If the caller doesn't specify pagination, return all matching rows.
  if (filters?.page !== undefined || filters?.pageSize !== undefined) {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? ITEMS_PER_PAGE;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    dives: data ?? [],
    totalCount: count ?? 0,
  };
}

/**
 * Insert a new dive for the authenticated user.
 * Ensures a per-user location record exists before creating the dive.
 * Supports inserting optional dive metadata (temperature, pressures, equipment, etc.) when provided.
 *
 * @param {NewDiveInput} diveData - Payload to insert.
 * @returns {Promise<Dive | null>} Newly created dive, or null if Supabase returns no rows.
 * @throws {Error} When auth is missing or Supabase returns an error.
 */
export async function createDive(diveData: NewDiveInput): Promise<Dive | null> {
  const userId = await getCurrentUserId();

  // Create or reuse a location entry for this user 
  const locationId = await getOrCreateLocationId({
    userId,
    name: diveData.locationName,
    country: diveData.locationCountry ?? null,
    country_code: diveData.locationCountryCode ?? null,
  });

  // Attempt to geocode the location in the background if we have a country code
  const geocodePromise = (async () => {
    const countryCode = diveData.locationCountryCode?.trim();
    if (!countryCode) return;

    try {
      const { lat, lng } = await geocodeLocation({
        name: diveData.locationName,
        country_code: countryCode,
      });

      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const { data: existing, error: existingError } = await supabase
        .from('locations')
        .select('lat,lng')
        .eq('id', locationId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingError || !existing) return;
      if (existing.lat !== null || existing.lng !== null) return;

      const { error: updateError } = await supabase
        .from('locations')
        .update({ lat, lng })
        .eq('id', locationId)
        .eq('user_id', userId);

      if (updateError) {
        console.warn('Geocoded coords could not be saved:', updateError);
      }
    } catch (error) {
      console.warn('Geocoding failed, continuing without coordinates:', error);
    }
  })();

  const insertPayload = {
    user_id: userId,
    date: diveData.date,
    depth: diveData.depth,
    duration: diveData.duration,
    notes: diveData.notes ?? null,
    location_id: locationId,
    water_temp: diveData.water_temp ?? null,
    visibility: diveData.visibility ?? null,
    start_pressure: diveData.start_pressure ?? null,
    end_pressure: diveData.end_pressure ?? null,
    air_usage: diveData.air_usage ?? null,
    equipment: diveData.equipment ?? null,
    wildlife: diveData.wildlife ?? null,
    dive_type: diveData.dive_type ?? null,
    water_type: diveData.water_type ?? null,
    exposure: diveData.exposure ?? null,
    gas: diveData.gas ?? null,
    currents: diveData.currents ?? null,
    weight: diveData.weight ?? null,
  };

  const { data, error } = await supabase
    .from('dives')
    .insert([insertPayload])
    .select('*, locations(id, name, country, country_code)')
    .single();
  if (error) throw error;

  await geocodePromise;

  return data ?? null;
}

/**
 * Delete a dive by ID.
 *
 * @param {string} id - Dive primary key to delete.
 * @returns {Promise<boolean>} True when delete succeeds.
 * @throws {Error} When Supabase returns an error.
 */
export async function deleteDive(id: string): Promise<boolean> {
  const userId = await getCurrentUserId();

  const { error } = await supabase.from('dives').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
  return true;
}

/**
 * Update a dive by ID.
 *
 * @param {string} id - Dive primary key to update.
 * @param {UpdateDivePatch} diveData - Fields to update (includes optional virtual location fields).
 * @returns {Promise<Dive | null>} Updated dive, or null if Supabase returns no rows.
 * @throws {Error} When Supabase returns an error.
 */
export async function updateDive(id: string, diveData: UpdateDivePatch): Promise<Dive | null> {
  const userId = await getCurrentUserId();

  // `UpdateDivePatch` is mostly real `dives` table columns (date, depth, notes, etc.),
  // but it also allows "virtual" fields for updating the related location:
  //
  // - `locationName` (string): desired location name
  // - `locationCountry` (string|null): optional country for the location row
  // - `locationCountryCode` (string|null): optional country code for the location row
  //
  // Those 3 fields are NOT columns on the `dives` table. We translate them into a real
  // `location_id` update by upserting/finding a row in the `locations` table, then we
  // remove the virtual fields before calling Supabase `.update(...)`.
  const patch: Record<string, unknown> = { ...diveData };

  // The `locations` property is an embedded relation returned by selects like
  // `select('*, locations(...)')`. It cannot be updated directly via the `dives` update call.
  delete patch.locations;

  // If the caller provided a new location name, convert it to a `location_id`.
  if (typeof patch.locationName === 'string') {
    const name = patch.locationName.trim();
    const locationCountry = typeof patch.locationCountry === 'string' ? patch.locationCountry : null;
    const locationCountryCode =
      typeof patch.locationCountryCode === 'string' ? patch.locationCountryCode : null;

    // Prevent Supabase from receiving unknown columns (these keys don't exist on `dives`).
    delete patch.locationName;
    delete patch.locationCountry;
    delete patch.locationCountryCode;

    // Only change the location relation if the new name is non-empty.
    if (name) {
      const locationId = await getOrCreateLocationIdForCurrentUser({
        name,
        country: locationCountry,
        country_code: locationCountryCode,
      });

      // This is the actual `dives` table update: point the dive at the resolved location row.
      patch.location_id = locationId;
    }
  }

  const { data, error } = await supabase
    .from('dives')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, locations(id, name, country, country_code)')
    .single();

  if (error) throw error;
  return data ?? null;
}


/**
 * 
 * @param {string} locationId - Location primary key.
 * @returns {Promise<Dive[] | null>} List of dives at the specified location.
 */
export async function getDivesByLocationId(locationId: string) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('dives')
    .select('*, locations(id, name, country, country_code, lat, lng, is_favorite)')
    .eq('location_id', locationId)
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}
