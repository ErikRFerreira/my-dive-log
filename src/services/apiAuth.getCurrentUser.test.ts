import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getUserMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getUser: getUserMock,
    },
  },
}));

import { getCurrentUser } from './apiAuth';

describe('services/apiAuth.getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when Supabase reports a missing auth session', async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error('Auth session missing!'),
    });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('returns null when Supabase reports an expired JWT', async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error('JWT expired'),
    });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('returns null when Supabase reports an invalid JWT', async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid JWT'),
    });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('throws when the auth service is unavailable', async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error('Failed to fetch'),
    });

    await expect(getCurrentUser()).rejects.toThrow('Failed to fetch');
  });

  it('returns the authenticated user when Supabase succeeds', async () => {
    const user = { id: 'user-1', email: 'test@example.com' };
    getUserMock.mockResolvedValue({
      data: { user },
      error: null,
    });

    await expect(getCurrentUser()).resolves.toEqual(user);
  });
});
