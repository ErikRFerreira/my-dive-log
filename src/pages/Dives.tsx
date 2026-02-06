import Loading from '@/components/common/Loading';
import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import InlineError from '@/components/common/InlineError';
import Button from '@/components/ui/button';
import DiveList from '@/features/dives/components/DiveList';
import DivesFilter from '@/features/dives/components/DivesFilter';
import { useGetDives } from '@/features/dives/hooks/useGetDives';
import { useGetLocations } from '@/features/dives/hooks/useGetLocations';
import { useDivesFilterController } from '@/features/dives/hooks/useDivesFilterController';
import { ITEMS_PER_PAGE, DEFAULT_MAX_DEPTH } from '@/shared/constants';
import { exportDivesToCsv } from '@/shared/utils/exportToCSV';
import { getErrorMessage } from '@/shared/utils/errorMessage';
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
    toggleShowFilters,
    setCurrentPage,
    setPageAndSortBy,
    setPageAndMaxDepth,
    setPageAndSearchQuery,
    setPageAndCountry,
    setPageAndLocationId,
    handleReset,
    hasActiveFilters,
  } = useDivesFilterController();
  const {
    locations,
    isLoading: isLoadingLocations,
    isError: isLocationsError,
    error: locationsError,
  } = useGetLocations();

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

      {isLocationsError && (
        <InlineError
          message={getErrorMessage(
            locationsError,
            'Failed to load locations. Filters may be limited.'
          )}
          className="mt-4"
        />
      )}

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
              filteredCount={dives?.length ?? 0}
              totalCount={totalCount}
              searchQuery={searchQuery}
              onSearchQueryChange={setPageAndSearchQuery}
              onSortByChange={setPageAndSortBy}
              onMaxDepthChange={setPageAndMaxDepth}
              onCountryChange={setPageAndCountry}
              onLocationIdChange={setPageAndLocationId}
              onReset={handleReset}
            />
          </section>
          <section aria-busy={isFetching}>
            <DiveList
              dives={dives ?? []}
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
