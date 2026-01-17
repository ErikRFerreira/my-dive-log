import { DiveList, useGetDives } from '@/features/dives';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import StatsList from '@/features/dashboard/components/StatsList';
import DepthChart from '@/features/dashboard/components/DepthChart';
import MonthlyChart from '@/features/dashboard/components/MonthlyChart';
import NoResults from '@/components/layout/NoResults';
import { useDiveFilterStore } from '@/store/diveFilterStore';
import { DEFAULT_MAX_DEPTH, ITEMS_PER_PAGE } from '@/shared/constants';

function Dashboard() {
  const { sortBy, maxDepth, locationId, country, searchQuery, currentPage } = useDiveFilterStore();
  const {
    dives: filteredDives,
    isLoading: isLoadingFiltered,
    isError: isErrorFiltered,
    refetch: refetchFiltered,
  } = useGetDives({
    sortBy,
    maxDepth: maxDepth < DEFAULT_MAX_DEPTH ? maxDepth : undefined,
    locationId: locationId ?? undefined,
    country: country ?? undefined,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    searchQuery,
  });
  const {
    dives: allDives,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    totalCount: totalCountAll,
    refetch: refetchAll,
  } = useGetDives({ sortBy: 'date' });

  const hasDives = (allDives?.length ?? 0) > 0;
  const recentDivesSource = filteredDives ?? allDives ?? [];
  const lastThreeDives = recentDivesSource.slice(0, 3);

  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your diving activities</p>
        </div>
      </header>

      {isLoadingAll ? (
        <Loading />
      ) : isErrorAll || !allDives ? (
        <NoResults>
          Failed to load dives.
          <Button
            onClick={() => {
              refetchAll();
              if (isErrorFiltered) refetchFiltered();
            }}
          >
            Retry
          </Button>
        </NoResults>
      ) : !hasDives ? (
        <NoResults>No dives logged yet. Start by adding your first dive!</NoResults>
      ) : (
        <>
          {/* Stats list grid */}
          <StatsList dives={allDives} totalDives={totalCountAll} />

          {/* Recent dives */}
          <DiveList title="Recent Dives" variant="simple" dives={lastThreeDives} />

          {/* Charts Section  - we need at least 2 dives to make sense */}
          {allDives.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyChart dives={allDives} />
              <DepthChart dives={allDives} />
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Dashboard;
