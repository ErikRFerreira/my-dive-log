import Loading from '@/components/common/Loading';
import NoResults from '@/components/layout/NoResults';
import Button from '@/components/ui/button';
import { useGetDives } from '@/features/dives';
import { LocationCardsGrid, LocationStats } from '@/features/locations';
import { useNavigate } from 'react-router-dom';

function Locations() {
  const { dives, isLoading, isError } = useGetDives({
    sortBy: 'date',
  });
  const navigate = useNavigate();

  return (
    <>
      <header>
        <h1 className="text-3xl font-bold text-foreground">Dive Locations</h1>
        <p className="text-muted-foreground mt-1">
          Explore and manage your favorite dive sites around the world
        </p>
      </header>

      {isLoading && <Loading />}

      {isError && <NoResults>Error loading dives. Please try again later.</NoResults>}

      {!isLoading && !isError && dives && dives.length === 0 && (
        <NoResults>
          <>
            No dive locations found. Start by adding your first dive!
            <Button
              variant="outline"
              className="mt-2 inline-block w-32"
              onClick={() => navigate('/dives')}
            >
              Go to Dives
            </Button>
          </>
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
