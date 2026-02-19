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
  id?: string | null;
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

export type DiveInsightProfilePayload = {
  cert_level?: string | null;
  total_dives?: number | null;
  average_depth?: number | null;
  average_duration?: number | null;
  recent_dives_30d?: number | null;
  average_rmv?: number | null;
};

/**
 * Strict Dive Insight response from /api/summarize-dive.
 */
export type DiveInsightResponse = {
  recap: string;
  dive_insight: {
    text: string;
    baseline_comparison: string;
    evidence: string[];
  };
  recommendations: Array<{
    action: string;
    rationale: string;
  }> | 'No specific recommendations.';
};

export type DiveInsightApiResponse = {
  insight: DiveInsightResponse;
  summary: string;
  meta: {
    cached: boolean;
    model: string;
    promptVersion: string;
    generatedAt: string;
  };
};

type DiveInsightApiError = { error?: string };

/**
 * Sends a dive object to the API and returns the typed Dive Insight payload.
 *
 * @param {DiveSummaryPayload} dive - The dive payload to summarize.
 * @param {DiveInsightProfilePayload} profile - Optional diver profile context.
 * @param {boolean} regenerate - If true, bypasses cache and forces new generation.
 * @returns {Promise<DiveInsightApiResponse>} Structured insight response.
 * @throws If the API request fails or returns an invalid shape.
 */
export async function generateDiveInsightFromAPI(
  dive: DiveSummaryPayload,
  profile?: DiveInsightProfilePayload,
  regenerate = false
): Promise<DiveInsightApiResponse> {
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
    body: JSON.stringify({ dive, profile, regenerate }),
  });

  const bodyText = await res.text();
  let data: DiveInsightApiResponse & DiveInsightApiError = {} as DiveInsightApiResponse & DiveInsightApiError;

  try {
    data = bodyText ? JSON.parse(bodyText) : ({} as DiveInsightApiResponse & DiveInsightApiError);
  } catch {
    // if it's not JSON, keep data as {}
  }

  if (!res.ok) {
    const msg = data.error || 'Failed to generate summary';
    throw new Error(msg);
  }

  if (
    !data.summary ||
    !data.insight ||
    !data.meta ||
    typeof data.meta.cached !== 'boolean' ||
    typeof data.meta.model !== 'string' ||
    typeof data.meta.promptVersion !== 'string' ||
    typeof data.meta.generatedAt !== 'string'
  ) {
    throw new Error(data.error || 'Invalid Dive Insight response shape');
  }

  return data;
}

/**
 * Legacy convenience helper for existing UI flows that only need text summary.
 */
export async function getDiveSummaryFromAPI(
  dive: DiveSummaryPayload,
  profile?: DiveInsightProfilePayload,
  regenerate = false
): Promise<string> {
  const data = await generateDiveInsightFromAPI(dive, profile, regenerate);
  return data.summary;
}
