import DivePage from '@/pages/Dive';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Dive as DiveType } from '@/features/dives/types';
import type { ReactNode } from 'react';

const navigateMock = vi.fn();
const deleteDiveMock = vi.fn();
const refetchMock = vi.fn();

const mockDive: DiveType = {
  id: 'dive-123',
  user_id: 'user-1',
  location_id: 'loc-1',
  date: '2025-01-15',
  depth: 25,
  duration: 45,
  water_temp: 28,
  visibility: 'good',
  dive_type: 'reef',
  water_type: 'salt',
  exposure: 'wet-5mm',
  currents: 'mild',
  weight: 4,
  gas: 'air',
  nitrox_percent: null,
  start_pressure: 200,
  end_pressure: 50,
  air_usage: 150,
  cylinder_type: 'aluminum',
  cylinder_size: 80,
  equipment: ['BCD'],
  wildlife: ['Sea Turtle'],
  notes: 'Nice dive',
  summary: 'Great visibility',
  cover_photo_path: null,
  created_at: '2025-01-15T10:00:00Z',
  locations: {
    id: 'loc-1',
    name: 'Great Barrier Reef',
    country: 'Australia',
    country_code: 'AU',
  },
};

type GetDiveState = {
  dive: DiveType | null;
  isLoading: boolean;
  error: Error | null;
  coverPhotoUrl: string | null;
  refetch: typeof refetchMock;
};

let getDiveState: GetDiveState = {
  dive: mockDive,
  isLoading: false,
  error: null,
  coverPhotoUrl: null,
  refetch: refetchMock,
};

let isDeleting = false;

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@/features/dives/hooks/useGetDive', () => ({
  useGetDive: () => getDiveState,
}));

vi.mock('@/features/dives/hooks/useDeleteDive', () => ({
  useDeleteDive: () => ({
    mutateAsync: deleteDiveMock,
    isPending: isDeleting,
  }),
}));

vi.mock('@/components/common/Loading', () => ({
  default: () => <div>Loading state</div>,
}));

vi.mock('@/components/ui/GoBack', () => ({
  default: () => <button type="button">Go back</button>,
}));

vi.mock('@/components/common/QueryErrorFallback', () => ({
  default: ({ title, onRetry }: { title: string; onRetry?: () => void }) => (
    <div>
      <p>{title}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock('@/components/common/InlineError', () => ({
  default: ({ message }: { message: string }) => <p>{message}</p>,
}));

vi.mock('@/features/dives/components/DiveHeader', () => ({
  default: ({
    isEditing,
    onEdit,
    onSave,
    onCancel,
    onOpenDeleteModal,
  }: {
    isEditing: boolean;
    onEdit: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    onOpenDeleteModal: () => void;
  }) => (
    <div>
      {!isEditing ? (
        <button type="button" onClick={onEdit}>
          Edit Dive
        </button>
      ) : (
        <>
          <button type="button" onClick={onSave}>
            Save
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </>
      )}
      <button type="button" onClick={onOpenDeleteModal}>
        Open Delete
      </button>
    </div>
  ),
}));

vi.mock('@/features/dives/components/DeleteDiveModal', () => ({
  default: ({
    isOpen,
    location,
    onCancel,
    onConfirm,
  }: {
    isOpen: boolean;
    location: string;
    onCancel: () => void;
    onConfirm: () => void;
  }) =>
    isOpen ? (
      <div>
        <p>Delete modal: {location}</p>
        <button type="button" onClick={onConfirm}>
          Confirm Delete
        </button>
        <button type="button" onClick={onCancel}>
          Cancel Delete
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/dives/components/DiveEditFormProvider', () => ({
  default: ({
    children,
  }: {
    children: (
      onSave: () => void,
      onCancel: () => void,
      saveError: string | null,
      isPending: boolean
    ) => ReactNode;
  }) => (
    <div>
      <p>Edit Provider Active</p>
      {children(vi.fn(), vi.fn(), 'Mock save error', false)}
    </div>
  ),
}));

vi.mock('@/features/dives/components/DiveStats', () => ({
  default: () => <div>Stats</div>,
}));

vi.mock('@/features/dives/components/DiveGallery', () => ({
  default: () => <div>Gallery</div>,
}));

vi.mock('@/features/dives/components/DiveInformation', () => ({
  default: () => <div>Information</div>,
}));

vi.mock('@/features/dives/components/DiveNotes', () => ({
  default: () => <div>Notes</div>,
}));

vi.mock('@/features/dives/components/GasUsage', () => ({
  default: () => <div>Gas Usage</div>,
}));

vi.mock('@/features/dives/components/DiveEquipment', () => ({
  default: () => <div>Equipment</div>,
}));

vi.mock('@/features/dives/components/DiveWildlife', () => ({
  default: () => <div>Wildlife</div>,
}));

vi.mock('@/features/dives/components/DiveBackground', () => ({
  default: () => <div>Background</div>,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Dive Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDiveState = {
      dive: mockDive,
      isLoading: false,
      error: null,
      coverPhotoUrl: null,
      refetch: refetchMock,
    };
    isDeleting = false;
    deleteDiveMock.mockResolvedValue(undefined);
  });

  it('renders loading state', () => {
    getDiveState = { ...getDiveState, isLoading: true };
    render(<DivePage />, { wrapper: createWrapper() });
    expect(screen.getByText('Loading state')).toBeInTheDocument();
  });

  it('renders error fallback and retries', () => {
    getDiveState = { ...getDiveState, error: new Error('boom') };
    render(<DivePage />, { wrapper: createWrapper() });

    expect(screen.getByText(/failed to load dive/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('renders not found state when dive is null', () => {
    getDiveState = { ...getDiveState, dive: null };
    render(<DivePage />, { wrapper: createWrapper() });
    expect(screen.getByText(/dive not found/i)).toBeInTheDocument();
  });

  it('enters edit mode and shows provider-driven save error', () => {
    render(<DivePage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: /edit dive/i }));

    expect(screen.getByText('Edit Provider Active')).toBeInTheDocument();
    expect(screen.getByText('Mock save error')).toBeInTheDocument();
  });

  it('opens delete modal and deletes dive then navigates', async () => {
    render(<DivePage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: /open delete/i }));
    expect(screen.getByText(/delete modal: great barrier reef/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));

    await waitFor(() => {
      expect(deleteDiveMock).toHaveBeenCalledWith('dive-123');
      expect(navigateMock).toHaveBeenCalledWith('/dives');
    });
  });

  it('does not navigate when delete fails', async () => {
    deleteDiveMock.mockRejectedValueOnce(new Error('delete failed'));
    render(<DivePage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: /open delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));

    await waitFor(() => {
      expect(deleteDiveMock).toHaveBeenCalledWith('dive-123');
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
