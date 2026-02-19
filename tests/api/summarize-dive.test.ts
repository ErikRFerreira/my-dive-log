import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockVercelResponse } from './testUtils/mockVercelResponse';

const {
  getSupabaseEnvMock,
  getBearerTokenMock,
  verifySupabaseTokenMock,
  groqCreateMock,
} = vi.hoisted(() => ({
  getSupabaseEnvMock: vi.fn(),
  getBearerTokenMock: vi.fn(),
  verifySupabaseTokenMock: vi.fn(),
  groqCreateMock: vi.fn(),
}));

vi.mock('../../src/server/auth.js', () => ({
  getSupabaseEnv: getSupabaseEnvMock,
  getBearerToken: getBearerTokenMock,
  verifySupabaseToken: verifySupabaseTokenMock,
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

describe('api/summarize-dive', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getSupabaseEnvMock.mockReturnValue({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key',
    });
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

  it('uses nested location fields and renders deterministic section output', async () => {
    getBearerTokenMock.mockReturnValue('valid-token');
    verifySupabaseTokenMock.mockResolvedValue({ user: { id: 'user-1' } });

    groqCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary:
                'Dove Zapote, Mexico on 2026-02-06 to 25 m for 40 minutes in cold conditions.',
              similar_locations: 'Freshwater cave systems and cenote environments.',
              tips:
                'Monitor thermal comfort closely and maintain buoyancy to avoid contact with cave formations.',
              future_practice: 'Practice cave line and light communication drills in overhead environments.',
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
      },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(verifySupabaseTokenMock).toHaveBeenCalledWith('valid-token');
    expect(groqCreateMock).toHaveBeenCalledTimes(1);

    const createArgs = groqCreateMock.mock.calls[0][0];
    const userPrompt = createArgs.messages[1].content as string;

    expect(createArgs.response_format).toEqual({ type: 'json_object' });
    expect(createArgs.temperature).toBe(0.2);
    expect(createArgs.max_tokens).toBe(260);
    expect(userPrompt).toContain('- Location: Zapote, Mexico');
    expect(userPrompt).toContain('- Dive type: Cave');
    expect(userPrompt).toContain(
      'High-confidence inference: this was likely a freshwater overhead cave environment.'
    );
    expect(userPrompt).not.toContain(
      'High-confidence inference: this environment is likely a cenote.'
    );

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({
      summary:
        'Summary:\nDove Zapote, Mexico on 2026-02-06 to 25 m for 40 minutes in cold conditions.\n\nSimilar locations:\nFreshwater cave systems and cenote environments.\n\nTips:\nMonitor thermal comfort closely and maintain buoyancy to avoid contact with cave formations.\n\nFuture practice:\nPractice cave line and light communication drills in overhead environments.',
    });
  });

  it('falls back to default sections when model omits keys', async () => {
    getBearerTokenMock.mockReturnValue('valid-token');
    verifySupabaseTokenMock.mockResolvedValue({ user: { id: 'user-1' } });

    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ summary: 'Brief recap.' }) } }],
    });

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: { dive: { location: 'Blue Hole' } },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({
      summary:
        'Summary:\nBrief recap.\n\nSimilar locations:\nNot enough information to suggest similar environments.\n\nTips:\nNo specific tips for this dive.\n\nFuture practice:\nNo specific recommendations.',
    });
  });

  it('uses raw content as summary fallback when model output is not JSON', async () => {
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
    expect(res.jsonBody).toEqual({
      summary:
        'Summary:\nRaw fallback summary line.\n\nSimilar locations:\nNot enough information to suggest similar environments.\n\nTips:\nNo specific tips for this dive.\n\nFuture practice:\nNo specific recommendations.',
    });
  });
});
