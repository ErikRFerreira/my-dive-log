import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createEmptyBaselinesBundle } from './baselines.js';
import type { StoredDiveInsight } from './types.js';

export function buildInputHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function parseStoredDiveInsight(value: unknown): StoredDiveInsight | null {
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

  if (!hasValidInsightShape) return null;

  const stored = record as StoredDiveInsight;
  if (!record.baselines || typeof record.baselines !== 'object' || Array.isArray(record.baselines)) {
    // Backward compatibility for legacy cache entries.
    stored.baselines = createEmptyBaselinesBundle();
  }

  return stored;
}

export async function readStoredDiveInsight(params: {
  supabase: SupabaseClient;
  userId: string;
  diveId: string | undefined;
  inputHash: string;
}): Promise<StoredDiveInsight | null> {
  const { supabase, userId, diveId, inputHash } = params;
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
    const rawParsed = JSON.parse(rawStored) as unknown;
    const parsed = parseStoredDiveInsight(rawParsed);
    if (!parsed) return null;
    // Legacy payloads without baselines are accepted structurally, but forced to cache miss.
    if (!rawParsed || typeof rawParsed !== 'object' || !('baselines' in rawParsed)) {
      return null;
    }
    if (parsed.inputHash !== inputHash) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeStoredDiveInsight(params: {
  supabase: SupabaseClient;
  userId: string;
  diveId: string | undefined;
  stored: StoredDiveInsight;
}): Promise<void> {
  const { supabase, userId, diveId, stored } = params;
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
