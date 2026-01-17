import { DiveList, useGetDives } from '@/features/dives';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import StatsList from '@/features/dashboard/components/StatsList';
import DepthChart from '@/features/dashboard/components/DepthChart';
import MonthlyChart from '@/features/dashboard/components/MonthlyChart';
import NoResults from '@/components/layout/NoResults';

function Dashboard() {
  const {
    dives: allDives,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    totalCount: totalCountAll,
    refetch: refetchAll,
  } = useGetDives({ sortBy: 'date' });

  const hasDives = (allDives?.length ?? 0) > 0;
  const lastThreeDives = (allDives ?? []).slice(0, 3);

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
