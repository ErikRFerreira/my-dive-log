import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUploadDivePhoto } from './useUploadDivePhoto';

const { mockUploadDivePhotoToBucket, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockUploadDivePhotoToBucket: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('@/services/apiDivePhotos', () => ({
  uploadDivePhotoToBucket: mockUploadDivePhotoToBucket,
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useUploadDivePhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows one success toast for a successful upload', async () => {
    mockUploadDivePhotoToBucket.mockResolvedValue('dives/dive-1/photo.jpg');

    const { result } = renderHook(() => useUploadDivePhoto(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        diveId: 'dive-1',
        file: new File(['x'], 'photo.jpg', { type: 'image/jpeg' }),
      });
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    });
    expect(mockToastSuccess).toHaveBeenCalledWith('Photo uploaded successfully');
    expect(mockToastError).not.toHaveBeenCalled();
  });
});
