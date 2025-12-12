import { AddDive, DiveList, DivesFilter, useGetDives } from '@features/dives';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import { useDiveFilterStore, type SortBy } from '@/store/diveFilterStore';
import { useCallback, useState } from 'react';
import InlineSpinner from '@/components/common/InlineSpinner';

type DivesFilterValue = {
  sortBy: 'date' | 'depth' | 'duration';
  maxDepth: number;
  selectedLocation: string;
};

function Dives() {
  const { showFilters, sortBy, maxDepth, setSortBy, setMaxDepth, toggleShowFilters } =
    useDiveFilterStore();
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Fetch dives with server-side filtering
  const filters = {
    sortBy,
    maxDepth,
    location: selectedLocation === 'all' ? undefined : selectedLocation,
  };
  const { dives, isLoading, isFetching, isError, refetch } = useGetDives(filters);

  const handleFilterChange = useCallback(
    (next: DivesFilterValue) => {
      setSortBy(`${next.sortBy}` as SortBy);
      setMaxDepth(next.maxDepth);
      setSelectedLocation(next.selectedLocation);
    },
    [setSortBy, setMaxDepth]
  );

  if (isLoading) {
    return <Loading />;
  }

  // TODO: Improve error handling UI - maybe a toast notification?
  // Also maybe create a reusable Error component?
  if (isError || !dives) {
    return (
      <>
        <ErrorMessage>Failed to load dives.</ErrorMessage>
        <Button onClick={() => refetch()}>Retry</Button>
      </>
    );
  }

  // Data is already filtered and sorted by the server
  const sortedDives = dives || [];

  // Check if any filters are active
  const hasActiveFilters = maxDepth < 50 || selectedLocation !== 'all' || sortBy !== 'date';

  // TOOD: add pagination later
  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dive History</h1>
          {isFetching && <InlineSpinner aria-label="Refreshing dives" />}
          <p className="text-muted-foreground mt-1">Browse and manage all your recorded dives</p>
        </div>
        <AddDive />
      </header>
      <div id="dives-filter-panel" role="region" aria-labelledby="dives-filter-toggle-btn">
        <DivesFilter
          onChange={handleFilterChange}
          defaultMaxDepth={maxDepth}
          defaultSort={sortBy}
          dives={dives}
          showFilters={showFilters}
          onToggleFilters={toggleShowFilters}
          filteredCount={sortedDives.length}
        />
      </div>
      <section aria-busy={isFetching}>
        <DiveList dives={sortedDives} hasActiveFilters={hasActiveFilters} />
      </section>
    </>
  );
}

export default Dives;
