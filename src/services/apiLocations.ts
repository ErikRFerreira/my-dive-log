import { getCurrentUserId } from './apiAuth';
import { supabase } from './supabase';

import type { Location as DiveLocation } from '@/features/locations';

export type LocationUpsertInput = {
  userId: string;
  name: string;
  country?: string | null;
  country_code?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type SupabaseErrorWithCode = {
  code?: string | null;
  message?: string;
};


/**
 * Find-or-create a location for the current user and return its ID (atomic upsert).
 * 
 * @param {Omit<LocationUpsertInput, 'userId'>} locationData - Location data without userId.
 * @returns {Promise<string>} The ID of the found or newly created location.
 */
export async function getOrCreateLocationIdForCurrentUser(
  locationData: Omit<LocationUpsertInput, 'userId'>
): Promise<string> {
  const userId = await getCurrentUserId();
  return getOrCreateLocationId({ userId, ...locationData });
}

/**
 * Find-or-create a location for a user and return its ID (atomic upsert).
 *
 * Requires a DB uniqueness constraint on (user_id, name) so the upsert is safe.
 * Name is trimmed and collapsed to avoid duplicate rows that differ only by spacing.
 *
 * @param {LocationUpsertInput} locationData - User/location payload.
 * @returns {Promise<string>} The ID of the found or newly created location.
 * @throws {Error} When name is empty or Supabase returns an error.
 */
export async function getOrCreateLocationId(locationData: LocationUpsertInput): Promise<string> {
  const normalizedName = locationData.name.replace(/\s+/g, ' ').trim();
  if (!normalizedName) throw new Error('Location name is required');

  const payload = {
    user_id: locationData.userId,
    name: normalizedName,
    country: locationData.country ?? null,
    country_code: locationData.country_code ?? null,
  };

  const { data, error } = await supabase
    .from('locations')
    .upsert(payload, { onConflict: 'user_id,name_norm' })
    .select('id')
    .single();

  if (error) {
    const supabaseError = error as SupabaseErrorWithCode;
    throw new Error(
      `Failed to upsert location: ${supabaseError.message} (code: ${supabaseError.code ?? 'N/A'})`
    );
  }
  
  if (!data?.id) throw new Error('Failed to upsert location');

  return data.id;
}

/**
 * Fetch all locations for a given user.
 * 
 * @param {string} userId - User ID to fetch locations for.
 * @returns {Promise<DiveLocation[] | null>} List of locations for the user.
 * @throws {Error} When Supabase returns an error.
 */
export async function fetchLocationsByUser(userId: string): Promise<DiveLocation[] | null> {
  const { data, error } = await supabase
	.from('locations')
	.select('*')
	.eq('user_id', userId)
	.order('name', { ascending: true });
	  if (error) throw error;
	    return data ?? null;
}

/**
 * Update a location by its ID with the provided data.
 * 
 * @param {string} locationId - ID of the location to update.
 * @param {Partial<LocationUpsertInput>} locationData - Partial location data to update.
 * @returns {Promise<void>} Resolves when the update is complete.
 * @throws {Error} When Supabase returns an error.
 */
export async function updateLocation(
  locationId: string,
  locationData: Partial<LocationUpsertInput>
): Promise<void> {
  const payload: Partial<LocationUpsertInput> = {};
  if (locationData.name !== undefined) payload.name = locationData.name;
  if (locationData.country !== undefined) payload.country = locationData.country;
  if (locationData.country_code !== undefined) payload.country_code = locationData.country_code;
  if (locationData.lat !== undefined) payload.lat = locationData.lat;
  if (locationData.lng !== undefined) payload.lng = locationData.lng;

  const { error } = await supabase
    .from('locations')
    .update(payload)
    .eq('id', locationId);

  if (error) {
    const supabaseError = error as SupabaseErrorWithCode;
    throw new Error(
      `Failed to update location: ${supabaseError.message} (code: ${supabaseError.code ?? 'N/A'})`
    );
  }
}

/**
 * Toggle the favorite status of a location.
 * 
 * @param {string} locationId - ID of the location to toggle favorite status.
 * @param {boolean} isFavorite - New favorite status.
 * @returns {Promise<void>} Resolves when the toggle is complete.
 * @throws {Error} When Supabase returns an error.
 */
export async function toggleLocationFavorite(
  locationId: string,
  isFavorite: boolean
): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .update({ is_favorite: isFavorite })
    .eq('id', locationId)
    .select('id,is_favorite')
    .single();

  if (error) {
    const supabaseError = error as SupabaseErrorWithCode;
    throw new Error(
      `Failed to toggle favorite: ${supabaseError.message} (code: ${supabaseError.code ?? 'N/A'})`
    );
  }
}