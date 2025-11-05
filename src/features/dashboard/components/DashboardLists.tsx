import { DiveList, useGetDives } from '@features/dives';
import StatsList from './StatsList';
import Loading from '@/components/common/Loading';

function DashboardLists() {
  const { dives, isLoading, isError } = useGetDives();

  if (isLoading) {
    return <Loading />;
  }
  if (isError || !dives) {
    return <p>Error loading dashboard. Please try again later.</p>;
  }

  return (
    <section>
      <StatsList dives={dives} />
      <DiveList dives={dives} />
    </section>
  );
}

export default DashboardLists;
