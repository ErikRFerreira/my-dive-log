import type { Dive } from '@/features/dives';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getDiveSummaryFromAPI(dive: Dive): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set');
  }

  const res = await fetch(`${API_BASE_URL}/api/summarize-dive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dive }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('summarize-dive error response:', text);
    throw new Error('Failed to generate summary');
  }

  const data = (await res.json()) as { summary?: string; error?: string };

  if (!data.summary) {
    throw new Error(data.error || 'No summary returned from API');
  }

  return data.summary;
}