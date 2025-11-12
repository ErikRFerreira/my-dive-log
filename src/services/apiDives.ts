import type { Dive } from '@/features/dives';
import { supabase } from './supabase';
// TODO: move to supabase service when integrated?

/**
 * Fetches a single dive by ID from Supabase.
 *
 * @param id - The dive ID
 * @returns - A promise that resolves to a Dive object or null if not found.
 */
export async function getDiveById(id: string): Promise<Dive | null> {
  try {
    const { data, error } = await supabase.from('dives').select('*').eq('id', id).single();

    if (error) throw error;

    return data || null;
  } catch (error) {
    console.error('Error fetching dive from Supabase:', error);
    return null;
  }
}

/**
 *	Fetches the list of dives from the mock API.
 *
 * @returns - A promise that resolves to an array of Dive objects or null if the fetch fails.
 */
export async function getDives(): Promise<Dive[] | null> {
  try {
    const { data, error } = await supabase
      .from('dives')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return data || null;
  } catch (error) {
    console.error('Error fetching dives from Supabase:', error);
    return null;
  }
}

/**
 * Creates a new dive entry in the mock API.
 *
 * @param diveData - The dive data to be created.
 * @returns - A promise that resolves to the created Dive object or null if the creation fails.
 */
export async function createDive(diveData: Dive): Promise<Dive | null> {
  const response = await fetch(`${import.meta.env.VITE_MOCK_API_URL}/dives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(diveData),
  });
  if (!response.ok) return null;
  return (await response.json()) as Dive;
}
