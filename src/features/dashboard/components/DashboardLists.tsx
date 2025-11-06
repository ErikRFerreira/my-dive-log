import { DiveList, useGetDives } from '@features/dives';
import StatsList from './StatsList';
import Loading from '@/components/ui/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

function DashboardLists() {
  const { dives, isLoading, isFetching, isError, refetch } = useGetDives();

  if (isLoading) {
    return <Loading />;
  }

  // TODO: Improve error handling UI - maybe a toast notification?
  // Also create a reusable Error component
  if (isError || !dives) {
    return (
      <>
        <ErrorMessage>Failed to load dives.</ErrorMessage>
        <button onClick={() => refetch()}>Retry</button>
      </>
    );
  }

  // Sort dives by date descending and get the last three dives
  const orderedDives = [...dives].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastTreeDives = orderedDives.slice(-3);

  return (
    <section>
      {isFetching && <Loading />}
      <StatsList dives={dives} />
      <DiveList dives={lastTreeDives} />
    </section>
  );
}

export default DashboardLists;
