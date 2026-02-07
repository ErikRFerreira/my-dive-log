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

vi.mock('../utils/auth', () => ({
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

import handler from '../summarize-dive';

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

  it('returns 200 with summary when request is authenticated', async () => {
    getBearerTokenMock.mockReturnValue('valid-token');
    verifySupabaseTokenMock.mockResolvedValue({
      user: { id: 'user-1' },
    });
    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: 'Summary:\nCalm dive with good visibility.' } }],
    });

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: {
        dive: {
          location: 'Blue Hole',
          country: 'PT',
          date: '2026-02-01',
          depth: 20,
          duration: 45,
          notes: 'Calm current',
        },
      },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(verifySupabaseTokenMock).toHaveBeenCalledWith('valid-token');
    expect(groqCreateMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({ summary: 'Summary:\nCalm dive with good visibility.' });
  });
});
