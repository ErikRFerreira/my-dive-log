import { AddDive, DiveList, useGetDives } from '@/features/dives';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import StatsList from '@/features/dashboard/components/StatsList';
import DepthChart from '@/features/dashboard/components/DepthChart';
import MonthlyChart from '@/features/dashboard/components/MonthlyChart';
import NoResults from '@/components/layout/NoResults';

function Dashboard() {
  const { dives, isLoading, isError, refetch } = useGetDives();

  const hasDives = (dives?.length ?? 0) > 0;
  const lastThreeDives = hasDives
    ? [...dives!].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
    : [];

  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your diving activities</p>
        </div>
        <AddDive />
      </header>

      {isLoading ? (
        <Loading />
      ) : isError || !dives ? (
        <NoResults>
          Failed to load dives.
          <Button onClick={() => refetch()}>Retry</Button>
        </NoResults>
      ) : !hasDives ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No dives logged yet. Start by adding your first dive!
          </p>
        </div>
      ) : (
        <>
          {/* Stats list grid */}
          <StatsList dives={dives} />

          {/* Recent dives */}
          <DiveList title="Recent Dives" dives={lastThreeDives} />

          {/* Charts Section  - we need at least 2 dives to make sense */}
          {dives.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepthChart dives={dives} />
              <MonthlyChart dives={dives} />
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Dashboard;
