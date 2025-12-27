import type { Dive, NewDiveInput, UpdateDivePatch } from '@/features/dives';
import type { DiveFilters } from '@/features/dives/hooks/useGetDives';
import { supabase } from './supabase';
import { ITEMS_PER_PAGE } from '@/shared/constants';
import { getOrCreateLocationId } from './apiLocations';


/**
 * Fetch a single dive by ID from Supabase.
 *
 * @param {string} id - Dive primary key.
 * @returns {Promise<Dive | null>} Dive when found, otherwise null.
 * @throws {Error} When Supabase returns an error.
 */
export async function getDiveById(id: string): Promise<Dive | null> {
  const { data, error } = await supabase
    .from('dives')
    .select('*, locations(id, name, country, country_code)')
    .eq('id', id)
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
  let query = supabase.from('dives').select('*, locations(id, name, country, country_code)', { count: 'exact' });

  // Apply depth filter
  if (filters?.maxDepth) {
    query = query.lte('depth', filters.maxDepth);
  }

  // Apply country filter
  if (filters?.country) {
    query = query.eq('locations.country', filters.country);
  }

  // Apply location filter (locations table)
  if (filters?.locationId) {
    query = query.eq('location_id', filters.locationId);
  }

  // Apply search filter
  if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
    // Sanitize search query
    const raw = filters.searchQuery.trim();
    const searchTerm = raw.replace(/,/g, ' ');
    
    // Search in both location AND notes using Supabase's 'or' filter
    // ilike = case-insensitive LIKE (SQL pattern matching with %)
    // %searchTerm% = SQL wildcard meaning "contains this text anywhere"
    // or(...) = Match if either condition is true
    query = query.or(
      `locations.name.ilike.%${searchTerm}%,locations.country.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`
    );
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'date';
  query = query.order(sortBy, { ascending: false });

  // Apply pagination
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? ITEMS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

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
 *
 * @param {NewDiveInput} diveData - Payload to insert.
 * @returns {Promise<Dive | null>} Newly created dive, or null if Supabase returns no rows.
 * @throws {Error} When auth is missing or Supabase returns an error.
 */
export async function createDive(diveData: NewDiveInput): Promise<Dive | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('User must be authenticated to create a dive');

  // Create or reuse a location entry for this user 
  const locationId = await getOrCreateLocationId({
    userId: user.id,
    name: diveData.locationName,
    country: diveData.locationCountry ?? null,
    country_code: diveData.locationCountryCode ?? null,
  });

  const insertPayload = {
    user_id: user.id,
    date: diveData.date,
    depth: diveData.depth,
    duration: diveData.duration,
    notes: diveData.notes ?? null,
    location_id: locationId,
  };

  const { data, error } = await supabase
    .from('dives')
    .insert([insertPayload])
    .select('*, locations(id, name, country, country_code)')
    .single();
  if (error) throw error;
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
  const { error } = await supabase.from('dives').delete().eq('id', id);
  if (error) throw error;
  return true;
}

/**
 * Update a dive by ID.
 *
 * @param {string} id - Dive primary key to update.
 * @param {Partial<Dive>} diveData - Fields to update.
 * @returns {Promise<Dive | null>} Updated dive, or null if Supabase returns no rows.
 * @throws {Error} When Supabase returns an error.
 */
export async function updateDive(id: string, diveData: UpdateDivePatch): Promise<Dive | null> {
  const patch: Record<string, unknown> = { ...diveData };
  delete patch.locations;

  if (typeof patch.locationName === 'string') {
    const name = patch.locationName.trim();
    const locationCountry = typeof patch.locationCountry === 'string' ? patch.locationCountry : null;
    const locationCountryCode =
      typeof patch.locationCountryCode === 'string' ? patch.locationCountryCode : null;

    delete patch.locationName;
    delete patch.locationCountry;
    delete patch.locationCountryCode;

    if (name) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error('User must be authenticated to update a dive location');

      const locationId = await getOrCreateLocationId({
        userId: user.id,
        name,
        country: locationCountry,
        country_code: locationCountryCode,
      });

      patch.location_id = locationId;
    }
  }

  const { data, error } = await supabase
    .from('dives')
    .update(patch)
    .eq('id', id)
    .select('*, locations(id, name, country, country_code)')
    .single();

  if (error) throw error;
  return data ?? null;
}
