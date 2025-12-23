import { AddDive, DiveList, DivesFilter, useGetDives } from '@features/dives';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import { useDiveFilterStore, type SortBy } from '@/store/diveFilterStore';
import { useState } from 'react';
import InlineSpinner from '@/components/common/InlineSpinner';
import NoResults from '@/components/layout/NoResults';
import { ITEMS_PER_PAGE, DEFAULT_MAX_DEPTH } from '@/shared/constants';

type DivesFilterValue = {
  sortBy: 'date' | 'depth' | 'duration';
  maxDepth: number;
  selectedLocation: string;
};

function Dives() {
  const {
    showFilters,
    sortBy,
    maxDepth,
    currentPage,
    searchQuery,
    setSortBy,
    setMaxDepth,
    setCurrentPage,
    setSearchQuery,
    toggleShowFilters,
  } = useDiveFilterStore();
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Fetch dives with server-side filtering and pagination
  const filters = {
    sortBy,
    maxDepth,
    location: selectedLocation === 'all' ? undefined : selectedLocation,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    searchQuery,
  };

  const { dives, totalCount, isLoading, isFetching, isError, refetch } = useGetDives(filters);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleFilterChange = (next: DivesFilterValue) => {
    setSortBy(`${next.sortBy}` as SortBy);
    setMaxDepth(next.maxDepth);
    setSelectedLocation(next.selectedLocation);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !dives) {
    return (
      <NoResults>
        Failed to load dives.
        <Button onClick={() => refetch()}>Retry</Button>
      </NoResults>
    );
  }

  // Data is already filtered and sorted by the server
  const sortedDives = dives || [];

  // Check if any filters are active
  const hasActiveFilters =
    maxDepth < DEFAULT_MAX_DEPTH ||
    selectedLocation !== 'all' ||
    sortBy !== 'date' ||
    searchQuery.trim() !== '';

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
          totalCount={totalCount}
          searchQuery={searchQuery}
          onSearchQueryChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
        />
      </div>
      <section aria-busy={isFetching}>
        <DiveList
          dives={sortedDives}
          hasActiveFilters={hasActiveFilters}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>
    </>
  );
}

export default Dives;
