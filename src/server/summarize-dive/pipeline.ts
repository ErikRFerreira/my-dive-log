import type { SupabaseClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import {
  MODEL,
  MODEL_MAX_TOKENS,
  MODEL_SEED,
  MODEL_TEMPERATURE,
  PROMPT_VERSION,
} from './constants.js';
import {
  createFallbackDiveInsight,
  enforceDiveInsightPolicy,
  formatDiveInsightForStorage,
  parseDiveInsightResponse,
} from './format.js';
import { computeDiveMetrics } from './metrics.js';
import { normalizeDiveContext, normalizeDiverProfile } from './normalize.js';
import { buildDiveInsightPrompt } from './prompt.js';
import { buildDeterministicRecap } from './recap.js';
import { extractSignals } from './signals.js';
import { buildLocationKey, fetchBaselines } from './baselines.js';
import { buildInputHash, readStoredDiveInsight, writeStoredDiveInsight } from './cache.js';
import type {
  DiveInsightApiResponse,
  DivePayload,
  DiverProfilePayload,
  StoredDiveInsight,
} from './types.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateDiveInsightResponse(params: {
  supabase: SupabaseClient;
  userId: string;
  dive: DivePayload;
  profile?: DiverProfilePayload;
  regenerate?: boolean;
}): Promise<DiveInsightApiResponse> {
  const { supabase, userId, dive, profile, regenerate = false } = params;

  const context = normalizeDiveContext(dive);
  const diverProfile = normalizeDiverProfile(profile);
  const locationKey = buildLocationKey(dive);
  const baselines = await fetchBaselines({
    supabase,
    userId,
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
  const cached = await readStoredDiveInsight({
    supabase,
    userId,
    diveId: context.id,
    inputHash,
  });
  if (cached && !regenerate) {
    return {
      insight: cached.insight,
      summary: formatDiveInsightForStorage(cached.insight),
      meta: {
        cached: true,
        model: cached.model,
        promptVersion: cached.promptVersion,
        generatedAt: cached.generatedAt,
      },
    };
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
    throw new Error('No insight returned from model');
  }

  const parsed = parseDiveInsightResponse(modelContent);
  if (!parsed.ok) {
    console.warn('Invalid model insight response:', parsed.error);
  }

  const parsedInsight = parsed.ok ? parsed.data : createFallbackDiveInsight({ recap: recapFallback });
  const insight = enforceDiveInsightPolicy(parsedInsight, {
    metrics,
    signals,
    recapFallback,
  });

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

  await writeStoredDiveInsight({
    supabase,
    userId,
    diveId: context.id,
    stored: storedInsight,
  });

  return {
    summary: formatDiveInsightForStorage(insight),
    insight,
    meta: {
      cached: false,
      model: MODEL,
      promptVersion: PROMPT_VERSION,
      generatedAt,
    },
  };
}
