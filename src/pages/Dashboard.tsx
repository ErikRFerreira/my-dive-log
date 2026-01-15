import { DiveList, useGetDives } from '@/features/dives';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import StatsList from '@/features/dashboard/components/StatsList';
import DepthChart from '@/features/dashboard/components/DepthChart';
import MonthlyChart from '@/features/dashboard/components/MonthlyChart';
import NoResults from '@/components/layout/NoResults';

function Dashboard() {
  const { dives, isLoading, isError, totalCount, refetch } = useGetDives({
    sortBy: 'date',
  });

  const hasDives = (dives?.length ?? 0) > 0;
  const lastThreeDives = hasDives
    ? [...dives!]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
    : [];

  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your diving activities</p>
        </div>
      </header>

      {isLoading ? (
        <Loading />
      ) : isError || !dives ? (
        <NoResults>
          Failed to load dives.
          <Button onClick={() => refetch()}>Retry</Button>
        </NoResults>
      ) : !hasDives ? (
        <NoResults>No dives logged yet. Start by adding your first dive!</NoResults>
      ) : (
        <>
          {/* Stats list grid */}
          <StatsList dives={dives} totalDives={totalCount} />

          {/* Recent dives */}
          <DiveList title="Recent Dives" variant="simple" dives={lastThreeDives} />

          {/* Charts Section  - we need at least 2 dives to make sense */}
          {dives.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyChart dives={dives} />
              <DepthChart dives={dives} />
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Dashboard;
