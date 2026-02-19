import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBearerToken, verifySupabaseToken, getSupabaseEnv } from '../src/server/auth.js';

type Body = {
  name?: string;
  country_code?: string | null; // ISO2 like "PT"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic CORS (optional, but helpful for local dev)
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate environment variables
  const env = getSupabaseEnv();
  if ('error' in env) {
    return res.status(500).json({ error: env.error });
  }

  // Verify authentication
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization bearer token' });
  }

  const authResult = await verifySupabaseToken(token);
  if ('error' in authResult) {
    return res.status(401).json({ error: authResult.error });
  }

  try {
    // Vercel parses JSON automatically when `Content-Type: application/json` is provided.
    // If a client sends invalid JSON, `req.body` access can throw (statusCode: 400).
    const raw = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const body = raw as Body;

    const name = body?.name?.trim();
    const countryCode = body?.country_code?.trim()?.toLowerCase() ?? null;

    if (!name) return res.status(400).json({ error: 'Missing "name"' });

    // Build query
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('q', name);
    url.searchParams.set('limit', '1');
    url.searchParams.set('addressdetails', '0');

    // Optional: nudge results to a country (ISO2)
    if (countryCode) url.searchParams.set('countrycodes', countryCode);

    // IMPORTANT: Nominatim requires identification. Use a descriptive UA.
    const userAgent = process.env.NOMINATIM_USER_AGENT;
    if (!userAgent) {
      return res.status(500).json({
        error: 'Missing NOMINATIM_USER_AGENT env var',
        details: 'Set a descriptive User-Agent (include a contact email or domain).',
      });
    }

    const resp = await fetch(url.toString(), {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json',
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({
        error: 'Nominatim request failed',
        status: resp.status,
        details: text.slice(0, 300),
      });
    }

    const results = (await resp.json()) as Array<{ lat: string; lon: string }>;

    if (!results?.length) {
      return res.status(200).json({ lat: null, lng: null });
    }

    const lat = Number(results[0].lat);
    const lng = Number(results[0].lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(200).json({ lat: null, lng: null });
    }

    return res.status(200).json({ lat, lng });
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    if (error?.statusCode === 400 && `${error?.message ?? ''}`.toLowerCase().includes('invalid json')) {
      return res.status(400).json({
        error: 'Invalid JSON body',
        details:
          'Send a JSON payload with header Content-Type: application/json, e.g. {"name":"Blue Lagoon","country_code":"PT"}',
      });
    }

    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('geocode-location error:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
