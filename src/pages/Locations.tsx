import InlineError from '@/components/common/InlineError';
import Loading from '@/components/common/Loading';
import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import NoResults from '@/components/layout/NoResults';
import Button from '@/components/ui/button';
import { useGetDives } from '@/features/dives/hooks/useGetDives';
import { useGetLocations } from '@/features/dives/hooks/useGetLocations';
import { LocationCardsGrid, LocationStats } from '@/features/locations';
import LocationsMap from '@/features/locations/components/LocationsMap';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { useNavigate } from 'react-router-dom';

function Locations() {
  const { dives, isLoading, error, refetch } = useGetDives({
    sortBy: 'date',
  });
  const { locations, isError: isLocationsError, error: locationsError } = useGetLocations();
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

      {!error && isLocationsError && (
        <InlineError
          message={getErrorMessage(
            locationsError,
            'Failed to load location details. Some data may be missing.'
          )}
          className="mt-4"
        />
      )}

      {!isLoading && !error && dives && dives.length === 0 && (
        <NoResults>
          <>
            No dive locations found. Start by logging your first dive!
            <Button
              variant="outline"
              className="mt-2 inline-block w-32"
              onClick={() => navigate('/log-dive')}
            >
              Log new dive
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
