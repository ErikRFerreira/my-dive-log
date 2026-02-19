import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockVercelResponse } from './testUtils/mockVercelResponse';

const {
  getSupabaseEnvMock,
  getBearerTokenMock,
  verifySupabaseTokenMock,
  createClientMock,
} = vi.hoisted(() => ({
  getSupabaseEnvMock: vi.fn(),
  getBearerTokenMock: vi.fn(),
  verifySupabaseTokenMock: vi.fn(),
  createClientMock: vi.fn(),
}));

vi.mock('../../src/server/auth.js', () => ({
  getSupabaseEnv: getSupabaseEnvMock,
  getBearerToken: getBearerTokenMock,
  verifySupabaseToken: verifySupabaseTokenMock,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));

import handler from '../../api/delete-account';

function makeRequest(method: string, body: unknown = {}) {
  return {
    method,
    headers: { origin: 'http://localhost:5173', authorization: 'Bearer valid-token' },
    body,
  };
}

function folderEntry(name: string) {
  return { name, id: null, metadata: null };
}

function fileEntry(name: string) {
  return { name, id: `id-${name}`, metadata: { size: 1234 } };
}

describe('api/delete-account', () => {
  const userId = 'user-123';
  let listMock: ReturnType<typeof vi.fn>;
  let removeMock: ReturnType<typeof vi.fn>;
  let storageFromMock: ReturnType<typeof vi.fn>;
  let divesEqMock: ReturnType<typeof vi.fn>;
  let locationsEqMock: ReturnType<typeof vi.fn>;
  let profilesEqMock: ReturnType<typeof vi.fn>;
  let deleteUserMock: ReturnType<typeof vi.fn>;
  let fromTableMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    getSupabaseEnvMock.mockReturnValue({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key',
    });
    getBearerTokenMock.mockReturnValue('valid-token');
    verifySupabaseTokenMock.mockResolvedValue({ user: { id: userId } });
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    listMock = vi.fn().mockResolvedValue({ data: [], error: null });
    removeMock = vi.fn().mockResolvedValue({ error: null });
    storageFromMock = vi.fn().mockReturnValue({
      list: listMock,
      remove: removeMock,
    });

    divesEqMock = vi.fn().mockResolvedValue({ error: null });
    locationsEqMock = vi.fn().mockResolvedValue({ error: null });
    profilesEqMock = vi.fn().mockResolvedValue({ error: null });
    deleteUserMock = vi.fn().mockResolvedValue({ error: null });

    fromTableMock = vi.fn((table: string) => {
      if (table === 'dives') return { delete: vi.fn().mockReturnValue({ eq: divesEqMock }) };
      if (table === 'locations') return { delete: vi.fn().mockReturnValue({ eq: locationsEqMock }) };
      if (table === 'profiles') return { delete: vi.fn().mockReturnValue({ eq: profilesEqMock }) };
      throw new Error(`Unexpected table: ${table}`);
    });

    createClientMock.mockReturnValue({
      storage: { from: storageFromMock },
      from: fromTableMock,
      auth: { admin: { deleteUser: deleteUserMock } },
    });
  });

  it('returns 200 and deletes account when no storage files exist', async () => {
    const req = makeRequest('POST');
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({ ok: true });
    expect(listMock).toHaveBeenCalledWith(`${userId}`, { limit: 1000, offset: 0 });
    expect(removeMock).not.toHaveBeenCalled();
    expect(divesEqMock).toHaveBeenCalledWith('user_id', userId);
    expect(locationsEqMock).toHaveBeenCalledWith('user_id', userId);
    expect(profilesEqMock).toHaveBeenCalledWith('id', userId);
    expect(deleteUserMock).toHaveBeenCalledWith(userId);
  });

  it('deletes storage files before deleting DB/auth records', async () => {
    listMock
      .mockResolvedValueOnce({
        data: [folderEntry('dives')],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [folderEntry('dive-a'), folderEntry('dive-b')],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [fileEntry('p1.jpg')],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [fileEntry('p2.jpg')],
        error: null,
      });

    const req = makeRequest('POST');
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith(
      expect.arrayContaining([`${userId}/dives/dive-a/p2.jpg`, `${userId}/dives/dive-b/p1.jpg`])
    );
    const removeCallOrder = removeMock.mock.invocationCallOrder[0];
    const divesFromCallIndex = fromTableMock.mock.calls.findIndex((call) => call[0] === 'dives');
    const divesFromCallOrder = fromTableMock.mock.invocationCallOrder[divesFromCallIndex];
    expect(removeCallOrder).toBeLessThan(divesFromCallOrder);
  });

  it('returns 500 and aborts DB/auth deletion when storage list fails', async () => {
    listMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'Storage list failed' },
    });

    const req = makeRequest('POST');
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(500);
    expect(res.jsonBody).toEqual({ error: 'Failed to list dive photos: Storage list failed' });
    expect(removeMock).not.toHaveBeenCalled();
    expect(fromTableMock).not.toHaveBeenCalled();
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it('returns 500 and aborts DB/auth deletion when storage remove fails', async () => {
    listMock
      .mockResolvedValueOnce({
        data: [folderEntry('dives')],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [fileEntry('p1.jpg')],
        error: null,
      });
    removeMock.mockResolvedValueOnce({
      error: { message: 'Storage remove failed' },
    });

    const req = makeRequest('POST');
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(500);
    expect(res.jsonBody).toEqual({ error: 'Failed to remove dive photos: Storage remove failed' });
    expect(fromTableMock).not.toHaveBeenCalled();
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it('handles multiple pages of storage objects', async () => {
    listMock
      .mockResolvedValueOnce({
        data: Array.from({ length: 1000 }, (_, i) => fileEntry(`p${i}.jpg`)),
        error: null,
      })
      .mockResolvedValueOnce({
        data: Array.from({ length: 1000 }, (_, i) => fileEntry(`p${i + 1000}.jpg`)),
        error: null,
      })
      .mockResolvedValueOnce({
        data: [fileEntry('final.jpg')],
        error: null,
      });

    const req = makeRequest('POST');
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(listMock).toHaveBeenCalledTimes(3);
    expect(removeMock).toHaveBeenCalledTimes(3);
    expect(deleteUserMock).toHaveBeenCalledWith(userId);
  });

  it('returns 401 when request is missing Authorization bearer token', async () => {
    getBearerTokenMock.mockReturnValue(null);

    const req = makeRequest('POST');
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(401);
    expect(res.jsonBody).toEqual({ error: 'Missing Authorization bearer token' });
  });

  it('returns 500 when Supabase env is invalid', async () => {
    getSupabaseEnvMock.mockReturnValue({ error: 'Missing Supabase URL environment variable' });

    const req = makeRequest('POST');
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(500);
    expect(res.jsonBody).toEqual({ error: 'Missing Supabase URL environment variable' });
  });

  it('returns 405 for unsupported methods', async () => {
    const req = makeRequest('GET');
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(405);
    expect(res.jsonBody).toEqual({ error: 'Method not allowed' });
  });

  it('returns 200 for OPTIONS preflight without auth', async () => {
    getBearerTokenMock.mockReturnValue(null);

    const req = makeRequest('OPTIONS');
    const res = createMockVercelResponse();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.ended).toBe(true);
  });
});
