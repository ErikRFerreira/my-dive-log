import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SupabaseClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import {
  createSupabaseUserClient,
  getBearerToken,
  verifySupabaseToken,
  getSupabaseEnv,
} from '../src/server/auth.js';
import {
  MODEL,
  MODEL_MAX_TOKENS,
  MODEL_SEED,
  MODEL_TEMPERATURE,
  PROMPT_VERSION,
} from '../src/server/summarize-dive/constants.js';
import {
  createFallbackDiveInsight,
  enforceDiveInsightPolicy,
  formatDiveInsightForStorage,
  parseDiveInsightResponse,
} from '../src/server/summarize-dive/format.js';
import { computeDiveMetrics } from '../src/server/summarize-dive/metrics.js';
import { normalizeDiveContext, normalizeDiverProfile } from '../src/server/summarize-dive/normalize.js';
import { buildDiveInsightPrompt } from '../src/server/summarize-dive/prompt.js';
import { extractSignals } from '../src/server/summarize-dive/signals.js';
import type {
  BaselinesBundle,
  DiveContext,
  DiveInsightApiResponse,
  DiveInsightRequest,
  DivePayload,
  DiverProfilePayload,
  StoredDiveInsight,
} from '../src/server/summarize-dive/types.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const context = normalizeDiveContext(dive);
    const diverProfile = normalizeDiverProfile(profile);
    const locationKey = buildLocationKey(dive);
    const baselines = await fetchBaselines({
      supabase,
      userId: authResult.user.id,
      locationKey,
      nowDate: new Date(),
    });

    const metrics = computeDiveMetrics(context, diverProfile, baselines);
    const signals = extractSignals(context, diverProfile, metrics);
    const prompt = buildDiveInsightPrompt({
      dive: context,
      profile: diverProfile,
      signals,
      metrics,
      baselines,
    });

    const inputHash = buildInputHash({
      dive: context,
      profile: diverProfile,
      metrics,
      signals,
      baselines,
      promptVersion: PROMPT_VERSION,
      model: MODEL,
    });

    const recapFallback = buildDeterministicRecap(context);
    const cached = await readStoredDiveInsight(
      userClientResult,
      authResult.user.id,
      context.id,
      inputHash
    );
    if (cached && !regenerate) {
      const response: DiveInsightApiResponse = {
        insight: cached.insight,
        summary: formatDiveInsightForStorage(cached.insight),
        meta: {
          cached: true,
          model: cached.model,
          promptVersion: cached.promptVersion,
          generatedAt: cached.generatedAt,
        },
      };
      return res.status(200).json(response);
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You generate concise scuba dive insights and always return strict JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: MODEL_TEMPERATURE,
      max_tokens: MODEL_MAX_TOKENS,
      seed: MODEL_SEED,
      response_format: { type: 'json_object' },
    });

    const modelContent = completion.choices?.[0]?.message?.content?.trim();

    if (!modelContent) {
      return res.status(500).json({ error: 'No insight returned from model' });
    }

    const parsed = parseDiveInsightResponse(modelContent);
    if (!parsed.ok) {
      console.warn('Invalid model insight response:', parsed.error);
    }

    const parsedInsight = parsed.ok
      ? parsed.data
      : createFallbackDiveInsight({ recap: recapFallback });
    const insight = enforceDiveInsightPolicy(parsedInsight, {
      metrics,
      signals,
      recapFallback,
    });
    const summary = formatDiveInsightForStorage(insight);
    const generatedAt = new Date().toISOString();

    const storedInsight: StoredDiveInsight = {
      promptVersion: PROMPT_VERSION,
      model: MODEL,
      inputHash,
      generatedAt,
      insight,
      metrics,
      signals,
      baselines,
    };

    await writeStoredDiveInsight(
      userClientResult,
      authResult.user.id,
      context.id,
      storedInsight
    );

    const response: DiveInsightApiResponse = {
      summary,
      insight,
      meta: {
        cached: false,
        model: MODEL,
        promptVersion: PROMPT_VERSION,
        generatedAt,
      },
    };

    return res.status(200).json(response);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error in summarize-dive:', errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
}

function isDiveInsightRequest(value: unknown): value is DiveInsightRequest {
  return Boolean(value && typeof value === 'object' && 'dive' in value);
}

function buildInputHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function parseStoredDiveInsight(value: unknown): StoredDiveInsight | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  if (
    typeof record.promptVersion !== 'string' ||
    typeof record.model !== 'string' ||
    typeof record.inputHash !== 'string' ||
    typeof record.generatedAt !== 'string'
  ) {
    return null;
  }

  if (!record.baselines || typeof record.baselines !== 'object') {
    return null;
  }

  const insight = record.insight as Record<string, unknown> | undefined;
  const diveInsight = insight?.dive_insight as Record<string, unknown> | undefined;
  const hasValidInsightShape =
    typeof insight?.recap === 'string' &&
    diveInsight &&
    typeof diveInsight.text === 'string' &&
    typeof diveInsight.baseline_comparison === 'string' &&
    Array.isArray(diveInsight.evidence);

  if (!hasValidInsightShape) {
    return null;
  }

  return record as StoredDiveInsight;
}

async function readStoredDiveInsight(
  supabase: SupabaseClient,
  userId: string,
  diveId: string | undefined,
  inputHash: string
): Promise<StoredDiveInsight | null> {
  if (!diveId) return null;

  const { data, error } = await supabase
    .from('dives')
    .select('ai_summary')
    .eq('id', diveId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Unable to read cached dive insight:', error.message);
    return null;
  }

  const rawStored = data?.ai_summary;
  if (!rawStored || typeof rawStored !== 'string') return null;

  try {
    const parsed = parseStoredDiveInsight(JSON.parse(rawStored));
    if (!parsed) return null;
    if (parsed.inputHash !== inputHash) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeStoredDiveInsight(
  supabase: SupabaseClient,
  userId: string,
  diveId: string | undefined,
  stored: StoredDiveInsight
): Promise<void> {
  if (!diveId) return;

  const { error } = await supabase
    .from('dives')
    .update({ ai_summary: JSON.stringify(stored) })
    .eq('id', diveId)
    .eq('user_id', userId);

  if (error) {
    console.warn('Unable to persist cached dive insight:', error.message);
  }
}

type BaselineRow = {
  scope?: string | null;
  sample_size?: number | null;
  avg_depth?: number | null;
  avg_duration?: number | null;
  avg_rmv?: number | null;
  avg_air?: number | null;
  avg_cyl?: number | null;
  avg_avg_depth?: number | null;
  max_date?: string | null;
};

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLocationString(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .slice(0, 120);
  return cleaned || null;
}

function buildLocationKey(dive: DivePayload): string | null {
  const idKey = dive.location_id ?? dive.id ?? null;
  if (idKey && typeof idKey === 'string' && idKey.trim().length > 0) {
    return idKey.trim();
  }
  const nameKey =
    dive.location ??
    dive.locationName ??
    (typeof dive.locations === 'object' ? dive.locations?.name : null) ??
    null;
  return normalizeLocationString(nameKey ?? null);
}

async function fetchBaselineScope(options: {
  supabase: SupabaseClient;
  userId: string;
  locationKey: string | null;
  scope: 'global' | 'location' | 'recent';
  windowDays?: number | null;
}): Promise<BaselineRow | null> {
  const { supabase, userId, locationKey, scope, windowDays } = options;

  // Try RPC first for accurate RMV aggregation.
  try {
    const { data, error } = await supabase.rpc('get_dive_baseline', {
      _user: userId,
      _location: scope === 'location' ? locationKey : null,
      _window_days: windowDays ?? null,
    });
    if (!error && data && Array.isArray(data) && data.length > 0) {
      return data[0] as BaselineRow;
    }
  } catch (rpcError) {
    console.warn('RPC get_dive_baseline unavailable, falling back to aggregates', rpcError);
  }

  // Fallback aggregate query.
  try {
    let query = supabase
      .from('dives')
      .select(
        'count:id, avg_depth:avg(depth), avg_duration:avg(duration), avg_air:avg(air_usage), avg_cyl:avg(cylinder_size), avg_avg_depth:avg(average_depth), max_date:max(date)'
      )
      .eq('user_id', userId);

    if (scope === 'location' && locationKey) {
      // Prefer location_id if exists, otherwise location string.
      query = query.or(`location_id.eq.${locationKey},location.eq.${locationKey}`);
    }

    if (scope === 'recent' && windowDays) {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - windowDays);
      query = query.gte('date', sinceDate.toISOString().slice(0, 10));
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.warn('Baseline aggregate query failed', error.message);
      return null;
    }
    return data as BaselineRow;
  } catch (err) {
    console.warn('Baseline aggregate fallback failed', err);
    return null;
  }
}

function rowToBaseline(
  row: BaselineRow | null,
  scope: 'global' | 'location' | 'recent',
  locationKey: string | null,
  windowDays?: number | null
): BaselinesBundle[keyof BaselinesBundle] | null {
  if (!row) return null;
  const sampleSize =
    toNumberOrNull((row as Record<string, unknown>).sample_size) ??
    toNumberOrNull((row as Record<string, unknown>).count);
  if (!sampleSize || sampleSize <= 0) return null;

  const avgDepth = toNumberOrNull(row.avg_depth);
  const avgDuration = toNumberOrNull(row.avg_duration);
  const avgRMV =
    toNumberOrNull(row.avg_rmv) ??
    (() => {
      const avgAir = toNumberOrNull(row.avg_air);
      const avgCyl = toNumberOrNull(row.avg_cyl);
      const avgDepthForRMV =
        toNumberOrNull(row.avg_avg_depth) ?? toNumberOrNull(row.avg_depth) ?? null;
      if (
        avgAir !== null &&
        avgCyl !== null &&
        avgDepthForRMV !== null &&
        avgDuration !== null &&
        avgDuration > 0
      ) {
        const ata = avgDepthForRMV / 10 + 1;
        if (ata > 0) {
          const litersUsed = avgAir * avgCyl;
          const rmv = litersUsed / (ata * avgDuration);
          return Number.isFinite(rmv) ? Number(rmv.toFixed(2)) : null;
        }
      }
      return null;
    })();

  const base = {
    scope,
    sampleSize,
    avgDepth,
    avgDuration,
    avgRMV,
    lastDiveDate: row.max_date ?? null,
    windowDays: windowDays ?? null,
    locationKey: scope === 'location' ? locationKey ?? null : null,
  };

  if (scope === 'global') return base as BaselinesBundle['global'];
  if (scope === 'location') return base as BaselinesBundle['location'];
  return base as BaselinesBundle['recent'];
}

async function fetchBaselines(params: {
  supabase: SupabaseClient;
  userId: string;
  locationKey: string | null;
  nowDate: Date;
}): Promise<BaselinesBundle> {
  const { supabase, userId, locationKey } = params;

  const globalRow = await fetchBaselineScope({
    supabase,
    userId,
    locationKey,
    scope: 'global',
  });
  const locationRow = await fetchBaselineScope({
    supabase,
    userId,
    locationKey,
    scope: 'location',
  });
  const recent30Row = await fetchBaselineScope({
    supabase,
    userId,
    locationKey,
    scope: 'recent',
    windowDays: 30,
  });
  const recent90Row = recent30Row
    ? null
    : await fetchBaselineScope({
        supabase,
        userId,
        locationKey,
        scope: 'recent',
        windowDays: 90,
      });

  const global = rowToBaseline(globalRow, 'global', locationKey);
  const location = rowToBaseline(locationRow, 'location', locationKey);
  const recent = rowToBaseline(recent30Row ?? recent90Row, 'recent', locationKey, recent30Row ? 30 : recent90Row ? 90 : null);

  const availability = {
    hasGlobalBaseline: Boolean(global && global.sampleSize >= 5),
    hasLocationBaseline: Boolean(location && location.sampleSize >= 3),
    hasRecentBaseline: Boolean(recent && recent.sampleSize >= 3),
  };

  return {
    global: availability.hasGlobalBaseline ? (global as BaselinesBundle['global']) : null,
    location: availability.hasLocationBaseline ? (location as BaselinesBundle['location']) : null,
    recent: availability.hasRecentBaseline ? (recent as BaselinesBundle['recent']) : null,
    availability,
  };
}

async function enforceRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<{ blocked: true; payload: { error: string; next_reset?: string } } | null> {
  try {
    const { data, error } = await supabase.rpc('consume_ai_credit', { user: userId, limit: 20 });
    if (error) {
      console.warn('Rate limit check failed (ignored):', error.message);
      return null;
    }
    if (data && typeof data === 'object' && 'allowed' in data && data.allowed === false) {
      return {
        blocked: true,
        payload: {
          error: 'rate_limit',
          next_reset: data.next_reset ?? null,
        },
      };
    }
  } catch (err) {
    console.warn('Rate limit RPC unavailable (ignored):', err);
  }
  return null;
}

function buildDeterministicRecap(dive: DiveContext): string {
  const parts = [
    `Dive logged at ${dive.location}${dive.country ? `, ${dive.country}` : ''} on ${dive.date}.`,
  ];

  if (dive.maxDepthMeters !== null || dive.durationMinutes !== null) {
    const profile = [
      dive.maxDepthMeters !== null ? `max depth ${dive.maxDepthMeters} m` : null,
      dive.durationMinutes !== null ? `duration ${dive.durationMinutes} min` : null,
    ]
      .filter(Boolean)
      .join(', ');

    if (profile) parts.push(`Profile: ${profile}.`);
  }

  return parts.join(' ');
}
