import type { Dive } from '@/features/dives';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getDiveSummaryFromAPI(dive: Dive): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set');
  }

  const res = await fetch(`${API_BASE_URL}/api/summarize-dive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dive }),
  });

  const bodyText = await res.text();
  let data: { summary?: string; error?: string } = {};

  try {
    data = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    // if it's not JSON, keep data as {}
  }

  if (!res.ok) {
    const msg = data.error || 'Failed to generate summary';
    throw new Error(msg);
  }

  if (!data.summary) {
    throw new Error(data.error || 'No summary returned from API');
  }

  return data.summary;
}