import { validateResponse } from '@/lib/validateResponse';
import { geocodeResultSchema } from '@/lib/schemas';

type GeocodeResult = { lat: number | null; lng: number | null };

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
}): Promise<GeocodeResult> {
  const res = await fetch('/api/geocode-location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Geocode failed: ${res.status} ${text}`);
  }

  const result = await res.json();
  return validateResponse(geocodeResultSchema, result, 'geocodeLocation');
}
