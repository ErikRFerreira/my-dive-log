import InlineSpinner from '@/components/common/InlineSpinner';
import Loading from '@/components/common/Loading';
import NoResults from '@/components/layout/NoResults';
import Button from '@/components/ui/button';
import { DEFAULT_MAX_DEPTH, ITEMS_PER_PAGE } from '@/shared/constants';
import { useDiveFilterStore } from '@/store/diveFilterStore';
import { AddDive, DiveList, DivesFilter, useGetDives, useGetLocations } from '@/features/dives';
import { Download } from 'lucide-react';
import { exportDivesToCsv } from '@/shared/utils/exportToCSV';
import { useMemo } from 'react';

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

  // Data is already filtered and sorted by the server
  const divesWithLocations = useMemo(() => {
    const sortedDives = dives ?? [];
    if (!sortedDives.length) return sortedDives;
    if (!locations.length) return sortedDives;

    const locationsById = new Map(locations.map((l) => [l.id, l]));
    return sortedDives.map((dive) => {
      if (dive.locations) return dive;
      if (!dive.location_id) return dive;
      const location = locationsById.get(dive.location_id) ?? null;
      return { ...dive, locations: location };
    });
  }, [dives, locations]);

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
        <div className='flex gap-2'>
          <Button 
            onClick={() => exportDivesToCsv(divesWithLocations ?? [])}
            variant="outline" 
            className="gap-2 w-fit bg-transparent"
            >
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
          <AddDive />
        </div>
      </header>

      {isLoading && !dives ? (
        <Loading />
      ) : isError || !dives ? (
        <NoResults>
          Failed to load dives.
          <Button onClick={() => refetch()}>Retry</Button>
        </NoResults>
      ) : (
        <>
          <section id="dives-filter-panel" role="region" aria-labelledby="dives-filter-toggle-btn">
            <DivesFilter
              sortBy={sortBy}
              maxDepth={maxDepth}
              locationId={locationId}
              locations={locations}
              country={country}
              isLoadingLocations={isLoadingLocations}
              showFilters={showFilters}
              onToggleFilters={toggleShowFilters}
              filteredCount={divesWithLocations.length}
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
          </section>
          <section aria-busy={isFetching}>
            <DiveList
              dives={divesWithLocations}
              hasActiveFilters={hasActiveFilters}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </section>
        </>
      )}
    </>
  );
}

export default Dives;
