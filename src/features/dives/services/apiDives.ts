import type { Dive } from '@/features/dives';

// TODO: move to supabase service when integrated?

/**
 *	Fetches the list of dives from the mock API.
 *
 * @returns - A promise that resolves to an array of Dive objects or null if the fetch fails.
 */
export async function getDives(): Promise<Dive[] | null> {
  const response = await fetch(`${import.meta.env.VITE_MOCK_API_URL}/dives`);
  if (!response.ok) return null;
  return (await response.json()) as Dive[];
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
