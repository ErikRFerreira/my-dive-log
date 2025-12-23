import type { Dive } from '@/features/dives';

/**
 * Sends a dive object to the API to generate a summary using AI.
 *
 * @param {Dive} dive - The dive object to summarize.
 * @returns {Promise<string>} Resolves to the generated summary string.
 * @throws If the API request fails or no summary is returned.
 */
export async function getDiveSummaryFromAPI(dive: Dive): Promise<string> {

  const res = await fetch(`/api/summarize-dive`, {
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