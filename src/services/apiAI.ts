import type {
  Currents,
  DiveType,
  Exposure,
  Gas,
  Visibility,
  WaterType,
} from '@/shared/types/domain';
import { supabase } from './supabase';

export type DiveSummaryPayload = {
  date?: string | null;
  depth?: number | null;
  duration?: number | null;
  notes?: string | null;
  water_temp?: number | null;
  visibility?: Visibility | null;
  dive_type?: DiveType | null;
  water_type?: WaterType | null;
  exposure?: Exposure | null;
  currents?: Currents | null;
  weight?: number | null;
  gas?: Gas | null;
  nitrox_percent?: number | null;
  start_pressure?: number | null;
  end_pressure?: number | null;
  air_usage?: number | null;
  equipment?: string[] | null;
  wildlife?: string[] | null;
  cylinder_type?: string | null;
  cylinder_size?: number | null;
  locations?: {
    name?: string | null;
    country?: string | null;
  } | null;
  location?: string | null;
  country?: string | null;
  country_code?: string | null;
  locationName?: string | null;
  locationCountry?: string | null;
  locationCountryCode?: string | null;
};

/**
 * Sends a dive object to the API to generate a summary using AI.
 *
 * @param {DiveSummaryPayload} dive - The dive payload to summarize.
 * @returns {Promise<string>} Resolves to the generated summary string.
 * @throws If the API request fails or no summary is returned.
 */
export async function getDiveSummaryFromAPI(dive: DiveSummaryPayload): Promise<string> {
  // Get the current session token for authentication
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`/api/summarize-dive`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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
