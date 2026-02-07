import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Profile from '@/pages/Profile';

vi.mock('@/features/authentication', () => ({
  useUser: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

vi.mock('@/features/profile/hooks/useGetProfile', () => ({
  useGetProfile: () => ({
    profile: null,
    isLoading: false,
    isFetching: false,
    isError: true,
    error: new Error('Profile failed'),
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/profile/hooks/useUpsertProfile', () => ({
  useUpsertProfile: () => ({
    isPending: false,
    mutateUpsert: vi.fn(),
  }),
}));

vi.mock('@/features/dives/hooks/useGetDives', () => ({
  useGetDives: () => ({
    dives: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/features/profile', () => ({
  CarrerStatistics: () => <div>Stats</div>,
  ProfileInformation: () => <div>Info</div>,
}));

vi.mock('@/features/profile/components/Certification', () => ({
  default: () => <div>Cert</div>,
}));

vi.mock('@/features/dashboard/components/DepthChart', () => ({
  default: () => <div>DepthChart</div>,
}));

vi.mock('@/features/dashboard/components/DurationChart', () => ({
  default: () => <div>DurationChart</div>,
}));

describe('Profile page', () => {
  it('shows an inline error when profile data fails to load', () => {
    render(<Profile />);
    expect(screen.getByRole('alert')).toHaveTextContent(/profile failed/i);
  });
});
