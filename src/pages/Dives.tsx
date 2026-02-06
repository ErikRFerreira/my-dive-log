import Loading from '@/components/common/Loading';
import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import NoResults from '@/components/layout/NoResults';
import Button from '@/components/ui/button';
import { DiveList, DivesFilter, useGetDives, useGetLocations } from '@/features/dives';
import { DEFAULT_MAX_DEPTH, ITEMS_PER_PAGE } from '@/shared/constants';
import { exportDivesToCsv } from '@/shared/utils/exportToCSV';
import { useDiveFilterStore } from '@/store/diveFilterStore';
import { Download } from 'lucide-react';

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
    maxDepth: maxDepth < DEFAULT_MAX_DEPTH ? maxDepth : undefined,
    locationId: locationId ?? undefined,
    country: country ?? undefined,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    searchQuery,
  };

  const { dives, totalCount, isLoading, isFetching, error, refetch } = useGetDives(filters, {
    locations,
  });
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
          <p className="text-muted-foreground mt-1">Browse and manage all your recorded dives</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => exportDivesToCsv(dives ?? [])}
            variant="outline"
            className="gap-2 w-fit bg-transparent"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
        </div>
      </header>

      {isLoading && !dives ? (
        <Loading />
      ) : error ? (
        <QueryErrorFallback
          error={error}
          onRetry={refetch}
          title="Failed to Load Dives"
          description="Unable to load your dive history. Please check your connection and try again."
        />
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
              filteredCount={dives.length}
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
              dives={dives}
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
