import { DiveList, DivesFilter, useGetDives } from '@features/dives';
import ErrorMessage from '@/components/common/ErrorMessage';
import Loading from '@/components/ui/Loading';
import Chip from '@/components/common/Chip';
import Button from '@/components/common/Button';
import { useDiveFilterStore, type SortBy, DIVE_FILTER_DEFAULTS } from '@/store/diveFilterStore';
import { useCallback } from 'react';
import InlineSpinner from '@/components/ui/InlineSpinner';

type DivesFilterValue = {
  sortBy: 'date' | 'depth' | 'duration';
  maxDepth: number;
};

function Dives() {
  const { dives, isLoading, isFetching, isError, refetch } = useGetDives();
  const { showFilters, sortBy, maxDepth, setSortBy, setMaxDepth, toggleShowFilters } =
    useDiveFilterStore();

  const handleFilterChange = useCallback(
    (next: DivesFilterValue) => {
      setSortBy(`${next.sortBy}` as SortBy);
      setMaxDepth(next.maxDepth);
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

  // Filtered dives
  const filteredDives = dives.filter((dive) => dive.depth <= maxDepth);

  // Sorted dives
  const sortedDives = [...filteredDives].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'depth':
        return b.depth - a.depth;
      case 'duration':
        return b.duration - a.duration;
      default:
        return 0;
    }
  });

  // TOOD: add pagination later
  return (
    <>
      <header>
        <h1>Dive History</h1>
        {isFetching && <InlineSpinner aria-label="Refreshing dives" />}
        <p>Browse and manage all your recorded dives</p>
      </header>
      <div>
        <div>
          <Button
            id="dives-filter-toggle-btn"
            aria-expanded={showFilters}
            aria-controls="dives-filter-panel"
            onClick={toggleShowFilters}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          {maxDepth < DIVE_FILTER_DEFAULTS.maxDepth && (
            <Chip type="info">Max Depth: {maxDepth} m</Chip>
          )}
        </div>
        <div
          id="dives-filter-panel"
          role="region"
          aria-labelledby="dives-filter-toggle-btn"
          aria-hidden={!showFilters}
          hidden={!showFilters}
        >
          <DivesFilter
            onChange={handleFilterChange}
            defaultMaxDepth={maxDepth}
            defaultSort={sortBy}
          />
        </div>
      </div>
      <section aria-busy={isFetching}>
        <DiveList dives={sortedDives} />
      </section>
    </>
  );
}

export default Dives;
