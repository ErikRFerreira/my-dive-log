import type { Dive } from '@/features/dives';

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
