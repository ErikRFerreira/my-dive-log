import type { Dive, NewDiveInput } from '@/features/dives';
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
 *	Fetches the list of dives from the mock API.
 *
 * @returns - A promise that resolves to an array of Dive objects or null if the fetch fails.
 */
export async function getDives(): Promise<Dive[] | null> {
  const { data, error } = await supabase
    .from('dives')
    .select('*')
    .order('date', { ascending: false });

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
