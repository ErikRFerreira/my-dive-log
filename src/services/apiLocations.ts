import { supabase } from './supabase';
import type { DiveLocation } from '@/features/dives/types';

export type LocationUpsertInput = {
  userId: string;
  name: string;
  country?: string | null;
  country_code?: string | null;
};

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

  const { data, error } = await supabase
    .from('locations')
    .upsert(
      {
        user_id: locationData.userId,
        name: normalizedName,
        country: locationData.country ?? null,
        country_code: locationData.country_code ?? null,
      },
      { onConflict: 'user_id,name' }
    )
    .select('id')
    .single();

  if (error) throw error;
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