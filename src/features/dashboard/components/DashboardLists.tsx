import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { DiveList, useGetDives } from '@features/dives';

import StatsList from './StatsList';

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
        <Button onClick={() => refetch()}>Retry</Button>
      </>
    );
  }

  // Sort dives by date descending and get the last three dives
  const lastTreeDives = [...dives]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <section>
      {isFetching && <Loading />}
      <StatsList dives={dives} />
      <DiveList title={'Recent Dives'} dives={lastTreeDives} />
    </section>
  );
}

export default DashboardLists;
