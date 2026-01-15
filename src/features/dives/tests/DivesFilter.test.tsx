import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import DivesFilter from '../components/DivesFilter';
import type { Location as DiveLocation } from '@/features/locations/';
import { DEFAULT_MAX_DEPTH, DEBOUNCE_DELAY } from '@/shared/constants';

// Mock locations data
const mockLocations: DiveLocation[] = [
  {
    id: 'loc-1',
    name: 'Great Barrier Reef',
    country: 'Australia',
    country_code: 'AU',
    lat: -18.2871,
    lng: 147.6992,
  },
  {
    id: 'loc-2',
    name: 'Blue Hole',
    country: 'Belize',
    country_code: 'BZ',
    lat: 17.3169,
    lng: -87.5364,
  },
  {
    id: 'loc-3',
    name: 'Bondi Beach',
    country: 'Australia',
    country_code: 'AU',
    lat: -33.8915,
    lng: 151.2767,
  },
];

describe('DivesFilter', () => {
  const defaultProps = {
    sortBy: 'date' as const,
    maxDepth: DEFAULT_MAX_DEPTH,
    locationId: null,
    locations: mockLocations,
    country: null,
    isLoadingLocations: false,
    showFilters: false,
    filteredCount: 10,
    totalCount: 10,
    searchQuery: '',
    onToggleFilters: vi.fn(),
    onSearchQueryChange: vi.fn(),
    onSortByChange: vi.fn(),
    onMaxDepthChange: vi.fn(),
    onCountryChange: vi.fn(),
    onLocationIdChange: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Toggle Filters', () => {
    it('should call onToggleFilters when Filters & Sort button is clicked', () => {
      render(<DivesFilter {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /filters & sort/i });
      fireEvent.click(toggleButton);

      expect(defaultProps.onToggleFilters).toHaveBeenCalledTimes(1);
    });

    it('should show filter panel when showFilters is true', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} />);

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(3); // Sort, Country, Location
    });

    it('should show filter panel when locationId is set even if showFilters is false', () => {
      render(<DivesFilter {...defaultProps} showFilters={false} locationId="loc-1" />);

      // Filter panel should be visible because locationId is set
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(3);
    });

    it('should hide filter panel when showFilters is false and no locationId', () => {
      render(<DivesFilter {...defaultProps} showFilters={false} />);

      expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    });
  });

  describe('Search Functionality', () => {
    it('should update search input value immediately without debounce', async () => {
      render(<DivesFilter {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search dives/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'reef' } });

      expect(searchInput.value).toBe('reef');
    });

    it('should debounce search query callback with minimum 4 characters', async () => {
      render(<DivesFilter {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search dives/i);

      // Type only 3 characters (less than minimum)
      fireEvent.change(searchInput, { target: { value: 'ree' } });

      // Fast-forward time
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      // Should NOT call callback with < 4 characters
      expect(defaultProps.onSearchQueryChange).not.toHaveBeenCalled();

      // Type one more character (reaches minimum)
      fireEvent.change(searchInput, { target: { value: 'reef' } });

      // Fast-forward time
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      // Should call callback now
      expect(defaultProps.onSearchQueryChange).toHaveBeenCalledWith('reef');
    });

    it('should clear search when X button is clicked', async () => {
      render(<DivesFilter {...defaultProps} searchQuery="reef" />);

      const clearButton = screen.getByLabelText(/clear search/i);
      fireEvent.click(clearButton);

      expect(defaultProps.onSearchQueryChange).toHaveBeenCalledWith('');
      expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
    });

    it('should debounce multiple rapid search inputs', async () => {
      render(<DivesFilter {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search dives/i);

      // Rapidly type multiple characters
      fireEvent.change(searchInput, { target: { value: 'great' } });
      vi.advanceTimersByTime(100); // Not enough time

      fireEvent.change(searchInput, { target: { value: 'great bar' } });
      vi.advanceTimersByTime(100); // Still not enough

      // Should not have called yet
      expect(defaultProps.onSearchQueryChange).not.toHaveBeenCalled();

      // Now wait the full debounce period
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      // Should only call once with final value
      expect(defaultProps.onSearchQueryChange).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSearchQueryChange).toHaveBeenCalledWith('great bar');
    });

    it('should trigger search immediately when clearing to empty string', async () => {
      render(<DivesFilter {...defaultProps} searchQuery="reef" />);

      const searchInput = screen.getByPlaceholderText(/search dives/i);

      // Clear the input
      fireEvent.change(searchInput, { target: { value: '' } });

      // Fast-forward time
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      // Should call with empty string
      expect(defaultProps.onSearchQueryChange).toHaveBeenCalledWith('');
    });
  });

  describe('Sort By Functionality', () => {
    it('should call onSortByChange when sort option is selected', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} />);

      const selects = screen.getAllByRole('combobox');
      const sortSelect = selects[0]; // First select is sort by
      fireEvent.change(sortSelect, { target: { value: 'depth' } });

      expect(defaultProps.onSortByChange).toHaveBeenCalledWith('depth');
    });

    it('should display all sort options', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} />);

      const selects = screen.getAllByRole('combobox');
      const sortSelect = selects[0] as HTMLSelectElement; // First select is sort by
      expect(sortSelect.value).toBe('date');

      // Check options exist
      expect(screen.getByRole('option', { name: /date \(newest\)/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /depth \(deepest\)/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /duration \(longest\)/i })).toBeInTheDocument();
    });
  });

  describe('Country and Location Filtering', () => {
    it('should display unique countries from locations', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} />);

      // Should have Australia and Belize
      expect(screen.getByRole('option', { name: 'Australia' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Belize' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /all countries/i })).toBeInTheDocument();
    });

    it('should filter locations by selected country', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} country="Australia" />);

      // Should only show Australian locations
      expect(screen.getByRole('option', { name: 'Great Barrier Reef' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Bondi Beach' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Blue Hole' })).not.toBeInTheDocument();
    });

    it('should show all locations when no country is selected', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} country={null} />);

      expect(screen.getByRole('option', { name: 'Great Barrier Reef' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Blue Hole' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Bondi Beach' })).toBeInTheDocument();
    });

    it('should call onCountryChange and reset location when country is selected', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} />);

      const selects = screen.getAllByRole('combobox');
      const countrySelect = selects[1]; // Second select is country
      fireEvent.change(countrySelect, { target: { value: 'Australia' } });

      expect(defaultProps.onCountryChange).toHaveBeenCalledWith('Australia');
    });

    it('should call onLocationIdChange when location is selected', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} />);

      const selects = screen.getAllByRole('combobox');
      const locationSelect = selects[2]; // Third select is location
      fireEvent.change(locationSelect, { target: { value: 'loc-1' } });

      expect(defaultProps.onLocationIdChange).toHaveBeenCalledWith('loc-1');
    });

    it('should disable country select when location is selected', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} locationId="loc-1" />);

      const selects = screen.getAllByRole('combobox');
      const countrySelect = selects[1]; // Second select is country
      expect(countrySelect).toBeDisabled();
    });

    it('should show derived country when location is selected', () => {
      render(
        <DivesFilter {...defaultProps} showFilters={true} locationId="loc-1" country="Australia" />
      );

      const selects = screen.getAllByRole('combobox');
      const countrySelect = selects[1] as HTMLSelectElement; // Second select is country
      expect(countrySelect.value).toBe('Australia');
    });

    it('should display selected location name as a badge in header', () => {
      render(<DivesFilter {...defaultProps} locationId="loc-1" />);

      expect(screen.getByText(/location: great barrier reef/i)).toBeInTheDocument();
    });
  });

  describe('Max Depth Filtering', () => {
    it('should debounce max depth changes', async () => {
      render(<DivesFilter {...defaultProps} showFilters={true} />);

      const depthSlider = screen.getByRole('slider');

      // Change depth
      fireEvent.change(depthSlider, { target: { value: '30' } });

      // Should not call immediately
      expect(defaultProps.onMaxDepthChange).not.toHaveBeenCalled();

      // Fast-forward debounce time
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      // Should call now
      expect(defaultProps.onMaxDepthChange).toHaveBeenCalledWith(30);
    });

    it('should display max depth badge when below default', () => {
      render(<DivesFilter {...defaultProps} maxDepth={30} />);

      // Badge should be visible (in header, not in panel)
      const badges = screen.getAllByText(/max depth:/i);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should not display max depth badge when at default', () => {
      render(<DivesFilter {...defaultProps} maxDepth={DEFAULT_MAX_DEPTH} />);

      // Badge should not be visible
      expect(screen.queryByText(/max depth:/i)).not.toBeInTheDocument();
    });

    it('should handle multiple rapid depth changes and only call once', async () => {
      render(<DivesFilter {...defaultProps} showFilters={true} />);

      const depthSlider = screen.getByRole('slider');

      // Rapidly change depth multiple times
      fireEvent.change(depthSlider, { target: { value: '25' } });
      vi.advanceTimersByTime(100);

      fireEvent.change(depthSlider, { target: { value: '30' } });
      vi.advanceTimersByTime(100);

      fireEvent.change(depthSlider, { target: { value: '35' } });

      // Wait for debounce
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      // Should only call once with final value
      expect(defaultProps.onMaxDepthChange).toHaveBeenCalledTimes(1);
      expect(defaultProps.onMaxDepthChange).toHaveBeenCalledWith(35);
    });
  });

  describe('Reset Filters', () => {
    it('should call onReset when reset button is clicked', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
    });

    it('should reset local state when external reset occurs', () => {
      const { rerender } = render(
        <DivesFilter {...defaultProps} showFilters={true} maxDepth={30} searchQuery="reef" />
      );

      // Verify depth value in slider
      const depthSlider = screen.getByRole('slider') as HTMLInputElement;
      expect(depthSlider.value).toBe('30');

      // Simulate external reset
      rerender(
        <DivesFilter
          {...defaultProps}
          showFilters={true}
          maxDepth={DEFAULT_MAX_DEPTH}
          searchQuery=""
        />
      );

      // Check that local state synced with props
      const searchInput = screen.getByPlaceholderText(/search dives/i) as HTMLInputElement;
      expect(searchInput.value).toBe('');

      // Depth should be reset to default
      const depthSliderAfterReset = screen.getByRole('slider') as HTMLInputElement;
      expect(depthSliderAfterReset.value).toBe(String(DEFAULT_MAX_DEPTH));
    });
  });

  describe('Display and Counts', () => {
    it('should display correct filtered and total counts', () => {
      render(<DivesFilter {...defaultProps} filteredCount={5} totalCount={20} />);

      expect(screen.getByText(/showing 5 of 20 dives/i)).toBeInTheDocument();
    });

    it('should update counts when filters change', () => {
      const { rerender } = render(
        <DivesFilter {...defaultProps} filteredCount={10} totalCount={20} />
      );

      expect(screen.getByText(/showing 10 of 20 dives/i)).toBeInTheDocument();

      rerender(<DivesFilter {...defaultProps} filteredCount={3} totalCount={20} />);

      expect(screen.getByText(/showing 3 of 20 dives/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should disable location select when locations are loading', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} isLoadingLocations={true} />);

      const selects = screen.getAllByRole('combobox');
      const locationSelect = selects[2]; // Third select is location
      expect(locationSelect).toBeDisabled();
    });

    it('should enable location select when locations are loaded', () => {
      render(<DivesFilter {...defaultProps} showFilters={true} isLoadingLocations={false} />);

      const selects = screen.getAllByRole('combobox');
      const locationSelect = selects[2]; // Third select is location
      expect(locationSelect).not.toBeDisabled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup debounce timers on unmount', () => {
      const { unmount } = render(<DivesFilter {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search dives/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Unmount before debounce completes
      unmount();

      // Advance timers after unmount
      vi.advanceTimersByTime(DEBOUNCE_DELAY);

      // Should not have called the callback
      expect(defaultProps.onSearchQueryChange).not.toHaveBeenCalled();
    });
  });
});
