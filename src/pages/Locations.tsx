import Loading from '@/components/common/Loading';
import NoResults from '@/components/layout/NoResults';
import { useGetDives } from '@/features/dives';
import { LocationCardsGrid, LocationStats } from '@/features/locations';

function Locations() {
  const {dives, isLoading, isError} = useGetDives();
  
  return (
    <>
      <header>
        <h1 className="text-3xl font-bold text-foreground">Dive Locations</h1>
        <p className="text-muted-foreground mt-1">
          Explore and manage your favorite dive sites around the world
        </p>
      </header>

      { isLoading && <Loading /> }

      { isError && (
        <NoResults>
          Error loading dives. Please try again later.
        </NoResults>
      )}

      {dives && dives.length > 0 && (
        <>
          <LocationStats dives={dives} />
          <LocationCardsGrid dives={dives} />
        </>
      )}
    </>
  );
}

export default Locations;
