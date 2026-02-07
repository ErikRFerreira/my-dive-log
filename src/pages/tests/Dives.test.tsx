import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Dives from '@/pages/Dives';

vi.mock('@/features/dives/hooks/useGetDives', () => ({
  useGetDives: () => ({
    dives: [],
    totalCount: 0,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/dives/hooks/useGetLocations', () => ({
  useGetLocations: () => ({
    locations: [],
    isLoading: false,
    isError: true,
    error: new Error('Locations failed'),
  }),
}));

vi.mock('@/features/dives/hooks/useDivesFilterController', () => ({
  useDivesFilterController: () => ({
    showFilters: false,
    sortBy: 'date',
    maxDepth: 40,
    currentPage: 1,
    searchQuery: '',
    locationId: null,
    country: null,
    toggleShowFilters: vi.fn(),
    setCurrentPage: vi.fn(),
    setPageAndSortBy: vi.fn(),
    setPageAndMaxDepth: vi.fn(),
    setPageAndSearchQuery: vi.fn(),
    setPageAndCountry: vi.fn(),
    setPageAndLocationId: vi.fn(),
    handleReset: vi.fn(),
    hasActiveFilters: false,
  }),
}));

vi.mock('@/features/dives/components/DivesFilter', () => ({
  default: () => <div>Filters</div>,
}));

vi.mock('@/features/dives/components/DiveList', () => ({
  default: () => <div>List</div>,
}));

describe('Dives page', () => {
  it('shows an inline error when locations fail to load', () => {
    render(<Dives />);
    expect(screen.getByRole('alert')).toHaveTextContent(/locations failed/i);
  });
});
