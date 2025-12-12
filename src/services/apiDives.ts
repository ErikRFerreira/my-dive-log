import type { Dive, NewDiveInput } from '@/features/dives';
import type { DiveFilters } from '@/features/dives/hooks/useGetDives';
import { supabase } from './supabase';
// TODO: move to supabase service when integrated?

/**
 * Fetches a single dive by ID from Supabase.
 *
 * @param id - The dive ID
 * @returns - A promise that resolves to a Dive object or null if not found.
 */
export async function getDiveById(id: string): Promise<Dive | null> {
  const { data, error } = await supabase.from('dives').select('*').eq('id', id).single();
  if (error) throw error;
  return data ?? null;
}

/**
 *	Fetches the list of dives from Supabase with optional filtering and sorting.
 *
 * @param filters - Optional filters for sorting, depth, and location
 * @returns - A promise that resolves to an array of Dive objects or null if the fetch fails.
 */
export async function getDives(filters?: DiveFilters): Promise<Dive[] | null> {
  let query = supabase.from('dives').select('*');

  // Apply depth filter
  if (filters?.maxDepth) {
    query = query.lte('depth', filters.maxDepth);
  }

  // Apply location filter
  if (filters?.location) {
    query = query.eq('location', filters.location);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'date';
  query = query.order(sortBy, { ascending: false });

  const { data, error } = await query;

  if (error) throw error;

  return data ?? null;
}

/**
 * Creates a new dive entry to Supabase.
 *
 * @param diveData - The dive data to be created.
 * @returns - A promise that resolves to the created Dive object or null if the creation fails.
 */
export async function createDive(diveData: NewDiveInput): Promise<Dive | null> {
  const { data, error } = await supabase.from('dives').insert([diveData]).select().single();
  if (error) throw error;
  return data ?? null;
}

/**
 * Deletes a dive by ID from Supabase.
 *
 * @param id - The ID of the dive to delete
 * @returns
 */
export async function deleteDive(id: string): Promise<boolean> {
  const { error } = await supabase.from('dives').delete().eq('id', id);
  if (error) throw error;
  return true;
}

/**
 * Updates a dive entry in Supabase.
 *
 * @param id - Dive ID
 * @param diveData - Partial dive data to update
 * @returns
 */
export async function updateDive(id: string, diveData: Partial<Dive>): Promise<Dive | null> {
  const { data, error } = await supabase
    .from('dives')
    .update(diveData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data ?? null;
}
