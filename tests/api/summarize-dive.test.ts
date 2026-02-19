import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockVercelResponse } from './testUtils/mockVercelResponse';
import { MODEL, PROMPT_VERSION } from '../../src/server/summarize-dive/constants';
import { computeDiveMetrics } from '../../src/server/summarize-dive/metrics';
import { normalizeDiveContext, normalizeDiverProfile } from '../../src/server/summarize-dive/normalize';
import { extractSignals } from '../../src/server/summarize-dive/signals';

const {
  getSupabaseEnvMock,
  getBearerTokenMock,
  verifySupabaseTokenMock,
  createSupabaseUserClientMock,
  groqCreateMock,
  supabaseMaybeSingleMock,
  supabaseUpdateMock,
} = vi.hoisted(() => {
  const supabaseMaybeSingleMock = vi.fn();
  const supabaseUpdateMock = vi.fn();

  const supabaseClient = {
    from: vi.fn((table: string) => {
      if (table !== 'dives') throw new Error(`Unexpected table ${table}`);

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: supabaseMaybeSingleMock,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => supabaseUpdateMock()),
          })),
        })),
      };
    }),
  };

  return {
    getSupabaseEnvMock: vi.fn(),
    getBearerTokenMock: vi.fn(),
    verifySupabaseTokenMock: vi.fn(),
    createSupabaseUserClientMock: vi.fn(() => supabaseClient),
    groqCreateMock: vi.fn(),
    supabaseMaybeSingleMock,
    supabaseUpdateMock,
  };
});

vi.mock('../../src/server/auth.js', () => ({
  getSupabaseEnv: getSupabaseEnvMock,
  getBearerToken: getBearerTokenMock,
  verifySupabaseToken: verifySupabaseTokenMock,
  createSupabaseUserClient: createSupabaseUserClientMock,
}));

vi.mock('groq-sdk', () => ({
  default: class GroqMock {
    chat = {
      completions: {
        create: groqCreateMock,
      },
    };
  },
}));

import handler from '../../api/summarize-dive';

function buildInputHash(payload: {
  dive: unknown;
  profile: unknown;
  metrics: unknown;
  signals: unknown;
}) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        ...payload,
        promptVersion: PROMPT_VERSION,
        model: MODEL,
      })
    )
    .digest('hex');
}

