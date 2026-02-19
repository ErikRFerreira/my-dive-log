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

    const context = normalizeDiveContext(dive);
    const diverProfile = normalizeDiverProfile(profile);
    const metrics = computeDiveMetrics(context, diverProfile);
    const signals = extractSignals(context, diverProfile, metrics);
    const prompt = buildDiveInsightPrompt({
      dive: context,
      profile: diverProfile,
      signals,
      metrics,
    });

    const inputHash = buildInputHash({
      dive: context,
      profile: diverProfile,
      metrics,
      signals,
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
      profile: diverProfile,
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
