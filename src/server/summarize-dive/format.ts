import {
  DEFAULT_RECAP,
  NO_BASELINE_COMPARISON,
  NO_MEANINGFUL_INSIGHT_TEXT,
  NO_SPECIFIC_RECOMMENDATIONS,
} from './constants.js';
import type {
  ComputedMetrics,
  DiveInsightRecommendation,
  DiveInsightResponse,
  DiveSignal,
  ParseDiveInsightResult,
} from './types.js';

function toTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .map((entry) => toTrimmedString(entry))
    .filter((entry): entry is string => entry !== null);

  return normalized;
}

function sentenceCount(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function stripCodeFence(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? raw.trim();
}

function parseRecommendations(value: unknown): DiveInsightRecommendation[] | typeof NO_SPECIFIC_RECOMMENDATIONS | null {
  if (typeof value === 'string') {
    return value.trim() === NO_SPECIFIC_RECOMMENDATIONS ? NO_SPECIFIC_RECOMMENDATIONS : null;
  }

  if (!Array.isArray(value)) return null;

  const recommendations: DiveInsightRecommendation[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const record = item as Record<string, unknown>;

    const action = toTrimmedString(record.action);
    const rationale = toTrimmedString(record.rationale);
    if (!action || !rationale) return null;
    recommendations.push({ action, rationale });
  }

  return recommendations.length > 0 ? recommendations : NO_SPECIFIC_RECOMMENDATIONS;
}

export function createFallbackDiveInsight(
  options?: Partial<{
    recap: string;
    baselineComparison: string;
  }>
): DiveInsightResponse {
  return {
    recap: options?.recap?.trim() || DEFAULT_RECAP,
    dive_insight: {
      text: NO_MEANINGFUL_INSIGHT_TEXT,
      baseline_comparison: options?.baselineComparison ?? NO_BASELINE_COMPARISON,
      evidence: [],
    },
    recommendations: NO_SPECIFIC_RECOMMENDATIONS,
  };
}

export function parseDiveInsightResponse(raw: string): ParseDiveInsightResult {
  const candidate = stripCodeFence(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    return {
      ok: false,
      error: 'Model response is not valid JSON',
      fallback: createFallbackDiveInsight(),
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      error: 'Model response must be a JSON object',
      fallback: createFallbackDiveInsight(),
    };
  }

  const record = parsed as Record<string, unknown>;
  const recap = toTrimmedString(record.recap);
  if (!recap) {
    return { ok: false, error: 'recap is required', fallback: createFallbackDiveInsight() };
  }

  if (sentenceCount(recap) > 2) {
    return {
      ok: false,
      error: 'recap must be 2 sentences or fewer',
      fallback: createFallbackDiveInsight({ recap }),
    };
  }

  const diveInsightRecord = record.dive_insight;
  if (!diveInsightRecord || typeof diveInsightRecord !== 'object' || Array.isArray(diveInsightRecord)) {
    return {
      ok: false,
      error: 'dive_insight must be an object',
      fallback: createFallbackDiveInsight({ recap }),
    };
  }

  const diveInsight = diveInsightRecord as Record<string, unknown>;
  const text = toTrimmedString(diveInsight.text);
  const baselineComparison = toTrimmedString(diveInsight.baseline_comparison);
  const evidence = toStringArray(diveInsight.evidence);

  if (!text) {
    return {
      ok: false,
      error: 'dive_insight.text is required',
      fallback: createFallbackDiveInsight({ recap }),
    };
  }

  if (!baselineComparison) {
    return {
      ok: false,
      error: 'dive_insight.baseline_comparison is required',
      fallback: createFallbackDiveInsight({ recap }),
    };
  }

  if (evidence === null) {
    return {
      ok: false,
      error: 'dive_insight.evidence must be an array of strings',
      fallback: createFallbackDiveInsight({ recap, baselineComparison }),
    };
  }

  const recommendations = parseRecommendations(record.recommendations);
  if (recommendations === null) {
    return {
      ok: false,
      error: `recommendations must be an array of {action, rationale} or "${NO_SPECIFIC_RECOMMENDATIONS}"`,
      fallback: createFallbackDiveInsight({ recap, baselineComparison }),
    };
  }

  return {
    ok: true,
    data: {
      recap,
      dive_insight: {
        text,
        baseline_comparison: baselineComparison,
        evidence,
      },
      recommendations,
    },
  };
}

const GENERIC_RECOMMENDATION_PATTERNS = [
  /monitor gas/i,
  /maintain buoyancy/i,
  /don.?t touch coral/i,
  /watch your air/i,
  /be safe/i,
];

function rationaleContainsDataSignal(
  rationale: string,
  signals: DiveSignal[],
  metrics: ComputedMetrics
): boolean {
  const lowered = rationale.toLowerCase();

  if (lowered.includes('depth') || lowered.includes('duration') || lowered.includes('rmv') || lowered.includes('gas efficiency')) {
    return true;
  }

  const metricPhrases = metrics.comparisons.map((value) => value.text.toLowerCase());

  if (metricPhrases.some((phrase) => lowered.includes(phrase))) return true;

  const signalTokens = signals
    .flatMap((signal) => [signal.code.toLowerCase(), ...signal.message.toLowerCase().split(/\s+/)])
    .filter((token) => token.length >= 4);

  return signalTokens.some((token) => lowered.includes(token));
}

function filterRecommendations(
  recommendations: DiveInsightResponse['recommendations'],
  signals: DiveSignal[],
  metrics: ComputedMetrics
): DiveInsightResponse['recommendations'] {
  if (recommendations === NO_SPECIFIC_RECOMMENDATIONS) return recommendations;

  const filtered = recommendations.filter((recommendation) => {
    const generic = GENERIC_RECOMMENDATION_PATTERNS.some((pattern) =>
      pattern.test(recommendation.action)
    );

    if (!generic) return true;
    return rationaleContainsDataSignal(recommendation.rationale, signals, metrics);
  });

  return filtered.length > 0 ? filtered : NO_SPECIFIC_RECOMMENDATIONS;
}

function hasComparativeLanguage(text: string): boolean {
  return /(average|baseline|deeper|shallower|longer|shorter|improv|decreas|higher|lower)/i.test(text);
}

export function enforceDiveInsightPolicy(
  insight: DiveInsightResponse,
  input: {
    metrics: ComputedMetrics;
    signals: DiveSignal[];
    recapFallback?: string;
  }
): DiveInsightResponse {
  const { metrics, signals } = input;
  const hasBaseline =
    metrics.baselineAvailability.hasLocationBaseline ||
    metrics.baselineAvailability.hasGlobalBaseline ||
    metrics.baselineAvailability.hasRecentBaseline;
  const deterministicComparison = metrics.topComparison;

  let baselineComparison = insight.dive_insight.baseline_comparison;
  let text = insight.dive_insight.text;
  let evidence = insight.dive_insight.evidence;

  if (!hasBaseline) {
    baselineComparison = NO_BASELINE_COMPARISON;
  } else if (!hasComparativeLanguage(baselineComparison)) {
    if (!deterministicComparison) {
      const fallback = createFallbackDiveInsight({
        recap: input.recapFallback ?? insight.recap,
        baselineComparison:
          'Baseline exists but metrics are insufficient for depth/duration/gas-efficiency comparison.',
      });
      return fallback;
    }
    baselineComparison = deterministicComparison.text;
    evidence = Array.from(new Set([...evidence, ...deterministicComparison.evidence]));
  }

  if (!text || text.trim().length === 0) {
    text = NO_MEANINGFUL_INSIGHT_TEXT;
  }

  const recommendations = filterRecommendations(insight.recommendations, signals, metrics);

  return {
    recap: insight.recap,
    dive_insight: {
      text,
      baseline_comparison: baselineComparison,
      evidence,
    },
    recommendations,
  };
}

export function formatDiveInsightForStorage(insight: DiveInsightResponse): string {
  const evidenceText =
    insight.dive_insight.evidence.length > 0 ? insight.dive_insight.evidence.join(', ') : 'None';

  const recommendationText =
    insight.recommendations === NO_SPECIFIC_RECOMMENDATIONS
      ? NO_SPECIFIC_RECOMMENDATIONS
      : insight.recommendations.map((item) => `- ${item.action}: ${item.rationale}`).join('\n');

  return `Recap:\n${insight.recap}\n\nDive Insight:\n${insight.dive_insight.text}\n\nBaseline Comparison:\n${insight.dive_insight.baseline_comparison}\n\nEvidence:\n${evidenceText}\n\nRecommendations:\n${recommendationText}`;
}
