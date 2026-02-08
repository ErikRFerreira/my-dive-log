import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getCurrentUserIdMock, supabaseFromMock, storageFromMock, removeMock } = vi.hoisted(() => ({
  getCurrentUserIdMock: vi.fn(),
  supabaseFromMock: vi.fn(),
  storageFromMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock('./apiAuth', () => ({
  getCurrentUserId: getCurrentUserIdMock,
}));

vi.mock('./supabase', () => ({
  supabase: {
    from: supabaseFromMock,
    storage: {
      from: storageFromMock,
    },
  },
}));

import { deleteDive } from './apiDives';

type MockQueryResult = { data?: unknown; error?: { message: string } | null };

function makeEqChain(finalResult: Promise<MockQueryResult>) {
  const secondEq = vi.fn().mockReturnValue(finalResult);
  const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
  return { firstEq, secondEq };
}

describe('services/apiDives.deleteDive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserIdMock.mockResolvedValue('user-1');
    storageFromMock.mockReturnValue({ remove: removeMock });
    removeMock.mockResolvedValue({ error: null });
  });

  it('deletes dive photos from storage and then deletes dive records', async () => {
    const selectChain = makeEqChain(
      Promise.resolve({
        data: [
          { storage_path: 'user-1/dives/dive-1/p1.jpg' },
          { storage_path: 'user-1/dives/dive-1/p1.jpg' },
          { storage_path: 'user-1/dives/dive-1/p2.jpg' },
        ],
        error: null,
      })
    );
    const deletePhotosChain = makeEqChain(Promise.resolve({ error: null }));
    const deleteDiveChain = makeEqChain(Promise.resolve({ error: null }));

    supabaseFromMock.mockImplementation((table: string) => {
      if (table === 'dive_photos') {
        return {
          select: vi.fn().mockReturnValue({ eq: selectChain.firstEq }),
          delete: vi.fn().mockReturnValue({ eq: deletePhotosChain.firstEq }),
        };
      }
      if (table === 'dives') {
        return {
          delete: vi.fn().mockReturnValue({ eq: deleteDiveChain.firstEq }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(deleteDive('dive-1')).resolves.toBe(true);

    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith(['user-1/dives/dive-1/p1.jpg', 'user-1/dives/dive-1/p2.jpg']);
    expect(deletePhotosChain.firstEq).toHaveBeenCalledWith('dive_id', 'dive-1');
    expect(deletePhotosChain.secondEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(deleteDiveChain.firstEq).toHaveBeenCalledWith('id', 'dive-1');
    expect(deleteDiveChain.secondEq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('throws and aborts dive deletion when storage removal fails', async () => {
    const selectChain = makeEqChain(
      Promise.resolve({
        data: [{ storage_path: 'user-1/dives/dive-1/p1.jpg' }],
        error: null,
      })
    );
    const deletePhotosChain = makeEqChain(Promise.resolve({ error: null }));
    const deleteDiveChain = makeEqChain(Promise.resolve({ error: null }));

    supabaseFromMock.mockImplementation((table: string) => {
      if (table === 'dive_photos') {
        return {
          select: vi.fn().mockReturnValue({ eq: selectChain.firstEq }),
          delete: vi.fn().mockReturnValue({ eq: deletePhotosChain.firstEq }),
        };
      }
      if (table === 'dives') {
        return {
          delete: vi.fn().mockReturnValue({ eq: deleteDiveChain.firstEq }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    removeMock.mockResolvedValue({ error: { message: 'Storage remove failed' } });

    await expect(deleteDive('dive-1')).rejects.toMatchObject({ message: 'Storage remove failed' });
    expect(deletePhotosChain.firstEq).not.toHaveBeenCalled();
    expect(deleteDiveChain.firstEq).not.toHaveBeenCalled();
  });

  it('deletes dive even when it has no photos', async () => {
    const selectChain = makeEqChain(Promise.resolve({ data: [], error: null }));
    const deletePhotosChain = makeEqChain(Promise.resolve({ error: null }));
    const deleteDiveChain = makeEqChain(Promise.resolve({ error: null }));

    supabaseFromMock.mockImplementation((table: string) => {
      if (table === 'dive_photos') {
        return {
          select: vi.fn().mockReturnValue({ eq: selectChain.firstEq }),
          delete: vi.fn().mockReturnValue({ eq: deletePhotosChain.firstEq }),
        };
      }
      if (table === 'dives') {
        return {
          delete: vi.fn().mockReturnValue({ eq: deleteDiveChain.firstEq }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    await expect(deleteDive('dive-1')).resolves.toBe(true);
    expect(removeMock).not.toHaveBeenCalled();
    expect(deletePhotosChain.firstEq).toHaveBeenCalledWith('dive_id', 'dive-1');
    expect(deleteDiveChain.firstEq).toHaveBeenCalledWith('id', 'dive-1');
  });
});
