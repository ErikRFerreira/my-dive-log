import InlineError from '@/components/common/InlineError';
import Loading from '@/components/common/Loading';
import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import Button from '@/components/ui/button';
import DiveList from '@/features/dives/components/DiveList';
import DivesFilter from '@/features/dives/components/DivesFilter';
import { useDivesFilterController } from '@/features/dives/hooks/useDivesFilterController';
import { useGetDives } from '@/features/dives/hooks/useGetDives';
import { useGetLocations } from '@/features/dives/hooks/useGetLocations';
import { useDepthRange } from '@/features/dives/hooks/useDepthRange';
import { ITEMS_PER_PAGE } from '@/shared/constants';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { exportDivesToCsv } from '@/shared/utils/exportToCSV';
import { useSettingsStore } from '@/store/settingsStore';
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
  } = useDivesFilterController();
  const {
    locations,
    isLoading: isLoadingLocations,
    isError: isLocationsError,
    error: locationsError,
  } = useGetLocations();

  const unitSystem = useSettingsStore((s) => s.unitSystem);

  // Get absolute min/max depth from ALL dives (unfiltered) for slider bounds
  const { minDepth: minDepthForSlider, maxDepth: maxDepthForSlider } = useDepthRange(unitSystem);

  // Convert maxDepthForSlider back to meters for comparison and reset (store expects metric values)
  const maxDepthInMeters = Math.round(
    unitSystem === 'imperial' ? maxDepthForSlider / 3.28084 : maxDepthForSlider
  );

  // Fetch dives with server-side filtering and pagination
  const filters = {
    sortBy,
    maxDepth: maxDepth < maxDepthInMeters ? maxDepth : undefined,
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
    maxDepth < maxDepthInMeters ||
    locationId !== null ||
    country !== null ||
    sortBy !== 'date' ||
    searchQuery.trim() !== '';

  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dive History</h1>
          <p className="text-muted-foreground mt-1">Browse and manage all your recorded dives</p>
        </div>
        {dives && dives.length > 0 && (
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
        )}
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
              filteredCount={dives?.length ?? 0}
              totalCount={totalCount}
              searchQuery={searchQuery}
              minDepthForSlider={minDepthForSlider}
              maxDepthForSlider={maxDepthForSlider}
              onToggleFilters={toggleShowFilters}
              onSearchQueryChange={setPageAndSearchQuery}
              onSortByChange={setPageAndSortBy}
              onMaxDepthChange={setPageAndMaxDepth}
              onCountryChange={setPageAndCountry}
              onLocationIdChange={setPageAndLocationId}
              onReset={() => handleReset(maxDepthInMeters)}
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
