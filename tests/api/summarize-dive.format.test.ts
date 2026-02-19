import { describe, expect, it } from 'vitest';
import {
  createFallbackDiveInsight,
  enforceDiveInsightPolicy,
  parseDiveInsightResponse,
} from '../../src/server/summarize-dive/format';
import { computeEstimatedRMV } from '../../src/server/summarize-dive/metrics';
import type { ComputedMetrics, DiverProfile } from '../../src/server/summarize-dive/types';

describe('parseDiveInsightResponse', () => {
  it('accepts a valid strict response', () => {
    const raw = JSON.stringify({
      recap: 'Dive reached 24 m for 42 minutes.',
      dive_insight: {
        text: 'Depth and conditions indicate elevated task loading compared with nearby dives.',
        baseline_comparison: 'Deeper than your average by ~6 m.',
        evidence: ['metric: depthComparedToAverage', 'signal: current_load'],
      },
      recommendations: [
        {
          action: 'Brief team gas planning targets before similar current-heavy dives.',
          rationale: 'Supported by current_load signal and depth baseline delta.',
        },
      ],
    });

    const result = parseDiveInsightResponse(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.dive_insight.baseline_comparison).toContain('Deeper than your average');
      expect(Array.isArray(result.data.recommendations)).toBe(true);
    }
  });

  it('returns fallback payload when response is not JSON', () => {
    const result = parseDiveInsightResponse('plain-text output');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Model response is not valid JSON');
      expect(result.fallback.dive_insight.text).toBe(
        'Not enough information for a meaningful insight beyond the recap.'
      );
      expect(result.fallback.recommendations).toBe('No specific recommendations.');
    }
  });

  it('rejects recap longer than two sentences', () => {
    const raw = JSON.stringify({
      recap: 'Sentence one. Sentence two. Sentence three.',
      dive_insight: {
        text: 'Some text.',
        baseline_comparison: 'Deeper than your average by ~2 m.',
        evidence: [],
      },
      recommendations: 'No specific recommendations.',
    });

    const result = parseDiveInsightResponse(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('recap must be 2 sentences or fewer');
    }
  });
});

describe('computeEstimatedRMV', () => {
  it('computes RMV with deterministic inputs', () => {
    // 100 bar used from 12L cylinder -> 1200L consumed.
    // Avg depth 20m -> 3 ATA. Duration 40 min -> RMV = 1200 / (3*40) = 10.0 L/min.
    expect(computeEstimatedRMV({ gasUsedBar: 100, cylinderSizeLiters: 12, averageDepthMeters: 20, durationMinutes: 40 })).toBe(10);
  });

  it('returns null for invalid inputs', () => {
    expect(
      computeEstimatedRMV({
        gasUsedBar: null,
        cylinderSizeLiters: 12,
        averageDepthMeters: 20,
        durationMinutes: 40,
      })
    ).toBeNull();
    expect(
      computeEstimatedRMV({
        gasUsedBar: 80,
        cylinderSizeLiters: 12,
        averageDepthMeters: -5,
        durationMinutes: 40,
      })
    ).toBeNull();
    expect(
      computeEstimatedRMV({
        gasUsedBar: 80,
        cylinderSizeLiters: 12,
        averageDepthMeters: 20,
        durationMinutes: 0,
      })
    ).toBeNull();
  });
});

describe('enforceDiveInsightPolicy', () => {
  const profileWithBaseline: DiverProfile = {
    certificationLevel: 'Rescue Diver',
    totalLoggedDives: 40,
    avgDepth: 20,
    avgDuration: 40,
    recentDives30d: 3,
    avgEstimatedRMV: 14,
  };

  const profileNoBaseline: DiverProfile = {
    certificationLevel: null,
    totalLoggedDives: 2,
    avgDepth: null,
    avgDuration: null,
    recentDives30d: 2,
    avgEstimatedRMV: null,
  };

  const metrics: ComputedMetrics = {
    estimatedRMV: 12,
    depthComparedToAverage: 'Deeper than your average by ~4 m.',
    durationComparedToAverage: null,
    gasEfficiencyComparedToAverage: null,
  };

  it('injects deterministic comparison when baseline exists and comparison is weak', () => {
    const result = enforceDiveInsightPolicy(
      {
        recap: 'Dive recap.',
        dive_insight: {
          text: 'Solid effort.',
          baseline_comparison: 'Good dive.',
          evidence: [],
        },
        recommendations: 'No specific recommendations.',
      },
      {
        profile: profileWithBaseline,
        metrics,
        signals: [],
      }
    );

    expect(result.dive_insight.baseline_comparison).toBe('Deeper than your average by ~4 m.');
    expect(result.dive_insight.evidence).toContain('deterministic baseline comparison');
  });

  it('forces no-baseline phrase when baseline data is unavailable', () => {
    const result = enforceDiveInsightPolicy(
      {
        recap: 'Dive recap.',
        dive_insight: {
          text: 'Solid effort.',
          baseline_comparison: 'Deeper than your average by ~4 m.',
          evidence: [],
        },
        recommendations: 'No specific recommendations.',
      },
      {
        profile: profileNoBaseline,
        metrics,
        signals: [],
      }
    );

    expect(result.dive_insight.baseline_comparison).toBe(
      'No historical baseline available for comparison.'
    );
  });
});

describe('createFallbackDiveInsight', () => {
  it('returns safe fallback shape', () => {
    expect(createFallbackDiveInsight({ recap: 'Deterministic recap.' })).toEqual({
      recap: 'Deterministic recap.',
      dive_insight: {
        text: 'Not enough information for a meaningful insight beyond the recap.',
        baseline_comparison: 'No historical baseline available for comparison.',
        evidence: [],
      },
      recommendations: 'No specific recommendations.',
    });
  });
});
