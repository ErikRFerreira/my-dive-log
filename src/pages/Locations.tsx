import Loading from '@/components/common/Loading';
import NoResults from '@/components/layout/NoResults';
import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import Button from '@/components/ui/button';
import { useGetDives, useGetLocations } from '@/features/dives';
import { LocationCardsGrid, LocationStats } from '@/features/locations';
import LocationsMap from '@/features/locations/components/LocationsMap';
import { useNavigate } from 'react-router-dom';

function Locations() {
  const { dives, isLoading, error, refetch } = useGetDives({
    sortBy: 'date',
  });
  const { locations } = useGetLocations();
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

      {error && (
        <QueryErrorFallback
          error={error}
          onRetry={refetch}
          title="Failed to load locations"
          description="We couldn't load your dive locations. Please try again."
        />
      )}

      {!isLoading && !error && dives && dives.length === 0 && (
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
          {/* Location statistics */}
          <LocationStats dives={dives} />

          {/* Map showing dive locations */}
          <LocationsMap dives={dives} locations={locations} />

          {/* Grid of location cards */}
          <LocationCardsGrid dives={dives} />
        </>
      )}
    </>
  );
}

export default Locations;