describe('api/summarize-dive', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getSupabaseEnvMock.mockReturnValue({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key',
    });
    supabaseMaybeSingleMock.mockResolvedValue({ data: { ai_summary: null }, error: null });
    supabaseUpdateMock.mockResolvedValue({ error: null });
  });

  it('returns 401 when request is missing Authorization bearer token', async () => {
    getBearerTokenMock.mockReturnValue(null);

    const req = {
      method: 'POST',
      headers: {},
      body: { dive: { location: 'Blue Hole' } },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(401);
    expect(res.jsonBody).toEqual({ error: 'Missing Authorization bearer token' });
  });

  it('builds prompt with profile/metrics and returns typed insight + meta', async () => {
    getBearerTokenMock.mockReturnValue('valid-token');
    verifySupabaseTokenMock.mockResolvedValue({ user: { id: 'user-1' } });

    groqCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              recap: 'Zapote, Mexico dive reached 25 m for 40 minutes.',
              dive_insight: {
                text: 'Cold overhead conditions suggest elevated task loading on this profile.',
                baseline_comparison: 'Deeper than your average by ~7 m.',
                evidence: ['metric: depthComparedToAverage', 'signal: overhead_environment'],
              },
              recommendations: [
                {
                  action: 'Repeat gas planning drill for cave profiles before next overhead dive.',
                  rationale:
                    'Justified by overhead environment and elevated depth relative to baseline.',
                },
              ],
            }),
          },
        },
      ],
    });

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        dive: {
          id: 'dive-1',
          locations: {
            name: 'Zapote',
            country: 'Mexico',
          },
          date: '2026-02-06',
          depth: 25,
          duration: 40,
          water_temp: 19,
          dive_type: 'cave',
          water_type: 'fresh',
          notes: 'Very cold but calm dive.',
        },
        profile: {
          cert_level: 'Rescue Diver',
          total_dives: 85,
          average_depth: 18,
          average_duration: 43,
          recent_dives_30d: 6,
        },
      },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(verifySupabaseTokenMock).toHaveBeenCalledWith('valid-token');
    expect(groqCreateMock).toHaveBeenCalledTimes(1);

    const createArgs = groqCreateMock.mock.calls[0][0];
    const userPrompt = createArgs.messages[1].content as string;

    expect(createArgs.response_format).toEqual({ type: 'json_object' });
    expect(createArgs.temperature).toBe(0.3);
    expect(createArgs.max_tokens).toBe(280);
    expect(userPrompt).toContain('Prompt version: dive-insight-v2');
    expect(userPrompt).toContain('"dive_insight"');
    expect(userPrompt).toContain('"baseline_comparison"');
    expect(userPrompt).toContain('"recommendations"');

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody.summary).toContain('Recap:');
    expect(res.jsonBody.summary).toContain('Dive Insight:');
    expect(res.jsonBody.summary).toContain('Baseline Comparison:');
    expect(res.jsonBody.summary).toContain('Recommendations:');
    expect(res.jsonBody.insight).toEqual({
      recap: 'Zapote, Mexico dive reached 25 m for 40 minutes.',
      dive_insight: {
        text: 'Cold overhead conditions suggest elevated task loading on this profile.',
        baseline_comparison: 'Deeper than your average by ~7 m.',
        evidence: ['metric: depthComparedToAverage', 'signal: overhead_environment'],
      },
      recommendations: [
        {
          action: 'Repeat gas planning drill for cave profiles before next overhead dive.',
          rationale: 'Justified by overhead environment and elevated depth relative to baseline.',
        },
      ],
    });
    expect(res.jsonBody.meta.cached).toBe(false);
    expect(res.jsonBody.meta.model).toBe(MODEL);
    expect(res.jsonBody.meta.promptVersion).toBe(PROMPT_VERSION);
    expect(typeof res.jsonBody.meta.generatedAt).toBe('string');
  });

  it('returns cached insight when input hash matches and regenerate is false', async () => {
    getBearerTokenMock.mockReturnValue('valid-token');
    verifySupabaseTokenMock.mockResolvedValue({ user: { id: 'user-1' } });

    const divePayload = {
      id: 'dive-123',
      locations: { name: 'Blue Hole', country: 'Belize' },
      date: '2026-02-09',
      depth: 28,
      duration: 38,
      dive_type: 'reef',
    };
    const profilePayload = {
      cert_level: 'Advanced Open Water',
      total_dives: 120,
      average_depth: 23,
      average_duration: 42,
      recent_dives_30d: 4,
    };

    const context = normalizeDiveContext(divePayload);
    const profile = normalizeDiverProfile(profilePayload);
    const metrics = computeDiveMetrics(context, profile);
    const signals = extractSignals(context, profile, metrics);

    const cachedInsight = {
      recap: 'Blue Hole dive reached 28 m for 38 minutes.',
      dive_insight: {
        text: 'Profile shows moderate task load with typical conditions for this diver.',
        baseline_comparison: 'Deeper than your average by ~5 m.',
        evidence: ['metric: depthComparedToAverage'],
      },
      recommendations: 'No specific recommendations.' as const,
    };

    const stored = {
      promptVersion: PROMPT_VERSION,
      model: MODEL,
      inputHash: buildInputHash({
        dive: context,
        profile,
        metrics,
        signals,
      }),
      generatedAt: '2026-02-10T10:00:00.000Z',
      insight: cachedInsight,
      metrics,
      signals,
    };

    supabaseMaybeSingleMock.mockResolvedValue({
      data: { ai_summary: JSON.stringify(stored) },
      error: null,
    });

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: { dive: divePayload, profile: profilePayload },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(groqCreateMock).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody.insight).toEqual(cachedInsight);
    expect(res.jsonBody.meta).toEqual({
      cached: true,
      model: MODEL,
      promptVersion: PROMPT_VERSION,
      generatedAt: '2026-02-10T10:00:00.000Z',
    });
  });

  it('bypasses cache and regenerates when regenerate=true', async () => {
    getBearerTokenMock.mockReturnValue('valid-token');
    verifySupabaseTokenMock.mockResolvedValue({ user: { id: 'user-1' } });

    const divePayload = {
      id: 'dive-123',
      location: 'Blue Hole',
      country: 'Belize',
      date: '2026-02-09',
      depth: 28,
      duration: 38,
    };
    const profilePayload = {
      cert_level: 'Rescue Diver',
      total_dives: 120,
      average_depth: 23,
      average_duration: 42,
      recent_dives_30d: 4,
    };

    supabaseMaybeSingleMock.mockResolvedValue({
      data: {
        ai_summary: JSON.stringify({
          promptVersion: PROMPT_VERSION,
          model: MODEL,
          inputHash: 'same-hash',
          generatedAt: '2026-02-10T10:00:00.000Z',
          insight: {
            recap: 'Cached recap.',
            dive_insight: {
              text: 'Cached insight.',
              baseline_comparison: 'Cached baseline comparison.',
              evidence: [],
            },
            recommendations: 'No specific recommendations.',
          },
          metrics: {},
          signals: [],
        }),
      },
      error: null,
    });

    groqCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              recap: 'Freshly generated recap.',
              dive_insight: {
                text: 'Freshly generated insight.',
                baseline_comparison: 'Deeper than your average by ~5 m.',
                evidence: ['metric: depthComparedToAverage'],
              },
              recommendations: 'No specific recommendations.',
            }),
          },
        },
      ],
    });

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: { dive: divePayload, profile: profilePayload, regenerate: true },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(groqCreateMock).toHaveBeenCalledTimes(1);
    expect(supabaseUpdateMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody.meta.cached).toBe(false);
    expect(res.jsonBody.insight.recap).toBe('Freshly generated recap.');
  });

  it('falls back safely when model output is invalid JSON', async () => {
    getBearerTokenMock.mockReturnValue('valid-token');
    verifySupabaseTokenMock.mockResolvedValue({ user: { id: 'user-1' } });

    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: 'Raw fallback summary line.' } }],
    });

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: { dive: { location: 'Blue Hole' } },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody.insight.dive_insight.text).toBe(
      'Not enough information for a meaningful insight beyond the recap.'
    );
    expect(res.jsonBody.insight.recommendations).toBe('No specific recommendations.');
    expect(res.jsonBody.summary).toContain('Recap:\nDive logged at Blue Hole on an unknown date.');
  });
});
