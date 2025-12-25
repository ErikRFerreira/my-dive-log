import { AddDive, DiveList, DivesFilter, useGetDives, useGetLocations } from '@features/dives';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import { useDiveFilterStore } from '@/store/diveFilterStore';
import InlineSpinner from '@/components/common/InlineSpinner';
import NoResults from '@/components/layout/NoResults';
import { ITEMS_PER_PAGE, DEFAULT_MAX_DEPTH } from '@/shared/constants';

function Dives() {
  const {
    showFilters,
    sortBy,
    maxDepth,
    currentPage,
    searchQuery,
    locationId,
    country,
    setSortBy,
    setMaxDepth,
    setCurrentPage,
    setSearchQuery,
    setCountry,
    setLocationId,
    resetFilters,
    toggleShowFilters,
  } = useDiveFilterStore();
  const { locations, isLoading: isLoadingLocations } = useGetLocations();

  // Fetch dives with server-side filtering and pagination
  const filters = {
    sortBy,
    maxDepth,
    locationId: locationId ?? undefined,
    country: country ?? undefined,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    searchQuery,
  };

  const { dives, totalCount, isLoading, isFetching, isError, refetch } = useGetDives(filters);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (isLoading && !dives) {
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
    locationId !== null ||
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
          sortBy={sortBy}
          maxDepth={maxDepth}
          locationId={locationId}
          locations={locations}
          country={country}
          isLoadingLocations={isLoadingLocations}
          showFilters={showFilters}
          onToggleFilters={toggleShowFilters}
          filteredCount={sortedDives.length}
          totalCount={totalCount}
          searchQuery={searchQuery}
          onSearchQueryChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          onSortByChange={(nextSortBy) => {
            setSortBy(nextSortBy);
            setCurrentPage(1);
          }}
          onMaxDepthChange={(nextMaxDepth) => {
            setMaxDepth(nextMaxDepth);
            setCurrentPage(1);
          }}
          onCountryChange={(nextCountry) => {
            setCountry(nextCountry);
            setCurrentPage(1);
            setLocationId(null);
          }}
          onLocationIdChange={(nextLocationId) => {
            setLocationId(nextLocationId);
            setCurrentPage(1);
          }}
          onReset={() => {
            resetFilters();
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
