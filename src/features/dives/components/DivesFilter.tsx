import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

import type { Location as DiveLocation } from '@/features/locations/';
import type { SortBy } from '@/shared/types/filters';
import { DEFAULT_MAX_DEPTH, DEBOUNCE_DELAY, MIN_SEARCH_LENGTH } from '@/shared/constants';
import { convertValueBetweenSystems } from '@/shared/utils/units';
import { useSettingsStore } from '@/store/settingsStore';
import DivesFilterHeaderRow from './DivesFilterHeaderRow';
import DivesFilterPanel from './DivesFilterPanel';

type DivesFilterProps = {
  sortBy: SortBy;
  maxDepth: number;
  locationId: string | null;
  locations: DiveLocation[];
  country: string | null;
  isLoadingLocations?: boolean;
  showFilters: boolean;
  filteredCount: number;
  totalCount: number;
  searchQuery?: string;
  minDepthForSlider: number;
  maxDepthForSlider: number;
  onToggleFilters: () => void;
  onSearchQueryChange?: (query: string) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onMaxDepthChange: (maxDepth: number) => void;
  onCountryChange: (country: string | null) => void;
  onLocationIdChange: (locationId: string | null) => void;
  onReset: () => void;
};

function DivesFilter({
  sortBy,
  maxDepth,
  locationId,
  locations,
  country,
  isLoadingLocations = false,
  showFilters,
  filteredCount,
  totalCount,
  searchQuery,
  minDepthForSlider,
  maxDepthForSlider,
  onToggleFilters,
  onSearchQueryChange,
  onSortByChange,
  onMaxDepthChange,
  onLocationIdChange,
  onCountryChange,
  onReset,
}: DivesFilterProps) {
  // If a locationId is set, always show filters
  const filtersVisible = showFilters || !!locationId;
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  // Convert maxDepth from meters (stored) to current unit system for slider
  const initialLocalMaxDepth = useMemo(() => {
    return Math.round(convertValueBetweenSystems(maxDepth, 'depth', 'metric', unitSystem));
  }, [maxDepth, unitSystem]);

  const [localMaxDepth, setLocalMaxDepth] = useState(initialLocalMaxDepth);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const selectedCountry = country ?? '';

  // Derive unique country names from locations
  const countriesInLocations = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((l) => {
      if (l.country) set.add(l.country);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [locations]);

  // Filter locations by selected country
  const filteredLocations = selectedCountry
    ? locations.filter((l) => l.country === selectedCountry)
    : locations;

  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxDepthDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedLocationLabel = useMemo(() => {
    if (!locationId) return null;
    return locations.find((l) => l.id === locationId)?.name ?? null;
  }, [locationId, locations]);

  // Derive selected country: if a location is selected, use its country
  const selectedLocation = locationId ? locations.find((l) => l.id === locationId) : null;
  const derivedCountry = selectedLocation?.country ?? country ?? '';

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearchQueryChange?.('');
  };

  const handleResetClick = () => {
    const resetDepth = Math.round(
      convertValueBetweenSystems(DEFAULT_MAX_DEPTH, 'depth', 'metric', unitSystem)
    );
    setLocalMaxDepth(resetDepth);
    setLocalSearchQuery('');
    onSearchQueryChange?.('');
    onReset();
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;

    // Update input immediately (no lag)
    setLocalSearchQuery(newQuery);

    // Clear existing debounce timer
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    // Only search if 3+ characters OR empty (to clear search)
    const shouldSearch =
      newQuery.trim().length >= MIN_SEARCH_LENGTH || newQuery.trim().length === 0;

    if (shouldSearch) {
      // Set new debounced update
      searchDebounceTimerRef.current = setTimeout(() => {
        onSearchQueryChange?.(newQuery);
      }, DEBOUNCE_DELAY);
    }
  };

  const handleMaxDepthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDepthInCurrentUnits = Number(e.target.value);
    setLocalMaxDepth(newDepthInCurrentUnits);

    if (maxDepthDebounceTimerRef.current) clearTimeout(maxDepthDebounceTimerRef.current);

    maxDepthDebounceTimerRef.current = setTimeout(() => {
      // Convert from current unit system back to meters for the filter/API
      const newDepthInMeters = Math.round(
        convertValueBetweenSystems(newDepthInCurrentUnits, 'depth', unitSystem, 'metric')
      );
      onMaxDepthChange(newDepthInMeters);
    }, DEBOUNCE_DELAY);
  };

  // Sync local search query with prop (e.g., reset from parent)
  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    const convertedDepth = Math.round(
      convertValueBetweenSystems(maxDepth, 'depth', 'metric', unitSystem)
    );
    setLocalMaxDepth(convertedDepth);
  }, [maxDepth, unitSystem]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) clearTimeout(searchDebounceTimerRef.current);
      if (maxDepthDebounceTimerRef.current) clearTimeout(maxDepthDebounceTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      <DivesFilterHeaderRow
        showFilters={filtersVisible}
        onToggleFilters={onToggleFilters}
        localMaxDepth={localMaxDepth}
        selectedLocationLabel={selectedLocationLabel}
        localSearchQuery={localSearchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      <DivesFilterPanel
        show={filtersVisible}
        sortBy={sortBy}
        onSortByChange={onSortByChange}
        derivedCountry={derivedCountry}
        countriesInLocations={countriesInLocations}
        locationId={locationId}
        minDepthForSlider={minDepthForSlider}
        maxDepthForSlider={maxDepthForSlider}
        onCountryChange={onCountryChange}
        onLocationIdChange={onLocationIdChange}
        isLoadingLocations={isLoadingLocations}
        filteredLocations={filteredLocations}
        localMaxDepth={localMaxDepth}
        onMaxDepthChange={handleMaxDepthChange}
        onResetClick={handleResetClick}
      />
      <p className="text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} dives
      </p>
    </div>
  );
}

export default DivesFilter;
