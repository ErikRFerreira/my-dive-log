import type { NullableCoordinates } from '@/shared/types/common';
import { supabase } from './supabase';

/**
 * Geocode a location name (and optional country code) to latitude and longitude
 * 
 * @param {name: string; country_code?: string | null} input - Location name and optional country code
 * @returns {Promise<GeocodeResult>} Resolves with latitude and longitude or nulls if not found
 * @throws {Error} When the geocoding request fails
 */
export async function geocodeLocation(input: {
  name: string;
  country_code?: string | null;
}): Promise<NullableCoordinates> {
  // Get the current session token for authentication
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch('/api/geocode-location', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Geocode failed: ${res.status} ${text}`);
  }

  const result = await res.json();
  return result;
}
