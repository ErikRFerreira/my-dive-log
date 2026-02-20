import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseEnv,
  verifySupabaseToken,
} from '../src/server/auth.js';
import { generateDiveInsightResponse } from '../src/server/summarize-dive/pipeline.js';
import { enforceRateLimit } from '../src/server/summarize-dive/rate-limit.js';
import type {
  DiveInsightRequest,
  DivePayload,
  DiverProfilePayload,
} from '../src/server/summarize-dive/types.js';

function applyCors(req: VercelRequest, res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function isDiveInsightRequest(value: unknown): value is DiveInsightRequest {
  return Boolean(value && typeof value === 'object' && 'dive' in value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const env = getSupabaseEnv();
  if ('error' in env) {
    return res.status(500).json({ error: env.error });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization bearer token' });
  }

  const authResult = await verifySupabaseToken(token);
  if ('error' in authResult) {
    return res.status(401).json({ error: authResult.error });
  }

  const userClientResult = createSupabaseUserClient(token);
  if ('error' in userClientResult) {
    return res.status(500).json({ error: userClientResult.error });
  }
  const supabase = userClientResult as SupabaseClient;

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
      | DiveInsightRequest
      | DivePayload;

    const dive = (isDiveInsightRequest(body) ? body.dive : body) as DivePayload | undefined;
    const profile = (isDiveInsightRequest(body) ? body.profile : undefined) as
      | DiverProfilePayload
      | undefined;
    const regenerate = isDiveInsightRequest(body) ? Boolean(body.regenerate) : false;

    if (!dive) {
      return res.status(400).json({ error: 'Missing dive payload' });
    }

    const rateLimit = await enforceRateLimit(supabase, authResult.user.id);
    if (rateLimit?.blocked) {
      return res.status(429).json(rateLimit.payload);
    }

    const response = await generateDiveInsightResponse({
      supabase,
      userId: authResult.user.id,
      dive,
      profile,
      regenerate,
    });

    return res.status(200).json(response);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error in summarize-dive:', errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
}
