import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockVercelResponse } from './testUtils/mockVercelResponse';

const {
  getSupabaseEnvMock,
  getBearerTokenMock,
  verifySupabaseTokenMock,
} = vi.hoisted(() => ({
  getSupabaseEnvMock: vi.fn(),
  getBearerTokenMock: vi.fn(),
  verifySupabaseTokenMock: vi.fn(),
}));

vi.mock('../../src/server/auth', () => ({
  getSupabaseEnv: getSupabaseEnvMock,
  getBearerToken: getBearerTokenMock,
  verifySupabaseToken: verifySupabaseTokenMock,
}));

import handler from '../../api/geocode-location';

describe('api/geocode-location', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NOMINATIM_USER_AGENT = 'DiveLogTest/1.0 (test@example.com)';

    getSupabaseEnvMock.mockReturnValue({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NOMINATIM_USER_AGENT;
  });

  it('returns 401 when request is missing Authorization bearer token', async () => {
    getBearerTokenMock.mockReturnValue(null);

    const req = {
      method: 'POST',
      headers: {},
      body: { name: 'Blue Lagoon', country_code: 'PT' },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(401);
    expect(res.jsonBody).toEqual({ error: 'Missing Authorization bearer token' });
  });

  it('returns 200 with coordinates when request is authenticated', async () => {
    getBearerTokenMock.mockReturnValue('valid-token');
    verifySupabaseTokenMock.mockResolvedValue({
      user: { id: 'user-1' },
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([{ lat: '38.7223', lon: '-9.1393' }]),
    });
    vi.stubGlobal('fetch', fetchMock);

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: { name: 'Blue Lagoon', country_code: 'PT' },
    };
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(verifySupabaseTokenMock).toHaveBeenCalledWith('valid-token');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({ lat: 38.7223, lng: -9.1393 });
  });
});
